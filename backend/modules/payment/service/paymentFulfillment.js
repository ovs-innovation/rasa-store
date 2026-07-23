const mongoose = require("mongoose");
const Order = require("../../../models/Order");
const Payment = require("../../../models/Payment");
const { reduceStockAtomic } = require("../../../lib/stock-controller/others");
const { writePaymentLog } = require("./paymentLogger");
const { writeAuditLog } = require("./auditService");
const { getOrderStatus } = require("./phonepeClient");
const { logPaymentStep, startTimer } = require("./structuredLogger");

/** Stale processing lock TTL — reclaim if a worker died mid-fulfillment */
const FULFILL_LOCK_TTL_MS = 2 * 60 * 1000;

const supportsTransactions = () => {
  try {
    const topology = mongoose.connection?.client?.topology;
    return Boolean(
      topology?.description?.type && topology.description.type !== "Single"
    );
  } catch {
    return false;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Atomically claim fulfillment lock.
 * Returns the claimed payment doc, or null if another worker owns it / already done.
 */
const isFullyFulfilled = (payment) =>
  Boolean(
    payment &&
      payment.status === "Success" &&
      payment.stockReduced === true &&
      (payment.fulfillmentStatus === "completed" ||
        // Legacy docs created before fulfillmentStatus existed
        !payment.fulfillmentStatus ||
        payment.fulfillmentStatus === "none")
  );

const claimFulfillment = async (merchantOrderId, source) => {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - FULFILL_LOCK_TTL_MS);

  const existing = await Payment.findOne({ merchantOrderId });
  if (!existing) return { payment: null, reason: "missing" };

  // Legacy / already done — do not reclaim
  if (
    existing.status === "Success" &&
    existing.stockReduced === true &&
    (existing.fulfillmentStatus === "completed" ||
      !existing.fulfillmentStatus ||
      existing.fulfillmentStatus === "none")
  ) {
    if (existing.fulfillmentStatus !== "completed") {
      await Payment.updateOne(
        { _id: existing._id },
        {
          $set: {
            fulfillmentStatus: "completed",
            fulfillmentCompletedAt: existing.paidAt || now,
          },
        }
      ).catch(() => {});
      existing.fulfillmentStatus = "completed";
    }
    return { payment: existing, reason: "already_completed" };
  }

  // Case A: claim when not processing/completed (includes missing field on old docs)
  let claimed = await Payment.findOneAndUpdate(
    {
      merchantOrderId,
      status: { $ne: "Success" },
      fulfillmentStatus: { $nin: ["processing", "completed"] },
    },
    {
      $set: {
        fulfillmentStatus: "processing",
        fulfillmentStartedAt: now,
        fulfillmentSource: source,
        fulfillmentError: "",
      },
    },
    { new: true }
  );

  if (claimed) return { payment: claimed, reason: "claimed" };

  // Case B: Success but stock not reduced (partial failure recovery)
  claimed = await Payment.findOneAndUpdate(
    {
      merchantOrderId,
      status: "Success",
      stockReduced: false,
      fulfillmentStatus: { $nin: ["processing", "completed"] },
    },
    {
      $set: {
        fulfillmentStatus: "processing",
        fulfillmentStartedAt: now,
        fulfillmentSource: source,
        fulfillmentError: "recover_partial",
      },
    },
    { new: true }
  );

  if (claimed) return { payment: claimed, reason: "claimed_partial" };

  // Case C: reclaim stale processing lock (crashed worker)
  claimed = await Payment.findOneAndUpdate(
    {
      merchantOrderId,
      fulfillmentStatus: "processing",
      fulfillmentStartedAt: { $lt: staleBefore },
    },
    {
      $set: {
        fulfillmentStatus: "processing",
        fulfillmentStartedAt: now,
        fulfillmentSource: source,
        fulfillmentError: "reclaimed_stale_lock",
      },
    },
    { new: true }
  );

  if (claimed) return { payment: claimed, reason: "reclaimed" };

  const current = await Payment.findOne({ merchantOrderId });
  if (!current) return { payment: null, reason: "missing" };
  if (isFullyFulfilled(current) || current.fulfillmentStatus === "completed") {
    return { payment: current, reason: "already_completed" };
  }
  return { payment: current, reason: "locked" };
};

const releaseFulfillmentFailure = async (paymentId, message) => {
  await Payment.updateOne(
    { _id: paymentId },
    {
      $set: {
        fulfillmentStatus: "failed",
        fulfillmentError: String(message || "").slice(0, 2000),
      },
    }
  ).catch(() => {});
};

/**
 * CRITICAL PATH (must all succeed for paid=true):
 *  1. PhonePe state === COMPLETED (caller verifies)
 *  2. Amount match
 *  3. Stock reduced exactly once
 *  4. Payment.status = Success + fulfillmentStatus = completed
 *  5. Order.paymentStatus = Paid
 *
 * NON-CRITICAL (never blocks success, never throws into caller path):
 *  - PaymentLog / AuditLog writes
 *  - Email / SMS notifications
 *
 * Rationale: money was captured by PhonePe. Failing logs/email must not
 * reverse a correctly fulfilled order. Frontend only sees paid=true after
 * critical DB writes commit. Emails retry on later verify/webhook via flags.
 */
const fulfillSuccessfulPayment = async ({
  merchantOrderId,
  gatewayPayload = {},
  source = "System",
  ip = "",
  userAgent = "",
  correlationId = "",
}) => {
  const elapsed = startTimer();
  const ctx = {
    merchantOrderId,
    source,
    ip,
    userAgent,
  };

  const claim = await claimFulfillment(merchantOrderId, source);

  if (claim.reason === "missing") {
    await writePaymentLog({
      merchantOrderId,
      correlationId,
      source,
      action: "fulfill_missing_payment",
      step: "claim",
      success: false,
      message: "Payment record not found",
      response: gatewayPayload,
      ip,
      userAgent,
      durationMs: elapsed(),
    });
    return { ok: false, code: "PAYMENT_NOT_FOUND", paid: false };
  }

  if (claim.reason === "already_completed") {
    let order = await Order.findById(claim.payment.order);
    // Repair drift: payment Success but order not Paid
    if (order && order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      if (order.status === "Pending Payment" || order.status === "Payment Failed") {
        order.status = "Pending";
      }
      order.paymentMethod = order.paymentMethod || "PhonePe";
      order.merchantOrderId = order.merchantOrderId || merchantOrderId;
      order.paymentRef = order.paymentRef || claim.payment._id;
      await order.save().catch(() => {});
      order = await Order.findById(claim.payment.order);
    }
    await writePaymentLog({
      payment: claim.payment._id,
      order: order?._id,
      merchantOrderId,
      correlationId: correlationId || claim.payment.correlationId || "",
      source,
      action: "fulfill_idempotent_skip",
      step: "idempotent",
      success: true,
      message: "Already fulfilled",
      response: { paymentStatus: claim.payment.status },
      ip,
      userAgent,
      durationMs: elapsed(),
    });
    // Best-effort notification retry if previous notify failed
    await maybeSendNotifications({
      payment: claim.payment,
      order,
      merchantOrderId,
      correlationId: correlationId || claim.payment.correlationId || "",
      source,
      ip,
      userAgent,
    });
    return {
      ok: true,
      paid: true,
      alreadyProcessed: true,
      payment: claim.payment,
      order,
    };
  }

  if (claim.reason === "locked") {
    // Another worker is fulfilling — wait briefly then re-read
    await sleep(400);
    const refreshed = await Payment.findOne({ merchantOrderId });
    const order = refreshed ? await Order.findById(refreshed.order) : null;

    if (
      refreshed?.fulfillmentStatus === "completed" &&
      refreshed?.status === "Success" &&
      refreshed?.stockReduced
    ) {
      return {
        ok: true,
        paid: true,
        alreadyProcessed: true,
        payment: refreshed,
        order,
      };
    }

    await writePaymentLog({
      payment: refreshed?._id,
      order: order?._id,
      merchantOrderId,
      correlationId: correlationId || refreshed?.correlationId || "",
      source,
      action: "fulfill_lock_contention",
      step: "claim",
      success: false,
      message: "Fulfillment in progress by another worker",
      ip,
      userAgent,
      durationMs: elapsed(),
    });

    return {
      ok: false,
      code: "FULFILL_IN_PROGRESS",
      paid: false,
      pending: true,
      payment: refreshed,
      order,
    };
  }

  const payment = claim.payment;
  const corr = correlationId || payment.correlationId || "";
  const latestAttempt =
    Array.isArray(gatewayPayload.paymentDetails) &&
    gatewayPayload.paymentDetails.length > 0
      ? gatewayPayload.paymentDetails[0]
      : {};
  const transactionId =
    latestAttempt.transactionId || payment.gatewayPaymentId || "";

  logPaymentStep({
    step: "fulfill_claimed",
    paymentId: payment._id,
    orderId: payment.order,
    merchantOrderId,
    correlationId: corr,
    transactionId,
    message: `claim=${claim.reason}`,
  });

  const order = await Order.findById(payment.order);
  if (!order) {
    await releaseFulfillmentFailure(payment._id, "ORDER_NOT_FOUND");
    await writePaymentLog({
      payment: payment._id,
      merchantOrderId,
      correlationId: corr,
      transactionId,
      source,
      action: "fulfill_missing_order",
      step: "load_order",
      success: false,
      message: "Order missing for payment",
      ip,
      userAgent,
      durationMs: elapsed(),
    });
    return { ok: false, code: "ORDER_NOT_FOUND", paid: false, payment };
  }

  // Amount integrity — critical failure, do not mark Success
  const gatewayAmount = Number(gatewayPayload.amount);
  if (
    Number.isFinite(gatewayAmount) &&
    gatewayAmount > 0 &&
    gatewayAmount !== payment.amountPaise
  ) {
    payment.status = "Failed";
    payment.failedAt = new Date();
    payment.rawGatewayResponse = gatewayPayload;
    payment.fulfillmentStatus = "failed";
    payment.fulfillmentError = `AMOUNT_MISMATCH expected=${payment.amountPaise} got=${gatewayAmount}`;
    await payment.save().catch(() => {});
    if (order.paymentStatus !== "Paid") {
      order.paymentStatus = "Failed";
      order.status = "Payment Failed";
      await order.save().catch(() => {});
    }

    await writePaymentLog({
      payment: payment._id,
      order: order._id,
      merchantOrderId,
      correlationId: corr,
      transactionId,
      source,
      action: "amount_mismatch",
      step: "amount_check",
      success: false,
      message: `Expected ${payment.amountPaise} paise, got ${gatewayAmount}`,
      response: gatewayPayload,
      ip,
      userAgent,
      durationMs: elapsed(),
    });
    await writeAuditLog({
      actorType: source === "Webhook" ? "Webhook" : "System",
      action: "payment.amount_mismatch",
      entityType: "Payment",
      entityId: String(payment._id),
      correlationId: corr,
      before: { amountPaise: payment.amountPaise },
      after: { gatewayAmount },
      ip,
      userAgent,
      success: false,
      message: "Gateway amount mismatch",
    });
    return { ok: false, code: "AMOUNT_MISMATCH", paid: false, payment, order };
  }

  const applySuccessState = async (session, payDoc, orderDoc) => {
    const opts = session ? { session } : {};

    // Stock FIRST — if this throws, transaction aborts / no Success write
    if (!payDoc.stockReduced) {
      await reduceStockAtomic(orderDoc.cart, { session });
      payDoc.stockReduced = true;
    }

    payDoc.status = "Success";
    payDoc.gatewayOrderId = gatewayPayload.orderId || payDoc.gatewayOrderId || "";
    payDoc.gatewayPaymentId =
      latestAttempt.transactionId || payDoc.gatewayPaymentId || "";
    payDoc.method = latestAttempt.paymentMode || payDoc.method || "PhonePe";
    payDoc.paidAt = payDoc.paidAt || new Date();
    payDoc.rawGatewayResponse = gatewayPayload;
    payDoc.correlationId = corr || payDoc.correlationId;
    payDoc.fulfillmentStatus = "completed";
    payDoc.fulfillmentCompletedAt = new Date();
    payDoc.fulfillmentError = "";

    orderDoc.paymentStatus = "Paid";
    orderDoc.status = "Pending";
    orderDoc.paymentMethod = "PhonePe";
    orderDoc.merchantOrderId = merchantOrderId;
    orderDoc.paymentRef = payDoc._id;
    orderDoc.correlationId = corr || orderDoc.correlationId;
    if (!orderDoc.trackingHistory || orderDoc.trackingHistory.length === 0) {
      orderDoc.trackingHistory = [
        {
          status: "Order Placed",
          message: "Payment received. Your order has been placed.",
          timestamp: new Date(),
        },
      ];
    }

    await payDoc.save(opts);
    await orderDoc.save(opts);
  };

  let usedTransaction = false;
  const maxTxAttempts = 4;
  try {
    if (supportsTransactions()) {
      let lastErr = null;
      for (let attempt = 1; attempt <= maxTxAttempts; attempt++) {
        const session = await mongoose.startSession();
        try {
          session.startTransaction();
          const payDoc =
            attempt === 1 ? payment : await Payment.findById(payment._id);
          const orderDoc =
            attempt === 1 ? order : await Order.findById(order._id);
          if (!payDoc || !orderDoc) {
            throw new Error("Payment or Order disappeared during fulfill retry");
          }
          await applySuccessState(session, payDoc, orderDoc);
          await session.commitTransaction();
          usedTransaction = true;
          lastErr = null;
          payment.status = "Success";
          payment.stockReduced = true;
          payment.fulfillmentStatus = "completed";
          order.paymentStatus = "Paid";
          order.status = "Pending";
          break;
        } catch (txErr) {
          lastErr = txErr;
          await session.abortTransaction().catch(() => {});
          const msg = String(txErr?.message || "");
          const retryable =
            /TransientTransactionError|UnknownTransactionCommitResult|catalog changes|NoSuchTransaction|WriteConflict|please retry/i.test(
              msg
            ) ||
            (Array.isArray(txErr?.errorLabels) &&
              txErr.errorLabels.includes("TransientTransactionError"));
          if (!retryable || attempt === maxTxAttempts) {
            throw txErr;
          }
          await sleep(150 * attempt * attempt);
        } finally {
          session.endSession();
        }
      }
      if (lastErr && !usedTransaction) throw lastErr;
    } else {
      // Standalone MongoDB fallback: ordered writes without multi-doc txn.
      // Stock is reduced first; if order/payment save fails afterwards we leave
      // fulfillmentStatus=failed so ops can reconcile (stock already moved).
      await applySuccessState(null, payment, order);
    }
  } catch (err) {
    await releaseFulfillmentFailure(payment._id, err.message);
    logPaymentStep({
      level: "error",
      step: "fulfill_critical_failed",
      paymentId: payment._id,
      orderId: order._id,
      merchantOrderId,
      correlationId: corr,
      transactionId,
      success: false,
      message: err.message,
      error: err,
      durationMs: elapsed(),
    });
    await writePaymentLog({
      payment: payment._id,
      order: order._id,
      merchantOrderId,
      correlationId: corr,
      transactionId,
      source,
      action: "fulfill_transaction_failed",
      step: "critical_writes",
      success: false,
      message: err.message,
      error: err,
      ip,
      userAgent,
      durationMs: elapsed(),
    });
    await writeAuditLog({
      actorType: "System",
      action: "payment.fulfill_failed",
      entityType: "Payment",
      entityId: String(payment._id),
      correlationId: corr,
      success: false,
      message: err.message,
      ip,
      userAgent,
    });
    return {
      ok: false,
      code: "FULFILL_FAILED",
      paid: false,
      message: err.message,
      payment,
      order,
    };
  }

  // Reload after commit for accurate in-memory state
  const freshPayment = await Payment.findById(payment._id);
  const freshOrder = await Order.findById(order._id);

  // NON-CRITICAL: notifications (best-effort, never flips paid→false)
  await maybeSendNotifications({
    payment: freshPayment || payment,
    order: freshOrder || order,
    merchantOrderId,
    correlationId: corr,
    source,
    ip,
    userAgent,
    transactionId,
  });

  await writePaymentLog({
    payment: payment._id,
    order: order._id,
    merchantOrderId,
    correlationId: corr,
    transactionId,
    source,
    action: "fulfill_success",
    step: "complete",
    success: true,
    message: usedTransaction
      ? "Payment fulfilled (transaction)"
      : "Payment fulfilled (non-transaction fallback)",
    response: {
      orderId: String(order._id),
      invoice: order.invoice,
      stockReduced: true,
      paymentStatus: "Success",
      orderPaymentStatus: "Paid",
    },
    ip,
    userAgent,
    durationMs: elapsed(),
  });

  await writeAuditLog({
    actorType: source === "Webhook" ? "Webhook" : "Gateway",
    action: "payment.success",
    entityType: "Order",
    entityId: String(order._id),
    correlationId: corr,
    after: {
      paymentStatus: "Paid",
      orderStatus: "Pending",
      amount: payment.amount,
      merchantOrderId,
      stockReduced: true,
    },
    ip,
    userAgent,
    success: true,
    message: "Order paid and stock updated",
  });

  logPaymentStep({
    step: "fulfill_complete",
    paymentId: payment._id,
    orderId: order._id,
    merchantOrderId,
    correlationId: corr,
    transactionId,
    durationMs: elapsed(),
    message: "critical path committed",
  });

  return {
    ok: true,
    paid: true,
    alreadyProcessed: false,
    payment: freshPayment || payment,
    order: freshOrder || order,
  };
};

/**
 * Claim notification slot atomically so emails send at most once.
 * Failures are logged; payment remains Success.
 */
const maybeSendNotifications = async ({
  payment,
  order,
  merchantOrderId,
  correlationId,
  source,
  ip,
  userAgent,
  transactionId = "",
}) => {
  if (!payment || !order) return;
  if (payment.notificationsSent) return;

  const claimed = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      notificationsSent: false,
      $or: [
        { notificationClaimedAt: { $exists: false } },
        { notificationClaimedAt: null },
        // reclaim stale claim after 5 min
        {
          notificationClaimedAt: {
            $lt: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
      ],
    },
    { $set: { notificationClaimedAt: new Date() } },
    { new: true }
  );

  if (!claimed) return;

  try {
    const { sendOrderNotifications } = require("../../../controller/customerOrderController");
    await sendOrderNotifications(order);
    await Payment.updateOne(
      { _id: payment._id },
      { $set: { notificationsSent: true } }
    );
  } catch (notifyErr) {
    // Release claim so a later verify/webhook can retry
    await Payment.updateOne(
      { _id: payment._id },
      { $unset: { notificationClaimedAt: 1 } }
    ).catch(() => {});
    await writePaymentLog({
      payment: payment._id,
      order: order._id,
      merchantOrderId,
      correlationId,
      transactionId,
      source,
      action: "notify_failed",
      step: "notifications",
      success: false,
      message: notifyErr.message,
      error: notifyErr,
      ip,
      userAgent,
    });
  }
};

const markPaymentFailed = async ({
  merchantOrderId,
  gatewayPayload = {},
  source = "System",
  ip = "",
  userAgent = "",
  correlationId = "",
}) => {
  const payment = await Payment.findOne({ merchantOrderId });
  if (!payment) {
    return { ok: false, code: "PAYMENT_NOT_FOUND", paid: false };
  }
  // Never downgrade a successful payment
  if (payment.status === "Success" || payment.fulfillmentStatus === "completed") {
    const order = await Order.findById(payment.order);
    return { ok: true, ignored: true, paid: true, payment, order };
  }

  const corr = correlationId || payment.correlationId || "";
  payment.status = "Failed";
  payment.failedAt = new Date();
  payment.rawGatewayResponse = gatewayPayload;
  payment.gatewayOrderId = gatewayPayload.orderId || payment.gatewayOrderId || "";
  payment.fulfillmentStatus = "failed";
  payment.fulfillmentError = "gateway_failed";
  await payment.save();

  const order = await Order.findById(payment.order);
  if (order && order.paymentStatus !== "Paid") {
    order.paymentStatus = "Failed";
    order.status = "Payment Failed";
    await order.save();
  }

  await writePaymentLog({
    payment: payment._id,
    order: order?._id,
    merchantOrderId,
    correlationId: corr,
    source,
    action: "mark_failed",
    step: "mark_failed",
    success: true,
    message: "Payment marked failed",
    response: gatewayPayload,
    ip,
    userAgent,
  });

  await writeAuditLog({
    actorType: source === "Webhook" ? "Webhook" : "System",
    action: "payment.failed",
    entityType: "Payment",
    entityId: String(payment._id),
    correlationId: corr,
    after: { status: "Failed" },
    ip,
    userAgent,
    success: true,
  });

  return { ok: true, paid: false, payment, order };
};

const verifyAndFulfillFromGateway = async ({
  merchantOrderId,
  source = "Verify",
  ip = "",
  userAgent = "",
  correlationId = "",
}) => {
  const elapsed = startTimer();
  const payment = await Payment.findOne({ merchantOrderId });
  const corr = correlationId || payment?.correlationId || "";

  // Fast path: already fully fulfilled — skip gateway round-trip if desired,
  // but still re-check gateway for amount/integrity on first call.
  if (
    payment &&
    payment.status === "Success" &&
    payment.fulfillmentStatus === "completed" &&
    payment.stockReduced
  ) {
    const order = await Order.findById(payment.order);
    await maybeSendNotifications({
      payment,
      order,
      merchantOrderId,
      correlationId: corr,
      source,
      ip,
      userAgent,
    });
    return {
      ok: true,
      paid: true,
      alreadyProcessed: true,
      payment,
      order,
    };
  }

  let statusPayload;
  try {
    statusPayload = await getOrderStatus(merchantOrderId, true);
  } catch (gatewayErr) {
    await writePaymentLog({
      payment: payment?._id,
      merchantOrderId,
      correlationId: corr,
      source,
      action: "gateway_status_error",
      step: "gateway_status",
      success: false,
      message: gatewayErr.message,
      error: gatewayErr,
      response: gatewayErr?.response?.data || {},
      ip,
      userAgent,
      durationMs: elapsed(),
    });
    return {
      ok: false,
      code: "GATEWAY_STATUS_FAILED",
      paid: false,
      message: gatewayErr.message,
      payment,
      order: payment ? await Order.findById(payment.order) : null,
    };
  }

  const state = String(statusPayload?.state || "").toUpperCase();

  await writePaymentLog({
    payment: payment?._id,
    order: payment?.order,
    merchantOrderId,
    correlationId: corr,
    transactionId:
      statusPayload?.paymentDetails?.[0]?.transactionId || "",
    source,
    action: "gateway_status_fetched",
    step: "gateway_status",
    success: true,
    message: `Gateway state=${state}`,
    response: {
      state,
      orderId: statusPayload?.orderId,
      amount: statusPayload?.amount,
    },
    ip,
    userAgent,
    durationMs: elapsed(),
  });

  if (state === "COMPLETED") {
    return fulfillSuccessfulPayment({
      merchantOrderId,
      gatewayPayload: statusPayload,
      source,
      ip,
      userAgent,
      correlationId: corr,
    });
  }

  if (state === "FAILED") {
    return markPaymentFailed({
      merchantOrderId,
      gatewayPayload: statusPayload,
      source,
      ip,
      userAgent,
      correlationId: corr,
    });
  }

  if (payment && payment.status === "Created") {
    payment.status = "Pending";
    await payment.save().catch(() => {});
  }

  return {
    ok: true,
    paid: false,
    pending: true,
    state,
    payment,
    order: payment ? await Order.findById(payment.order) : null,
  };
};

module.exports = {
  fulfillSuccessfulPayment,
  markPaymentFailed,
  verifyAndFulfillFromGateway,
  claimFulfillment,
  FULFILL_LOCK_TTL_MS,
};

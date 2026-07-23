const mongoose = require("mongoose");
const Order = require("../../../models/Order");
const Payment = require("../../../models/Payment");
const { reduceStockAtomic } = require("../../../lib/stock-controller/others");
const { writePaymentLog } = require("./paymentLogger");
const { writeAuditLog } = require("./auditService");
const { getOrderStatus } = require("./phonepeClient");

const supportsTransactions = () => {
  try {
    const topology = mongoose.connection?.client?.topology;
    // Atlas / replica set → transactions OK. Standalone → fallback path.
    return Boolean(topology?.description?.type && topology.description.type !== "Single");
  } catch {
    return false;
  }
};

/**
 * Idempotent fulfillment after PhonePe reports COMPLETED.
 * DB updates (payment/order/stock) prefer a transaction; notifications run after commit.
 */
const fulfillSuccessfulPayment = async ({
  merchantOrderId,
  gatewayPayload = {},
  source = "System",
  ip = "",
  userAgent = "",
  correlationId = "",
}) => {
  const payment = await Payment.findOne({ merchantOrderId });
  if (!payment) {
    await writePaymentLog({
      merchantOrderId,
      correlationId,
      source,
      action: "fulfill_missing_payment",
      success: false,
      message: "Payment record not found",
      response: gatewayPayload,
      ip,
      userAgent,
    });
    return { ok: false, code: "PAYMENT_NOT_FOUND" };
  }

  const corr = correlationId || payment.correlationId || "";

  if (payment.status === "Success" && payment.stockReduced) {
    await writePaymentLog({
      payment: payment._id,
      merchantOrderId,
      correlationId: corr,
      source,
      action: "fulfill_idempotent_skip",
      success: true,
      message: "Already fulfilled",
      response: { paymentStatus: payment.status },
      ip,
      userAgent,
    });
    const order = await Order.findById(payment.order);
    return { ok: true, alreadyProcessed: true, payment, order };
  }

  const latestAttempt =
    Array.isArray(gatewayPayload.paymentDetails) &&
    gatewayPayload.paymentDetails.length > 0
      ? gatewayPayload.paymentDetails[0]
      : {};

  const order = await Order.findById(payment.order);
  if (!order) {
    await writePaymentLog({
      payment: payment._id,
      merchantOrderId,
      correlationId: corr,
      source,
      action: "fulfill_missing_order",
      success: false,
      message: "Order missing for payment",
      ip,
      userAgent,
    });
    return { ok: false, code: "ORDER_NOT_FOUND", payment };
  }

  const gatewayAmount = Number(gatewayPayload.amount);
  if (
    Number.isFinite(gatewayAmount) &&
    gatewayAmount > 0 &&
    gatewayAmount !== payment.amountPaise
  ) {
    payment.status = "Failed";
    payment.failedAt = new Date();
    payment.rawGatewayResponse = gatewayPayload;
    await payment.save();
    order.paymentStatus = "Failed";
    order.status = "Payment Failed";
    await order.save();

    await writePaymentLog({
      payment: payment._id,
      order: order._id,
      merchantOrderId,
      correlationId: corr,
      source,
      action: "amount_mismatch",
      success: false,
      message: `Expected ${payment.amountPaise} paise, got ${gatewayAmount}`,
      response: gatewayPayload,
      ip,
      userAgent,
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
    return { ok: false, code: "AMOUNT_MISMATCH", payment, order };
  }

  const applySuccessState = async (session) => {
    const opts = session ? { session } : {};

    payment.status = "Success";
    payment.gatewayOrderId = gatewayPayload.orderId || payment.gatewayOrderId || "";
    payment.gatewayPaymentId =
      latestAttempt.transactionId || payment.gatewayPaymentId || "";
    payment.method = latestAttempt.paymentMode || payment.method || "PhonePe";
    payment.paidAt = payment.paidAt || new Date();
    payment.rawGatewayResponse = gatewayPayload;
    payment.correlationId = corr || payment.correlationId;

    if (!payment.stockReduced) {
      await reduceStockAtomic(order.cart, { session });
      payment.stockReduced = true;
    }

    order.paymentStatus = "Paid";
    order.status = "Pending";
    order.paymentMethod = "PhonePe";
    order.merchantOrderId = merchantOrderId;
    order.paymentRef = payment._id;
    order.correlationId = corr || order.correlationId;
    if (!order.trackingHistory || order.trackingHistory.length === 0) {
      order.trackingHistory = [
        {
          status: "Order Placed",
          message: "Payment received. Your order has been placed.",
          timestamp: new Date(),
        },
      ];
    }

    await payment.save(opts);
    await order.save(opts);
  };

  let usedTransaction = false;
  try {
    if (supportsTransactions()) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await applySuccessState(session);
        await session.commitTransaction();
        usedTransaction = true;
      } catch (txErr) {
        await session.abortTransaction().catch(() => {});
        throw txErr;
      } finally {
        session.endSession();
      }
    } else {
      await applySuccessState(null);
    }
  } catch (err) {
    await writePaymentLog({
      payment: payment._id,
      order: order?._id,
      merchantOrderId,
      correlationId: corr,
      source,
      action: "fulfill_transaction_failed",
      success: false,
      message: err.message,
      ip,
      userAgent,
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
    return { ok: false, code: "FULFILL_FAILED", message: err.message, payment, order };
  }

  // External side-effects AFTER commit
  if (!payment.notificationsSent) {
    try {
      const { sendOrderNotifications } = require("../../../controller/customerOrderController");
      await sendOrderNotifications(order);
      payment.notificationsSent = true;
      await payment.save();
    } catch (notifyErr) {
      await writePaymentLog({
        payment: payment._id,
        order: order._id,
        merchantOrderId,
        correlationId: corr,
        source,
        action: "notify_failed",
        success: false,
        message: notifyErr.message,
        ip,
        userAgent,
      });
    }
  }

  await writePaymentLog({
    payment: payment._id,
    order: order._id,
    merchantOrderId,
    correlationId: corr,
    source,
    action: "fulfill_success",
    success: true,
    message: usedTransaction
      ? "Payment fulfilled (transaction)"
      : "Payment fulfilled (non-transaction fallback)",
    response: {
      orderId: String(order._id),
      invoice: order.invoice,
      stockReduced: payment.stockReduced,
      paymentStatus: payment.status,
      orderPaymentStatus: order.paymentStatus,
    },
    ip,
    userAgent,
  });

  await writeAuditLog({
    actorType: source === "Webhook" ? "Webhook" : "Gateway",
    action: "payment.success",
    entityType: "Order",
    entityId: String(order._id),
    correlationId: corr,
    after: {
      paymentStatus: "Paid",
      orderStatus: order.status,
      amount: payment.amount,
      merchantOrderId,
    },
    ip,
    userAgent,
    success: true,
    message: "Order paid and stock updated",
  });

  return { ok: true, alreadyProcessed: false, payment, order };
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
    return { ok: false, code: "PAYMENT_NOT_FOUND" };
  }
  if (payment.status === "Success") {
    return { ok: true, ignored: true, payment };
  }

  const corr = correlationId || payment.correlationId || "";
  payment.status = "Failed";
  payment.failedAt = new Date();
  payment.rawGatewayResponse = gatewayPayload;
  payment.gatewayOrderId = gatewayPayload.orderId || payment.gatewayOrderId || "";
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

  return { ok: true, payment, order };
};

const verifyAndFulfillFromGateway = async ({
  merchantOrderId,
  source = "Verify",
  ip = "",
  userAgent = "",
  correlationId = "",
}) => {
  const payment = await Payment.findOne({ merchantOrderId });
  const corr = correlationId || payment?.correlationId || "";

  const statusPayload = await getOrderStatus(merchantOrderId, true);
  const state = String(statusPayload?.state || "").toUpperCase();

  await writePaymentLog({
    payment: payment?._id,
    merchantOrderId,
    correlationId: corr,
    source,
    action: "gateway_status_fetched",
    success: true,
    message: `Gateway state=${state}`,
    response: { state, orderId: statusPayload?.orderId, amount: statusPayload?.amount },
    ip,
    userAgent,
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
    await payment.save();
  }

  return {
    ok: true,
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
};

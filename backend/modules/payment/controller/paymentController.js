const rateLimit = require("express-rate-limit");
const Order = require("../../../models/Order");
const Payment = require("../../../models/Payment");
const { checkStock } = require("../../../lib/stock-controller/others");
const { populateCartTaxFields } = require("../../../utils/cartTaxUtils");
const {
  validateCreatePhonePeCheckout,
  validateMerchantOrderId,
} = require("../validator/paymentValidator");
const {
  getConfig,
  generateMerchantOrderId,
  toPaise,
  verifyWebhookAuthorization,
} = require("../utils/phonepeConfig");
const { createPayment } = require("../service/phonepeClient");
const { writePaymentLog } = require("../service/paymentLogger");
const {
  markPaymentFailed,
  verifyAndFulfillFromGateway,
} = require("../service/paymentFulfillment");
const {
  buildValidatedCheckout,
  createCorrelationId,
} = require("../service/cartPricing");
const {
  writeAuditLog,
  registerWebhookEvent,
  markWebhookProcessed,
} = require("../service/auditService");

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many payment requests. Please try again later.",
  },
});

const getClientMeta = (req) => ({
  ip:
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.ip ||
    "",
  userAgent: req.headers["user-agent"] || "",
});

const sendError = (res, status, code, message, extra = {}) =>
  res.status(status).send({
    success: false,
    code,
    message,
    ...extra,
  });

const getPhonePePublicStatus = async (_req, res) => {
  try {
    const cfg = getConfig();
    return res.send({
      success: true,
      enabled: Boolean(cfg.enabled && cfg.clientId && cfg.clientSecret),
      gateway: "PhonePe",
      env: cfg.isProduction ? "production" : "sandbox",
    });
  } catch (err) {
    return res.send({
      success: true,
      enabled: false,
      gateway: "PhonePe",
      message: err.message,
    });
  }
};

/**
 * Create unpaid Order + PhonePe checkout session.
 * Stock is NOT reduced here — only after verified payment success.
 */
const createPhonePeCheckout = async (req, res) => {
  const { ip, userAgent } = getClientMeta(req);
  const correlationId = createCorrelationId();
  res.setHeader("X-Correlation-Id", correlationId);

  try {
    let cfg;
    try {
      cfg = getConfig();
    } catch (cfgErr) {
      console.error("PhonePe config error:", cfgErr.message);
      return sendError(
        res,
        503,
        "PHONEPE_NOT_CONFIGURED",
        "PhonePe is not configured on the server. Add PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET to backend .env, then restart.",
        { correlationId }
      );
    }

    if (!cfg.enabled) {
      return sendError(res, 400, "PHONEPE_DISABLED", "PhonePe payments are disabled.");
    }

    if (!cfg.clientId || !cfg.clientSecret) {
      return sendError(
        res,
        503,
        "PHONEPE_NOT_CONFIGURED",
        "PhonePe credentials missing on server. Update backend .env and restart.",
        { correlationId }
      );
    }

    const validation = validateCreatePhonePeCheckout(req.body);
    if (!validation.ok) {
      return sendError(res, 400, "VALIDATION_ERROR", validation.errors[0], {
        errors: validation.errors,
        correlationId,
      });
    }

    const priced = await buildValidatedCheckout({
      cart: req.body.cart,
      shippingCost: req.body.shippingCost,
      couponCode: req.body.coupon?.couponCode || req.body.couponCode || null,
      clientTotal: req.body.total,
    });

    if (!priced.ok) {
      return sendError(res, 400, priced.code || "CART_INVALID", priced.message, {
        details: priced.details,
        correlationId,
      });
    }

    const outOfStockItems = await checkStock(priced.frozenCart);
    if (outOfStockItems.length > 0) {
      return sendError(res, 400, "OUT_OF_STOCK", "Some items in your cart are out of stock.", {
        outOfStockItems,
        correlationId,
      });
    }

    const cartWithTax = await populateCartTaxFields(priced.frozenCart);
    const total = priced.pricing.total;
    const amountPaise = toPaise(total);
    if (amountPaise < 100) {
      return sendError(res, 400, "AMOUNT_TOO_LOW", "Minimum payable amount is ₹1.");
    }

    const merchantOrderId = generateMerchantOrderId();
    const frontendBase = (
      process.env.STORE_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:3000"
    )
      .split(",")[0]
      .trim()
      .replace(/\/+$/, "");

    // PhonePe requires a public HTTPS return URL in production
    if (cfg.isProduction && !/^https:\/\//i.test(frontendBase)) {
      return sendError(
        res,
        503,
        "STORE_URL_INVALID",
        "STORE_URL must be https://therasastore.in on the production backend.",
        { correlationId, frontendBase }
      );
    }

    const redirectUrl = `${frontendBase}/payment/phonepe/return?moid=${encodeURIComponent(
      merchantOrderId
    )}&cid=${encodeURIComponent(correlationId)}`;

    const newOrder = new Order({
      user_info: req.body.user_info,
      shippingOption: req.body.shippingOption || "",
      paymentMethod: "PhonePe",
      paymentStatus: "Pending",
      status: "Pending Payment",
      cart: cartWithTax,
      cartSnapshot: priced.snapshot,
      pricingSnapshot: {
        subTotal: priced.pricing.subTotal,
        shippingCost: priced.pricing.shippingCost,
        discount: priced.pricing.discount,
        total: priced.pricing.total,
        calculatedAt: new Date(),
      },
      subTotal: priced.pricing.subTotal,
      shippingCost: priced.pricing.shippingCost,
      discount: priced.pricing.discount,
      ...(priced.pricing.coupon ? { coupon: priced.pricing.coupon } : {}),
      taxSummary: req.body.taxSummary || undefined,
      total,
      merchantOrderId,
      correlationId,
      user: req.user?._id || null,
    });

    const order = await newOrder.save();

    const payment = await Payment.create({
      order: order._id,
      merchantOrderId,
      gateway: "PhonePe",
      status: "Created",
      amount: total,
      amountPaise,
      currency: "INR",
      correlationId,
      meta: {
        invoice: order.invoice,
        userId: req.user?._id || null,
      },
    });

    order.paymentRef = payment._id;
    await order.save();

    await writePaymentLog({
      payment: payment._id,
      merchantOrderId,
      correlationId,
      source: "API",
      action: "create_checkout_start",
      success: true,
      message: "Creating PhonePe payment session",
      request: { total, amountPaise, orderId: String(order._id), snapshotItems: priced.snapshot.length },
      ip,
      userAgent,
    });

    await writeAuditLog({
      actorType: "Customer",
      actorId: req.user?._id || "",
      action: "checkout.created",
      entityType: "Order",
      entityId: order._id,
      correlationId,
      after: {
        total,
        merchantOrderId,
        items: priced.snapshot.length,
      },
      ip,
      userAgent,
      success: true,
    });

    let gatewayResponse;
    try {
      gatewayResponse = await createPayment({
        merchantOrderId,
        amountPaise,
        redirectUrl,
        message: `RASA order #${order.invoice}`,
        metaInfo: {
          udf1: String(order._id),
          udf2: String(order.invoice || ""),
          udf3: String(req.body.user_info?.contact || "").slice(0, 50),
          udf4: correlationId.slice(0, 50),
        },
      });
    } catch (gatewayErr) {
      const errData = gatewayErr?.response?.data || { message: gatewayErr.message };
      const gatewayMsg =
        errData?.message ||
        errData?.error ||
        errData?.code ||
        gatewayErr.message ||
        "Unable to start PhonePe payment.";

      payment.status = "Failed";
      payment.failedAt = new Date();
      payment.rawGatewayResponse = errData;
      await payment.save();

      order.paymentStatus = "Failed";
      order.status = "Payment Failed";
      await order.save();

      await writePaymentLog({
        payment: payment._id,
        merchantOrderId,
        correlationId,
        source: "API",
        action: "create_checkout_gateway_error",
        success: false,
        message: gatewayMsg,
        response: errData,
        ip,
        userAgent,
      });

      return sendError(
        res,
        502,
        "GATEWAY_CREATE_FAILED",
        String(gatewayMsg).slice(0, 300) ||
          "Unable to start PhonePe payment. Please try again or use Cash on Delivery.",
        { correlationId }
      );
    }

    payment.status = "Pending";
    payment.gatewayOrderId = gatewayResponse?.orderId || "";
    payment.redirectUrl = gatewayResponse?.redirectUrl || "";
    payment.rawGatewayResponse = gatewayResponse;
    await payment.save();

    await writePaymentLog({
      payment: payment._id,
      merchantOrderId,
      correlationId,
      source: "API",
      action: "create_checkout_success",
      success: true,
      message: "PhonePe redirect URL created",
      response: {
        orderId: gatewayResponse?.orderId,
        state: gatewayResponse?.state,
        hasRedirect: Boolean(gatewayResponse?.redirectUrl),
      },
      ip,
      userAgent,
    });

    if (!gatewayResponse?.redirectUrl) {
      return sendError(
        res,
        502,
        "GATEWAY_NO_REDIRECT",
        "PhonePe did not return a payment URL. Please try again.",
        { correlationId }
      );
    }

    return res.status(201).send({
      success: true,
      orderId: order._id,
      invoice: order.invoice,
      merchantOrderId,
      correlationId,
      redirectUrl: gatewayResponse.redirectUrl,
      amount: total,
      status: order.status,
      paymentStatus: payment.status,
    });
  } catch (err) {
    console.error("createPhonePeCheckout error:", err);
    await writePaymentLog({
      correlationId,
      source: "Error",
      action: "create_checkout_exception",
      success: false,
      message: err.message,
      response: {
        name: err.name,
        code: err.code,
        errors: err.errors ? Object.keys(err.errors) : undefined,
      },
      ip,
      userAgent,
    });

    const raw = String(err.message || "");
    let message = "Payment init failed. Please try again or use Cash on Delivery.";
    if (/PhonePe credentials missing/i.test(raw)) {
      message =
        "PhonePe credentials missing on server. Add PHONEPE_* keys to backend .env and restart.";
    } else if (/Cast to ObjectId|CastError/i.test(raw) || err.name === "CastError") {
      message = "Invalid product in cart. Remove items and add again.";
    } else if (/validation failed/i.test(raw)) {
      message = "Order details invalid. Check name, phone, email, address and try again.";
    } else if (raw && raw.length < 180 && !/secret|password|token|mongo/i.test(raw)) {
      message = raw;
    }

    return sendError(res, 500, "PAYMENT_INIT_FAILED", message, {
      correlationId,
    });
  }
};

const verifyPhonePePayment = async (req, res) => {
  const { ip, userAgent } = getClientMeta(req);
  const correlationId =
    req.body?.correlationId ||
    req.query?.cid ||
    req.query?.correlationId ||
    createCorrelationId();
  res.setHeader("X-Correlation-Id", correlationId);

  try {
    const merchantOrderId =
      req.body?.merchantOrderId || req.query?.merchantOrderId || req.query?.moid;
    const validation = validateMerchantOrderId(merchantOrderId);
    if (!validation.ok) {
      return sendError(res, 400, "VALIDATION_ERROR", validation.errors[0], {
        correlationId,
      });
    }

    const result = await verifyAndFulfillFromGateway({
      merchantOrderId,
      source: "Verify",
      ip,
      userAgent,
      correlationId,
    });

    if (!result.ok && result.code === "PAYMENT_NOT_FOUND") {
      return sendError(res, 404, "PAYMENT_NOT_FOUND", "Payment not found.", {
        correlationId,
      });
    }

    if (!result.ok && result.code === "AMOUNT_MISMATCH") {
      return sendError(
        res,
        409,
        "AMOUNT_MISMATCH",
        "Payment amount mismatch. Our team has been notified.",
        { correlationId, status: "Failed" }
      );
    }

    if (!result.ok && result.code === "FULFILL_FAILED") {
      return sendError(
        res,
        500,
        "PAYMENT_FULFILL_FAILED",
        "Payment received but order fulfillment needs retry. Support has been notified.",
        { correlationId }
      );
    }

    const payment = result.payment;
    const order = result.order;

    return res.send({
      success: true,
      ok: true,
      pending: Boolean(result.pending),
      alreadyProcessed: Boolean(result.alreadyProcessed),
      state: result.state || payment?.status,
      paymentStatus: payment?.status,
      orderStatus: order?.status,
      orderId: order?._id,
      invoice: order?.invoice,
      paid: payment?.status === "Success",
      correlationId,
    });
  } catch (err) {
    console.error("verifyPhonePePayment error:", err);
    await writePaymentLog({
      merchantOrderId: req.body?.merchantOrderId || "",
      correlationId,
      source: "Error",
      action: "verify_exception",
      success: false,
      message: err.message,
      response: err?.response?.data || {},
      ip,
      userAgent,
    });
    return sendError(
      res,
      500,
      "PAYMENT_VERIFICATION_FAILED",
      "Payment verification failed.",
      { correlationId }
    );
  }
};

/**
 * PhonePe S2S webhook — auth + replay protection + status re-verify.
 */
const handlePhonePeWebhook = async (req, res) => {
  const { ip, userAgent } = getClientMeta(req);
  const authHeader =
    req.headers.authorization ||
    req.headers.Authorization ||
    req.headers["x-verify"] ||
    "";

  if (!verifyWebhookAuthorization(authHeader)) {
    await writePaymentLog({
      source: "Webhook",
      action: "auth_failed",
      success: false,
      message: "Invalid webhook authorization",
      request: { hasAuth: Boolean(authHeader) },
      ip,
      userAgent,
    });
    return sendError(res, 401, "UNAUTHORIZED", "Unauthorized");
  }

  try {
    const body = req.body || {};
    const event = body.event || body.type || "";
    const payload = body.payload || body;
    const merchantOrderId =
      payload.merchantOrderId ||
      payload.merchant_order_id ||
      body.merchantOrderId ||
      "";
    const state = String(payload.state || "").toUpperCase();
    const eventId =
      body.eventId ||
      body.id ||
      payload.eventId ||
      payload.transactionId ||
      payload.orderId ||
      "";

    const replay = await registerWebhookEvent({
      gateway: "PhonePe",
      eventId,
      eventType: String(event),
      merchantOrderId,
      payload: body,
    });

    if (replay.duplicate) {
      await writePaymentLog({
        merchantOrderId,
        source: "Webhook",
        action: "replay_ignored",
        success: true,
        message: `Duplicate webhook ignored: ${replay.eventId}`,
        ip,
        userAgent,
      });
      return res.status(200).send({ received: true, duplicate: true });
    }

    await writePaymentLog({
      merchantOrderId,
      source: "Webhook",
      action: "received",
      success: true,
      message: `event=${event} state=${state}`,
      request: { event, eventId: replay.eventId },
      response: { state, orderId: payload.orderId },
      ip,
      userAgent,
    });

    if (!merchantOrderId) {
      await markWebhookProcessed(replay.eventId);
      return res.status(200).send({ received: true, ignored: true });
    }

    if (state === "COMPLETED" || String(event).includes("completed")) {
      await verifyAndFulfillFromGateway({
        merchantOrderId,
        source: "Webhook",
        ip,
        userAgent,
      });
    } else if (state === "FAILED" || String(event).includes("failed")) {
      await markPaymentFailed({
        merchantOrderId,
        gatewayPayload: payload,
        source: "Webhook",
        ip,
        userAgent,
      });
    }

    await markWebhookProcessed(replay.eventId);
    return res.status(200).send({ received: true });
  } catch (err) {
    console.error("PhonePe webhook error:", err);
    await writePaymentLog({
      source: "Webhook",
      action: "exception",
      success: false,
      message: err.message,
      ip,
      userAgent,
    });
    return res.status(200).send({ received: true, error: true });
  }
};

module.exports = {
  paymentLimiter,
  getPhonePePublicStatus,
  createPhonePeCheckout,
  verifyPhonePePayment,
  handlePhonePeWebhook,
};

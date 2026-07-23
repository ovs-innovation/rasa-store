const mongoose = require("mongoose");
const PaymentLog = require("../../../models/PaymentLog");
const { logPaymentStep } = require("./structuredLogger");

/**
 * Normalize any value into a valid ObjectId string, or undefined.
 * Never pass plain objects / documents / arrays into ObjectId fields.
 */
const toObjectIdString = (value) => {
  if (value == null || value === "") return undefined;

  if (value instanceof mongoose.Types.ObjectId) {
    return String(value);
  }

  if (typeof value === "object") {
    if (value._id != null) {
      return toObjectIdString(value._id);
    }
    return undefined;
  }

  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return undefined;

  // Prefer strict 24-hex — mongoose.isValidObjectId accepts some non-hex 12-char strings
  if (!/^[a-fA-F0-9]{24}$/.test(str)) return undefined;
  return str;
};

const SENSITIVE_KEYS = new Set([
  "client_secret",
  "clientSecret",
  "password",
  "authorization",
  "Authorization",
  "access_token",
  "secret",
  "token",
]);

/**
 * Deep-sanitize payloads for Mixed fields.
 * Converts ObjectIds / Documents to plain JSON-safe values.
 */
const sanitize = (value, depth = 0) => {
  if (depth > 8 || value == null) return value;

  if (value instanceof mongoose.Types.ObjectId) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Buffer.isBuffer(value)) {
    return undefined;
  }

  if (typeof value === "object" && typeof value.toObject === "function") {
    try {
      return sanitize(value.toObject({ depopulate: true }), depth + 1);
    } catch {
      return sanitize(value._doc || { _id: value._id }, depth + 1);
    }
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitize(v, depth + 1));
  }

  if (typeof value !== "object") {
    return value;
  }

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(k)) {
      out[k] = "[REDACTED]";
      continue;
    }
    if (k.startsWith("$") || k === "__v" || k === "_doc") continue;
    out[k] = sanitize(v, depth + 1);
  }
  return out;
};

/**
 * Fire-and-forget payment audit log.
 * MUST NEVER throw / break payment success path.
 */
const writePaymentLog = async ({
  payment,
  order,
  user,
  merchantOrderId = "",
  correlationId = "",
  transactionId = "",
  source = "System",
  action = "unknown",
  step = "",
  durationMs = null,
  success = true,
  message = "",
  error = null,
  request = {},
  response = {},
  ip = "",
  userAgent = "",
} = {}) => {
  try {
    const paymentId = toObjectIdString(payment);
    const orderId = toObjectIdString(order);
    const userId = toObjectIdString(user);

    const txFromPayload =
      transactionId ||
      response?.transactionId ||
      response?.gatewayPaymentId ||
      request?.transactionId ||
      "";

    logPaymentStep({
      level: success ? "info" : "error",
      step: step || action,
      paymentId,
      orderId,
      userId,
      transactionId: txFromPayload,
      merchantOrderId,
      correlationId,
      durationMs,
      success,
      message,
      error,
    });

    const allowedSources = ["API", "Webhook", "Verify", "System", "Error"];
    const safeSource = allowedSources.includes(source) ? source : "System";

    const doc = {
      merchantOrderId: String(merchantOrderId || "").slice(0, 128),
      correlationId: String(correlationId || "").slice(0, 128),
      transactionId: String(txFromPayload || "").slice(0, 128),
      source: safeSource,
      action: String(action || "unknown").slice(0, 120),
      step: String(step || action || "").slice(0, 120),
      durationMs:
        durationMs == null || !Number.isFinite(Number(durationMs))
          ? null
          : Math.round(Number(durationMs)),
      success: Boolean(success),
      message: String(message || "").slice(0, 2000),
      errorStack: error?.stack
        ? String(error.stack).slice(0, 4000)
        : "",
      request: sanitize(request) || {},
      response: sanitize(
        response && typeof response === "object" && !Array.isArray(response)
          ? response
          : response != null
            ? { value: response }
            : {}
      ),
      ip: String(ip || "").slice(0, 128),
      userAgent: String(userAgent || "").slice(0, 500),
    };

    if (paymentId) doc.payment = paymentId;
    if (orderId) doc.order = orderId;
    if (userId) doc.user = userId;

    await PaymentLog.create(doc);
  } catch (err) {
    console.error("PaymentLog write failed (non-fatal):", err.message);
    if (err?.errors) {
      console.error(
        "PaymentLog validation errors:",
        Object.keys(err.errors).map((k) => `${k}: ${err.errors[k].message}`)
      );
    }
  }
};

module.exports = {
  writePaymentLog,
  toObjectIdString,
  sanitize,
};

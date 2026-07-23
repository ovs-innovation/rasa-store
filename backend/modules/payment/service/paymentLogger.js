const mongoose = require("mongoose");
const PaymentLog = require("../../../models/PaymentLog");

/**
 * Normalize any value into a valid ObjectId string, or undefined.
 * Never pass plain objects / documents / arrays into ObjectId fields.
 */
const toObjectIdString = (value) => {
  if (value == null || value === "") return undefined;

  // Already an ObjectId instance
  if (value instanceof mongoose.Types.ObjectId) {
    return String(value);
  }

  // Mongoose document / lean doc with _id
  if (typeof value === "object") {
    if (value._id != null) {
      return toObjectIdString(value._id);
    }
    // Plain object / array — never valid as ObjectId
    return undefined;
  }

  const str = String(value).trim();
  if (!str || str === "undefined" || str === "null") return undefined;

  // mongoose.isValidObjectId accepts some 12-char strings that are not hex;
  // prefer strict 24-hex check for refs we persist.
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

  // Mongoose document → lean plain object
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
    // Skip mongoose internals
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
  source = "System",
  action = "unknown",
  success = true,
  message = "",
  request = {},
  response = {},
  ip = "",
  userAgent = "",
} = {}) => {
  try {
    const paymentId = toObjectIdString(payment);
    const orderId = toObjectIdString(order);
    const userId = toObjectIdString(user);

    // Extra ids sometimes present in payloads (never cast as ObjectId on this model)
    const transactionId =
      response?.transactionId ||
      response?.gatewayPaymentId ||
      request?.transactionId ||
      "";

    console.log("[PaymentLog] write", {
      action,
      source,
      orderId: orderId || null,
      userId: userId || null,
      paymentId: paymentId || null,
      transactionId: transactionId ? String(transactionId).slice(0, 64) : null,
      merchantOrderId: merchantOrderId || null,
      correlationId: correlationId || null,
    });

    const allowedSources = ["API", "Webhook", "Verify", "System", "Error"];
    const safeSource = allowedSources.includes(source) ? source : "System";

    const doc = {
      merchantOrderId: String(merchantOrderId || "").slice(0, 128),
      correlationId: String(correlationId || "").slice(0, 128),
      source: safeSource,
      action: String(action || "unknown").slice(0, 120),
      success: Boolean(success),
      message: String(message || "").slice(0, 2000),
      request: sanitize(request) || {},
      response: sanitize({
        ...((response && typeof response === "object" && !Array.isArray(response)
          ? response
          : { value: response }) || {}),
        ...(orderId ? { _orderId: orderId } : {}),
        ...(userId ? { _userId: userId } : {}),
      }),
      ip: String(ip || "").slice(0, 128),
      userAgent: String(userAgent || "").slice(0, 500),
    };

    // Only set ObjectId ref when valid — omit field otherwise (avoid CastError)
    if (paymentId) {
      doc.payment = paymentId;
    }

    await PaymentLog.create(doc);
  } catch (err) {
    // CRITICAL: logging must never fail the payment flow
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

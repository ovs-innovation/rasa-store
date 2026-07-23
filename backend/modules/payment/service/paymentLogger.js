const PaymentLog = require("../../../models/PaymentLog");

const writePaymentLog = async ({
  payment,
  merchantOrderId = "",
  correlationId = "",
  source,
  action,
  success = true,
  message = "",
  request = {},
  response = {},
  ip = "",
  userAgent = "",
}) => {
  try {
    // Never persist secrets
    const safeRequest = sanitize(request);
    const safeResponse = sanitize(response);

    await PaymentLog.create({
      payment: payment || undefined,
      merchantOrderId,
      correlationId,
      source,
      action,
      success,
      message: String(message || "").slice(0, 2000),
      request: safeRequest,
      response: safeResponse,
      ip,
      userAgent: String(userAgent || "").slice(0, 500),
    });
  } catch (err) {
    console.error("PaymentLog write failed:", err.message);
  }
};

const SENSITIVE_KEYS = new Set([
  "client_secret",
  "clientSecret",
  "password",
  "authorization",
  "Authorization",
  "access_token",
  "secret",
]);

const sanitize = (value, depth = 0) => {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (typeof value !== "object") return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SENSITIVE_KEYS.has(k) ? "[REDACTED]" : sanitize(v, depth + 1);
  }
  return out;
};

module.exports = { writePaymentLog };

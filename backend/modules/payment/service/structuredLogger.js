/**
 * Structured payment flow logger.
 * Never throws — safe to call from any path.
 */

const logPaymentStep = ({
  level = "info",
  step,
  paymentId = null,
  orderId = null,
  userId = null,
  transactionId = null,
  merchantOrderId = null,
  correlationId = null,
  durationMs = null,
  success = true,
  message = "",
  error = null,
  meta = {},
} = {}) => {
  try {
    const entry = {
      ts: new Date().toISOString(),
      level,
      domain: "payment",
      step: String(step || "unknown"),
      paymentId: paymentId ? String(paymentId) : null,
      orderId: orderId ? String(orderId) : null,
      userId: userId ? String(userId) : null,
      transactionId: transactionId ? String(transactionId).slice(0, 128) : null,
      merchantOrderId: merchantOrderId ? String(merchantOrderId) : null,
      correlationId: correlationId ? String(correlationId) : null,
      durationMs: Number.isFinite(durationMs) ? Math.round(durationMs) : null,
      success: Boolean(success),
      message: String(message || "").slice(0, 2000),
      ...((meta && typeof meta === "object" && !Array.isArray(meta)) ? { meta } : {}),
    };

    if (error) {
      entry.errorName = error.name || "Error";
      entry.errorMessage = String(error.message || "").slice(0, 2000);
      entry.errorStack = String(error.stack || "").slice(0, 4000);
    }

    const line = JSON.stringify(entry);
    if (level === "error" || !success) {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  } catch (err) {
    console.error("[structuredLogger] failed:", err?.message);
  }
};

const startTimer = () => {
  const t0 = Date.now();
  return () => Date.now() - t0;
};

module.exports = {
  logPaymentStep,
  startTimer,
};

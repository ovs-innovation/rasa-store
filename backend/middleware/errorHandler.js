/**
 * Centralized API error responses — never leak stack traces in production.
 */

const isProd = () =>
  String(process.env.NODE_ENV || "").toLowerCase() === "production" ||
  String(process.env.PHONEPE_ENV || "").toLowerCase() === "production";

const AppError = class AppError extends Error {
  constructor(message, { status = 400, code = "BAD_REQUEST", details = undefined } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.originalUrl} not found`,
  });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = Number(err.status || err.statusCode || 500);
  const code =
    err.code && typeof err.code === "string" && !String(err.code).startsWith("ERR_")
      ? err.code
      : status >= 500
      ? "INTERNAL_ERROR"
      : "BAD_REQUEST";

  // CORS rejection
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      code: "CORS_DENIED",
      message: "Origin not allowed.",
    });
  }

  const payload = {
    success: false,
    code,
    message:
      status >= 500 && isProd()
        ? "Something went wrong. Please try again."
        : err.message || "Request failed.",
  };

  if (err.details && !isProd()) payload.details = err.details;
  if (req.correlationId) payload.correlationId = req.correlationId;

  if (status >= 500) {
    console.error("[API ERROR]", {
      code,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      correlationId: req.correlationId,
      stack: isProd() ? undefined : err.stack,
    });

    // Optional Sentry
    try {
      const { captureException } = require("../lib/monitoring/sentry");
      captureException(err, {
        path: req.originalUrl,
        method: req.method,
        correlationId: req.correlationId,
      });
    } catch (_) {}
  }

  res.status(status).json(payload);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  isProd,
};

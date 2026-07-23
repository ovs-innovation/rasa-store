/**
 * Optional Sentry crash monitoring.
 * Set SENTRY_DSN in .env to enable. Safe no-op if package/DSN missing.
 */

let Sentry = null;
let enabled = false;

const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("Sentry: disabled (SENTRY_DSN not set)");
    return;
  }

  try {
    // Lazy require — install with: npm i @sentry/node
    Sentry = require("@sentry/node");
    Sentry.init({
      dsn,
      environment:
        process.env.SENTRY_ENV ||
        process.env.NODE_ENV ||
        process.env.PHONEPE_ENV ||
        "production",
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    });
    enabled = true;
    if (app && Sentry.Handlers?.requestHandler) {
      app.use(Sentry.Handlers.requestHandler());
    }
    console.log("Sentry: enabled");
  } catch (err) {
    console.warn(
      "Sentry: DSN set but @sentry/node not installed. Run: npm i @sentry/node"
    );
  }
};

const captureException = (err, extra = {}) => {
  if (!enabled || !Sentry) return;
  Sentry.withScope((scope) => {
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null) scope.setExtra(k, v);
    });
    Sentry.captureException(err);
  });
};

const captureMessage = (message, level = "info", extra = {}) => {
  if (!enabled || !Sentry) return;
  Sentry.withScope((scope) => {
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null) scope.setExtra(k, v);
    });
    Sentry.captureMessage(message, level);
  });
};

module.exports = {
  initSentry,
  captureException,
  captureMessage,
};

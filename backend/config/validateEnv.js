/**
 * Fail-closed environment validation for production-critical integrations.
 * Never start the HTTP server if required PhonePe config is missing.
 */

const REQUIRED_PHONEPE_VARS = [
  "PHONEPE_CLIENT_ID",
  "PHONEPE_CLIENT_SECRET",
  "PHONEPE_CLIENT_VERSION",
  "PHONEPE_ENV",
  "PHONEPE_WEBHOOK_USERNAME",
  "PHONEPE_WEBHOOK_PASSWORD",
];

const isTruthyEnabled = (value) => {
  if (value == null || value === "") return true; // default enabled
  return !["false", "0", "no", "off"].includes(String(value).toLowerCase());
};

/**
 * @param {{ exit?: boolean }} [options]
 * @returns {{ ok: boolean, missing: string[], phonepeRequired: boolean }}
 */
const validateRequiredEnv = ({ exit = true } = {}) => {
  const phonepeRequired = isTruthyEnabled(process.env.PHONEPE_ENABLED);
  const missing = [];

  if (phonepeRequired) {
    for (const key of REQUIRED_PHONEPE_VARS) {
      const val = process.env[key];
      if (val == null || String(val).trim() === "") {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    console.error("============================================================");
    console.error("[FATAL] Backend refused to start — missing required env vars");
    console.error("Missing:");
    for (const key of missing) {
      console.error(`  - ${key}`);
    }
    console.error("");
    console.error("PhonePe config must be injected at container create time.");
    console.error("On the VPS, put secrets in: backend/.env (never commit)");
    console.error("Then recreate: docker compose up -d --force-recreate backend");
    console.error("See: docs/DEPLOYMENT_SECRETS.md");
    console.error("============================================================");

    if (exit) {
      process.exit(1);
    }
  } else if (phonepeRequired) {
    console.log(
      `[env] PhonePe configured (env=${process.env.PHONEPE_ENV}, clientId=${String(
        process.env.PHONEPE_CLIENT_ID || ""
      ).slice(0, 6)}…)`
    );
  } else {
    console.warn("[env] PHONEPE_ENABLED=false — PhonePe credential check skipped");
  }

  return { ok: missing.length === 0, missing, phonepeRequired };
};

const getPublicConfigStatus = () => {
  const present = (key) => {
    const v = process.env[key];
    return Boolean(v != null && String(v).trim() !== "");
  };

  const phonepeConfigured =
    isTruthyEnabled(process.env.PHONEPE_ENABLED) &&
    REQUIRED_PHONEPE_VARS.every(present);

  const resendConfigured = present("RESEND_API_KEY");
  const smtpConfigured =
    present("EMAIL_USER") && present("EMAIL_PASS");

  return {
    phonepeConfigured,
    resendConfigured,
    smtpConfigured,
    phonepeEnabled: isTruthyEnabled(process.env.PHONEPE_ENABLED),
    nodeEnv: process.env.NODE_ENV || "development",
  };
};

module.exports = {
  REQUIRED_PHONEPE_VARS,
  validateRequiredEnv,
  getPublicConfigStatus,
};

const crypto = require("crypto");

const isProduction = () =>
  String(process.env.PHONEPE_ENV || "production").toLowerCase() !== "sandbox";

const getConfig = () => {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = String(process.env.PHONEPE_CLIENT_VERSION || "1");
  const merchantId = process.env.PHONEPE_MERCHANT_ID || "";
  const enabled = String(process.env.PHONEPE_ENABLED || "true") === "true";

  if (!clientId || !clientSecret) {
    throw new Error("PhonePe credentials missing in environment variables.");
  }

  return {
    enabled,
    clientId,
    clientSecret,
    clientVersion,
    merchantId,
    isProduction: isProduction(),
    authUrl: isProduction()
      ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
    payUrl: isProduction()
      ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
    statusBaseUrl: isProduction()
      ? "https://api.phonepe.com/apis/pg/checkout/v2/order"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order",
    webhookUsername: process.env.PHONEPE_WEBHOOK_USERNAME || "",
    webhookPassword: process.env.PHONEPE_WEBHOOK_PASSWORD || "",
  };
};

const generateMerchantOrderId = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  // PhonePe: max 63 chars, only underscore/hyphen special chars
  return `RASA-${stamp}-${rand}`;
};

const toPaise = (amountInr) => Math.round(Number(amountInr) * 100);

const verifyWebhookAuthorization = (authorizationHeader) => {
  const { webhookUsername, webhookPassword } = getConfig();
  if (!webhookUsername || !webhookPassword) {
    return false;
  }
  const expected = crypto
    .createHash("sha256")
    .update(`${webhookUsername}:${webhookPassword}`)
    .digest("hex");

  const incoming = String(authorizationHeader || "")
    .replace(/^SHA256\s+/i, "")
    .replace(/^Bearer\s+/i, "")
    .trim();

  if (!incoming || incoming.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(incoming),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
};

module.exports = {
  getConfig,
  generateMerchantOrderId,
  toPaise,
  verifyWebhookAuthorization,
  isProduction,
};

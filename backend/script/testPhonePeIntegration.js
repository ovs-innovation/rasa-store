/**
 * Smoke-test PhonePe production credentials + module wiring.
 * Run: node backend/script/testPhonePeIntegration.js
 * Does NOT charge money — only OAuth token + status endpoint wiring.
 */
require("../config/env");
const assert = require("assert");

async function main() {
  console.log("=== PhonePe Integration Smoke Test ===\n");

  const required = [
    "PHONEPE_CLIENT_ID",
    "PHONEPE_CLIENT_SECRET",
    "PHONEPE_CLIENT_VERSION",
    "PHONEPE_WEBHOOK_USERNAME",
    "PHONEPE_WEBHOOK_PASSWORD",
  ];

  for (const key of required) {
    assert(process.env[key], `Missing env: ${key}`);
    console.log(`✓ ${key} present`);
  }

  assert.strictEqual(
    process.env.PHONEPE_CLIENT_ID,
    "SU2607211838078335728922",
    "Client ID mismatch"
  );
  console.log("✓ Client ID matches dashboard value");

  const {
    getConfig,
    verifyWebhookAuthorization,
    generateMerchantOrderId,
    toPaise,
  } = require("../modules/payment/utils/phonepeConfig");
  const { getAccessToken, clearTokenCache } = require("../modules/payment/service/phonepeClient");
  const crypto = require("crypto");

  const cfg = getConfig();
  assert(cfg.enabled, "PhonePe should be enabled");
  assert(cfg.isProduction, "Expected production env");
  console.log("✓ Config loaded (production)");

  const moid = generateMerchantOrderId();
  assert(/^[A-Za-z0-9_-]+$/.test(moid));
  assert(moid.length <= 63);
  console.log("✓ merchantOrderId format:", moid);

  assert.strictEqual(toPaise(1299), 129900);
  console.log("✓ toPaise OK");

  const expectedAuth = crypto
    .createHash("sha256")
    .update(
      `${process.env.PHONEPE_WEBHOOK_USERNAME}:${process.env.PHONEPE_WEBHOOK_PASSWORD}`
    )
    .digest("hex");
  assert(verifyWebhookAuthorization(expectedAuth));
  assert(verifyWebhookAuthorization(`SHA256 ${expectedAuth}`));
  assert(!verifyWebhookAuthorization("invalid"));
  console.log("✓ Webhook SHA256 auth verification OK");

  clearTokenCache();
  console.log("\nRequesting PhonePe OAuth token (production)...");
  const token = await getAccessToken();
  assert(token && token.length > 20, "access_token too short/missing");
  console.log("✓ OAuth access_token received (length:", token.length + ")");

  // Second call should use cache
  const token2 = await getAccessToken();
  assert.strictEqual(token, token2);
  console.log("✓ Token cache works");

  console.log("\n✅ All PhonePe smoke tests passed.");
  console.log("\nNext (manual on live site):");
  console.log("1. Deploy backend with these env vars");
  console.log("2. PhonePe Dashboard → Webhooks:");
  console.log("   URL: https://<your-api>/api/webhooks/phonepe");
  console.log("   Auth: SHA");
  console.log("   Username/Password: same as PHONEPE_WEBHOOK_* in .env");
  console.log("3. Place a small live order via UPI / PhonePe on checkout");
}

main().catch((err) => {
  console.error("\n❌ PhonePe smoke test failed:");
  console.error(err?.response?.data || err.message || err);
  process.exit(1);
});

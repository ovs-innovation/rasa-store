/**
 * Hardening smoke tests (no live charge).
 * Run: node backend/script/testPaymentHardening.js
 */
require("../config/env");
const assert = require("assert");
const crypto = require("crypto");
const { connectDB } = require("../config/db");
const mongoose = require("mongoose");

async function main() {
  console.log("=== Payment Hardening Smoke Test ===\n");

  const { createCorrelationId, buildValidatedCheckout } = require("../modules/payment/service/cartPricing");
  const { registerWebhookEvent, writeAuditLog, hashPayload } = require("../modules/payment/service/auditService");
  const { reduceStockAtomic } = require("../lib/stock-controller/others");

  const cid = createCorrelationId();
  assert(cid.startsWith("req_"));
  console.log("✓ correlationId:", cid);

  const h1 = hashPayload({ a: 1, b: "x" });
  const h2 = hashPayload({ a: 1, b: "x" });
  assert.strictEqual(h1, h2);
  console.log("✓ payload hash stable");

  await connectDB();

  const eventId = `test_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const first = await registerWebhookEvent({
    gateway: "PhonePe",
    eventId,
    eventType: "checkout.order.completed",
    merchantOrderId: "RASA-TEST",
    payload: { state: "COMPLETED", orderId: "OMO1" },
  });
  assert.strictEqual(first.duplicate, false);
  const second = await registerWebhookEvent({
    gateway: "PhonePe",
    eventId,
    eventType: "checkout.order.completed",
    merchantOrderId: "RASA-TEST",
    payload: { state: "COMPLETED", orderId: "OMO1" },
  });
  assert.strictEqual(second.duplicate, true);
  console.log("✓ webhook replay protection");

  await writeAuditLog({
    actorType: "System",
    action: "hardening.smoke_test",
    entityType: "Other",
    correlationId: cid,
    message: "smoke test",
    success: true,
  });
  console.log("✓ audit log write");

  // Empty cart should fail validation
  const bad = await buildValidatedCheckout({ cart: [] });
  assert.strictEqual(bad.ok, false);
  console.log("✓ empty cart rejected");

  // If products exist, validate one
  const Product = require("../models/Product");
  const product = await Product.findOne({}).lean();
  if (product) {
    const price = Number(product.prices?.price || product.prices?.originalPrice || 0);
    if (price > 0) {
      const good = await buildValidatedCheckout({
        cart: [
          {
            _id: product._id,
            title: product.title,
            quantity: 1,
            price: price + 500, // tampered client price — backend should ignore
          },
        ],
        shippingCost: 0,
        clientTotal: price, // expect server total = product price
      });
      assert.strictEqual(good.ok, true, good.message);
      assert.strictEqual(good.pricing.total, price);
      assert.strictEqual(good.snapshot[0].price, price);
      console.log("✓ backend price freeze / total recalc (ignored client price inflate)");
    } else {
      console.log("~ skipped price freeze (product has no price)");
    }
  } else {
    console.log("~ skipped product validation (no products in DB)");
  }

  // reduceStockAtomic should throw on empty
  let threw = false;
  try {
    await reduceStockAtomic([]);
  } catch {
    threw = true;
  }
  assert(threw);
  console.log("✓ atomic stock throws on empty cart");

  await mongoose.connection.close();
  console.log("\n✅ Hardening smoke tests passed.");
}

main().catch(async (err) => {
  console.error("\n❌ Hardening test failed:", err);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});

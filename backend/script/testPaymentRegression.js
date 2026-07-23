/**
 * Payment flow regression suite (no live PhonePe charge).
 *
 * Covers:
 *  - successful fulfillment
 *  - failed payment marking
 *  - duplicate fulfill / callback idempotency
 *  - concurrent claim (lock contention)
 *  - invalid ObjectId in PaymentLog / AuditLog
 *  - amount mismatch
 *  - stock failure → never Success
 *  - email failure → still paid (non-critical)
 *  - webhook dedupe + unprocessed retry
 *
 * Run: node backend/script/testPaymentRegression.js
 */
require("../config/env");
const assert = require("assert");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");

const PREFIX = `REGTEST-${Date.now().toString(36).toUpperCase()}`;

async function main() {
  console.log("=== Payment Regression Suite ===\n");
  await connectDB();

  const Order = require("../models/Order");
  const Payment = require("../models/Payment");
  const Product = require("../models/Product");
  const PaymentLog = require("../models/PaymentLog");
  const AuditLog = require("../models/AuditLog");
  const WebhookEvent = require("../models/WebhookEvent");
  const {
    fulfillSuccessfulPayment,
    markPaymentFailed,
    claimFulfillment,
  } = require("../modules/payment/service/paymentFulfillment");
  const { writePaymentLog, toObjectIdString } = require("../modules/payment/service/paymentLogger");
  const {
    writeAuditLog,
    registerWebhookEvent,
    markWebhookProcessed,
    markWebhookFailed,
  } = require("../modules/payment/service/auditService");
  const { verifyWebhookAuthorization } = require("../modules/payment/utils/phonepeConfig");

  const ctrlPath = require.resolve("../controller/customerOrderController");
  const originalCtrl = require.cache[ctrlPath];
  // Default: never send real emails during regression
  require.cache[ctrlPath] = {
    id: ctrlPath,
    filename: ctrlPath,
    loaded: true,
    exports: {
      ...(originalCtrl?.exports || {}),
      sendOrderNotifications: async () => ({ stubbed: true }),
    },
  };

  const created = {
    products: [],
    orders: [],
    payments: [],
    logs: [],
    webhooks: [],
  };

  const cleanup = async () => {
    if (originalCtrl) require.cache[ctrlPath] = originalCtrl;
    else delete require.cache[ctrlPath];
    if (created.payments.length) {
      await Payment.deleteMany({ _id: { $in: created.payments } });
    }
    if (created.orders.length) {
      await Order.deleteMany({ _id: { $in: created.orders } });
    }
    if (created.products.length) {
      await Product.deleteMany({ _id: { $in: created.products } });
    }
    await PaymentLog.deleteMany({ merchantOrderId: new RegExp(`^${PREFIX}`) });
    await WebhookEvent.deleteMany({ eventId: new RegExp(`^${PREFIX}`) });
    await AuditLog.deleteMany({ correlationId: new RegExp(`^${PREFIX}`) });
  };

  const makeProduct = async (stock = 10) => {
    const id = new mongoose.Types.ObjectId();
    // Bypass heavy Product validators — only stock fields matter for fulfillment
    await Product.collection.insertOne({
      _id: id,
      title: { en: `${PREFIX}-product` },
      slug: `${PREFIX}-${id.toString()}`.toLowerCase(),
      sku: `${PREFIX}-SKU`,
      stock,
      sales: 0,
      prices: { price: 100, originalPrice: 100 },
      category: new mongoose.Types.ObjectId(),
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    created.products.push(id);
    return { _id: id, stock };
  };

  const makeOrderPayment = async ({ stock = 10, amountPaise = 10000 } = {}) => {
    const product = await makeProduct(stock);
    const moid = `${PREFIX}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const order = await Order.create({
      user_info: {
        name: "Regression Tester",
        email: "regression@example.com",
        contact: "9999999999",
        address: "Test",
      },
      paymentMethod: "PhonePe",
      paymentStatus: "Pending",
      status: "Pending Payment",
      cart: [
        {
          _id: product._id,
          id: String(product._id),
          title: "Test item",
          quantity: 1,
          price: amountPaise / 100,
        },
      ],
      subTotal: amountPaise / 100,
      shippingCost: 0,
      discount: 0,
      total: amountPaise / 100,
      merchantOrderId: moid,
      correlationId: `${PREFIX}-cid`,
    });
    created.orders.push(order._id);

    const payment = await Payment.create({
      order: order._id,
      merchantOrderId: moid,
      gateway: "PhonePe",
      status: "Pending",
      amount: amountPaise / 100,
      amountPaise,
      currency: "INR",
      correlationId: `${PREFIX}-cid`,
      fulfillmentStatus: "none",
    });
    created.payments.push(payment._id);

    return { product, order, payment, moid };
  };

  const gatewayOk = (moid, amountPaise) => ({
    state: "COMPLETED",
    orderId: `OMO-${moid}`,
    amount: amountPaise,
    paymentDetails: [
      {
        transactionId: `TXN-${moid}`,
        paymentMode: "UPI",
      },
    ],
  });

  // ---- 1. Successful payment ----
  {
    const { product, order, payment, moid } = await makeOrderPayment({ stock: 5 });
    const beforeStock = (await Product.findById(product._id)).stock;
    const result = await fulfillSuccessfulPayment({
      merchantOrderId: moid,
      gatewayPayload: gatewayOk(moid, payment.amountPaise),
      source: "Verify",
      correlationId: `${PREFIX}-cid`,
    });
    assert.strictEqual(result.ok, true, "success ok");
    assert.strictEqual(result.paid, true, "success paid");
    const p = await Payment.findById(payment._id);
    const o = await Order.findById(order._id);
    const prod = await Product.findById(product._id);
    assert.strictEqual(p.status, "Success");
    assert.strictEqual(p.stockReduced, true);
    assert.strictEqual(p.fulfillmentStatus, "completed");
    assert.strictEqual(o.paymentStatus, "Paid");
    assert.strictEqual(prod.stock, beforeStock - 1);
    console.log("✓ successful payment fulfills payment+order+stock");
  }

  // ---- 2. Failed payment ----
  {
    const { order, payment, moid } = await makeOrderPayment();
    const result = await markPaymentFailed({
      merchantOrderId: moid,
      gatewayPayload: { state: "FAILED", orderId: "X" },
      source: "Webhook",
    });
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.paid, false);
    const p = await Payment.findById(payment._id);
    const o = await Order.findById(order._id);
    assert.strictEqual(p.status, "Failed");
    assert.strictEqual(o.paymentStatus, "Failed");
    console.log("✓ failed payment marks payment+order Failed");
  }

  // ---- 3. Duplicate callback / fulfill idempotency ----
  {
    const { product, payment, moid } = await makeOrderPayment({ stock: 8 });
    const payload = gatewayOk(moid, payment.amountPaise);
    const r1 = await fulfillSuccessfulPayment({
      merchantOrderId: moid,
      gatewayPayload: payload,
      source: "Verify",
    });
    const stockAfterFirst = (await Product.findById(product._id)).stock;
    const r2 = await fulfillSuccessfulPayment({
      merchantOrderId: moid,
      gatewayPayload: payload,
      source: "Webhook",
    });
    const stockAfterSecond = (await Product.findById(product._id)).stock;
    assert.strictEqual(r1.paid, true);
    assert.strictEqual(r2.paid, true);
    assert.strictEqual(r2.alreadyProcessed, true);
    assert.strictEqual(stockAfterFirst, stockAfterSecond, "stock deducted once");
    console.log("✓ duplicate fulfill is idempotent (stock once)");
  }

  // ---- 4. Concurrent claim lock ----
  {
    const { payment, moid } = await makeOrderPayment();
    const c1 = await claimFulfillment(moid, "Verify");
    assert.strictEqual(c1.reason, "claimed");
    const c2 = await claimFulfillment(moid, "Webhook");
    assert.strictEqual(c2.reason, "locked");
    // release so cleanup is clean
    await Payment.updateOne(
      { _id: payment._id },
      { $set: { fulfillmentStatus: "failed" } }
    );
    console.log("✓ concurrent claim returns lock contention");
  }

  // ---- 5. Invalid ObjectId never crashes logs ----
  {
    await writePaymentLog({
      payment: { totally: "wrong" },
      order: { nested: true },
      user: "not-an-id",
      merchantOrderId: `${PREFIX}-BADOID`,
      correlationId: `${PREFIX}-cid`,
      source: "System",
      action: "objectid_invalid_test",
      success: true,
      message: "should not cast-fail",
      response: { orderId: { oops: 1 } },
    });
    await writeAuditLog({
      actorType: "System",
      actorId: { bad: true },
      action: "regression.objectid",
      entityType: "Payment",
      entityId: { also: "bad" },
      correlationId: `${PREFIX}-cid`,
      before: { payment: { _id: new mongoose.Types.ObjectId() } },
      success: true,
    });
    assert.strictEqual(toObjectIdString({ a: 1 }), undefined);
    assert.strictEqual(toObjectIdString("zzzz"), undefined);
    console.log("✓ invalid ObjectId safe for PaymentLog + AuditLog");
  }

  // ---- 6. Amount mismatch → not Success ----
  {
    const { payment, moid } = await makeOrderPayment({ amountPaise: 10000 });
    const result = await fulfillSuccessfulPayment({
      merchantOrderId: moid,
      gatewayPayload: gatewayOk(moid, 99999),
      source: "Verify",
    });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.code, "AMOUNT_MISMATCH");
    assert.strictEqual(result.paid, false);
    const p = await Payment.findById(payment._id);
    assert.strictEqual(p.status, "Failed");
    console.log("✓ amount mismatch never marks Success");
  }

  // ---- 7. Stock failure → never Success ----
  {
    const { product, payment, moid } = await makeOrderPayment({ stock: 0 });
    const result = await fulfillSuccessfulPayment({
      merchantOrderId: moid,
      gatewayPayload: gatewayOk(moid, payment.amountPaise),
      source: "Verify",
    });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.code, "FULFILL_FAILED");
    assert.strictEqual(result.paid, false);
    const p = await Payment.findById(payment._id);
    assert.notStrictEqual(p.status, "Success");
    assert.strictEqual(p.fulfillmentStatus, "failed");
    assert.strictEqual(p.stockReduced, false);
    const prod = await Product.findById(product._id);
    assert.strictEqual(prod.stock, 0);
    console.log("✓ stock failure leaves payment unpaid (not Success)");
  }

  // ---- 8. Email failure is non-critical (paid stays true) ----
  {
    const { payment, moid } = await makeOrderPayment();
    // Force notifications path to throw by stubbing require target briefly
    const ctrlPath = require.resolve("../controller/customerOrderController");
    const original = require.cache[ctrlPath];
    require.cache[ctrlPath] = {
      id: ctrlPath,
      filename: ctrlPath,
      loaded: true,
      exports: {
        sendOrderNotifications: async () => {
          throw new Error("SMTP down");
        },
      },
    };
    try {
      const result = await fulfillSuccessfulPayment({
        merchantOrderId: moid,
        gatewayPayload: gatewayOk(moid, payment.amountPaise),
        source: "Verify",
      });
      assert.strictEqual(result.paid, true, "email failure must not un-pay");
      const p = await Payment.findById(payment._id);
      assert.strictEqual(p.status, "Success");
      assert.strictEqual(p.stockReduced, true);
      assert.strictEqual(p.notificationsSent, false);
      console.log("✓ email failure does not block paid=true");
    } finally {
      if (original) require.cache[ctrlPath] = original;
      else delete require.cache[ctrlPath];
    }
  }

  // ---- 9. Webhook dedupe + unprocessed retry ----
  {
    const eventId = `${PREFIX}-WH-${crypto.randomBytes(3).toString("hex")}`;
    const first = await registerWebhookEvent({
      gateway: "PhonePe",
      eventId,
      eventType: "checkout.order.completed",
      merchantOrderId: `${PREFIX}-W`,
      payload: { state: "COMPLETED" },
    });
    assert.strictEqual(first.duplicate, false);
    assert.strictEqual(first.processed, false);

    const dup = await registerWebhookEvent({
      gateway: "PhonePe",
      eventId,
      eventType: "checkout.order.completed",
      merchantOrderId: `${PREFIX}-W`,
      payload: { state: "COMPLETED" },
    });
    assert.strictEqual(dup.duplicate, true);
    assert.strictEqual(dup.processed, false);

    await markWebhookFailed(eventId, "FULFILL_FAILED");
    const still = await WebhookEvent.findOne({ eventId }).lean();
    assert.strictEqual(still.processed, false);

    await markWebhookProcessed(eventId, { success: true });
    const done = await WebhookEvent.findOne({ eventId }).lean();
    assert.strictEqual(done.processed, true);

    const dup2 = await registerWebhookEvent({
      gateway: "PhonePe",
      eventId,
      eventType: "checkout.order.completed",
      merchantOrderId: `${PREFIX}-W`,
      payload: { state: "COMPLETED" },
    });
    assert.strictEqual(dup2.duplicate, true);
    assert.strictEqual(dup2.processed, true);
    created.webhooks.push(eventId);
    console.log("✓ webhook dedupe + unprocessed retry flags");
  }

  // ---- 10. Webhook auth fail-closed ----
  {
    const prevUser = process.env.PHONEPE_WEBHOOK_USERNAME;
    const prevPass = process.env.PHONEPE_WEBHOOK_PASSWORD;
    process.env.PHONEPE_WEBHOOK_USERNAME = "whuser";
    process.env.PHONEPE_WEBHOOK_PASSWORD = "whpass";
    // Clear config cache by re-requiring is not needed — getConfig reads env each call
    const expected = crypto
      .createHash("sha256")
      .update("whuser:whpass")
      .digest("hex");
    assert.strictEqual(verifyWebhookAuthorization(expected), true);
    assert.strictEqual(verifyWebhookAuthorization("SHA256 " + expected), true);
    assert.strictEqual(verifyWebhookAuthorization("bad"), false);
    assert.strictEqual(verifyWebhookAuthorization(""), false);
    process.env.PHONEPE_WEBHOOK_USERNAME = prevUser;
    process.env.PHONEPE_WEBHOOK_PASSWORD = prevPass;
    console.log("✓ webhook SHA256 auth (timing-safe)");
  }

  // ---- 11. Partial DB: missing order → not paid ----
  {
    const moid = `${PREFIX}-NOORDER-${crypto.randomBytes(3).toString("hex")}`;
    const payment = await Payment.create({
      order: new mongoose.Types.ObjectId(),
      merchantOrderId: moid,
      gateway: "PhonePe",
      status: "Pending",
      amount: 50,
      amountPaise: 5000,
      fulfillmentStatus: "none",
    });
    created.payments.push(payment._id);
    const result = await fulfillSuccessfulPayment({
      merchantOrderId: moid,
      gatewayPayload: gatewayOk(moid, 5000),
      source: "Verify",
    });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.code, "ORDER_NOT_FOUND");
    assert.strictEqual(result.paid, false);
    console.log("✓ missing order never returns paid");
  }

  await cleanup();
  await mongoose.connection.close();
  console.log("\n✅ All payment regression tests passed.");
}

main().catch(async (err) => {
  console.error("\n❌ Regression failed:", err);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});

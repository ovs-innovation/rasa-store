require("../config/env");
const mongoose = require("mongoose");
const { buildValidatedCheckout } = require("../modules/payment/service/cartPricing");
const { createPayment } = require("../modules/payment/service/phonepeClient");
const {
  generateMerchantOrderId,
  toPaise,
} = require("../modules/payment/utils/phonepeConfig");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const p = await Product.findOne({}).select("_id title prices status").lean();
  if (!p) {
    console.log("NO_PRODUCT");
    process.exit(1);
  }
  console.log("product", String(p._id), "price", p.prices?.price, "status", p.status);

  const clientTotal = Number(p.prices?.price || 1299);
  const priced = await buildValidatedCheckout({
    cart: [
      {
        _id: p._id,
        id: String(p._id),
        title: p.title,
        price: clientTotal,
        quantity: 1,
      },
    ],
    shippingCost: 0,
    clientTotal,
  });
  console.log(
    "priced",
    priced.ok,
    priced.code || "",
    priced.message || "",
    priced.pricing?.total
  );

  if (!priced.ok) {
    await mongoose.disconnect();
    process.exit(1);
  }

  const merchantOrderId = generateMerchantOrderId();
  const correlationId = "req_local_test";
  const total = priced.pricing.total;
  const amountPaise = toPaise(total);

  try {
    const order = await Order.create({
      user_info: {
        name: "Test User",
        contact: "9876543210",
        phone: "9876543210",
        email: "test@example.com",
        address: "Test address line long",
        city: "Bangalore",
        zipCode: "560001",
        country: "India",
      },
      shippingOption: "Standard",
      paymentMethod: "PhonePe",
      paymentStatus: "Pending",
      status: "Pending Payment",
      cart: priced.frozenCart,
      cartSnapshot: priced.snapshot,
      pricingSnapshot: { ...priced.pricing, calculatedAt: new Date() },
      subTotal: priced.pricing.subTotal,
      shippingCost: priced.pricing.shippingCost,
      discount: priced.pricing.discount,
      coupon: priced.pricing.coupon,
      total,
      merchantOrderId,
      correlationId,
      user: null,
    });
    console.log("order_ok", String(order._id));

    const payment = await Payment.create({
      order: order._id,
      merchantOrderId,
      gateway: "PhonePe",
      status: "Created",
      amount: total,
      amountPaise,
      currency: "INR",
      correlationId,
    });
    console.log("payment_ok", String(payment._id));

    const redirectUrl = `https://therasastore.in/payment/phonepe/return?moid=${encodeURIComponent(
      merchantOrderId
    )}`;
    const gw = await createPayment({
      merchantOrderId,
      amountPaise,
      redirectUrl,
      message: `RASA order #${order.invoice}`,
      metaInfo: {
        udf1: String(order._id),
        udf2: String(order.invoice || ""),
        udf3: "9876543210",
        udf4: correlationId.slice(0, 50),
      },
    });
    console.log("gateway_ok", gw?.state, Boolean(gw?.redirectUrl));

    // cleanup test records
    await Payment.deleteOne({ _id: payment._id });
    await Order.deleteOne({ _id: order._id });
    console.log("cleanup_ok");
  } catch (err) {
    console.error(
      "FLOW_FAIL",
      err.name,
      err.message,
      err.response?.data || err.errors || ""
    );
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

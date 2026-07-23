const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    merchantOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ["PhonePe", "RazorPay", "Cash", "Stripe"],
      default: "PhonePe",
    },
    gatewayOrderId: { type: String, default: "", index: true },
    gatewayPaymentId: { type: String, default: "", index: true },
    status: {
      type: String,
      enum: ["Created", "Pending", "Success", "Failed", "Refunded"],
      default: "Created",
      index: true,
    },
    amount: { type: Number, required: true }, // INR
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, default: "" },
    redirectUrl: { type: String, default: "" },
    stockReduced: { type: Boolean, default: false },
    notificationsSent: { type: Boolean, default: false },
    correlationId: { type: String, default: "", index: true },
    paidAt: { type: Date },
    failedAt: { type: Date },
    rawGatewayResponse: { type: Object, default: {} },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);

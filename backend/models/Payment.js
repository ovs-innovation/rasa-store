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
    /**
     * Separate from gateway `status` — serializes fulfillment work.
     * Atomic claim: none|failed → processing → completed
     * Stale `processing` locks older than FULFILL_LOCK_TTL_MS may be reclaimed.
     */
    fulfillmentStatus: {
      type: String,
      enum: ["none", "processing", "completed", "failed"],
      default: "none",
      index: true,
    },
    fulfillmentStartedAt: { type: Date },
    fulfillmentCompletedAt: { type: Date },
    fulfillmentError: { type: String, default: "" },
    fulfillmentSource: { type: String, default: "" },
    amount: { type: Number, required: true }, // INR
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, default: "" },
    redirectUrl: { type: String, default: "" },
    stockReduced: { type: Boolean, default: false },
    notificationsSent: { type: Boolean, default: false },
    notificationClaimedAt: { type: Date },
    correlationId: { type: String, default: "", index: true },
    paidAt: { type: Date },
    failedAt: { type: Date },
    rawGatewayResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ fulfillmentStatus: 1, fulfillmentStartedAt: 1 });

module.exports = mongoose.model("Payment", paymentSchema);

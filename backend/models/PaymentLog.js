const mongoose = require("mongoose");

const paymentLogSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: false,
      index: true,
    },
    merchantOrderId: { type: String, default: "", index: true },
    correlationId: { type: String, default: "", index: true },
    source: {
      type: String,
      enum: ["API", "Webhook", "Verify", "System", "Error"],
      required: true,
    },
    action: { type: String, required: true },
    success: { type: Boolean, default: true },
    message: { type: String, default: "" },
    request: { type: Object, default: {} },
    response: { type: Object, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PaymentLog", paymentLogSchema);

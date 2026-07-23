const mongoose = require("mongoose");

const paymentLogSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: false,
      index: true,
      // Guard against accidental document/object assignment
      set(value) {
        if (value == null || value === "") return undefined;
        if (value instanceof mongoose.Types.ObjectId) return value;
        if (typeof value === "object" && value._id) {
          const id = value._id;
          if (id instanceof mongoose.Types.ObjectId) return id;
          const str = String(id);
          return /^[a-fA-F0-9]{24}$/.test(str) ? str : undefined;
        }
        if (typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value)) {
          return value;
        }
        return undefined;
      },
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
    request: { type: mongoose.Schema.Types.Mixed, default: {} },
    response: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PaymentLog", paymentLogSchema);

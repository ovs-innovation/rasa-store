const mongoose = require("mongoose");

/**
 * Strict ObjectId setter — never throws CastError for bad input.
 * Invalid values become undefined (field omitted).
 */
const safeObjectIdSetter = (value) => {
  if (value == null || value === "") return undefined;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === "object") {
    if (value._id != null) return safeObjectIdSetter(value._id);
    return undefined;
  }
  const str = String(value).trim();
  if (!/^[a-fA-F0-9]{24}$/.test(str)) return undefined;
  try {
    return new mongoose.Types.ObjectId(str);
  } catch {
    return undefined;
  }
};

const paymentLogSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: false,
      index: true,
      set: safeObjectIdSetter,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
      index: true,
      set: safeObjectIdSetter,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      index: true,
      set: safeObjectIdSetter,
    },
    merchantOrderId: { type: String, default: "", index: true },
    correlationId: { type: String, default: "", index: true },
    transactionId: { type: String, default: "", index: true },
    source: {
      type: String,
      enum: ["API", "Webhook", "Verify", "System", "Error"],
      required: true,
    },
    action: { type: String, required: true },
    step: { type: String, default: "" },
    durationMs: { type: Number, default: null },
    success: { type: Boolean, default: true },
    message: { type: String, default: "" },
    errorStack: { type: String, default: "" },
    request: { type: mongoose.Schema.Types.Mixed, default: {} },
    response: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentLogSchema.index({ createdAt: -1 });
paymentLogSchema.index({ action: 1, createdAt: -1 });
// Soft dedupe aid for high-volume identical system events (not unique — intentional)
paymentLogSchema.index({ merchantOrderId: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("PaymentLog", paymentLogSchema);

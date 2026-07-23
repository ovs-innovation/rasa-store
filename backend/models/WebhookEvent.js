const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    gateway: { type: String, default: "PhonePe", index: true },
    eventId: { type: String, required: true },
    eventType: { type: String, default: "" },
    merchantOrderId: { type: String, default: "", index: true },
    payloadHash: { type: String, required: true },
    processed: { type: Boolean, default: false },
    receivedAt: { type: Date, default: Date.now },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

webhookEventSchema.index({ gateway: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ payloadHash: 1 });

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);

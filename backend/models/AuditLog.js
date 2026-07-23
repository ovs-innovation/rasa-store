const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["System", "Customer", "Admin", "Webhook", "Gateway"],
      default: "System",
      index: true,
    },
    actorId: { type: String, default: "" },
    actorName: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: [
        "Order",
        "Payment",
        "Product",
        "Coupon",
        "Inventory",
        "User",
        "Settings",
        "Webhook",
        "Other",
      ],
      default: "Other",
      index: true,
    },
    entityId: { type: String, default: "", index: true },
    correlationId: { type: String, default: "", index: true },
    before: { type: Object, default: {} },
    after: { type: Object, default: {} },
    meta: { type: Object, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    success: { type: Boolean, default: true },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

const mongoose = require("mongoose");

const customerNotificationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PushNotification",
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    clickAction: { type: String, default: "/" },
    notificationType: { type: String, default: "general" },
    channels: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true,
    },
  },
  { timestamps: true }
);

customerNotificationSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model(
  "CustomerNotification",
  customerNotificationSchema
);

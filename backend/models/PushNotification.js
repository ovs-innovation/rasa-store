const mongoose = require("mongoose");

const pushNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    notificationType: {
      type: String,
      enum: ["general", "offer", "announcement", "order"],
      default: "general",
    },
    target: {
      type: String,
      required: true,
      enum: ["Customer", "Store", "Driver", "All", "Single"],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    zone: {
      type: String,
      required: false,
      default: "All",
    },
    status: {
      type: String,
      required: false,
      default: "show",
      enum: ["show", "hide"],
    },
    channels: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
    clickAction: {
      type: String,
      required: false,
    },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    pushSentCount: { type: Number, default: 0 },
    smsSentCount: { type: Number, default: 0 },
    emailSentCount: { type: Number, default: 0 },
    deliverySummary: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const PushNotification = mongoose.model("PushNotification", pushNotificationSchema);

module.exports = PushNotification;

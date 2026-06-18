const PushNotification = require("../models/PushNotification");
const Setting = require("../models/Setting");
const { dispatchCampaign } = require("../lib/notification-dispatch");

const getShopName = async () => {
  try {
    const globalSetting = await Setting.findOne({ name: "globalSetting" });
    return globalSetting?.setting?.shop_name || "RASA";
  } catch {
    return "RASA";
  }
};

const addPushNotification = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      target,
      zone,
      clickAction,
      status,
      customerId,
      notificationType,
      channels,
    } = req.body;

    if (target === "Single" && !customerId) {
      return res.status(400).send({
        message: "Select a customer when target is Single.",
      });
    }

    const channelFlags = {
      push: channels?.push !== false,
      sms: channels?.sms !== false,
      email: channels?.email !== false,
    };

    if (!channelFlags.push && !channelFlags.sms && !channelFlags.email) {
      return res.status(400).send({
        message: "Enable at least one channel: Push, SMS, or Email.",
      });
    }

    const shopName = await getShopName();

    const newNotification = new PushNotification({
      title,
      description,
      image,
      target,
      zone: zone || "All",
      clickAction,
      status: status || "show",
      customerId: target === "Single" ? customerId : undefined,
      notificationType: notificationType || "general",
      channels: channelFlags,
    });

    await newNotification.save();

    const delivery = await dispatchCampaign({
      title,
      description,
      image,
      clickAction,
      target,
      customerId,
      channels: channelFlags,
      shopName,
      notificationType: notificationType || "general",
      campaignId: newNotification._id,
    });

    newNotification.recipientCount = delivery.recipientCount;
    newNotification.pushSentCount = delivery.push?.sent || 0;
    newNotification.smsSentCount = delivery.sms?.sent || 0;
    newNotification.emailSentCount = delivery.email?.sent || 0;
    newNotification.sentCount =
      (delivery.push?.sent || 0) +
      (delivery.sms?.sent || 0) +
      (delivery.email?.sent || 0);
    newNotification.deliverySummary = delivery.message;
    await newNotification.save();

    res.status(200).send({
      message: delivery.message,
      data: newNotification,
      recipientCount: delivery.recipientCount,
      sentCount: newNotification.sentCount,
      pushSentCount: newNotification.pushSentCount,
      smsSentCount: newNotification.smsSentCount,
      emailSentCount: newNotification.emailSentCount,
      inboxCreated: delivery.inboxCreated || 0,
      push: delivery.push,
      sms: delivery.sms,
      email: delivery.email,
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).send({
      message: err.message || "Failed to send notification",
    });
  }
};

const getAllPushNotifications = async (req, res) => {
  try {
    const notifications = await PushNotification.find({})
      .sort({ createdAt: -1 })
      .populate("customerId", "name email phone");
    res.status(200).send(notifications);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getPushNotificationById = async (req, res) => {
  try {
    const notification = await PushNotification.findById(req.params.id).populate(
      "customerId",
      "name email phone"
    );
    res.status(200).send(notification);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updatePushNotification = async (req, res) => {
  try {
    const notification = await PushNotification.findById(req.params.id);
    if (!notification) {
      return res.status(404).send({ message: "Notification not found" });
    }

    notification.title = req.body.title || notification.title;
    notification.description = req.body.description || notification.description;
    notification.image = req.body.image ?? notification.image;
    notification.target = req.body.target || notification.target;
    notification.zone = req.body.zone || notification.zone;
    notification.status = req.body.status || notification.status;
    notification.notificationType =
      req.body.notificationType || notification.notificationType;

    const updatedNotification = await notification.save();
    res.status(200).send({
      message: "Notification updated successfully!",
      data: updatedNotification,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;
    await PushNotification.findByIdAndUpdate(req.params.id, {
      $set: { status: newStatus },
    });
    res.status(200).send({
      message: `Notification status updated to ${newStatus}!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deletePushNotification = async (req, res) => {
  try {
    await PushNotification.deleteOne({ _id: req.params.id });
    res.status(200).send({
      message: "Notification deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const deleteManyPushNotifications = async (req, res) => {
  try {
    await PushNotification.deleteMany({ _id: { $in: req.body.ids } });
    res.status(200).send({
      message: "Selected notifications deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  addPushNotification,
  getAllPushNotifications,
  getPushNotificationById,
  updatePushNotification,
  updateStatus,
  deletePushNotification,
  deleteManyPushNotifications,
};

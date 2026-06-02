const admin = require("../config/firebase-admin");
const PushNotification = require("../models/PushNotification");
const Customer = require("../models/Customer");
const Admin = require("../models/Admin");

// Add a notification and send via FCM
const addPushNotification = async (req, res) => {
  try {
    const { title, description, image, target, zone, clickAction } = req.body;

    // 1. Save to database
    const newNotification = new PushNotification(req.body);
    await newNotification.save();

    // 2. Determine recipients based on target
    let tokens = [];
    
    if (target === "All") {
      const customers = await Customer.find({ fcmToken: { $exists: true, $ne: "" } }).select("fcmToken");
      const admins = await Admin.find({ fcmToken: { $exists: true, $ne: "" } }).select("fcmToken");
      tokens = [
        ...customers.map(c => c.fcmToken),
        ...admins.map(a => a.fcmToken)
      ];
    } else if (target === "Customer") {
      const customers = await Customer.find({ role: "customer", fcmToken: { $exists: true, $ne: "" } }).select("fcmToken");
      tokens = customers.map(c => c.fcmToken);
    } else if (target === "Store") {
      const vendors = await Customer.find({ role: "wholesaler", fcmToken: { $exists: true, $ne: "" } }).select("fcmToken");
      tokens = vendors.map(v => v.fcmToken);
    } else if (target === "Driver") {
      const drivers = await Admin.find({ role: "Driver", fcmToken: { $exists: true, $ne: "" } }).select("fcmToken");
      tokens = drivers.map(d => d.fcmToken);
    }

    // Filter out unique tokens
    tokens = [...new Set(tokens)];

    if (tokens.length > 0) {
      if (!admin.apps.length) {
        console.warn("Firebase Admin not initialized — cannot send FCM messages");
        return res.status(200).send({
          message:
            "Notification saved but Firebase Admin is not configured on the server. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to backend/.env",
          data: newNotification,
          sentCount: 0,
          recipientCount: tokens.length,
        });
      }

      // 3. Prepare FCM message
      const message = {
        notification: {
          title: title,
          body: description,
          ...(image && { imageUrl: image }),
        },
        data: {
          click_action: clickAction || "/",
          image: image || "",
          title: title || "",
          body: description || "",
          description: description || "",
        },
        tokens: tokens,
      };

      // 4. Send via Firebase Admin
      const response = await admin.messaging().sendEachForMulticast(message);
      
      newNotification.sentCount = response.successCount;
      await newNotification.save();

      console.log(`${response.successCount} messages were sent successfully`);
      
      if (response.failureCount > 0) {
        console.warn(`${response.failureCount} messages failed to send`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.warn(`Token ${idx} failed:`, resp.error?.message);
          }
        });
      }
    } else {
      console.warn(`No FCM tokens found for target: ${target}`);
    }

    res.status(200).send({
      message: tokens.length > 0
        ? "Push Notification sent successfully!"
        : "Notification saved but no devices registered. Ask users to allow notifications and log in.",
      data: newNotification,
      sentCount: newNotification.sentCount,
      recipientCount: tokens.length,
    });
  } catch (err) {
    console.error("Error sending push notification:", err);
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get all notifications
const getAllPushNotifications = async (req, res) => {
  try {
    const notifications = await PushNotification.find({}).sort({ createdAt: -1 });
    res.status(200).send(notifications);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get single notification
const getPushNotificationById = async (req, res) => {
  try {
    const notification = await PushNotification.findById(req.params.id);
    res.status(200).send(notification);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Update notification
const updatePushNotification = async (req, res) => {
  try {
    const notification = await PushNotification.findById(req.params.id);
    if (notification) {
      notification.title = req.body.title || notification.title;
      notification.description = req.body.description || notification.description;
      notification.image = req.body.image || notification.image;
      notification.target = req.body.target || notification.target;
      notification.zone = req.body.zone || notification.zone;
      notification.status = req.body.status || notification.status;
      
      const updatedNotification = await notification.save();
      res.status(200).send({
        message: "Push Notification updated successfully!",
        data: updatedNotification,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;
    await PushNotification.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { status: newStatus } }
    );
    res.status(200).send({
      message: `Push Notification status updated to ${newStatus}!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Delete single notification
const deletePushNotification = async (req, res) => {
  try {
    await PushNotification.deleteOne({ _id: req.params.id });
    res.status(200).send({
      message: "Push Notification deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Delete many
const deleteManyPushNotifications = async (req, res) => {
  try {
    await PushNotification.deleteMany({ _id: { $in: req.body.ids } });
    res.status(200).send({
      message: "Selected Push Notifications deleted successfully!",
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

const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../config/auth");
const {
  addPushNotification,
  getAllPushNotifications,
  getPushNotificationById,
  updatePushNotification,
  updateStatus,
  deletePushNotification,
  deleteManyPushNotifications,
} = require("../controller/pushNotificationController");

router.use(isAuth, isAdmin);

router.post("/add", addPushNotification);

// Get all push notifications
router.get("/", getAllPushNotifications);

// Get a push notification by id
router.get("/:id", getPushNotificationById);

// Update a push notification
router.put("/:id", updatePushNotification);

// Update status
router.put("/status/:id", updateStatus);

// Delete a push notification
router.delete("/:id", deletePushNotification);

// Delete many push notifications
router.patch("/delete-many", deleteManyPushNotifications);

module.exports = router;

const express = require("express");
const router = express.Router();
const { isAuth } = require("../config/auth");
const {
  getMyNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPublicAnnouncements,
} = require("../controller/customerNotificationController");

router.get("/announcements", getPublicAnnouncements);
router.get("/", isAuth, getMyNotifications);
router.get("/unread-count", isAuth, getUnreadCount);
router.put("/read-all", isAuth, markAllAsRead);
router.get("/:id", isAuth, getNotificationById);
router.put("/:id/read", isAuth, markAsRead);
router.delete("/:id", isAuth, deleteNotification);

module.exports = router;

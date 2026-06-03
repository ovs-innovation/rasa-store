const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const CustomerNotification = require("../models/CustomerNotification");
const PushNotification = require("../models/PushNotification");

const toCustomerObjectId = (userId) => {
  if (!userId) return null;
  try {
    return new mongoose.Types.ObjectId(String(userId));
  } catch {
    return null;
  }
};

const ensureCustomer = async (userId) => {
  const oid = toCustomerObjectId(userId);
  if (!oid) return null;
  return Customer.findById(oid).select("_id").lean();
};

const customerFilter = (userId) => ({ customerId: toCustomerObjectId(userId) });

const getMyNotifications = async (req, res) => {
  try {
    const customer = await ensureCustomer(req.user._id);
    if (!customer) {
      return res.status(403).send({ message: "Customer account required" });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = customerFilter(req.user._id);
    if (!filter.customerId) {
      return res.status(400).send({ message: "Invalid customer id" });
    }

    const [notifications, totalDoc, unreadCount] = await Promise.all([
      CustomerNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomerNotification.countDocuments(filter),
      CustomerNotification.countDocuments({
        ...filter,
        status: "unread",
      }),
    ]);

    res.status(200).send({
      notifications,
      totalDoc,
      unreadCount,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const customer = await ensureCustomer(req.user._id);
    if (!customer) {
      return res.status(403).send({ message: "Customer account required" });
    }

    const oid = toCustomerObjectId(req.user._id);
    if (!oid) {
      return res.status(400).send({ message: "Invalid customer id" });
    }

    const unreadCount = await CustomerNotification.countDocuments({
      customerId: oid,
      status: "unread",
    });

    res.status(200).send({ unreadCount });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const customer = await ensureCustomer(req.user._id);
    if (!customer) {
      return res.status(403).send({ message: "Customer account required" });
    }

    const oid = toCustomerObjectId(req.user._id);
    if (!oid) {
      return res.status(400).send({ message: "Invalid customer id" });
    }

    const updated = await CustomerNotification.findOneAndUpdate(
      { _id: req.params.id, customerId: oid },
      { $set: { status: "read" } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send({ message: "Notification not found" });
    }

    res.status(200).send({ message: "Marked as read", data: updated });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const customer = await ensureCustomer(req.user._id);
    if (!customer) {
      return res.status(403).send({ message: "Customer account required" });
    }

    const oid = toCustomerObjectId(req.user._id);
    if (!oid) {
      return res.status(400).send({ message: "Invalid customer id" });
    }

    const notification = await CustomerNotification.findOne({
      _id: req.params.id,
      customerId: oid,
    }).lean();

    if (!notification) {
      return res.status(404).send({ message: "Notification not found" });
    }

    res.status(200).send({ notification });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const customer = await ensureCustomer(req.user._id);
    if (!customer) {
      return res.status(403).send({ message: "Customer account required" });
    }

    const oid = toCustomerObjectId(req.user._id);
    if (!oid) {
      return res.status(400).send({ message: "Invalid customer id" });
    }

    const deleted = await CustomerNotification.findOneAndDelete({
      _id: req.params.id,
      customerId: oid,
    });

    if (!deleted) {
      return res.status(404).send({ message: "Notification not found" });
    }

    res.status(200).send({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const customer = await ensureCustomer(req.user._id);
    if (!customer) {
      return res.status(403).send({ message: "Customer account required" });
    }

    const oid = toCustomerObjectId(req.user._id);
    if (!oid) {
      return res.status(400).send({ message: "Invalid customer id" });
    }

    await CustomerNotification.updateMany(
      { customerId: oid, status: "unread" },
      { $set: { status: "read" } }
    );

    res.status(200).send({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

/** Latest marketing campaigns for homepage (no login required) */
const getPublicAnnouncements = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 10);
    const announcements = await PushNotification.find({
      status: { $in: ["show", "Show", "active", "Active"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title description image clickAction notificationType createdAt")
      .lean();

    res.status(200).send({ announcements });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  getMyNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPublicAnnouncements,
};

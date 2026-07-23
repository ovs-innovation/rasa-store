const crypto = require("crypto");
const AuditLog = require("../../../models/AuditLog");
const WebhookEvent = require("../../../models/WebhookEvent");
const { toObjectIdString, sanitize } = require("./paymentLogger");

/**
 * Never throw. entityId is always a string (never ObjectId cast).
 */
const writeAuditLog = async ({
  actorType = "System",
  actorId = "",
  actorName = "",
  action,
  entityType = "Other",
  entityId = "",
  correlationId = "",
  before = {},
  after = {},
  meta = {},
  ip = "",
  userAgent = "",
  success = true,
  message = "",
} = {}) => {
  try {
    if (!action) return;

    const allowedActors = ["System", "Customer", "Admin", "Webhook", "Gateway"];
    const allowedEntities = [
      "Order",
      "Payment",
      "Product",
      "Coupon",
      "Inventory",
      "User",
      "Settings",
      "Webhook",
      "Other",
    ];

    // actorId / entityId may arrive as ObjectId docs — coerce safely to string
    let safeActorId = "";
    if (actorId != null && actorId !== "") {
      const asOid = toObjectIdString(actorId);
      safeActorId = asOid || String(actorId).slice(0, 128);
    }

    let safeEntityId = "";
    if (entityId != null && entityId !== "") {
      const asOid = toObjectIdString(entityId);
      safeEntityId = asOid || String(entityId).slice(0, 128);
      // Strip accidental "[object Object]"
      if (safeEntityId === "[object Object]") safeEntityId = "";
    }

    await AuditLog.create({
      actorType: allowedActors.includes(actorType) ? actorType : "System",
      actorId: safeActorId,
      actorName: String(actorName || "").slice(0, 200),
      action: String(action).slice(0, 200),
      entityType: allowedEntities.includes(entityType) ? entityType : "Other",
      entityId: safeEntityId,
      correlationId: String(correlationId || "").slice(0, 128),
      before: sanitize(before) || {},
      after: sanitize(after) || {},
      meta: sanitize(meta) || {},
      ip: String(ip || "").slice(0, 128),
      userAgent: String(userAgent || "").slice(0, 500),
      success: Boolean(success),
      message: String(message || "").slice(0, 2000),
    });
  } catch (err) {
    console.error("AuditLog write failed (non-fatal):", err.message);
  }
};

const hashPayload = (payload) =>
  crypto
    .createHash("sha256")
    .update(typeof payload === "string" ? payload : JSON.stringify(payload || {}))
    .digest("hex");

/**
 * Returns { duplicate, eventId, processed, payloadHash }.
 * Unique index on (gateway, eventId) prevents double-insert races.
 */
const registerWebhookEvent = async ({
  gateway = "PhonePe",
  eventId,
  eventType = "",
  merchantOrderId = "",
  payload,
}) => {
  const payloadHash = hashPayload(payload);
  const id =
    eventId ||
    `${merchantOrderId || "unknown"}:${eventType || "event"}:${payloadHash.slice(0, 16)}`;

  const existing = await WebhookEvent.findOne({ gateway, eventId: id }).lean();
  if (existing) {
    return {
      duplicate: true,
      eventId: id,
      payloadHash,
      processed: Boolean(existing.processed),
    };
  }

  try {
    await WebhookEvent.create({
      gateway,
      eventId: id,
      eventType,
      merchantOrderId,
      payloadHash,
      processed: false,
      meta: { state: payload?.state || payload?.payload?.state || "" },
    });
    return { duplicate: false, eventId: id, payloadHash, processed: false };
  } catch (err) {
    if (err && (err.code === 11000 || String(err.message).includes("duplicate"))) {
      const raced = await WebhookEvent.findOne({ gateway, eventId: id }).lean();
      return {
        duplicate: true,
        eventId: id,
        payloadHash,
        processed: Boolean(raced?.processed),
      };
    }
    throw err;
  }
};

const markWebhookProcessed = async (eventId, { success = true, error = "" } = {}) => {
  if (!eventId) return;
  await WebhookEvent.updateOne(
    { eventId },
    {
      $set: {
        processed: true,
        meta: {
          processedAt: new Date(),
          success: Boolean(success),
          error: String(error || "").slice(0, 500),
        },
      },
    }
  ).catch(() => {});
};

/**
 * Leave event unprocessed so a later duplicate delivery can re-attempt fulfillment.
 */
const markWebhookFailed = async (eventId, error = "") => {
  if (!eventId) return;
  await WebhookEvent.updateOne(
    { eventId },
    {
      $set: {
        processed: false,
        meta: {
          lastErrorAt: new Date(),
          error: String(error || "").slice(0, 500),
        },
      },
    }
  ).catch(() => {});
};

module.exports = {
  writeAuditLog,
  registerWebhookEvent,
  markWebhookProcessed,
  markWebhookFailed,
  hashPayload,
  toObjectIdString,
};

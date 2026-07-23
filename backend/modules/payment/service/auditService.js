const crypto = require("crypto");
const AuditLog = require("../../../models/AuditLog");
const WebhookEvent = require("../../../models/WebhookEvent");

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
}) => {
  try {
    await AuditLog.create({
      actorType,
      actorId: String(actorId || ""),
      actorName: String(actorName || ""),
      action,
      entityType,
      entityId: String(entityId || ""),
      correlationId: String(correlationId || ""),
      before,
      after,
      meta,
      ip,
      userAgent: String(userAgent || "").slice(0, 500),
      success,
      message: String(message || "").slice(0, 2000),
    });
  } catch (err) {
    console.error("AuditLog write failed:", err.message);
  }
};

const hashPayload = (payload) =>
  crypto
    .createHash("sha256")
    .update(typeof payload === "string" ? payload : JSON.stringify(payload || {}))
    .digest("hex");

/**
 * Returns { duplicate: true } if this webhook was already seen.
 * Uses unique eventId when available, else payload hash.
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
    return { duplicate: true, eventId: id, payloadHash };
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
    return { duplicate: false, eventId: id, payloadHash };
  } catch (err) {
    if (err && (err.code === 11000 || String(err.message).includes("duplicate"))) {
      return { duplicate: true, eventId: id, payloadHash };
    }
    throw err;
  }
};

const markWebhookProcessed = async (eventId) => {
  if (!eventId) return;
  await WebhookEvent.updateOne(
    { eventId },
    { $set: { processed: true } }
  ).catch(() => {});
};

module.exports = {
  writeAuditLog,
  registerWebhookEvent,
  markWebhookProcessed,
  hashPayload,
};

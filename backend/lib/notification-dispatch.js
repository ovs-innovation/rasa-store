const admin = require("../config/firebase-admin");
const Customer = require("../models/Customer");
const Admin = require("../models/Admin");
const CustomerNotification = require("../models/CustomerNotification");
const { sendSMS } = require("./sms-sender/sender");
const { sendEmail } = require("./email-sender/sender");

const PLACEHOLDER_EMAIL_DOMAIN = "phone.farmacykart.com";
const FCM_BATCH_SIZE = 500;

const isPlaceholderEmail = (email) =>
  !!email && String(email).toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);

const isRealEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  return !isPlaceholderEmail(e);
};

const normalizePhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const hasPhone = (phone) => normalizePhone(phone).length === 10;

/**
 * Resolve audience for a campaign.
 */
async function resolveRecipients({ target, customerId }) {
  const select = "name email phone fcmToken role";

  if (target === "Single") {
    if (!customerId) return [];
    const one = await Customer.findById(customerId).select(select).lean();
    return one ? [one] : [];
  }

  if (target === "All") {
    const customers = await Customer.find({ status: { $ne: "Inactive" } })
      .select(select)
      .lean();
    const admins = await Admin.find({ status: { $ne: "Inactive" } })
      .select("name email phone fcmToken role")
      .lean();
    return [...customers, ...admins];
  }

  if (target === "Customer") {
    return Customer.find({
      role: { $ne: "wholesaler" },
      status: { $ne: "Inactive" },
    })
      .select(select)
      .lean();
  }

  if (target === "Store") {
    return Customer.find({ role: "wholesaler", status: { $ne: "Inactive" } })
      .select(select)
      .lean();
  }

  if (target === "Driver") {
    return Admin.find({ role: "Driver", status: { $ne: "Inactive" } })
      .select("name email phone fcmToken role")
      .lean();
  }

  return [];
}

const BRAND_LOGO_URL =
  process.env.BRAND_LOGO_URL ||
  "https://res.cloudinary.com/dse9adftu/image/upload/v1780479335/farmacykart/brand/logo.png";

function buildEmailHtml({ title, description, image, clickAction, shopName }) {
  const storeUrl = process.env.STORE_URL || process.env.FRONTEND_URL || "https://farmacykart.com";
  const link = clickAction || storeUrl;
  const imgBlock = image
    ? `<p style="text-align:center"><img src="${image}" alt="" style="max-width:100%;border-radius:8px" /></p>`
    : "";

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0">
    <p style="text-align:center;margin:0 0 16px"><img src="${BRAND_LOGO_URL}" alt="${shopName || "Farmacykart"}" style="height:48px;width:auto" /></p>
    <p style="color:#0f766e;font-weight:bold;margin:0 0 8px">${shopName || "Farmacykart"}</p>
    <h2 style="color:#0f172a;margin:0 0 12px">${title}</h2>
    ${imgBlock}
    <p style="color:#475569;line-height:1.6">${description}</p>
    <p style="margin-top:24px">
      <a href="${link}" style="background:#0d9488;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">View offer</a>
    </p>
  </div>
</body>
</html>`;
}

function buildSmsText({ title, description, clickAction }) {
  const storeUrl = process.env.STORE_URL || "https://farmacykart.com";
  const link = clickAction || storeUrl;
  const body = `${title}: ${description}`.slice(0, 140);
  return `${body} ${link}`.slice(0, 160);
}

async function sendPushToRecipients(recipients, { title, description, image, clickAction }) {
  const tokens = [
    ...new Set(
      recipients.map((r) => r.fcmToken).filter((t) => t && String(t).trim())
    ),
  ];

  if (!tokens.length) {
    return { sent: 0, failed: 0, tokens: 0, error: "No FCM tokens registered" };
  }

  if (!admin.apps.length) {
    return {
      sent: 0,
      failed: tokens.length,
      tokens: tokens.length,
      error: "Firebase Admin not configured on server",
    };
  }

  const dataPayload = {
    click_action: String(clickAction || "/"),
    image: String(image || ""),
    title: String(title || ""),
    body: String(description || ""),
    description: String(description || ""),
  };

  let sent = 0;
  let failed = 0;
  const invalidTokens = [];

  for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
    const batch = tokens.slice(i, i + FCM_BATCH_SIZE);
    const message = {
      notification: {
        title,
        body: description,
        ...(image ? { imageUrl: image } : {}),
      },
      data: dataPayload,
      tokens: batch,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      sent += response.successCount;
      failed += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === "messaging/invalid-registration-token" ||
            code === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(batch[idx]);
          }
        }
      });
    } catch (err) {
      console.error("[FCM] batch error:", err.message);
      failed += batch.length;
    }
  }

  if (invalidTokens.length) {
    await Customer.updateMany(
      { fcmToken: { $in: invalidTokens } },
      { $unset: { fcmToken: "" } }
    );
    await Admin.updateMany(
      { fcmToken: { $in: invalidTokens } },
      { $unset: { fcmToken: "" } }
    );
  }

  return { sent, failed, tokens: tokens.length, error: null };
}

async function sendSmsToRecipients(recipients, payload) {
  const smsText = buildSmsText(payload);
  const withPhone = recipients.filter((r) => hasPhone(r.phone));
  let sent = 0;
  let failed = 0;

  for (const r of withPhone) {
    const ok = await sendSMS(r.phone, smsText, {
      title: payload.title,
      message: payload.description,
      VAR1: payload.title,
      VAR2: payload.description,
    });
    if (ok) sent += 1;
    else failed += 1;
  }

  return {
    sent,
    failed,
    eligible: withPhone.length,
    skipped: recipients.length - withPhone.length,
  };
}

async function sendEmailsToRecipients(recipients, payload) {
  const shopName = payload.shopName || "Farmacykart";
  const html = buildEmailHtml({ ...payload, shopName });
  const text = `${payload.title}\n\n${payload.description}\n\n${payload.clickAction || ""}`;

  const withEmail = recipients.filter((r) => isRealEmail(r.email));
  let sent = 0;
  let failed = 0;

  for (const r of withEmail) {
    try {
      await sendEmail({
        to: r.email,
        subject: payload.title,
        html,
        text,
        emailType: "marketing-notification",
      });
      sent += 1;
    } catch (err) {
      console.warn(`[email] failed for ${r.email}:`, err.message);
      failed += 1;
    }
  }

  return {
    sent,
    failed,
    eligible: withEmail.length,
    skipped: recipients.length - withEmail.length,
  };
}

const INBOX_BATCH_SIZE = 500;

/**
 * Store in-app inbox rows for website customers (not admins/drivers).
 */
async function saveCustomerInboxNotifications(
  recipients,
  {
    title,
    description,
    image,
    clickAction,
    notificationType,
    channels,
    campaignId,
  }
) {
  if (!recipients?.length) return { created: 0 };

  const ids = recipients.map((r) => r._id).filter(Boolean);
  const customerIds = await Customer.find({ _id: { $in: ids } })
    .distinct("_id");

  if (!customerIds.length) return { created: 0 };

  const docs = customerIds.map((customerId) => ({
    customerId,
    campaignId: campaignId || undefined,
    title,
    description: description || "",
    image: image || "",
    clickAction: clickAction || "/",
    notificationType: notificationType || "general",
    channels: {
      push: channels?.push !== false,
      sms: channels?.sms !== false,
      email: channels?.email !== false,
    },
    status: "unread",
  }));

  let created = 0;
  for (let i = 0; i < docs.length; i += INBOX_BATCH_SIZE) {
    const batch = docs.slice(i, i + INBOX_BATCH_SIZE);
    const inserted = await CustomerNotification.insertMany(batch, {
      ordered: false,
    });
    created += inserted.length;
  }

  return { created };
}

/**
 * Dispatch campaign on selected channels.
 */
async function dispatchCampaign({
  title,
  description,
  image,
  clickAction,
  target,
  customerId,
  channels = {},
  shopName,
  notificationType,
  campaignId,
}) {
  const usePush = channels.push !== false;
  const useSms = channels.sms !== false;
  const useEmail = channels.email !== false;

  if (!usePush && !useSms && !useEmail) {
    throw new Error("Select at least one channel: Push, SMS, or Email");
  }

  const recipients = await resolveRecipients({ target, customerId });

  if (!recipients.length) {
    return {
      recipientCount: 0,
      push: { sent: 0, tokens: 0 },
      sms: { sent: 0, eligible: 0 },
      email: { sent: 0, eligible: 0 },
      message: "No recipients found for this target.",
    };
  }

  const payload = { title, description, image, clickAction, shopName };
  const result = {
    recipientCount: recipients.length,
    push: { sent: 0, failed: 0, tokens: 0, error: null },
    sms: { sent: 0, failed: 0, eligible: 0, skipped: 0 },
    email: { sent: 0, failed: 0, eligible: 0, skipped: 0 },
  };

  if (usePush) {
    result.push = await sendPushToRecipients(recipients, payload);
  }
  if (useSms) {
    result.sms = await sendSmsToRecipients(recipients, payload);
  }
  if (useEmail) {
    result.email = await sendEmailsToRecipients(recipients, payload);
  }

  const inbox = await saveCustomerInboxNotifications(recipients, {
    title,
    description,
    image,
    clickAction,
    notificationType,
    channels,
    campaignId,
  });
  result.inboxCreated = inbox.created;

  const anySent =
    result.push.sent > 0 || result.sms.sent > 0 || result.email.sent > 0;

  result.message = anySent
    ? `Sent: Push ${result.push.sent}, SMS ${result.sms.sent}, Email ${result.email.sent}`
    : "Saved but nothing was delivered. Check Firebase, MSG91, and email settings.";

  return result;
}

module.exports = {
  resolveRecipients,
  dispatchCampaign,
  saveCustomerInboxNotifications,
  isRealEmail,
  hasPhone,
};

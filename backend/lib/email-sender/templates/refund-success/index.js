const { getSupportEmail } = require("../../email-utils");
const { storeBaseUrl } = require("../../simple-templates");

const emailFooter = (shop, supportPhone) => {
  const support = getSupportEmail();
  const site = storeBaseUrl();
  const phoneLine = supportPhone
    ? `<br />Phone: <span style="color:#059669;">${supportPhone}</span>`
    : "";
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />
    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
      <strong>${shop}</strong><br />
      <a href="${site}" style="color:#059669;text-decoration:none;">${site.replace(/^https?:\/\//, "")}</a><br />
      Support: <a href="mailto:${support}" style="color:#059669;text-decoration:none;">${support}</a>${phoneLine}<br /><br />
      <em>This is a transactional email about your order refund at ${shop}.</em>
    </p>`;
};

const footerText = (shop, supportPhone) => {
  const support = getSupportEmail();
  const site = storeBaseUrl();
  const phoneLine = supportPhone ? `\nPhone: ${supportPhone}` : "";
  return `\n\n— ${shop}\n${site}\nSupport: ${support}${phoneLine}`;
};

const refundSuccessEmail = (option) => {
  const shop = option.shop_name || "RASA";
  const support = getSupportEmail();
  const orderUrl = `${storeBaseUrl()}/order/${option.orderId || ""}`;
  const settlement = option.settlementDays || "3–5 business days";

  const text = `Hello ${option.name || "there"},

Your refund for order #${option.invoice} has been processed successfully.

We have received and processed your returned item. The refund has been initiated and will be credited to your original payment method (${option.refund_method}).

Refund details:
- Order ID: #${option.invoice}
- Refund amount: ${option.currency}${option.refund_amount}
- Refund date: ${option.refund_date}
- Refund method: ${option.refund_method}
- Expected settlement: ${settlement}

View your order: ${orderUrl}

If you have questions, contact us at ${support}.${footerText(shop, option.support_phone)}`;

  const detailsRows = [
    ["Order ID", `#${option.invoice}`],
    ["Refund amount", `${option.currency}${option.refund_amount}`],
    ["Refund date", option.refund_date],
    ["Refund method", option.refund_method],
    ["Expected settlement", settlement],
  ]
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:14px;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${value}</td>
    </tr>`
    )
    .join("");

  const bodyHtml = `
    <p>Hello <strong>${option.name || "there"}</strong>,</p>
    <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#059669;">Your refund has been processed</p>
    <p>We have <strong>received and processed your returned item</strong>. Your refund has been successfully initiated and will be credited to your <strong>original payment method</strong> (${option.refund_method}).</p>
    <table style="width:100%;margin:20px 0;border-collapse:collapse;">${detailsRows}</table>
    <p style="background:#ecfdf5;border-left:4px solid #059669;padding:12px 16px;font-size:14px;color:#065f46;margin:20px 0;">
      The refund amount will appear on your ${option.refund_method} account within <strong>${settlement}</strong>, depending on your bank or payment provider.
    </p>
    <p style="margin:28px 0;">
      <a href="${orderUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600;">View order details</a>
    </p>
    <p style="color:#6b7280;font-size:14px;">Questions? Email <a href="mailto:${support}" style="color:#059669;">${support}</a>${option.support_phone ? ` or call ${option.support_phone}` : ""}.</p>
    ${emailFooter(shop, option.support_phone)}`;

  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Refund processed – ${shop}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <span style="display:none;max-height:0;overflow:hidden;">Refund processed for order #${option.invoice}</span>
  <div style="padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
      <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#059669;">${shop}</p>
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`,
    text,
  };
};

module.exports = { refundSuccessEmail };

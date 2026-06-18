const { getSupportEmail, getBrandDomain } = require("./email-utils");

const storeBaseUrl = () =>
  (
    process.env.STORE_URL ||
    process.env.FRONTEND_URL ||
    `https://${getBrandDomain()}`
  ).replace(/\/+$/, "");

const emailFooter = (shop) => {
  const support = getSupportEmail();
  const site = storeBaseUrl();
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />
    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
      <strong>${shop}</strong><br />
      <a href="${site}" style="color:#059669;text-decoration:none;">${site.replace(/^https?:\/\//, "")}</a><br />
      Support: <a href="mailto:${support}" style="color:#059669;text-decoration:none;">${support}</a><br /><br />
      <em>You are receiving this email because a request was made for your account at ${shop}. If you did not make this request, please ignore this email.</em>
    </p>`;
};

const footerText = (shop) => {
  const support = getSupportEmail();
  const site = storeBaseUrl();
  return `\n\n— ${shop}\n${site}\nSupport: ${support}`;
};

const wrap = ({ title, preheader, bodyHtml, bodyText }) => ({
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader || title}</span>
  <div style="padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#111827;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:32px;">
      <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#059669;">${title}</p>
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`,
  text: bodyText,
});

const simpleOtpEmail = (option) => {
  const shop = option.shop_name || "RASA";
  const support = getSupportEmail();
  const text = `Hello ${option.name || "there"},

Your ${option.purpose || "verification"} code for ${shop} is: ${option.otp}

This code expires in ${option.expiresMinutes || 10} minutes.
If you did not request this, you can ignore this email.${footerText(shop)}`;

  return wrap({
    title: shop,
    preheader: `Your verification code: ${option.otp}`,
    bodyHtml: `
    <p>Hello <strong>${option.name || "there"}</strong>,</p>
    <p>Your ${option.purpose || "verification"} code:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#059669;margin:24px 0;">${option.otp}</p>
    <p style="color:#6b7280;font-size:14px;">Expires in ${option.expiresMinutes || 10} minutes.</p>
    ${emailFooter(shop)}`,
    bodyText: text,
  });
};

const simpleVerifyEmail = (option) => {
  const shop = option.shop_name || "RASA";
  const link = `${storeBaseUrl()}/auth/email-verification/${option.token}`;

  const text = `Hello ${option.name || "there"},

Thanks for signing up at ${shop}.

Open this link to verify your email:
${link}

If you did not create an account, ignore this email.${footerText(shop)}`;

  return wrap({
    title: `Complete your ${shop} signup`,
    preheader: "Confirm your email to finish creating your account",
    bodyHtml: `
    <p>Hello <strong>${option.name || "there"}</strong>,</p>
    <p>Thanks for joining <strong>${shop}</strong>. Please confirm your email address:</p>
    <p style="margin:28px 0;">
      <a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600;">Confirm email</a>
    </p>
    <p style="color:#6b7280;font-size:13px;word-break:break-all;">Or paste this link in your browser:<br />${link}</p>
    ${emailFooter(shop)}`,
    bodyText: text,
  });
};

const simpleResetPasswordEmail = (option) => {
  const shop = option.shop_name || "RASA";
  const link = `${storeBaseUrl()}/auth/forget-password/${option.token}`;

  const text = `Hello,

We received a request to reset the password for ${option.email} at ${shop}.

Reset your password (link expires in 15 minutes):
${link}

If you did not request this, ignore this email. Your password will not change.${footerText(shop)}`;

  return wrap({
    title: `${shop} password reset`,
    preheader: "Reset your password using the secure link below",
    bodyHtml: `
    <p>Hello,</p>
    <p>We received a password reset request for <strong>${option.email}</strong>.</p>
    <p style="margin:28px 0;">
      <a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600;">Reset password</a>
    </p>
    <p style="color:#6b7280;font-size:13px;">This link expires in 15 minutes.</p>
    <p style="color:#6b7280;font-size:13px;word-break:break-all;">Or paste this link:<br />${link}</p>
    ${emailFooter(shop)}`,
    bodyText: text,
  });
};

module.exports = {
  simpleOtpEmail,
  simpleVerifyEmail,
  simpleResetPasswordEmail,
  storeBaseUrl,
};

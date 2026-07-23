/**
 * Quick check: can this server send OTP email?
 * Usage: node script/verifyEmail.js [optional-to-email]
 */
require("../config/env");
const {
  sendEmail,
  getEmailProviderStatus,
} = require("../lib/email-sender/sender");

(async () => {
  const status = getEmailProviderStatus();
  console.log("Email providers:", status);

  if (!status.resend && !status.smtp) {
    console.error(
      "FAIL: No email provider configured. Set RESEND_API_KEY+RESEND_FROM or EMAIL_USER+EMAIL_PASS."
    );
    process.exit(1);
  }

  const to =
    process.argv[2] ||
    process.env.EMAIL_USER ||
    process.env.VERIFY_EMAIL_TO;

  if (!to) {
    console.error("FAIL: Pass a recipient: node script/verifyEmail.js you@email.com");
    process.exit(1);
  }

  try {
    const result = await sendEmail({
      to,
      subject: "RASA email verify OK",
      html: "<p>If you received this, OTP email delivery works.</p><p><b>Code: 0000</b></p>",
      text: "If you received this, OTP email delivery works. Code: 0000",
      emailType: "login-otp",
    });
    console.log("OK: email sent", result?.messageId || result?.id || result);
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err.code || "EMAIL_SEND_FAILED", err.message);
    if (err.details) console.error(JSON.stringify(err.details, null, 2));
    process.exit(1);
  }
})();

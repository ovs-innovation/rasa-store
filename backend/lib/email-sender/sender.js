const nodemailer = require("nodemailer");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const {
  prepareMailOptions,
  isResendConfigured,
} = require("./email-utils");

let transporter = null;

const getEmailPassword = () =>
  String(process.env.EMAIL_PASS || "")
    .replace(/^["']|["']$/g, "")
    .trim();

const isSmtpConfigured = () =>
  Boolean(process.env.EMAIL_USER && getEmailPassword());

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = getEmailPassword();

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in environment");
  }

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  } else if (process.env.SERVICE === "gmail") {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  } else {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  return transporter;
};

const sendViaResend = async (mail) => {
  const payload = {
    from: mail.from,
    to: Array.isArray(mail.to) ? mail.to : [mail.to],
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  };

  if (mail.replyTo) {
    payload.reply_to = mail.replyTo;
  }

  // Resend is picky — only pass a small safe subset of headers
  if (mail.headers && mail.headers["X-Entity-Ref-ID"]) {
    payload.headers = {
      "X-Entity-Ref-ID": mail.headers["X-Entity-Ref-ID"],
    };
  }

  if (mail.emailType) {
    payload.tags = [{ name: "type", value: String(mail.emailType) }];
  }

  const { data } = await axios.post("https://api.resend.com/emails", payload, {
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  return data;
};

const sendViaSmtp = async (mail) => {
  const smtpMail = {
    from: `"${process.env.EMAIL_FROM_NAME || "RASA"}" <${process.env.EMAIL_USER}>`,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo,
  };
  return getTransporter().sendMail(smtpMail);
};

const classifyEmailError = (err) => {
  const msg = String(err?.message || err || "").toLowerCase();
  const code = err?.code || err?.response?.status;
  if (msg.includes("must be set") || msg.includes("resend_from")) {
    return "EMAIL_NOT_CONFIGURED";
  }
  if (err?.code === "EAUTH" || msg.includes("invalid login") || msg.includes("authentication")) {
    return "SMTP_AUTH_FAILED";
  }
  if (msg.includes("resend") || err?.response?.data) {
    return "RESEND_FAILED";
  }
  if (code === "ETIMEDOUT" || code === "ESOCKET" || msg.includes("timeout")) {
    return "EMAIL_TIMEOUT";
  }
  return "EMAIL_SEND_FAILED";
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Send transactional email with provider fallback:
 * 1) Prefer Resend when configured
 * 2) Fall back to SMTP/Gmail if Resend fails (or is not configured)
 * One retry per provider.
 */
const sendEmail = async (body) => {
  const mail = prepareMailOptions(body);
  const errors = [];

  const tryResend = async () => {
    if (!isResendConfigured()) return null;
    const data = await sendViaResend(mail);
    console.log(
      `[email] Resend → ${mail.to} | ${mail.subject} | id=${data?.id || "ok"}`
    );
    return data;
  };

  const trySmtp = async () => {
    if (!isSmtpConfigured()) return null;
    console.warn(
      "[email] Using SMTP — for production prefer RESEND_API_KEY + RESEND_FROM."
    );
    const info = await sendViaSmtp(mail);
    console.log(
      `[email] SMTP → ${mail.to} | ${mail.subject} | id=${info?.messageId || "ok"}`
    );
    return info;
  };

  const providers = isResendConfigured()
    ? [
        { name: "resend", run: tryResend },
        { name: "smtp", run: trySmtp },
      ]
    : [
        { name: "smtp", run: trySmtp },
        { name: "resend", run: tryResend },
      ];

  for (const provider of providers) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const result = await provider.run();
        if (result) return result;
        // Provider not configured — skip silently
        break;
      } catch (err) {
        const classified = classifyEmailError(err);
        console.error(
          `[email] ${provider.name} attempt ${attempt} failed (${classified}):`,
          err.response?.data || err.message
        );
        errors.push({ provider: provider.name, classified, message: err.message });
        if (attempt < 2) await sleep(600);
      }
    }
  }

  const last = errors[errors.length - 1];
  const fail = new Error(
    last?.message ||
      "No email provider succeeded. Set RESEND_API_KEY+RESEND_FROM or EMAIL_USER+EMAIL_PASS."
  );
  fail.code = last?.classified || "EMAIL_SEND_FAILED";
  fail.details = errors;
  throw fail;
};

const getEmailProviderStatus = () => ({
  resend: isResendConfigured(),
  smtp: isSmtpConfigured(),
});

const minutes = 30;
const emailVerificationLimit = rateLimit({
  windowMs: minutes * 60 * 1000,
  max: 3,
  handler: (req, res) => {
    res.status(429).send({
      success: false,
      message: `You made too many requests. Please try again after ${minutes} minutes.`,
    });
  },
});

const passwordVerificationLimit = rateLimit({
  windowMs: minutes * 60 * 1000,
  max: 3,
  handler: (req, res) => {
    res.status(429).send({
      success: false,
      message: `You made too many requests. Please try again after ${minutes} minutes.`,
    });
  },
});

const supportMessageLimit = rateLimit({
  windowMs: minutes * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).send({
      success: false,
      message: `You made too many requests. Please try again after ${minutes} minutes.`,
    });
  },
});

const phoneVerificationLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).send({
      success: false,
      code: "RATE_LIMITED",
      message: "Too many OTP requests. Please wait 5 minutes and try again.",
      remainingSeconds: 300,
    });
  },
});

// Per-IP limiter for email login OTP (prevents spam without locking one user forever)
const emailLoginOtpLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).send({
      success: false,
      code: "RATE_LIMITED",
      message: "Too many OTP requests from this device. Please wait a few minutes and try again.",
      remainingSeconds: 900,
    });
  },
});

module.exports = {
  sendEmail,
  getEmailProviderStatus,
  emailVerificationLimit,
  passwordVerificationLimit,
  supportMessageLimit,
  phoneVerificationLimit,
  emailLoginOtpLimit,
};

const axios = require("axios");
require("dotenv").config();

/**
 * Utility to send SMS/WhatsApp notifications via MSG91 Flow API.
 */
const sendSMS = async (to, message, variables = {}) => {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const senderId = process.env.MSG91_SENDER_ID || "FARMCY";

    if (!authKey || !templateId) {
      console.warn("MSG91_AUTH_KEY or MSG91_TEMPLATE_ID not found in .env. Skipping SMS.");
      return false;
    }

    let mobile = to.replace(/\D/g, "");
    if (mobile.length === 10) {
      mobile = "91" + mobile;
    }

    const payload = {
      template_id: templateId,
      sender: senderId,
      short_url: "1",
      recipients: [
        {
          mobiles: mobile,
          ...variables,
          ...(Object.keys(variables).length === 0 ? { message: message } : {}),
        },
      ],
    };

    console.log(`[MSG91] Flow SMS to ${mobile}...`);

    const response = await axios.post("https://api.msg91.com/api/v5/flow/", payload, {
      headers: {
        authkey: authKey,
        "content-type": "application/json",
      },
    });

    if (response.data && response.data.type === "success") {
      console.log(`[MSG91] Flow SMS sent to ${mobile}`);
      return true;
    }

    console.error("[MSG91] Flow API error:", JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response) {
      console.error(
        "[MSG91] Flow SMS failed:",
        error.response.status,
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("[MSG91] Flow SMS failed:", error.message);
    }
    return false;
  }
};

/** Send 4-digit login OTP via MSG91 OTP API (not Flow API) */
const sendLoginOtpSms = async (to, otp) => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;

  if (!authKey || !templateId) {
    console.warn("[MSG91] MSG91_AUTH_KEY or MSG91_OTP_TEMPLATE_ID missing — cannot send login OTP SMS.");
    return { ok: false, error: "MSG91 OTP not configured" };
  }

  try {
    let mobile = String(to || "").replace(/\D/g, "");
    if (mobile.length === 10) mobile = "91" + mobile;
    if (!mobile.startsWith("91") && mobile.length > 10) {
      mobile = mobile.replace(/^0+/, "");
    }

    const payload = {
      template_id: templateId,
      mobile,
      otp: String(otp),
      otp_length: 4,
      otp_expiry: 10,
    };

    console.log(`[MSG91] Sending login OTP to ${mobile}...`);

    const response = await axios.post("https://control.msg91.com/api/v5/otp", payload, {
      headers: {
        authkey: authKey,
        "content-type": "application/json",
      },
    });

    const data = response.data || {};
    const ok = data.type === "success";

    if (ok) {
      console.log(`[MSG91] Login OTP sent to ${mobile}`, data.request_id || "");
      return { ok: true, requestId: data.request_id };
    }

    console.warn("[MSG91] OTP API failed, trying Flow SMS fallback...");
    const flowOk = await sendSMS(
      mobile,
      `Your Farmacykart login OTP is ${otp}. Valid for 10 minutes.`,
      { otp, OTP: otp, VAR1: otp, var: otp, var1: otp }
    );
    if (flowOk) {
      return { ok: true, channel: "flow" };
    }

    console.error("[MSG91] Login OTP API rejected:", JSON.stringify(data, null, 2));
    return { ok: false, error: data.message || "MSG91 rejected OTP request" };
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.error("[MSG91] Login OTP SMS failed:", JSON.stringify(detail, null, 2));
    return { ok: false, error: typeof detail === "string" ? detail : detail?.message || "SMS send failed" };
  }
};

module.exports = { sendSMS, sendLoginOtpSms };

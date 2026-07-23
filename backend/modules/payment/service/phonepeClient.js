const axios = require("axios");
const { getConfig } = require("../utils/phonepeConfig");

let cachedToken = null;
let tokenExpiresAtMs = 0;

const getAccessToken = async () => {
  const now = Date.now();
  // Refresh 60s before expiry
  if (cachedToken && now < tokenExpiresAtMs - 60_000) {
    return cachedToken;
  }

  const { authUrl, clientId, clientSecret, clientVersion } = getConfig();
  const body = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const { data } = await axios.post(authUrl, body.toString(), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 20000,
  });

  if (!data?.access_token) {
    throw new Error("PhonePe auth token missing in response.");
  }

  cachedToken = data.access_token;
  // expires_at is epoch seconds per PhonePe docs
  tokenExpiresAtMs = data.expires_at
    ? Number(data.expires_at) * 1000
    : now + 50 * 60 * 1000;

  return cachedToken;
};

const authHeaders = async () => {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: `O-Bearer ${token}`,
  };
};

const createPayment = async ({
  merchantOrderId,
  amountPaise,
  redirectUrl,
  message = "RASA Store payment",
  metaInfo = {},
}) => {
  const { payUrl } = getConfig();
  const headers = await authHeaders();

  const payload = {
    merchantOrderId,
    amount: amountPaise,
    expireAfter: 1200,
    paymentFlow: {
      type: "PG_CHECKOUT",
      message,
      merchantUrls: {
        redirectUrl,
      },
    },
    metaInfo,
  };

  const { data } = await axios.post(payUrl, payload, {
    headers,
    timeout: 25000,
  });

  return data;
};

const getOrderStatus = async (merchantOrderId, details = true) => {
  const { statusBaseUrl } = getConfig();
  const headers = await authHeaders();
  const url = `${statusBaseUrl}/${encodeURIComponent(
    merchantOrderId
  )}/status?details=${details ? "true" : "false"}`;

  const { data } = await axios.get(url, {
    headers,
    timeout: 20000,
  });

  return data;
};

const clearTokenCache = () => {
  cachedToken = null;
  tokenExpiresAtMs = 0;
};

module.exports = {
  getAccessToken,
  createPayment,
  getOrderStatus,
  clearTokenCache,
};

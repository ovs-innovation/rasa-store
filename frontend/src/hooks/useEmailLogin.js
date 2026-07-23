import { useState, useCallback } from "react";
import CustomerServices from "@services/CustomerServices";

const FRIENDLY = {
  OTP_COOLDOWN: "Please wait before requesting another OTP.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes and try again.",
  OTP_DELIVERY_FAILED:
    "Could not send OTP email right now. Please try again in a moment.",
  OTP_SEND_FAILED: "Unable to send OTP. Please try again.",
  EMAIL_ALREADY_REGISTERED:
    "This email is already registered. Please login instead.",
  EMAIL_NOT_REGISTERED:
    "No account found with this email. Please sign up first.",
};

const parseAuthError = (err, fallback) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const code = data?.code || err?.code || null;
  let message =
    (code && FRIENDLY[code]) ||
    data?.message ||
    err?.message ||
    fallback;

  if (status === 429) {
    message =
      data?.message ||
      FRIENDLY.OTP_COOLDOWN ||
      "Please wait before requesting another OTP.";
  } else if (status === 503) {
    message = data?.message || FRIENDLY.OTP_DELIVERY_FAILED;
  } else if (status >= 500) {
    message =
      data?.message ||
      "Something went wrong on our side. Please try again in a moment.";
  } else if (
    !data?.message &&
    (err?.code === "ERR_NETWORK" || err?.message === "Network Error")
  ) {
    message = "Network issue. Check your connection and try again.";
  }

  // Strip Axios noise like "Request failed with status code 429"
  if (/request failed with status code/i.test(message)) {
    message =
      status === 429
        ? FRIENDLY.OTP_COOLDOWN
        : "Something went wrong. Please try again.";
  }

  const error = new Error(message);
  error.code = code;
  error.status = status || null;
  error.remainingSeconds =
    typeof data?.remainingSeconds === "number"
      ? data.remainingSeconds
      : typeof data?.resendAfter === "number"
        ? data.resendAfter
        : null;
  return error;
};

export default function useEmailLogin(authIntent = "login") {
  const intent = authIntent === "signup" ? "signup" : "login";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const assertEmailIntent = useCallback(
    async (email) => {
      const check = await CustomerServices.checkEmailRegistered(email);
      if (intent === "signup" && check?.exists) {
        const err = new Error(FRIENDLY.EMAIL_ALREADY_REGISTERED);
        err.code = "EMAIL_ALREADY_REGISTERED";
        throw err;
      }
      if (intent === "login" && !check?.exists) {
        const err = new Error(FRIENDLY.EMAIL_NOT_REGISTERED);
        err.code = "EMAIL_NOT_REGISTERED";
        throw err;
      }
    },
    [intent]
  );

  const sendOtp = useCallback(
    async (email, avatar = "") => {
      setLoading(true);
      setError("");
      setErrorCode(null);
      setRemainingSeconds(null);
      try {
        await assertEmailIntent(email);
        const response = await CustomerServices.sendEmailOtp({
          email,
          intent,
          avatar,
        });
        return {
          ...response,
          otpLength: 4,
          resendAfter: response?.resendAfter || 60,
        };
      } catch (err) {
        const parsed =
          err?.code && err?.message && !err?.response
            ? err
            : parseAuthError(err, "Failed to send OTP");
        setError(parsed.message);
        setErrorCode(parsed.code);
        if (parsed.remainingSeconds) {
          setRemainingSeconds(parsed.remainingSeconds);
        }
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [intent, assertEmailIntent]
  );

  const verifyOtp = useCallback(
    async (email, otpCode, avatar = "") => {
      setLoading(true);
      setError("");
      setErrorCode(null);
      try {
        return await CustomerServices.verifyEmailOtp({
          email: String(email || "").trim().toLowerCase(),
          otp: String(otpCode || "").trim(),
          intent,
          avatar,
        });
      } catch (err) {
        const parsed = parseAuthError(err, "OTP verification failed");
        setError(parsed.message);
        setErrorCode(parsed.code);
        throw parsed;
      } finally {
        setLoading(false);
      }
    },
    [intent]
  );

  const resetSession = useCallback(() => {
    setError("");
    setErrorCode(null);
    setRemainingSeconds(null);
  }, []);

  return {
    sendOtp,
    verifyOtp,
    loading,
    error,
    errorCode,
    remainingSeconds,
    setError,
    resetOtpSession: resetSession,
    otpLength: 4,
    intent,
  };
}

import { useState, useCallback } from "react";
import CustomerServices from "@services/CustomerServices";

const parseAuthError = (err, fallback) => {
  const data = err?.response?.data;
  const message = data?.message || err?.message || fallback;
  const code = data?.code || err?.code || null;
  const error = new Error(message);
  error.code = code;
  return error;
};

export default function useEmailLogin(authIntent = "login") {
  const intent = authIntent === "signup" ? "signup" : "login";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);

  const assertEmailIntent = useCallback(
    async (email) => {
      const check = await CustomerServices.checkEmailRegistered(email);
      if (intent === "signup" && check?.exists) {
        const err = new Error(
          "This email is already registered. Please login instead."
        );
        err.code = "EMAIL_ALREADY_REGISTERED";
        throw err;
      }
      if (intent === "login" && !check?.exists) {
        const err = new Error(
          "No account found with this email. Please sign up first."
        );
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
      try {
        await assertEmailIntent(email);
        const response = await CustomerServices.sendEmailOtp({
          email,
          intent,
          avatar,
        });
        return { ...response, otpLength: 4 };
      } catch (err) {
        const parsed =
          err?.code && err?.message
            ? err
            : parseAuthError(err, "Failed to send OTP");
        setError(parsed.message);
        setErrorCode(parsed.code);
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
  }, []);

  return {
    sendOtp,
    verifyOtp,
    loading,
    error,
    errorCode,
    setError,
    resetOtpSession: resetSession,
    otpLength: 4,
    intent,
  };
}

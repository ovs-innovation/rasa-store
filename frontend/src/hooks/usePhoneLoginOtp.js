import { useState, useCallback } from "react";
import CustomerServices from "@services/CustomerServices";

export const PHONE_OTP_LENGTH = 4;
export const EMPTY_OTP = Array(PHONE_OTP_LENGTH).fill("");

const getErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg = data?.message;

  if (status === 404 && msg?.includes("Route")) {
    return "Login is temporarily unavailable. Please try again shortly.";
  }
  if (status === 404 && msg?.includes("does not exist")) {
    return msg;
  }
  if (status === 429) {
    return msg || "Please wait before requesting another OTP.";
  }
  if (status === 503 || status >= 500) {
    return msg || "Could not send OTP right now. Please try again in a moment.";
  }
  if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
    return "Network issue. Check your connection and try again.";
  }
  if (msg && /request failed with status code/i.test(msg)) {
    return "Something went wrong. Please try again.";
  }
  return msg || err?.message || "Something went wrong. Please try again.";
};

const enrichError = (err, message) => {
  const error = new Error(message);
  error.code = err?.response?.data?.code || null;
  error.status = err?.response?.status || null;
  error.remainingSeconds =
    typeof err?.response?.data?.remainingSeconds === "number"
      ? err.response.data.remainingSeconds
      : typeof err?.response?.data?.resendAfter === "number"
        ? err.response.data.resendAfter
        : null;
  return error;
};

export default function usePhoneLoginOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = useCallback(async (phoneNumber) => {
    setLoading(true);
    setError("");
    try {
      const response = await CustomerServices.sendPhoneOtp({ phoneNumber });
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw enrichError(err, message);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (phoneNumber, otp) => {
    setLoading(true);
    setError("");
    try {
      const response = await CustomerServices.verifyPhoneOtp({ phoneNumber, otp });
      return response;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw enrichError(err, message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendOtp,
    verifyOtp,
    loading,
    error,
    setError,
    otpLength: PHONE_OTP_LENGTH,
  };
}

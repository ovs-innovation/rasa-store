import { useState, useCallback } from "react";
import CustomerServices from "@services/CustomerServices";

export const PHONE_OTP_LENGTH = 4;
export const EMPTY_OTP = Array(PHONE_OTP_LENGTH).fill("");

const getErrorMessage = (err) => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.message;

  if (status === 404 && msg?.includes("Route")) {
    return "Backend server needs restart. Run: cd backend && npm run dev";
  }
  if (status === 404 && msg?.includes("does not exist")) {
    return msg;
  }
  if (status === 429) {
    return msg || "Please wait before requesting another OTP.";
  }
  return msg || err?.message || "Something went wrong. Please try again.";
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
      throw new Error(message);
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
      throw new Error(message);
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

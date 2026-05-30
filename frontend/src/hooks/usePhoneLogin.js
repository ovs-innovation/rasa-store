import { useState, useCallback } from "react";
import CustomerServices from "@services/CustomerServices";
import useFirebasePhoneOtp from "@hooks/useFirebasePhoneOtp";

/** Firebase SMS = 6 digits (reliable). MSG91 backend = 4 digits. */
const USE_FIREBASE_SMS =
  process.env.NEXT_PUBLIC_PHONE_OTP_PROVIDER !== "msg91";

export const PHONE_OTP_LENGTH = USE_FIREBASE_SMS ? 6 : 4;
export const EMPTY_OTP = Array(PHONE_OTP_LENGTH).fill("");

export default function usePhoneLogin() {
  const [mode, setMode] = useState(USE_FIREBASE_SMS ? "firebase" : "msg91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    sendOtp: firebaseSendOtp,
    verifyOtp: firebaseVerifyOtp,
    loading: firebaseLoading,
    error: firebaseError,
    setError: setFirebaseError,
    resetOtpSession,
  } = useFirebasePhoneOtp();

  const sendOtp = useCallback(
    async (phoneNumber) => {
      setLoading(true);
      setError("");
      try {
        if (mode === "firebase") {
          await firebaseSendOtp(phoneNumber);
          return {
            message: "6-digit OTP sent to your phone via SMS",
            channel: "firebase",
            otpLength: 6,
          };
        }
        const response = await CustomerServices.sendPhoneOtp({ phoneNumber });
        return { ...response, otpLength: 4, channel: response?.channel || "msg91" };
      } catch (err) {
        if (mode === "firebase") {
          const msg = err?.message || "Failed to send OTP";
          setError(msg);
          throw new Error(msg);
        }
        const msg =
          err?.response?.data?.message || err?.message || "Failed to send OTP";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [mode, firebaseSendOtp]
  );

  const verifyOtp = useCallback(
    async (phoneNumber, otpCode) => {
      setLoading(true);
      setError("");
      try {
        if (mode === "firebase") {
          const { idToken } = await firebaseVerifyOtp(otpCode);
          return await CustomerServices.loginCustomer({ idToken });
        }
        return await CustomerServices.verifyPhoneOtp({
          phoneNumber,
          otp: otpCode,
        });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "OTP verification failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [mode, firebaseVerifyOtp]
  );

  const switchToMsg91 = useCallback(() => {
    setMode("msg91");
    setError("");
    resetOtpSession();
  }, [resetOtpSession]);

  const switchToFirebase = useCallback(() => {
    setMode("firebase");
    setError("");
  }, []);

  return {
    sendOtp,
    verifyOtp,
    loading: loading || firebaseLoading,
    error: error || firebaseError,
    setError: (msg) => {
      setError(msg);
      setFirebaseError(msg);
    },
    mode,
    switchToMsg91,
    switchToFirebase,
    otpLength: mode === "firebase" ? 6 : 4,
    isFirebase: mode === "firebase",
  };
}

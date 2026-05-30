import { useState, useCallback } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@lib/firebase";

const LOCALHOST_OTP_HINT =
  "Phone OTP does not work on localhost. Open http://127.0.0.1:3000/auth/login instead, and add 127.0.0.1 in Firebase → Authentication → Settings → Authorized domains.";

export const getFirebasePhoneAuthErrorMessage = (err) => {
  const code = err?.code || "";
  if (code === "auth/invalid-app-credential") {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return LOCALHOST_OTP_HINT;
    }
    return (
      "Firebase could not verify this app. Enable Phone sign-in in Firebase Console, add your domain to Authorized domains, and check reCAPTCHA settings."
    );
  }
  if (code === "auth/captcha-check-failed") {
    return "reCAPTCHA failed. Refresh the page and try again.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  return err?.message || "Failed to send OTP. Please try again.";
};

/** Firebase blocks phone auth on hostname `localhost` — use 127.0.0.1 in dev. */
export const redirectLocalhostTo127 = () => {
  if (typeof window === "undefined") return false;
  if (window.location.hostname !== "localhost") return false;
  const nextUrl = window.location.href.replace(
    /^https?:\/\/localhost/i,
    `${window.location.protocol}//127.0.0.1`
  );
  window.location.replace(nextUrl);
  return true;
};

const formatIndianPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (String(phone).startsWith("+")) return String(phone);
  return `+91${digits}`;
};

export default function useFirebasePhoneOtp() {
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearRecaptcha = useCallback(() => {
    if (typeof window !== "undefined" && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (_) {}
      window.recaptchaVerifier = null;
    }
  }, []);

  const getRecaptchaVerifier = useCallback(async () => {
    if (!auth) {
      throw new Error(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* keys in frontend/.env"
      );
    }

    clearRecaptcha();

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });

    await verifier.render();
    window.recaptchaVerifier = verifier;
    return verifier;
  }, [clearRecaptcha]);

  const sendOtp = useCallback(
    async (phoneNumber) => {
      const digits = String(phoneNumber || "").replace(/\D/g, "");
      if (digits.length < 10) {
        const msg = "Please enter a valid 10-digit number";
        setError(msg);
        throw new Error(msg);
      }

      setLoading(true);
      setError("");

      try {
        const appVerifier = await getRecaptchaVerifier();
        const formattedPhone = formatIndianPhone(digits);
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          appVerifier
        );
        setConfirmationResult(confirmation);
        return confirmation;
      } catch (err) {
        const msg = getFirebasePhoneAuthErrorMessage(err);
        setError(msg);
        clearRecaptcha();
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [getRecaptchaVerifier, clearRecaptcha]
  );

  const verifyOtp = useCallback(
    async (otpCode) => {
      if (!confirmationResult) {
        const msg = "Please request OTP first";
        setError(msg);
        throw new Error(msg);
      }

      setLoading(true);
      setError("");

      try {
        const result = await confirmationResult.confirm(otpCode);
        const idToken = await result.user.getIdToken();
        return {
          idToken,
          phoneNumber: result.user.phoneNumber,
        };
      } catch (err) {
        const msg = getFirebasePhoneAuthErrorMessage(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [confirmationResult]
  );

  const resetOtpSession = useCallback(() => {
    setConfirmationResult(null);
    setError("");
    clearRecaptcha();
  }, [clearRecaptcha]);

  return {
    sendOtp,
    verifyOtp,
    confirmationResult,
    loading,
    error,
    setError,
    resetOtpSession,
    clearRecaptcha,
  };
}

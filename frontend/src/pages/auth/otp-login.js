import { useState, useRef, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import Layout from "@layout/Layout";
import { UserContext } from "@context/UserContext";
import usePhoneLogin from "@hooks/usePhoneLogin";
import useResendTimer from "@hooks/useResendTimer";
import { redirectLocalhostTo127 } from "@hooks/useFirebasePhoneOtp";
import { setToken } from "@services/httpServices";
import { notifySuccess, notifyError } from "@utils/toast";

const OTPLogin = () => {
  const router = useRouter();
  const { dispatch } = useContext(UserContext);
  const phoneLogin = usePhoneLogin();
  const { remaining, startTimer, resetTimer, canResend, formatted } = useResendTimer(60);

  const [step, setStep] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpLength, setOtpLength] = useState(phoneLogin.otpLength);
  const [otp, setOtp] = useState(Array(phoneLogin.otpLength).fill(""));
  const otpInputRefs = useRef([]);

  useEffect(() => {
    redirectLocalhostTo127();
  }, []);

  const resetOtpInputs = (len) => {
    setOtpLength(len);
    setOtp(Array(len).fill(""));
  };

  const sendOtpRequest = async () => {
    phoneLogin.setError("");
    const response = await phoneLogin.sendOtp(phoneNumber);
    resetOtpInputs(response?.otpLength || phoneLogin.otpLength);
    setStep("otp");
    startTimer();
    notifySuccess(response?.message || "OTP sent to your phone!");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await sendOtpRequest();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || phoneLogin.loading) return;
    try {
      await sendOtpRequest();
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== otpLength) {
      phoneLogin.setError(`Please enter the ${otpLength}-digit OTP`);
      return;
    }

    phoneLogin.setError("");
    try {
      const response = await phoneLogin.verifyOtp(phoneNumber, otpCode);
      if (response?.token) {
        const userInfo = {
          _id: response._id,
          name: response.name,
          email: response.email,
          phone: response.phone,
          token: response.token,
          role: response.role || "customer",
        };
        setToken(response.token);
        Cookies.set("userInfo", JSON.stringify(userInfo), { expires: 1 });
        dispatch({ type: "USER_LOGIN", payload: userInfo });
        notifySuccess("Login successful!");
        router.push("/user/dashboard");
      }
    } catch (err) {
      notifyError(err.message);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const digit = value.slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < otpLength - 1) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Layout title="OTP Login">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10">
        {phoneLogin.isFirebase && <div id="recaptcha-container" />}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Login with Phone</h2>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="9876543210"
                  maxLength="10"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Local test: open{" "}
                <a href="http://127.0.0.1:3000/auth/otp-login" className="text-store-600 underline">
                  127.0.0.1:3000/auth/otp-login
                </a>{" "}
                (not localhost)
              </p>
              {phoneLogin.error && (
                <p className="text-red-500 text-sm text-center">{phoneLogin.error}</p>
              )}
              <button
                disabled={phoneLogin.loading}
                type="submit"
                className="w-full bg-store-500 text-white py-3 rounded-lg h-12"
              >
                {phoneLogin.loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  resetOtpInputs(phoneLogin.otpLength);
                  phoneLogin.setError("");
                  resetTimer();
                }}
                className="text-sm text-gray-500 underline"
              >
                Back
              </button>
              <h2 className="text-xl font-bold text-center">
                Enter {otpLength}-digit OTP
              </h2>
              <p className="text-sm text-gray-500 text-center">Sent to +91{phoneNumber}</p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg"
                  />
                ))}
              </div>
              {phoneLogin.error && (
                <p className="text-red-500 text-sm text-center">{phoneLogin.error}</p>
              )}
              <button
                disabled={phoneLogin.loading}
                type="submit"
                className="w-full bg-store-500 text-white py-3 rounded-lg h-12"
              >
                {phoneLogin.loading ? "Verifying..." : "Verify & Login"}
              </button>
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={phoneLogin.loading}
                    className="text-sm text-store-600 font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend in <span className="font-bold text-store-600">{formatted}</span>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OTPLogin;

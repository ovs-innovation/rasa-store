import { useState, useEffect, useRef, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiLock, FiMail } from "react-icons/fi";
import Cookies from "js-cookie";

import Layout from "@layout/Layout";
import useLoginSubmit from "@hooks/useLoginSubmit";
import usePhoneLogin from "@hooks/usePhoneLogin";
import useResendTimer from "@hooks/useResendTimer";
import { redirectLocalhostTo127 } from "@hooks/useFirebasePhoneOtp";
import InputArea from "@components/form/InputArea";
import { setToken } from "@services/httpServices";
import { UserContext } from "@context/UserContext";
import { notifySuccess, notifyError } from "@utils/toast";

const Login = () => {
  const router = useRouter();
  const { dispatch } = useContext(UserContext);
  const [loginMethod, setLoginMethod] = useState("otp");
  const { handleSubmit, submitHandler, register, reset, setValue, errors, loading } =
    useLoginSubmit();

  const phoneLogin = usePhoneLogin();
  const { remaining, startTimer, resetTimer, canResend, formatted } = useResendTimer(60);

  const [step, setStep] = useState("phone");
  const [otpLength, setOtpLength] = useState(phoneLogin.otpLength);
  const [otp, setOtp] = useState(Array(phoneLogin.otpLength).fill(""));
  const otpInputRefs = useRef([]);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    redirectLocalhostTo127();
  }, []);

  useEffect(() => {
    reset({ email: "", password: "" });
    setValue("email", "");
    setValue("password", "");
  }, [reset, setValue]);

  const resetOtpInputs = (len) => {
    setOtpLength(len);
    setOtp(Array(len).fill(""));
  };

  const sendOtpRequest = async () => {
    phoneLogin.setError("");
    const response = await phoneLogin.sendOtp(phoneNumber);
    const len = response?.otpLength || phoneLogin.otpLength;
    resetOtpInputs(len);
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

  const switchToPhone = () => {
    setLoginMethod("otp");
    setStep("phone");
    resetOtpInputs(phoneLogin.otpLength);
    phoneLogin.setError("");
    resetTimer();
  };

  const switchToEmail = () => {
    setLoginMethod("email");
    setStep("phone");
    resetTimer();
    phoneLogin.setError("");
  };

  const otpError = phoneLogin.error;

  return (
    <Layout title="Login">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-10">
        <div className="mx-auto max-w-lg bg-white shadow-xl rounded-2xl p-8 sm:p-10">
          {phoneLogin.isFirebase && <div id="recaptcha-container" />}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Login</h2>
            <div className="flex gap-2 justify-center mt-6">
              <button
                type="button"
                onClick={switchToEmail}
                className={`px-6 py-2.5 rounded-lg transition-all ${loginMethod === "email" ? "bg-store-500 text-white" : "bg-gray-100"}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={switchToPhone}
                className={`px-6 py-2.5 rounded-lg transition-all ${loginMethod === "otp" ? "bg-store-500 text-white" : "bg-gray-100"}`}
              >
                Phone
              </button>
            </div>
          </div>

          {loginMethod === "email" ? (
            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4" autoComplete="off">
              <input
                type="text"
                name="dummy-email"
                style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
                tabIndex="-1"
                aria-hidden="true"
              />
              <input
                type="password"
                name="dummy-password"
                style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
                tabIndex="-1"
                aria-hidden="true"
              />
              <InputArea
                register={register}
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                Icon={FiMail}
                autocomplete="new-password"
              />
              <InputArea
                register={register}
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
                Icon={FiLock}
                autocomplete="new-password"
              />
              <div className="flex justify-end">
                <Link
                  href="/auth/forget-password"
                  className="text-sm text-store-500 hover:text-store-600 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded bg-store-500 text-white h-12 flex items-center justify-center"
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Enter 10-digit number"
                      maxLength="10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Use{" "}
                    <a href="http://127.0.0.1:3000/auth/login" className="text-store-600 underline">
                      127.0.0.1:3000
                    </a>{" "}
                    for SMS OTP
                  </p>
                  {otpError && (
                    <p className="text-red-500 text-sm mt-2 leading-relaxed">{otpError}</p>
                  )}
                  <button
                    disabled={phoneLogin.loading}
                    type="submit"
                    className="w-full py-3 rounded bg-store-500 text-white h-12 flex items-center justify-center"
                  >
                    {phoneLogin.loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
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
                    Change number
                  </button>
                  <p className="text-sm text-gray-600 text-center">
                    Enter <strong>{otpLength}-digit OTP</strong> sent to{" "}
                    <strong>+91{phoneNumber}</strong>
                  </p>
                  <div className="flex justify-center gap-2 sm:gap-3">
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
                        className="w-11 h-11 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 rounded-lg focus:border-store-500 focus:ring-1 focus:ring-store-500"
                      />
                    ))}
                  </div>
                  {otpError && <p className="text-red-500 text-sm text-center">{otpError}</p>}
                  <button
                    disabled={phoneLogin.loading}
                    type="submit"
                    className="w-full py-3 rounded bg-store-500 text-white h-12 font-medium"
                  >
                    {phoneLogin.loading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <div className="text-center">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={phoneLogin.loading}
                        className="text-sm text-store-600 font-semibold hover:underline disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Resend OTP in{" "}
                        <span className="font-bold text-store-600 tabular-nums">{formatted}</span>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;

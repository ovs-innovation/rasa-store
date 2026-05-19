import { useState, useEffect, useRef, useContext } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

//internal import
import Layout from "@layout/Layout";
import CustomerServices from "@services/CustomerServices";
import { setToken } from "@services/httpServices";
import { UserContext } from "@context/UserContext";
import { notifySuccess, notifyError } from "@utils/toast";

const VerifyEmail = () => {
  const router = useRouter();
  const { email } = router.query;
  const { dispatch } = useContext(UserContext);
  
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (router.isReady && !email) {
      router.push("/auth/signup");
    }
  }, [router.isReady, email]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const digit = value.slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      notifyError("Please enter the full 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await CustomerServices.verifyEmailOTP({
        email,
        otp: otpCode,
      });

      if (res.token) {
        const userInfo = {
          _id: res._id,
          name: res.name,
          email: res.email,
          token: res.token,
          role: res.role || "customer",
        };

        setToken(res.token);
        Cookies.set("userInfo", JSON.stringify(userInfo), { expires: 1 });
        dispatch({ type: "USER_LOGIN", payload: userInfo });
        notifySuccess("Email verified successfully!");
        router.push("/user/dashboard");
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await CustomerServices.resendVerificationEmail({ email });
      notifySuccess(res.message);
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout title="Verify Email">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-20">
        <div className="mx-auto max-w-lg bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Verify Your Email</h2>
          <p className="text-gray-500 mb-8">
            We've sent a 4-digit verification code to <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-2 sm:gap-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpInputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-store-500 focus:ring-0 transition-all outline-none"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 rounded-xl bg-store-500 text-white font-bold text-lg hover:bg-store-600 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              
              <p className="text-sm text-gray-500">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-store-600 font-bold hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { auth } from "@lib/firebase";
import { sendEmailVerification } from "firebase/auth";

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

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (router.isReady && !email) {
      router.push("/auth/signup");
    }
  }, [router.isReady, email]);

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth?.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          await handleContinue();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const user = auth?.currentUser;
      if (!user) {
        notifyError("Session expired. Please sign up again.");
        router.push("/auth/signup");
        return;
      }

      await user.reload();

      if (!user.emailVerified) {
        notifyError("Email not verified yet. Please check your inbox and click the verification link.");
        setLoading(false);
        return;
      }

      // Email is verified — get fresh token and login via backend
      const idToken = await user.getIdToken(true);
      const res = await CustomerServices.loginCustomer({ idToken });

      if (res && res.token) {
        const userInfo = {
          _id: res._id,
          name: res.name,
          email: res.email,
          phone: res.phone || "",
          address: res.address || "",
          image: res.image || "",
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
      notifyError(err?.response?.data?.message || err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const user = auth?.currentUser;
      if (!user) {
        notifyError("Session expired. Please sign up again.");
        router.push("/auth/signup");
        return;
      }
      await sendEmailVerification(user);
      notifySuccess("Verification email sent! Please check your inbox.");
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        notifyError("Too many requests. Please wait a moment before trying again.");
      } else {
        notifyError(err?.message || "Failed to resend verification email.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <Layout title="Verify Email">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10 py-20">
        <div className="mx-auto max-w-lg bg-white shadow-xl rounded-2xl p-8 sm:p-10 text-center">
          {/* Email Icon */}
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-store-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold mb-4">Verify Your Email</h2>
          <p className="text-gray-500 mb-2">
            We&apos;ve sent a verification link to your email:
          </p>
          <p className="font-semibold text-gray-900 mb-4">{email}</p>

          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-store-600">Note:</span> Please check your Inbox, Spam, or Junk folder if you don&apos;t see the email in your primary inbox.
          </p>

          <p className="text-sm text-gray-400 mb-8">
            Open your email and click the verification link, then come back and click the button below.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-store-500 text-white font-bold text-lg hover:bg-store-600 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? "Checking..." : "I've Verified — Continue"}
            </button>

            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-store-600 font-bold hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend Email"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;

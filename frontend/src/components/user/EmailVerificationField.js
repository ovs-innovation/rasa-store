import { useState, useEffect } from "react";
import Label from "@components/form/Label";
import CustomerServices from "@services/CustomerServices";
import { notifyError, notifySuccess } from "@utils/toast";

const EmailVerificationField = ({
  register,
  errors,
  emailValue = "",
  verifiedEmail = "",
  isVerified = false,
  onVerified,
  readOnly = false,
}) => {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [localVerified, setLocalVerified] = useState(isVerified);

  const trimmed = (emailValue || "").trim().toLowerCase();
  const verified = (verifiedEmail || "").trim().toLowerCase();
  const showVerified = localVerified && trimmed && trimmed === verified;
  const needsVerification = trimmed && !showVerified;

  useEffect(() => {
    if (isVerified && trimmed && verified && trimmed === verified) {
      setLocalVerified(true);
    }
  }, [isVerified, trimmed, verified]);

  useEffect(() => {
    if (trimmed && verified && trimmed !== verified) {
      setLocalVerified(false);
      setCodeSent(false);
    }
  }, [trimmed, verified]);

  const handleSendCode = async () => {
    if (!trimmed) {
      notifyError("Enter your email address first.");
      return;
    }
    setSending(true);
    try {
      await CustomerServices.sendProfileEmailOtp({ email: trimmed });
      setCodeSent(true);
      notifySuccess("Verification code sent to your email.");
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Could not send code"
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      notifyError("Enter the verification code from your email.");
      return;
    }
    setVerifying(true);
    try {
      const res = await CustomerServices.verifyProfileEmailOtp({
        email: trimmed,
        otp: otp.trim(),
      });
      setLocalVerified(true);
      setCodeSent(false);
      setOtp("");
      notifySuccess(res?.message || "Email verified!");
      onVerified?.({ email: res.email || trimmed, emailVerified: true });
    } catch (err) {
      notifyError(
        err?.response?.data?.message || err?.message || "Invalid code"
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label label="Email (optional)" required={false} />
      <input
        {...register("email", {
          required: false,
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
          },
        })}
        type="email"
        readOnly={readOnly || showVerified}
        placeholder="you@email.com"
        className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-store-500 focus:ring-2 focus:ring-store-500/20 ${
          readOnly || showVerified ? "bg-slate-50 text-slate-600" : "bg-white"
        }`}
      />
      {errors?.email && (
        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
      )}

      {showVerified && (
        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
          <span aria-hidden>✓</span> Email verified
        </p>
      )}

      {needsVerification && !readOnly && (
        <div className="rounded-xl border border-store-100 bg-store-50/60 p-4 space-y-3 ring-1 ring-store-100/80">
          <p className="text-xs text-gray-600">
            We will send a 4-digit code to verify this email before saving.
          </p>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending}
            className="text-sm font-semibold text-store-600 hover:text-store-700 disabled:opacity-60"
          >
            {sending ? "Sending..." : codeSent ? "Resend code" : "Send verification code"}
          </button>

          {codeSent && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter code"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-store-500 focus:ring-2 focus:ring-store-500/20"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="rounded-xl bg-store-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-store-700 disabled:opacity-60"
              >
                {verifying ? "Verifying..." : "Verify email"}
              </button>
            </div>
          )}
        </div>
      )}

      {!trimmed && (
        <p className="text-xs text-gray-500">
          Email is optional. Add one anytime for order updates and receipts.
        </p>
      )}
    </div>
  );
};

export default EmailVerificationField;

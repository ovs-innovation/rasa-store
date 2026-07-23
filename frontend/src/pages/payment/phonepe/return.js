import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Layout from "@layout/Layout";
import OrderServices from "@services/OrderServices";
import { notifyError, notifySuccess } from "@utils/toast";
import useCartDB from "@hooks/useCartDB";

const PhonePeReturnPage = () => {
  const router = useRouter();
  const { clearCartWithDB } = useCartDB();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Confirming your payment securely...");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const merchantOrderId =
      router.query.moid ||
      router.query.merchantOrderId ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("phonepe_moid")
        : "");

    if (!merchantOrderId) {
      setStatus("error");
      setMessage("Missing payment reference. Please check My Orders or contact support.");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const verify = async () => {
      attempts += 1;
      try {
        const result = await OrderServices.verifyPhonePePayment({
          merchantOrderId,
        });

        if (cancelled) return;

        if (result?.paid) {
          setStatus("success");
          setOrderId(result.orderId || "");
          setMessage("Payment successful! Your order is confirmed.");
          notifySuccess("Payment successful!");
          Cookies.remove("couponInfo");
          try {
            await clearCartWithDB();
          } catch (_) {}
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("phonepe_moid");
            sessionStorage.removeItem("phonepe_order_id");
          }
          setTimeout(() => {
            if (result.orderId) router.replace(`/order/${result.orderId}`);
            else router.replace("/user/my-orders");
          }, 1200);
          return;
        }

        if (result?.pending || result?.paymentStatus === "Pending") {
          setStatus("pending");
          setMessage("Payment is still processing. Checking again...");
          if (attempts < 8) {
            setTimeout(verify, 2500);
          } else {
            setStatus("pending");
            setMessage(
              "Payment is pending confirmation. If money was deducted, your order will update automatically. You can also check My Orders."
            );
          }
          return;
        }

        setStatus("failed");
        setMessage(
          result?.message ||
            "Payment was not completed. You can try again from checkout."
        );
        notifyError("Payment not completed.");
      } catch (err) {
        if (cancelled) return;
        console.error("PhonePe verify error:", err);
        if (attempts < 5) {
          setTimeout(verify, 2500);
          return;
        }
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "Could not verify payment right now. If amount was deducted, please contact support with your payment reference."
        );
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.moid, router.query.merchantOrderId]);

  return (
    <Layout title="Payment Status" description="PhonePe payment confirmation">
      <div className="min-h-[70vh] bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full border border-neutral-800 bg-[#0A0A0A] rounded-2xl p-8 text-center">
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-bold mb-4">
            PhonePe Payment
          </p>
          <h1 className="text-2xl font-black mb-3">
            {status === "success"
              ? "Payment Successful"
              : status === "failed"
              ? "Payment Failed"
              : status === "pending"
              ? "Payment Pending"
              : status === "error"
              ? "Verification Issue"
              : "Verifying Payment"}
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6">{message}</p>
          {orderId && (
            <button
              type="button"
              onClick={() => router.push(`/order/${orderId}`)}
              className="w-full h-11 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded-xl"
            >
              View Order
            </button>
          )}
          {(status === "failed" || status === "error") && (
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="w-full h-11 mt-3 border border-neutral-700 text-white font-bold uppercase tracking-wider rounded-xl"
            >
              Back to Checkout
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PhonePeReturnPage;

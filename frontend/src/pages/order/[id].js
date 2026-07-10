import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { IoBagCheckOutline } from "react-icons/io5";

import Layout from "@layout/Layout";
import Loading from "@components/preloader/Loading";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import { setToken } from "@services/httpServices";

const Order = ({ params }) => {
  const orderId = params.id;

  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser?.token) setToken(parsedUser.token);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const { data, error, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await OrderServices.getOrderById(orderId),
    enabled: !!orderId,
  });

  const { showingTranslateValue, getNumberTwo, currency } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();

  return (
    <Layout title="Order Confirmed" description="Order confirmation page">
      <style jsx global>{`
        body {
          background-color: #050505 !important;
          color: #ffffff !important;
        }
      `}</style>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : error ? (
        <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
          {error?.response?.data?.message || error?.message || String(error)}
        </h2>
      ) : (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
              <IoBagCheckOutline className="text-3xl text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Order Confirmed</h1>
            <p className="text-sm text-neutral-400">
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_first
              ) || "Thank you"}{" "}
              <span className="text-white font-semibold">{data?.user_info?.name}</span>
              {", "}
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_last
              ) || "your order has been received!"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0D0D0D] p-6 space-y-4">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-neutral-500">Order ID</span>
              <span className="font-mono text-[#D4AF37]">
                #{data?._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-neutral-500">Date</span>
              <span className="text-white">
                {data?.createdAt
                  ? dayjs(data.createdAt).format("DD MMM YYYY · hh:mm A")
                  : "-"}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-neutral-500">Status</span>
              <span className="text-white font-medium">{data?.status || "Pending"}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-neutral-500">Payment</span>
              <span className="text-white">{data?.paymentMethod || "-"}</span>
            </div>

            {data?.cart?.length > 0 && (
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Items
                </p>
                {data.cart.map((item, index) => (
                  <div
                    key={`${item._id || item.productId || index}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-neutral-300">
                      {item.title} × {item.quantity || 1}
                    </span>
                    <span className="text-white font-medium shrink-0">
                      {currency}
                      {getNumberTwo(item.itemTotal || item.price * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-neutral-800 text-base font-bold">
              <span className="text-white">Total</span>
              <span className="text-[#D4AF37]">
                {currency}
                {getNumberTwo(data?.total || 0)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link
              href="/user/my-orders"
              className="inline-flex items-center justify-center bg-[#D4AF37] text-black text-sm font-bold h-10 px-6 rounded-full hover:bg-[#bfa032] transition-colors"
            >
              My Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-white/10 text-white border border-white/20 text-sm font-bold h-10 px-6 rounded-full hover:bg-white/20 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps = ({ params }) => ({
  props: { params },
});

export default dynamic(() => Promise.resolve(Order), { ssr: false });

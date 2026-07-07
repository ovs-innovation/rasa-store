import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { notifyError, notifySuccess } from "@utils/toast";
import ReactToPrint from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

//internal import

import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import Invoice from "@components/invoice/Invoice";
import Loading from "@components/preloader/Loading";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import OrderTracking from "@components/order/OrderTracking";
import { setToken } from "@services/httpServices";
import { downloadInvoicePdf } from "@utils/downloadInvoicePdf";
const Order = ({ params }) => {
  const printRef = useRef();
  const orderId = params.id;

  // Set auth token before fetching order
  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser?.token) {
        setToken(parsedUser.token);
      }
    }
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDownloadPdf = async () => {
    if (!printRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await downloadInvoicePdf(
        printRef.current,
        `Invoice-${data?.invoice || orderId}`
      );
      notifySuccess("Invoice downloaded");
    } catch (err) {
      notifyError(err?.message || "Failed to download invoice");
    } finally {
      setPdfLoading(false);
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => await OrderServices.getOrderById(orderId),
    enabled: !!orderId,
  });

  const { showingTranslateValue, getNumberTwo, currency } = useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  const handleCopyTracking = (num) => {
    navigator.clipboard.writeText(num);
    notifySuccess("Tracking number copied!");
  };

  return (
    <Layout title="Invoice" description="order confirmation page">
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
        <div className="max-w-screen-2xl mx-auto py-10 px-3 sm:px-6">
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-2xl mb-5 px-4 py-3">
            <label className="text-sm font-semibold">
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_first
              )}{" "}
              <span className="font-extrabold text-white">
                {data?.user_info?.name},
              </span>{" "}
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.invoice_message_last
              )}
            </label>
          </div>
          <div className="w-full">
            <div className="flex flex-wrap gap-3 mb-8">
               <button
                 type="button"
                 onClick={handleDownloadPdf}
                 disabled={pdfLoading}
                 className="flex items-center justify-center bg-[#D4AF37] text-black transition-all text-sm font-bold h-10 py-2 px-6 rounded-full hover:bg-[#bfa032] shadow-md cursor-pointer disabled:opacity-60"
               >
                 {pdfLoading ? "Preparing..." : "Download Invoice"}
                 <IoCloudDownloadOutline className="ml-2" />
               </button>
               {isMounted && (
                 <ReactToPrint
                   trigger={() => (
                     <button className="flex items-center justify-center bg-white/10 text-white border border-white/20 transition-all text-sm font-bold h-10 py-2 px-6 rounded-full hover:bg-white/20 shadow-md cursor-pointer">
                       Print Invoice
                     </button>
                   )}
                   content={() => printRef.current}
                 />
               )}
            </div>

            {/* Live Tracking Section */}
            {(data.trackingNumber || data.status === "Shipped" || data.status === "OutForDelivery") && (
               <div className="mb-10">
                  <OrderTracking order={data} />
               </div>
            )}

            <Invoice
              data={data}
              printRef={printRef}
              currency={currency}
              globalSetting={globalSetting}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export const getServerSideProps = ({ params }) => {
  return {
    props: { params },
  };
};

export default dynamic(() => Promise.resolve(Order), { ssr: false });

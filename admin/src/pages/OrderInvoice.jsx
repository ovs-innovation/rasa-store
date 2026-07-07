import { useParams, useHistory, useLocation } from "react-router-dom";
import ReactToPrint from "react-to-print";
import React, { useContext, useRef, useState, useEffect } from "react";
import { FiPrinter, FiMail, FiArrowLeft } from "react-icons/fi";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { Button } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";

//internal import
import useAsync from "@/hooks/useAsync";
import useError from "@/hooks/useError";
import { notifyError, notifySuccess } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";
import OrderServices from "@/services/OrderServices";
import InvoiceLayout from "@/components/invoice/InvoiceLayout";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import SelectStatus from "@/components/form/selectOption/SelectStatus";
import { downloadInvoicePdf } from "@/utils/downloadInvoicePdf";

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { state } = useContext(AdminContext);
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const printRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data, loading, error } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  const { handleErrorNotification } = useError();
  const { handleDisableForDemo } = useDisableForDemo();

  const { currency, globalSetting, showDateFormat, getNumberTwo } =
    useUtilsFunction();

  const handleDownloadPdf = async () => {
    if (!printRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await downloadInvoicePdf(
        printRef.current,
        `Invoice-${data?.invoice || id}`
      );
      notifySuccess("Invoice downloaded");
    } catch (err) {
      notifyError(err?.message || "Failed to download invoice");
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("download") !== "1" || !data || loading) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!printRef.current || cancelled) return;

      setPdfLoading(true);
      try {
        await downloadInvoicePdf(
          printRef.current,
          `Invoice-${data?.invoice || id}`
        );
        if (!cancelled) notifySuccess("Invoice downloaded");
      } catch (err) {
        if (!cancelled) {
          notifyError(err?.message || "Failed to download invoice");
        }
      } finally {
        if (!cancelled) {
          setPdfLoading(false);
          history.replace(`/order/${id}`);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, loading, location.search, id, history]);

  const handleEmailInvoice = async (inv) => {
    if (handleDisableForDemo()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...inv,
        date: showDateFormat(inv.createdAt),
        company_info: {
          currency: currency,
          vat_number: globalSetting?.vat_number,
          company: globalSetting?.company_name,
          address: globalSetting?.address,
          phone: globalSetting?.contact,
          email: globalSetting?.email,
          website: globalSetting?.website,
          from_email: globalSetting?.from_email,
        },
      };

      const res = await OrderServices.sendEmailInvoiceToCustomer(updatedData);
      notifySuccess(res.message);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      handleErrorNotification(err, "handleEmailInvoice");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4 mt-2">
        <Button
          layout="link"
          onClick={() => history.goBack()}
          className="p-0 text-store-500 hover:text-store-600 h-auto"
        >
          <FiArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            {t("Back")}
          </span>
        </Button>
      </div>

      <PageTitle>{t("InvoicePageTittle")}</PageTitle>

      {loading ? (
        <Loading loading={loading} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : (
        <div className="max-w-screen-2xl mx-auto pb-10">
          <div className="mb-8 flex md:flex-row flex-col items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="flex items-center justify-center bg-[#D4AF37] text-black transition-all text-sm font-bold h-10 py-2 px-6 rounded-full hover:bg-[#bfa032] shadow-md cursor-pointer disabled:opacity-60"
            >
              {pdfLoading ? "Preparing..." : "Download Invoice"}
              <IoCloudDownloadOutline className="ml-2" />
            </button>

            <div className="flex md:mt-0 mt-3 gap-3 md:w-auto w-full flex-wrap">
              {globalSetting?.email_to_customer && (
                <div className="flex justify-end md:w-auto w-full">
                  {isSubmitting ? (
                    <Button disabled type="button" className="h-10 px-6">
                      <img
                        src={spinnerLoadingImage}
                        alt="Loading"
                        width={20}
                        height={10}
                      />
                      <span className="font-serif ml-2 font-light">
                        Processing
                      </span>
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEmailInvoice(data)}
                      className="flex items-center text-sm font-medium px-5 py-2 rounded-full text-white bg-teal-500 hover:bg-teal-600 h-10 justify-center"
                    >
                      Email Invoice
                      <FiMail className="ml-2" />
                    </button>
                  )}
                </div>
              )}

              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className="flex items-center text-sm font-medium px-5 py-2 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 h-10 justify-center"
                  >
                    Print Invoice
                    <FiPrinter className="ml-2" />
                  </button>
                )}
                content={() => printRef.current}
              />

              <div className="flex items-center gap-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Status:
                </div>
                <div className="w-48">
                  <SelectStatus id={id} order={data} />
                </div>
              </div>
            </div>
          </div>

          <InvoiceLayout
            data={data}
            printRef={printRef}
            currency={currency}
            getNumberTwo={getNumberTwo}
          />
        </div>
      )}
    </>
  );
};

export default OrderInvoice;

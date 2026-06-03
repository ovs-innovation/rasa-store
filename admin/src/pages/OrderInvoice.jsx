import { useParams, useHistory } from "react-router-dom";
import ReactToPrint from "react-to-print";
import React, { useContext, useRef, useState } from "react";
import { FiPrinter, FiMail, FiArrowLeft } from "react-icons/fi";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { Button } from "@windmill/react-ui";
import { WindmillContext } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { PDFDownloadLink } from "@react-pdf/renderer";

//internal import
import useAsync from "@/hooks/useAsync";
import useError from "@/hooks/useError";
import { notifyError, notifySuccess } from "@/utils/toast";
import { AdminContext } from "@/context/AdminContext";
import { SidebarContext } from "@/context/SidebarContext";
import OrderServices from "@/services/OrderServices";
import InvoiceLayout from "@/components/invoice/InvoiceLayout";
import Loading from "@/components/preloader/Loading";
import PageTitle from "@/components/Typography/PageTitle";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import InvoiceForDownload from "@/components/invoice/InvoiceForDownload";
import SelectStatus from "@/components/form/selectOption/SelectStatus";

const OrderInvoice = () => {
  const { t } = useTranslation();
  const { mode } = useContext(WindmillContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const { id } = useParams();
  const history = useHistory();
  const printRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error } = useAsync(() =>
    OrderServices.getOrderById(id)
  );

  const { handleErrorNotification } = useError();
  const { handleDisableForDemo } = useDisableForDemo();

  // console.log("data", data);

  const { currency, globalSetting, showDateFormat, getNumberTwo } =
    useUtilsFunction();

  const handleEmailInvoice = async (inv) => {
    // console.log("inv", inv);
    if (handleDisableForDemo()) {
      return; // Exit the function if the feature is disabled
    }

    // if (adminInfo?.role !== "Super Admin")
    //   return notifyError(
    //     "You don't have permission to sent email of this order!"
    //   );
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
      // console.log("updatedData", updatedData);

      // return setIsSubmitting(false);
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
          <span className="text-sm font-bold uppercase tracking-wider">{t("Back")}</span>
        </Button>
      </div>

      <PageTitle> {t("InvoicePageTittle")} </PageTitle>

      <div
        ref={printRef}
        className="bg-white dark:bg-gray-800 mb-4 p-6 lg:p-8 rounded-xl shadow-sm overflow-hidden"
      >
        {!loading && !error && (
          <div className="mb-8 flex md:flex-row flex-col items-center justify-between border-b pb-4 border-gray-100">
            <PDFDownloadLink
              document={
                <InvoiceForDownload
                  data={data}
                  currency={currency}
                  globalSetting={globalSetting}
                  getNumberTwo={getNumberTwo}
                  logo={globalSetting?.logo}
                  isWholesaler={
                    data?.user_info?.role?.toString().toLowerCase().trim() === "wholesaler" ||
                    data?.user?.role?.toString().toLowerCase().trim() === "wholesaler" ||
                    data?.role?.toString().toLowerCase().trim() === "wholesaler" ||
                    data?.user_info?.userType?.toString().toLowerCase().trim() === "wholesaler" ||
                    data?.userType?.toString().toLowerCase().trim() === "wholesaler" ||
                    data?.cart?.[0]?.wholePrice > 0
                  }
                />
              }
              fileName="Invoice"
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  "Loading..."
                ) : (
                  <button className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-store-500 border border-transparent active:bg-store-600 hover:bg-store-600  w-auto cursor-pointer">
                    Download Invoice
                    <span className="ml-2 text-base">
                      <IoCloudDownloadOutline />
                    </span>
                  </button>
                )
              }
            </PDFDownloadLink>

            <div className="flex md:mt-0 mt-3 gap-4 md:w-auto w-full">
              {globalSetting?.email_to_customer && (
                <div className="flex justify-end md:w-auto w-full">
                  {isSubmitting ? (
                    <Button
                      disabled={true}
                      type="button"
                      className="text-sm h-10 leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-white px-2 ml-4 md:px-4 lg:px-6 py-4 md:py-3.5 lg:py-4 hover:text-white bg-store-400 hover:bg-store-500"
                    >
                      <img
                        src={spinnerLoadingImage}
                        alt="Loading"
                        width={20}
                        height={10}
                      />{" "}
                      <span className="font-serif ml-2 font-light">
                        {" "}
                        Processing
                      </span>
                    </Button>
                  ) : (
                    <button
                      onClick={() => handleEmailInvoice(data)}
                      className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-teal-500 border border-transparent active:bg-teal-600 hover:bg-teal-600  md:w-auto w-full h-10 justify-center"
                    >
                      Email Invoice
                      <span className="ml-2">
                        <FiMail />
                      </span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end md:w-auto w-full h-10">
                <ReactToPrint
                  trigger={() => (
                    <button className="flex items-center text-sm leading-5 transition-colors duration-150 font-medium focus:outline-none px-5 py-2 rounded-md text-white bg-indigo-500 border border-transparent active:bg-indigo-600 hover:bg-indigo-600  md:w-auto w-full h-10 justify-center">
                      Print Invoice
                      <span className="ml-2">
                        <FiPrinter />
                      </span>
                    </button>
                  )}
                  content={() => printRef.current}
                />
              </div>

              <div className="flex items-center gap-4">
                 <div className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.1em] mr-1 text-gray-500">Status:</div>
                 <div className="w-48">
                    <SelectStatus id={id} order={data} />
                 </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <Loading loading={loading} />
        ) : error ? (
          <span className="text-center mx-auto text-red-500">{error}</span>
        ) : (
          <>
            {data?.refund?.reason && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <h3 className="text-red-800 font-bold text-lg mb-1">Refund Requested</h3>
                <p className="text-red-700"><strong>Reason:</strong> {data.refund.reason}</p>
                {data.refund.note && <p className="text-red-700"><strong>Note:</strong> {data.refund.note}</p>}
              </div>
            )}
            <InvoiceLayout
              data={data}
              currency={currency}
              globalSetting={globalSetting}
              getNumberTwo={getNumberTwo}
              printRef={printRef} />
          </>
        )}
      </div>
    </>
  );
};

export default OrderInvoice;

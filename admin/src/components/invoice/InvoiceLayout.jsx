import dayjs from "dayjs";
import React from "react";

// internal import
import InvoiceOrderTable from "@/components/invoice/InvoiceOrderTable";

// Modern invoice layout copied from frontend Invoice.js, adapted for admin
const InvoiceLayout = ({ data, printRef, globalSetting, currency, getNumberTwo }) => {
  const mrpTotal =
    data?.cart?.reduce((sum, item) => {
      const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
      const qty = item.quantity || 1;
      return sum + mrp * qty;
    }, 0) || 0;

  const totalDiscount =
    data?.cart?.reduce((sum, item) => {
      const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
      const salePrice = item.price ?? 0;
      const qty = item.quantity || 1;
      return sum + (mrp - salePrice) * qty;
    }, 0) || 0;

  // Calculate total GST - use taxSummary from order data (same as checkout), fallback to calculating from cart
  const totalGst = data?.taxSummary?.exclusiveTax > 0 
    ? data.taxSummary.exclusiveTax 
    : data?.cart?.reduce((sum, item) => {
        const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
        const salePrice = item.price ?? 0;
        const qty = item.quantity || 1;
        const discount = mrp - salePrice;
        const sellingPrice = mrp - discount;
        const gstRate = parseFloat(item.taxRate || item.gstRate || item.gstPercentage || 12);
        const gstAmount = (sellingPrice * qty * gstRate) / 100;
        return sum + gstAmount;
      }, 0) || 0;

  const shippingCharge = data?.shippingCost || 0;
  const payableAmount = data?.total || 0;

  const formatInvoiceNumber = (invoice, createdAt) => {
    if (!invoice) return "-";
    const invStr = String(invoice).trim();

    if (invStr.startsWith("FK/")) return invStr;

    const year = createdAt
      ? dayjs(createdAt).format("YYYY")
      : dayjs().format("YYYY");

    return `FK/${year}/${invStr}`;
  };


  return (
    <div ref={printRef} className="">
      <div className="px-4 pb-1 pt-4 rounded-t-xl">
        <div className="flex gap-x-5 pb-4 border-b border-gray-50 items-start">
          {/* Logo + Company Info */}
          <div className="text-left flex flex-col items-start gap-0">
            <h2 className="text-lg font-serif font-semibold">
              <a href="/" rel="noreferrer">
                <img
                  width={120}
                  height={40}
                  src={globalSetting?.logo || "/favicon-transparent.png"}
                  alt="logo"
                />
              </a>
            </h2>
              
            {/* Bill From - from common settings */}
            <div className="flex-1 min-w-[0] items-start">
              <p className="text-semibold md:text-base font-semibold text-gray-900">
                {globalSetting?.company_name || "AQOSU RASA PRIVATE LIMITED"}
              </p>
              <p className="text-sm text-gray-600 leading-snug">
                {globalSetting?.address ||
                  "GF D-90, KH NO-1100, RAJNAGAR COLONY, BEHTA HAJIPUR, LONI BORDER, LONI, GHAZIABAD, UTTAR PRADESH, Landmark: NEAR MUNISH PUBLIC, Pin: 201102"}
              </p>
              {/* Email & Phone */}
                <div className="flex gap-x-3">
                  <div className="flex gap-x-2 text-sm text-gray-600 leading-snug mt-0.5">
                    <div className="font-semibold">Email:</div>
                    <div>{globalSetting?.email || "info@rasastore.com"}</div>
                  </div>
                  <div className="flex gap-x-2 text-sm text-gray-600 leading-snug mt-0.5">
                    <div className="font-semibold">Phone No:</div>
                    <div>{globalSetting?.contact || "07112255930"}</div>
                  </div>
                </div>
               
              <div className="flex gap-x-2">
                {/* GST */}
                <div className="flex gap-x-2 text-sm text-gray-600 leading-snug mt-0.5">
                  <div className="font-semibold">GST NO.:</div>
                  <div>{globalSetting?.gstin || "09AAZCA5886C1ZV"}</div>
                </div>
                {/* CIN */}
                {globalSetting?.cin && (
                  <div className="flex gap-x-2 text-sm text-gray-600 leading-snug mt-0.5">
                    <div className="font-semibold">CIN:</div>
                    <div>{globalSetting.cin}</div>
                  </div>
                )}
              </div>
              {/* DL */}
              <div className="flex gap-x-2 text-sm text-gray-600 leading-snug mt-0.5">
                <div className="font-semibold">DL No:</div>
                <div>{globalSetting?.dl_number || "UP14200002337, UP14210002215"}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-8">
            <div className="flex flex gap-1 text-lg gap-x-10 text-store-700">
              <div className="pl-3">
                <span className="font-semibold">Invoice No :</span>{" "}
                <span>{formatInvoiceNumber(data?.invoice, data?.createdAt)}</span>
              </div>
              <div className="border-l border-store-600 pl-3">
                <span className="font-semibold">Order ID :</span>{" "}
                <span>{data?._id || data?.orderId || "-"}</span>
              </div>
              <div className="border-l border-store-600 pl-3">
                <span className="font-semibold">Date:</span>{" "}
                {data?.createdAt
                  ? dayjs(data.createdAt).format("DD MMM YYYY")
                  : "-"}
              </div>
            </div>

            <div className="border-l-2 border-[#006E44] bg-white px-5 flex flex-row flex-wrap items-center justify-between gap-2">
              {/* Bill To - user address details (styled) */}
              <div className="flex-1 min-w-[0]">
                <span className="font-bold font-serif text-xs md:text-sm uppercase text-store-700 block mt-1">
                  Bill To:
                </span>
                <div className="mt-1 text-[11px] md:text-base text-gray-700 leading-relaxed space-y-0.5">
                  <p>
                    <span className="font-semibold text-gray-800">
                      Order Placed By:
                    </span>{" "}
                    <span>{data?.user_info?.name || "-"}</span>
                  </p>

                  <p className="">
                    <span className="font-semibold text-gray-800">Email:</span>{" "}
                    <span>{data?.user_info?.email || "-"}</span> 
                    {data?.user_info?.contact && (
                      <span className="ml-3">
                        <span className="font-semibold text-gray-800">Phone:</span>{" "}
                        {data.user_info.contact}
                      </span>
                    )}
                  </p>

                  {(data?.user_info?.address || data?.user_info?.city || data?.user_info?.country || data?.user_info?.zipCode) && (
                    <p>
                      <span className="font-semibold text-gray-800">
                        Address:
                      </span>{" "}
                      <span>
                        {data?.user_info?.address}
                        {data?.user_info?.address && (data?.user_info?.city || data?.user_info?.country || data?.user_info?.zipCode) ? ", " : ""}
                        {data?.user_info?.city}
                        {data?.user_info?.city && (data?.user_info?.country || data?.user_info?.zipCode) ? ", " : ""}
                        {data?.user_info?.country}
                        {data?.user_info?.country && data?.user_info?.zipCode ? ", " : ""}
                        {data?.user_info?.zipCode}
                      </span>
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="s border-t-4 mx-4 border-store-800">
        {/* Desktop / Tablet view: product table with highlighted header like example */}
        <div className="hidden md:block print:block overflow-hidden lg:overflow-visible">
          <div className="-my-2 overflow-x-auto print:overflow-visible">
            <table className="table-auto min-w-full border border-gray-200 print:table-fixed">
              <thead>
                {/* Column headers */}
                <tr className="text-xs bg-store-700 text-white">
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-left w-12">
                    Sr.
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-left w-64">
                    Product Name
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-center w-20">
                    HSN
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-center w-16">
                    Qty
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-center w-24">
                    MRP
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-center w-24">
                    Discount
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-center w-20">
                    GST %
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-center w-24">
                    GST Amt
                  </th>
                  <th className="font-serif font-semibold px-4 py-2 uppercase tracking-wider text-right">
                    Pay. AMT
                  </th>
                </tr>
              </thead>
              <InvoiceOrderTable
                data={data}
                currency={currency}
                getNumberTwo={getNumberTwo}
              />
            </table>
          </div>
        </div>

        {/* Mobile view */}
        <div className="block md:hidden print:hidden px-4 my-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
            {data?.cart?.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    Qty: {item.quantity}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                  {item.title}
                </p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600">
                    Item: {currency}
                    {getNumberTwo(item.price)}
                  </span>
                  <span className="font-semibold text-gray-600">
                    Total: {currency}
                    {getNumberTwo(item.itemTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approved badge (left) + amount summary (right) under table */}
      <div className="px-4 pb-6 pt-4 flex flex-row items-start justify-between gap-4">
        {/* Left: Approved by a Registered Pharmacist tag */}
        <div className="flex flex-col items-start w-full">
          <div className="border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm text-gray-800">
            <div className="pb-6 flex justify-start">
              <div className="w-full md:w-64 flex flex-col items-start md:items-start text-xs md:text-sm space-y-0.5">
                <div className="w-24 md:ml-auto" />
                <p className="font-semibold text-gray-700 leading-snug">
                  {globalSetting?.pharmacist_name || "Registered Pharmacist"}
                </p>
                <p className="text-[11px] text-gray-500 leading-snug">
                  {globalSetting?.company_name || "RASA"}
                </p>
                {globalSetting?.website && (
                  <p className="text-[11px] text-store-600 leading-snug">
                    {globalSetting.website}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: amount breakdown summary */}
        <div className="invoice-amount-summary md:w-[580px] lg:w-[720px]">
          <div className="bg-white border border-gray-200 rounded-md text-xs md:text-sm text-gray-800 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>MRP Total</span>
              <span className="font-DejaVu">
                {currency}
                {getNumberTwo(mrpTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>Total Discount</span>
              <span className="font-DejaVu text-green-600">
                -{currency}{getNumberTwo(totalDiscount)}
              </span>
            </div>
            {data?.coupon?.couponCode && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-green-50">
                <span className="text-green-700">
                  Coupon Applied: <span className="font-semibold">{data.coupon.couponCode}</span>
                </span>
                <span className="font-DejaVu text-green-600 font-semibold">
                  -{currency}{getNumberTwo(data?.coupon?.discountAmount || data?.discount || 0)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>GST {data?.taxSummary?.gstRate ? `(${data.taxSummary.gstRate}%)` : ""}</span>
              <span className="font-DejaVu">
                {currency}
                {getNumberTwo(totalGst)}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>Shipping Cost</span>
              <span className="font-DejaVu text-green-600">
                {shippingCharge > 0 ? `${currency}${getNumberTwo(shippingCharge)}` : "FREE"}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 font-semibold">
              <span>Estimated Payable</span>
              <span className="font-DejaVu">
                {currency}
                {getNumberTwo(payableAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceLayout;



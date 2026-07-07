import dayjs from "dayjs";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";

const Invoice = ({ data, printRef, globalSetting, currency }) => {
  const { getNumberTwo, showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();

  // Aggregate values for summary box
  const mrpTotal =
    data?.cart?.reduce((sum, item) => {
      const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
      const qty = item.quantity || 1;
      return sum + mrp * qty;
    }, 0) || 0;

  const totalDiscount = data?.cart?.reduce((sum, item) => {
    const mrp = item.mrp ?? item.originalPrice ?? item.price ?? 0;
    const salePrice = item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + ((mrp - salePrice) * qty);
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
    <div 
      ref={printRef} 
      className="max-w-4xl mx-auto bg-[#FFF5F6] text-gray-800 p-6 md:p-10 rounded-[2rem] shadow-xl border border-[#f5d6da] font-sans relative overflow-hidden invoice-container"
    >
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Playfair+Display:ital,wght@1,600&display=swap');
        
        .cursive-title {
          font-family: 'Dancing Script', 'Playfair Display', cursive, serif;
        }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .invoice-container {
            background-color: #FFF5F6 !important;
            color: #1f2937 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 10mm 15mm !important;
            max-width: 100% !important;
            width: 100% !important;
            height: 100vh !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-white {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .text-gray-900 {
            color: #111827 !important;
          }
          .text-neutral-500 {
            color: #737373 !important;
          }
        }
      `}</style>

      {/* Top Banner Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pb-6 mb-8 relative border-b border-[#f5d6da]">
        {/* Left Side: Brand Logo Badge - Plain */}
        <div className="p-4 max-w-[280px]">
          <div className="mb-2">
            <Image
              width={140}
              height={45}
              src={pickBrandLogo(
                storeCustomizationSetting?.navbar?.logo,
                storeCustomizationSetting?.footer?.block4_logo
              )}
              alt="logo"
              className="object-contain"
            />
          </div>
          <p className="text-[9px] tracking-[0.25em] font-bold text-[#d67b8c] uppercase">
            SNEAKERS • BAGS • ACCESSORIES
          </p>
        </div>

        {/* Right Side: Thank You & Cute Illustration */}
        <div className="flex justify-between items-center md:text-right pl-4">
          <div className="flex-grow">
            <h1 className="cursive-title text-4xl text-[#d67b8c] leading-none mb-1">
              Thank You <span className="text-red-400">♥</span>
            </h1>
            <p className="text-xs uppercase font-extrabold tracking-wider text-gray-900">
              FOR SHOPPING WITH US!
            </p>
            <p className="text-[10px] text-gray-500 italic mt-0.5">
              Your style, our passion.
            </p>
          </div>
          
          <div className="w-28 h-20 md:w-32 md:h-24 relative overflow-hidden shrink-0">
            <Image
              src="/invoice_illustration.png"
              alt="invoice header"
              layout="fill"
              objectFit="contain"
              className="object-right"
            />
          </div>
        </div>
      </div>

      {/* Details Row: Invoice (Left) vs Bill To (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-4">
        {/* Invoice Info */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FDF0F2] text-[#d67b8c] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#f5d6da]">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
            INVOICE
          </div>
          
          <div className="grid grid-cols-3 gap-y-2 text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Invoice No.</span>
            <span className="col-span-2 font-bold text-[#d67b8c]">: {formatInvoiceNumber(data?.invoice, data?.createdAt)}</span>
            
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="col-span-2 font-bold text-gray-900">: {data?._id ? data._id.slice(-8).toUpperCase() : "-"}</span>
            
            <span className="text-gray-500 font-medium">Date</span>
            <span className="col-span-2 font-bold text-gray-900">: {data?.createdAt ? dayjs(data.createdAt).format("DD MMMM YYYY") : "-"}</span>
            
            <span className="text-gray-500 font-medium">Payment Method</span>
            <span className="col-span-2 font-bold text-gray-900">: {data?.paymentMethod || "RazorPay"}</span>
          </div>
        </div>

        {/* Bill To Info */}
        <div className="space-y-4 md:border-l border-[#f5d6da] md:pl-8">
          <div className="inline-flex items-center gap-2 bg-[#FDF0F2] text-[#d67b8c] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#f5d6da]">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            BILL TO
          </div>
          
          <div className="grid grid-cols-3 gap-y-2 text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Name</span>
            <span className="col-span-2 font-bold text-gray-900">: {data?.user_info?.name || "-"}</span>
            
            <span className="text-gray-500 font-medium">Phone</span>
            <span className="col-span-2 font-bold text-gray-900">: {data?.user_info?.contact || "-"}</span>
            
            <span className="text-gray-500 font-medium">Address</span>
            <span className="col-span-2 font-bold text-gray-750 leading-relaxed">
              : {data?.user_info?.address}, {data?.user_info?.city}, {data?.user_info?.country} - {data?.user_info?.zipCode}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Address Box - Plain */}
      <div className="border border-[#f5d6da] bg-white/70 rounded-2xl p-5 mb-8 text-xs sm:text-sm">
        <h3 className="font-bold text-[#d67b8c] uppercase tracking-wider mb-2 text-xs flex items-center gap-1.5">
          <span>🎁 Deliver To:</span>
        </h3>
        <p className="font-semibold text-gray-900">{data?.user_info?.name || "-"}</p>
        {data?.user_info?.contact && <p className="text-gray-650 mt-0.5">📞 {data.user_info.contact}</p>}
        {(data?.user_info?.address || data?.user_info?.city) && (
          <p className="text-gray-650 mt-1 leading-relaxed">
            📍 {data?.user_info?.address}, {data?.user_info?.city}, {data?.user_info?.country} - {data?.user_info?.zipCode}
          </p>
        )}
      </div>

      {/* Product Items Table */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-[#f5d6da] bg-white">
        <table className="w-full text-xs sm:text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#FDF0F2] text-gray-800 text-xs uppercase tracking-wider font-bold border-b border-[#f5d6da]">
              <th className="py-3.5 px-4 w-12 text-center">Sr.</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4 text-center w-28">Size / Color</th>
              <th className="py-3.5 px-4 text-center w-16">Qty</th>
              <th className="py-3.5 px-4 text-right w-24">Price</th>
              <th className="py-3.5 px-4 text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.cart?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/50">
                <td className="py-4 px-4 text-center font-medium text-gray-400">{index + 1}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-snug">{item.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.categoryName || "Premium Item"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-semibold text-gray-700">
                  {item.variantName || "-"}
                </td>
                <td className="py-4 px-4 text-center font-bold text-gray-900">{item.quantity}</td>
                <td className="py-4 px-4 text-right font-medium text-gray-650">
                  {currency}{getNumberTwo(item.price)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-gray-900">
                  {currency}{getNumberTwo(item.itemTotal || (item.price * item.quantity))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Under Table: Custom Message vs Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
        {/* Left Side Message Card */}
        <div className="bg-[#FDF0F2]/55 border border-dashed border-[#d67b8c]/35 rounded-2xl p-5 flex items-start gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm shrink-0 border border-[#f5d6da]">
            <svg className="w-5 h-5 text-[#d67b8c]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" /><path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" /></svg>
          </div>
          <div>
            <p className="text-xs text-gray-800 leading-relaxed font-bold">
              {showingTranslateValue(storeCustomizationSetting?.dashboard?.invoice_greeting_message) || "We pack every order with love and care. ♥"}
            </p>
          </div>
        </div>

        {/* Right Side Price Details */}
        <div className="space-y-3 text-xs sm:text-sm text-gray-600 ml-auto w-full max-w-sm">
          <div className="flex justify-between px-2">
            <span>SUBTOTAL</span>
            <span className="font-bold text-gray-900">{currency}{getNumberTwo(mrpTotal)}</span>
          </div>
          {shippingCharge > 0 ? (
            <div className="flex justify-between px-2">
              <span>SHIPPING</span>
              <span className="font-bold text-gray-900">{currency}{getNumberTwo(shippingCharge)}</span>
            </div>
          ) : (
            <div className="flex justify-between px-2 text-[#d67b8c] font-semibold">
              <span>SHIPPING</span>
              <span>FREE</span>
            </div>
          )}
          {totalDiscount > 0 && (
            <div className="flex justify-between px-2 text-red-500 font-semibold">
              <span>DISCOUNT</span>
              <span>-{currency}{getNumberTwo(totalDiscount)}</span>
            </div>
          )}
          
          <div className="border-t border-[#f5d6da] pt-3 flex justify-between items-center text-sm font-bold text-gray-900 px-2">
            <span className="uppercase tracking-wider">GRAND TOTAL</span>
            <span className="text-[#d67b8c] font-black text-base">{currency}{getNumberTwo(payableAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left text-xs text-gray-600">
        {/* Left column - Plain */}
        <div className="space-y-1 border-l-2 border-[#d67b8c] pl-4 max-w-[260px] mx-auto md:mx-0">
          <p className="font-bold text-[#d67b8c]">Need Help? 💬</p>
          <p className="font-semibold text-gray-800">WhatsApp: +91 9731308713</p>
          <p className="text-[10px] text-gray-500">workwithrasa@gmail.com</p>
        </div>

        {/* Center column circular stamp */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full border border-dashed border-[#d67b8c] flex flex-col items-center justify-center p-2 text-[9px] uppercase tracking-wider font-extrabold text-center text-gray-500">
            <span>Rasa Store</span>
            <div className="w-4 h-4 my-0.5 relative">
              <Image
                src="/favicon.png"
                alt="stamp"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span>Thank You</span>
          </div>
        </div>

        {/* Right column */}
        <div className="md:text-right space-y-1 font-medium">
          <p className="text-gray-900 font-extrabold">Stay Connected With Us</p>
          <p className="text-[#d67b8c] font-bold text-xs">Instagram: @kicksbyrasaa</p>
          <p className="text-gray-500 tracking-wider">www.therasastore.in</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

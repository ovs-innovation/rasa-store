import React from "react";
import { useQuery } from "@tanstack/react-query";

import useUtilsFunction from "@/hooks/useUtilsFunction";
import SettingServices from "@/services/SettingServices";
import { pickBrandLogo } from "@/utils/brandAssets";

const DEFAULT_GREETING =
  "Thank you for choosing The Rasa Store. Your order means the world to us — every piece is packed with love, care, and a little extra magic. We cannot wait for you to unbox your new favorites!";

const getFirstName = (name) => {
  if (!name) return "Friend";
  return String(name).trim().split(/\s+/)[0] || "Friend";
};

const InvoiceLayout = ({ data, printRef }) => {
  const { showingTranslateValue } = useUtilsFunction();

  const { data: storeCustomizationSetting } = useQuery({
    queryKey: ["storeCustomizationSetting"],
    queryFn: async () => await SettingServices.getStoreCustomizationSetting(),
    staleTime: 20 * 60 * 1000,
  });

  const brandLogo = pickBrandLogo(
    storeCustomizationSetting?.navbar?.logo,
    storeCustomizationSetting?.footer?.block4_logo
  );

  const greeting =
    showingTranslateValue(
      storeCustomizationSetting?.dashboard?.invoice_greeting_message
    ) || DEFAULT_GREETING;

  const firstName = getFirstName(data?.user_info?.name);

  return (
    <div
      ref={printRef}
      className="invoice-container relative mx-auto min-h-[297mm] max-w-3xl overflow-hidden rounded-[2rem] border border-[#f5d6da] bg-[#FFF5F6] font-sans text-gray-800 shadow-xl"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Dancing+Script:wght@500;600;700&display=swap');

        .invoice-greeting-script {
          font-family: 'Dancing Script', cursive;
        }

        .invoice-greeting-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        .invoice-container {
          color-scheme: light;
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
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            min-height: 297mm !important;
            max-width: 100% !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, #f8d4dc 0%, transparent 42%), radial-gradient(circle at 80% 85%, #f5e6c8 0%, transparent 40%)",
        }}
      />

      <div className="pointer-events-none absolute inset-6 rounded-[1.75rem] border border-[#f0c4cc]/60" />
      <div className="pointer-events-none absolute inset-10 rounded-[1.5rem] border border-dashed border-[#d67b8c]/25" />

      <div className="relative flex min-h-[297mm] flex-col items-center justify-center px-10 py-20 text-center md:px-16">
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-full border border-[#f5d6da] bg-white/80 shadow-sm">
          <img
            src={brandLogo}
            alt="The Rasa Store"
            crossOrigin="anonymous"
            className="h-10 w-auto max-w-[52px] object-contain"
          />
        </div>

        <p className="invoice-greeting-script mb-3 text-lg tracking-wide text-[#d67b8c]/80 md:text-xl">
          ✦ with love ✦
        </p>

        <h1 className="invoice-greeting-script mb-8 text-5xl leading-tight text-[#d67b8c] md:text-6xl">
          Dear {firstName},
        </h1>

        <div className="mx-auto mb-10 h-px w-24 bg-gradient-to-r from-transparent via-[#d67b8c]/50 to-transparent" />

        <p className="invoice-greeting-serif mx-auto max-w-xl text-2xl leading-relaxed text-gray-700 md:text-3xl md:leading-relaxed">
          {greeting}
        </p>

        <div className="invoice-greeting-script mt-12 text-4xl text-[#d67b8c]/70">
          ♥
        </div>

        <p className="invoice-greeting-serif mt-8 text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
          The Rasa Store
        </p>
      </div>
    </div>
  );
};

export default InvoiceLayout;

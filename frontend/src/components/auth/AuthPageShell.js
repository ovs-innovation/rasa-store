import Link from "next/link";
import Image from "next/image";
import useGetSetting from "@hooks/useGetSetting";
import { FaPrescriptionBottleAlt } from "react-icons/fa";
import { FiShield, FiTruck, FiClock, FiCheck } from "react-icons/fi";

const TRUST_ITEMS = [
  { icon: FiShield, text: "Secure OTP login" },
  { icon: FiTruck, text: "Fast medicine delivery" },
  { icon: FiClock, text: "Takes under a minute" },
];

/**
 * Shared shell for login, signup & complete-profile pages.
 */
const AuthPageShell = ({
  title,
  subtitle,
  children,
  footer,
  alternateLink,
  badge,
}) => {
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const shopName = globalSetting?.shop_name || "Farmacykart";
  const logoSrc =
    storeCustomizationSetting?.navbar?.logo ||
    storeCustomizationSetting?.seo?.favicon ||
    null;

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#f1f3f6] pb-20 lg:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 lg:py-14">
        {/* Flipkart-like 2-panel card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
            {/* Left panel */}
            <div className="bg-store-700 text-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt={shopName}
                      width={44}
                      height={44}
                      className="h-9 w-auto max-w-[44px] object-contain"
                    />
                  ) : (
                    <FaPrescriptionBottleAlt className="text-2xl" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/95">
                    {shopName}
                  </div>
                  <div className="text-xs text-white/75">
                    Trusted medicines. Fast delivery.
                  </div>
                </div>
              </div>

              {badge && (
                <div className="mt-6 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ring-1 ring-white/20">
                  {badge}
                </div>
              )}

              <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {subtitle}
                </p>
              )}

              <ul className="mt-7 space-y-3">
                {TRUST_ITEMS.map(({ text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-white/90">
                    <FiCheck className="h-4 w-4 text-white/90" aria-hidden />
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right panel */}
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              {children}

              {(alternateLink || footer) && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  {alternateLink && (
                    <p className="text-center text-sm text-slate-600">
                      {alternateLink.text}{" "}
                      <Link
                        href={alternateLink.href}
                        className="font-bold text-store-700 hover:text-store-800 hover:underline"
                      >
                        {alternateLink.label}
                      </Link>
                    </p>
                  )}
                  {footer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageShell;

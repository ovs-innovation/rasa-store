import Link from "next/link";
import Image from "next/image";
import useGetSetting from "@hooks/useGetSetting";
import { pickBrandLogo } from "@utils/brandAssets";
import { FiShield, FiTruck, FiClock, FiCheck } from "react-icons/fi";

const TRUST_ITEMS = [
  { icon: FiShield, text: "Secure OTP login" },
  { icon: FiTruck, text: "Fast delivery on every drop" },
  { icon: FiClock, text: "Takes under a minute" },
];

const AuthPageShell = ({
  title,
  subtitle,
  children,
  footer,
  alternateLink,
  badge,
}) => {
  const { globalSetting } = useGetSetting();
  const shopName = globalSetting?.shop_name || "RASA";

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#050505] pb-20 lg:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 lg:py-14">
        <div className="overflow-hidden rounded-2xl bg-[#0D0D0D] shadow-[0_8px_28px_rgba(0,0,0,0.45)] ring-1 ring-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
            <div className="bg-[#111111] text-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 border-r border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#050505] ring-1 ring-neutral-800">
                  <Image
                    src="/rasaLogo.png"
                    alt={shopName}
                    width={48}
                    height={48}
                    className="h-12 w-auto max-w-[48px] object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black uppercase tracking-widest text-white">
                    {shopName}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Premium sneakers & streetwear.
                  </div>
                </div>
              </div>

              {badge && (
                <div className="mt-6 inline-flex items-center rounded-full bg-[#050505] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ring-1 ring-neutral-800 text-[#D4AF37]">
                  {badge}
                </div>
              )}

              <h1 className="mt-6 text-2xl sm:text-3xl font-black leading-tight tracking-tight uppercase">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                  {subtitle}
                </p>
              )}

              <ul className="mt-7 space-y-3">
                {TRUST_ITEMS.map(({ text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-neutral-300">
                    <FiCheck className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-10 bg-[#0D0D0D]">
              {children}

              {(alternateLink || footer) && (
                <div className="mt-6 border-t border-neutral-800 pt-5">
                  {alternateLink && (
                    <p className="text-center text-sm text-neutral-400">
                      {alternateLink.text}{" "}
                      <Link
                        href={alternateLink.href}
                        className="font-bold text-[#D4AF37] hover:underline"
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

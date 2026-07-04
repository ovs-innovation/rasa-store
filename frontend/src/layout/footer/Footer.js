import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Footer = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();

  const block1Links = [
    { title: "New Arrivals", href: "/new-arrivals" },
    { title: "Trending", href: "/trending" },
  ];

  const block2Links = [
    { title: "About Us", href: "/about-us" },
    { title: "Contact", href: "/contact-us" },
    { title: "FAQs", href: "/faq" },
    { title: "Returns Policy", href: "/refund-return-policy" },
  ];

  const block3Links = [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
    { title: "Shipping & Delivery", href: "/shipping-delivery-policy" },
  ];

  return (
    <footer className="bg-[#050505] text-neutral-400 border-t border-neutral-900/80 relative overflow-hidden font-sans">
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[#D4AF37]/5 blur-[100px] pointer-events-none z-0" />

      <div className="mx-auto max-w-screen-2xl px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 py-14 md:py-16">
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block" rel="noreferrer">
              <span className="font-black tracking-[0.2em] text-xl uppercase text-white">
                RASA<span className="text-[#D4AF37]">.</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              {storeCustomizationSetting?.rasaHomepage?.footerIntro ||
                "Your one-stop shop for affordable sneakers, bags, and the latest styles."}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.instagram.com/kicksbyrasaa"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919731308713"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <a
                href="mailto:workwithrasa@gmail.com"
                aria-label="Email"
                className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <FiMail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="rasa-eyebrow !text-neutral-300 !tracking-[0.2em]">
              {showingTranslateValue(storeCustomizationSetting?.footer?.block1_title) || "Shop"}
            </h4>
            <ul className="text-[10px] uppercase tracking-wider font-bold flex flex-col space-y-3">
              {block1Links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-500 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="rasa-eyebrow !text-neutral-300 !tracking-[0.2em]">
              {showingTranslateValue(storeCustomizationSetting?.footer?.block2_title) || "Support"}
            </h4>
            <ul className="text-[10px] uppercase tracking-wider font-bold flex flex-col space-y-3">
              {block2Links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-500 hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h4 className="rasa-eyebrow !text-neutral-300 !tracking-[0.2em]">Contact</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <FaWhatsapp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href="https://wa.me/919731308713"
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  9731308713
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href="mailto:workwithrasa@gmail.com"
                  className="text-neutral-500 hover:text-white transition-colors break-all"
                >
                  workwithrasa@gmail.com
                </a>
              </div>
            </div>
            <ul className="text-[10px] uppercase tracking-wider font-bold flex flex-col space-y-3 pt-2 border-t border-neutral-900/80">
              {block3Links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-600 hover:text-neutral-400 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-neutral-900/60">
          <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-600 font-medium mb-1">
            © {new Date().getFullYear()} Rasa Store. All rights reserved.
          </p>
          <p className="text-[9px] text-neutral-700 leading-relaxed max-w-2xl">
            All trademarks and brand names belong to their respective owners. Product listings are for identification only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Footer = () => {
  const { showingTranslateValue } = useUtilsFunction();
  const { storeCustomizationSetting } = useGetSetting();

  const footer = storeCustomizationSetting?.rasaHomepage?.footer || {};
  const footerEnabled =
    storeCustomizationSetting?.rasaHomepage?.footerSectionEnabled !== false;
  const intro =
    footer.intro ||
    storeCustomizationSetting?.rasaHomepage?.footerIntro ||
    "The Rasa Store.\nYour one-stop shop for affordable sneakers, bags, and the latest styles. If you've seen it, chances are we've got it.";
  const whatsapp = footer.whatsapp || "9731308713";
  const email = footer.email || "workwithrasa@gmail.com";
  const instagram = footer.instagram || "https://www.instagram.com/kicksbyrasaa";
  const whatsappLink = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  const block1Links = [
    { title: "New Arrivals", href: "/new-arrivals" },
    { title: "Trending", href: "/trending" },
  ];

  const block2Links = [
    { title: "About Us", href: "/about-us" },
    { title: "Contact", href: "/contact-us" },
    { title: "FAQs", href: "/faq" },
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
    { title: "Return & Exchange", href: "/return-refund-policy" },
    { title: "Shipping & Delivery", href: "/shipping-delivery-policy" },
  ];

  const block3Links = [];

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
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm whitespace-pre-line">
              {footerEnabled ? intro : ""}
            </p>
            {footerEnabled && (
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all"
              >
                <FiMail className="w-4 h-4" />
              </a>
            </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="rasa-eyebrow !text-neutral-300 !tracking-[0.2em]">
              Explore
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
              Support
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
            {footerEnabled && (
            <>
            <h4 className="rasa-eyebrow !text-neutral-300 !tracking-[0.2em]">Contact</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <FaWhatsapp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  {whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-neutral-500 hover:text-white transition-colors break-all"
                >
                  {email}
                </a>
              </div>
              <p className="text-neutral-500 leading-relaxed pt-1 border-t border-neutral-900/80">
                Bangalore, Karnataka
                <br />
                Pincode: 570037
              </p>
            </div>
            {block3Links.length > 0 && (
              <ul className="text-[10px] uppercase tracking-wider font-bold flex flex-col space-y-3 pt-2 border-t border-neutral-900/80">
                {block3Links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-neutral-600 hover:text-neutral-400 transition-colors">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            </>
            )}
          </div>
        </div>

        <div className="py-6 border-t border-neutral-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-600 font-medium mb-1">
              © {new Date().getFullYear()} RASA Store — Rachana Dharmesh Kelawala. All rights reserved.
            </p>
            <p className="text-[9px] text-neutral-700 leading-relaxed max-w-2xl">
              All trademarks and brand names belong to their respective owners. Product listings are for identification only.
            </p>
          </div>
          <div className="text-[9px] uppercase tracking-[0.15em] text-neutral-600 font-medium md:text-right shrink-0">
            Developed by{" "}
            <a
              href="https://vastoratech.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#D4AF37] hover:text-white transition-colors"
            >
              VastoraTech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

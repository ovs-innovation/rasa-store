import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { IoArrowForward } from "react-icons/io5";
import {
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";
import { FaInstagram } from "react-icons/fa";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronDown,
} from "react-icons/fi";

//internal import
import { getUserSession } from "@lib/auth";
import useGetSetting from "@hooks/useGetSetting";
import useUtilsFunction from "@hooks/useUtilsFunction";
import FeatureCard from "@components/feature-card/FeatureCard";
import NewsletterServices from "@services/NewsletterServices";
import { notifySuccess, notifyError } from "@utils/toast";

const Footer = () => {
  const { t } = useTranslation();
  const userInfo = getUserSession();

  const { showingTranslateValue } = useUtilsFunction();
  const { loading, storeCustomizationSetting, globalSetting } = useGetSetting();
  const [email, setEmail] = useState("");
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);

  // State for collapsible sections on mobile
  const [openSections, setOpenSections] = useState({
    block1: false,
    block2: false,
    block3: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notifyError("Please enter your email address!");
      return;
    }
    setLoadingSubscribe(true);
    try {
      await NewsletterServices.addNewsletter({ email });
      notifySuccess("Subscribed Successfully!");
      setEmail("");
    } catch (err) {
      notifyError(err ? err.response.data.message : err.message);
    }
    setLoadingSubscribe(false);
  };

  // Curated fallback footer blocks to guarantee a stunning look when DB is unconfigured
  const block1Links = [
    { title: "New Arrivals", href: "/new-arrivals" },
    { title: "Trending Drops", href: "/trending" },
    { title: "Men's Collection", href: "/men" },
    { title: "Women's Collection", href: "/women" },
  ];

  const block2Links = [
    { title: "About Us", href: "/about-us" },
    { title: "Contact Us", href: "/contact-us" },
    { title: "FAQs", href: "/faq" },
    { title: "Shipping & Returns", href: "/refund-return-policy" },
  ];

  const block3Links = [
    { title: "Privacy Policy", href: "/privacy-policy" },
    { title: "Terms & Conditions", href: "/terms-and-conditions" },
    { title: "Shipping & Delivery", href: "/shipping-delivery-policy" },
    { title: "Careers", href: "/careers" },
  ];

  return (
    <div className="pb-16 lg:pb-0 xl:pb-0 bg-black text-neutral-400 border-t border-neutral-900 relative overflow-hidden font-sans">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Top Feature Bar - Minimalist black blocks */}
        <div className="py-8 hidden md:block border-b border-neutral-900">
          <FeatureCard />
        </div>

        {/* Logo at Top Left - Only visible on small screens */}
        <div className="py-6 border-b border-neutral-900 block md:hidden">
          <Link href="/" className="inline-block" rel="noreferrer">
            <span className="font-black tracking-widest text-2xl uppercase text-white">
              RASA<span className="text-neutral-500">.</span>
            </span>
          </Link>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 py-16">
          
          {/* Block 1: Collections */}
          <div className="pb-4 sm:pb-0 border-b border-neutral-900 md:border-0 md:pr-6 lg:pr-8">
            <button
              onClick={() => toggleSection("block1")}
              className="w-full flex items-center justify-between py-2 md:py-0 md:pointer-events-none"
            >
              <h3 className="text-xs font-black font-serif uppercase tracking-widest text-white md:mb-6">
                {showingTranslateValue(storeCustomizationSetting?.footer?.block1_title) || "Collections"}
              </h3>
              <FiChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform duration-300 ${
                  openSections.block1 ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`text-[10px] uppercase tracking-wider font-extrabold flex flex-col space-y-3.5 overflow-hidden transition-all duration-300 ${
                openSections.block1
                  ? "max-h-[500px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              } md:max-h-none md:opacity-100 md:mb-2`}
            >
              {block1Links.map((link, idx) => (
                <li key={idx} className="group">
                  <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors duration-300">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Block 2: Customer Care */}
          <div className="pb-4 sm:pb-0 border-b border-neutral-900 md:border-0 md:pr-6 lg:pr-8">
            <button
              onClick={() => toggleSection("block2")}
              className="w-full flex items-center justify-between py-2 md:py-0 md:pointer-events-none"
            >
              <h3 className="text-xs font-black font-serif uppercase tracking-widest text-white md:mb-6">
                {showingTranslateValue(storeCustomizationSetting?.footer?.block2_title) || "Support & Info"}
              </h3>
              <FiChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform duration-300 ${
                  openSections.block2 ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`text-[10px] uppercase tracking-wider font-extrabold flex flex-col space-y-3.5 overflow-hidden transition-all duration-300 ${
                openSections.block2
                  ? "max-h-[500px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              } md:max-h-none md:opacity-100 md:mb-2`}
            >
              {block2Links.map((link, idx) => (
                <li key={idx} className="group">
                  <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors duration-300">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Block 3: Legal Policy */}
          <div className="pb-4 sm:pb-0 border-b border-neutral-900 md:border-0 md:pr-6 lg:pr-8">
            <button
              onClick={() => toggleSection("block3")}
              className="w-full flex items-center justify-between py-2 md:py-0 md:pointer-events-none"
            >
              <h3 className="text-xs font-black font-serif uppercase tracking-widest text-white md:mb-6">
                {showingTranslateValue(storeCustomizationSetting?.footer?.block3_title) || "Legal & Brand"}
              </h3>
              <FiChevronDown
                className={`w-4 h-4 text-neutral-400 md:hidden transition-transform duration-300 ${
                  openSections.block3 ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`text-[10px] uppercase tracking-wider font-extrabold flex flex-col space-y-3.5 overflow-hidden transition-all duration-300 ${
                openSections.block3
                  ? "max-h-[500px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              } md:max-h-none md:opacity-100 md:mb-2`}
            >
              {block3Links.map((link, idx) => (
                <li key={idx} className="group">
                  <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors duration-300">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Block 4: Registered Office & Newsletter */}
          <div className="pb-4 sm:pb-0">
            <div className="space-y-4">
              <h3 className="text-xs font-black font-serif uppercase tracking-widest text-white mb-6">
                Rasa Store HQ
              </h3>

              <div className="flex items-start gap-3 text-neutral-450">
                <FiMapPin className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans text-xs text-left">
                  {showingTranslateValue(storeCustomizationSetting?.footer?.block4_address) || "102 Luxury Retail District, Avenue des Champs-Élysées, Paris, France"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-neutral-450 hover:text-white transition-colors">
                <FiPhone className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                <a
                  href={`tel:${showingTranslateValue(storeCustomizationSetting?.footer?.block4_phone) || "+3314000000"}`}
                  className="text-xs hover:underline"
                >
                  {showingTranslateValue(storeCustomizationSetting?.footer?.block4_phone) || "+33 (1) 4000-0000"}
                </a>
              </div>
              <div className="flex items-center gap-3 text-neutral-450 hover:text-white transition-colors">
                <FiMail className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                <a
                  href={`mailto:${showingTranslateValue(storeCustomizationSetting?.footer?.block4_email) || "support@therasastore.com"}`}
                  className="text-xs hover:underline break-all"
                >
                  {showingTranslateValue(storeCustomizationSetting?.footer?.block4_email) || "support@therasastore.com"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row: Social Media & Newsletter Subscription */}
        <div className="py-12 border-t border-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Social Media Links */}
            <div>
              <h3 className="text-xs font-black font-serif uppercase tracking-widest text-white mb-4">
                Connect With Us
              </h3>
              <ul className="text-sm flex flex-wrap gap-4">
                <li className="group">
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-neutral-900 border border-neutral-800 hover:border-white text-white flex items-center justify-center transition-all duration-300">
                    <FaInstagram size={18} />
                  </a>
                </li>
                <li className="group">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-neutral-900 border border-neutral-800 hover:border-white text-white flex items-center justify-center transition-all duration-300">
                    <span className="font-extrabold text-[10px]">FB</span>
                  </a>
                </li>
                <li className="group">
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-neutral-900 border border-neutral-800 hover:border-white text-white flex items-center justify-center transition-all duration-300">
                    <span className="font-extrabold text-[10px]">TW</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Subscription Form */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-black font-serif uppercase tracking-widest text-white mb-4">
                Subscribe to our newsletters
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  className="bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 px-4 py-3 text-xs tracking-wider uppercase focus:outline-none focus:border-white flex-1 rounded-none font-bold"
                />
                <button
                  type="submit"
                  disabled={loadingSubscribe}
                  className="bg-white text-black hover:bg-neutral-200 transition-colors px-8 py-3 text-xs font-black uppercase tracking-widest rounded-none whitespace-nowrap"
                >
                  {loadingSubscribe ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom copyright declaration */}
        <div className="mx-auto max-w-screen-2xl flex flex-col md:flex-row justify-between items-center py-8 border-t border-neutral-900 gap-4">
          <div className="flex flex-col gap-2 text-left md:w-2/3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 mb-0 font-extrabold">
              © 2026 RASA STORE. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[9px] tracking-[0.1em] text-neutral-600 leading-relaxed font-medium max-w-xl">
              Disclaimer: All trademarks, logos and brand names belong to their respective owners. Product listings are presented for identification purposes only.
            </p>
          </div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 flex items-center gap-1 font-extrabold">
            DESIGNED & DEVELOPED FOR THE DIGITAL GENERATION
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;

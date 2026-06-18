import Head from "next/head";
import { ToastContainer } from "react-toastify";

//internal import

import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import NavBarTop from "./navbar/NavBarTop";
import FooterTop from "@layout/footer/FooterTop";
import MobileFooter from "@layout/footer/MobileFooter";
import MobileBottomNavigation from "@layout/footer/MobileBottomNavigation";
import FeatureCard from "@components/feature-card/FeatureCard";
import useGetSetting from "@hooks/useGetSetting";
import { getPalette } from "@utils/themeColors";
import useCartSync from "@hooks/useCartSync";
import FloatingWhatsApp from "@components/common/FloatingWhatsApp";
import { pickBrandLogo } from "@utils/brandAssets";

const Layout = ({ title, description, children, hideMobileHeader }) => {
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";
  const palette = getPalette(storeColor);

  // Sync cart with backend
  useCartSync();

  // Get dynamic title and favicon from settings
  const siteTitle = storeCustomizationSetting?.seo?.meta_title || globalSetting?.shop_name || "Rasa Store";
  const favicon = pickBrandLogo(
    storeCustomizationSetting?.seo?.favicon,
    globalSetting?.logo,
    storeCustomizationSetting?.navbar?.logo
  );
  const defaultDescription = storeCustomizationSetting?.seo?.meta_description || description || "Rasa Store defines modern premium streetwear. Minimalist silhouettes, heavyweight fabrics, and clean aesthetics designed for the digital generation.";

  return (
    <>
      <div className="font-sans">
        <Head>
          <style>
            {`
              :root {
                --store-color-50: #F9F9F9;
                --store-color-100: #FFFFFF;
                --store-color-200: #F3F4F6;
                --store-color-300: #111111;
                --store-color-400: #1F2937;
                --store-color-500: #111111;
                --store-color-600: #111111;
                --store-color-700: #000000;
                --store-color-800: #111111;
                --store-color-900: #000000;
              }
            `}
          </style>
          <title>
            {title ? `${siteTitle} | ${title}` : siteTitle}
          </title>
          <meta name="description" content={description || defaultDescription} />
          <link rel="icon" href={favicon} />
          <link rel="shortcut icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
        </Head>
        {/* Mobile header bar (fixed) */}
        {!hideMobileHeader && <MobileFooter />}

        {/* Mobile Bottom Navigation */}
        {!hideMobileHeader && <MobileBottomNavigation />}

        <div className={`${hideMobileHeader ? "pt-0" : "pt-16"} lg:pt-0 lg:mt-0 pb-16 lg:pb-0`}>
          {/* Desktop: one sticky header — top bar + navbar + categories shift on scroll */}
          <div id="site-header" className="hidden lg:block sticky top-0 z-[70] bg-[#050505] shadow-lg shadow-black/40">
            <NavBarTop />
            <Navbar />
          </div>
          {children}
        </div>
        <div className="  w-full">
          {/* <FooterTop  /> */}
          <div className="w-full">
            <Footer />
          </div>
        </div>
        <FloatingWhatsApp />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default Layout;

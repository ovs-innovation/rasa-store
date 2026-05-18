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

const Layout = ({ title, description, children, hideMobileHeader }) => {
  const { storeCustomizationSetting, globalSetting } = useGetSetting();
  const storeColor = storeCustomizationSetting?.theme?.color || "green";
  const palette = getPalette(storeColor);

  // Sync prescription medicines to cart
  useCartSync();

  // Get dynamic title and favicon from settings
  const siteTitle = storeCustomizationSetting?.seo?.meta_title || globalSetting?.shop_name || "Farmacykart";
  const favicon = storeCustomizationSetting?.seo?.favicon || globalSetting?.logo || "/favicon.png";
  const defaultDescription = storeCustomizationSetting?.seo?.meta_description || description || "Discover personalized merchandise, branded giveaways, and advertising essentials. Ideal for businesses, events, and promotions";

  return (
    <>
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
        theme="light"
      />

      <div className="font-sans">
        <Head>
          <style>
            {`
              :root {
                --store-color-50: ${palette[50]};
                --store-color-100: ${palette[100]};
                --store-color-200: ${palette[200]};
                --store-color-300: ${palette[300]};
                --store-color-400: ${palette[400]};
                --store-color-500: ${palette[500]};
                --store-color-600: ${palette[600]};
                --store-color-700: ${palette[700]};
                --store-color-800: ${palette[800]};
                --store-color-900: ${palette[900]};
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
        {/* Desktop header */}
        <div className="hidden lg:block">
          <NavBarTop />
        </div>

        {/* Mobile header bar (fixed) */}
        {!hideMobileHeader && <MobileFooter />}

        {/* Mobile Bottom Navigation */}
        {!hideMobileHeader && <MobileBottomNavigation />}

        {/* Add top padding on mobile so content doesn't sit behind fixed header */}
        <div className={`${hideMobileHeader ? "pt-0" : "pt-16"} lg:pt-0 lg:mt-0 pb-16 lg:pb-0`}>
          <Navbar />
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
    </>
  );
};

export default Layout;

import { useContext, useEffect } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import "react-tabs/style/react-tabs.css";

//internal import
import useQuery from "@/hooks/useQuery";
import Faq from "@/components/store-home/Faq";
import Offer from "@/components/store-home/Offer";
import AboutUs from "@/components/store-home/AboutUs";
import ContactUs from "@/components/store-home/ContactUs";
import { SidebarContext } from "@/context/SidebarContext";
import useStoreHomeSubmit from "@/hooks/useStoreHomeSubmit";
import PageTitle from "@/components/Typography/PageTitle";
import PrivacyPolicy from "@/components/store-home/PrivacyPolicy";
import HomePage from "@/components/store-home/HomePage";
import SinglePage from "@/components/store-home/SinglePage";
import Checkout from "@/components/store-home/Checkout";
import SeoSetting from "@/components/settings/SeoSetting";
import DashboardSetting from "@/components/store-home/DashboardSetting";
import SelectLanguageTwo from "@/components/form/selectOption/SelectLanguageTwo";
import AnimatedContent from "@/components/common/AnimatedContent";
import Theme from "@/components/store-home/Theme";

const StoreHome = () => {
  let location = useLocation();
  let query = useQuery();
  const { t } = useTranslation();

  const tabName = query.get("storeTab");
  const { setTabIndex } = useContext(SidebarContext);

  const {
    register,
    handleSubmit,
    onSubmit,
    setValue,
    lang,
    errors,
    favicon,
    coupons,
    setFavicon,
    metaImg,
    setMetaImg,
    headerLogo,
    setHeaderLogo,
    sliderImage,
    setSliderImage,
    sliderImageTwo,
    setSliderImageTwo,
    sliderImageThree,
    setSliderImageThree,
    sliderImageFour,
    setSliderImageFour,
    sliderImageFive,
    setSliderImageFive,
    placeholderImage,
    setPlaceHolderImage,
    quickSectionImage,
    setQuickSectionImage,
    promotionalBannerImage1,
    setPromotionalBannerImage1,
    promotionalBannerImage2,
    setPromotionalBannerImage2,
    promotionalBannerImage3,
    setPromotionalBannerImage3,
    getYourDailyNeedImageLeft,
    setGetYourDailyNeedImageLeft,
    getYourDailyNeedImageRight,
    setGetYourDailyNeedImageRight,
    footerLogo,
    setFooterLogo,
    paymentImage,
    setPaymentImage,
    isSave,
    isCoupon,
    isSliderFullWidth,
    setIsCoupon,
    setIsSliderFullWidth,
    featuredCategories,
    setFeaturedCategories,
    popularProducts,
    setPopularProducts,
    setQuickDelivery,
    quickDelivery,
    setLatestDiscounted,
    latestDiscounted,
    setDailyNeeds,
    dailyNeeds,
    setFeaturePromo,
    featurePromo,
    setFooterBlock1,
    footerBlock1,
    setFooterBlock2,
    footerBlock2,
    setFooterBlock3,
    footerBlock3,
    setFooterBlock4,
    footerBlock4,
    setFooterSocialLinks,
    footerSocialLinks,
    setFooterPaymentMethod,
    footerPaymentMethod,
    allowPromotionBanner,
    setAllowPromotionBanner,
    handleSelectLanguage,
    singleProductPageRightBox,
    setSingleProductPageRightBox,
    setLeftRightArrow,
    leftRightArrow,
    setBottomDots,
    bottomDots,
    setBothSliderOption,
    bothSliderOption,
    getButton1image,
    setGetButton1image,
    getButton2image,
    setGetButton2image,
    setFooterBottomContact,
    footerBottomContact,
    setCategoriesMenuLink,
    categoriesMenuLink,
    setAboutUsMenuLink,
    aboutUsMenuLink,
    setContactUsMenuLink,
    contactUsMenuLink,
    setOffersMenuLink,
    offersMenuLink,
    setFaqMenuLink,
    faqMenuLink,
    setPrivacyPolicyMenuLink,
    privacyPolicyMenuLink,
    setTermsConditionsMenuLink,
    termsConditionsMenuLink,
    setAboutHeaderBg,
    aboutHeaderBg,
    setAboutPageHeader,
    aboutPageHeader,
    setAboutTopContentLeft,
    aboutTopContentLeft,
    setAboutTopContentRight,
    aboutTopContentRight,
    setAboutTopContentRightImage,
    aboutTopContentRightImage,
    setAboutMiddleContentSection,
    aboutMiddleContentSection,
    setAboutMiddleContentImage,
    aboutMiddleContentImage,
    setOurFounderSection,
    ourFounderSection,
    setOurFounderOneImage,
    ourFounderOneImage,
    setOurFounderTwoImage,
    ourFounderTwoImage,
    setOurFounderThreeImage,
    ourFounderThreeImage,
    setOurFounderFourImage,
    ourFounderFourImage,
    setOurFounderFiveImage,
    ourFounderFiveImage,
    setOurFounderSixImage,
    ourFounderSixImage,
    setPrivacyPolicy,
    privacyPolicy,
    setPrivacyPolicyHeaderBg,
    privacyPolicyHeaderBg,
    setTermsConditions,
    termsConditions,
    setTermsConditionsHeaderBg,
    termsConditionsHeaderBg,
    setFaqStatus,
    faqStatus,
    setFaqHeaderBg,
    faqHeaderBg,
    setFaqLeftColImage,
    faqLeftColImage,
    setOffersPageHeader,
    offersPageHeader,
    setOffersHeaderBg,
    offersHeaderBg,
    setContactPageHeader,
    contactPageHeader,
    setContactHeaderBg,
    contactHeaderBg,
    setEmailUsBox,
    emailUsBox,
    setCallUsBox,
    callUsBox,
    setAddressBox,
    addressBox,
    setContactMidLeftColStatus,
    contactMidLeftColStatus,
    setContactMidLeftColImage,
    contactMidLeftColImage,
    setContactFormStatus,
    contactFormStatus,
    couponList,
    setCouponList,
    couponList1,
    setCouponList1,
    setFaqLeftColStatus,
    faqLeftColStatus,
    setFaqRightColStatus,
    faqRightColStatus,
    textEdit,
    setTextEdit,
    termsConditionsTextEdit,
    setTermsConditionsTextEdit,
    shippingDeliveryPolicy,
    setShippingDeliveryPolicy,
    shippingDeliveryPolicyHeaderBg,
    setShippingDeliveryPolicyHeaderBg,
    shippingDeliveryPolicyTextEdit,
    setShippingDeliveryPolicyTextEdit,
    isSubmitting,
    themeColor,
    products,
    sliderProductId,
    setSliderProductId,
    sliderProductSlug,
    setSliderProductSlug,
    sliderProductIdTwo,
    setSliderProductIdTwo,
    sliderProductSlugTwo,
    setSliderProductSlugTwo,
    sliderProductIdThree,
    setSliderProductIdThree,
    sliderProductSlugThree,
    setSliderProductSlugThree,
    sliderProductIdFour,
    setSliderProductIdFour,
    sliderProductSlugFour,
    setSliderProductSlugFour,
    sliderProductIdFive,
    setSliderProductIdFive,
    sliderProductSlugFive,
    setSliderProductSlugFive,
    categories,
    sliderCategoryId,
    setSliderCategoryId,
    sliderCategorySlug,
    setSliderCategorySlug,
    sliderCategoryIdTwo,
    setSliderCategoryIdTwo,
    sliderCategorySlugTwo,
    setSliderCategorySlugTwo,
    sliderCategoryIdThree,
    setSliderCategoryIdThree,
    sliderCategorySlugThree,
    setSliderCategorySlugThree,
    sliderCategoryIdFour,
    setSliderCategoryIdFour,
    sliderCategorySlugFour,
    setSliderCategorySlugFour,
    sliderCategoryIdFive,
    setSliderCategoryIdFive,
    sliderCategorySlugFive,
    setSliderCategorySlugFive,
    promoProductId1,
    setPromoProductId1,
    promoProductSlug1,
    setPromoProductSlug1,
    promoCategoryId1,
    setPromoCategoryId1,
    promoCategorySlug1,
    setPromoCategorySlug1,
    promoProductId2,
    setPromoProductId2,
    promoProductSlug2,
    setPromoProductSlug2,
    promoCategoryId2,
    setPromoCategoryId2,
    promoCategorySlug2,
    setPromoCategorySlug2,
    promoProductId3,
    setPromoProductId3,
    promoProductSlug3,
    setPromoProductSlug3,
    promoCategoryId3,
    setPromoCategoryId3,
    promoCategorySlug3,
    setPromoCategorySlug3,
  } = useStoreHomeSubmit();

  useEffect(() => {
    if (tabName === "seo-setting") {
      setTabIndex(9);
    } else if (tabName === "dashboard-setting") {
      setTabIndex(8);
    } else if (tabName === "checkout-setting") {
      setTabIndex(7);
    } else if (tabName === "contact-us-setting") {
      setTabIndex(6);
    } else if (tabName === "offers-setting") {
      setTabIndex(5);
    } else if (tabName === "FAQ-setting") {
      setTabIndex(4);
    } else if (tabName === "privacy-setting") {
      setTabIndex(3);
    } else if (tabName === "about-us-setting") {
      setTabIndex(2);
    } else if (tabName === "single-setting") {
      setTabIndex(1);
    } else if (tabName === "theme-setting") {
      setTabIndex(10);
    } else {
      setTabIndex(0);
    }
  }, [tabName, setTabIndex]);

  useEffect(() => {
    isCoupon && setIsSliderFullWidth(false);
  }, [isCoupon, setIsSliderFullWidth]);

  useEffect(() => {
    leftRightArrow && setBottomDots(false);
  }, [leftRightArrow, setBottomDots]);

  useEffect(() => {
    leftRightArrow && setBothSliderOption(false);
  }, [leftRightArrow, setBothSliderOption]);

  useEffect(() => {
    bottomDots && setBothSliderOption(false);
  }, [bottomDots, setBothSliderOption]);

  useEffect(() => {
    bottomDots && setLeftRightArrow(false);
  }, [bottomDots, setLeftRightArrow]);

  useEffect(() => {
    bothSliderOption && setLeftRightArrow(false);
  }, [bothSliderOption, setLeftRightArrow]);

  useEffect(() => {
    bothSliderOption && setBottomDots(false);
  }, [bothSliderOption, setBottomDots]);

  return (
    <>
      <div className="flex justify-between text-center items-center">
        <div>
          <PageTitle>{t("StoreCustomizationPageTitle")}</PageTitle>
        </div>
        <div className="pb-4">
          <SelectLanguageTwo
            register={register}
            handleSelectLanguage={handleSelectLanguage}
          />
        </div>
      </div>

      <>
        <ul className="flex flex-wrap gap-3 mb-8">
          <li>
            <Link
              to={"/store/customization?storeTab=home-settings"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "home-settings" || location.search === ""
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Home Page
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=single-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "single-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Product Slug Page
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=about-us-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "about-us-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              About Us
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=privacy-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "privacy-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Privacy Policy & T&C
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=FAQ-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "FAQ-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              FAQs
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=offers-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "offers-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Offers
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=contact-us-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "contact-us-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Contact Us
            </Link>
          </li>
          <li>
            <Link
              to={"/store/customization?storeTab=checkout-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "checkout-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Checkout
            </Link>
          </li>
          <li>
            <Link
              to={"/store/customization?storeTab=dashboard-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "dashboard-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Dashboard Settings
            </Link>
          </li>

          <li>
            <Link
              to={"/store/customization?storeTab=theme-setting"}
              className={`inline-block px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-200 ${
                tabName === "theme-setting"
                  ? "bg-[#004f56] dark:bg-emerald-600 text-white shadow-lg scale-105"
                  : "bg-[#d0eaec] dark:bg-gray-700 text-[#004f56] dark:text-emerald-400 hover:bg-[#c2e4e6] dark:hover:bg-gray-600"
              } text-center min-w-[120px]`}
            >
              Theme
            </Link>
          </li>
        </ul>

        {/************ TabPanel 1 ************/}
        {(tabName === "home-settings" || tabName === null) && (
          <AnimatedContent>
            <div className="sm:container md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
              <form onSubmit={handleSubmit(onSubmit)}>
                <HomePage
                  errors={errors}
                  isSave={isSave}
                  coupons={coupons}
                  isCoupon={isCoupon}
                  register={register}
                  headerLogo={headerLogo}
                  footerLogo={footerLogo}
                  setFooterLogo={setFooterLogo}
                  paymentImage={paymentImage}
                  setPaymentImage={setPaymentImage}
                  setHeaderLogo={setHeaderLogo}
                  sliderImage={sliderImage}
                  setSliderImage={setSliderImage}
                  sliderImageTwo={sliderImageTwo}
                  setSliderImageTwo={setSliderImageTwo}
                  sliderImageThree={sliderImageThree}
                  setSliderImageThree={setSliderImageThree}
                  sliderImageFour={sliderImageFour}
                  setSliderImageFour={setSliderImageFour}
                  sliderImageFive={sliderImageFive}
                  setSliderImageFive={setSliderImageFive}
                  placeholderImage={placeholderImage}
                  setPlaceHolderImage={setPlaceHolderImage}
                  quickSectionImage={quickSectionImage}
                  setQuickSectionImage={setQuickSectionImage}
                  promotionalBannerImage1={promotionalBannerImage1}
                  setPromotionalBannerImage1={setPromotionalBannerImage1}
                  promotionalBannerImage2={promotionalBannerImage2}
                  setPromotionalBannerImage2={setPromotionalBannerImage2}
                  promotionalBannerImage3={promotionalBannerImage3}
                  setPromotionalBannerImage3={setPromotionalBannerImage3}
                  getYourDailyNeedImageLeft={getYourDailyNeedImageLeft}
                  setGetYourDailyNeedImageLeft={setGetYourDailyNeedImageLeft}
                  getYourDailyNeedImageRight={getYourDailyNeedImageRight}
                  setGetYourDailyNeedImageRight={setGetYourDailyNeedImageRight}
                  isSliderFullWidth={isSliderFullWidth}
                  setIsCoupon={setIsCoupon}
                  setIsSliderFullWidth={setIsSliderFullWidth}
                  featuredCategories={featuredCategories}
                  setFeaturedCategories={setFeaturedCategories}
                  popularProducts={popularProducts}
                  setPopularProducts={setPopularProducts}
                  setQuickDelivery={setQuickDelivery}
                  quickDelivery={quickDelivery}
                  setLatestDiscounted={setLatestDiscounted}
                  latestDiscounted={latestDiscounted}
                  setDailyNeeds={setDailyNeeds}
                  dailyNeeds={dailyNeeds}
                  setFeaturePromo={setFeaturePromo}
                  featurePromo={featurePromo}
                  setFooterBlock1={setFooterBlock1}
                  footerBlock1={footerBlock1}
                  setFooterBlock2={setFooterBlock2}
                  footerBlock2={footerBlock2}
                  setFooterBlock3={setFooterBlock3}
                  footerBlock3={footerBlock3}
                  setFooterBlock4={setFooterBlock4}
                  footerBlock4={footerBlock4}
                  setFooterSocialLinks={setFooterSocialLinks}
                  footerSocialLinks={footerSocialLinks}
                  setFooterPaymentMethod={setFooterPaymentMethod}
                  footerPaymentMethod={footerPaymentMethod}
                  allowPromotionBanner={allowPromotionBanner}
                  setAllowPromotionBanner={setAllowPromotionBanner}
                  setLeftRightArrow={setLeftRightArrow}
                  leftRightArrow={leftRightArrow}
                  setBottomDots={setBottomDots}
                  bottomDots={bottomDots}
                  setBothSliderOption={setBothSliderOption}
                  bothSliderOption={bothSliderOption}
                  getButton1image={getButton1image}
                  setGetButton1image={setGetButton1image}
                  getButton2image={getButton2image}
                  setGetButton2image={setGetButton2image}
                  setFooterBottomContact={setFooterBottomContact}
                  footerBottomContact={footerBottomContact}
                  setCategoriesMenuLink={setCategoriesMenuLink}
                  categoriesMenuLink={categoriesMenuLink}
                  setAboutUsMenuLink={setAboutUsMenuLink}
                  aboutUsMenuLink={aboutUsMenuLink}
                  setContactUsMenuLink={setContactUsMenuLink}
                  contactUsMenuLink={contactUsMenuLink}
                  setOffersMenuLink={setOffersMenuLink}
                  offersMenuLink={offersMenuLink}
                  setFaqMenuLink={setFaqMenuLink}
                  faqMenuLink={faqMenuLink}
                  setPrivacyPolicyMenuLink={setPrivacyPolicyMenuLink}
                  privacyPolicyMenuLink={privacyPolicyMenuLink}
                  setTermsConditionsMenuLink={setTermsConditionsMenuLink}
                  termsConditionsMenuLink={termsConditionsMenuLink}
                  couponList={couponList}
                  setCouponList={setCouponList}
                  isSubmitting={isSubmitting}
                  products={products}
                  sliderProductId={sliderProductId}
                  setSliderProductId={setSliderProductId}
                  sliderProductSlug={sliderProductSlug}
                  setSliderProductSlug={setSliderProductSlug}
                  sliderProductIdTwo={sliderProductIdTwo}
                  setSliderProductIdTwo={setSliderProductIdTwo}
                  sliderProductSlugTwo={sliderProductSlugTwo}
                  setSliderProductSlugTwo={setSliderProductSlugTwo}
                  sliderProductIdThree={sliderProductIdThree}
                  setSliderProductIdThree={setSliderProductIdThree}
                  sliderProductSlugThree={sliderProductSlugThree}
                  setSliderProductSlugThree={setSliderProductSlugThree}
                  sliderProductIdFour={sliderProductIdFour}
                  setSliderProductIdFour={setSliderProductIdFour}
                  sliderProductSlugFour={sliderProductSlugFour}
                  setSliderProductSlugFour={setSliderProductSlugFour}
                  setSliderProductIdFive={setSliderProductIdFive}
                  sliderProductSlugFive={sliderProductSlugFive}
                  setSliderProductSlugFive={setSliderProductSlugFive}
                  categories={categories}
                  sliderCategoryId={sliderCategoryId}
                  setSliderCategoryId={setSliderCategoryId}
                  sliderCategorySlug={sliderCategorySlug}
                  setSliderCategorySlug={setSliderCategorySlug}
                  sliderCategoryIdTwo={sliderCategoryIdTwo}
                  setSliderCategoryIdTwo={setSliderCategoryIdTwo}
                  sliderCategorySlugTwo={sliderCategorySlugTwo}
                  setSliderCategorySlugTwo={setSliderCategorySlugTwo}
                  sliderCategoryIdThree={sliderCategoryIdThree}
                  setSliderCategoryIdThree={setSliderCategoryIdThree}
                  sliderCategorySlugThree={sliderCategorySlugThree}
                  setSliderCategorySlugThree={setSliderCategorySlugThree}
                  sliderCategoryIdFour={sliderCategoryIdFour}
                  setSliderCategoryIdFour={setSliderCategoryIdFour}
                  sliderCategorySlugFour={sliderCategorySlugFour}
                  setSliderCategorySlugFour={setSliderCategorySlugFour}
                  sliderCategoryIdFive={sliderCategoryIdFive}
                  setSliderCategoryIdFive={setSliderCategoryIdFive}
                  sliderCategorySlugFive={sliderCategorySlugFive}
                  setSliderCategorySlugFive={setSliderCategorySlugFive}
                  promoProductId1={promoProductId1}
                  setPromoProductId1={setPromoProductId1}
                  promoProductSlug1={promoProductSlug1}
                  setPromoProductSlug1={setPromoProductSlug1}
                  promoCategoryId1={promoCategoryId1}
                  setPromoCategoryId1={setPromoCategoryId1}
                  promoCategorySlug1={promoCategorySlug1}
                  setPromoCategorySlug1={setPromoCategorySlug1}
                  promoProductId2={promoProductId2}
                  setPromoProductId2={setPromoProductId2}
                  promoProductSlug2={promoProductSlug2}
                  setPromoProductSlug2={setPromoProductSlug2}
                  promoCategoryId2={promoCategoryId2}
                  setPromoCategoryId2={setPromoCategoryId2}
                  promoCategorySlug2={promoCategorySlug2}
                  setPromoCategorySlug2={setPromoCategorySlug2}
                  promoProductId3={promoProductId3}
                  setPromoProductId3={setPromoProductId3}
                  promoProductSlug3={promoProductSlug3}
                  setPromoProductSlug3={setPromoProductSlug3}
                  promoCategoryId3={promoCategoryId3}
                  setPromoCategoryId3={setPromoCategoryId3}
                  promoCategorySlug3={promoCategorySlug3}
                  setPromoCategorySlug3={setPromoCategorySlug3}
                />
              </form>
            </div>
          </AnimatedContent>
        )}

        {/************ TabPanel 1 END************/}

        {/************* TabPanel 2*************/}
        {tabName === "single-setting" && (
          <AnimatedContent>
            <div className="sm:container w-full md:p-6 p-4 mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg">
              <form onSubmit={handleSubmit(onSubmit)}>
                <SinglePage
                  isSave={isSave}
                  errors={errors}
                  register={register}
                  isSubmitting={isSubmitting}
                  singleProductPageRightBox={singleProductPageRightBox}
                  setSingleProductPageRightBox={setSingleProductPageRightBox}
                />
              </form>
            </div>
          </AnimatedContent>
        )}

        {/************* TabPanel 2 END *************/}

        {/************* TabPanel 3*************/}
        {tabName === "about-us-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)} id="about-us-form">
                <AboutUs
                  isSave={isSave}
                  register={register}
                  errors={errors}
                  setAboutHeaderBg={setAboutHeaderBg}
                  aboutHeaderBg={aboutHeaderBg}
                  setAboutPageHeader={setAboutPageHeader}
                  aboutPageHeader={aboutPageHeader}
                  setAboutTopContentLeft={setAboutTopContentLeft}
                  aboutTopContentLeft={aboutTopContentLeft}
                  setAboutTopContentRight={setAboutTopContentRight}
                  aboutTopContentRight={aboutTopContentRight}
                  setAboutTopContentRightImage={setAboutTopContentRightImage}
                  aboutTopContentRightImage={aboutTopContentRightImage}
                  setAboutMiddleContentSection={setAboutMiddleContentSection}
                  aboutMiddleContentSection={aboutMiddleContentSection}
                  setAboutMiddleContentImage={setAboutMiddleContentImage}
                  aboutMiddleContentImage={aboutMiddleContentImage}
                  setOurFounderSection={setOurFounderSection}
                  ourFounderSection={ourFounderSection}
                  setOurFounderOneImage={setOurFounderOneImage}
                  ourFounderOneImage={ourFounderOneImage}
                  setOurFounderTwoImage={setOurFounderTwoImage}
                  ourFounderTwoImage={ourFounderTwoImage}
                  setOurFounderThreeImage={setOurFounderThreeImage}
                  ourFounderThreeImage={ourFounderThreeImage}
                  setOurFounderFourImage={setOurFounderFourImage}
                  ourFounderFourImage={ourFounderFourImage}
                  setOurFounderFiveImage={setOurFounderFiveImage}
                  ourFounderFiveImage={ourFounderFiveImage}
                  setOurFounderSixImage={setOurFounderSixImage}
                  ourFounderSixImage={ourFounderSixImage}
                  isSubmitting={isSubmitting}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 3 END*************/}

        {/************* TabPanel 4 *************/}
        {tabName === "privacy-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <PrivacyPolicy
                  isSave={isSave}
                  errors={errors}
                  register={register}
                  textEdit={textEdit}
                  setTextEdit={setTextEdit}
                  privacyPolicy={privacyPolicy}
                  setPrivacyPolicy={setPrivacyPolicy}
                  setPrivacyPolicyHeaderBg={setPrivacyPolicyHeaderBg}
                  privacyPolicyHeaderBg={privacyPolicyHeaderBg}
                  setTermsConditions={setTermsConditions}
                  termsConditions={termsConditions}
                  setTermsConditionsHeaderBg={setTermsConditionsHeaderBg}
                  termsConditionsHeaderBg={termsConditionsHeaderBg}
                  termsConditionsTextEdit={termsConditionsTextEdit}
                  setTermsConditionsTextEdit={setTermsConditionsTextEdit}
                  shippingDeliveryPolicy={shippingDeliveryPolicy}
                  setShippingDeliveryPolicy={setShippingDeliveryPolicy}
                  shippingDeliveryPolicyHeaderBg={shippingDeliveryPolicyHeaderBg}
                  setShippingDeliveryPolicyHeaderBg={setShippingDeliveryPolicyHeaderBg}
                  shippingDeliveryPolicyTextEdit={shippingDeliveryPolicyTextEdit}
                  setShippingDeliveryPolicyTextEdit={setShippingDeliveryPolicyTextEdit}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 4 END*************/}

        {/************* TabPanel 5 *************/}
        {tabName === "FAQ-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 mx-auto w-full bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Faq
                  isSave={isSave}
                  errors={errors}
                  register={register}
                  setFaqStatus={setFaqStatus}
                  faqStatus={faqStatus}
                  setFaqHeaderBg={setFaqHeaderBg}
                  faqHeaderBg={faqHeaderBg}
                  setFaqLeftColImage={setFaqLeftColImage}
                  faqLeftColImage={faqLeftColImage}
                  setFaqLeftColStatus={setFaqLeftColStatus}
                  faqLeftColStatus={faqLeftColStatus}
                  setFaqRightColStatus={setFaqRightColStatus}
                  faqRightColStatus={faqRightColStatus}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 5 END*************/}

        {/************* TabPanel 6 *************/}
        {tabName === "offers-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Offer
                  errors={errors}
                  isSave={isSave}
                  register={register}
                  coupons={coupons}
                  setOffersPageHeader={setOffersPageHeader}
                  offersPageHeader={offersPageHeader}
                  setOffersHeaderBg={setOffersHeaderBg}
                  offersHeaderBg={offersHeaderBg}
                  couponList1={couponList1}
                  setCouponList1={setCouponList1}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 6 END*************/}

        {/************* TabPanel 7 *************/}
        {tabName === "contact-us-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <ContactUs
                  isSave={isSave}
                  errors={errors}
                  register={register}
                  setContactPageHeader={setContactPageHeader}
                  contactPageHeader={contactPageHeader}
                  setContactHeaderBg={setContactHeaderBg}
                  contactHeaderBg={contactHeaderBg}
                  setEmailUsBox={setEmailUsBox}
                  emailUsBox={emailUsBox}
                  setCallUsBox={setCallUsBox}
                  callUsBox={callUsBox}
                  setAddressBox={setAddressBox}
                  addressBox={addressBox}
                  setContactMidLeftColStatus={setContactMidLeftColStatus}
                  contactMidLeftColStatus={contactMidLeftColStatus}
                  setContactMidLeftColImage={setContactMidLeftColImage}
                  contactMidLeftColImage={contactMidLeftColImage}
                  setContactFormStatus={setContactFormStatus}
                  contactFormStatus={contactFormStatus}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 7 END*************/}
        {/************* TabPanel 8 *************/}
        {tabName === "checkout-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Checkout
                  isSave={isSave}
                  errors={errors}
                  register={register}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 8 END*************/}
        {/************* TabPanel 9 *************/}
        {tabName === "dashboard-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DashboardSetting
                  isSave={isSave}
                  errors={errors}
                  register={register}
                  isSubmitting={isSubmitting}
                />
              </form>
            </div>
          </AnimatedContent>
        )}
        {/************* TabPanel 9 END*************/}


        {tabName === "theme-setting" && (
          <AnimatedContent>
            <div className="sm:container md:p-8 p-4 w-full mx-auto bg-white dark:bg-gray-800 dark:text-gray-200 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Theme register={register} isSubmitting={isSubmitting} defaultColor={themeColor} setValue={setValue} />
              </form>
            </div>
          </AnimatedContent>
        )}
      </>
    </>
  );
};

export default StoreHome;

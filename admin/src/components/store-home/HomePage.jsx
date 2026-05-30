import { Button, WindmillContext } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiSettings } from "react-icons/fi";
import { useContext } from "react";
import { MultiSelect } from "react-multi-select-component";

import {
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tabs as TabsComponent,
} from "react-tabs";

//internal import
import Error from "@/components/form/others/Error";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import Uploader from "@/components/image-uploader/Uploader";
import InputAreaTwo from "@/components/form/input/InputAreaTwo";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import TextAreaCom from "@/components/form/others/TextAreaCom";
import SelectProductLimit from "@/components/form/selectOption/SelectProductLimit";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const HomePage = (props) => {
  const {
    register,
    errors,
    coupons,
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
    isSubmitting,
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
    couponList,
    setCouponList,
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
    promoProductId1,
    setPromoProductId1,
    promoProductSlug1,
    setPromoProductSlug1,
    promoProductId2,
    setPromoProductId2,
    promoProductSlug2,
    setPromoProductSlug2,
    promoProductId3,
    setPromoProductId3,
    promoProductSlug3,
    setPromoProductSlug3,
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
    promoCategoryId1,
    setPromoCategoryId1,
    promoCategorySlug1,
    setPromoCategorySlug1,
    promoCategoryId2,
    setPromoCategoryId2,
    promoCategorySlug2,
    setPromoCategorySlug2,
    promoCategoryId3,
    setPromoCategoryId3,
    promoCategorySlug3,
    setPromoCategorySlug3,
  } = props;
  const { mode } = useContext(WindmillContext);
  const { t } = useTranslation();
  const { showingTranslateValue } = useUtilsFunction();

  const ProductSelector = ({ label, value, onChangeId, onChangeSlug }) => (
    <div className="mt-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const prodId = e.target.value;
          const selectedProd = products.find(p => p._id === prodId);
          onChangeId(prodId);
          onChangeSlug(selectedProd ? selectedProd.slug : "");
        }}
        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004f56] focus:border-[#004f56] bg-white transition-all duration-200"
      >
        <option value="">None (No product redirection)</option>
        {products?.map((prod) => (
          <option key={prod._id} value={prod._id}>
            {showingTranslateValue(prod.title)}
          </option>
        ))}
      </select>
    </div>
  );

  const CategorySelector = ({ label, value, onChangeId, onChangeSlug }) => (
    <div className="mt-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const catId = e.target.value;
          const selectedCat = categories.find(c => c._id === catId);
          onChangeId(catId);
          onChangeSlug(selectedCat ? selectedCat.slug : "");
        }}
        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004f56] focus:border-[#004f56] bg-white transition-all duration-200"
      >
        <option value="">None (No category redirection)</option>
        {categories?.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {showingTranslateValue(cat.name)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-20 flex justify-end">
        {isSubmitting ? (
          <Button disabled={true} type="button" className="h-10 px-6">
            <img
              src={spinnerLoadingImage}
              alt="Loading"
              width={20}
              height={10}
            />{" "}
            <span className="font-serif ml-2 font-light">
              {" "}
              {t("Processing")}
            </span>
          </Button>
        ) : (
          <Button type="submit" className="h-10 px-6 ">
            {" "}
            {isSave ? t("SaveBtn") : t("UpdateBtn")}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-12 font-sans pr-4">
        {/*  ====================================================== Header Section ====================================================== */}
        <div className="col-span-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("Header")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t("HeaderContacts")}</h3>
              <p className="text-sm text-gray-500">Configure your store's top header contact details and promotional text.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("HeaderText")}
                  </label>
                  <InputAreaTwo
                    register={register}
                    label={t("HeaderText")}
                    name="help_text"
                    type="text"
                    placeholder={t("weAreAvailable")}
                  />
                  <Error errorName={errors.help_text} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("PhoneNumber")}
                  </label>
                  <InputAreaTwo
                    register={register}
                    label={t("PhoneNumber")}
                    name="phone_number"
                    type="text"
                    placeholder="+01234560352"
                  />
                  <Error errorName={errors.phone_number} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("HeaderLogo")}
                </label>
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#004f56] transition-colors text-center">
                  <Uploader
                    imageUrl={headerLogo}
                    setImageUrl={setHeaderLogo}
                    useOriginalSize={true}
                  />
                  <p className="text-[10px] text-center text-gray-400 mt-2 italic">Recommended size: 150x50px</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  ================= Menu Editor ======================== */}
        <div className="col-span-12 mt-10">
          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t("MenuEditor")}</h3>
              <p className="text-sm text-gray-500">Customize the navigation links in your store's header and footer menus.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("Categories")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("Categories")}
                  name="categories"
                  type="text"
                  placeholder={t("Categories")}
                />
                <Error errorName={errors.categories} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setCategoriesMenuLink} processOption={categoriesMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("AboutUs")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("AboutUs")}
                  name="about_us"
                  type="text"
                  placeholder={t("AboutUs")}
                />
                <Error errorName={errors.about_us} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setAboutUsMenuLink} processOption={aboutUsMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("ContactUs")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("ContactUs")}
                  name="contact_us"
                  type="text"
                  placeholder={t("ContactUs")}
                />
                <Error errorName={errors.contact_us} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setContactUsMenuLink} processOption={contactUsMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("Offers")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("Offers")}
                  name="offers"
                  type="text"
                  placeholder={t("Offers")}
                />
                <Error errorName={errors.offers} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setOffersMenuLink} processOption={offersMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("FAQ")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("FAQ")}
                  name="faq"
                  type="text"
                  placeholder={t("FAQ")}
                />
                <Error errorName={errors.faq} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setFaqMenuLink} processOption={faqMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("PrivacyPolicy")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("PrivacyPolicy")}
                  name="privacy_policy"
                  type="text"
                  placeholder={t("PrivacyPolicy")}
                />
                <Error errorName={errors.privacy_policy} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setPrivacyPolicyMenuLink} processOption={privacyPolicyMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("TermsConditions")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("TermsConditions")}
                  name="term_and_condition"
                  type="text"
                  placeholder={t("TermsConditions")}
                />
                <Error errorName={errors.term_and_condition} />
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-gray-500 font-medium">Show in Menu</span>
                  <SwitchToggle handleProcess={setTermsConditionsMenuLink} processOption={termsConditionsMenuLink} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("Pages")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("Pages")}
                  name="pages"
                  type="text"
                  placeholder={t("Pages")}
                />
                <Error errorName={errors.pages} />
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t("MyAccount")}
                </label>
                <InputAreaTwo
                  register={register}
                  label={t("MyAccount")}
                  name="my_account"
                  type="text"
                  placeholder={t("MyAccount")}
                />
                <Error errorName={errors.my_account} />
              </div>
            </div>
          </div>
        </div>

        {/*  ====================================================== Main Slider ====================================================== */}
        {/*  ====================================================== Main Slider Section ====================================================== */}
        <div className="col-span-12 mt-10 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("MainSlider")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-2xl p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Slider Management</h3>
              <p className="text-sm text-gray-500">Upload up to 5 slider images and configure slider behavior options.</p>
            </div>

            <TabsComponent>
              <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm inline-block mb-8">
                <TabList className="flex flex-wrap gap-2 outline-none">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Tab
                      key={num}
                      className="px-6 py-2.5 text-sm font-bold rounded-xl cursor-pointer transition-all duration-200 text-gray-500 hover:bg-gray-50 outline-none select-none"
                      selectedClassName="!bg-[#004f56] !text-white shadow-md scale-105"
                    >
                      {t("Slider")} {num}
                    </Tab>
                  ))}
                  <Tab
                    className="px-6 py-2.5 text-sm font-bold rounded-xl cursor-pointer transition-all duration-200 text-gray-500 hover:bg-gray-50 outline-none select-none"
                    selectedClassName="!bg-[#004f56] !text-white shadow-md scale-105"
                  >
                    {t("Options")}
                  </Tab>
                </TabList>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[300px]">
                 <TabPanel>
                  <div className="max-w-3xl mx-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-4">{t("SliderImages")} 1</label>
                    <Uploader imageUrl={sliderImage} setImageUrl={setSliderImage} useOriginalSize={true} folder="settings/slider" />
                    <ProductSelector 
                      label="Link to Product (Optional)" 
                      value={sliderProductId} 
                      onChangeId={setSliderProductId} 
                      onChangeSlug={setSliderProductSlug}
                    />
                    <CategorySelector 
                      label="Link to Category (Optional)" 
                      value={sliderCategoryId} 
                      onChangeId={setSliderCategoryId} 
                      onChangeSlug={setSliderCategorySlug}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Selecting a product or category will redirect users to its page when they click this banner. If both are selected, product link will take priority.</p>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="max-w-3xl mx-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-4">{t("SliderImages")} 2</label>
                    <Uploader imageUrl={sliderImageTwo} setImageUrl={setSliderImageTwo} useOriginalSize={true} folder="settings/slider" />
                    <ProductSelector 
                      label="Link to Product (Optional)" 
                      value={sliderProductIdTwo} 
                      onChangeId={setSliderProductIdTwo} 
                      onChangeSlug={setSliderProductSlugTwo}
                    />
                    <CategorySelector 
                      label="Link to Category (Optional)" 
                      value={sliderCategoryIdTwo} 
                      onChangeId={setSliderCategoryIdTwo} 
                      onChangeSlug={setSliderCategorySlugTwo}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Selecting a product or category will redirect users to its page when they click this banner. If both are selected, product link will take priority.</p>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="max-w-3xl mx-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-4">{t("SliderImages")} 3</label>
                    <Uploader imageUrl={sliderImageThree} setImageUrl={setSliderImageThree} useOriginalSize={true} folder="settings/slider" />
                    <ProductSelector 
                      label="Link to Product (Optional)" 
                      value={sliderProductIdThree} 
                      onChangeId={setSliderProductIdThree} 
                      onChangeSlug={setSliderProductSlugThree}
                    />
                    <CategorySelector 
                      label="Link to Category (Optional)" 
                      value={sliderCategoryIdThree} 
                      onChangeId={setSliderCategoryIdThree} 
                      onChangeSlug={setSliderCategorySlugThree}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Selecting a product or category will redirect users to its page when they click this banner. If both are selected, product link will take priority.</p>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="max-w-3xl mx-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-4">{t("SliderImages")} 4</label>
                    <Uploader imageUrl={sliderImageFour} setImageUrl={setSliderImageFour} useOriginalSize={true} folder="settings/slider" />
                    <ProductSelector 
                      label="Link to Product (Optional)" 
                      value={sliderProductIdFour} 
                      onChangeId={setSliderProductIdFour} 
                      onChangeSlug={setSliderProductSlugFour}
                    />
                    <CategorySelector 
                      label="Link to Category (Optional)" 
                      value={sliderCategoryIdFour} 
                      onChangeId={setSliderCategoryIdFour} 
                      onChangeSlug={setSliderCategorySlugFour}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Selecting a product or category will redirect users to its page when they click this banner. If both are selected, product link will take priority.</p>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="max-w-3xl mx-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-4">{t("SliderImages")} 5</label>
                    <Uploader imageUrl={sliderImageFive} setImageUrl={setSliderImageFive} useOriginalSize={true} folder="settings/slider" />
                    <ProductSelector 
                      label="Link to Product (Optional)" 
                      value={sliderProductIdFive} 
                      onChangeId={setSliderProductIdFive} 
                      onChangeSlug={setSliderProductSlugFive}
                    />
                    <CategorySelector 
                      label="Link to Category (Optional)" 
                      value={sliderCategoryIdFive} 
                      onChangeId={setSliderCategoryIdFive} 
                      onChangeSlug={setSliderCategorySlugFive}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Selecting a product or category will redirect users to its page when they click this banner. If both are selected, product link will take priority.</p>
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-gray-700 mb-4">{t("LeftRighArrows")}</h4>
                      <SwitchToggle handleProcess={setLeftRightArrow} processOption={leftRightArrow} />
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-gray-700 mb-4">{t("BottomDots")}</h4>
                      <SwitchToggle handleProcess={setBottomDots} processOption={bottomDots} />
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h4 className="font-bold text-gray-700 mb-4">{t("Both")}</h4>
                      <SwitchToggle handleProcess={setBothSliderOption} processOption={bothSliderOption} />
                    </div>
                  </div>
                </TabPanel>
              </div>
            </TabsComponent>
          </div>
        </div>

        {/*  ====================================================== Discount Coupon Section ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("DiscountCouponTitle1")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-[#feedd7] shadow-sm">
            {/* Main Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#feedd7] flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#fff4e6] p-3 rounded-xl border border-[#feedd7]">
                  <FiSettings className="text-[#d97706] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("ShowHide")} Section</h3>
                  <p className="text-xs text-gray-400 font-medium">Toggle the visibility of the discount area on your homepage.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${isCoupon ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {isCoupon ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle handleProcess={setIsCoupon} processOption={isCoupon} name="isCoupon" />
              </div>
            </div>

            {isCoupon ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#feedd7] space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {t("HomePageDiscountTitle")}
                    </label>
                    <InputAreaTwo
                      register={register}
                      label={t("HomePageDiscountTitle")}
                      name="discount_title"
                      type="text"
                      placeholder={t("HomePageDiscountTitle")}
                    />
                    <Error errorName={errors.discount_title} />
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#feedd7] space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {t("SuperDiscountActiveCouponCode")}
                    </label>
                    <MultiSelect
                      options={coupons}
                      value={couponList}
                      className="rounded-xl border-gray-200"
                      onChange={(v) => setCouponList(v)}
                      labelledBy="Select Coupon"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#feedd7] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                      <FiSettings className="text-[#004f56] text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{t("SliderFullWidth")}</h3>
                      <p className="text-xs text-gray-400 font-medium">Expand the slider to fill the entire container width.</p>
                    </div>
                  </div>
                  <SwitchToggle handleProcess={setIsSliderFullWidth} processOption={isSliderFullWidth} name="isSliderFullWidth" />
                </div>

                {!isSliderFullWidth && (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#feedd7] text-center">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800">{t("PlaceHolderImage")}</h3>
                      <p className="text-xs text-gray-400 font-medium">This image will appear when the slider is not full-width.</p>
                    </div>
                    <div className="max-w-2xl mx-auto p-4 border-2 border-dashed border-[#feedd7] rounded-3xl bg-gray-50/50">
                      <Uploader imageUrl={placeholderImage} setImageUrl={setPlaceHolderImage} />
                      <p className="text-[10px] text-gray-400 mt-4 italic font-medium uppercase tracking-widest">
                        Resolution: 500x400px • Max Size: 2MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/*  ====================================================== Promotion Banner ===================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("PromotionBanner")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Enable or disable the promotion banner on the storefront.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${allowPromotionBanner ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {allowPromotionBanner ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setAllowPromotionBanner}
                  processOption={allowPromotionBanner}
                  name="allowPromotionBanner"
                />
              </div>
            </div>

            {allowPromotionBanner && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Title")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("Title")}
                        name="promotion_title"
                        type="text"
                        placeholder={t("Title")}
                      />
                      <Error errorName={errors.promotion_title} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Description")}
                      </label>
                      <TextAreaCom
                        register={register}
                        label="Promotion Description"
                        name="promotion_description"
                        type="text"
                        placeholder={t("PromotionDescription")}
                      />
                      <Error errorName={errors.promotion_description} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("ButtonName")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label="Button Name"
                        name="promotion_button_name"
                        type="text"
                        placeholder={t("ButtonName")}
                      />
                      <Error errorName={errors.promotion_button_name} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("ButtonLink")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label="Button Link"
                        name="promotion_button_link"
                        type="text"
                        placeholder="https://..."
                      />
                      <Error errorName={errors.promotion_button_link} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Featured Categories ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("FeaturedCategories")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Control the visibility of categories on your homepage.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${featuredCategories ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {featuredCategories ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setFeaturedCategories}
                  processOption={featuredCategories}
                  name="featuredCategories"
                />
              </div>
            </div>

            {featuredCategories && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Title")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("Title")}
                        name="feature_title"
                        type="text"
                        placeholder={t("Title")}
                      />
                      <Error errorName={errors.feature_title} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("FeaturedCategories")} Description
                      </label>
                      <TextAreaCom
                        register={register}
                        label="Feature Description"
                        name="feature_description"
                        type="text"
                        placeholder={t("FeaturedCategories")}
                      />
                      <Error errorName={errors.feature_description} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{t("ProductsLimit")}</h4>
                      <p className="text-xs text-gray-400 mt-1">Select how many items to display in this section.</p>
                    </div>
                    <div className="max-w-xs mx-auto w-full">
                      <SelectProductLimit
                        register={register}
                        required={true}
                        label="Feature Products Limit"
                        name="feature_product_limit"
                      />
                      <Error errorName={errors.feature_product_limit} />
                    </div>
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-relaxed">
                        Recommended: 12 items for optimal grid display
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Popular Products ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("PopularProductsTitle")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Showcase your best-selling items on the homepage.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${popularProducts ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {popularProducts ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setPopularProducts}
                  processOption={popularProducts}
                  name="popularProducts"
                />
              </div>
            </div>

            {popularProducts && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Title")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("Title")}
                        name="popular_title"
                        type="text"
                        placeholder={t("Title")}
                      />
                      <Error errorName={errors.popular_title} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("PopularProductsTitle")} Description
                      </label>
                      <TextAreaCom
                        register={register}
                        label="Popular Description"
                        name="popular_description"
                        type="text"
                        placeholder={t("PopularDescription")}
                      />
                      <Error errorName={errors.popular_description} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{t("ProductsLimit")}</h4>
                      <p className="text-xs text-gray-400 mt-1">Number of popular products to display in the section.</p>
                    </div>
                    <div className="max-w-xs mx-auto w-full">
                      <SelectProductLimit
                        register={register}
                        required={true}
                        label="Popular Products Limit"
                        name="popular_product_limit"
                      />
                      <Error errorName={errors.popular_product_limit} />
                    </div>
                    <div className="mt-8 p-4 bg-[#e6f2f3]/30 rounded-xl border border-dashed border-[#d0eaec]">
                      <p className="text-[10px] text-[#004f56] font-bold uppercase tracking-widest leading-relaxed">
                        Top Tip: A limit of 8 or 12 works best for engagement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Quick Delivery Section ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("QuickDeliverySectionTitle")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Highlight fast shipping or doorstep delivery services.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${quickDelivery ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {quickDelivery ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setQuickDelivery}
                  processOption={quickDelivery}
                  name="quickDelivery"
                />
              </div>
            </div>

            {quickDelivery && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("SubTitle")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("SubTitle")}
                        name="quick_delivery_subtitle"
                        type="text"
                        placeholder={t("SubTitle")}
                      />
                      <Error errorName={errors.quick_delivery_subtitle} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Title")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("Title")}
                        name="quick_delivery_title"
                        type="text"
                        placeholder={t("Title")}
                      />
                      <Error errorName={errors.quick_delivery_title} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Description")}
                      </label>
                      <TextAreaCom
                        register={register}
                        label="Quick Delivery Description"
                        name="quick_delivery_description"
                        type="text"
                        placeholder={t("QuickDeliverySectionTitle")}
                      />
                      <Error errorName={errors.quick_delivery_description} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("ButtonName")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label="Button Name"
                        name="quick_delivery_button"
                        type="text"
                        placeholder={t("ButtonName")}
                      />
                      <Error errorName={errors.quick_delivery_button} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("ButtonLink")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label="Button Link"
                        name="quick_delivery_link"
                        type="text"
                        placeholder="https://..."
                      />
                      <Error errorName={errors.quick_delivery_link} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Graphic {t("Image")}
                      </label>
                      <Uploader
                        imageUrl={quickSectionImage}
                        setImageUrl={setQuickSectionImage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Promotional Banner Section ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("PromotionalBannerSection")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Banner 1 - Large */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banner 1 (Large)</span>
                  <div className="bg-[#e6f2f3] p-1.5 rounded-lg">
                    <FiSettings className="text-[#004f56] text-xs" />
                  </div>
                </div>
                <div className="min-h-[200px] flex flex-col justify-center">
                  <Uploader
                    imageUrl={promotionalBannerImage1}
                    setImageUrl={setPromotionalBannerImage1}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("Banner1Link")}</label>
                  <InputAreaTwo
                    register={register}
                    label="Banner 1 Link"
                    name="promotional_banner_link1"
                    type="text"
                    placeholder="/search?..."
                  />
                  <Error errorName={errors.promotional_banner_link1} />
                </div>
                <div>
                  <ProductSelector
                    label="Link to Product (Optional)"
                    value={promoProductId1}
                    onChangeId={setPromoProductId1}
                    onChangeSlug={setPromoProductSlug1}
                  />
                  <CategorySelector
                    label="Link to Category (Optional)"
                    value={promoCategoryId1}
                    onChangeId={setPromoCategoryId1}
                    onChangeSlug={setPromoCategorySlug1}
                  />
                </div>
              </div>

              {/* Banner 2 - Small Top */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banner 2 (Small Top)</span>
                  <div className="bg-[#e6f2f3] p-1.5 rounded-lg">
                    <FiSettings className="text-[#004f56] text-xs" />
                  </div>
                </div>
                <div className="min-h-[200px] flex flex-col justify-center">
                  <Uploader
                    imageUrl={promotionalBannerImage2}
                    setImageUrl={setPromotionalBannerImage2}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("Banner2Link")}</label>
                  <InputAreaTwo
                    register={register}
                    label="Banner 2 Link"
                    name="promotional_banner_link2"
                    type="text"
                    placeholder="/search?..."
                  />
                  <Error errorName={errors.promotional_banner_link2} />
                </div>
                <div>
                  <ProductSelector
                    label="Link to Product (Optional)"
                    value={promoProductId2}
                    onChangeId={setPromoProductId2}
                    onChangeSlug={setPromoProductSlug2}
                  />
                  <CategorySelector
                    label="Link to Category (Optional)"
                    value={promoCategoryId2}
                    onChangeId={setPromoCategoryId2}
                    onChangeSlug={setPromoCategorySlug2}
                  />
                </div>
              </div>

              {/* Banner 3 - Small Bottom */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banner 3 (Small Bottom)</span>
                  <div className="bg-[#e6f2f3] p-1.5 rounded-lg">
                    <FiSettings className="text-[#004f56] text-xs" />
                  </div>
                </div>
                <div className="min-h-[200px] flex flex-col justify-center">
                  <Uploader
                    imageUrl={promotionalBannerImage3}
                    setImageUrl={setPromotionalBannerImage3}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("Banner3Link")}</label>
                  <InputAreaTwo
                    register={register}
                    label="Banner 3 Link"
                    name="promotional_banner_link3"
                    type="text"
                    placeholder="/search?..."
                  />
                  <Error errorName={errors.promotional_banner_link3} />
                </div>
                <div>
                  <ProductSelector
                    label="Link to Product (Optional)"
                    value={promoProductId3}
                    onChangeId={setPromoProductId3}
                    onChangeSlug={setPromoProductSlug3}
                  />
                  <CategorySelector
                    label="Link to Category (Optional)"
                    value={promoCategoryId3}
                    onChangeId={setPromoCategoryId3}
                    onChangeSlug={setPromoCategorySlug3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  ====================================================== Latest Discounted Products ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("LatestDiscountedProductsTitle")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Display your latest deals and discounted products.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${latestDiscounted ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {latestDiscounted ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setLatestDiscounted}
                  processOption={latestDiscounted}
                  name="latestDiscounted"
                />
              </div>
            </div>

            {latestDiscounted && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Title")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("Title")}
                        name="latest_discount_title"
                        type="text"
                        placeholder={t("Title")}
                      />
                      <Error errorName={errors.latest_discount_title} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Description")}
                      </label>
                      <TextAreaCom
                        register={register}
                        label="Latest Discount Description"
                        name="latest_discount_description"
                        type="text"
                        placeholder={t("LatestDiscountDescription")}
                      />
                      <Error errorName={errors.latest_discount_description} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{t("ProductsLimit")}</h4>
                      <p className="text-xs text-gray-400 mt-1">Number of discounted products to show.</p>
                    </div>
                    <div className="max-w-xs mx-auto w-full">
                      <SelectProductLimit
                        register={register}
                        required={true}
                        label="Latest Discount Products Limit"
                        name="latest_discount_product_limit"
                      />
                      <Error errorName={errors.latest_discount_product_limit} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Get Your Daily Needs Banner Section ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("GetYourDailyNeedsTitle")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Daily essentials promotion section with custom banners.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${dailyNeeds ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {dailyNeeds ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setDailyNeeds}
                  processOption={dailyNeeds}
                  name="dailyNeeds"
                />
              </div>
            </div>

            {dailyNeeds && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Title")}
                      </label>
                      <InputAreaTwo
                        register={register}
                        label={t("Title")}
                        name="daily_need_title"
                        type="text"
                        placeholder={t("Title")}
                      />
                      <Error errorName={errors.daily_need_title} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {t("Description")}
                      </label>
                      <TextAreaCom
                        register={register}
                        label="Daily Need Description"
                        name="daily_need_description"
                        type="text"
                        placeholder={t("DailyNeedDescription")}
                      />
                      <Error errorName={errors.daily_need_description} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("ImageLeft")}</label>
                        <Uploader
                          imageUrl={getYourDailyNeedImageLeft}
                          setImageUrl={setGetYourDailyNeedImageLeft}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("ImageRight")}</label>
                        <Uploader
                          imageUrl={getYourDailyNeedImageRight}
                          setImageUrl={setGetYourDailyNeedImageRight}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">App Store Icon</label>
                          <Uploader
                            imageUrl={getButton1image}
                            setImageUrl={setGetButton1image}
                          />
                        </div>
                        <div className="flex flex-col justify-end pb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("Button1Link")}</label>
                          <InputAreaTwo
                            register={register}
                            label="Button Link "
                            name="daily_need_app_link"
                            type="text"
                            placeholder="https://..."
                          />
                          <Error errorName={errors.daily_need_app_link} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Google Play Icon</label>
                          <Uploader
                            imageUrl={getButton2image}
                            setImageUrl={setGetButton2image}
                          />
                        </div>
                        <div className="flex flex-col justify-end pb-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{t("Button2Link")}</label>
                          <InputAreaTwo
                            register={register}
                            label="Button Link "
                            name="daily_need_google_link"
                            type="text"
                            placeholder="https://..."
                          />
                          <Error errorName={errors.daily_need_google_link} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Feature Promo Section ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("FeaturePromoSectionTitle")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm">
            {/* Enable Toggle Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#e6f2f3] p-3 rounded-xl border border-[#d0eaec]">
                  <FiSettings className="text-[#004f56] text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t("EnableThisBlock")}</h3>
                  <p className="text-xs text-gray-400 font-medium">Display trust badges or feature highlights at the bottom.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase transition-colors ${featurePromo ? 'text-[#004f56]' : 'text-gray-400'}`}>
                  {featurePromo ? 'Enabled' : 'Disabled'}
                </span>
                <SwitchToggle
                  handleProcess={setFeaturePromo}
                  processOption={featurePromo}
                  name="featurePromo"
                />
              </div>
            </div>

            {featurePromo && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("FreeShipping")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="promo_free_shipping"
                      type="text"
                      placeholder="From $500.00"
                    />
                    <Error errorName={errors.promo_free_shipping} />
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("Support")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="promo_support"
                      type="text"
                      placeholder="24/7 At Anytime"
                    />
                    <Error errorName={errors.promo_support} />
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("SecurePayment")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="promo_payment"
                      type="text"
                      placeholder={t("SecurePayment")}
                    />
                    <Error errorName={errors.promo_payment} />
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("LatestOffer")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="promo_offer"
                      type="text"
                      placeholder="Upto 20% Off"
                    />
                    <Error errorName={errors.promo_offer} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*  ====================================================== Footer Section ====================================================== */}
        <div className="col-span-12 mt-12 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-[#e6f2f3] p-2 rounded-lg">
              <FiSettings className="text-[#004f56] text-xl" />
            </div>
            <h2 className="text-xl font-bold text-[#004f56]">{t("FooterTitle")}</h2>
          </div>

          <div className="bg-[#f9fafb] rounded-3xl p-8 border border-gray-100 shadow-sm space-y-12">
            {/* Block 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#004f56] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t("Block")} 1 Settings</h3>
                    <p className="text-xs text-gray-400 font-medium">Configure primary navigation links for the first footer column.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase transition-colors ${footerBlock1 ? 'text-[#004f56]' : 'text-gray-400'}`}>
                    {footerBlock1 ? 'Active' : 'Hidden'}
                  </span>
                  <SwitchToggle
                    handleProcess={setFooterBlock1}
                    processOption={footerBlock1}
                    name="footerBlock1"
                  />
                </div>
              </div>

              {footerBlock1 && (
                <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                  <div className="max-w-md">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("Title")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="footer_block_one_title"
                      type="text"
                      placeholder="Company"
                    />
                    <Error errorName={errors.footer_block_one_title} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[1, 2, 3, 4].map((num) => {
                      const linkNames = ["one", "two", "three", "four"];
                      const suffix = linkNames[num - 1];
                      const titleName = `footer_block_one_link_${suffix}_title`;
                      const urlName = `footer_block_one_link_${suffix}`;
                      
                      return (
                        <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">{t("Link")} {num}</label>
                          <InputAreaTwo
                            register={register}
                            label="Title"
                            name={titleName}
                            type="text"
                            placeholder="Link Title"
                          />
                          <InputAreaTwo
                            register={register}
                            label="URL"
                            name={urlName}
                            type="text"
                            placeholder="/link-url"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Block 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#004f56] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t("Block")} 2 Settings</h3>
                    <p className="text-xs text-gray-400 font-medium">Configure category links for the second footer column.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase transition-colors ${footerBlock2 ? 'text-[#004f56]' : 'text-gray-400'}`}>
                    {footerBlock2 ? 'Active' : 'Hidden'}
                  </span>
                  <SwitchToggle
                    handleProcess={setFooterBlock2}
                    processOption={footerBlock2}
                    name="footerBlock2"
                  />
                </div>
              </div>

              {footerBlock2 && (
                <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                  <div className="max-w-md">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("Title")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="footer_block_two_title"
                      type="text"
                      placeholder={t("TopCategory")}
                    />
                    <Error errorName={errors.footer_block_two_title} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[1, 2, 3, 4].map((num) => {
                      const linkNames = ["one", "two", "three", "four"];
                      const suffix = linkNames[num - 1];
                      const titleName = `footer_block_two_link_${suffix}_title`;
                      const urlName = `footer_block_two_link_${suffix}`;
                      
                      return (
                        <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">{t("Link")} {num}</label>
                          <InputAreaTwo
                            register={register}
                            label="Title"
                            name={titleName}
                            type="text"
                            placeholder="Link Title"
                          />
                          <InputAreaTwo
                            register={register}
                            label="URL"
                            name={urlName}
                            type="text"
                            placeholder="/link-url"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Block 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#004f56] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t("Block")} 3 Settings</h3>
                    <p className="text-xs text-gray-400 font-medium">Configure user account links for the third footer column.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase transition-colors ${footerBlock3 ? 'text-[#004f56]' : 'text-gray-400'}`}>
                    {footerBlock3 ? 'Active' : 'Hidden'}
                  </span>
                  <SwitchToggle
                    handleProcess={setFooterBlock3}
                    processOption={footerBlock3}
                    name="footerBlock3"
                  />
                </div>
              </div>

              {footerBlock3 && (
                <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                  <div className="max-w-md">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("Title")}</label>
                    <InputAreaTwo
                      register={register}
                      label="Title"
                      name="footer_block_three_title"
                      type="text"
                      placeholder="My Account"
                    />
                    <Error errorName={errors.footer_block_three_title} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {[1, 2, 3, 4].map((num) => {
                      const linkNames = ["one", "two", "three", "four"];
                      const suffix = linkNames[num - 1];
                      const titleName = `footer_block_three_link_${suffix}_title`;
                      const urlName = `footer_block_three_link_${suffix}`;
                      
                      return (
                        <div key={num} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase">{t("Link")} {num}</label>
                          <InputAreaTwo
                            register={register}
                            label="Title"
                            name={titleName}
                            type="text"
                            placeholder="Link Title"
                          />
                          <InputAreaTwo
                            register={register}
                            label="URL"
                            name={urlName}
                            type="text"
                            placeholder="/link-url"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Block 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#004f56] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t("Block")} 4 Settings</h3>
                    <p className="text-xs text-gray-400 font-medium">Configure primary contact details and store positioning.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase transition-colors ${footerBlock4 ? 'text-[#004f56]' : 'text-gray-400'}`}>
                    {footerBlock4 ? 'Active' : 'Hidden'}
                  </span>
                  <SwitchToggle
                    handleProcess={setFooterBlock4}
                    processOption={footerBlock4}
                    name="footerBlock4"
                  />
                </div>
              </div>

              {footerBlock4 && (
                <div className="space-y-8 animate-[fadeIn_0.5s_ease-in-out]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("FooterLogo")}</label>
                        <Uploader
                          imageUrl={footerLogo}
                          setImageUrl={setFooterLogo}
                          useOriginalSize={true}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("FooterAddress")}</label>
                        <InputAreaTwo
                          register={register}
                          label="Address"
                          name="footer_block_four_address"
                          type="text"
                          placeholder="Store Address"
                        />
                        <Error errorName={errors.footer_block_four_address} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("FooterPhone")}</label>
                        <InputAreaTwo
                          register={register}
                          label="Phone"
                          name="footer_block_four_phone"
                          type="text"
                          placeholder="+1 234 567 890"
                        />
                        <Error errorName={errors.footer_block_four_phone} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("FooterEmail")}</label>
                        <InputAreaTwo
                          register={register}
                          label="Email"
                          name="footer_block_four_email"
                          type="text"
                          placeholder="contact@store.com"
                        />
                        <Error errorName={errors.footer_block_four_email} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#e6f2f3] p-1.5 rounded-lg">
                    <FiSettings className="text-[#004f56] text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t("SocialLinks")}</h3>
                    <p className="text-xs text-gray-400 font-medium">Connect your store with social media platforms.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase transition-colors ${footerSocialLinks ? 'text-[#004f56]' : 'text-gray-400'}`}>
                    {footerSocialLinks ? 'Active' : 'Hidden'}
                  </span>
                  <SwitchToggle
                    handleProcess={setFooterSocialLinks}
                    processOption={footerSocialLinks}
                    name="footerSocialLinks"
                  />
                </div>
              </div>

              {footerSocialLinks && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.5s_ease-in-out]">
                  {[
                    { name: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                    { name: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/...' },
                    { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                    { name: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
                    { name: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/...' }
                  ].map((social) => (
                    <div key={social.name} className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{social.label}</label>
                      <InputAreaTwo
                        register={register}
                        label={social.label}
                        name={`social_` + social.name}
                        type="text"
                        placeholder={social.placeholder}
                      />
                      <Error errorName={errors[`social_` + social.name]} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment & Bottom Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Method */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#e6f2f3] p-1.5 rounded-lg">
                      <FiSettings className="text-[#004f56] text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{t("PaymentMethod")}</h3>
                  </div>
                  <SwitchToggle
                    handleProcess={setFooterPaymentMethod}
                    processOption={footerPaymentMethod}
                    name="footerPaymentMethod"
                  />
                </div>
                
                {footerPaymentMethod && (
                  <div className="animate-[fadeIn_0.5s_ease-in-out]">
                    <Uploader
                      imageUrl={paymentImage}
                      setImageUrl={setPaymentImage}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Contact */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#e6f2f3] p-1.5 rounded-lg">
                      <FiSettings className="text-[#004f56] text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{t("FooterBottomContact")}</h3>
                  </div>
                  <SwitchToggle
                    handleProcess={setFooterBottomContact}
                    processOption={footerBottomContact}
                    name="footerBottomContact"
                  />
                </div>

                {footerBottomContact && (
                  <div className="animate-[fadeIn_0.5s_ease-in-out]">
                    <InputAreaTwo
                      register={register}
                      label="Contact Info"
                      name="footer_Bottom_Contact"
                      type="text"
                      placeholder="e.g. Call Us: +01 123 456 789"
                    />
                    <Error errorName={errors.footer_Bottom_Contact} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;

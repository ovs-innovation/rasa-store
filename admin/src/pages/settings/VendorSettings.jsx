import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiInfo,
  FiRefreshCw,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";

// internal import
import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import SettingServices from "@/services/SettingServices";
import { notifyError, notifySuccess } from "@/utils/toast";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import Loading from "@/components/preloader/Loading";

const VendorSettings = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelEnableModalOpen, setIsCancelEnableModalOpen] = useState(false);
  const [isCancelDisableModalOpen, setIsCancelDisableModalOpen] = useState(false);
  const [isSelfRegEnableModalOpen, setIsSelfRegEnableModalOpen] = useState(false);
  const [isSelfRegDisableModalOpen, setIsSelfRegDisableModalOpen] = useState(false);
  const [isGalleryEnableModalOpen, setIsGalleryEnableModalOpen] = useState(false);
  const [isGalleryDisableModalOpen, setIsGalleryDisableModalOpen] = useState(false);
  const [isReviewReplyEnableModalOpen, setIsReviewReplyEnableModalOpen] = useState(false);
  const [isReviewReplyDisableModalOpen, setIsReviewReplyDisableModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    vendorCancelOrder: true,
    vendorSelfRegistration: true,
    productGallery: true,
    vendorCanReplyReview: true,
    approvalStatus: true,
    approvalAddNewProduct: true,
    approvalUpdateExistingProduct: true,
    updateOptionPrice: true,
    updateOptionVariation: true,
    updateOptionDetails: true,
    cashInHandOverflow: true,
    maxCashInHand: 20000,
    minAmountToPay: 50,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await SettingServices.getVendorSetting();
        if (res && Object.keys(res).length > 0) {
          setSettings({
            vendorCancelOrder: res.vendor_cancel_order ?? true,
            vendorSelfRegistration: res.vendor_self_registration ?? true,
            productGallery: res.product_gallery ?? true,
            vendorCanReplyReview: res.vendor_reply_review ?? true,
            approvalStatus: res.approval_status ?? true,
            approvalAddNewProduct: res.approval_add_new_product ?? true,
            approvalUpdateExistingProduct: res.approval_update_existing_product ?? true,
            updateOptionPrice: res.update_option_price ?? true,
            updateOptionVariation: res.update_option_variation ?? true,
            updateOptionDetails: res.update_option_details ?? true,
            cashInHandOverflow: res.cash_in_hand_overflow ?? true,
            maxCashInHand: res.max_cash_in_hand ?? 20000,
            minAmountToPay: res.min_amount_to_pay ?? 50,
          });
        }
      } catch (error) {
        console.error("Error fetching vendor settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: "vendorSetting",
        setting: {
          vendor_cancel_order: settings.vendorCancelOrder,
          vendor_self_registration: settings.vendorSelfRegistration,
          product_gallery: settings.productGallery,
          vendor_reply_review: settings.vendorCanReplyReview,
          approval_status: settings.approvalStatus,
          approval_add_new_product: settings.approvalAddNewProduct,
          approval_update_existing_product: settings.approvalUpdateExistingProduct,
          update_option_price: settings.updateOptionPrice,
          update_option_variation: settings.updateOptionVariation,
          update_option_details: settings.updateOptionDetails,
          cash_in_hand_overflow: settings.cashInHandOverflow,
          max_cash_in_hand: Number(settings.maxCashInHand),
          min_amount_to_pay: Number(settings.minAmountToPay),
        },
      };
      const res = await SettingServices.updateVendorSetting(payload);
      notifySuccess(res.message || "Vendor settings updated successfully!");
    } catch (error) {
      notifyError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSettings({
      vendorCancelOrder: true,
      vendorSelfRegistration: true,
      productGallery: true,
      vendorCanReplyReview: true,
      approvalStatus: true,
      approvalAddNewProduct: true,
      approvalUpdateExistingProduct: true,
      updateOptionPrice: true,
      updateOptionVariation: true,
      updateOptionDetails: true,
      cashInHandOverflow: true,
      maxCashInHand: 20000,
      minAmountToPay: 50,
    });
    notifySuccess("Settings reset to defaults");
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <PageTitle>Vendor Settings</PageTitle>
      <AnimatedContent>
        <div className="space-y-8 pb-12">
          {/* General Setup */}
          <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-10">
              <h3 className="text-[20px] font-bold text-[#202938] dark:text-white mb-2">
                General Setup
              </h3>
              <p className="text-[15px] text-[#73849b]">
                Manage the basic settings that control how vendors operate in your platform.
              </p>
            </div>

            <div className="bg-[#f8fafc] p-8 rounded-3xl dark:bg-gray-900/40">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                <InputToggleWrapper
                  label="Can A Vendor Cancel Order?"
                  info="Enable this to allow vendors to cancel orders"
                >
                  <ToggleItem
                    label="Can Cancel"
                    checked={settings.vendorCancelOrder}
                    onChange={() => {
                      if (settings.vendorCancelOrder) {
                        setIsCancelDisableModalOpen(true);
                      } else {
                        setIsCancelEnableModalOpen(true);
                      }
                    }}
                  />
                </InputToggleWrapper>

                <InputToggleWrapper
                  label="Vendor self registration"
                  info="Enable this to allow vendors to register themselves"
                >
                  <ToggleItem
                    label="Self Registration"
                    checked={settings.vendorSelfRegistration}
                    onChange={() => {
                      if (settings.vendorSelfRegistration) {
                        setIsSelfRegDisableModalOpen(true);
                      } else {
                        setIsSelfRegEnableModalOpen(true);
                      }
                    }}
                  />
                </InputToggleWrapper>

                <InputToggleWrapper
                  label="Product Gallery"
                  info="Enable product gallery for vendors"
                >
                  <ToggleItem
                    label="Gallery"
                    checked={settings.productGallery}
                    onChange={() => {
                      if (settings.productGallery) {
                        setIsGalleryDisableModalOpen(true);
                      } else {
                        setIsGalleryEnableModalOpen(true);
                      }
                    }}
                  />
                </InputToggleWrapper>

                <InputToggleWrapper
                  label="Vendor Can Reply Review"
                  info="Allow vendors to reply to customer reviews"
                >
                  <ToggleItem
                    label="Can Reply"
                    checked={settings.vendorCanReplyReview}
                    onChange={() => {
                      if (settings.vendorCanReplyReview) {
                        setIsReviewReplyDisableModalOpen(true);
                      } else {
                        setIsReviewReplyEnableModalOpen(true);
                      }
                    }}
                  />
                </InputToggleWrapper>
              </div>
            </div>
          </section>

          {/* Need Approval For */}
          <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-[20px] font-bold text-[#202938] dark:text-white mb-2">
                  Need Approval For
                </h3>
                <p className="text-[15px] text-[#73849b]">
                  If enabled this option to require admin approval for products to be displayed on the user side.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-[#f8fafc] border border-[#eef2f7] rounded-xl px-5 py-3 dark:bg-gray-900 dark:border-gray-700">
                <span className="text-[16px] font-bold text-[#202938] dark:text-white">Status</span>
                <SwitchToggle
                  processOption={settings.approvalStatus}
                  handleProcess={() => updateSetting("approvalStatus", !settings.approvalStatus)}
                />
              </div>
            </div>

            {settings.approvalStatus && (
              <div className="space-y-8 transition-all animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CheckboxCard
                    label="Add New Product"
                    description="If enabled, admin approval is required each time a vendor submits a new product."
                    checked={settings.approvalAddNewProduct}
                    onChange={() => updateSetting("approvalAddNewProduct", !settings.approvalAddNewProduct)}
                  />
                  <CheckboxCard
                    label="Update Existing Product"
                    description="If enabled, admin approval is required each time a vendor updates an existing product."
                    checked={settings.approvalUpdateExistingProduct}
                    onChange={() => updateSetting("approvalUpdateExistingProduct", !settings.approvalUpdateExistingProduct)}
                  />
                </div>

                {settings.approvalUpdateExistingProduct && (
                  <div className="bg-[#f8fafc] p-8 rounded-3xl dark:bg-gray-900/40 animate-fadeIn">
                    <div className="mb-6 flex items-center gap-2 text-[15px] font-bold text-[#42526b] dark:text-gray-100">
                      Available Option for Update Existing Product <span className="text-red-500">*</span> <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                    </div>
                    <div className="flex flex-wrap gap-12">
                      <CheckboxItem
                        label="Update product price"
                        checked={settings.updateOptionPrice}
                        onChange={() => updateSetting("updateOptionPrice", !settings.updateOptionPrice)}
                      />
                      <CheckboxItem
                        label="Update product variation"
                        checked={settings.updateOptionVariation}
                        onChange={() => updateSetting("updateOptionVariation", !settings.updateOptionVariation)}
                      />
                      <CheckboxItem
                        label="Update anything in product details"
                        checked={settings.updateOptionDetails}
                        onChange={() => updateSetting("updateOptionDetails", !settings.updateOptionDetails)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Cash in Hand Controls */}
          <section className="bg-white border border-[#f1f5f9] rounded-[24px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-10">
              <h3 className="text-[20px] font-bold text-[#202938] dark:text-white mb-2">
                Cash in Hand Controls
              </h3>
              <p className="text-[15px] text-[#73849b]">
                Setup your cash collection from here
              </p>
            </div>

            <div className="bg-[#f8fafc] p-8 rounded-3xl dark:bg-gray-900/40">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <InputToggleWrapper label="Cash In Hand Overflow">
                  <ToggleItem
                    label="Cash In Hand Overflow"
                    checked={settings.cashInHandOverflow}
                    onChange={(val) => updateSetting("cashInHandOverflow", val)}
                  />
                </InputToggleWrapper>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-[15px] font-bold text-[#42526b] dark:text-gray-100">
                    Maximum Amount To Hold Cash In Hand (₹) <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                  </div>
                  <input
                    type="number"
                    value={settings.maxCashInHand}
                    onChange={(e) => updateSetting("maxCashInHand", e.target.value)}
                    className="w-full h-[58px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base font-medium text-[#2f3b4f] outline-none focus:border-[#0e7e87] transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-[15px] font-bold text-[#42526b] dark:text-gray-100">
                    Minimum Amount To Pay (₹) <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                  </div>
                  <input
                    type="number"
                    value={settings.minAmountToPay}
                    onChange={(e) => updateSetting("minAmountToPay", e.target.value)}
                    className="w-full h-[58px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base font-medium text-[#2f3b4f] outline-none focus:border-[#0e7e87] transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#d1e9ff] bg-[#e6f4ff] p-4 dark:border-blue-800/30 dark:bg-blue-900/10">
                <FiAlertCircle className="h-5 w-5 text-[#1890ff]" />
                <p className="text-[14px] text-[#262626] dark:text-gray-300">
                  To setup vendor cash withdraw method visit <span className="text-[#0e7e87] font-bold cursor-pointer hover:underline">Withdraw Method List</span> Page.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-row justify-end items-center gap-4 border-t border-[#eef2f7] pt-8 mt-12 dark:border-gray-700">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="h-14 px-8 rounded-xl border border-[#dbe4ef] bg-[#f4f7fb] text-[16px] font-bold text-[#324054] transition-all hover:bg-[#e9eef5] flex items-center justify-center gap-2 disabled:opacity-60 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <FiRefreshCw className="h-5 w-5" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="h-14 px-8 rounded-xl bg-[#0e7e87] text-[16px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74] flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <img src={spinnerLoadingImage} alt="Saving" width={22} height={22} className="animate-spin" />
                    <span>Saving Information</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-5 w-5" />
                    <span>Save Information</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </AnimatedContent>

      <CancelEnableModal
        isOpen={isCancelEnableModalOpen}
        onClose={() => setIsCancelEnableModalOpen(false)}
        onConfirm={() => {
          updateSetting("vendorCancelOrder", true);
          setIsCancelEnableModalOpen(false);
        }}
      />

      <CancelDisableModal
        isOpen={isCancelDisableModalOpen}
        onClose={() => setIsCancelDisableModalOpen(false)}
        onConfirm={() => {
          updateSetting("vendorCancelOrder", false);
          setIsCancelDisableModalOpen(false);
        }}
      />

      <RegistrationEnableModal
        isOpen={isSelfRegEnableModalOpen}
        onClose={() => setIsSelfRegEnableModalOpen(false)}
        onConfirm={() => {
          updateSetting("vendorSelfRegistration", true);
          setIsSelfRegEnableModalOpen(false);
        }}
      />

      <RegistrationDisableModal
        isOpen={isSelfRegDisableModalOpen}
        onClose={() => setIsSelfRegDisableModalOpen(false)}
        onConfirm={() => {
          updateSetting("vendorSelfRegistration", false);
          setIsSelfRegDisableModalOpen(false);
        }}
      />

      <GalleryEnableModal
        isOpen={isGalleryEnableModalOpen}
        onClose={() => setIsGalleryEnableModalOpen(false)}
        onConfirm={() => {
          updateSetting("productGallery", true);
          setIsGalleryEnableModalOpen(false);
        }}
      />

      <GalleryDisableModal
        isOpen={isGalleryDisableModalOpen}
        onClose={() => setIsGalleryDisableModalOpen(false)}
        onConfirm={() => {
          updateSetting("productGallery", false);
          setIsGalleryDisableModalOpen(false);
        }}
      />

      <ReviewReplyEnableModal
        isOpen={isReviewReplyEnableModalOpen}
        onClose={() => setIsReviewReplyEnableModalOpen(false)}
        onConfirm={() => {
          updateSetting("vendorCanReplyReview", true);
          setIsReviewReplyEnableModalOpen(false);
        }}
      />

      <ReviewReplyDisableModal
        isOpen={isReviewReplyDisableModalOpen}
        onClose={() => setIsReviewReplyDisableModalOpen(false)}
        onConfirm={() => {
          updateSetting("vendorCanReplyReview", false);
          setIsReviewReplyDisableModalOpen(false);
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </>
  );
};

const InputToggleWrapper = ({ label, info, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3 text-[15px] font-bold text-[#42526b] dark:text-gray-100">
      {label} {info && <FiInfo className="h-4 w-4 text-[#93a1b3]" />}
    </div>
    {children}
  </div>
);

const ToggleItem = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between bg-white border border-[#e6ebf5] rounded-xl px-5 py-4 dark:bg-gray-900 dark:border-gray-700 shadow-sm">
    <span className="text-[16px] font-medium text-[#2f3b4f] dark:text-white">{label}</span>
    <SwitchToggle
      processOption={checked}
      handleProcess={() => onChange(!checked)}
    />
  </div>
);

const CheckboxCard = ({ label, description, checked, onChange }) => (
  <div
    onClick={onChange}
    className={`p-6 bg-white border rounded-2xl cursor-pointer transition-all flex gap-4 dark:bg-gray-900 ${checked ? 'border-[#0e7e87] shadow-sm' : 'border-[#eef2f7] dark:border-gray-800'
      }`}
  >
    <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all ${checked ? 'bg-[#0e7e87] text-white' : 'border-2 border-gray-200 dark:border-gray-700'
      }`}>
      {checked && <FiCheck className="w-4 h-4 stroke-[3]" />}
    </div>
    <div>
      <h4 className="text-[16px] font-bold text-[#202938] dark:text-white mb-1.5">{label}</h4>
      <p className="text-[14px] leading-relaxed text-[#73849b]">{description}</p>
    </div>
  </div>
);

const CheckboxItem = ({ label, checked, onChange }) => (
  <div
    onClick={onChange}
    className="flex items-center gap-3 cursor-pointer group"
  >
    <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${checked ? 'bg-[#0e7e87] text-white' : 'border-2 border-gray-200 dark:border-gray-700 group-hover:border-gray-300'
      }`}>
      {checked && <FiCheck className="w-4 h-4 stroke-[3]" />}
    </div>
    <span className="text-[15px] font-medium text-[#42526b] dark:text-white">{label}</span>
  </div>
);

const CancelEnableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
             <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to allow vendor to cancel orders?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          Vendors will be able to cancel orders directly from their panel if they cannot fulfill them.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const CancelDisableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to not allow vendor to cancel orders?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          Vendors will no longer have the option to cancel. They will need to contact the admin to request any order cancellations.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const RegistrationEnableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to enable vendor Self Registration?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          This allows new business owners to sign up and apply to sell on your platform by themselves.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const RegistrationDisableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to disable vendor Self Registration?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          New business owners will no longer be able to sign up or apply to sell on your platform by themselves.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const GalleryEnableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to enable Product Gallery?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          This allows vendors to duplicate products and create new products using the gallery.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const GalleryDisableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to disable Product Gallery?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          If disabled, vendors will not be able to duplicate products or create new products using the gallery.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const ReviewReplyEnableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to enable Vendor Can Reply Review?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          If enabled, vendors can actively engage with the customers by responding to the reviews left for their orders.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const ReviewReplyDisableModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-12 text-center shadow-2xl transition-all dark:bg-gray-800">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:bg-gray-700 p-2 rounded-full transition-colors">
          <FiX className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f7ff]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3b82f6] text-white">
            <span className="text-[40px] font-serif italic font-bold">i</span>
          </div>
        </div>

        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Are you sure to disable Vendor Can Reply Review?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          If disabled, vendors can not reply to reviews left for their orders.
        </p>

        <div className="flex gap-6 mb-10">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        <p className="text-[#4c8cf7] text-[14px] font-medium">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

export default VendorSettings;

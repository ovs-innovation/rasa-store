import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiChevronDown,
  FiEdit2,
  FiInfo,
  FiPower,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

// internal import
import PageTitle from "@/components/Typography/PageTitle";
import AnimatedContent from "@/components/common/AnimatedContent";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import SettingServices from "@/services/SettingServices";
import useDisableForDemo from "@/hooks/useDisableForDemo";
import { notifyError, notifySuccess } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";
import spinnerLoadingImage from "@/assets/img/spinner.gif";

const DEFAULT_ORDER_SETTINGS = {
  homeDelivery: true,
  takeaway: true,
  scheduledOrder: true,
  timeInterval: "30",
  timeIntervalUnit: "min",
  adminNotification: true,
  notificationType: "firebase",
  freeDeliverySetup: true,
  freeDeliveryOption: "specific_criteria",
  freeDeliveryOver: "5000",
  extraPackagingCharge: false,
  extraPackagingGrocery: true,
  extraPackagingFood: true,
  extraPackagingPharmacy: true,
  extraPackagingEcommerce: true,
  prescriptionOrder: false,
  deliveryVerification: false,
  confirmOrderBy: "store",
  cancellationReasons: [
    { id: 1, reason: "I ordered the wrong food", userType: "Customer", status: true },
    { id: 2, reason: "Right now, I am busy to serve another order", userType: "Deliveryman", status: true },
    { id: 3, reason: "For bad weather, can't send delivery", userType: "Deliveryman", status: true },
    { id: 4, reason: "Now its restaurant closing time", userType: "Store", status: true }
  ],
};

const normalizeOrderSettings = (data = {}) => ({
  homeDelivery:
    data.home_delivery_status ?? DEFAULT_ORDER_SETTINGS.homeDelivery,
  takeaway: data.takeaway_status ?? DEFAULT_ORDER_SETTINGS.takeaway,
  scheduledOrder:
    data.scheduled_order_status ?? DEFAULT_ORDER_SETTINGS.scheduledOrder,
  timeInterval: String(
    data.scheduled_delivery_interval ?? DEFAULT_ORDER_SETTINGS.timeInterval
  ),
  timeIntervalUnit:
    data.scheduled_delivery_interval_unit ??
    DEFAULT_ORDER_SETTINGS.timeIntervalUnit,
  adminNotification:
    data.admin_order_notification_status ??
    DEFAULT_ORDER_SETTINGS.adminNotification,
  notificationType:
    data.order_notification_type ?? DEFAULT_ORDER_SETTINGS.notificationType,
  freeDeliverySetup:
    data.free_delivery_status ?? DEFAULT_ORDER_SETTINGS.freeDeliverySetup,
  freeDeliveryOption:
    data.free_delivery_option ?? DEFAULT_ORDER_SETTINGS.freeDeliveryOption,
  freeDeliveryOver: String(
    data.free_delivery_over ?? DEFAULT_ORDER_SETTINGS.freeDeliveryOver
  ),
  extraPackagingCharge:
    data.extra_packaging_charge_status ??
    DEFAULT_ORDER_SETTINGS.extraPackagingCharge,
  extraPackagingGrocery:
    data.extra_packaging_grocery_status ??
    DEFAULT_ORDER_SETTINGS.extraPackagingGrocery,
  extraPackagingFood:
    data.extra_packaging_food_status ??
    DEFAULT_ORDER_SETTINGS.extraPackagingFood,
  extraPackagingPharmacy:
    data.extra_packaging_pharmacy_status ??
    DEFAULT_ORDER_SETTINGS.extraPackagingPharmacy,
  extraPackagingEcommerce:
    data.extra_packaging_ecommerce_status ??
    DEFAULT_ORDER_SETTINGS.extraPackagingEcommerce,
  prescriptionOrder:
    data.prescription_order_status ?? DEFAULT_ORDER_SETTINGS.prescriptionOrder,
  deliveryVerification:
    data.order_delivery_verification_status ??
    DEFAULT_ORDER_SETTINGS.deliveryVerification,
  confirmOrderBy:
    data.order_confirmation_type ?? DEFAULT_ORDER_SETTINGS.confirmOrderBy,
  cancellationReasons:
    data.cancellation_reasons ?? DEFAULT_ORDER_SETTINGS.cancellationReasons,
});



const RadioChoice = ({ label, checked, onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 text-left ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${checked
          ? "border-[#0e7e87]"
          : "border-[#cfd8e3] bg-white dark:border-gray-600 dark:bg-gray-900"
          }`}
      >
        {checked && <span className="h-3.5 w-3.5 rounded-full bg-[#0e7e87]" />}
      </span>
      <span className="text-[15px] font-medium text-[#6f809a] dark:text-gray-300">
        {label}
      </span>
    </button>
  );
};

const CheckboxChoice = ({ label, checked, onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 text-left ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${checked
          ? "bg-[#0e7e87] border-[#0e7e87]"
          : "bg-white border-[#cfd8e3] dark:bg-gray-900 dark:border-gray-600"
          }`}
      >
        {checked && (
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-[15px] font-medium text-[#6f809a] dark:text-gray-300">
        {label}
      </span>
    </button>
  );
};

const OptionHeading = ({ children, hideInfo = false }) => (
  <div className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
    <span>{children}</span>
    {!hideInfo && <FiInfo className="h-4 w-4 text-[#93a1b3]" />}
  </div>
);

const SettingPanel = ({ title, children, showInfo = true }) => (
  <div className="bg-white p-4 border border-[#eef2f7] rounded-xl dark:bg-gray-900/40 dark:border-gray-700">
    <OptionHeading hideInfo={!showInfo}>{title}</OptionHeading>
    {children}
  </div>
);

const DeliveryCard = ({ title, description, checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${checked
      ? "border-emerald-500/20 bg-emerald-50/10 shadow-sm dark:bg-emerald-900/10"
      : "border-gray-100 hover:border-gray-200 dark:border-gray-700"
      }`}
  >
    <div
      className={`mt-1 flex h-5 w-5 items-center justify-center rounded border ${checked
        ? "border-emerald-600 bg-emerald-600"
        : "border-gray-300 dark:border-gray-600"
        }`}
    >
      {checked && (
        <svg
          className="h-3.5 w-3.5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>

    <div>
      <h4 className="font-bold text-gray-800 dark:text-white">{title}</h4>
      <p className="mt-1.5 text-[12px] font-medium leading-tight text-gray-400">
        {description}
      </p>
    </div>
  </button>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform rounded-[24px] bg-white p-8 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#ecf5ff] dark:bg-blue-900/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#409eff] text-white">
            <FiInfo className="h-10 w-10 stroke-[3]" />
          </div>
        </div>

        {/* Text content */}
        <h3 className="mb-3 text-[22px] font-bold text-gray-800 dark:text-white">
          {title}
        </h3>
        <p className="mb-10 text-[16px] leading-relaxed text-[#9ca3af]">
          {description}
        </p>

        {/* Buttons */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#4b5563] transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white transition-colors hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[14px] font-medium text-[#4b8bf5] dark:text-blue-400">
          Note : Don't forget to save the information before leaving this page
        </p>
      </div>
    </div>
  );
};

const OrderSettings = () => {
  const { t } = useTranslation();
  const { setIsUpdate } = useContext(SidebarContext);
  const { handleDisableForDemo } = useDisableForDemo();

  const [settings, setSettings] = useState(DEFAULT_ORDER_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_ORDER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAllStoreModalOpen, setIsAllStoreModalOpen] = useState(false);
  const [isSpecificCriteriaModalOpen, setIsSpecificCriteriaModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPrescriptionDisableModalOpen, setIsPrescriptionDisableModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isVerificationDisableModalOpen, setIsVerificationDisableModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [deletingReasonId, setDeletingReasonId] = useState(null);

  // Cancellation Messages State
  const [activeLangTab, setActiveLangTab] = useState("Default");
  const [cancellationReason, setCancellationReason] = useState("");
  const [userType, setUserType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUser, setFilterUser] = useState("All user");

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await SettingServices.getStoreSetting();
        if (!isMounted) return;

        const normalizedSettings = normalizeOrderSettings(response || {});
        setSettings(normalizedSettings);
        setInitialSettings(normalizedSettings);
      } catch (err) {
        if (!isMounted) return;
        setSettings(DEFAULT_ORDER_SETTINGS);
        setInitialSettings(DEFAULT_ORDER_SETTINGS);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSetting = async (key, value) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(updatedSettings);

    // Auto-save logic
    try {
      const payload = {
        name: "storeSetting",
        setting: {
          home_delivery_status: updatedSettings.homeDelivery,
          takeaway_status: updatedSettings.takeaway,
          scheduled_order_status: updatedSettings.scheduledOrder,
          scheduled_delivery_interval: Number(updatedSettings.timeInterval),
          scheduled_delivery_interval_unit: updatedSettings.timeIntervalUnit,
          admin_order_notification_status: updatedSettings.adminNotification,
          order_notification_type: updatedSettings.notificationType,
          free_delivery_status: updatedSettings.freeDeliverySetup,
          free_delivery_option: updatedSettings.freeDeliveryOption,
          free_delivery_over: Number(updatedSettings.freeDeliveryOver || 0),
          extra_packaging_charge_status: updatedSettings.extraPackagingCharge,
          extra_packaging_grocery_status: updatedSettings.extraPackagingGrocery,
          extra_packaging_food_status: updatedSettings.extraPackagingFood,
          extra_packaging_pharmacy_status: updatedSettings.extraPackagingPharmacy,
          extra_packaging_ecommerce_status: updatedSettings.extraPackagingEcommerce,
          prescription_order_status: updatedSettings.prescriptionOrder,
          order_delivery_verification_status: updatedSettings.deliveryVerification,
          order_confirmation_type: updatedSettings.confirmOrderBy,
          cancellation_reasons: updatedSettings.cancellationReasons || [],
        },
      };

      await SettingServices.updateStoreSetting(payload);
      setInitialSettings({ ...updatedSettings });
      setIsUpdate(true);
    } catch (err) {
      notifyError("Failed to auto-save change: " + err.message);
    }
  };

  const toggleSetting = (key) => {
    if (key === "freeDeliverySetup" && settings.freeDeliverySetup) {
      setIsConfirmModalOpen(true);
      return;
    }
    updateSetting(key, !settings[key]);
  };

  const confirmDisableFreeDelivery = () => {
    updateSetting("freeDeliverySetup", false);
    setIsConfirmModalOpen(false);
  };

  const confirmAllStoreFreeDelivery = () => {
    updateSetting("freeDeliveryOption", "all_store");
    setIsAllStoreModalOpen(false);
  };

  const confirmSpecificCriteria = () => {
    updateSetting("freeDeliveryOption", "specific_criteria");
    setIsSpecificCriteriaModalOpen(false);
  };

  const confirmPrescriptionEnable = () => {
    updateSetting("prescriptionOrder", true);
    setIsPrescriptionModalOpen(false);
  };

  const confirmPrescriptionDisable = () => {
    updateSetting("prescriptionOrder", false);
    setIsPrescriptionDisableModalOpen(false);
  };

  const confirmVerificationEnable = () => {
    updateSetting("deliveryVerification", true);
    setIsVerificationModalOpen(false);
  };

  const confirmVerificationDisable = () => {
    updateSetting("deliveryVerification", false);
    setIsVerificationDisableModalOpen(false);
  };

  const persistCancellationReasons = async (updatedReasons) => {
    try {
      const payload = {
        name: "storeSetting",
        setting: {
          home_delivery_status: settings.homeDelivery,
          takeaway_status: settings.takeaway,
          scheduled_order_status: settings.scheduledOrder,
          scheduled_delivery_interval: Number(settings.timeInterval),
          scheduled_delivery_interval_unit: settings.timeIntervalUnit,
          admin_order_notification_status: settings.adminNotification,
          order_notification_type: settings.notificationType,
          free_delivery_status: settings.freeDeliverySetup,
          free_delivery_option: settings.freeDeliveryOption,
          free_delivery_over: Number(settings.freeDeliveryOver || 0),
          extra_packaging_charge_status: settings.extraPackagingCharge,
          extra_packaging_grocery_status: settings.extraPackagingGrocery,
          extra_packaging_food_status: settings.extraPackagingFood,
          extra_packaging_pharmacy_status: settings.extraPackagingPharmacy,
          extra_packaging_ecommerce_status: settings.extraPackagingEcommerce,
          prescription_order_status: settings.prescriptionOrder,
          order_delivery_verification_status: settings.deliveryVerification,
          order_confirmation_type: settings.confirmOrderBy,
          cancellation_reasons: updatedReasons,
        },
      };
      await SettingServices.updateStoreSetting(payload);
    } catch (err) {
      console.error("Failed to persist cancellation reasons:", err);
    }
  };

  // Cancellation Handlers
  const handleAddReason = async (e) => {
    e.preventDefault();
    if (!cancellationReason || !userType) {
      notifyError("Please fill in all fields");
      return;
    }
    const newEntry = {
      id: Date.now(),
      reason: cancellationReason,
      userType: userType,
      status: true,
    };
    const updated = [newEntry, ...(settings.cancellationReasons || [])];
    updateSetting("cancellationReasons", updated);
    setCancellationReason("");
    setUserType("");
    
    await persistCancellationReasons(updated);
    notifySuccess("Cancellation reason added permanently!");
  };

  const handleToggleStatus = async (id) => {
    const updated = (settings.cancellationReasons || []).map((item) =>
      item.id === id ? { ...item, status: !item.status } : item
    );
    updateSetting("cancellationReasons", updated);
    await persistCancellationReasons(updated);
  };

  const handleEditClick = (item) => {
    setEditingReason(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateReason = async (updatedReason) => {
    const updated = (settings.cancellationReasons || []).map((item) =>
      item.id === updatedReason.id ? updatedReason : item
    );
    updateSetting("cancellationReasons", updated);
    setIsEditModalOpen(false);
    
    await persistCancellationReasons(updated);
    notifySuccess("Reason updated permanently!");
  };

  const handleDeleteClick = (id) => {
    setDeletingReasonId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteReason = async () => {
    const updated = (settings.cancellationReasons || []).filter((item) => item.id !== deletingReasonId);
    updateSetting("cancellationReasons", updated);
    setIsDeleteModalOpen(false);
    setDeletingReasonId(null);
    
    await persistCancellationReasons(updated);
    notifySuccess("Reason deleted permanently");
  };

  const filteredReasons = (settings.cancellationReasons || []).filter((item) => {
    const matchesSearch = item.reason
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterUser === "All user" || item.userType === filterUser;
    return matchesSearch && matchesFilter;
  });

  const selectedDeliveryMethodCount = [
    settings.homeDelivery,
    settings.takeaway,
    settings.scheduledOrder,
  ].filter(Boolean).length;

  const handleReset = () => {
    setSettings({ ...initialSettings });
  };

  const handleSave = async () => {
    if (handleDisableForDemo()) {
      return;
    }

    if (selectedDeliveryMethodCount === 0) {
      notifyError("At least one delivery method must remain enabled.");
      return;
    }

    if (
      settings.scheduledOrder &&
      (!settings.timeInterval || Number(settings.timeInterval) <= 0)
    ) {
      notifyError("Time interval for scheduled delivery must be greater than 0.");
      return;
    }

    if (
      settings.freeDeliverySetup &&
      settings.freeDeliveryOption === "specific_criteria" &&
      (!settings.freeDeliveryOver || Number(settings.freeDeliveryOver) <= 0)
    ) {
      notifyError("Please enter a valid free delivery amount.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: "storeSetting",
        setting: {
          home_delivery_status: settings.homeDelivery,
          takeaway_status: settings.takeaway,
          scheduled_order_status: settings.scheduledOrder,
          scheduled_delivery_interval: Number(settings.timeInterval),
          scheduled_delivery_interval_unit: settings.timeIntervalUnit,
          admin_order_notification_status: settings.adminNotification,
          order_notification_type: settings.notificationType,
          free_delivery_status: settings.freeDeliverySetup,
          free_delivery_option: settings.freeDeliveryOption,
          free_delivery_over: Number(settings.freeDeliveryOver || 0),
          extra_packaging_charge_status: settings.extraPackagingCharge,
          extra_packaging_grocery_status: settings.extraPackagingGrocery,
          extra_packaging_food_status: settings.extraPackagingFood,
          extra_packaging_pharmacy_status: settings.extraPackagingPharmacy,
          extra_packaging_ecommerce_status: settings.extraPackagingEcommerce,
          prescription_order_status: settings.prescriptionOrder,
          order_delivery_verification_status: settings.deliveryVerification,
          order_confirmation_type: settings.confirmOrderBy,
          cancellation_reasons: settings.cancellationReasons || [],
        },
      };

      const response = await SettingServices.updateStoreSetting(payload);
      setInitialSettings({ ...settings });
      setIsUpdate(true);
      notifySuccess(response?.message || "Order settings updated successfully!");
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageTitle>{t("OrderSettings")}</PageTitle>
      <AnimatedContent>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="p-8">
              {isLoading && (
                <p className="mb-6 text-sm font-medium text-gray-400">
                  Loading order settings...
                </p>
              )}

              <div className="mb-10">
                <div className="mb-6">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 dark:text-white">
                    Order Type
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Which way customer order their food
                  </p>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <DeliveryCard
                    title="Home Delivery"
                    description="If enabled customers can choose Home Delivery option from the customer app and website"
                    checked={settings.homeDelivery}
                    onClick={() => toggleSetting("homeDelivery")}
                  />
                  <DeliveryCard
                    title="Takeaway"
                    description="If enabled customers can use Takeaway feature during checkout from the Customer App/Website."
                    checked={settings.takeaway}
                    onClick={() => toggleSetting("takeaway")}
                  />
                  <DeliveryCard
                    title="Scheduled Order"
                    description="If Enabled, customer can choose to order place in their preferable time from Customer App/Website."
                    checked={settings.scheduledOrder}
                    onClick={() => toggleSetting("scheduledOrder")}
                  />
                </div>

                {settings.scheduledOrder && (
                  <div className="mb-6 animate-fadeIn">
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                      Time Interval For Scheduled Delivery
                      <FiInfo className="h-3.5 w-3.5 text-gray-300" />
                    </label>
                    <div className="flex w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                        <input
                          type="number"
                          min="1"
                          value={settings.timeInterval}
                          onChange={(e) =>
                            handleInputChange("timeInterval", e.target.value)
                          }
                          placeholder="30"
                        className="flex-1 px-4 py-3 text-sm focus:outline-none focus:ring-0 dark:bg-gray-900"
                      />
                      <div className="relative border-l border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        <select
                          value={settings.timeIntervalUnit}
                          onChange={(e) =>
                            updateSetting("timeIntervalUnit", e.target.value)
                          }
                          className="h-full appearance-none bg-transparent py-3 pl-4 pr-12 text-sm font-bold text-gray-600 outline-none dark:text-gray-400"
                        >
                          <option value="min">Min</option>
                          <option value="hour">Hour</option>
                        </select>
                        <FiChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-xl border border-[#ffe9a3] bg-[#fff9e6] p-3.5 dark:border-yellow-800/30 dark:bg-yellow-900/10">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[10px] font-bold text-white">
                    i
                  </div>
                  <span className="text-xs font-bold text-[#b08e31] dark:text-yellow-500">
                    At least one delivery method select for your business
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 dark:text-white">
                    Notification Setup
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Here you can manage the notification settings for this panel
                  </p>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                          Order Notification for Admin
                          <FiInfo className="h-3.5 w-3.5 text-gray-400" />
                        </h4>
                        <div className="inline-flex items-center rounded-lg border border-gray-100 bg-white px-4 py-2 pr-12 text-sm font-bold text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                          Status
                        </div>
                      </div>
                      <div className="mt-4 scale-75">
                        <SwitchToggle
                          processOption={settings.adminNotification}
                          handleProcess={(value) =>
                            updateSetting("adminNotification", value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-900/20">
                    <h4 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                      Order Notification Type
                      <FiInfo className="h-3.5 w-3.5 text-gray-400" />
                    </h4>
                    <div className="flex items-center gap-10 rounded-xl border border-gray-100 bg-white p-1 px-3 dark:border-gray-700 dark:bg-gray-900">
                      <label className="group flex cursor-pointer items-center gap-3 py-2">
                        <div
                          onClick={() =>
                            updateSetting("notificationType", "firebase")
                          }
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${settings.notificationType === "firebase"
                            ? "border-emerald-600"
                            : "border-gray-300 group-hover:border-gray-400"
                            }`}
                        >
                          {settings.notificationType === "firebase" && (
                            <div className="h-2 w-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold transition-colors ${settings.notificationType === "firebase"
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-400"
                            }`}
                        >
                          Firebase
                        </span>
                      </label>

                      <label className="group flex cursor-pointer items-center gap-3 py-2">
                        <div
                          onClick={() =>
                            updateSetting("notificationType", "manual")
                          }
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${settings.notificationType === "manual"
                            ? "border-emerald-600"
                            : "border-gray-300 group-hover:border-gray-400"
                            }`}
                        >
                          {settings.notificationType === "manual" && (
                            <div className="h-2 w-2 rounded-full bg-emerald-600" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold transition-colors ${settings.notificationType === "manual"
                            ? "text-gray-800 dark:text-white"
                            : "text-gray-400"
                            }`}
                        >
                          Manual
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-10 flex items-start gap-4 rounded-xl border border-[#ffe9a3] bg-[#fff9e6] p-5 dark:border-yellow-800/30 dark:bg-yellow-900/10">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-[10px] font-bold text-white">
                    i
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-[#b08e31] dark:text-yellow-500">
                      To receive order notifications properly, select the
                      notification type based on your preference :
                    </p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li className="text-[11px] font-bold text-[#b08e31]/80 dark:text-yellow-500/70">
                        Manual Notification: You need to send order
                        notifications manually for each order update.
                      </li>
                      <li className="text-[11px] font-bold text-[#b08e31]/80 dark:text-yellow-500/70">
                        Firebase Notification: Order notifications will be sent
                        automatically. Ensure{" "}
                        <span className="cursor-pointer underline decoration-1">
                          Firebase Configuration
                        </span>{" "}
                        is completed and notification messages are set up in the
                        Notification Message section.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Free Delivery Setup */}
                  <section className="bg-white border border-[#f1f5f9] rounded-[15px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#202938] dark:text-white mb-2">
                          Free Delivery Setup
                        </h3>
                        <p className="text-sm text-[#73849b]">
                          Enable this option to give customers a free delivery offer.
                        </p>
                      </div>
                      <SwitchToggle
                        processOption={settings.freeDeliverySetup}
                        handleProcess={() => toggleSetting("freeDeliverySetup")}
                      />
                    </div>

                    <div
                      className={`bg-[#f8fafc] p-6 rounded-2xl dark:bg-gray-900/40 ${settings.freeDeliverySetup ? "" : "opacity-60"
                        }`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <div className="mb-4 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
                            Choose Free Delivery Option
                          </div>
                          <div className="flex flex-col md:flex-row gap-6 bg-white border border-[#e6ebf5] rounded-xl px-5 py-4 dark:bg-gray-900 dark:border-gray-700">
                            <RadioChoice
                              label="Set free delivery for all store"
                              checked={settings.freeDeliveryOption === "all_store"}
                              disabled={!settings.freeDeliverySetup}
                              onClick={() => {
                                if (settings.freeDeliveryOption !== "all_store") {
                                  setIsAllStoreModalOpen(true);
                                }
                              }}
                            />
                            <RadioChoice
                              label="Set Specific Criteria"
                              checked={
                                settings.freeDeliveryOption ===
                                "specific_criteria"
                              }
                              disabled={!settings.freeDeliverySetup}
                              onClick={() => {
                                if (settings.freeDeliveryOption !== "specific_criteria") {
                                  setIsSpecificCriteriaModalOpen(true);
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          {settings.freeDeliveryOption === "all_store" ? (
                            <div className="bg-[#e6f7ff] border border-[#91d5ff] rounded-2xl p-6 h-full flex items-center gap-4 dark:bg-blue-900/10 dark:border-blue-800 animate-fadeIn">
                              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#1890ff] shadow-sm">
                                💡
                              </div>
                              <p className="text-[15px] leading-relaxed text-[#262626] dark:text-gray-200">
                                Free delivery is active for all stores. Cost bearer for the free delivery is <strong className="font-bold">Admin</strong>
                              </p>
                            </div>
                          ) : (
                            <>
                              <OptionHeading hideInfo={false}>Free Delivery Over (₹)</OptionHeading>
                              <input
                                type="number"
                                min="0"
                                value={settings.freeDeliveryOver}
                                placeholder="Ex: 10"
                                disabled={
                                  !settings.freeDeliverySetup ||
                                  settings.freeDeliveryOption !== "specific_criteria"
                                }
                                onChange={(e) =>
                                  handleInputChange("freeDeliveryOver", e.target.value)
                                }
                                className="w-full h-[58px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base font-medium text-[#2f3b4f] outline-none focus:border-[#0e7e87] transition-all disabled:bg-[#f3f6fb] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Extra Packaging Charge */}
                  <section className="bg-white border border-[#f1f5f9] rounded-[15px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#202938] dark:text-white mb-2">
                          Enable Extra Packaging Charge
                        </h3>
                        <p className="text-sm text-[#73849b]">
                          Adds an extra fee for orders that need additional
                          protection, such as fragile or bulky items.
                        </p>
                      </div>

                      <div className="flex items-center justify-between bg-white border border-[#e6ebf5] rounded-xl px-6 py-4 min-w-[240px] dark:bg-gray-900 dark:border-gray-700">
                        <span className="text-[16px] font-medium text-[#2f3b4f] dark:text-white">
                          Status
                        </span>
                        <SwitchToggle
                          processOption={settings.extraPackagingCharge}
                          handleProcess={() => toggleSetting("extraPackagingCharge")}
                        />
                      </div>
                    </div>

                    {settings.extraPackagingCharge && (
                      <div className="animate-fadeIn">
                        <div className="flex items-center gap-2 mb-4 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
                          Enable Extra Packaging Charge<span className="text-red-500">*</span> <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                        </div>
                        <div className="bg-white border border-[#eef2f7] rounded-[12px] p-6 dark:bg-gray-900 dark:border-gray-700">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <CheckboxChoice
                              label="Grocery"
                              checked={settings.extraPackagingGrocery}
                              onClick={() => updateSetting("extraPackagingGrocery", !settings.extraPackagingGrocery)}
                            />
                            <CheckboxChoice
                              label="Food"
                              checked={settings.extraPackagingFood}
                              onClick={() => updateSetting("extraPackagingFood", !settings.extraPackagingFood)}
                            />
                            <CheckboxChoice
                              label="Pharmacy"
                              checked={settings.extraPackagingPharmacy}
                              onClick={() => updateSetting("extraPackagingPharmacy", !settings.extraPackagingPharmacy)}
                            />
                            <CheckboxChoice
                              label="Ecommerce"
                              checked={settings.extraPackagingEcommerce}
                              onClick={() => updateSetting("extraPackagingEcommerce", !settings.extraPackagingEcommerce)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Other Setup */}
                  <section className="bg-white border border-[#f1f5f9] rounded-[15px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700 mt-8">
                    <div className="mb-8">
                      <h3 className="text-[18px] font-bold text-[#202938] dark:text-white mb-2">
                        Other Setup
                      </h3>
                      <p className="text-sm text-[#73849b]">
                        Setup your business time zone and format from here
                      </p>
                    </div>

                    <div className="bg-[#f8fafc] p-6 rounded-2xl dark:bg-gray-900/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* @deprecated — prescription orders removed for RASA (Phase 2A) */}
                        {false && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
                            Place Order by Prescription <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                          </div>
                          <div className="flex items-center justify-between bg-white border border-[#e6ebf5] rounded-xl px-5 py-4 dark:bg-gray-900 dark:border-gray-700">
                            <span className="text-[16px] font-medium text-[#2f3b4f] dark:text-white">Status</span>
                            <SwitchToggle
                              processOption={settings.prescriptionOrder}
                              handleProcess={() => {
                                if (!settings.prescriptionOrder) {
                                  setIsPrescriptionModalOpen(true);
                                } else {
                                  setIsPrescriptionDisableModalOpen(true);
                                }
                              }}
                            />
                          </div>
                        </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-3 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
                            Order delivery verification <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                          </div>
                          <div className="flex items-center justify-between bg-white border border-[#e6ebf5] rounded-xl px-5 py-4 dark:bg-gray-900 dark:border-gray-700">
                            <span className="text-[16px] font-medium text-[#2f3b4f] dark:text-white">Status</span>
                            <SwitchToggle
                              processOption={settings.deliveryVerification}
                              handleProcess={() => {
                                if (!settings.deliveryVerification) {
                                  setIsVerificationModalOpen(true);
                                } else {
                                  setIsVerificationDisableModalOpen(true);
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
                            Who Will Confirm Order <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                          </div>
                          <div className="flex items-center gap-6 bg-white border border-[#e6ebf5] rounded-xl px-5 py-4 dark:bg-gray-900 dark:border-gray-700 h-[66px]">
                            <RadioChoice
                              label="Store"
                              checked={settings.confirmOrderBy === "store"}
                              onClick={() => updateSetting("confirmOrderBy", "store")}
                            />
                            <RadioChoice
                              label="Deliveryman"
                              checked={settings.confirmOrderBy === "deliveryman"}
                              onClick={() => updateSetting("confirmOrderBy", "deliveryman")}
                            />
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


                      </div>
                    </div>
                  </section>

                  {/* Setup Order Cancellation Messages */}
                  <section className="bg-white border border-[#f1f5f9] rounded-[15px] p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700 mt-8">
                    <div className="mb-8">
                      <h3 className="text-[18px] font-bold text-[#202938] dark:text-white mb-2">
                        Setup Order Cancellation Messages
                      </h3>
                      <p className="text-sm text-[#73849b]">
                        Set up cancellation messages here to allow customers to select a reason when canceling an order
                      </p>
                    </div>

                    <div className="bg-[#f8fafc] p-6 rounded-2xl dark:bg-gray-900/40">
                      {/* Language Tabs */}
                      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
                        {["Default", "English(EN)"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveLangTab(tab)}
                            className={`pb-4 text-[15px] font-bold transition-all relative ${activeLangTab === tab
                              ? "text-[#0e7e87]"
                              : "text-gray-400 hover:text-gray-600"
                              }`}
                          >
                            {tab}
                            {activeLangTab === tab && (
                              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0e7e87]" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Form */}
                      <form onSubmit={handleAddReason} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
                        <div>
                          <label className="block text-[14px] font-bold text-[#42526b] dark:text-gray-100 mb-3">
                            Order Cancellation Reason ({activeLangTab})
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Item is Broken"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="w-full h-[54px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base outline-none focus:border-[#0e7e87] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-2 text-[14px] font-bold text-[#42526b] dark:text-gray-100">
                            User Type <FiInfo className="h-4 w-4 text-[#93a1b3]" />
                          </label>
                          <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="w-full h-[54px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base text-gray-500 outline-none focus:border-[#0e7e87] appearance-none dark:bg-gray-900 dark:border-gray-700"
                          >
                            <option value="">Select user type</option>
                            <option value="Customer">Customer</option>
                            <option value="Deliveryman">Deliveryman</option>
                            <option value="Store">Store</option>
                          </select>
                        </div>

                        <div className="lg:col-span-2 flex justify-end gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => { setCancellationReason(""); setUserType(""); }}
                            className="h-14 px-8 rounded-xl bg-[#e6ebf5] text-[16px] font-bold text-[#324054] hover:bg-gray-200 transition-all dark:bg-gray-700 dark:text-gray-200"
                          >
                            Reset
                          </button>
                          <button
                            type="submit"
                            className="h-14 px-10 rounded-xl bg-[#0e7e87] text-[16px] font-bold text-white hover:bg-[#0c6c74] transition-all shadow-lg"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* List Section */}
                    <div className="mt-12">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <h4 className="text-[17px] font-bold text-[#202938] dark:text-white">
                          Order cancellation reason list
                        </h4>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <select
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            className="h-[46px] min-w-[120px] bg-white border border-[#e6ebf5] rounded-xl px-4 text-sm text-gray-600 outline-none dark:bg-gray-900 dark:border-gray-700"
                          >
                            <option value="All user">All user</option>
                            <option value="Customer">Customer</option>
                            <option value="Deliveryman">Deliveryman</option>
                            <option value="Store">Store</option>
                          </select>

                          <div className="relative flex-1 md:flex-none md:w-[280px]">
                            <input
                              type="text"
                              placeholder="Search here"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full h-[46px] pl-5 pr-12 bg-white border border-[#e6ebf5] rounded-xl text-sm outline-none focus:border-[#0e7e87] dark:bg-gray-900 dark:border-gray-700"
                            />
                            <div className="absolute right-0 top-0 h-full w-[46px] flex items-center justify-center bg-[#93a1b3] text-white rounded-r-xl">
                              <FiSearch className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto rounded-xl border border-[#eef2f7] dark:border-gray-700">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#f8fafc] dark:bg-gray-900/60 border-b border-[#eef2f7] dark:border-gray-700">
                            <tr>
                              <th className="px-6 py-4 text-[13px] font-bold text-[#42526b] uppercase tracking-wider dark:text-gray-300">SL</th>
                              <th className="px-6 py-4 text-[13px] font-bold text-[#42526b] uppercase tracking-wider dark:text-gray-300">Reason</th>
                              <th className="px-6 py-4 text-[13px] font-bold text-[#42526b] uppercase tracking-wider dark:text-gray-300">User Type</th>
                              <th className="px-6 py-4 text-[13px] font-bold text-[#42526b] uppercase tracking-wider dark:text-gray-300 text-center">Status</th>
                              <th className="px-6 py-4 text-[13px] font-bold text-[#42526b] uppercase tracking-wider dark:text-gray-300 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eef2f7] dark:divide-gray-700">
                            {filteredReasons.map((item, index) => (
                              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-5 text-[15px] font-medium text-[#73849b] dark:text-gray-400">{index + 1}</td>
                                <td className="px-6 py-5 text-[15px] font-medium text-[#4b5563] dark:text-gray-200">{item.reason}</td>
                                <td className="px-6 py-5 text-[15px] font-medium text-[#6b7280] dark:text-gray-400">{item.userType}</td>
                                <td className="px-6 py-5">
                                  <div className="flex justify-center scale-90">
                                    <SwitchToggle
                                      processOption={item.status}
                                      handleProcess={() => handleToggleStatus(item.id)}
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center justify-center gap-3">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-2.5 rounded-lg border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                      <FiEdit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClick(item.id)}
                                      className="p-2.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  {/* <div className="flex flex-row justify-end items-center gap-4 border-t border-[#eef2f7] pt-8 mt-12 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="h-14 px-10 rounded-xl border border-[#dbe4ef] bg-[#f4f7fb] text-[16px] font-bold text-[#324054] transition-all hover:bg-[#e9eef5] flex items-center justify-center gap-3 disabled:opacity-60 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    >
                      <FiRefreshCw className="h-5 w-5" />
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="h-14 px-12 rounded-xl bg-[#0e7e87] text-[16px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74] flex items-center justify-center gap-3 disabled:opacity-70 whitespace-nowrap"
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
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContent>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `,
        }}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDisableFreeDelivery}
        title="Are you sure to disable Free Delivery?"
        description="After disable delivery charges will apply to all new orders based on your delivery settings."
      />

      <EditReasonModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        reasonData={editingReason}
        onUpdate={handleUpdateReason}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteReason}
      />

      <AllStoreConfirmModal
        isOpen={isAllStoreModalOpen}
        onClose={() => setIsAllStoreModalOpen(false)}
        onConfirm={confirmAllStoreFreeDelivery}
      />

      <SpecificCriteriaConfirmModal
        isOpen={isSpecificCriteriaModalOpen}
        onClose={() => setIsSpecificCriteriaModalOpen(false)}
        onConfirm={confirmSpecificCriteria}
      />

      <PrescriptionConfirmModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onConfirm={confirmPrescriptionEnable}
      />

      <PrescriptionDisableConfirmModal
        isOpen={isPrescriptionDisableModalOpen}
        onClose={() => setIsPrescriptionDisableModalOpen(false)}
        onConfirm={confirmPrescriptionDisable}
      />

      <VerificationConfirmModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onConfirm={confirmVerificationEnable}
      />

      <VerificationDisableConfirmModal
        isOpen={isVerificationDisableModalOpen}
        onClose={() => setIsVerificationDisableModalOpen(false)}
        onConfirm={confirmVerificationDisable}
      />
    </>
  );
};

const VerificationConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="w-20 h-28 border-[3px] border-[#4fd1c5] rounded-xl flex flex-col items-center justify-center bg-white relative">
              <div className="w-10 h-10 bg-[#4fd1c5] rounded flex items-center justify-center text-white mb-2">
                <div className="w-4 h-4 border-2 border-white rounded-t-full relative top-[-2px]">
                  <div className="absolute top-1 left-1.5 w-1 h-2 bg-white" />
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-[#fbbf24] font-bold">*</div>
                ))}
              </div>
              <div className="absolute right-[-10px] bottom-6 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Want to enable Delivery Verification
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          If you enable this the Deliveryman has to verify the order during delivery through a 4-digit verification code.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
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
      </div>
    </div>
  );
};

const VerificationDisableConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="w-20 h-28 border-[3px] border-[#4fd1c5] rounded-xl flex flex-col items-center justify-center bg-white relative">
              <div className="w-10 h-10 bg-[#4fd1c5] rounded flex items-center justify-center text-white mb-2">
                <div className="w-4 h-4 border-2 border-white rounded-t-full relative top-[-2px]">
                  <div className="absolute top-1 left-1.5 w-1 h-2 bg-white" />
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-[#fbbf24] font-bold">*</div>
                ))}
              </div>
              <div className="absolute right-[-10px] bottom-6 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm shadow-sm font-bold">
                -
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Want to disable Delivery Verification
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          If you disable this the Deliveryman will deliver the order and update the status. He doesn't need to verify the order with any code.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
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
      </div>
    </div>
  );
};

const PrescriptionDisableConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center relative shadow-inner">
              <div className="w-16 h-1 bg-gray-300 rounded mb-2 absolute top-6" />
              <div className="w-12 h-1 bg-gray-300 rounded mb-2 absolute top-10" />
              <div className="w-14 h-1 bg-gray-300 rounded mb-2 absolute top-14" />
              <div className="absolute top-2 right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 font-bold text-xs">+</span>
              </div>
              <div className="absolute -bottom-2 -left-2 w-10 h-6 bg-pink-200 rounded-full rotate-45" />
              {/* Minus Icon for Disable State */}
              <div className="absolute bottom-2 right-0 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm shadow-sm font-bold">
                -
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Want to disable Place Order by Prescription
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-400">
          If disabled this feature will be hidden from the Customer App Website and Store App & Panel.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
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
      </div>
    </div>
  );
};

const PrescriptionConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Custom Medical Icon implementation or using an image if provided, 
                since I can't use the exact image content easily, I'll use a styled FiPlus/FiFile */}
            <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center relative shadow-inner">
              <div className="w-16 h-1 bg-gray-300 rounded mb-2 absolute top-6" />
              <div className="w-12 h-1 bg-gray-300 rounded mb-2 absolute top-10" />
              <div className="w-14 h-1 bg-gray-300 rounded mb-2 absolute top-14" />
              <div className="absolute top-2 right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 font-bold text-xs">+</span>
              </div>
              <div className="absolute -bottom-2 -left-2 w-10 h-6 bg-pink-200 rounded-full rotate-45" />
              <div className="absolute bottom-2 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[26px] font-bold text-[#262626] dark:text-white leading-tight">
          Want to enable Place Order by Prescription
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-500">
          If you enable this customers can place an order by simply uploading their prescriptions in the Pharmacy module from the Customer App or Website. Stores can enable/disable this feature from store settings if needed.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
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
      </div>
    </div>
  );
};

const SpecificCriteriaConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#ffccc7]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff4d4f] text-white">
            <span className="text-4xl font-bold">!</span>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[28px] font-bold text-[#262626] dark:text-white leading-tight">
          Do You Want Active “Set Specific Criteria”?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-500">
          Are you sure to active “Set Specific Criteria”? If you active this delivery charge will not added to order when customer order more then your “Free Delivery Over” amount.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

const AllStoreConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#ffccc7]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff4d4f] text-white">
            <span className="text-4xl font-bold">!</span>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[28px] font-bold text-[#262626] dark:text-white leading-tight">
          Do You Want Active “Free Delivery for All Stores”?
        </h3>
        <p className="mb-10 text-[16px] font-medium leading-relaxed text-gray-500">
          Are you sure to active “Free delivery order for all Stores”? If you active this no delivery charge will added to order and the cost will be added to you.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#f0f2f5] py-4 text-[18px] font-bold text-[#595959] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[32px] bg-white p-10 text-center shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#ff4d4f] shadow-[0_8px_20px_-5px_rgba(255,77,79,0.5)]">
          <FiPower className="h-14 w-14 text-white stroke-[2.5]" />
        </div>

        {/* Text */}
        <h3 className="mb-4 text-[32px] font-bold text-[#42526b] dark:text-white">
          Are you sure ?
        </h3>
        <p className="mb-10 text-[18px] font-medium leading-relaxed text-gray-400">
          If you want to delete this reason please confirm your decision.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#e6ebf5] py-4 text-[20px] font-bold text-[#324054] transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0e7e87] py-4 text-[20px] font-bold text-white shadow-lg transition-all hover:bg-[#0c6c74]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

const EditReasonModal = ({ isOpen, onClose, reasonData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("Default");
  const [reason, setReason] = useState("");
  const [userType, setUserType] = useState("");

  useEffect(() => {
    if (reasonData) {
      setReason(reasonData.reason);
      setUserType(reasonData.userType);
    }
  }, [reasonData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-[15px] bg-white shadow-2xl transition-all dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
          <h3 className="text-[20px] font-bold text-[#202938] dark:text-white">
            Order cancellation reason Update
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="bg-[#f8fafc] p-6 rounded-2xl dark:bg-gray-900/40">
            {/* Language Tabs */}
            <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700 mb-8">
              {["Default", "English(EN)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === tab ? "text-[#0e7e87]" : "text-gray-400"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0e7e87]" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-bold text-[#42526b] dark:text-gray-200 mb-3">
                  Order Cancellation Reason ({activeTab})
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-[50px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base outline-none focus:border-[#0e7e87] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#42526b] dark:text-gray-200 mb-3">
                  User type
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full h-[50px] bg-white border border-[#e6ebf5] rounded-xl px-5 text-base outline-none focus:border-[#0e7e87] appearance-none dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="Customer">Customer</option>
                  <option value="Deliveryman">Deliveryman</option>
                  <option value="Store">Store</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 h-[50px] rounded-xl bg-[#a0abbb] text-[16px] font-bold text-white hover:bg-gray-500 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate({ ...reasonData, reason, userType })}
            className="flex-1 h-[50px] rounded-xl bg-[#0e7e87] text-[16px] font-bold text-white hover:bg-[#0c6c74] transition-all shadow-md"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSettings;

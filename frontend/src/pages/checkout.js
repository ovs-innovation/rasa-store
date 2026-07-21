import React, { useState, useRef, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
  IoWalletSharp,
  IoClose,
  IoChevronForward,
  IoLocationOutline
} from "react-icons/io5";
import { FiLoader, FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { ImCreditCard } from "react-icons/im";
import useTranslation from "next-translate/useTranslation";
import { useSession } from "next-auth/react";
import { readUserInfoFromCookie } from "@lib/auth";

//internal import

import Layout from "@layout/Layout";
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import CartItem from "@components/cart/CartItem";
import InputArea from "@components/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import InputShipping from "@components/form/InputShipping";
import InputPayment from "@components/form/InputPayment";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SettingServices from "@services/SettingServices";
import CustomerServices from "@services/CustomerServices";
import LocationServices from "@services/LocationServices";
import SwitchToggle from "@components/form/SwitchToggle";
import { notifySuccess, notifyError } from "@utils/toast";
import { isProfileComplete, getDisplayEmail } from "@utils/profileAuth";
import { UserContext } from "@context/UserContext";

const Checkout = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const formRef = useRef(null);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    phone: "",
    addressType: "Home",
    isDefault: false
  });
  const { state } = useContext(UserContext);
  const { data: sessionData } = useSession();
  const sessionUser = sessionData?.user?.token ? sessionData.user : null;
  const userInfo = state?.userInfo || sessionUser || readUserInfoFromCookie();
  const { showingTranslateValue, currency } = useUtilsFunction();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!userInfo?.token) {
      router.replace("/auth/login?redirectUrl=checkout");
    }
  }, [authReady, userInfo, router]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!showAddressModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAddressModal]);
  const { storeCustomizationSetting } = useGetSetting();

  const { data: storeSetting } = useQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => await SettingServices.getStoreSetting(),
    staleTime: 4 * 60 * 1000, // Api request after 4 minutes
  });

  // Fetch user's shipping addresses
  const { data: shippingAddressesResponse, refetch: refetchAddresses } = useQuery({
    queryKey: ["shippingAddresses", userInfo?._id],
    queryFn: async () => {
      if (!userInfo?._id) return null;
      const response = await CustomerServices.getShippingAddress({ userId: userInfo._id });
      return response?.shippingAddress || [];
    },
    enabled: !!userInfo?._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Normalize shippingAddresses to always be an array
  const shippingAddresses = Array.isArray(shippingAddressesResponse) 
    ? shippingAddressesResponse 
    : shippingAddressesResponse 
      ? [shippingAddressesResponse] 
      : [];

  // Set default selected address on load
  React.useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [shippingAddresses]);

  const {
    error,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    register,
    errors,
    watch,
    showCard,
    setShowCard,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    availableCoupons,
    selectedCouponCode,
    setSelectedCouponCode,
    handleDefaultShippingAddress,
    taxSummary,
    setValue,
    isCouponApplied,
    handleRemoveCoupon,
  } = useCheckoutSubmit(storeSetting);

  const selectedPaymentMethod = watch("paymentMethod");

  // Update form values when selected address changes
  React.useEffect(() => {
    if (selectedAddress && setValue) {
      const nameParts = (selectedAddress.name || "").split(" ");
      setValue("firstName", nameParts[0] || "");
      setValue("lastName", nameParts.slice(1).join(" ") || "");
      setValue("email", getDisplayEmail(userInfo) || "");
      setValue("contact", selectedAddress.phone || "");
      setValue("address", selectedAddress.address || "");
      setValue("address2", "");
      setValue("city", selectedAddress.city || "");
      setValue("state", selectedAddress.country || "");
      setValue("country", selectedAddress.country || "India");
      setValue("zipCode", selectedAddress.zipCode || "");
    }
  }, [selectedAddress, setValue, userInfo]);

  // Calculate totals for order summary
  const calculateTotals = () => {
    let totalMRP = 0;
    let totalDiscount = 0;
    
    items.forEach(item => {
      const originalPrice = item.originalPrice || item.mrp || item.prices?.original || (item.price * 1.2);
      const currentPrice = item.price || item.prices?.sale || 0;
      const quantity = item.quantity || 1;
      
      totalMRP += originalPrice * quantity;
      totalDiscount += (originalPrice - currentPrice) * quantity;
    });
    
    return {
      totalMRP,
      totalDiscount,
      subtotal: cartTotal,
      taxAmount: taxSummary?.exclusiveTax || 0,
      total: parseFloat(total)
    };
  };

  // Handle address form input changes
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Auto fetch location by pincode
  React.useEffect(() => {
    const fetchLocation = async () => {
      if (addressForm.zipCode && addressForm.zipCode.length === 6 && /^\d+$/.test(addressForm.zipCode)) {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${addressForm.zipCode}`);
          const data = await response.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setAddressForm(prev => ({
              ...prev,
              city: postOffice.District || postOffice.Block || postOffice.Name,
              country: postOffice.State
            }));
            notifySuccess(`Location fetched: ${postOffice.District || postOffice.Block || postOffice.Name}, ${postOffice.State}`);
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
        }
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchLocation();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [addressForm.zipCode]);

  // Handle Use Current Location
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      notifyError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geocodeData = await LocationServices.getReverseGeocode({ lat: latitude, lng: longitude });

          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const result = geocodeData.results[0];
            
            // Extract address components
            let street = "";
            let city = "";
            let state = "";
            let zip = "";

            // Street address parts
            const streetNumber = result.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
            const route = result.address_components.find(c => c.types.includes("route"))?.long_name || "";
            const sublocality = result.address_components.find(c => c.types.includes("sublocality"))?.long_name || "";
            
            street = [streetNumber, route, sublocality].filter(Boolean).join(", ");
            
            // If street is still empty, use formatted_address part
            if (!street) {
                street = result.formatted_address.split(",")[0];
            }

            city = result.address_components.find(c => c.types.includes("locality"))?.long_name || "";
            state = result.address_components.find(c => c.types.includes("administrative_area_level_1"))?.long_name || "";
            zip = result.address_components.find(c => c.types.includes("postal_code"))?.long_name || "";

            setAddressForm(prev => ({
              ...prev,
              address: street || prev.address,
              city: city || prev.city,
              country: state || prev.country,
              zipCode: zip || prev.zipCode
            }));

            notifySuccess("Location updated successfully!");
          } else {
            notifyError("Unable to fetch current location. Please try again.");
          }
        } catch (error) {
          console.error("Location error:", error);
          notifyError("Unable to fetch current location. Please try again.");
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        setIsLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          notifyError("Location permission denied. Please allow location access.");
        } else {
          notifyError("Unable to fetch current location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Open modal for adding new address
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: userInfo?.name || "",
      address: "",
      city: "",
      country: "",
      zipCode: "",
      phone: userInfo?.phone || "",
      addressType: "Home",
      isDefault: shippingAddresses.length === 0
    });
    setShowAddressModal(true);
  };

  // Open modal for editing address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || "",
      address: address.address || "",
      city: address.city || "",
      country: address.country || "",
      zipCode: address.zipCode || "",
      phone: address.phone || "",
      addressType: address.addressType || "Home",
      isDefault: address.isDefault || false
    });
    setShowAddressModal(true);
  };

  // Handle address submission (add or update)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!userInfo || !userInfo._id) {
        notifyError("User ID not found in session");
        return;
      }

      let response;
      if (editingAddress && editingAddress._id) {
        // Update existing address
        response = await CustomerServices.updateShippingAddress({
          userId: userInfo._id,
          shippingId: editingAddress._id,
          shippingAddressData: addressForm
        });
      } else {
        // Add new address
        response = await CustomerServices.addShippingAddress({
          userId: userInfo._id,
          shippingAddressData: addressForm
        });
      }

      if (response.success || response.message) {
        setShowAddressModal(false);
        setEditingAddress(null);
        // Reset form
        setAddressForm({
          name: "",
          address: "",
          city: "",
          country: "",
          zipCode: "",
          phone: "",
          addressType: "Home",
          isDefault: false
        });
        // Refetch addresses to get the latest
        await refetchAddresses();
        // If this was set as default or is first address, select it
        if (addressForm.isDefault || shippingAddresses.length === 0) {
          const updatedResponse = await CustomerServices.getShippingAddress({ userId: userInfo._id });
          const updatedAddresses = Array.isArray(updatedResponse?.shippingAddress) 
            ? updatedResponse.shippingAddress 
            : [];
          const newDefault = updatedAddresses.find(addr => addr.isDefault) || updatedAddresses[updatedAddresses.length - 1];
          if (newDefault) setSelectedAddress(newDefault);
        }
        notifySuccess(editingAddress ? "Address updated successfully" : "Address added successfully");
      } else {
        notifyError(response.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      notifyError(error?.response?.data?.message || error?.message || "Failed to save address");
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
     

    try {
      const response = await CustomerServices.deleteShippingAddress({
        userId: userInfo._id,
        shippingId: addressId
      });

      if (response.message || response.success) {
        await refetchAddresses();
        // If deleted address was selected, select first available
        if (selectedAddress?._id === addressId) {
          const updatedResponse = await CustomerServices.getShippingAddress({ userId: userInfo._id });
          const updatedAddresses = Array.isArray(updatedResponse?.shippingAddress) 
            ? updatedResponse.shippingAddress 
            : [];
          if (updatedAddresses.length > 0) {
            setSelectedAddress(updatedAddresses[0]);
          } else {
            setSelectedAddress(null);
          }
        }
        notifySuccess("Address deleted successfully");
      } else {
        notifyError(response.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      notifyError(error?.response?.data?.message || error?.message || "Failed to delete address");
    }
  };

  const totals = calculateTotals();

  return (
    <>
      <Layout title="Checkout" description="this is checkout page">
        <style jsx global>{`
          /* Checkout page dark theme overrides */
          body {
            background-color: #050505 !important;
            color: #ffffff !important;
          }

          /* Form sections wrapper */
          .form-group h2 {
            color: #ffffff !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
          }
          
          .bg-gray-50.border-gray-200 {
            background-color: #0a0a0a !important;
            border-color: #141414 !important;
          }
          
          /* Select Delivery Address card */
          div[class*="border-gray-200"] {
            background-color: #0f0f0f !important;
            border-color: #1a1a1a !important;
          }
          div[class*="border-gray-200"]:hover {
            border-color: #d4af3730 !important;
          }
          
          /* Deliver To badge */
          .bg-blue-50.text-gray-700 {
            background-color: #d4af3715 !important;
            color: #d4af37 !important;
            border: 1px solid #d4af3730 !important;
          }
          
          /* Text overrides */
          h3.text-gray-900,
          p.text-gray-900,
          span.text-gray-900,
          span.text-gray-800,
          p.text-base.font-bold {
            color: #ffffff !important;
          }
          p.text-gray-500,
          span.text-gray-500,
          span.text-gray-600 {
            color: #a3a3a3 !important;
          }
          
          /* Selected address highlights */
          .ring-2.ring-store-300 {
            border-color: #d4af37 !important;
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2) !important;
          }
          
          /* Input & Form field area styling */
          input, select, textarea {
            background-color: #050505 !important;
            border-color: #1a1a1a !important;
            color: #ffffff !important;
          }
          input:focus, select:focus, textarea:focus {
            border-color: #d4af37 !important;
            outline: none !important;
          }
          
          /* Add Address button & Action buttons */
          button.bg-store-500 {
            background-color: #d4af37 !important;
            color: #000000 !important;
            font-weight: 700 !important;
          }
          button.bg-store-500:hover {
            background-color: #c29e2e !important;
          }

          /* Checkout readability — brighter text on dark panels */
          .checkout-page h2,
          .checkout-page .form-group h2 {
            color: #ffffff !important;
          }

          .checkout-page .text-gray-700 {
            color: #f5f5f5 !important;
          }

          .checkout-page .text-gray-500,
          .checkout-page .text-gray-600 {
            color: #d1d5db !important;
          }

          .checkout-page .text-gray-300 {
            color: #e5e7eb !important;
          }

          .checkout-page .text-gray-800,
          .checkout-page .text-gray-900 {
            color: #ffffff !important;
          }

          .checkout-page .border-t.mt-4 .font-extrabold {
            color: #d4af37 !important;
            font-size: 1.35rem !important;
          }

          .checkout-page .border-t.mt-4 .text-gray-900 {
            color: #f3f4f6 !important;
          }

          .checkout-page .bg-\\[\\#0D0D0D\\],
          .checkout-page .bg-\\[\\#0F0F0F\\] {
            border-color: #2a2a2a !important;
          }

          .checkout-page button.checkout-place-order-btn:disabled {
            color: #bdbdbd !important;
            background-color: #1a1a1a !important;
            border-color: #404040 !important;
          }

          .checkout-page .text-green-600 {
            color: #4ade80 !important;
          }

          @media (max-width: 639px) {
            .checkout-page {
              overflow-x: hidden;
            }

            .checkout-page .checkout-summary-line {
              font-size: 0.875rem;
              gap: 0.75rem;
            }

            .checkout-page .checkout-total-block {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 0.5rem;
            }

            .checkout-page .checkout-total-block .checkout-total-amount {
              font-size: 1.5rem !important;
              width: 100%;
              text-align: left;
            }

            .checkout-page .checkout-address-actions {
              flex-direction: row;
              align-self: stretch !important;
              justify-content: flex-end;
            }

            .checkout-page .checkout-coupon-actions {
              width: 100%;
            }

            .checkout-page .checkout-coupon-actions button {
              width: 100% !important;
              margin-left: 0 !important;
              margin-top: 0.5rem !important;
            }
          }
        `}</style>
        <div className="checkout-page mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-10 overflow-x-hidden pb-8 sm:pb-10">
          <div className="py-4 sm:py-10 lg:py-12 w-full flex flex-col lg:flex-row lg:gap-10 xl:gap-14 gap-6">
            <div className="w-full lg:w-3/5 flex flex-col min-w-0">
              <div className="mt-2 lg:mt-0">
                <form ref={formRef} onSubmit={handleSubmit(submitHandler)}>
                  {hasShippingAddress && (
                    <div className="flex justify-end my-2">
                      <SwitchToggle
                        id="shipping-address"
                        title="Use Default Shipping Address"
                        processOption={useExistingAddress}
                        handleProcess={handleDefaultShippingAddress}
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <h2 className="font-semibold font-serif text-base text-white pb-3">
                      {showingTranslateValue(
                        storeCustomizationSetting?.checkout?.personal_details
                      )}
                    </h2>
                    <div className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl p-3 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
                        <h3 className="text-sm font-medium text-white">Select Delivery Address</h3>
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-[#D4AF37]/40 text-xs font-semibold rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all focus:outline-none w-full sm:w-auto shrink-0"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Address
                        </button>
                      </div>

                      {shippingAddresses && shippingAddresses.length > 0 ? (
                        <div className="space-y-3 max-h-[50vh] sm:max-h-[300px] overflow-y-auto scrollbar-hide pr-0.5">
                          {shippingAddresses.map((address) => {
                            const locationText = `${address.city || ''}${address.city && address.zipCode ? ', ' : ''}${address.zipCode || ''}`;
                            const locationDisplay = locationText.length > 25 ? locationText.substring(0, 25) + '..' : locationText;
                            const fullAddress = `${address.address || ''}, ${address.city || ''}${address.city && address.country ? ', ' : ''}${address.country || ''}.`;
                            
                            const isSelected = selectedAddress?._id === address._id || selectedAddress?.id === address.id;
                            
                            return (
                              <div
                                key={address._id || address.id || Math.random()}
                                onClick={() => {
                                  setSelectedAddress(address);
                                  // Update form values immediately when address is selected
                                  const nameParts = (address.name || "").split(" ");
                                  setValue("firstName", nameParts[0] || "");
                                  setValue("lastName", nameParts.slice(1).join(" ") || "");
                                  setValue("email", getDisplayEmail(userInfo) || "");
                                  setValue("contact", address.phone || "");
                                  setValue("address", address.address || "");
                                  setValue("address2", "");
                                  setValue("city", address.city || "");
                                  setValue("state", address.country || "");
                                  setValue("country", address.country || "India");
                                  setValue("zipCode", address.zipCode || "");
                                }}
                                className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-[#D4AF37] bg-[#121212] ring-2 ring-[#D4AF37]/10'
                                    : 'border-neutral-800 bg-[#0F0F0F] hover:border-neutral-700 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Radio Button */}
                                    <div className="flex-shrink-0 mt-1">
                                      <input
                                        type="radio"
                                        name="selectedAddress"
                                        checked={isSelected}
                                        onChange={() => {
                                          setSelectedAddress(address);
                                          const nameParts = (address.name || "").split(" ");
                                          setValue("firstName", nameParts[0] || "");
                                          setValue("lastName", nameParts.slice(1).join(" ") || "");
                                          setValue("email", getDisplayEmail(userInfo) || "");
                                          setValue("contact", address.phone || "");
                                          setValue("address", address.address || "");
                                          setValue("address2", "");
                                          setValue("city", address.city || "");
                                          setValue("state", address.country || "");
                                          setValue("country", address.country || "India");
                                          setValue("zipCode", address.zipCode || "");
                                        }}
                                        className="h-5 w-5 text-store-600 focus:ring-store-500 border-gray-300 cursor-pointer"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      {isSelected && (
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded-full">
                                            DELIVER TO
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-base font-bold text-gray-900">
                                          {address.addressType || 'Home'} ({locationDisplay})
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-500 leading-relaxed">
                                        {fullAddress}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 sm:ml-4 shrink-0 checkout-address-actions self-end sm:self-start">
                                    <div className="flex flex-col items-end gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditAddress(address);
                                        }}
                                        className="text-gray-400 hover:text-store-600 p-1 transition-colors"
                                        title="Edit address"
                                      >
                                        <FiEdit className="w-4 h-4" />
                                      </button>
                                      {shippingAddresses.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAddress(address._id || address.id);
                                          }}
                                          className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                                          title="Delete address"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">No delivery address found</p>
                          <p className="text-xs text-gray-500 mt-1">Add your delivery address to continue</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cart Items Section */}
                  <div className="form-group mt-6 sm:mt-12 max-h-none sm:max-h-[500px] overflow-visible sm:overflow-y-auto scrollbar-hide">
                    <h2 className="font-semibold font-serif text-base text-white pb-3">
                      
                      Order Items
                    </h2>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} currency={currency} variant="checkout" />
                      ))}

                      {isEmpty && (
                        <div className="text-center py-10 border border-gray-200 rounded-lg">
                          <span className="flex justify-center my-auto text-gray-500 font-semibold text-4xl">
                            <IoBagHandle />
                          </span>
                          <h2 className="font-medium font-serif text-sm pt-2 text-gray-600">
                            No Item Added Yet!
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <div className="grid grid-cols-6 gap-4 lg:gap-6 mt-10">
                    <div className="col-span-6 sm:col-span-3">
                      <Link
                        href="/"
                        className="bg-indigo-50 border border-indigo-100 rounded py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-800 hover:border-gray-300 transition-all flex justify-center font-serif w-full"
                      >
                        <span className="text-xl mr-2">
                          <IoReturnUpBackOutline />
                        </span>
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.continue_button
                        )}
                      </Link>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <button
                        type="submit"
                        disabled={isEmpty || isCheckoutSubmit}
                        className={`bg-store-500 hover:bg-store-600 border border-store-500 transition-all rounded py-3 text-center text-sm font-serif font-medium text-white flex justify-center w-full`}
                      >
                        {isCheckoutSubmit ? (
                          <span className="flex justify-center text-center">
                            {" "}
                            <img
                              src="/loader/spinner.gif"
                              alt="Loading"
                              width={20}
                              height={10}
                            />{" "}
                            <span className="ml-2">
                              {t("processing")}
                            </span>
                          </span>
                        ) : (
                          <span className="flex justify-center text-center">
                            {showingTranslateValue(
                              storeCustomizationSetting?.checkout
                                ?.confirm_button
                            )}
                            <span className="text-xl ml-2">
                              {" "}
                              <IoArrowForward />
                            </span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div> */}
                </form>
              </div>
            </div>

            <div className="w-full lg:w-2/5 flex flex-col self-start lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto min-w-0">
              <div className="border border-neutral-800 p-3 sm:p-5 lg:px-8 lg:py-8 rounded-2xl bg-[#0D0D0D]">
                <h2 className="font-semibold font-serif text-lg pb-4 text-white">
                  {showingTranslateValue(
                    storeCustomizationSetting?.checkout?.order_summary
                  )}
                </h2>

                {/* Coupon Section */}
                <div className="flex items-center mt-3 sm:mt-4 py-3 sm:py-4 text-sm w-full font-semibold text-gray-500 last:border-b-0 last:text-base last:pb-0">
                    <form className="w-full">
                      {couponInfo.couponCode ? (
                        <div className="relative bg-[#d4af37]/5 border-2 border-dashed border-[#d4af37]/30 rounded-lg p-3 sm:p-5 w-full overflow-hidden shadow-sm">
                          {/* Cutouts for coupon effect */}
                          <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-[#0D0D0D] rounded-full border-r-2 border-dashed border-[#d4af37]/30 z-10"></div>
                          <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-[#0D0D0D] rounded-full border-l-2 border-dashed border-[#d4af37]/30 z-10"></div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37] flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                                Coupon Applied
                              </span>
                              <span className="text-xl sm:text-2xl font-black text-[#d4af37] tracking-widest uppercase font-serif">
                                {couponInfo.couponCode}
                              </span>
                            </div>
                            <div className="bg-[#d4af37] text-black p-1.5 rounded-full shadow-sm mt-1">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          
                          <div className="border-t-2 border-dashed border-[#d4af37]/20 my-4 relative"></div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="text-sm text-gray-300 font-medium">
                              You save <span className="font-bold text-lg text-[#d4af37]">{currency}{discountAmount.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                              >
                                Remove
                              </button>
                              <span className="text-[#d4af37]/30">|</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCoupon()}
                                className="text-xs font-bold text-[#d4af37] hover:text-[#bfa032] transition-colors uppercase tracking-wider"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 italic mb-2">
                            * Applying a new coupon will replace the existing coupon.
                          </p>
                          {availableCoupons && availableCoupons.length > 0 ? (
                            <>
                              <select
                                value={selectedCouponCode}
                                onChange={(e) => setSelectedCouponCode(e.target.value)}
                                className="form-select py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-gray-200 focus:ring-0 focus:outline-none focus:border-store-500"
                              >
                                <option value="">
                                  {t("Select a coupon")}
                                </option>
                                {availableCoupons.map((coupon) => (
                                  <option key={coupon._id} value={coupon.couponCode}>
                                    {coupon.couponCode} — Min ₹
                                    {Number(coupon.minimumAmount || 0).toFixed(2)}
                                  </option>
                                ))}
                              </select>

                              <div className="flex flex-col gap-2 w-full checkout-coupon-actions">
                                {isCouponAvailable ? (
                                  <button
                                    disabled
                                    type="button"
                                    className={`md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 bg-gray-100 h-12 text-sm lg:text-base w-full sm:w-auto`}
                                  >
                                    <img
                                      src="/loader/spinner.gif"
                                      alt="Loading"
                                      width={20}
                                      height={10}
                                    />
                                    <span className=" ml-2 font-light">Processing</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled={isCouponAvailable || !selectedCouponCode}
                                    onClick={handleCouponCode}
                                    className={`md:text-sm leading-4 inline-flex items-center cursor-pointer bg-store-600 transition ease-in-out duration-300 font-semibold text-center justify-center border border-gray-200 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-white hover:bg-store-500 h-12 text-sm text-white lg:text-base w-full sm:w-auto ${
                                      !selectedCouponCode ? "opacity-60 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {showingTranslateValue(
                                      storeCustomizationSetting?.checkout?.apply_button
                                    ) || "Apply"}
                                  </button>
                                )}
                              </div>

                              {discountAmount > 0 && (
                                <p className="text-xs text-green-600 font-semibold">
                                  You save {currency}
                                  {discountAmount.toFixed(2)} with this coupon.
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-gray-500">
                              No coupons available for this order amount.
                            </p>
                          )}
                        </div>
                      )}
                    </form>
                  </div>
                
                {/* Total MRP */}
                <div className="flex items-center justify-between gap-3 py-2.5 text-sm w-full font-semibold text-gray-500 checkout-summary-line">
                    Total MRP
                    <span className="flex-shrink-0 text-gray-800 font-bold text-right">
                      {currency}
                      {totals.totalMRP.toFixed(2)}
                    </span>
                  </div>
                
                {/* Total Discount */}
                {totals.totalDiscount > 0 && (
                  <div className="flex items-center justify-between gap-3 py-2.5 text-sm w-full font-semibold text-green-600 checkout-summary-line">
                    Total Discount
                    <span className="flex-shrink-0 font-bold text-green-600 text-right">
                      -{currency}
                      {totals.totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                 
                 
                {/* Tax Display */}
                {taxSummary?.inclusiveTax > 0 && (
                  <div className="flex items-center justify-between gap-3 py-2.5 text-xs sm:text-sm w-full font-semibold text-gray-500 checkout-summary-line">
                    GST (included in price)
                    <span className="flex-shrink-0 text-gray-800 font-bold text-right">
                      {currency}
                      {Number(taxSummary.inclusiveTax).toFixed(2)}
                    </span>
                  </div>
                )}
                {taxSummary?.exclusiveTax > 0 && (
                  <div className="flex items-center justify-between gap-3 py-2.5 text-xs sm:text-sm w-full font-semibold text-gray-500 checkout-summary-line">
                    GST (added at checkout)
                    <span className="flex-shrink-0 text-gray-800 font-bold text-right">
                      {currency}
                      {Number(taxSummary.exclusiveTax).toFixed(2)}
                    </span>
                  </div>
                )}
                
                {/* Coupon Offer / Additional Discount */}
                {discountAmount > 0 && (
                  <div
                    className={`flex items-center justify-between gap-3 py-2.5 text-sm w-full font-semibold checkout-summary-line ${
                      isCouponApplied ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {isCouponApplied
                      ? "Coupon Offer"
                      : showingTranslateValue(
                          storeCustomizationSetting?.checkout?.discount
                        )}
                    <span
                      className={`flex-shrink-0 font-bold text-right ${
                        isCouponApplied ? "text-green-600" : "text-orange-400"
                      }`}
                    >
                      {currency}
                      {discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {/* Shipping Cost */}
                {shippingCost > 0 ? (
                  <div className="flex items-center justify-between gap-3 py-2.5 text-sm w-full font-semibold text-gray-500 checkout-summary-line">
                    Shipping Cost
                    <span className="flex-shrink-0 text-gray-800 font-bold text-right">
                      {currency}
                      {shippingCost.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 py-2.5 text-sm w-full font-semibold text-green-600 checkout-summary-line">
                    Shipping Cost
                    <span className="flex-shrink-0 font-bold text-green-600 text-right">
                      FREE
                    </span>
                  </div>
                )}
                <div className="border-t border-neutral-800 mt-3 sm:mt-4">
                  <div className="flex items-center font-bold font-serif justify-between gap-3 pt-4 sm:pt-5 text-sm uppercase checkout-total-block">
                    <div className="flex flex-col min-w-0">
                      <span>
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.total_cost
                        )}
                      </span>
                      <span className="text-medium font-bold text-gray-900 capitalize normal-case text-base">
                        Estimated Payable
                      </span>
                    </div>
                    <span className="font-serif font-extrabold text-xl sm:text-2xl text-[#D4AF37] checkout-total-amount shrink-0">
                      {currency}
                      {parseFloat(total).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method and Place Order Section */}
                <div className="mt-5 sm:mt-6 bg-[#0F0F0F] border border-neutral-800 rounded-xl p-3 sm:p-4">
                  {/* Payment Method Selection */}
                  <div className="mb-4">
                    {/* Hidden input to register with react-hook-form */}
                    <input
                      type="hidden"
                      {...register("paymentMethod", {
                        required: "Payment Method is required!",
                      })}
                    />
                    
                    <div className="relative">
                      {/* Main Select Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                        className="w-full flex items-center justify-between gap-3 bg-[#050505] rounded-xl p-3 border border-neutral-800 hover:border-neutral-700 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-[#0D0D0D] rounded-lg flex items-center justify-center shrink-0 border border-neutral-800">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div className="flex-grow">
                            <p className="text-[10px] text-neutral-300 uppercase tracking-wider font-semibold">Pay using</p>
                            <p className="text-sm font-semibold text-[#D4AF37]">
                              {selectedPaymentMethod === 'Cash' 
                                ? 'Cash on Delivery' 
                                : selectedPaymentMethod === 'RazorPay' 
                                  ? 'UPI / RazorPay' 
                                  : 'Select Payment Method'}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400 shrink-0">
                          <svg className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 ${isPaymentDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Dropdown Options Menu */}
                      {isPaymentDropdownOpen && (
                        <div className="absolute z-[100] left-0 right-0 mt-2 bg-[#0D0D0D] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                          {storeSetting?.cod_status && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue("paymentMethod", "Cash", { shouldValidate: true });
                                setIsPaymentDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm font-semibold flex items-center justify-between transition-colors ${
                                selectedPaymentMethod === 'Cash'
                                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                  : 'text-white hover:bg-neutral-900'
                              }`}
                            >
                              <span>Cash on Delivery</span>
                              {selectedPaymentMethod === 'Cash' && (
                                <span className="text-[#D4AF37] font-bold">✓</span>
                              )}
                            </button>
                          )}
                          {storeSetting?.razorpay_status && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue("paymentMethod", "RazorPay", { shouldValidate: true });
                                setIsPaymentDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm font-semibold flex items-center justify-between transition-colors ${
                                selectedPaymentMethod === 'RazorPay'
                                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                  : 'text-white hover:bg-neutral-900'
                              }`}
                            >
                              <span>UPI / RazorPay</span>
                              {selectedPaymentMethod === 'RazorPay' && (
                                <span className="text-[#D4AF37] font-bold">✓</span>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <Error errorMessage={errors.paymentMethod} />
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!agreeToTerms) {
                        notifyError("Please agree to Terms & Conditions to place order");
                        return;
                      }
                      if (formRef.current) {
                        formRef.current.requestSubmit();
                      }
                    }}
                    disabled={isEmpty || isCheckoutSubmit || !agreeToTerms}
                    className={`checkout-place-order-btn w-full py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-200 ${
                      isEmpty || isCheckoutSubmit || !agreeToTerms
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                        : 'bg-[#D4AF37] text-black hover:bg-[#bfa032] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isCheckoutSubmit ? (
                      <span className="flex items-center justify-center">
                        <img
                          src="/loader/spinner.gif"
                          alt="Loading"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                        Processing...
                      </span>
                    ) : (
                      <span>
                        {showingTranslateValue(
                          storeCustomizationSetting?.checkout?.place_order
                        ) || "Place order"}
                      </span>
                    )}
                  </button>

                  {/* Terms and Conditions */}
                  <div className="mt-4 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-store-600 focus:ring-store-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="agreeToTerms" className="text-xs sm:text-sm text-gray-300 font-medium cursor-pointer leading-relaxed">
                      By placing the order, you agree to our{" "}
                      <Link href="/terms-and-conditions" className="text-[#D4AF37] hover:text-[#bfa032] hover:underline font-bold">
                        Terms & Conditions
                      </Link>
                      ,{" "}
                      <Link href="/privacy-policy" className="text-[#D4AF37] hover:text-[#bfa032] hover:underline font-bold">
                        Privacy Policy
                      </Link>
                      ,{" "}
                      <Link href="/return-refund-policy" className="text-[#D4AF37] hover:text-[#bfa032] hover:underline font-bold">
                        Return & Exchange Policy
                      </Link>
                      , and{" "}
                      <Link href="/shipping-delivery-policy" className="text-[#D4AF37] hover:text-[#bfa032] hover:underline font-bold">
                        Shipping Policy
                      </Link>
                      .
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Address Modal — portal + high z-index so it sits above header/categories */}
      {portalReady && showAddressModal && createPortal(
        <div className="fixed inset-0 z-[10050]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowAddressModal(false)}
          />
          
          {/* Modal Panel - full screen on mobile, below header on desktop */}
          <div className="absolute right-0 w-full sm:max-w-md lg:max-w-lg flex flex-col top-16 h-[calc(100dvh-4rem)] lg:top-[148px] lg:h-[calc(100dvh-148px)]">
            <div className="flex flex-col flex-1 min-h-0 bg-[#0D0D0D] border-l border-neutral-900 shadow-xl text-white">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-[#0A0A0A]">
                <h3 className="text-base sm:text-lg font-semibold text-white pr-2">
                  {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setAddressForm({
                      name: "",
                      address: "",
                      city: "",
                      country: "",
                      zipCode: "",
                      phone: "",
                      addressType: "Home",
                      isDefault: false
                    });
                  }}
                >
                  <IoClose className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={handleAddressSubmit}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
                <div className="space-y-4">
                  {/* Use Current Location Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocationLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg font-semibold text-sm hover:bg-[#D4AF37]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLocationLoading ? (
                        <FiLoader className="animate-spin" size={18} />
                      ) : (
                        <IoLocationOutline size={18} />
                      )}
                      {isLocationLoading ? "Fetching Location..." : "Use Current Location"}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={addressForm.name}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Street Address
                    </label>
                    <textarea
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={addressForm.zipCode}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Address Type
                      </label>
                      <select
                        name="addressType"
                        value={addressForm.addressType}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-0 sm:pt-7">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                        className="h-4 w-4 text-store-600 focus:ring-store-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-300">
                        Set as default address
                      </label>
                    </div>
                  </div>
                </div>
                </div>

                {/* Footer Buttons - always visible */}
                <div className="flex-shrink-0 border-t border-neutral-800 px-4 sm:px-6 py-3 sm:py-4 bg-[#0A0A0A] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                 <div className="flex flex-col-reverse gap-2 sm:flex-row sm:space-x-3 sm:gap-0">
                   <button
                     type="button"
                     className="flex-1 px-4 py-2.5 border border-neutral-800 rounded-full text-sm font-medium text-gray-300 bg-transparent hover:bg-neutral-900 focus:outline-none"
                     onClick={() => setShowAddressModal(false)}
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="flex-1 px-4 py-2.5 border border-transparent rounded-full text-sm font-bold text-black bg-[#D4AF37] hover:bg-[#bfa032] focus:outline-none"
                   >
                     {editingAddress ? "Update Address" : "Save Address"}
                   </button>
                 </div>
                 </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });

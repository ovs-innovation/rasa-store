import Cookies from "js-cookie";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "react-use-cart";
import useRazorpay from "react-razorpay";
import { useQuery } from "@tanstack/react-query";

//internal import
import { getUserSession } from "@lib/auth";
import { UserContext } from "@context/UserContext";
import { SidebarContext } from "@context/SidebarContext";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "./useUtilsFunction";
import CouponServices from "@services/CouponServices";
import { notifyError, notifySuccess } from "@utils/toast";
import CustomerServices from "@services/CustomerServices";
import { isProfileComplete, getDisplayEmail } from "@utils/profileAuth";
import NotificationServices from "@services/NotificationServices";
import ShiprocketServices from "@services/ShiprocketServices";
import useCartDB from "@hooks/useCartDB";

const useCheckoutSubmit = (storeSetting) => {
  const { dispatch } = useContext(UserContext);
  const { toggleCartDrawer } = useContext(SidebarContext);

  const [error, setError] = useState("");
  const [total, setTotal] = useState("");
  const [couponInfo, setCouponInfo] = useState({});
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [taxSummary, setTaxSummary] = useState({
    inclusiveTax: 0,
    exclusiveTax: 0,
    totalTax: 0,
  });
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [isCouponAvailable, setIsCouponAvailable] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState("");

  const router = useRouter();
  const couponRef = useRef("");
  const isRemovingCouponRef = useRef(false);
  const [Razorpay] = useRazorpay();
  const { isEmpty, emptyCart, items, cartTotal, removeItem } = useCart();
  const { clearCartWithDB } = useCartDB();

  const userInfo = getUserSession();
  const { showDateFormat, currency, globalSetting } = useUtilsFunction();

  const { data, isLoading } = useQuery({
    queryKey: ["shippingAddress", { id: userInfo?.id }],
    queryFn: async () =>
      await CustomerServices.getShippingAddress({
        userId: userInfo?.id,
      }),
    select: (data) => data?.shippingAddress,
    enabled: !!userInfo?.id,
  });

  const hasShippingAddress =
    !isLoading && data && Object.keys(data)?.length > 0;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    shouldUnregister: false,
    defaultValues: {
      paymentMethod: "",
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      address: "",
      city: "",
      country: "India",
      zipCode: "",
      shippingOption: "",
    },
  });

  // Keep delivery fields registered so setValue() values are included on submit
  useEffect(() => {
    register("firstName", {
      required: "Full name is required",
      minLength: { value: 2, message: "Enter your full name" },
    });
    register("lastName");
    register("email", {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email address",
      },
    });
    register("contact", {
      required: "Phone number is required",
      pattern: {
        value: /^[6-9]\d{9}$/,
        message: "Enter a valid 10-digit mobile number",
      },
    });
    register("address", {
      required: "Address is required",
      minLength: { value: 8, message: "Enter a complete delivery address" },
    });
    register("city", {
      required: "City is required",
      minLength: { value: 2, message: "Enter your city" },
    });
    register("country");
    register("zipCode", {
      required: "Pincode is required",
      pattern: {
        value: /^\d{6}$/,
        message: "Enter a valid 6-digit pincode",
      },
    });
    register("shippingOption");
  }, [register]);

  const normalizePhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

  const resolveContact = (formData = {}) => {
    const raw =
      formData.contact ||
      formData.phone ||
      getValues("contact") ||
      userInfo?.phone ||
      userInfo?.contact ||
      "";
    return normalizePhone(raw);
  };

  useEffect(() => {
    // Restore guest shipping details from cookie
    try {
      const saved = Cookies.get("shippingAddress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.firstName) setValue("firstName", parsed.firstName);
        if (parsed?.lastName) setValue("lastName", parsed.lastName);
        if (parsed?.email) setValue("email", parsed.email);
        if (parsed?.contact || parsed?.phone) {
          setValue("contact", normalizePhone(parsed.contact || parsed.phone));
        }
        if (parsed?.address) setValue("address", parsed.address);
        if (parsed?.city) setValue("city", parsed.city);
        if (parsed?.country) setValue("country", parsed.country);
        if (parsed?.zipCode) setValue("zipCode", parsed.zipCode);
      }
    } catch {
      /* ignore bad cookie */
    }

    if (Cookies.get("couponInfo")) {
      const coupon = JSON.parse(Cookies.get("couponInfo"));
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountType);
      setMinimumAmount(coupon.minimumAmount);
    }
    const displayEmail = getDisplayEmail(userInfo);
    if (displayEmail && !getValues("email")) {
      setValue("email", displayEmail);
    }
    // Prefill phone from logged-in user if form contact empty
    if (userInfo?.phone && !getValues("contact")) {
      setValue("contact", normalizePhone(userInfo.phone), { shouldValidate: true });
    }
    if (userInfo?.name && !getValues("firstName")) {
      const parts = String(userInfo.name).trim().split(/\s+/);
      setValue("firstName", parts[0] || "");
      if (parts.length > 1) setValue("lastName", parts.slice(1).join(" "));
    }
  }, [setValue, getValues, userInfo]);

  //remove coupon if total value less then minimum amount of coupon
  useEffect(() => {
    // Skip if coupon is already removed (no minimum amount or no active discount)
    if (minimumAmount === 0) {
      isRemovingCouponRef.current = false;
      return;
    }

    // Skip if we're already in the process of removing the coupon
    if (isRemovingCouponRef.current) {
      return;
    }

    // Check if coupon should be removed
    const shouldRemoveCoupon = minimumAmount > 0 && (minimumAmount - discountAmount > total || isEmpty);
    const hasActiveCoupon = discountPercentage !== 0 &&
      (typeof discountPercentage === 'object' ? Object.keys(discountPercentage).length > 0 : true);

    if (shouldRemoveCoupon && hasActiveCoupon) {
      isRemovingCouponRef.current = true;
      setDiscountPercentage(0);
      Cookies.remove("couponInfo");
      setCouponInfo({});
      setMinimumAmount(0);
    }
  }, [minimumAmount, total, discountAmount, isEmpty, discountPercentage]);

  // Load list of coupons applicable for current cart total
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const coupons = await CouponServices.getShowingCoupons();
        const applicable = (coupons || []).filter((coupon) => {
          const min = Number(coupon.minimumAmount || 0);
          const notExpired = coupon.endTime ? !dayjs().isAfter(dayjs(coupon.endTime)) : true;
          return notExpired;
        });
        setAvailableCoupons(applicable);

        // Reset selection if current coupon is no longer applicable
        if (
          selectedCouponCode &&
          !applicable.find((c) => c.couponCode === selectedCouponCode)
        ) {
          setSelectedCouponCode("");
        }
      } catch (err) {
        console.error("Error loading coupons", err);
      }
    };

    if (!isEmpty) {
      loadCoupons();
    } else {
      setAvailableCoupons([]);
      setSelectedCouponCode("");
    }
  }, [total, isEmpty, selectedCouponCode]);

  //calculate total and discount value
  //calculate total and discount value
  useEffect(() => {
    if (!items || items.length === 0) {
      setTaxSummary({ inclusiveTax: 0, exclusiveTax: 0, totalTax: 0 });
      setDiscountAmount(0);
      setTotal(0);
      return;
    }

    const discountProductTotal = items?.reduce(
      (preValue, currentValue) => preValue + currentValue.itemTotal,
      0
    );

    const nextTaxSummary = items?.reduce(
      (acc, item) => {
        const rate = Number(item?.taxRate ?? 0);
        const price = Number(item?.price ?? 0);
        if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(price)) {
          return acc;
        }
        const quantity = Number(item?.quantity ?? 1);
        if (item?.isPriceInclusive) {
          const basePrice = price / (1 + rate / 100);
          const taxAmount = (price - basePrice) * quantity;
          acc.inclusiveTax += taxAmount;
        } else {
          const taxAmount = price * (rate / 100) * quantity;
          acc.exclusiveTax += taxAmount;
        }
        return acc;
      },
      { inclusiveTax: 0, exclusiveTax: 0 }
    );
    nextTaxSummary.totalTax =
      nextTaxSummary.inclusiveTax + nextTaxSummary.exclusiveTax;
    setTaxSummary(nextTaxSummary);

    let totalValue = 0;
    const subTotal = parseFloat(
      cartTotal + Number(shippingCost) + nextTaxSummary.exclusiveTax
    ).toFixed(2);

    let calculatedDiscountAmount = 0;
    if (discountPercentage && typeof discountPercentage === 'object' && discountPercentage.type) {
      calculatedDiscountAmount =
        discountPercentage.type === "fixed"
          ? discountPercentage.value
          : discountProductTotal * (discountPercentage.value / 100);
    }

    const discountAmountTotal = Math.max(0, calculatedDiscountAmount || 0);
    totalValue = Math.max(0, Number(subTotal) - discountAmountTotal);

    setDiscountAmount(discountAmountTotal);
    setTotal(totalValue);
  }, [items, cartTotal, shippingCost, discountPercentage]);

  const submitHandler = async (data) => {
    try {
      const contact = resolveContact(data);
      if (!contact || !/^[6-9]\d{9}$/.test(contact)) {
        notifyError("Please enter a valid 10-digit mobile number.");
        setIsCheckoutSubmit(false);
        return;
      }

      const email = String(
        data.email || getValues("email") || getDisplayEmail(userInfo) || ""
      )
        .trim()
        .toLowerCase();
      if (!isValidEmail(email)) {
        notifyError("Please enter a valid email address.");
        setIsCheckoutSubmit(false);
        return;
      }

      const fullName =
        `${data.firstName || getValues("firstName") || ""} ${
          data.lastName || getValues("lastName") || ""
        }`.trim() ||
        userInfo?.name ||
        "";

      if (!fullName || fullName.length < 2) {
        notifyError("Please enter your full name.");
        setIsCheckoutSubmit(false);
        return;
      }

      const address =
        data.address || getValues("address") || "";
      const zipCode = String(
        data.zipCode || getValues("zipCode") || ""
      ).replace(/\D/g, "");
      const city = String(data.city || getValues("city") || "").trim();
      const country =
        data.country || getValues("country") || "India";

      if (!address || address.trim().length < 8) {
        notifyError("Please enter a complete delivery address.");
        setIsCheckoutSubmit(false);
        return;
      }
      if (!city || city.length < 2) {
        notifyError("Please enter your city.");
        setIsCheckoutSubmit(false);
        return;
      }
      if (!/^\d{6}$/.test(zipCode)) {
        notifyError("Please enter a valid 6-digit pincode.");
        setIsCheckoutSubmit(false);
        return;
      }

      // Keep the old checkout flow: take details on checkout itself
      // and (if needed) complete the customer profile in the background.
      if (userInfo?.token && !isProfileComplete(userInfo)) {
        try {
          const profilePayload = {
            name: fullName,
            phone: contact,
            address,
            city,
            country,
            zipCode,
          };

          await CustomerServices.completeProfile(profilePayload);
        } catch (err) {
          // If profile completion fails, block placing order and show message
          notifyError(
            err?.response?.data?.message ||
              err?.message ||
              "Please check your delivery details and try again."
          );
          setIsCheckoutSubmit(false);
          return;
        }
      }

      // Validate payment method is selected
      if (!data.paymentMethod) {
        notifyError("Please select a payment method.");
        setIsCheckoutSubmit(false);
        return;
      }

      dispatch({ type: "SAVE_SHIPPING_ADDRESS", payload: { ...data, contact, email } });
      Cookies.set("shippingAddress", JSON.stringify({ ...data, contact, email, zipCode, city }));
      setIsCheckoutSubmit(true);
      setError("");

      const userDetails = {
        name: fullName,
        contact,
        phone: contact,
        email,
        address: address.trim(),
        country,
        city,
        zipCode,
      };

      // 1. Pre-check stock before any payment processing
      try {
        const stockCheckResponse = await OrderServices.createOrderByRazorPay({
          amount: "0", // Dummy amount for stock check only
          cart: items,
          checkOnly: true, // Flag to tell backend only to check stock
        });
      } catch (error) {
        const errorData = error?.response?.data;
        if (errorData?.outOfStockItems) {
          errorData.outOfStockItems.forEach((item) => {
            removeItem(item.id || item._id);
            notifyError(`${item.title} is out of stock and removed from cart.`);
          });
          setIsCheckoutSubmit(false);
          toggleCartDrawer();
          return;
        }
        // If it's a real 404 or other error, we might want to handle it, 
        // but for now, we proceed if it's not a stock error
      }

      let orderInfo = {
        user_info: userDetails,
        shippingOption: data.shippingOption || getValues("shippingOption") || "Standard",
        paymentMethod: data.paymentMethod,
        status: "Pending",
        cart: items,
        subTotal: Number(cartTotal) || 0,
        shippingCost: Number(shippingCost) || 0,
        discount: Number(discountAmount) || 0,
        coupon: couponInfo?.couponCode ? {
          couponCode: couponInfo.couponCode,
          discountAmount: Number(discountAmount) || 0,
        } : null,
        taxSummary,
        total: Number(total) || 0,
      };

      if (!orderInfo.total || orderInfo.total < 1) {
        notifyError("Cart total is invalid. Please refresh and try again.");
        setIsCheckoutSubmit(false);
        return;
      }

      if (userInfo?.id) {
        await CustomerServices.addShippingAddress({
          userId: userInfo?.id,
          shippingAddressData: {
            ...userDetails,
          },
        });
      }

      // Handle payment based on method
      switch (data.paymentMethod) {
        case "PhonePe":
        case "RazorPay":
          await handlePaymentWithPhonePe(orderInfo);
          break;
        case "Cash":
          await handleCashPayment(orderInfo);
          break;
        default:
          notifyError("Invalid payment method selected.");
          setIsCheckoutSubmit(false);
      }
    } catch (error) {
      console.error("Checkout submit error:", error);
      const errorData = error?.response?.data;
      console.log("Error Data from Server (Submit):", errorData);

      if (errorData?.outOfStockItems) {
        errorData.outOfStockItems.forEach((item) => {
          removeItem(item.id || item._id);
          notifyError(`${item.title} is out of stock and removed from cart.`);
        });
        setIsCheckoutSubmit(false);
        toggleCartDrawer();
        return;
      }
      notifyError(errorData?.message || error?.message || "An error occurred. Please try again.");
      setIsCheckoutSubmit(false);
    }
  };

  // console.log("globalSetting", globalSetting?.email_to_customer);

  const handleOrderSuccess = async (orderResponse, orderInfo) => {
    try {
      const notificationInfo = {
        orderId: orderResponse?._id,
        message: `${orderResponse?.user_info?.name || "A customer"
          } placed an order of ${parseFloat(orderResponse?.total || 0).toFixed(2)}!`,
      };

      // Trigger Shiprocket order asynchronously
      syncOrderWithShiprocket(orderResponse);

      // Add notification
      await NotificationServices.addNotification(notificationInfo);

      // Proceed with order success
      router.push(`/order/${orderResponse?._id}`);
      notifySuccess("Your order has been confirmed!");
      Cookies.remove("couponInfo");
      // Clear local cart AND DB cart
      await clearCartWithDB();
      setIsCheckoutSubmit(false);
    } catch (err) {
      console.error("Order success handling error:", err.message);
      throw new Error(err.message);
    }
  };

  const buildShiprocketPayload = (orderResponse) => {
    if (!orderResponse?.user_info || !orderResponse?.cart?.length) return null;

    const {
      name = "",
      email,
      contact,
      address,
      address2,
      city,
      state,
      country,
      zipCode,
      isdCode,
      alternatePhone,
    } = orderResponse.user_info;

    const [firstName = "", ...restName] = name.trim().split(" ");
    const lastName = restName.join(" ");

    const orderItems = orderResponse.cart.map((item, index) => ({
      name: item.title || item.name || `Item-${index + 1}`,
      sku: item.sku || item.id || item._id || `SKU-${index + 1}`,
      units: item.quantity || 1,
      selling_price: (item.price || item.unit_price || 0).toString(),
      discount: item.discount || "",
      tax: item.tax || "",
      hsn: item.hsn || "",
    }));

    const totalWeight =
      orderResponse.cart.reduce(
        (weight, item) => weight + (Number(item.weight) || 0),
        0
      ) || 0.5;

    return {
      orderId: orderResponse._id,
      order_id: orderResponse.invoice || orderResponse._id || "",
      order_date: dayjs(orderResponse.createdAt).format("YYYY-MM-DD"),
      pickup_location: "home",
      comment: orderResponse.comment || "",
      reseller_name: orderResponse.reseller_name || "",
      company_name: orderResponse.company_name || globalSetting?.company_name || "",
      billing_customer_name: firstName || name,
      billing_last_name: lastName,
      billing_address: address,
      billing_address_2: address2 || "",
      billing_isd_code: isdCode || "",
      billing_city: city,
      billing_pincode: zipCode || "000000",
      billing_state: state || city,
      billing_country: country || "India",
      billing_email: email,
      billing_phone: contact,
      billing_alternate_phone: alternatePhone || "",
      shipping_is_billing: true,
      shipping_customer_name: firstName || name,
      shipping_last_name: lastName,
      shipping_address: orderResponse.shippingAddress || address,
      shipping_address_2: orderResponse.shippingAddress2 || address2 || "",
      shipping_city: orderResponse.shippingCity || city,
      shipping_pincode: orderResponse.shippingZipCode || zipCode || "000000",
      shipping_country: orderResponse.shippingCountry || country || "India",
      shipping_state: orderResponse.shippingState || state || city,
      shipping_email: orderResponse.shippingEmail || email,
      shipping_phone: orderResponse.shippingPhone || contact,
      order_items: orderItems,
      payment_method: orderResponse.paymentMethod === "Cash" ? "COD" : "Prepaid",
      shipping_charges: Number(orderResponse.shippingCost || 0),
      giftwrap_charges: orderResponse.giftwrap_charges || "",
      transaction_charges: orderResponse.transaction_charges || "",
      total_discount:
        Number(orderResponse.discount || 0) ||
        Number(orderResponse.total_discount || 0),
      sub_total: Number(orderResponse.subTotal || orderResponse.total || 0),
      length: orderResponse.package?.length || 10,
      breadth: orderResponse.package?.breadth || 10,
      height: orderResponse.package?.height || 2,
      weight: orderResponse.package?.weight || totalWeight,
      ewaybill_no: orderResponse.ewaybill_no || "",
      customer_gstin: orderResponse.customer_gstin || "",
      invoice_number: orderResponse.invoice || "",
      order_type: orderResponse.order_type || "",
    };
  };

  const syncOrderWithShiprocket = async (orderResponse) => {
    try {
      const payload = buildShiprocketPayload(orderResponse);
      if (!payload) return;
      await ShiprocketServices.createOrder(payload);
    } catch (err) {
      console.error("Shiprocket order sync failed:", err.message);
    }
  };

  //handle cash payment
  const handleCashPayment = async (orderInfo) => {
    const orderResponse = await OrderServices.addOrder(orderInfo);
    await handleOrderSuccess(orderResponse, orderInfo);
  };

  // PhonePe Standard Checkout — redirect flow; success only after backend verify/webhook
  const handlePaymentWithPhonePe = async (orderInfo) => {
    try {
      const payload = {
        ...orderInfo,
        paymentMethod: "PhonePe",
        status: "Pending Payment",
      };

      const response = await OrderServices.createPhonePeCheckout(payload);

      if (!response?.redirectUrl) {
        notifyError(response?.message || "Unable to start PhonePe payment.");
        setIsCheckoutSubmit(false);
        return;
      }

      // Persist merchant order id for return page fallback
      if (typeof window !== "undefined" && response.merchantOrderId) {
        sessionStorage.setItem("phonepe_moid", response.merchantOrderId);
        sessionStorage.setItem("phonepe_order_id", response.orderId || "");
      }

      notifySuccess("Redirecting to secure PhonePe checkout...");
      window.location.href = response.redirectUrl;
    } catch (err) {
      console.error("PhonePe checkout error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "PhonePe payment failed to start. Please try again.";
      notifyError(msg);
      setIsCheckoutSubmit(false);
    }
  };

  //handle razorpay payment (legacy — kept but unused; PhonePe is primary online gateway)
  const handlePaymentWithRazorpay = async (orderInfo) => {
    return handlePaymentWithPhonePe(orderInfo);
  };

  const handleShippingCost = (value) => {
    // console.log("handleShippingCost", value);
    setShippingCost(Number(value));
  };

  //handle default shipping address
  const handleDefaultShippingAddress = (value) => {
    setUseExistingAddress(value);
    if (value) {
      // `data` from query may be a single address object OR an array
      const address = Array.isArray(data)
        ? data.find((a) => a?.isDefault) || data[0]
        : data;

      if (!address || typeof address !== "object") {
        notifyError("No saved address found.");
        setUseExistingAddress(false);
        return;
      }

      const nameParts = String(address?.name || "").trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const phone = normalizePhone(address.phone || address.contact || userInfo?.phone || "");

      setValue("firstName", firstName, { shouldValidate: true });
      setValue("lastName", lastName, { shouldValidate: true });
      setValue("address", address.address || "", { shouldValidate: true });
      setValue("contact", phone, { shouldValidate: true });
      setValue("city", address.city || "", { shouldValidate: true });
      setValue("country", address.country || "India", { shouldValidate: true });
      setValue("zipCode", address.zipCode || "", { shouldValidate: true });
    } else {
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("address", "");
      setValue("contact", normalizePhone(userInfo?.phone || ""));
      setValue("city", "");
      setValue("country", "India");
      setValue("zipCode", "");
    }
  };
  const handleCouponCode = async (e) => {
    e.preventDefault();

    const code =
      selectedCouponCode || (couponRef.current && couponRef.current.value);

    if (!code) {
      notifyError("Please select or input a Coupon Code!");
      return;
    }
    setIsCouponAvailable(true);

    try {
      const coupons = await CouponServices.getShowingCoupons();
      const result = coupons.filter(
        (coupon) => coupon.couponCode === code
      );
      setIsCouponAvailable(false);

      if (result.length < 1) {
        notifyError("Please Input a Valid Coupon!");
        return;
      }

      if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
        notifyError("This coupon is not valid!");
        return;
      }

      if (total < result[0]?.minimumAmount) {
        notifyError(
          `Minimum ${result[0].minimumAmount} ${currency} required for Apply this coupon!`
        );
        return;
      } else {
        notifySuccess(
          `Your Coupon ${result[0].couponCode} is Applied on ${result[0].productType}!`
        );
        isRemovingCouponRef.current = false; // Reset flag when applying new coupon
        setIsCouponApplied(true);
        setMinimumAmount(result[0]?.minimumAmount);
        setDiscountPercentage(result[0].discountType);
        setCouponInfo(result[0]); // <-- ADD THIS LINE
        dispatch({ type: "SAVE_COUPON", payload: result[0] });
        Cookies.set("couponInfo", JSON.stringify(result[0]));
      }
    } catch (error) {
      return notifyError(error.message);
    }
  };

  const handleRemoveCoupon = () => {
    isRemovingCouponRef.current = true;
    setDiscountPercentage(0);
    Cookies.remove("couponInfo");
    setCouponInfo({});
    setMinimumAmount(0);
    setIsCouponApplied(false);
    setSelectedCouponCode("");
    setDiscountAmount(0);
    dispatch({ type: "SAVE_COUPON", payload: null });
    notifySuccess("Coupon removed successfully!");
    setTimeout(() => {
      isRemovingCouponRef.current = false;
    }, 100);
  };


  return {
    register,
    errors,
    watch,
    showCard,
    setShowCard,
    error,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountPercentage,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    isCouponApplied,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    availableCoupons,
    selectedCouponCode,
    setSelectedCouponCode,
    handleDefaultShippingAddress,
    taxSummary,
    setValue,
    handleRemoveCoupon,
  };
};

export default useCheckoutSubmit;

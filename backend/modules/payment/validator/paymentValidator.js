/**
 * Lightweight runtime validation (no Zod dependency required).
 * Rejects invalid checkout / payment payloads early.
 */

const isNonEmptyString = (v, min = 1, max = 500) =>
  typeof v === "string" && v.trim().length >= min && v.trim().length <= max;

const isPositiveNumber = (v) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;

const validateCart = (cart) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    return "Cart must contain at least one item.";
  }
  for (const item of cart) {
    if (!item || typeof item !== "object") return "Invalid cart item.";
    const qty = Number(item.quantity ?? item.qty ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      return "Each cart item must have a valid quantity.";
    }
  }
  return null;
};

const validateCreatePhonePeCheckout = (body = {}) => {
  const errors = [];

  const cartError = validateCart(body.cart);
  if (cartError) errors.push(cartError);

  // Normalize phone aliases before validation
  if (body.user_info && typeof body.user_info === "object") {
    const rawPhone =
      body.user_info.contact ||
      body.user_info.phone ||
      body.user_info.mobile ||
      "";
    const digits = String(rawPhone).replace(/\D/g, "");
    body.user_info.contact = digits.length >= 10 ? digits.slice(-10) : digits;
    body.user_info.phone = body.user_info.contact;
  }

  if (!body.user_info || typeof body.user_info !== "object") {
    errors.push("user_info is required.");
  } else {
    if (!isNonEmptyString(body.user_info.name, 2, 120)) {
      errors.push("Valid name is required.");
    }
    if (!isNonEmptyString(body.user_info.contact, 10, 15)) {
      errors.push("Valid 10-digit phone number is required.");
    }
    if (!isNonEmptyString(body.user_info.address, 5, 500)) {
      errors.push("Valid address is required.");
    }
    if (!isNonEmptyString(body.user_info.zipCode || body.user_info.zipcode || "", 4, 12)) {
      errors.push("Valid pincode/zipCode is required.");
    }
  }

  if (!isPositiveNumber(Number(body.total)) || Number(body.total) < 1) {
    errors.push("total must be at least ₹1.");
  }
  if (!isPositiveNumber(Number(body.subTotal))) {
    errors.push("subTotal is required.");
  }
  if (body.shippingCost != null && !isPositiveNumber(Number(body.shippingCost))) {
    errors.push("shippingCost must be a valid number.");
  }
  if (body.discount != null && !isPositiveNumber(Number(body.discount))) {
    errors.push("discount must be a valid number.");
  }

  const paymentMethod = String(body.paymentMethod || "");
  if (!["PhonePe", "RazorPay"].includes(paymentMethod)) {
    errors.push("paymentMethod must be PhonePe for online checkout.");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
};

const validateMerchantOrderId = (merchantOrderId) => {
  if (!isNonEmptyString(merchantOrderId, 6, 63)) {
    return { ok: false, errors: ["merchantOrderId is required."] };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(merchantOrderId)) {
    return { ok: false, errors: ["merchantOrderId has invalid characters."] };
  }
  return { ok: true, errors: [] };
};

module.exports = {
  validateCreatePhonePeCheckout,
  validateMerchantOrderId,
};

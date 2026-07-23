const crypto = require("crypto");
const Product = require("../../../models/Product");
const Coupon = require("../../../models/Coupon");

const resolveProductId = (item) => {
  const raw = item?._id || item?.id;
  if (!raw) return null;
  const str = String(raw).split("-")[0];
  return str || null;
};

const showingTitle = (title) => {
  if (!title) return "Product";
  if (typeof title === "string") return title;
  return title.en || title[Object.keys(title)[0]] || "Product";
};

const getUnitPrice = (product, item) => {
  // Prefer frozen client price only as fallback; backend product/variant is source of truth
  if (item?.variant && Array.isArray(product.variants)) {
    const v = item.variant;
    const flat = product.variants.find((x) => {
      const vid = x.productId || x._id || x.id;
      return (
        (v._id && String(vid) === String(v._id)) ||
        (v.sku && x.sku === v.sku) ||
        (v.color && v.size && x.color === v.color && x.size === v.size)
      );
    });
    if (flat) {
      const price = Number(flat.price ?? flat.prices?.price ?? 0);
      if (price > 0) return price;
    }
  }

  const price = Number(
    product?.prices?.price ??
      product?.prices?.originalPrice ??
      item?.price ??
      0
  );
  return price > 0 ? price : Number(item?.price || 0);
};

const buildOrderSnapshotItem = (product, item, unitPrice) => {
  const qty = Number(item.quantity || item.qty || 1);
  const lineTotal = Number((unitPrice * qty).toFixed(2));
  const taxRate = Number(item.taxRate ?? product.taxRate ?? 0);
  const gst = Number(((lineTotal * taxRate) / (100 + (product.isPriceInclusive ? taxRate : 0))).toFixed(2));

  return {
    productId: String(product._id),
    name: showingTitle(product.title) || showingTitle(item.title),
    sku: item.sku || item.variant?.sku || product.sku || "",
    price: unitPrice,
    originalPrice: Number(product?.prices?.originalPrice || unitPrice),
    quantity: qty,
    discount: 0,
    gst: Number.isFinite(gst) ? gst : 0,
    taxRate,
    hsnCode: product.hsnCode || item.hsnCode || "",
    image: Array.isArray(product.image) ? product.image[0] : product.image || item.image || "",
    variant: item.variant || null,
    isCombination: Boolean(item.isCombination || product.isCombination),
    lineTotal,
  };
};

/**
 * Validate cart against live catalog and freeze pricing into a snapshot.
 * Never trusts frontend financial fields as authoritative.
 */
const buildValidatedCheckout = async ({
  cart = [],
  shippingCost = 0,
  couponCode = null,
  clientTotal = null,
}) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, code: "EMPTY_CART", message: "Cart must contain at least one item." };
  }

  const snapshot = [];
  const frozenCart = [];
  let subTotal = 0;

  for (const item of cart) {
    const productId = resolveProductId(item);
    if (!productId) {
      return { ok: false, code: "INVALID_PRODUCT", message: "Invalid product in cart." };
    }

    const product = await Product.findById(productId);
    if (!product) {
      return {
        ok: false,
        code: "PRODUCT_NOT_FOUND",
        message: `Product not found: ${showingTitle(item.title)}`,
      };
    }

    if (product.status && String(product.status).toLowerCase() === "hide") {
      return {
        ok: false,
        code: "PRODUCT_INACTIVE",
        message: `${showingTitle(product.title)} is no longer available.`,
      };
    }

    const qty = Number(item.quantity || item.qty || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      return { ok: false, code: "INVALID_QTY", message: "Invalid item quantity." };
    }

    const unitPrice = getUnitPrice(product, item);
    if (!unitPrice || unitPrice <= 0) {
      return {
        ok: false,
        code: "INVALID_PRICE",
        message: `Unable to price ${showingTitle(product.title)}.`,
      };
    }

    const snap = buildOrderSnapshotItem(product, item, unitPrice);
    snapshot.push(snap);
    subTotal += snap.lineTotal;

    frozenCart.push({
      ...item,
      _id: product._id,
      id: item.id || String(product._id),
      title: snap.name,
      price: unitPrice,
      quantity: qty,
      sku: snap.sku,
      image: snap.image || item.image,
      hsnCode: snap.hsnCode,
      taxRate: snap.taxRate,
      snapshotPrice: unitPrice,
      snapshotName: snap.name,
    });
  }

  subTotal = Number(subTotal.toFixed(2));
  const safeShipping = Math.max(0, Number(shippingCost) || 0);

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    const found = await Coupon.findOne({
      couponCode: String(couponCode).trim(),
      status: "show",
    });
    if (!found) {
      return { ok: false, code: "INVALID_COUPON", message: "Coupon is invalid or inactive." };
    }
    if (found.endTime && new Date(found.endTime) < new Date()) {
      return { ok: false, code: "COUPON_EXPIRED", message: "Coupon has expired." };
    }
    if (Number(found.minimumAmount || 0) > subTotal) {
      return {
        ok: false,
        code: "COUPON_MIN_AMOUNT",
        message: `Coupon requires minimum order of ₹${found.minimumAmount}.`,
      };
    }

    const dtype = found.discountType || {};
    const type = dtype.type || dtype;
    const value = Number(dtype.value ?? found.discountType?.value ?? 0);
    if (String(type).toLowerCase().includes("percent") || String(type) === "%") {
      discount = Number(((subTotal * value) / 100).toFixed(2));
    } else if (value > 0) {
      discount = Math.min(subTotal, value);
    }
    coupon = {
      couponCode: found.couponCode,
      discountAmount: discount,
    };
  }

  const total = Number(Math.max(0, subTotal + safeShipping - discount).toFixed(2));

  if (clientTotal != null) {
    const client = Number(clientTotal);
    if (Number.isFinite(client) && Math.abs(client - total) > 1) {
      return {
        ok: false,
        code: "TOTAL_MISMATCH",
        message: "Cart total mismatch. Please refresh and try again.",
        details: { serverTotal: total, clientTotal: client },
      };
    }
  }

  return {
    ok: true,
    snapshot,
    frozenCart,
    pricing: {
      subTotal,
      shippingCost: safeShipping,
      discount,
      total,
      coupon,
    },
  };
};

const createCorrelationId = () => {
  const rand = crypto.randomBytes(4).toString("hex");
  return `req_${Date.now().toString(36)}_${rand}`;
};

module.exports = {
  buildValidatedCheckout,
  createCorrelationId,
  buildOrderSnapshotItem,
};

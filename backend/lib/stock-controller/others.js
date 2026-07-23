require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../../models/Product");

const resolveProductId = (item) => {
  const raw = item?._id || item?.id;
  if (!raw) return null;
  const str = String(raw);
  if (mongoose.Types.ObjectId.isValid(str) && String(new mongoose.Types.ObjectId(str)) === str) {
    return str;
  }
  const first = str.split("-")[0];
  if (first && mongoose.Types.ObjectId.isValid(first)) return first;
  return null;
};

const isNestedVariants = (variants = []) =>
  Array.isArray(variants) &&
  variants.some((v) => v && typeof v === "object" && Array.isArray(v.sizes));

const getVariantQuantity = (product, variantRef) => {
  if (!product || !variantRef) return null;

  const variantId = variantRef.productId || variantRef._id || variantRef.id;
  const color = variantRef.color;
  const size = variantRef.size;
  const sku = variantRef.sku;

  if (Array.isArray(product.variantFilters) && product.variantFilters.length > 0) {
    const match = product.variantFilters.find((vf) => {
      if (sku && vf.sku === sku) return true;
      if (
        color &&
        size &&
        vf.attributes?.color === color &&
        vf.attributes?.size === size
      ) {
        return true;
      }
      if (variantId && vf.sku && String(vf.sku) === String(variantId)) return true;
      return false;
    });
    if (match) return Number(match.quantity || 0);
  }

  const variants = product.variants || [];
  if (isNestedVariants(variants)) {
    for (const colorVar of variants) {
      const colorName = colorVar.color || colorVar.colorName;
      for (const sizeVar of colorVar.sizes || []) {
        const matches =
          (variantId &&
            (String(sizeVar._id) === String(variantId) ||
              String(sizeVar.sku) === String(variantId))) ||
          (sku && sizeVar.sku === sku) ||
          (color && size && colorName === color && sizeVar.size === size);
        if (matches) return Number(sizeVar.quantity ?? sizeVar.stock ?? 0);
      }
    }
    return null;
  }

  const flat = variants.find((v) => {
    const vid = v.productId || v._id || v.id;
    return (
      (variantId && String(vid) === String(variantId)) ||
      (color && size && v.color === color && v.size === size) ||
      (sku && v.sku === sku)
    );
  });
  if (flat) return Number(flat.quantity ?? flat.stock ?? 0);
  return null;
};

const decrementVariantStock = (product, variantRef, quantity) => {
  const variantId = variantRef?.productId || variantRef?._id || variantRef?.id;
  const color = variantRef?.color;
  const size = variantRef?.size;
  const sku = variantRef?.sku;
  let updated = false;

  if (Array.isArray(product.variantFilters) && product.variantFilters.length > 0) {
    product.variantFilters = product.variantFilters.map((vf) => {
      const matches =
        (sku && vf.sku === sku) ||
        (color &&
          size &&
          vf.attributes?.color === color &&
          vf.attributes?.size === size) ||
        (variantId && vf.sku && String(vf.sku) === String(variantId));
      if (!matches) return vf;
      updated = true;
      const nextQty = Math.max(0, Number(vf.quantity || 0) - quantity);
      return { ...vf, quantity: nextQty };
    });
  }

  if (isNestedVariants(product.variants)) {
    product.variants = product.variants.map((colorVar) => {
      const colorName = colorVar.color || colorVar.colorName;
      const sizes = (colorVar.sizes || []).map((sizeVar) => {
        const matches =
          (variantId &&
            (String(sizeVar._id) === String(variantId) ||
              String(sizeVar.sku) === String(variantId))) ||
          (sku && sizeVar.sku === sku) ||
          (color && size && colorName === color && sizeVar.size === size);
        if (!matches) return sizeVar;
        updated = true;
        const nextQty = Math.max(
          0,
          Number(sizeVar.quantity ?? sizeVar.stock ?? 0) - quantity
        );
        return { ...sizeVar, quantity: nextQty, stock: nextQty };
      });
      return { ...colorVar, sizes };
    });
  } else if (Array.isArray(product.variants) && product.variants.length > 0) {
    product.variants = product.variants.map((v) => {
      const vid = v.productId || v._id || v.id;
      const matches =
        (variantId && String(vid) === String(variantId)) ||
        (color && size && v.color === color && v.size === size) ||
        (sku && v.sku === sku);
      if (!matches) return v;
      updated = true;
      const nextQty = Math.max(0, Number(v.quantity ?? v.stock ?? 0) - quantity);
      return { ...v, quantity: nextQty, stock: nextQty };
    });
  }

  return updated;
};

const hasVariantSelection = (item) =>
  Boolean(
    item?.isCombination ||
      (item?.variant &&
        typeof item.variant === "object" &&
        Object.keys(item.variant).length > 0 &&
        (item.variant._id ||
          item.variant.productId ||
          item.variant.color ||
          item.variant.size ||
          item.variant.sku))
  );

const handleProductQuantity = async (cart, options = {}) => {
  try {
    return await reduceStockAtomic(cart, options);
  } catch (err) {
    console.log("err on handleProductQuantity", err.message);
    if (options.throwOnError) throw err;
    return { ok: false, error: err.message };
  }
};

/**
 * Atomic inventory reduction. Throws if any line cannot be fulfilled.
 * Supports optional mongoose session for multi-doc transactions.
 */
const reduceStockAtomic = async (cart, { session = null } = {}) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Cannot reduce stock for empty cart.");
  }

  const queryOpts = session ? { session } : {};

  for (const p of cart) {
    const productId = resolveProductId(p);
    const qty = Number(p.quantity || p.qty || 0);
    if (!productId || !Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid cart line for stock reduction.`);
    }

    if (hasVariantSelection(p)) {
      const product = await Product.findById(productId, null, queryOpts);
      if (!product) {
        throw new Error(`Product not found for stock reduction: ${productId}`);
      }

      const available = getVariantQuantity(product, p.variant);
      if (available === null || available < qty) {
        throw new Error(
          `Insufficient variant stock for product ${productId}. Available=${available}, requested=${qty}`
        );
      }

      const updated = decrementVariantStock(product, p.variant, qty);
      if (!updated) {
        throw new Error(`Variant not found while reducing stock for ${productId}`);
      }

      product.stock = Math.max(0, Number(product.stock || 0) - qty);
      product.sales = Number(product.sales || 0) + qty;
      product.markModified("variants");
      product.markModified("variantFilters");
      await product.save(queryOpts);
    } else {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: qty },
        },
        {
          $inc: {
            stock: -qty,
            sales: qty,
          },
        },
        { new: true, ...(session ? { session } : {}) }
      );
      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for product ${productId}. Requested=${qty}`
        );
      }
    }
  }

  return { ok: true };
};

const checkStock = async (cart) => {
  try {
    if (!cart || !Array.isArray(cart)) {
      console.log("checkStock: cart is not an array", cart);
      return [];
    }
    const outOfStockItems = [];
    for (const item of cart) {
      const itemId = resolveProductId(item);
      if (!itemId) {
        console.log("checkStock: invalid itemId", item?.id || item?._id);
        continue;
      }

      const product = await Product.findById(itemId);
      if (!product) {
        outOfStockItems.push({
          _id: itemId,
          id: item.id,
          title: item.title || "Unknown Product",
          reason: "Product not found in database",
        });
        continue;
      }

      if (hasVariantSelection(item)) {
        if (!item.variant) {
          outOfStockItems.push({
            _id: itemId,
            id: item.id,
            title: item.title,
            reason: "Variant information missing",
          });
          continue;
        }

        const available = getVariantQuantity(product, item.variant);
        if (available === null) {
          outOfStockItems.push({
            _id: itemId,
            id: item.id,
            title: item.title,
            reason: "Variant not found",
          });
          continue;
        }

        if (available < item.quantity) {
          outOfStockItems.push({
            _id: itemId,
            id: item.id,
            title: item.title,
            available,
            requested: item.quantity,
          });
        }
      } else if (product.stock < item.quantity) {
        outOfStockItems.push({
          _id: itemId,
          id: item.id,
          title: item.title,
          available: product.stock,
          requested: item.quantity,
        });
      }
    }
    return outOfStockItems;
  } catch (err) {
    console.error("err on checkStock:", err.message);
    return [];
  }
};

const handleProductAttribute = async (key, value, multi) => {
  try {
    const products = await Product.find({ isCombination: true });

    if (multi) {
      for (const p of products) {
        await Product.updateOne(
          { _id: p._id },
          {
            $pull: {
              variants: { [key]: { $in: value } },
            },
          }
        );
      }
    } else {
      for (const p of products) {
        await Product.updateOne(
          { _id: p._id },
          {
            $pull: {
              variants: { [key]: value },
            },
          }
        );
      }
    }
  } catch (err) {
    console.log("err, when delete product variants", err.message);
  }
};

module.exports = {
  handleProductQuantity,
  reduceStockAtomic,
  handleProductAttribute,
  checkStock,
};

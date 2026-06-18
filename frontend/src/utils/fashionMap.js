/**
 * Normalizes API product/category data for the storefront.
 * Does NOT replace real catalog data with mock content.
 */

const textValue = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.en || val.default || Object.values(val)[0] || "";
  return String(val);
};

export function transformProduct(product) {
  if (!product) return null;

  const category = product.category || product.categories?.[0];
  const categorySlug =
    product.categorySlug ||
    category?.slug ||
    textValue(category?.name)?.toLowerCase().replace(/\s+/g, "-") ||
    "";

  const brandName =
    product.brandName ||
    textValue(product.brand?.name) ||
    "";

  return {
    ...product,
    categoryName: product.categoryName || textValue(category?.name),
    categorySlug,
    brandName,
    variants: Array.isArray(product.variants) ? product.variants : [],
    isCombination: Boolean(product.isCombination && product.variants?.length),
  };
}

export function transformProductList(products) {
  if (!products || !Array.isArray(products)) return [];
  return products.map(transformProduct).filter(Boolean);
}

export function transformStoreData(data) {
  if (!data) return { products: [], popularProducts: [], discountedProducts: [], bestSellingProducts: [], relatedProducts: [] };
  return {
    ...data,
    products: transformProductList(data.products),
    popularProducts: transformProductList(data.popularProducts),
    discountedProducts: transformProductList(data.discountedProducts),
    bestSellingProducts: transformProductList(data.bestSellingProducts),
    relatedProducts: transformProductList(data.relatedProducts),
  };
}

export const sneakerSizeFilters = ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];

export const priceQuickFilters = [
  { label: "Under ₹2000", min: 0, max: 2000 },
  { label: "Under ₹3000", min: 0, max: 3000 },
  { label: "Under ₹5000", min: 0, max: 5000 },
];

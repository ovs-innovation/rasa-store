const Category = require("../models/Category");
const Product = require("../models/Product");

const SHOP_CATEGORY_SLUGS = new Set(["footwear", "bags"]);

const BAG_KEYWORDS = [
  "bag",
  "tote",
  "crossbody",
  "daypack",
  "backpack",
  "shoulder",
  "sling",
  "wallet",
  "purse",
  "clutch",
  "satchel",
  "handbag",
];

const FOOTWEAR_KEYWORDS = [
  "sneaker",
  "shoe",
  "slide",
  "dunk",
  "runner",
  "court",
  "samba",
  "jordan",
  "low-top",
  "high top",
  "knit",
  "trainer",
  "boot",
  "loafer",
  "sandal",
];

const collectLocalizedText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return Object.values(value).filter(Boolean).join(" ");
  }
  return String(value);
};

const inferShopCategoryFromText = (text = "") => {
  const normalized = String(text).toLowerCase();
  if (!normalized) return null;
  if (BAG_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "bags";
  if (FOOTWEAR_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "footwear";
  }
  return null;
};

const resolveProductShopCategories = (product, categorySlugById) => {
  const resolved = new Set();

  const categoryRefs = [product?.category, ...(product?.categories || [])].filter(
    Boolean
  );

  for (const categoryRef of categoryRefs) {
    const categoryId = String(categoryRef?._id || categoryRef);
    const slug = String(
      categoryRef?.slug || categorySlugById.get(categoryId) || ""
    )
      .trim()
      .toLowerCase();

    if (SHOP_CATEGORY_SLUGS.has(slug)) {
      resolved.add(slug);
    }
  }

  if (!resolved.size) {
    const text = [
      collectLocalizedText(product?.title),
      collectLocalizedText(product?.description),
    ].join(" ");
    const inferred = inferShopCategoryFromText(text);
    if (inferred) resolved.add(inferred);
  }

  return [...resolved];
};

const getBrandIdsForShopCategory = async (categorySlug) => {
  const slug = String(categorySlug || "").trim().toLowerCase();
  if (!SHOP_CATEGORY_SLUGS.has(slug)) return [];

  const [categories, products] = await Promise.all([
    Category.find({ slug: { $in: [...SHOP_CATEGORY_SLUGS] } })
      .select("_id slug")
      .lean(),
    Product.find({ status: "show" })
      .select("title description category categories brand")
      .lean(),
  ]);

  const categorySlugById = new Map(
    categories.map((category) => [String(category._id), category.slug])
  );

  const brandIds = new Set();

  for (const product of products) {
    if (!product?.brand) continue;
    const productCategories = resolveProductShopCategories(
      product,
      categorySlugById
    );
    if (productCategories.includes(slug)) {
      brandIds.add(String(product.brand));
    }
  }

  return [...brandIds];
};

module.exports = {
  SHOP_CATEGORY_SLUGS,
  getBrandIdsForShopCategory,
};

export const DEFAULT_SHOP_CATEGORIES = [
  {
    id: "cat-footwear",
    title: "Shoes",
    slug: "footwear",
    image: "/shoes1.png",
  },
  {
    id: "cat-bags",
    title: "Bags",
    slug: "bags",
    image: "/bag1.png",
  },
];

/** Normalize CMS category banners into the single shop-categories list. */
export const normalizeShopCategories = (categoryBanners = []) => {
  const fromCms = (Array.isArray(categoryBanners) ? categoryBanners : [])
    .filter((cat) => cat?.title?.trim() && cat?.image?.trim())
    .slice(0, 2)
    .map((cat, idx) => ({
      id: cat.id || `cat-${cat.slug || idx}`,
      title: String(cat.title).trim(),
      slug: String(cat.slug || "footwear").trim().toLowerCase(),
      image: String(cat.image).trim(),
    }));

  return fromCms.length > 0 ? fromCms : DEFAULT_SHOP_CATEGORIES;
};

const getBrandName = (brand) => {
  if (!brand?.name) return brand?.slug || "";
  if (typeof brand.name === "string") return brand.name;
  return brand.name.en || brand.name.default || brand.slug || "";
};

/** Build brand sub-items for footwear / bags category menus. */
export const buildCategoryChildren = (categorySlug, brands = []) => {
  const slug = String(categorySlug || "").trim().toLowerCase();
  if (slug !== "footwear" && slug !== "bags") return [];

  return (Array.isArray(brands) ? brands : [])
    .filter((brand) => brand?.slug)
    .map((brand) => ({
      _id: brand._id || `${slug}-brand-${brand.slug}`,
      slug: `${slug}?brand=${brand.slug}`,
      name: { en: getBrandName(brand) },
    }));
};

/** Resolve category / sub-category slug to a storefront search URL. */
export const getCategoryNavUrl = (cat) => {
  if (!cat) return "/";
  const slug = String(cat.slug || "").trim();
  if (!slug || slug === "/") return "/";
  if (slug === "new-arrivals") return "/new-arrivals";
  if (slug.startsWith("search?")) return `/${slug}`;
  if (slug.startsWith("footwear?brand=")) {
    const brandName = slug.split("=")[1];
    return `/search?category=footwear&brand=${brandName}`;
  }
  if (slug.startsWith("bags?brand=")) {
    const brandName = slug.split("=")[1];
    return `/search?category=bags&brand=${brandName}`;
  }
  if (slug.startsWith("bags?type=")) {
    const bagType = slug.split("=")[1];
    return `/search?category=bags&type=${bagType}`;
  }
  return `/search?category=${slug}`;
};

/** Shape for LowerCategoryNavbar and mobile category drawer. */
export const shopCategoriesToNavItems = (
  categories = [],
  brandsByCategory = {}
) =>
  categories.map((cat, idx) => ({
    _id: cat.id || `shop-cat-${idx}`,
    slug: cat.slug,
    name: { en: cat.title },
    icon: cat.image,
    children: buildCategoryChildren(
      cat.slug,
      brandsByCategory[String(cat.slug).toLowerCase()] || []
    ),
  }));

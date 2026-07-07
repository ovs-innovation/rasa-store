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

/** Shape for LowerCategoryNavbar (flat, no sub-tree). */
export const shopCategoriesToNavItems = (categories = []) =>
  categories.map((cat, idx) => ({
    _id: cat.id || `shop-cat-${idx}`,
    slug: cat.slug,
    name: { en: cat.title },
    icon: cat.image,
    children: [],
  }));

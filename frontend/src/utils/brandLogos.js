import { isUsableImageUrl } from "@utils/brandAssets";

/** Local brand marks — fast, no external CDN dependency */
export const BRAND_LOGO_BY_SLUG = {
  nike: "/brands/nike.svg",
  adidas: "/brands/adidas.svg",
  puma: "/brands/puma.svg",
  converse: "/brands/converse.svg",
  "new-balance": "/brands/new-balance.svg",
  vans: "/brands/vans.svg",
  "onitsuka-tiger": "/brands/onitsuka-tiger.svg",
};

export const getBrandName = (brand) => {
  if (!brand?.name) return brand?.slug || "Brand";
  if (typeof brand.name === "string") return brand.name;
  return brand.name.en || brand.name[Object.keys(brand.name)[0]] || brand.slug || "Brand";
};

export const resolveBrandLogo = (brand) => {
  const slug = (brand?.slug || "").toLowerCase();
  if (slug && BRAND_LOGO_BY_SLUG[slug]) return BRAND_LOGO_BY_SLUG[slug];

  const fromDb = brand?.logo || brand?.image;
  if (isUsableImageUrl(fromDb)) return fromDb.trim();

  return null;
};

import { isUsableImageUrl } from "@utils/brandAssets";

/** Local brand marks — updated slugs after copyright-safe rename */
export const BRAND_LOGO_BY_SLUG = {
  "nikke": "/brands/nikke.svg",
  "adidass": "/brands/adidass.svg",
  "jourdann": "/brands/jourdann.svg",
  "balanse": "/brands/balanse.svg",
  "konverse": "/brands/konverse.svg",
  "pumma": "/brands/pumma.svg",
  "rebok": "/brands/rebok.svg",
  // legacy slugs kept as fallback
  "aero": "/brands/aero.svg",
  "soleste": "/brands/soleste.svg",
  "pinnacle": "/brands/pinnacle.svg",
  "vanguard": "/brands/vanguard.svg",
  "heritage": "/brands/heritage.svg",
  "equinox": "/brands/equinox.svg",
  "kurashiki": "/brands/kurashiki.svg",
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

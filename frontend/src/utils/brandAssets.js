/** Farmacykart brand logo on Cloudinary (dse9adftu) */
export const DEFAULT_BRAND_LOGO =
  "https://res.cloudinary.com/dse9adftu/image/upload/v1780479335/farmacykart/brand/logo.png";

const LEGACY_CLOUDS = ["dhqcwkpzp"];

export const isUsableImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (!t.startsWith("http")) return false;
  const lower = t.toLowerCase();
  return !LEGACY_CLOUDS.some((c) => lower.includes(`res.cloudinary.com/${c}/`));
};

/** First valid URL, else default Cloudinary logo */
export const pickBrandLogo = (...candidates) => {
  for (const url of candidates) {
    if (isUsableImageUrl(url)) return url.trim();
  }
  return DEFAULT_BRAND_LOGO;
};

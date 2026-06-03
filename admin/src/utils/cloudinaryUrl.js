/** Old Cloudinary accounts — images return 401 after account change */
const LEGACY_CLOUD_NAMES = ["dhqcwkpzp", "ahossain"];

export const CLOUDINARY_PLACEHOLDER = "/favicon-transparent.png";

/**
 * Returns a safe image URL for <img src>. Blocks legacy cloud URLs so the browser
 * does not request files that always return 401.
 */
export function resolveCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return trimmed;

  const lower = trimmed.toLowerCase();
  const isLegacy = LEGACY_CLOUD_NAMES.some((cloud) =>
    lower.includes(`res.cloudinary.com/${cloud}/`)
  );

  if (isLegacy) return null;
  return trimmed;
}

export function isLegacyCloudinaryUrl(url) {
  return resolveCloudinaryUrl(url) === null && !!url;
}

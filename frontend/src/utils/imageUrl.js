/**
 * Optimizes Cloudinary and remote image URLs for web performance and crisp rendering.
 * Prevents mobile downsampling aliasing/moire by requesting appropriate resolution.
 */
export function optimizeImageUrl(url, width = 480) {
  if (!url || typeof url !== "string") return url || "";
  const trimmed = url.trim();

  // Handle Cloudinary URLs
  const marker = "/image/upload/";
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return trimmed;

  const prefix = trimmed.substring(0, idx + marker.length);
  let rest = trimmed.substring(idx + marker.length);

  // If there are existing transformations before the version or filename, strip them
  const firstSlash = rest.indexOf("/");
  if (firstSlash !== -1) {
    const segment = rest.substring(0, firstSlash);
    // If this segment is a transformation (not a version v\d+ and not the file itself)
    if (!/^v\d+$/.test(segment) && (segment.includes("_") || segment.includes(","))) {
      rest = rest.substring(firstSlash + 1);
    }
  }

  return `${prefix}f_auto,w_${width}/${rest}`;
}

/**
 * Returns a responsive srcset string for Cloudinary images.
 */
export function getImageSrcSet(url, widths = [360, 480, 720]) {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return "";
  }
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(", ");
}

export default optimizeImageUrl;


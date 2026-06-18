/** Shared RASA brand asset URLs (emails, push, invoices). */
const storeBase = (process.env.STORE_URL || "https://rasastore.com").replace(/\/$/, "");

const DEFAULT_LOGO_URL =
  process.env.BRAND_LOGO_URL || `${storeBase}/rasaLogo.png`;

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "rasa";

module.exports = {
  DEFAULT_LOGO_URL,
  CLOUDINARY_FOLDER,
  storeBase,
};

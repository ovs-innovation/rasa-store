/**
 * Creates unsigned Cloudinary upload preset on dse9adftu (run once).
 * Usage: node script/ensureCloudinaryPreset.js
 */
require("../config/env");
const cloudinary = require("cloudinary").v2;

const PRESET_NAME =
  process.env.CLOUDINARY_UPLOAD_PRESET ||
  "E-COMMERCE_INFORMATIVE_CLOUDINARY_UPLOAD_PRESET";

async function main() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    await cloudinary.api.create_upload_preset({
      name: PRESET_NAME,
      unsigned: true,
      folder: "farmacykart",
    });
    console.log(`Created upload preset: ${PRESET_NAME}`);
  } catch (err) {
    if (err?.error?.message?.includes("already exists")) {
      console.log(`Preset already exists: ${PRESET_NAME}`);
      return;
    }
    console.error("Failed:", err?.error?.message || err.message);
    process.exit(1);
  }
}

main();

/**
 * Sets Farmacykart logo on store settings (after legacy URL cleanup).
 * Usage: node script/applyBrandLogo.js
 */
require("../config/env");
const mongoose = require("mongoose");
const Setting = require("../models/Setting");

const BRAND_LOGO =
  process.env.BRAND_LOGO_URL ||
  "https://res.cloudinary.com/dse9adftu/image/upload/v1780479335/farmacykart/brand/logo.png";

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const doc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (!doc?.setting) {
    console.error("storeCustomizationSetting not found");
    process.exit(1);
  }

  const s = doc.setting;
  if (!s.navbar) s.navbar = {};
  if (!s.seo) s.seo = {};
  if (!s.footer) s.footer = {};

  s.navbar.logo = BRAND_LOGO;
  s.seo.favicon = BRAND_LOGO;
  s.footer.block4_logo = BRAND_LOGO;

  doc.markModified("setting");
  await doc.save();

  const global = await Setting.findOne({ name: "globalSetting" });
  if (global?.setting) {
    global.setting.logo = BRAND_LOGO;
    global.markModified("setting");
    await global.save();
    console.log("globalSetting.logo updated");
  }

  console.log("Done. Website logo:", BRAND_LOGO);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

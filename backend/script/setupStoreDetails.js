/**
 * Updates default address, email, and phone contact details in MongoDB.
 * Run: node backend/script/setupStoreDetails.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const STORE_NAME = "RASA";
const COMPANY_NAME = "Rachana Dharmesh Kelawala";
const ADDRESS = "Bangalore, Karnataka, 570037";
const POST_CODE = "570037";
const EMAIL = "workwithrasa@gmail.com";
const PHONE = "+91 9731308713";
const WEBSITE = "rasastore.com";

const run = async () => {
  await connectDB();

  console.log("Updating global settings...");
  let globalSet = await Setting.findOne({ name: "globalSetting" });
  if (globalSet) {
    globalSet.setting = {
      ...globalSet.setting,
      shop_name: STORE_NAME,
      company_name: COMPANY_NAME,
      address: ADDRESS,
      post_code: POST_CODE,
      email: EMAIL,
      website: WEBSITE,
      contact: PHONE,
      from_email: EMAIL
    };
    globalSet.markModified("setting");
    await globalSet.save();
    console.log("✅ Updated globalSetting.");
  } else {
    console.warn("globalSetting document not found.");
  }

  console.log("Updating store customization settings (Contact Page)...");
  let customSet = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (customSet) {
    const contactUs = customSet.setting?.contact_us || {};
    const footer = customSet.setting?.footer || {};

    customSet.setting = {
      ...customSet.setting,
      contact_us: {
        ...contactUs,
        email_box_email: { en: EMAIL },
        call_box_phone: { en: PHONE },
        address_box_address_one: { en: COMPANY_NAME },
        address_box_address_two: { en: ADDRESS },
        address_box_address_three: { en: "Pincode: 570037" }
      },
      footer: {
        ...footer,
        email: EMAIL,
        phone: PHONE,
        address: ADDRESS
      }
    };
    customSet.markModified("setting");
    await customSet.save();
    console.log("✅ Updated storeCustomizationSetting.");
  } else {
    console.warn("storeCustomizationSetting document not found.");
  }

  await mongoose.connection.close();
  console.log("Store details update complete.");
};

run().catch(err => {
  console.error("Failed to update store details:", err);
  process.exit(1);
});

require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();

  console.log("Updating global settings with GSTIN and Signature...");
  let globalSet = await Setting.findOne({ name: "globalSetting" });
  if (globalSet) {
    globalSet.setting = {
      ...globalSet.setting,
      company_name: "RASA Store Pvt Ltd",
      address: "Plot No. 12, Sector 4, Ghaziabad, Uttar Pradesh, 201012",
      email: "contact@rasastore.com",
      website: "rasastore.com",
      contact: "+91 98765 43210",
      gstin: "09AAZCA5886C1ZV",
      authorized_signatory: "For RASA Store Pvt Ltd",
      cin: "U74999UP2026PTC123456",
      dl_number: "UP14200002337"
    };
    globalSet.markModified("setting");
    await globalSet.save();
    console.log("✅ Updated globalSetting with GST and Signature.");
  } else {
    console.warn("globalSetting document not found.");
  }

  await mongoose.connection.close();
  console.log("Invoice settings update complete.");
};

run().catch(err => {
  console.error("Failed to update invoice settings:", err);
  process.exit(1);
});

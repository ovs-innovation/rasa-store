/**
 * Removes B2B wholesaler fields from all customers.
 * Usage: node backend/script/migrateRemoveB2BCustomerFields.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Customer = require("../models/Customer");

const UNSET_FIELDS = {
  role: "",
  aadhar: "",
  pan: "",
  gst: "",
  gstPublicId: "",
  drugLicense: "",
  drugLicensePublicId: "",
  aadharPublicId: "",
  aadharDeleteToken: "",
  panPublicId: "",
  panDeleteToken: "",
  gstNotRequired: "",
  gstDeleteToken: "",
  drugLicenseNotRequired: "",
  hasShop: "",
  shopName: "",
  gstNumber: "",
  drugLicenseNumber: "",
  shopImageUrl: "",
  shopImagePublicId: "",
  shopImageDeleteToken: "",
  businessDocUrl: "",
  businessDocPublicId: "",
  businessDocDeleteToken: "",
  drugLicenseDeleteToken: "",
  wholesalerStatus: "",
  credentialEmailCount: "",
  lastCredentialEmailSentAt: "",
};

const run = async () => {
  await connectDB();

  const wholesalerCount = await Customer.countDocuments({ role: "wholesaler" });
  console.log(`Found ${wholesalerCount} wholesaler role documents (will be normalized).`);

  const result = await Customer.updateMany({}, { $unset: UNSET_FIELDS });
  console.log(`Updated ${result.nModified ?? result.modifiedCount} customer documents.`);

  await mongoose.connection.close();
  console.log("Done. B2B customer fields removed.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

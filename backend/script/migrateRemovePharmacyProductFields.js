/**
 * Removes pharmacy/B2B fields from all products.
 * Usage: node backend/script/migrateRemovePharmacyProductFields.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");

const UNSET_FIELDS = {
  isWholesaler: "",
  wholePrice: "",
  minQuantity: "",
  batchNo: "",
  expDate: "",
  manufactureDate: "",
  composition: "",
  ingredients: "",
  howToUse: "",
  keyUses: "",
  safetyInformation: "",
  suitableFor: "",
};

const run = async () => {
  await connectDB();

  const result = await Product.updateMany({}, { $unset: UNSET_FIELDS });
  console.log(`Updated ${result.nModified ?? result.modifiedCount} product documents.`);

  await mongoose.connection.close();
  console.log("Done. Pharmacy/B2B product fields removed.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

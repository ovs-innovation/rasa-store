/**
 * Resets categories collection to RASA fashion taxonomy.
 *
 * Usage (from repo root):
 *   node backend/script/migrateRasaCategories.js
 *
 * WARNING: Deletes ALL existing categories. Run only when intentional.
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Category = require("../models/Category");
const rasaCategories = require("../utils/rasaCategories");

const run = async () => {
  await connectDB();

  const deleted = await Category.deleteMany({});
  console.log(`Removed ${deleted.deletedCount} legacy categories.`);

  const inserted = await Category.insertMany(
    rasaCategories.map(({ _id, ...rest }) => rest)
  );
  console.log(`Inserted ${inserted.length} RASA categories:`);
  inserted.forEach((c) => console.log(`  - ${c.name?.en || c.name}`));

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Sets up the production super admin account and cleans up old development admin accounts.
 * Run: node backend/script/setupAdminCredentials.js
 */
require("../config/env");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const Admin = require("../models/Admin");

const NEW_ADMIN_EMAIL = "admin@rasastore.com";
const NEW_ADMIN_PASSWORD = "RasaStoreSecure2026!";

const access_list = [
  "dashboard",
  "products",
  "product",
  "categories",
  "attributes",
  "coupons",
  "orders",
  "order",
  "customers",
  "faqs",
  "push-notification",
  "reviews",
  "testimonials",
  "our-staff",
  "settings",
  "languages",
  "currencies",
  "store",
  "customization",
  "store-settings",
  "notifications",
  "edit-profile",
  "coming-soon",
  "customer-order",
];

const run = async () => {
  await connectDB();

  console.log("Checking if new super admin exists...");
  let admin = await Admin.findOne({ email: NEW_ADMIN_EMAIL });

  if (admin) {
    console.log(`New super admin already exists. Updating password and permissions...`);
    admin.password = bcrypt.hashSync(NEW_ADMIN_PASSWORD, 10);
    admin.role = "Super Admin";
    admin.status = "Active";
    admin.access_list = access_list;
    await admin.save();
    console.log(`✅ Production Admin updated: ${NEW_ADMIN_EMAIL}`);
  } else {
    console.log(`Creating new super admin...`);
    admin = new Admin({
      name: { en: "Super Admin" },
      email: NEW_ADMIN_EMAIL,
      password: bcrypt.hashSync(NEW_ADMIN_PASSWORD, 10),
      phone: "1234567890",
      role: "Super Admin",
      status: "Active",
      joiningDate: new Date(),
      access_list: access_list
    });
    await admin.save();
    console.log(`✅ Production Admin created: ${NEW_ADMIN_EMAIL}`);
  }

  // Deleting or disabling other developer admin accounts
  console.log("Cleaning up old development/admin accounts...");
  const deleteResult = await Admin.deleteMany({ email: { $ne: NEW_ADMIN_EMAIL } });
  console.log(`✅ Removed ${deleteResult.deletedCount} old development accounts.`);

  await mongoose.connection.close();
  console.log("Admin setup complete.");
};

run().catch(err => {
  console.error("Admin setup failed:", err);
  process.exit(1);
});

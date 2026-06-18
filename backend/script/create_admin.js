const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Admin = require("../models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB...");

    const email = "info@ovsinnovation.com";
    const password = "Admin@123";

    let admin = await Admin.findOne({ email });
    if (admin) {
      admin.password = bcrypt.hashSync(password);
      admin.role = "Super Admin";
      admin.status = "Active";
      admin.access_list = [
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
      await admin.save();
      console.log("Admin user info@ovsinnovation.com updated with password Ovsinnovation@123");
    } else {
      admin = new Admin({
        name: { en: "Super Admin" },
        email,
        password: bcrypt.hashSync(password),
        phone: "1234567890",
        role: "Super Admin",
        status: "Active",
        joiningDate: new Date(),
        access_list: [
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
        ]
      });
      await admin.save();
      console.log("Admin user info@ovsinnovation.com created with password Ovsinnovation@123");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();

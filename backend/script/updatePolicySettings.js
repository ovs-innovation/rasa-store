require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const run = async () => {
  await connectDB();

  console.log("Updating policy settings...");
  let customSet = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (customSet) {
    if (!customSet.setting) customSet.setting = {};

    // 1. Privacy Policy
    customSet.setting.privacy_policy = {
      title: { en: "Privacy Policy" },
      description: { en: `<h2>1. Introduction</h2>
<p>Welcome to RASA. We are committed to protecting your privacy and ensuring the security of your personal data.</p>
<h2>2. Information We Collect</h2>
<ul>
  <li><strong>Personal Details:</strong> Name, contact number, email, and delivery address.</li>
  <li><strong>Account Information:</strong> Profile preferences, order history, and sizing options.</li>
  <li><strong>Payment Data:</strong> Securely processed via trusted payment gateways (we do not store card details).</li>
</ul>
<h2>3. How We Use Your Data</h2>
<ul>
  <li>To process and deliver your sneakers, bags, and accessory orders.</li>
  <li>To optimize your website experience, sizing recommendations, and cart retention.</li>
  <li>To send order updates and promotional offers (opt-out available).</li>
</ul>
<h2>4. Data Security & Sharing</h2>
<p>Your data is encrypted and stored securely. We share necessary details (like address and phone number) only with verified logistics and delivery partners. We do not sell your data to third parties.</p>
<h2>5. Your Rights</h2>
<p>Under the DPDP Act (India) and standard privacy regulations, you have the right to access, correct, or request the deletion of your data. Contact our support team for any privacy concerns.</p>` }
    };

    // 2. Refund Policy
    customSet.setting.refund_policy = {
      title: { en: "Refund & Return Policy" },
      description: { en: `<h2>1. Returns & Exchange Eligibility</h2>
<p>We offer a 7-day return and exchange policy for all items that are in their original, unworn condition with tags and packaging intact.</p>
<h2>2. Non-Returnable Items</h2>
<p>Due to safety and authenticity checks, items showing signs of wear, crease marks, dirt, or missing original brand packaging (including sneaker boxes, dust bags, and tags) cannot be returned or exchanged.</p>
<h2>3. Authentication Check</h2>
<p>Every return undergoes a strict physical verification check by our curators to ensure the returned item is authentic and in its original shipped state.</p>
<h2>4. Refunds</h2>
<p>Once your return is verified and approved, refunds are processed within 5-7 business days to your original payment method or as store credit, per your choice.</p>` }
    };

    // 3. Shipping Policy
    customSet.setting.shipping_policy = {
      title: { en: "Shipping & Delivery Policy" },
      description: { en: `<h2>1. Order Processing</h2>
<p>Orders are processed and verified within 24-48 hours. The verification step includes a final inspection of items for quality and packaging integrity.</p>
<h2>2. Shipping Charges</h2>
<p>We provide complimentary express shipping across India for all prepaid orders. Cod orders are subject to a nominal fee as displayed at checkout.</p>
<h2>3. Delivery Timeline</h2>
<p>Standard delivery takes 3 to 5 business days for metro cities, and 5 to 7 business days for other locations. You will receive a tracking link via email as soon as the order is dispatched.</p>
<h2>4. Damage in Transit</h2>
<p>In the rare event that your package is damaged during shipping, please contact us immediately with photo evidence within 24 hours of delivery.</p>` }
    };

    // 4. Terms & Conditions
    customSet.setting.terms_conditions = {
      title: { en: "Terms & Conditions" },
      description: { en: `<h2>1. Agreement to Terms</h2>
<p>By accessing or using the RASA platform, you agree to be bound by these terms. If you do not agree, please do not use our services.</p>
<h2>2. Product Representation</h2>
<p>We strive to display our products, colors, and sizing as accurately as possible. However, actual colors may vary slightly depending on your screen settings.</p>
<h2>3. Authentication Guarantee</h2>
<p>RASA guarantees the authenticity of all sneakers, bags, and accessories sold. Every product is carefully curated and verified prior to shipping.</p>
<h2>4. Limitation of Liability</h2>
<p>RASA shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the website or purchased products.</p>` }
    };

    customSet.markModified("setting");
    await customSet.save();
    console.log("✅ Updated storeCustomizationSetting policies.");
  } else {
    console.warn("storeCustomizationSetting document not found.");
  }

  await mongoose.connection.close();
  console.log("Policy settings update complete.");
};

run().catch(err => {
  console.error("Failed to update policy settings:", err);
  process.exit(1);
});

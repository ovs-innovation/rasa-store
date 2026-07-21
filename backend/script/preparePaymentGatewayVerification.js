/**
 * Prepares store for Razorpay / payment gateway website verification.
 * Run: node backend/script/preparePaymentGatewayVerification.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const BUSINESS = {
  legalName: "Rachana Dharmesh Kelawala",
  brandName: "RASA",
  address: "Bangalore, Karnataka, India",
  pincode: "570037",
  fullAddress: "Bangalore, Karnataka, India - 570037",
  email: "workwithrasa@gmail.com",
  phone: "+91 9731308713",
  whatsapp: "9731308713",
  website: "rasastore.com",
  supportHours: "Monday to Saturday, 10:00 AM – 7:00 PM IST",
};

const CONTACT_BLOCK = `
<h2>Contact Us</h2>
<p><strong>Business Name:</strong> ${BUSINESS.legalName}</p>
<p><strong>Address:</strong> ${BUSINESS.fullAddress}</p>
<p><strong>Email:</strong> <a href="mailto:${BUSINESS.email}">${BUSINESS.email}</a></p>
<p><strong>Phone / WhatsApp:</strong> ${BUSINESS.phone}</p>
<p><strong>Support Hours:</strong> ${BUSINESS.supportHours}</p>`;

const PRIVACY_POLICY = `<p>We value your privacy and are committed to protecting your personal information collected through ${BUSINESS.brandName} Store.</p>
<h2>Information We Collect</h2>
<ul>
  <li>Name, phone number, and email address</li>
  <li>Shipping and billing address</li>
  <li>Order and payment details (processed securely via payment gateway)</li>
  <li>Device and browsing information for website functionality</li>
</ul>
<h2>How We Use Your Information</h2>
<ul>
  <li>To process, ship, and deliver your orders</li>
  <li>To send order confirmations, tracking updates, and customer support responses</li>
  <li>To improve our products, services, and website experience</li>
  <li>To comply with applicable legal and regulatory requirements</li>
</ul>
<h2>Data Security</h2>
<p>We implement reasonable technical and organizational measures to protect your personal data from unauthorized access, misuse, or disclosure. Payment information is processed through secure, PCI-compliant payment gateways and is not stored on our servers.</p>
<h2>Third-Party Services</h2>
<p>We may share necessary information with trusted logistics partners, payment processors, and service providers solely for order fulfillment and operational purposes. We do not sell customer data to third parties.</p>
<h2>Your Rights</h2>
<p>You may contact us to request access, correction, or deletion of your personal data, subject to applicable law.</p>
${CONTACT_BLOCK}`;

const TERMS_POLICY = `<p>By accessing and using the ${BUSINESS.brandName} Store website, you agree to these Terms and Conditions.</p>
<h2>1. Business Information</h2>
<p>This website is operated by <strong>${BUSINESS.legalName}</strong>, located at ${BUSINESS.fullAddress}.</p>
<h2>2. Products & Pricing</h2>
<p>All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices and availability are subject to change without prior notice.</p>
<h2>3. Orders & Payments</h2>
<p>By placing an order, you confirm that all information provided is accurate. We reserve the right to accept, reject, or cancel any order. Payments are processed securely through authorized payment gateways.</p>
<h2>4. Shipping & Delivery</h2>
<p>Delivery timelines are estimates and may vary based on location and courier operations. Please refer to our <a href="/shipping-delivery-policy">Shipping & Delivery Policy</a> for details.</p>
<h2>5. Cancellations</h2>
<p>Orders may be cancelled within 24 hours of placement or before the order is shipped, whichever is earlier. To request cancellation, contact us via WhatsApp or email with your Order ID.</p>
<h2>6. Returns, Refunds & Exchanges</h2>
<p>Returns, refunds, and exchanges are governed by our <a href="/return-refund-policy">Return & Exchange Policy</a>.</p>
<h2>7. Limitation of Liability</h2>
<p>We are not liable for delays caused by courier partners, natural events, or circumstances beyond our reasonable control.</p>
${CONTACT_BLOCK}`;

const REFUND_RETURN_POLICY = `<h2>1. Order Cancellation</h2>
<p>You may cancel your order within <strong>24 hours of placement</strong> or before it is shipped from our warehouse, whichever is earlier.</p>
<ul>
  <li>Contact us on WhatsApp at ${BUSINESS.phone} or email ${BUSINESS.email} with your Order ID.</li>
  <li>Once an order is shipped, cancellation is not possible — exchange rules below may apply.</li>
</ul>
<h2>2. Refund Policy</h2>
<p>Approved refunds are processed within <strong>5–7 business days</strong> to the original payment method used at checkout.</p>
<ul>
  <li>Refund requests must include a valid Order ID and reason for the request.</li>
  <li>Refunds for cancelled orders (before shipment) are processed within 5–7 business days.</li>
  <li>Bank or payment gateway processing times may add 2–3 additional business days.</li>
</ul>
<h2>3. Return & Exchange Policy</h2>
<p>We do not offer returns, refunds, or exchanges for change of mind, sizing preferences, or personal taste.</p>
<p>Exchanges will only be considered if:</p>
<ul>
  <li>You receive the wrong item</li>
  <li>The item is damaged on delivery</li>
  <li>The sizing delivered is incorrect</li>
</ul>
<h2>4. Unboxing Video Requirement</h2>
<p>A clear, continuous unboxing video is mandatory for all damage/wrong-item claims. The video must show the sealed package being opened from start to finish in a single recording.</p>
<ul>
  <li>Claims must be reported within <strong>3 days of delivery</strong></li>
  <li>Edited, cut, or pre-opened package videos will be rejected</li>
</ul>
<h2>5. Exchange Processing</h2>
<p>If a claim is approved, the product will be exchanged for the same model only. All claims are subject to verification by our team.</p>
<p>Exchange/Replacement deliveries will be done within <strong>5–7 business days</strong>.</p>
${CONTACT_BLOCK}`;

const SHIPPING_POLICY = `<p>We deliver across India through trusted courier partners.</p>
<h2>1. Order Processing</h2>
<p>Orders are processed within <strong>2–4 business days</strong> after successful payment confirmation.</p>
<h2>2. Estimated Delivery</h2>
<ul>
  <li>Metro cities: 5–7 business days after dispatch</li>
  <li>Other locations: 7–14 business days after dispatch</li>
  <li>Remote areas may take up to 3 weeks depending on courier coverage</li>
</ul>
<h2>3. Shipping Charges</h2>
<p>Shipping charges (if applicable) are displayed at checkout before payment.</p>
<h2>4. Tracking</h2>
<p>Tracking details are shared via WhatsApp and/or email once your order is dispatched.</p>
<h2>5. Delivery Issues</h2>
<p>Please ensure your shipping address and pincode are correct at checkout. For delivery delays or issues, contact us with your Order ID.</p>
${CONTACT_BLOCK}`;

const run = async () => {
  await connectDB();

  console.log("Updating global settings for payment verification...");
  const globalSet = await Setting.findOne({ name: "globalSetting" });
  if (globalSet) {
    globalSet.setting = {
      ...globalSet.setting,
      shop_name: BUSINESS.brandName,
      company_name: BUSINESS.legalName,
      business_name: BUSINESS.legalName,
      address: BUSINESS.fullAddress,
      post_code: BUSINESS.pincode,
      email: BUSINESS.email,
      contact: BUSINESS.phone,
      from_email: BUSINESS.email,
      website: BUSINESS.website,
    };
    globalSet.markModified("setting");
    await globalSet.save();
    console.log("  ✅ globalSetting");
  }

  console.log("Updating store policies...");
  const customSet = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (customSet) {
    const setting = customSet.setting || {};

    customSet.setting = {
      ...setting,
      navbar: {
        ...(setting.navbar || {}),
        term_and_condition_status: true,
        privacy_policy_status: true,
        contact_menu_status: true,
        about_menu_status: true,
      },
      contact_us: {
        ...(setting.contact_us || {}),
        header_status: true,
        email_box_status: true,
        call_box_status: true,
        address_box_status: true,
        email_box_email: { en: BUSINESS.email },
        call_box_phone: { en: BUSINESS.whatsapp },
        address_box_address_one: { en: BUSINESS.legalName },
        address_box_address_two: { en: BUSINESS.address },
        address_box_address_three: { en: `Pincode: ${BUSINESS.pincode}` },
      },
      footer: {
        ...(setting.footer || {}),
        email: BUSINESS.email,
        phone: BUSINESS.whatsapp,
        address: BUSINESS.fullAddress,
      },
      privacy_policy: {
        status: true,
        title: { en: "Privacy Policy" },
        description: { en: PRIVACY_POLICY },
      },
      term_and_condition: {
        status: true,
        title: { en: "Terms & Conditions" },
        description: { en: TERMS_POLICY },
      },
      refund_return_policy: {
        status: true,
        title: { en: "Return & Exchange Policy" },
        description: { en: REFUND_RETURN_POLICY },
      },
      shipping_delivery_policy: {
        status: true,
        title: { en: "Shipping & Delivery Policy" },
        description: {
          ...(setting.shipping_delivery_policy?.description || {}),
          en: SHIPPING_POLICY,
        },
      },
    };

    customSet.markModified("setting");
    await customSet.save();
    console.log("  ✅ storeCustomizationSetting (all policies enabled)");
  }

  await mongoose.connection.close();
  console.log("Payment gateway verification prep complete.");
  console.log("\nPolicy URLs for Razorpay dashboard:");
  console.log("  Privacy Policy:        /privacy-policy");
  console.log("  Terms & Conditions:    /terms-and-conditions");
  console.log("  Return & Exchange:     /return-refund-policy");
  console.log("  Shipping Policy:       /shipping-delivery-policy");
  console.log("  Contact Us:            /contact-us");
  console.log("  About Us:              /about-us");
};

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

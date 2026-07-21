/**
 * One-time client updates: hero image, store details, policies, product prices.
 * Run: node backend/script/applyClientUpdates.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");
require("../models/Product");

const STORE_NAME = "RASA";
const COMPANY_NAME = "Rachana Dharmesh Kelawala";
const ADDRESS = "Bangalore, Karnataka, 570037";
const POST_CODE = "570037";
const EMAIL = "workwithrasa@gmail.com";
const PHONE = "+91 9731308713";

const RETURN_POLICY_HTML = `<p>We do not offer returns, refunds, or exchanges for change of mind, sizing concerns, or personal preferences.</p>
<p>Exchanges will only be considered if:</p>
<ul>
  <li>You receive the wrong item</li>
  <li>The item is damaged</li>
  <li>The sizing is wrong</li>
</ul>
<p>If this is the case, an unboxing video is mandatory.</p>
<p><strong>Important Unboxing Instructions</strong></p>
<p>A clear, continuous unboxing video is mandatory for all claims. The video must show the sealed package being opened from start to finish in a single recording.</p>
<ul>
  <li>Claims must be reported within 3 days of delivery</li>
  <li>Requests without a valid unboxing video will not be accepted</li>
  <li>Edited, cut, or pre-opened package videos will be rejected</li>
</ul>
<p>If a claim is approved, the product will be exchanged only for the same model. No refunds or exchanges for different products will be provided.</p>
<p>All claims are subject to verification and approval by our team.</p>`;

const randomPrice = (index) => {
  const prices = [1299, 1499, 1599, 1699, 1799, 1899, 1999, 1399, 1199, 1649];
  return prices[index % prices.length];
};

const run = async () => {
  await connectDB();
  const Product = mongoose.model("Product");

  console.log("1. Updating global settings...");
  const globalSet = await Setting.findOne({ name: "globalSetting" });
  if (globalSet) {
    globalSet.setting = {
      ...globalSet.setting,
      shop_name: STORE_NAME,
      company_name: COMPANY_NAME,
      business_name: COMPANY_NAME,
      address: ADDRESS,
      post_code: POST_CODE,
      email: EMAIL,
      contact: PHONE,
      from_email: EMAIL,
    };
    globalSet.markModified("setting");
    await globalSet.save();
    console.log("   ✅ globalSetting updated");
  }

  console.log("2. Updating store customization (policies + contact + hero)...");
  const customSet = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (customSet) {
    const setting = customSet.setting || {};
    const rasaHomepage = setting.rasaHomepage || {};
    const heroSlides = Array.isArray(rasaHomepage.heroSlides) ? [...rasaHomepage.heroSlides] : [];

    const updatedHeroSlides = heroSlides.map((slide) => {
      if (!slide || isBagSlide(slide)) return slide;
      return {
        ...slide,
        type: slide.type || "footwear",
        image: "/shoes3.png",
      };
    });

    if (updatedHeroSlides.length === 0) {
      updatedHeroSlides.push({
        type: "footwear",
        title: "Fresh Drops",
        subtitle: "Fresh Drops",
        description: "Affordable sneakers and streetwear — curated picks, delivered to your door.",
        image: "/shoes3.png",
        link: "/search?category=footwear",
        brand: "Rasa",
      });
    }

    customSet.setting = {
      ...setting,
      rasaHomepage: {
        ...rasaHomepage,
        heroSlides: updatedHeroSlides,
      },
      contact_us: {
        ...(setting.contact_us || {}),
        email_box_email: { en: EMAIL },
        call_box_phone: { en: PHONE },
        address_box_address_one: { en: COMPANY_NAME },
        address_box_address_two: { en: ADDRESS },
        address_box_address_three: { en: "Pincode: 570037" },
      },
      footer: {
        ...(setting.footer || {}),
        email: EMAIL,
        phone: PHONE,
        address: ADDRESS,
      },
      refund_return_policy: {
        status: true,
        title: { en: "Return & Exchange Policy" },
        description: { en: RETURN_POLICY_HTML },
      },
      term_and_condition: {
        ...(setting.term_and_condition || {}),
        description: {
          ...(setting.term_and_condition?.description || {}),
          en: `${setting.term_and_condition?.description?.en || ""}<h2>5. Returns & Exchanges</h2><p>Returns and exchanges are subject to our <a href="/return-refund-policy">Return & Exchange Policy</a>.</p>`,
        },
      },
    };
    customSet.markModified("setting");
    await customSet.save();
    console.log("   ✅ storeCustomizationSetting updated");
  }

  console.log("3. Updating product prices to ₹1000–2000 range...");
  const products = await Product.find({});
  let updatedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const sellingPrice = randomPrice(i);
    const mrp = sellingPrice + 200;

    product.prices = {
      ...(product.prices || {}),
      price: sellingPrice,
      originalPrice: mrp,
      salePrice: 0,
      discount: mrp - sellingPrice,
      discountType: "flat",
    };

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      product.variants = product.variants.map((variant, vi) => {
        const variantPrice = randomPrice(i + vi + 1);
        const variantMrp = variantPrice + 200;
        return {
          ...variant,
          price: variantPrice,
          originalPrice: variantMrp,
          discount: variantMrp - variantPrice,
          prices: {
            ...(variant.prices || {}),
            price: variantPrice,
            originalPrice: variantMrp,
            salePrice: 0,
            discount: variantMrp - variantPrice,
            discountType: "flat",
          },
        };
      });
    }

    product.markModified("variants");
    product.markModified("prices");
    await product.save();
    updatedCount++;
  }

  console.log(`   ✅ Updated ${updatedCount} products`);

  await mongoose.connection.close();
  console.log("All client updates applied successfully.");
};

function isBagSlide(slide = {}) {
  return (
    slide?.type === "bags" ||
    /bag|duffle|backpack/i.test(
      `${slide.title || ""} ${slide.subtitle || ""} ${slide.link || ""} ${slide.image || ""}`
    )
  );
}

run().catch((err) => {
  console.error("Failed to apply client updates:", err);
  process.exit(1);
});

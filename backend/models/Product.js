const mongoose = require("mongoose");

const keyValueItemSchema = new mongoose.Schema({
  key: { type: String, required: false },
  value: { type: String, required: false },
}, { _id: false });

const paragraphSectionSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  icon: { type: String, required: false },
  title: { type: String, required: false },
  description: { type: String, required: false },
}, { _id: false });

const listSectionSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  icon: { type: String, required: false },
  title: { type: String, required: false },
  items: { type: [keyValueItemSchema], default: [] },
}, { _id: false });

const highlightSectionSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  icon: { type: String, required: false },
  title: { type: String, required: false },
  items: { type: [String], default: [] },
}, { _id: false });

const additionalInformationSubsectionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  items: { type: [String], default: [] },
}, { _id: false });

const additionalInformationSectionSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  icon: { type: String, required: false },
  title: { type: String, required: false },
  subsections: { type: [additionalInformationSubsectionSchema], default: [] },
}, { _id: false });

const subsectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    type: {
      type: String,
      enum: ["keyValue", "paragraph"],
      default: "keyValue",
    },
    key: { type: String, required: false },
    value: { type: String, required: false },
    content: { type: String, required: false },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const dynamicSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
     isVisible: { type: Boolean, default: true },
    subsections: {
      type: [subsectionSchema],
      default: [],
    },
  },
  { _id: false }
);

const mediaSubsectionSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    details: { type: String, required: true },
  },
  { _id: false }
);

const mediaSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    isVisible: { type: Boolean, default: true },
    items: {
      type: [mediaSubsectionSchema],
      default: [],
    },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answerType: {
      type: String,
      enum: ["yes", "no", "custom"],
      default: "yes",
    },
    answer: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: false,
    },
    sku: {
      type: String,
      required: false,
    },
    barcode: {
      type: String,
      required: false,
    },
    title: {
      type: Object,
      required: true,
    },
    description: {
      type: Object,
      required: false,
    },
    highlights: {
      type: Object,
      required: false,
    },
    faqTitle: {
      type: String,
      default: "",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    hsnCode: {
      type: String,
      default: "",
      trim: true,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    isPriceInclusive: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: false,
    },
    // RASA: Men | Women | Unisex
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", ""],
      default: "",
      trim: true,
    },
    // RASA: Sneakers | Bags | Slides | Accessories
    productType: {
      type: String,
      enum: ["Sneakers", "Bags", "Slides", "Heels", "Accessories", ""],
      default: "",
      trim: true,
    },
    // SEO fields
    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },
    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
    seoImage: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: Array,
      required: false,
    },
    featuredImage: {
      type: String,
      default: "",
    },
    hoverImage: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    stock: {
      type: Number,
      required: false,
      min: [0, "Stock cannot be negative"],
    },

    sales: {
      type: Number,
      required: false,
      default: 0,
      min: [0, "Sales cannot be negative"],
    },

    tag: [String],
    prices: {
      originalPrice: {
        type: Number,
        required: true,
        min: [0, "Original price cannot be negative"],
      },
      price: {
        type: Number,
        required: true,
        min: [0, "Sale price cannot be negative"],
      },
      salePrice: {
        type: Number,
        required: false,
        default: 0,
        min: [0, "Sale price cannot be negative"],
      },
      discount: {
        type: Number,
        required: false,
        default: 0,
        min: [0, "Discount cannot be negative"],
      },
    },
    variants: [{}],
    variantFilters: {
      type: [
        {
          sku: { type: String },
          barcode: { type: String },
          combinationLabel: { type: String },
          attributes: { type: Object, default: {} },
          originalPrice: { type: Number, min: [0, "Original price cannot be negative"] },
          price: { type: Number, min: [0, "Sale price cannot be negative"] },
          quantity: { type: Number, min: [0, "Quantity cannot be negative"] },
        },
      ],
      default: [],
    },
    isCombination: {
      type: Boolean,
      required: true,
    },

    status: {
      type: String,
      default: "show",
    },
    lowStockAlert: {
      type: Number,
      default: 5,
    },

    productDescription: { type: paragraphSectionSchema, default: {} },
    productHighlights: { type: highlightSectionSchema, default: {} },
    manufacturerDetails: { type: highlightSectionSchema, default: {} },
    disclaimer: { type: paragraphSectionSchema, default: {} },
    additionalInformation: { type: additionalInformationSectionSchema, default: {} },

    dynamicSections: {
      type: [dynamicSectionSchema],
      default: [],
    },
    mediaSections: {
      type: [mediaSectionSchema],
      default: [],
    },
    // Rating aggregates for storefront
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    faqs: { type: listSectionSchema, default: {} },
  },
  {
    timestamps: true,
  }
);

// Indexes for recommendation performance
productSchema.index({ status: 1, sales: -1 }); // Fast sorting by sales
productSchema.index({ status: 1, category: 1 }); // Fast category lookups
productSchema.index({ status: 1, brand: 1 }); // Fast brand lookups

// module.exports = productSchema;

const Product = mongoose.model("Product", productSchema);
module.exports = Product;

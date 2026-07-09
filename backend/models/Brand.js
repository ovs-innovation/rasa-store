const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: Object,
      required: true,
    },
    description: {
      type: Object,
      default: {},
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    websiteUrl: {
      type: String,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    showOnHomepage: {
      type: Boolean,
      default: true,
    },
    shopCategories: {
      type: [String],
      enum: ["footwear", "bags"],
      default: [],
    },
    status: {
      type: String,
      enum: ["show", "hide"],
      default: "show",
    },
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;


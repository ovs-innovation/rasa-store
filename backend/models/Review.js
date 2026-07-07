const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    reply: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 3000,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    orderInvoice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per customer per product (admin reviews may omit user)
reviewSchema.index(
  { product: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $exists: true, $ne: null } },
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;



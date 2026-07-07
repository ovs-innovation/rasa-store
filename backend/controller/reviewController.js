const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Admin = require("../models/Admin");

// Helper to recompute rating aggregates for a product
const recomputeProductRating = async (productId) => {
  const objectId =
    typeof productId === "string"
      ? mongoose.Types.ObjectId(productId)
      : productId;

  const summary = await Review.aggregate([
    { $match: { product: objectId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const aggregates = summary[0] || {
    averageRating: 0,
    totalRatings: 0,
    totalReviews: 0,
  };

  await Product.findByIdAndUpdate(
    objectId,
    {
      averageRating: Number(aggregates.averageRating.toFixed(2)) || 0,
      totalRatings: aggregates.totalRatings || 0,
      totalReviews: aggregates.totalReviews || 0,
    },
    { new: true }
  );

  return aggregates;
};

// Helper to compute rating distribution and full summary
const getRatingSummary = async (productId) => {
  const objectId =
    typeof productId === "string"
      ? mongoose.Types.ObjectId(productId)
      : productId;

  const [distribution, aggregates] = await Promise.all([
    Review.aggregate([
      { $match: { product: objectId } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]),
    Review.aggregate([
      { $match: { product: objectId } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
  ]);

  const agg = aggregates[0] || {
    averageRating: 0,
    totalRatings: 0,
    totalReviews: 0,
  };

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((d) => {
    if (counts[d._id] !== undefined) counts[d._id] = d.count;
  });

  return {
    averageRating: Number(agg.averageRating?.toFixed?.(2)) || 0,
    totalRatings: agg.totalRatings || 0,
    totalReviews: agg.totalReviews || 0,
    starCounts: {
      5: counts[5],
      4: counts[4],
      3: counts[3],
      2: counts[2],
      1: counts[1],
    },
  };
};

// Check if the current user has a delivered order containing this product
const hasVerifiedPurchase = async (userId, productId) => {
  if (!userId || !productId) return { verified: false };

  const product = await Product.findById(productId);
  if (!product) return { verified: false };

  const productIdString = product._id.toString();
  const legacyProductIdString = product.productId
    ? String(product.productId)
    : null;

  const deliveredOrder = await Order.findOne({
    user: mongoose.Types.ObjectId(userId),
    status: "Delivered",
    cart: {
      $elemMatch: {
        $or: [
          { productId: productIdString },
          legacyProductIdString ? { productId: legacyProductIdString } : null,
        ].filter(Boolean),
      },
    },
  }).select("_id invoice");

  if (!deliveredOrder) {
    return { verified: false };
  }

  return {
    verified: true,
    orderId: deliveredOrder._id,
    invoice: deliveredOrder.invoice,
  };
};

const assertAdminUser = async (userId) => {
  if (!userId) return false;
  const admin = await Admin.findById(userId);
  return Boolean(
    admin && (admin.role === "Admin" || admin.role === "Super Admin")
  );
};

// POST /api/reviews/admin — admin creates a review
const adminCreateReview = async (req, res) => {
  try {
    const {
      productId,
      rating,
      reviewText,
      displayName,
      userId,
      verified,
      reply,
    } = req.body;

    const isAdmin = await assertAdminUser(req.user?._id);
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid productId is required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!reviewText || !String(reviewText).trim()) {
      return res.status(400).json({ message: "Review text is required" });
    }
    if (!displayName?.trim() && !userId) {
      return res
        .status(400)
        .json({ message: "Customer name or linked customer is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (userId) {
      const existing = await Review.findOne({ product: productId, user: userId });
      if (existing) {
        return res
          .status(400)
          .json({ message: "This customer already has a review for this product" });
      }
    }

    const review = await Review.create({
      product: productId,
      user: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
      displayName: displayName?.trim() || "",
      rating: Number(rating),
      reviewText: String(reviewText).trim(),
      verified: verified === true || verified === "true",
      reply: reply?.trim() || "",
      images: [],
    });

    await recomputeProductRating(productId);

    const populatedReview = await Review.findById(review._id)
      .populate({ path: "user", select: "name email image phone" })
      .populate({ path: "product", select: "title slug image" })
      .lean();

    res.status(201).json({
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (err) {
    console.error("adminCreateReview error:", err);
    res.status(500).json({ message: err.message || "Failed to create review" });
  }
};

// PUT /api/reviews/admin/:reviewId — admin updates a review
const adminUpdateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      rating,
      reviewText,
      displayName,
      verified,
      reply,
      productId,
    } = req.body;

    const isAdmin = await assertAdminUser(req.user?._id);
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Valid reviewId is required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (rating !== undefined) {
      const ratingNumber = Number(rating);
      if (ratingNumber < 1 || ratingNumber > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = ratingNumber;
    }

    if (reviewText !== undefined) {
      if (!String(reviewText).trim()) {
        return res.status(400).json({ message: "Review text cannot be empty" });
      }
      review.reviewText = String(reviewText).trim();
    }

    if (displayName !== undefined) {
      review.displayName = String(displayName).trim();
    }

    if (verified !== undefined) {
      review.verified = verified === true || verified === "true";
    }

    if (reply !== undefined) {
      review.reply = String(reply).trim();
    }

    if (
      productId &&
      mongoose.Types.ObjectId.isValid(productId) &&
      productId !== String(review.product)
    ) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      review.product = productId;
    }

    await review.save();

    const productIdToUpdate = review.product;
    await recomputeProductRating(productIdToUpdate);

    const populatedReview = await Review.findById(review._id)
      .populate({ path: "user", select: "name email image phone" })
      .populate({ path: "product", select: "title slug image" })
      .lean();

    res.json({
      message: "Review updated successfully",
      review: populatedReview,
    });
  } catch (err) {
    console.error("adminUpdateReview error:", err);
    res.status(500).json({ message: err.message || "Failed to update review" });
  }
};

// POST /api/reviews
const createOrUpdateReview = async (req, res) => {
  try {
    const { productId, rating, reviewText, images } = req.body;

    // Debug logging
    console.log("Review submission:", {
      productId,
      rating,
      reviewTextLength: reviewText?.length,
      hasUserId: !!req.user?._id,
      body: req.body,
    });

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        message: `Valid productId is required. Received: ${productId}` 
      });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ 
          message: `Rating must be between 1 and 5. Received: ${rating}` 
        });
    }
    if (!reviewText || typeof reviewText !== "string" || reviewText.trim() === "") {
      return res
        .status(400)
        .json({ 
          message: "Review text is required and must not be empty" 
        });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }
    const { verified = false, orderId, invoice } = await hasVerifiedPurchase(
      userId,
      productId
    );

    const existing = await Review.findOne({
      product: productId,
      user: userId,
    });

    let review;
    if (existing) {
      existing.rating = rating;
      existing.reviewText = reviewText.trim();
      existing.verified = verified;
      if (orderId) existing.order = orderId;
      if (invoice) existing.orderInvoice = invoice;
      if (Array.isArray(images)) {
        existing.images = images;
      }
      review = await existing.save();
    } else {
      review = await Review.create({
        product: productId,
        user: userId,
        rating,
        reviewText: reviewText.trim(),
        verified,
        images: Array.isArray(images) ? images : [],
        order: orderId || undefined,
        orderInvoice: invoice || undefined,
      });
    }

    await recomputeProductRating(productId);
    const ratingSummary = await getRatingSummary(productId);

    const populatedReview = await Review.findById(review._id)
      .populate({ path: "user", select: "name image" })
      .lean();

    res.status(201).json({
      review: populatedReview,
      ratingSummary,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ 
      message: err.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// GET /api/reviews/:productId
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = "newest", rating, page = 1, limit = 10 } = req.query;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send({ message: "Valid productId is required" });
    }

    const query = { product: productId };

    if (rating) {
      const ratingNumber = Number(rating);
      if (ratingNumber >= 1 && ratingNumber <= 5) {
        query.rating = ratingNumber;
      }
    }

    const sortOptions = {};
    if (sort === "helpful") {
      sortOptions.helpfulCount = -1;
      sortOptions.createdAt = -1;
    } else if (sort === "rating_high") {
      sortOptions.rating = -1;
      sortOptions.createdAt = -1;
    } else if (sort === "rating_low") {
      sortOptions.rating = 1;
      sortOptions.createdAt = -1;
    } else {
      // newest
      sortOptions.createdAt = -1;
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [total, reviews, ratingSummary] = await Promise.all([
      Review.countDocuments(query),
      Review.find(query)
        .populate({ path: "user", select: "name image" })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      getRatingSummary(productId),
    ]);

    res.send({
      reviews,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber) || 1,
      },
      ratingSummary,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// PUT /api/reviews/:reviewId/helpful
const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).send({ message: "Valid reviewId is required" });
    }

    const userId = req.user && req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).send({ message: "Review not found" });
    }

    const alreadyMarked = review.helpfulByUsers.some(
      (id) => id.toString() === String(userId)
    );
    if (alreadyMarked) {
      return res.send({ review, message: "Already marked as helpful" });
    }

    review.helpfulByUsers.push(userId);
    review.helpfulCount += 1;
    await review.save();

    const populatedReview = await Review.findById(reviewId)
      .populate({ path: "user", select: "name image" })
      .lean();

    res.send({ review: populatedReview });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// DELETE /api/reviews/:reviewId
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).send({ message: "Valid reviewId is required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).send({ message: "Review not found" });
    }

    const userId = req.user && req.user._id;
    const isOwner = review.user.toString() === String(userId);
    
    // Check if user is admin
    let isAdminUser = false;
    if (userId) {
      const admin = await Admin.findById(userId);
      isAdminUser = admin && (admin.role === "Admin" || admin.role === "Super Admin");
    }

    // Allow owner or admin to delete
    if (!isOwner && !isAdminUser) {
      return res.status(403).send({ message: "Not authorized to delete" });
    }

    const productId = review.product;
    await review.deleteOne();
    await recomputeProductRating(productId);

    res.send({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// GET /api/reviews/admin/all - Get all reviews for admin
const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      productId,
      userId,
      verified,
      sort = "newest",
      search,
      invoice,
    } = req.query;

    const query = {};

    if (rating) {
      const ratingNumber = Number(rating);
      if (ratingNumber >= 1 && ratingNumber <= 5) {
        query.rating = ratingNumber;
      }
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.product = productId;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = userId;
    }

    if (verified !== undefined) {
      query.verified = verified === "true" || verified === true;
    }

    // Search in review text
    if (search && search.trim()) {
      query.reviewText = { $regex: search.trim(), $options: "i" };
    }

    if (invoice && !Number.isNaN(Number(invoice))) {
      query.orderInvoice = Number(invoice);
    }

    const sortOptions = {};
    if (sort === "helpful") {
      sortOptions.helpfulCount = -1;
      sortOptions.createdAt = -1;
    } else if (sort === "rating_high") {
      sortOptions.rating = -1;
      sortOptions.createdAt = -1;
    } else if (sort === "rating_low") {
      sortOptions.rating = 1;
      sortOptions.createdAt = -1;
    } else {
      // newest
      sortOptions.createdAt = -1;
    }

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [total, reviews] = await Promise.all([
      Review.countDocuments(query),
      Review.find(query)
        .populate({ path: "user", select: "name email image" })
        .populate({ path: "product", select: "title slug image" })
        .populate({ path: "order", select: "invoice" })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
    ]);

    const reviewsWithInvoice = reviews.map((review) => ({
      ...review,
      orderInvoice: review.orderInvoice || review.order?.invoice || null,
    }));

    res.send({
      reviews: reviewsWithInvoice,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber) || 1,
      },
    });
  } catch (err) {
    console.error("Error in getAllReviews:", err);
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  createOrUpdateReview,
  getProductReviews,
  markReviewHelpful,
  deleteReview,
  getAllReviews,
  adminCreateReview,
  adminUpdateReview,
};



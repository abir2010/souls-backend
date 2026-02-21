// Author: M. K. Abir | Date: 2024-06-15
// File: reviewController.js
// reviewController.js - Handles Review Logic for Souls Lifestyle Backend API

const Review = require("../models/Review");
const Product = require("../models/Product");

// @desc    Submit a review (Guest)
// @route   POST /api/reviews
// @access  Public
exports.submitReview = async (req, res, next) => {
  try {
    const { productCode, reviewerName, rating, comment } = req.body;

    const product = await Product.findOne({ productCode });
    if (!product)
      return res.status(404).json({ message: "Invalid product code" });

    const review = await Review.create({
      product: product._id,
      reviewerName,
      rating,
      comment,
      isApproved: false, // Requires admin approval
    });

    res.status(201).json({
      success: true,
      message: "Review submitted and pending approval",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or Reject Review
// @route   PATCH /api/admin/reviews/:id
// @access  Private (Admin/Staff)
exports.moderateReview = async (req, res, next) => {
  try {
    const { action } = req.body; // Expects 'approve' or 'reject'

    if (action === "approve") {
      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true },
      );
      // Saving triggers the post-save hook in Review.js to recalculate stars
      await review.save();
      res.status(200).json({ success: true, message: "Review approved" });
    } else if (action === "reject") {
      await Review.findByIdAndDelete(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Review rejected/deleted" });
    } else {
      res.status(400).json({ success: false, message: "Invalid action" });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getReviewsById = async (req, res, next) => {
  console.log(req);
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

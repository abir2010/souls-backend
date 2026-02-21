// Author: M. K. Abir | Date: 2024-06-15
// File: Review.js
// Review.js - Mongoose Model for Product Reviews in Souls Lifestyle Backend API

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reviewerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    image: { type: String }, // Optional Cloudinary URL from customer
    isApproved: { type: Boolean, default: false }, // Admin must approve
  },
  { timestamps: true },
);

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model("Product").findByIdAndUpdate(productId, {
        "ratings.count": stats[0].nRating,
        "ratings.average": stats[0].avgRating,
      });
    } else {
      await mongoose.model("Product").findByIdAndUpdate(productId, {
        "ratings.count": 0,
        "ratings.average": 0,
      });
    }
  } catch (err) {
    console.error("Error updating product ratings:", err);
  }
};

// Hook: Call calculateAverageRating after a review is saved/approved
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.product);
});

// Hook: Call calculateAverageRating after a review is deleted
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

module.exports = mongoose.model("Review", reviewSchema);

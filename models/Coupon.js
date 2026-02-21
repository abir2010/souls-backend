// Author: M. K. Abir | Date: 2024-06-15
// File: Coupon.js
// Coupon.js - Mongoose Model for Discount Coupons in Souls Lifestyle Backend API

const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 }, // Minimum spend to use the code
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 }, // Total number of times this code can be used
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Check if coupon is expired
couponSchema.virtual("isExpired").get(function () {
  return Date.now() > this.expiryDate;
});

module.exports = mongoose.model("Coupon", couponSchema);

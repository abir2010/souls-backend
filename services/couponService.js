// Author: M. K. Abir | Date: 2024-06-15
// File: couponService.js
// couponService.js - Business Logic for Validating Discount Coupons in Souls Lifestyle Backend API

const Coupon = require("../models/Coupon");

exports.validateCoupon = async (code, subTotal) => {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) throw new Error("Invalid coupon code.");
  if (Date.now() > coupon.expiryDate) throw new Error("Coupon has expired.");
  if (coupon.usedCount >= coupon.usageLimit)
    throw new Error("Coupon usage limit reached.");
  if (subTotal < coupon.minOrderAmount) {
    throw new Error(
      `Minimum order of ৳${coupon.minOrderAmount} required for this code.`,
    );
  }

  return coupon;
};

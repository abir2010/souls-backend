// Author: M. K. Abir | Date: 2024-06-15
// File: discountService.js
// discountService.js - Service for Discount and Promotion Calculations in Souls Lifestyle Backend API

// Calculates the final billing breakdown based on store settings.
exports.calculateBill = (items, settings) => {
  // 1. Calculate Subtotal (Price at purchase already accounts for item-level discounts)
  const subTotal = items.reduce((acc, item) => {
    return acc + item.priceAtPurchase * item.quantity;
  }, 0);

  // 2. Apply Global Promotion (The ৳5000 Rule)
  let discountAmount = 0;
  const { globalDiscountThreshold, globalDiscountPercentage } =
    settings.promotions;

  if (subTotal >= globalDiscountThreshold) {
    discountAmount = Math.round((subTotal * globalDiscountPercentage) / 100);
  }

  // 3. Determine Shipping Charge
  // Note: The logic for city (Inside/Outside) is handled in the controller before calling this

  return {
    subTotal: Math.round(subTotal),
    discountApplied: Math.round(discountAmount),
    // Final Amount calculation happens in controller after adding shipping
  };
};

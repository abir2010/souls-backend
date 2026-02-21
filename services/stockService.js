// Author: M. K. Abir | Date: 2024-06-15
// File: stockService.js
// stockService.js - Service for Stock Management in Souls Lifestyle Backend API

const Product = require("../models/Product");

/**
 * Validates availability and reduces stock for multiple items.
 * Uses Mongoose sessions to ensure "All or Nothing" updates.
 */
exports.verifyAndReduceStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found.`);
    }

    const variant = product.sizes.find((s) => s.size === item.size);

    if (!variant) {
      throw new Error(`Size ${item.size} not available for ${product.name}.`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (${item.size}). Available: ${variant.stock}`,
      );
    }

    // Deduct stock
    variant.stock -= item.quantity;

    // Automatically unpublish product if total stock across all sizes is 0
    const totalStock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0);
    if (totalStock === 0) {
      product.isPublished = false;
    }

    await product.save();
  }
};

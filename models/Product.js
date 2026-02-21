// Author: M. K. Abir | Date: 2024-06-15
// File: Product.js
// Product.js - Mongoose Model for Product Management in Souls Lifestyle Backend API

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Panjabi", "Pajama", "Shirt", "T-Shirt", "Pant"],
    },

    // Pricing
    price: { type: Number, required: true },
    discount: {
      type: {
        type: String,
        enum: ["flat", "percentage"],
        default: "percentage",
      },
      value: { type: Number, default: 0 },
    },

    // Inventory & Variants
    sizes: [
      {
        size: { type: String, required: true }, // e.g., 'M', 'L', 'XL'
        stock: { type: Number, default: 0, min: 0 },
        sku: { type: String }, // Optional: Internal Stock Keeping Unit
      },
    ],

    // Media
    images: [{ type: String, required: true }], // Cloudinary URLs
    sizeGuide: { type: String },

    // Admin Controls & SEO
    isPublished: { type: Boolean, default: false }, // Storefront visibility
    isFeatured: { type: Boolean, default: false }, // Homepage banner
    isTopSale: { type: Boolean, default: false }, // Bestseller badge
    isNewProduct: { type: Boolean, default: false }, // New arrival badge

    // Relationships
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Auto-calculated by the Review model
    ratings: {
      average: {
        type: Number,
        default: 0,
        set: (val) => Math.round(val * 10) / 10,
      },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for calculating the price after individual product discount
productSchema.virtual("finalPrice").get(function () {
  if (this.discount && this.discount.value > 0) {
    if (this.discount.type === "percentage") {
      return this.price - this.price * (this.discount.value / 100);
    }
    return this.price - this.discount.value;
  }
  return this.price;
});

module.exports = mongoose.model("Product", productSchema);

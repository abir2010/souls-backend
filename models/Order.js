// Author: M. K. Abir | Date: 2024-06-15
// File: Order.js
// Order.js - Mongoose Model for Order Management in Souls Lifestyle Backend API

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },

    // Guest Customer Details
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: {
        type: String,
        required: true,
        enum: ["Chittagong", "Outside Chittagong"],
      },
    },

    // Snapshot of purchased items
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        productCode: { type: String },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true }, // Price AFTER individual discount, BEFORE global discount
        category: {
          type: String,
          required: true,
          enum: ["Panjabi", "Pajama", "Shirt", "T-Shirt", "Pant"],
        },
      },
    ],

    // Financial Breakdown
    billing: {
      subTotal: { type: Number, required: true },
      shippingCharge: { type: Number, required: true },
      discountApplied: { type: Number, default: 0 }, // The 5000+ threshold discount
      totalAmount: { type: Number, required: true },
    },

    // Fulfillment Tracking
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    },
    paymentType: {
      type: String,
      default: "Cash On Delivery",
      enum: ["Cash On Delivery", "Paid"],
    },

    // Admin-only fields
    internalNotes: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);

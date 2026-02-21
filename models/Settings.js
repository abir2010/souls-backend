// Author: M. K. Abir | Date: 2024-06-15
// File: Settings.js
// Settings.js - Mongoose Model for Application Settings in Souls Lifestyle Backend API

const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeInfo: {
      name: { type: String, default: "Souls Lifestyle Clothing Brand" },
      logo: { type: String },
      contactPhone: { type: String, default: "8801626042411" },
      whatsappNumber: { type: String, default: "8801626042411" }, // Must include country code
    },
    logistics: {
      deliveryChargeInside: { type: Number, default: 80 },
      deliveryChargeOutside: { type: Number, default: 150 },
      orderCutoffTime: { type: String, default: "18:00" }, // 24H format
    },
    promotions: {
      globalDiscountThreshold: { type: Number, default: 5000 },
      globalDiscountPercentage: { type: Number, default: 5 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);

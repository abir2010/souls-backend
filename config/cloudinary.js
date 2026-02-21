// Author: M. K. Abir | Date: 2024-06-15
// File: cloudinary.js
// cloudinary.js - Configuration for Cloudinary Image Uploads in Souls Lifestyle Backend API

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 1. Configure Cloudinary with Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 2. Define the Storage Engine
 * This tells Cloudinary how to treat the incoming files.
 * It automatically converts images to a modern format (webp)
 * and limits the width to ensure fast loading on mobile devices.
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "souls_clothing_brand_products", // The folder name in your Cloudinary Media Library
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      { width: 1200, crop: "limit" }, // Prevents massive files while maintaining quality
      { quality: "auto" }, // Intelligent compression
      { fetch_format: "auto" }, // Delivers webp to browsers that support it
    ],
  },
});

module.exports = { cloudinary, storage };

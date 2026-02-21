// Author: M. K. Abir | Date: 2024-06-15
// File: productController.js
// productController.js - Handles Product Logic for Souls Lifestyle Backend API

const Product = require("../models/Product");

// @desc    Get all published products (For Storefront)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, isTopSale, isNewProduct, isFeatured, isPublished } =
      req.query;

    // Default query object
    let query = {};

    // 1. Handle Publishing Visibility
    // If Admin explicitly requests all products (or unpublished ones), allow it.
    // Otherwise, default to ONLY showing published products for the public storefront.
    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    } else {
      query.isPublished = true;
    }

    // 2. Handle Filters
    if (category) query.category = category;

    // We check against the string 'true' because URL query params are always strings
    if (isTopSale === "true") query.isTopSale = true;
    if (isNewProduct === "true") query.isNewProduct = true;
    if (isFeatured === "true") query.isFeatured = true;

    // 3. Fetch from MongoDB
    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by code
// @route   GET /api/products/:code
// @access  Public
exports.getProductByCode = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      productCode: req.params.code,
      isPublished: true,
    }).populate("relatedProducts", "name images finalPrice productCode");

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or Update Product
// @route   POST /api/admin/products
// @access  Private (Admin/Staff)
exports.manageProduct = async (req, res, next) => {
  try {
    // If images were uploaded via Cloudinary/Multer, add them to the body
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => file.path);
    }

    const product = await Product.findOneAndUpdate(
      { productCode: req.body.productCode },
      req.body,
      { new: true, upsert: true, runValidators: true },
    );
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin Only)
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

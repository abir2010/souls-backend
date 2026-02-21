// Author: M. K. Abir | Date: 2024-06-15
// File: productRoutes.js
// productRoutes.js - Routes for Product Management (Storefront & Admin)

const express = require("express");
const router = express.Router();

// Controllers
const {
  getProducts,
  getProductByCode,
  manageProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  submitReview,
  getReviewsById,
} = require("../controllers/reviewController");

// Middlewares
const { protect, authorize } = require("../middleware/auth");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// PUBLIC ROUTES (Storefront)
router.get("/", getProducts);
router.get("/:code", getProductByCode);
router.post("/reviews", submitReview); // Guests submitting a review (Pending approval)
router.get("/reviews/product/:productId", getReviewsById);

// PROTECTED ROUTES (Admin/Staff)
// Staff can add/edit products and upload up to 5 images
router.post(
  "/manage",
  protect,
  authorize("Admin", "Staff"),
  upload.array("images", 5),
  manageProduct,
);

// Only Admin can permanently delete a product
router.delete("/:id", protect, authorize("Admin"), deleteProduct);

module.exports = router;

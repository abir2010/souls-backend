// Author: M. K. Abir | Date: 2024-06-15
// File: adminRoutes.js
// adminRoutes.js - Routes for Admin Dashboard, Order Fulfillment, Review Moderation, and Store Settings

const express = require("express");
const router = express.Router();

// Controllers
const { getDashboardKPIs } = require("../controllers/adminController");
const {
  updateOrderAdmin,
  getAllOrdersAdmin,
} = require("../controllers/orderController");
const { moderateReview } = require("../controllers/reviewController");
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

// Middleware
const { protect, authorize } = require("../middleware/auth");

// PUBLIC ROUTE
// (Frontend needs to fetch this to calculate delivery fees before checkout)
router.get("/settings", getSettings);

// PROTECTED ROUTES (Requires Login)
router.use(protect); // This applies the JWT check to ALL routes below this line

// Dashboard & KPIs (Admin & Staff)
router.get("/", authorize("Admin", "Staff"), getDashboardKPIs);

// Fetch all orders for the table
router.get("/orders", authorize("Admin", "Staff"), getAllOrdersAdmin);

// Order Fulfillment (Admin & Staff)
router.patch("/orders/:id", authorize("Admin", "Staff"), updateOrderAdmin);

// Review Moderation (Admin & Staff)
router.patch("/reviews/:id", authorize("Admin", "Staff"), moderateReview);

// Store Configuration (Strictly Admin Only)
router.put("/settings", authorize("Admin"), updateSettings);

module.exports = router;

// Author: M. K. Abir | Date: 2024-06-15
// File: orderRoutes.js
// orderRoutes.js - Routes for Order Management (Checkout & Tracking)

const express = require("express");
const router = express.Router();
const { createOrder, trackOrder } = require("../controllers/orderController");

// Security Middlewares
const { orderLimiter } = require("../middleware/rateLimiter");
const { honeypot } = require("../middleware/antiSpam");
const validateGmail = require("../middleware/validateGmail");

// @route   POST /api/orders/checkout
// @access  Public (Protected by anti-spam layers)
router.post("/checkout", orderLimiter, honeypot, validateGmail, createOrder);

// @route   GET /api/orders/track
// @access  Public (Requires OrderId and Phone via query params)
router.get("/track", trackOrder);

module.exports = router;

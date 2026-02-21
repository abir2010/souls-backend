// Author: M. K. Abir | Date: 2024-06-15
// File: rateLimiter.js
// rateLimiter.js - Middleware for Rate Limiting in Souls Lifestyle Backend API

const rateLimit = require("express-rate-limit");

// Strict limiter for checkout to prevent fake order spam
exports.orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  // windowMs: 60 * 60, // 1 hour window
  max: 5, // Limit each IP to 5 order requests per windowMs
  message: {
    success: false,
    message:
      "Too many orders placed from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter for browsing
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});

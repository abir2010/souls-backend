// Author: M. K. Abir | Date: 2024-06-15
// File: app.js
// app.js - Express Application Setup for Souls Lifestyle Backend API

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// 1. Security & Utility Middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(cors()); // Allows React frontend to communicate with this API
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// 2. Health Check Route
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Server is running smoothly." });
});

// 3. Route Placeholders (We will build and import these next)
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// 4. Global Error Handler Placeholder
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

module.exports = app;

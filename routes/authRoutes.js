// Author: M. K. Abir | Date: 2024-06-15
// File: authRoutes.js
// authRoutes.js - Routes for Authentication (Admin/Staff Login)

const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

// @route   POST /api/auth/login
// @access  Public (Only for Admin/Staff to enter credentials)
router.post("/login", login);

module.exports = router;

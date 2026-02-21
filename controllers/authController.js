// Author: M. K. Abir | Date: 2024-06-15
// File: authController.js
// authController.js - Handles Authentication Logic for Souls Lifestyle Backend API

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// @desc    Login Admin/Staff & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide an email and password" });
    }

    // Check for user and include password in the query
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or account disabled" });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

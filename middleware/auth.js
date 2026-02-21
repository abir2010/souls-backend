// Author: M. K. Abir | Date: 2024-06-15
// File: auth.js
// auth.js - Middleware for Authentication and Authorization in Souls Lifestyle Backend API

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - Verify token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user and attach it to the request object
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "User disabled or no longer exists" });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Session expired or invalid token" });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Author: M. K. Abir | Date: 2024-06-15
// File: antiSpam.js
// antiSpam.js - Middleware for Anti-Spam Measures in Souls Lifestyle Backend API

exports.honeypot = (req, res, next) => {
  // 'address_secondary' will be a hidden field on your React frontend.
  // Real humans can't see it, so they won't fill it. Bots fill everything.
  if (req.body.address_secondary) {
    return res.status(400).json({
      success: false,
      message: "Automated submission detected. Order rejected.",
    });
  }
  next();
};

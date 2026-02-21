// Author: M. K. Abir | Date: 2024-06-15
// File: validateGmail.js
// validateGmail.js - Middleware to Validate Gmail Addresses in Souls Lifestyle Backend API

const validateGmail = (req, res, next) => {
  // Check if email is nested under customer object or at the root level
  const email = req.body.customer?.email || req.body.email;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  // Regex to strictly enforce standard @gmail.com formatting
  const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@gmail\.com$/i;

  if (!gmailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide a valid Gmail address (e.g., example@gmail.com).",
    });
  }

  next();
};

module.exports = validateGmail;

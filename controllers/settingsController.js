// Author: M. K. Abir | Date: 2024-06-15
// File: settingsController.js
// settingsController.js - Handles Store Settings Logic for Souls Lifestyle Backend API

const Settings = require("../models/Settings");

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public (Used by frontend to show fees)
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private (Admin Only)
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

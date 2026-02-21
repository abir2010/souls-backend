// Author: M. K. Abir | Date: 2024-06-15
// File: orderController.js
// orderController.js - Handles Order Logic for Souls Lifestyle Backend API

const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const { validateCoupon } = require("../services/couponService");
const { formatWhatsAppLink } = require("../utils/whatsappFormatter");

// @desc    Create a new guest order
// @route   POST /api/orders/checkout
// @access  Public (Protected by Rate Limiter & Honeypot)
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, couponCode } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    // 1. Verify Stock & Build Final Items Array
    let subTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.name} not found`);

      const sizeVariant = product.sizes.find((s) => s.size === item.size);
      if (!sizeVariant || sizeVariant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (Size: ${item.size})`,
        });
      }

      // Deduct stock
      sizeVariant.stock -= item.quantity;
      await product.save();

      const itemPrice = product.finalPrice;
      subTotal += itemPrice * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        productCode: product.productCode,
        size: item.size,
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
      });
    }

    // 2. Calculate Billing & Shipping
    const shippingCharge =
      customer.city === "Chittagong"
        ? settings.logistics.deliveryChargeInside
        : settings.logistics.deliveryChargeOutside;

    // A. Apply Global Discount (The ৳5000 Rule)
    let globalDiscount = 0;
    if (subTotal >= settings.promotions.globalDiscountThreshold) {
      globalDiscount =
        (subTotal * settings.promotions.globalDiscountPercentage) / 100;
    }

    // B. Apply Coupon Logic (NEW)
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      // Validates code, expiry, usage limit, and minOrderAmount
      const coupon = await validateCoupon(couponCode, subTotal);

      if (coupon.discountType === "percentage") {
        couponDiscount = (subTotal * coupon.discountValue) / 100;
      } else {
        couponDiscount = coupon.discountValue;
      }

      // Track the coupon for the Order model
      appliedCoupon = coupon.code;

      // Increment usage count in the database
      coupon.usedCount += 1;
      await coupon.save();
    }

    // C. Final Calculation
    const totalDiscount = globalDiscount + couponDiscount;
    const totalAmount = subTotal + shippingCharge - totalDiscount;
    const orderId = `BD-${Date.now().toString().slice(-6)}`;

    // 3. Save Order with Coupon Tracking
    const newOrder = await Order.create({
      orderId,
      customer,
      items: orderItems,
      billing: {
        subTotal,
        shippingCharge,
        discountApplied: totalDiscount, // Total sum of all discounts
        couponUsed: appliedCoupon, // Store the code for admin tracking
        totalAmount,
      },
    });

    // 4. Generate WhatsApp Link
    const whatsappLink = formatWhatsAppLink(
      newOrder,
      settings.storeInfo.whatsappNumber,
    );

    res.status(201).json({
      success: true,
      data: newOrder,
      whatsappLink,
    });
  } catch (err) {
    // If coupon validation fails, it throws an error which 'next' catches
    next(err);
  }
};

// @desc    Track Guest Order
// @route   GET /api/orders/track
// @access  Public
exports.trackOrder = async (req, res, next) => {
  try {
    const { orderId, phone } = req.query;
    const order = await Order.findOne({ orderId, "customer.phone": phone });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or phone number incorrect",
      });
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Order Status & Notes
// @route   PATCH /api/admin/orders/:id
// @access  Private (Admin/Staff)
exports.updateOrderAdmin = async (req, res, next) => {
  try {
    const { status, internalNotes, paymentType } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, internalNotes, paymentType },
      { new: true, runValidators: true },
    );
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Orders for Admin Dashboard
// @route   GET /api/admin/orders
// @access  Private (Admin/Staff)
exports.getAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

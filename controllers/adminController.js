// Author: M. K. Abir | Date: 2024-06-15
// File: adminController.js
// adminController.js - Handles Admin Dashboard Logic for Souls Lifestyle Backend API

const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");

// @desc    Get dashboard summary statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Staff)
// exports.getDashboardKPIs = async (req, res, next) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Run queries concurrently for speed
//     const [
//       totalOrders,
//       newOrdersToday,
//       pendingOrders,
//       totalProducts,
//       pendingReviews,
//     ] = await Promise.all([
//       Order.countDocuments(),
//       Order.countDocuments({ createdAt: { $gte: today } }),
//       Order.countDocuments({ status: "Pending" }),
//       Product.countDocuments(),
//       Review.countDocuments({ isApproved: false }),
//     ]);

//     // Find products running out of stock (less than 5 items in any size)
//     const lowStockAlerts = await Product.find({ "sizes.stock": { $lt: 5 } })
//       .select("name productCode sizes images")
//       .limit(10);

//     res.status(200).json({
//       success: true,
//       data: {
//         summary: {
//           totalOrders,
//           newOrdersToday,
//           pendingOrders,
//           totalProducts,
//           pendingReviews,
//         },
//         alerts: lowStockAlerts,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// @desc    Get Dashboard Statistics & KPIs
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Staff)
exports.getDashboardKPIs = async (req, res, next) => {
  try {
    const { timeRange } = req.query;

    // 1. Determine Date Filter Boundary
    const now = new Date();
    let startDate = new Date(0); // Default to beginning of time

    if (timeRange === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeRange === "7days") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeRange === "30days") {
      startDate = new Date(now.setDate(now.getDate() - 30));
    } else if (timeRange === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const dateFilter = { createdAt: { $gte: startDate } };
    const validOrdersFilter = { ...dateFilter, status: { $ne: "Cancelled" } };

    // 2. Fetch High-Level KPIs (Parallel Execution for Speed)
    const [totalOrders, pendingOrders, uniqueCustomers, revenueData] =
      await Promise.all([
        Order.countDocuments(dateFilter),
        Order.countDocuments({ ...dateFilter, status: "Pending" }),
        Order.distinct("customer.phone", dateFilter), // Using phone as unique ID
        Order.aggregate([
          { $match: validOrdersFilter },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$billing.totalAmount" },
            },
          },
        ]),
      ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const totalCustomers = uniqueCustomers.length;

    // 3. Aggregate Sales Trend (Group by day or month)
    // We group by the formatted date string "YYYY-MM-DD"
    const salesTrendRaw = await Order.aggregate([
      { $match: validOrdersFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$billing.totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for Recharts (e.g., convert "2024-06-15" to "Jun 15")
    const salesTrend = salesTrendRaw.map((item) => {
      const dateObj = new Date(item._id);
      return {
        date: dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: item.revenue,
      };
    });

    // 4. Aggregate Category Sales (Unwinding the items array)
    const categorySalesRaw = await Order.aggregate([
      { $match: validOrdersFilter },
      { $unwind: "$items" }, // Break apart the cart into individual items
      {
        $group: {
          _id: "$items.category", // Group strictly by the item's category
          sales: {
            $sum: { $multiply: ["$items.quantity", "$items.priceAtPurchase"] },
          },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }, // Top 5 categories
    ]);

    const categorySales = categorySalesRaw.map((item) => ({
      name: item._id,
      sales: item.sales,
    }));

    // 5. Fetch Recent Orders (Top 5 newest)
    const recentOrders = await Order.find()
      .select("orderId customer.name billing.totalAmount status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Send Formatted Payload to Frontend
    res.status(200).json({
      success: true,
      data: {
        kpi: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          totalCustomers,
        },
        salesTrend,
        categorySales,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

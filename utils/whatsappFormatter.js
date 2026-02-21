// Author: M. K. Abir | Date: 2024-06-15
// File: whatsappFormatter.js
// whatsappFormatter.js - Utility to Format WhatsApp Click-to-Chat Links for Order Notifications in Souls Lifestyle Backend API

// Formats a WhatsApp Click-to-Chat URL with pre-filled order details.
exports.formatWhatsAppLink = (order, storePhone = "8801700000000") => {
  // 1. Format the products into a list
  const itemSummary = order.items
    .map(
      (item) => `- ${item.name} | Size: ${item.size} | Qty: ${item.quantity}`,
    )
    .join("%0A"); // URL encoded New Line

  // 2. Build the message body
  const message =
    `*NEW ORDER RECEIVED*%0A%0A` +
    `*Order ID:* ${order.orderId}%0A` +
    `*Customer:* ${order.customer.name}%0A` +
    `*Phone:* ${order.customer.phone}%0A` +
    `*City:* ${order.customer.city}%0A%0A` +
    `*Items Ordered:*%0A${itemSummary}%0A%0A` +
    `*Total Bill:* ৳${order.billing.totalAmount}%0A` +
    `*Payment Method:* ${order.paymentType}%0A%0A` +
    `Please confirm my order. Thank you!`;

  // 3. Return the full API link
  return `https://wa.me/${storePhone}?text=${message}`;
};

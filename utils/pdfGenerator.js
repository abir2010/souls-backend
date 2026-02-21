// Author: M. K. Abir | Date: 2024-06-15
// File: pdfGenerator.js
// pdfGenerator.js - Utility for Generating PDF Invoices in Souls Lifestyle Backend API

const PDFDocument = require("pdfkit");

/**
 * Generates a professional PDF invoice and streams it to the response.
 */
exports.generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Stream directly to response
  doc.pipe(res);

  // --- Header ---
  doc.fillColor("#444444").fontSize(20).text("INVOICE", { align: "right" });
  doc
    .fillColor("#000000")
    .fontSize(14)
    .text("Your Clothing Brand Name", 50, 50);
  doc.fontSize(10).text("Chattogram, Bangladesh", 50, 65);
  doc.moveDown();

  // --- Customer Details ---
  doc.fontSize(10).text(`Order ID: ${order.orderId}`, 50, 100);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 115);
  doc.moveDown();

  doc.text("Bill To:", { underline: true });
  doc.text(`Customer: ${order.customer.name}`);
  doc.text(`Phone: ${order.customer.phone}`);
  doc.text(`Address: ${order.customer.address}, ${order.customer.city}`);
  doc.moveDown();

  // --- Table Header ---
  const tableTop = 230;
  doc.font("Helvetica-Bold");
  doc.text("Item Description", 50, tableTop);
  doc.text("Code", 250, tableTop);
  doc.text("Size", 330, tableTop);
  doc.text("Qty", 380, tableTop);
  doc.text("Price", 430, tableTop, { width: 90, align: "right" });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();
  doc.font("Helvetica");

  // --- Table Items ---
  let i;
  let invoiceTableTop = tableTop + 30;

  for (i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    doc.text(item.name, 50, invoiceTableTop);
    doc.text(item.productCode || "N/A", 250, invoiceTableTop);
    doc.text(item.size, 330, invoiceTableTop);
    doc.text(item.quantity.toString(), 380, invoiceTableTop);
    doc.text(`৳${item.priceAtPurchase}`, 430, invoiceTableTop, {
      width: 90,
      align: "right",
    });

    invoiceTableTop += 25;
  }

  // --- Calculations ---
  const subtotalPosition = invoiceTableTop + 20;
  doc.moveTo(350, subtotalPosition).lineTo(550, subtotalPosition).stroke();

  doc.text("Subtotal:", 350, subtotalPosition + 10);
  doc.text(`৳${order.billing.subTotal}`, 450, subtotalPosition + 10, {
    align: "right",
  });

  doc.text("Shipping:", 350, subtotalPosition + 25);
  doc.text(`৳${order.billing.shippingCharge}`, 450, subtotalPosition + 25, {
    align: "right",
  });

  if (order.billing.discountApplied > 0) {
    doc.fillColor("red").text("Discount:", 350, subtotalPosition + 40);
    doc.text(`-৳${order.billing.discountApplied}`, 450, subtotalPosition + 40, {
      align: "right",
    });
  }

  doc.fillColor("black").font("Helvetica-Bold").fontSize(12);
  doc.text("Total:", 350, subtotalPosition + 60);
  doc.text(`৳${order.billing.totalAmount}`, 450, subtotalPosition + 60, {
    align: "right",
  });

  // --- Footer ---
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Thank you for shopping with us! For returns, please contact our support.",
      50,
      700,
      { align: "center", width: 500 },
    );

  doc.end();
};

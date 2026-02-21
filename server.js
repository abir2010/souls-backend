// Author: M. K. Abir | Date: 2024-06-15
// File: server.js
// server.js - Entry Point for Souls Lifestyle Backend API

require("dotenv").config(); // Load environment variables first
const app = require("./app");
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// Allow requests from your Vite frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://souls-frontend.vercel.app",
    ],
    credentials: true, // Important if you use cookies later
  }),
);

app.use(express.json()); // To parse incoming JSON body

// Connect to the database, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
});

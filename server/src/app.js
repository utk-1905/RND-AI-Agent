const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Base route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to RND AI Agent Backend API",
  });
});

// API routes
app.use("/api/health", healthRoutes);

// 404 route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
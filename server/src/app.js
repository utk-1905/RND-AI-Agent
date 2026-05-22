const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const taskRoutes = require("./routes/task.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const seoAgentRoutes = require("./routes/seoAgent.routes");
const reviewRoutes = require("./routes/review.routes");
const revisionRoutes = require("./routes/revision.routes");
const reportRoutes = require("./routes/report.routes");

const healthRoutes = require("./routes/health.routes");
const dbTestRoutes = require("./routes/dbTest.routes");

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
app.use("/api/db-test", dbTestRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", assignmentRoutes);
app.use("/api/agents", seoAgentRoutes);
app.use("/api/tasks", reviewRoutes);
app.use("/api/agents", revisionRoutes);
app.use("/api", reportRoutes);

// 404 route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
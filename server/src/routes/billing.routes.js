const express = require("express");

const {
  getOverallUsageSummary,
  getUsageByTaskId,
} = require("../controllers/billing.controller");

const router = express.Router();

router.get("/usage", getOverallUsageSummary);
router.get("/tasks/:taskId", getUsageByTaskId);

module.exports = router;
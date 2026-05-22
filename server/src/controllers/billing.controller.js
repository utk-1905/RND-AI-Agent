const billingService = require("../services/billing.service");

/**
 * Get overall AI usage summary.
 */
const getOverallUsageSummary = async (req, res) => {
  try {
    const result = await billingService.getOverallUsageSummary();

    return res.status(200).json({
      success: true,
      message: "AI usage summary fetched successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI usage summary.",
      error: error.message,
    });
  }
};

/**
 * Get usage logs for one task.
 */
const getUsageByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const result = await billingService.getUsageByTaskId(taskId);

    return res.status(200).json({
      success: true,
      message: "Task AI usage fetched successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch task AI usage.",
      error: error.message,
    });
  }
};

module.exports = {
  getOverallUsageSummary,
  getUsageByTaskId,
};
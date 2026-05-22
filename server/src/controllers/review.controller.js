const reviewService = require("../services/review.service");

/**
 * Controller for CEO review action.
 */
const reviewTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reviewed_by, decision, feedback } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    if (!decision) {
      return res.status(400).json({
        success: false,
        message: "Review decision is required.",
      });
    }

    const result = await reviewService.reviewTask({
      taskId,
      reviewed_by,
      decision,
      feedback,
    });

    return res.status(200).json({
      success: true,
      message: "Task reviewed successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to review task.",
      error: error.message,
    });
  }
};

module.exports = {
  reviewTask,
};
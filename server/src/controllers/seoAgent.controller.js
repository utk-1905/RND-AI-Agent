const seoAgentService = require("../services/seoAgent.service");

/**
 * Controller to run SEO Agent for a task.
 */
const runSeoAgentForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { triggered_by } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const result = await seoAgentService.runSeoAgentForTask({
      taskId,
      triggered_by,
    });

    return res.status(200).json({
      success: true,
      message: "SEO AI Agent generated output successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to run SEO AI Agent.",
      error: error.message,
    });
  }
};

module.exports = {
  runSeoAgentForTask,
};
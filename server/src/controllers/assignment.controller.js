const assignmentService = require("../services/assignment.service");

/**
 * Assign a task to SEO AI Agent.
 */
const assignTaskToSeoAgent = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assigned_by } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const result = await assignmentService.assignTaskToSeoAgent({
      taskId,
      assigned_by,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        assignment: result.assignment,
        task: result.task,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign task.",
      error: error.message,
    });
  }
};

module.exports = {
  assignTaskToSeoAgent,
};
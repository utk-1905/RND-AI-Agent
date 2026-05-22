const revisionService = require("../services/revision.service");

/**
 * Controller to regenerate SEO output after CEO revision request.
 */
const reviseSeoOutputForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { triggered_by } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const result = await revisionService.reviseSeoOutputForTask({
      taskId,
      triggered_by,
    });

    return res.status(200).json({
      success: true,
      message: "SEO AI Agent revised output successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to revise SEO AI Agent output.",
      error: error.message,
    });
  }
};

module.exports = {
  reviseSeoOutputForTask,
};
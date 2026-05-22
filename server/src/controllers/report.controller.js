const reportService = require("../services/report.service");

/**
 * Generate final PDF report after CEO approval.
 */
const finalizeTaskReport = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { generated_by } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const result = await reportService.generateFinalReport({
      taskId,
      generated_by,
    });

    return res.status(200).json({
      success: true,
      message: "Final report generated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate final report.",
      error: error.message,
    });
  }
};

/**
 * Download latest PDF report for a task.
 */
const downloadTaskReport = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const report = await reportService.getReportForDownload(taskId);

    return res.download(report.pdf_file_path, report.pdf_file_name);
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Failed to download report.",
      error: error.message,
    });
  }
};

module.exports = {
  finalizeTaskReport,
  downloadTaskReport,
};
const taskService = require("../services/task.service");

/**
 * Controller for creating a task.
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, created_by } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const task = await taskService.createTask({
      title,
      description,
      priority,
      created_by,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create task.",
      error: error.message,
    });
  }
};

/**
 * Controller for fetching all tasks.
 */
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully.",
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks.",
      error: error.message,
    });
  }
};

/**
 * Controller for fetching one task.
 */
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await taskService.getTaskById(taskId);

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully.",
      data: task,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
      error: error.message,
    });
  }
};

/**
 * Controller for fetching full task details.
 */
const getFullTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required.",
      });
    }

    const details = await taskService.getFullTaskDetails(taskId);

    return res.status(200).json({
      success: true,
      message: "Full task details fetched successfully.",
      data: details,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Failed to fetch full task details.",
      error: error.message,
    });
  }
};

/**
 * Controller for archiving a task.
 */
const archiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { changed_by } = req.body;

    const task = await taskService.archiveTask({
      taskId,
      changed_by,
    });

    return res.status(200).json({
      success: true,
      message: "Task archived successfully.",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to archive task.",
      error: error.message,
    });
  }
};

/**
 * Controller for restoring an archived task.
 */
const restoreTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { changed_by } = req.body;

    const task = await taskService.restoreTask({
      taskId,
      changed_by,
    });

    return res.status(200).json({
      success: true,
      message: "Task restored successfully.",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to restore task.",
      error: error.message,
    });
  }
};

/**
 * Controller for permanently deleting a task.
 */
const permanentlyDeleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = await taskService.permanentlyDeleteTask(taskId);

    return res.status(200).json({
      success: true,
      message: "Task permanently deleted successfully.",
      data: deletedTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete task.",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  getFullTaskDetails,
  archiveTask,
  restoreTask,
  permanentlyDeleteTask,
};
const express = require("express");

const {
  createTask,
  getAllTasks,
  getTaskById,
  getFullTaskDetails,
  archiveTask,
  restoreTask,
  permanentlyDeleteTask,
} = require("../controllers/task.controller");

const router = express.Router();

router.post("/", createTask);
router.get("/", getAllTasks);

router.get("/:taskId/full-details", getFullTaskDetails);

router.patch("/:taskId/archive", archiveTask);
router.patch("/:taskId/restore", restoreTask);
router.delete("/:taskId", permanentlyDeleteTask);

router.get("/:taskId", getTaskById);

module.exports = router;
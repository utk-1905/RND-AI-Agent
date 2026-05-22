const express = require("express");

const {
  createTask,
  getAllTasks,
  getTaskById,
  getFullTaskDetails,
} = require("../controllers/task.controller");

const router = express.Router();

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:taskId/full-details", getFullTaskDetails);
router.get("/:taskId", getTaskById);

module.exports = router;
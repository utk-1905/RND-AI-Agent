const express = require("express");

const {
  createTask,
  getAllTasks,
  getTaskById,
} = require("../controllers/task.controller");

const router = express.Router();

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:taskId", getTaskById);

module.exports = router;
const express = require("express");
const { reviewTask } = require("../controllers/review.controller");

const router = express.Router();

router.post("/:taskId/review", reviewTask);

module.exports = router;
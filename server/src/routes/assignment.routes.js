const express = require("express");
const { assignTaskToSeoAgent } = require("../controllers/assignment.controller");

const router = express.Router();

router.post("/:taskId/assign-seo", assignTaskToSeoAgent);

module.exports = router;
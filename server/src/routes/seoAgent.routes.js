const express = require("express");
const { runSeoAgentForTask } = require("../controllers/seoAgent.controller");

const router = express.Router();

router.post("/seo/run/:taskId", runSeoAgentForTask);

module.exports = router;
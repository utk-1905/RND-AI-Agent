const express = require("express");
const { reviseSeoOutputForTask } = require("../controllers/revision.controller");

const router = express.Router();

router.post("/seo/revise/:taskId", reviseSeoOutputForTask);

module.exports = router;
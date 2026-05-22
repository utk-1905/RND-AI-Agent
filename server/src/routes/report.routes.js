const express = require("express");

const {
  finalizeTaskReport,
  downloadTaskReport,
} = require("../controllers/report.controller");

const router = express.Router();

router.post("/tasks/:taskId/finalize", finalizeTaskReport);
router.get("/reports/:taskId/download", downloadTaskReport);

module.exports = router;
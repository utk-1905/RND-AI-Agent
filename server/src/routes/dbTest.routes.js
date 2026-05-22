const express = require("express");
const { testDatabaseConnection } = require("../controllers/dbTest.controller");

const router = express.Router();

router.get("/", testDatabaseConnection);

module.exports = router;
const express = require("express");
const router = express.Router();
const { findDep } = require("../controllers/llm");
router.post("/query", findDep);
module.exports = router;

const express = require("express");
const { run } = require("../controllers/gemini");
const router = express.Router();
router.route("/").post(run);
module.exports = router;

// routes.js
const express = require("express");
const router = express.Router();

const generate = require("../api/generate.js");

router.post("/generate", (req, res) => generate(req, res));

module.exports = router;

const express = require("express");
const articlesRouter = require("./articles/router");

const router = express.Router();

router.use("/articles", articlesRouter);

module.exports = router;

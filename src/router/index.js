const express = require("express");
const authRouter = require("./auth/router");
const articlesRouter = require("./articles/router");

const router = express.Router();

router.get("/", (req, res) => {
	res.redirect(308, "/articles");
});

router.use("/auth", authRouter);
router.use("/articles", articlesRouter);

module.exports = router;

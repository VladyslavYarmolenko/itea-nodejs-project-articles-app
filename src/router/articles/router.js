const express = require("express");
const getArticles = require("./get-articles");

const router = express.Router();

router.route("/")
	.get(async (req, res) => {
		// ?author=<username>&pagesize=<int>&page=<int>

		const author = req.query.author || "";
		const pageSize = parseInt(req.query.pagesize, 10) || 10;
		const page = parseInt(req.query.page, 10) || 1;

		for (const [paramName, value] of [ ["pagesize", pageSize], ["page", page] ])
			if (value % 1 || value < 1)
				return res.status(400).json({
					message: `Invalid '${paramName}' query parameter`,
					details: `Expected (stringified) positive integer, got "${req.query[paramName]}"`,
				});

		if (pageSize >= 100)
			return res.status(400).json({
				message: "Invalid 'pagesize' query parameter",
				details: `Expected (stringified) positive integer less than 100, got "${req.query.pagesize}"`,
			});

		const prevPage = page == null ? null : `/articles?author=${author}&pagesize=${pageSize}&page=${page - 1}`;
		const nextPage = `/articles?author=${author}&pagesize=${pageSize}&page=${page + 1}`;

		const articles = await getArticles({
			author: author,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		});

		// user prefers html
		if (req.accepts("json", "html") === "html")
			return res.render("articles", {
				articles,
				pagination: { prevPage, nextPage },
			});

		// user accepts json
		if (req.accepts("json"))
			return res.json({ articles, nextPage, prevPage });

		res.sendStatus(415);
	});

module.exports = router;

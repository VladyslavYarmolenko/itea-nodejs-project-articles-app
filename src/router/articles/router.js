const express = require("express");
const getArticles = require("./get-articles");
const createArticle = require("./create-article");
const getArticleById = require("./get-article-by-id");
const updateArticle = require("./update-article");
const removeArticle = require("./remove-article");

const router = express.Router();

router.route("/")
	.get(async (req, res) => {
		// ?author=<username>&pagesize=<int>&page=<int>

		const author = req.query.author || "";
		let pageSize = parseInt(req.query.pagesize, 10) || 10;
		let page = parseInt(req.query.page, 10) || 1;
		
		const prefersHTML = req.accepts("json", "html") === "html";

		for (const [paramName, value] of [ ["pagesize", pageSize], ["page", page] ]) {
			if (value % 1 || value < 1) {
				if (prefersHTML) {
					if (paramName === 'pagesize') 
						pageSize = 10;
					
					else if (paramName === 'page')
						page = 1;		
				} else {
					return res.status(400).json({
						message: `Invalid '${paramName}' query parameter`,
						details: `Expected (stringified) positive integer, got "${req.query[paramName]}"`,
					});
				}
			}
		}
		
		if (pageSize >= 100) {
			if (prefersHTML) {
				pageSize = 10;
			} else {
				return res.status(400).json({
					message: "Invalid 'pagesize' query parameter",
					details: `Expected (stringified) positive integer less than 100, got "${req.query.pagesize}"`,
				});
			}
		}

		let articles = await getArticles({
			author: author,
			limit: pageSize,
			offset: (page - 1) * pageSize,
		});

		// if (!author) {
		// 	if (prefersHTML) {
		// 		articles = [];
		// 	} else {
		// 		return res.status(400).json({
		// 			message: "Invalid 'author' query parameter",
		// 			details: "Author it is required param",
		// 		});
		// 	}
		// }

		const prevPage = page <= 1 ? null : `/articles?author=${author}&pagesize=${pageSize}&page=${page - 1}`;
		const nextPage = articles.length < pageSize ? null : `/articles?author=${author}&pagesize=${pageSize}&page=${page + 1}`;

		// user prefers html
		if (req.accepts("json", "html") === "html") // TODO: extract in src/router/{middleware}.js
			return res.render("articles", {
				articles,
				pagination: { prevPage, nextPage },
			});

		// user accepts json
		if (req.accepts("json"))
			return res.json({ articles, nextPage, prevPage });

		res.sendStatus(415);
	})
	.post(async (req, res) => {
		const title = req.body.title;
		const text = req.body.text;
		const created = new Date().toISOString();
		
		const prefersHTML = req.accepts("json", "html") === "html";
		
		if (req.isAuthenticated() === false)
		return res.redirect('/auth');

		const author = req.user.username;
		
		const data = {
			title,
			text,
			author,
			created
		};	

		const article = await createArticle(data);

		if (prefersHTML) {
			return res.redirect(`/articles/${article._id}`);
		}

		return res.status(201).json({ id: article._id });
	});

router.route("/create")
	.get((req, res) => {
		const prefersHTML = req.accepts("json", "html") === "html";

		if (prefersHTML === false)
			return res.sendStatus(406);

		if (req.isAuthenticated() === false)
			res.redirect('/auth');

		return res.render("create-article");
	});

router.route("/:id")
	.get(async (req, res) => {
		const id = req.params.id;
		
		const prefersHTML = req.accepts("json", "html") === "html";

		const article = await getArticleById(id);

		if (!article) {
			if (prefersHTML) {
				return res.status(404).render('error', { message: `Article ${id} is not found` });
			} else {
				return res.status(404);
			}
		}

		if (prefersHTML) {
			const isAuthor = req.isAuthenticated() && req.user.username === article.author;

			return res.render('article', { own: isAuthor, article });
		}

		return res.status(200).json(article);
	})
	.patch(async (req, res) => {
		const id = req.params.id;
		const title = req.body.title;
		const text = req.body.text;

		const prefersHTML = req.accepts("json", "html") === "html";

		if (prefersHTML)
			return res.status(406);

		if (req.isAuthenticated === false)
			return res.redirect('/auth');

		const article = await getArticleById(id);

		if (!article)
			return res.status(404);
		
		const isAuthor = req.isAuthenticated() && req.user.username === article.author;

		if (isAuthor === false)
			return res.status(401);
		
		const data = {
			title,
			text,
			edited: new Date().toDateString()
		};
		
		await updateArticle(id, data);

		return res.redirect(`/articles/${id}`);
	})
	.delete(async (req, res) => {
		const id = req.params.id;

		const prefersHTML = req.accepts("json", "html") === "html";

		if (prefersHTML)
			return res.status(406);

		if (req.isAuthenticated === false)
			return res.redirect('/auth');

		const article = await getArticleById(id);

		if (!article)
			return res.status(404);
		
		const isAuthor = req.isAuthenticated() && req.user.username === article.author;

		if (isAuthor === false)
			return res.status(401);

		await removeArticle(id);

		return res.status(204).json(article);
	})

router.route("/:id/edit")
	.get(async (req, res) => {
		const id = req.params.id;

		if (req.isAuthenticated === false)
			return res.redirect('/auth');

		const article = await getArticleById(id);

		if (!article)
			return res.status(404).render('error', { message: `Article ${id} is not found` });

		const isAuthor = req.isAuthenticated() && req.user.username === article.author;

		if (isAuthor === false)
			return res.status(401).render('error', { message: `Article ${id} cannot be edited by the current user` });	

		return res.render('edit-article', { article });
	})
	.post(async (req, res) => {
		const id = req.params.id;
		const title = req.body.title;
		const text = req.body.text;

		if (req.isAuthenticated === false)
			return res.redirect('/auth');

		const article = await getArticleById(id);

		if (!article)
			return res.status(404).render('error', { message: `Article ${id} is not found` });

		const isAuthor = req.isAuthenticated() && req.user.username === article.author;

		if (isAuthor === false)
			return res.status(401).render('error', { message: `Article ${id} cannot be edited by the current user` });	

		const data = {
			title,
			text,
			edited: new Date().toDateString()
		};
		
		await updateArticle(id, data);

		return res.redirect(`/articles/${id}`);
	});

router.route("/:id/delete")
	.get(async (req, res) => {
		const id = req.params.id;

		if (req.isAuthenticated === false)
			return res.redirect('/auth');

		const article = await getArticleById(id);

		if (!article)
			return res.status(404).render('error', { message: `Article ${id} is not found` });

		const isAuthor = req.isAuthenticated() && req.user.username === article.author;

		if (isAuthor === false)
			return res.status(401).render('error', { message: `Article ${id} cannot be deleted by the current user` });	

		return res.render('delete-article', { articleID: id });
	})
	.post(async (req, res) => {
		const id = req.params.id;

		if (req.isAuthenticated === false)
			return res.redirect('/auth');

		const article = await getArticleById(id);

		if (!article)
			return res.status(404).render('error', { message: `Article ${id} is not found` });

		const isAuthor = req.isAuthenticated() && req.user.username === article.author;

		if (isAuthor === false)
			return res.status(401).render('error', { message: `Article ${id} cannot be deleted by the current user` });	

		await removeArticle(id);

		return res.redirect(`/articles?author=${req.user.username}`);
	});	

module.exports = router;

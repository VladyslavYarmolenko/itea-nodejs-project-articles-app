const Article = require("../../db/models/article"); // TODO: setup path aliases

/**
 * @typedef Params
 * @property {string|RegExp} author
 * @property {number} limit
 * @property {number} offset
 */
null;

/**
 * @param {Params} params
 * @returns {Promise<object[]>}
 */
function getArticles(params) {
	const query = Article.find({
		author: {
			$regex: params.author,
		},
	})
		.sort({ created: "desc" })
		.skip(params.offset)
		.limit(params.limit);

	const articles = query.exec();

	return articles;
}

module.exports = getArticles;

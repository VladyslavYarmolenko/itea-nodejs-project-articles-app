const Article = require("../../db/models/article"); // TODO: setup path aliases

/**
 * @typedef Params
 * @property {string} id
 */
null;

/**
 * @param {Params} id
 * @returns {Promise<object>}
 */
function getArticleById(id) {
  const query = Article.findOne({ _id: id });

  const article = query.exec();

  return article;
}

module.exports = getArticleById;
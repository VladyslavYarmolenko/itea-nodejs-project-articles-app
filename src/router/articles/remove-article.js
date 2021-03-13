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
function removeArticle(id) {
  const removedCount = Article.deleteOne({ _id: id });

  return removedCount;
}

module.exports = removeArticle;
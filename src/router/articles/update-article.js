const Article = require("../../db/models/article"); // TODO: setup path aliases

/**
 * @typedef Params
 * @property {string} title
 * @property {string} text
 */
null;

/**
 * @param {Params} params
 * @returns {Promise<object[]>}
 */
function updateArticle(id, params) {
  const updatedArtile = Article.findOneAndUpdate({ _id: id }, params);
  
  return updatedArtile;
}

module.exports = updateArticle;

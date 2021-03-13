const Article = require("../../db/models/article"); /** TODO: setup path aliases

/**
 * @typedef Params
 * @property {string} author
 * @property {string} title
 * @property {string} text
 * @property {any} created
 */
null;

/**
 * @param {Params} params
 * @returns {Promise<object>}
 */
function createArticle(params) {
  const newArtile = new Article(params);
  
  return newArtile.save();
}

module.exports = createArticle;
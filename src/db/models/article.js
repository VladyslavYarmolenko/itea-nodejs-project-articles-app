const mongoose = require("mongoose");

/** @private */
const articleSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	created: {
		type: Date,
		required: true,
	},
	edited: Date,
});

articleSchema.index({ _id: 1, created: 1 });

/** @public */
const Article = mongoose.model("Article", articleSchema);

module.exports = Article;


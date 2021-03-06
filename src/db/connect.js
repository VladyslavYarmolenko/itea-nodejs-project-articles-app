const { URL } = require("url");
const mongoose = require("mongoose");

/** @private */
const url = new URL("mongodb+srv://cluster0.gumwa.mongodb.net?retryWrites=true&w=majority");

url.pathname = process.env.NODE_ENV;
url.username = process.env.MONGODB_USERNAME;
url.password = process.env.MONGODB_PASSWORD;

/** @public */
async function connect() {
	await mongoose.connect(url.toString(), {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	console.log(`MongoDB connected to ${mongoose.connection.host}:${mongoose.connection.port}`);
}

module.exports = connect;

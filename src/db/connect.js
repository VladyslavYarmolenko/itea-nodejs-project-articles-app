const mongoose = require("mongoose");

/** @private */
const url = new URL("mongodb+srv://cluster0.gumwa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");

url.username = process.env.MONGODB_USERNAME;
url.password = process.env.MONGODB_PASSWORD;

/** @public */
async function connect() {
	await mongoose.connect(url.toString(), {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	console.log("Connected to db");
}

module.exports = connect;

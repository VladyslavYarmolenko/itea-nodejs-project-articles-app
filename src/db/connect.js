const { URL } = require("url");
const mongoose = require("mongoose");

/** @private */
const url = new URL(`mongodb+srv://${process.env.MONGODB_CLUSTER_HOST}.mongodb.net`);

url.pathname = process.env.NODE_ENV;
url.username = process.env.MONGODB_USERNAME;
url.password = process.env.MONGODB_PASSWORD;

console.log('URL:', url)

url.searchParams.set("retryWrites", "true");
url.searchParams.set("w", "majority");

/** @public */
async function connect() {
	const { connection } = await mongoose.connect(url.toString(), {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	console.log(`MongoDB connected to ${connection.host}:${connection.port}`);
}

module.exports = connect;


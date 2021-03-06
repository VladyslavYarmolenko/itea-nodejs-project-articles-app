const app = require("./app");
const connect = require("./db/connect");

console.log(`Starting on ${app.get("env")}...`);

const port = process.env.PORT ?? 8081;

connect().then(() => {
	app.listen(port, () => {
		console.log(`Server is listening at http://localhost:${port}`);
	});
});

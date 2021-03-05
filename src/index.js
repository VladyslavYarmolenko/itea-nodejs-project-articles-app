const app = require("./app");

console.log(`Starting on ${app.get("env")}...`);

const port = process.env.PORT ?? 8081;

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`);
});

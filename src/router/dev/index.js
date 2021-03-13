const express = require("express");
// console.log(process.env)
// if (process.env.NODE_ENV !== "development")
// 	throw new Error("Development router required on non-development environment!");

const router = express.Router();

router.route("/views/:filename")
	.get((req, res) => {
		res.render(req.params.filename, Object.assign({}, req.query, {
			// custom values to pass
		}));
	});

module.exports = router;

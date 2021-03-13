const e = require("express");
const express = require("express");
const getArticles = require("./get-articles");
const createArticle = require("./create-article");

const router = express.Router();

router.route("/")
  .get(async (req, res) => {
    // ?author=<username>&pagesize=<int>&page=<int>

    const author = req.query.author || "";
    let pageSize = parseInt(req.query.pagesize, 10) || 10;
    let page = parseInt(req.query.page, 10) || 1;
    const prefersHTML = req.accepts("json", "html") === "html";

    for (const [paramName, value] of [ ["pagesize", pageSize], ["page", page] ]) {
      if (value % 1 || value < 1) {
        if (prefersHTML) {
          if (paramName === 'pagesize') 
            pageSize = 10;
          
          if (paramName === 'page')
            page = 1;    
        } else {
          return res.status(400).json({
            message: Invalid '${paramName}' query parameter,
            details: Expected (stringified) positive integer, got "${req.query[paramName]}",
          });
        }
      }
    }
    
    if (pageSize >= 100) {
      if (prefersHTML) {
        pageSize = 10;
      } else {
        return res.status(400).json({
          message: "Invalid 'pagesize' query parameter",
          details: Expected (stringified) positive integer less than 100, got "${req.query.pagesize}",
        });
      }
    }

    let articles = await getArticles({
      author: author,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    // if (!author) {
    //   if (prefersHTML) {
    //     articles = [];
    //   } else {
    //     return res.status(400).json({
    //       message: "Invalid 'author' query parameter",
    //       details: "Author it is required param",
    //     });
    //   }
    // }

    const prevPage = page <= 1 ? null : /articles?author=${author}&pagesize=${pageSize}&page=${page - 1};
    const nextPage = articles.length < pageSize ? null : /articles?author=${author}&pagesize=${pageSize}&page=${page + 1};

    // user prefers html
    if (req.accepts("json", "html") === "html") // TODO: extract in src/router/{middleware}.js
      return res.render("articles", {
        articles,
        pagination: { prevPage, nextPage },
      });

    // user accepts json
    if (req.accepts("json"))
      return res.json({ articles, nextPage, prevPage });

    res.sendStatus(415);
  })
  .post(async (req, res) => {
    const title = req.body.title;
    const text = req.body.text;
    const author = req.user.username;
    const created = new Date().toDateString();

    const prefersHTML = req.accepts("json", "html") === "html";
    
    if (req.isAuthenticated() === false)
      return res.redirect('/auth');

    const data = {
      title,
      text,
      author,
      created
    };  

    const article = await createArticle(data);  

    console.log('ARTICLE', article)
    // if (!prefersHTML)
      
    
  });

router.route("/create")
  .get((req, res) => {
    const prefersHTML = req.accepts("json", "html") === "html";

    if (prefersHTML === false)
      return res.sendStatus(406);

    if (req.isAuthenticated() === false)
      res.redirect('/auth');

    return res.render("create-article");
  });  
	
module.exports = router;
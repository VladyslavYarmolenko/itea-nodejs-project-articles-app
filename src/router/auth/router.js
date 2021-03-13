const express = require("express");
const passport = require("passport");
const sendStatus = require("../send-status");

const router = express.Router();

router.route("/")
  .get((req, res) => {
    const prefersHTML = req.accepts("json", "html") === "html"; // TODO: extract in src/router/{middleware}.js

    if (req.isAuthenticated()) {
        // user prefers html
      if (prefersHTML)
        return res.render("user", { user: req.user });

      else
        return res.json(req.user);
    }

    // user is not authenticated
    if (!prefersHTML)
      return res.sendStatus(401);

    res.status(401).render("login");
  })
  .post(passport.authenticate("local", { successRedirect: "/auth", failureRedirect: '/auth' }))
  .delete((req, res) => {
    const prefersHTML = req.accepts("json", "html") === "html"; 

    if (prefersHTML)
      return res.sendStatus(406);

    if (req.isAuthenticated())
      req.logout();

    return res.redirect('/auth');
  })
  .all(sendStatus(405));

router.route("/logout")
  .post((req, res) => {
    const prefersHTML = req.accepts("json", "html") === "html";

    if (!prefersHTML)
      return res.sendStatus(406);

    if (req.isAuthenticated())
      req.logout();

    return res.redirect('/auth');
  })
  .all(sendStatus(405));

module.exports = router;
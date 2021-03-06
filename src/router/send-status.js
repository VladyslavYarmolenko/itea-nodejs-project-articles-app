const express = require("express");

/**
 * @public
 * @returns {express.RequestHandler}
 */
const sendStatus = (status) => (req, res) => res.sendStatus(status);

module.exports = sendStatus;

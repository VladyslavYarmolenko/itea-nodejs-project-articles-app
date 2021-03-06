/** @public */
const sendStatus = (status) => (req, res) => res.sendStatus(status);

module.exports = sendStatus;

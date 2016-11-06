var config = require('../config');

module.exports = function (req, res, next) {
    // Check if the current date is before the wedding date.
    req.afterEvent = Date.now() > config.date;
    next();
};

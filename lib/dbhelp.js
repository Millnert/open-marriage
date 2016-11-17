var pg = require('pg'),
    config = require('../config');

exports.runQuery = runQuery;

function runQuery(query, values, callback) {
    pg.connect(config.database, function (err, db, done) {
        if (err) { return callback(err); }

        db.query(query, values, function (err, results) {
            done();
            callback(err, results && results.rows[0]);
        });
    });
}

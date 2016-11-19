var async = require('async'),
    dbm   = require('db-migrate'),
    type  = dbm.dataType;

exports.up = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE guests DROP CONSTRAINT drink;"),
        db.runSql.bind(db,
            "ALTER TABLE guests " +
            "ADD CONSTRAINT drink CHECK (drink IN ('alcohol', 'non-alcohol', 'no-alcohol'));")
    ], callback);
};

exports.down = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE guests DROP CONSTRAINT drink;"),
        db.runSql.bind(db,
            "ALTER TABLE guests " +
            "ADD CONSTRAINT drink CHECK (meal IN ('alcohol', 'non-alcohol'));")
    ], callback);
};

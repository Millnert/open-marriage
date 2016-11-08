var async = require('async'),
    dbm   = require('db-migrate'),
    type  = dbm.dataType;

exports.up = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE guests ALTER COLUMN is_attending_badminton DROP DEFAULT;"),
	db.runSql.bind(db, "ALTER TABLE guests ALTER COLUMN is_attending_badminton DROP NOT NULL;"),
    ], callback);
};

exports.down = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE guests ALTER COLUMN is_attending_badminton SET DEFAULT;"),
	db.runSql.bind(db, "ALTER TABLE guests ALTER COLUMN is_attending_badminton SET NOT NULL;"),
    ], callback);
};

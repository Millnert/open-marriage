var async = require('async'),
    dbm   = require('db-migrate'),
    type  = dbm.dataType;

exports.up = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE guests DROP CONSTRAINT meal;"),
        db.renameColumn.bind(db, 'guests', 'meal', 'drink'),
        db.changeColumn.bind(db, 'guests', 'drink', {
	    type  : 'string',
	    length: 12
	}),
        db.runSql.bind(db,
            "ALTER TABLE guests " +
            "ADD CONSTRAINT drink CHECK (drink IN ('alcohol', 'non-alcohol'));")
    ], callback);
};

exports.down = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE guests DROP CONSTRAINT drink;"),
	db.renameColumn('guests', 'drink', 'meal'),
        db.changeColumn.bind(db, 'guests', 'meal', {
            type  : 'string',
            length: 8
        }),
        db.runSql.bind(db,
            "ALTER TABLE guests " +
            "ADD CONSTRAINT meal CHECK (meal IN ('seafood', 'beef', 'veggie'));")
    ], callback);
};

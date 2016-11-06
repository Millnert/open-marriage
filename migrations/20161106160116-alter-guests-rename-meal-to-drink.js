var async = require('async'),
    dbm   = require('db-migrate'),
    type  = dbm.dataType;

exports.up = function (db, callback) {
    async.series([
	db.runSql.bind(db, "ALTER TABLE GUESTS DROP CONSTRAINT meal;"),
        db.delColumn.bind(db, 'guests', 'meal'),
        db.addColumn.bind(db, 'guests', 'drink', {
            type  : 'string',
            length: 8
        }),

        db.runSql.bind(db,
            "ALTER TABLE guests " +
            "ADD CONSTRAINT drink CHECK (drink IN ('alcohol', 'non-alcohol'));")
    ], callback);
};

exports.down = function (db, callback) {
    db.removeColumn('guests', 'meal', callback);
};

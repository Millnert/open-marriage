var async = require('async'),
    dbm   = require('db-migrate'),
    type  = dbm.dataType;

exports.up = function (db, callback) {
    db.renameColumn('guests', 'is_attending_brunch', 'is_attending_badminton', callback);
};

exports.down = function (db, callback) {
    db.renameColumn('guests', 'is_attending_badminton', 'is_attending_brunch', callback);
};

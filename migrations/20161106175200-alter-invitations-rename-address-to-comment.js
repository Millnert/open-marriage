var async = require('async'),
    dbm   = require('db-migrate'),
    type  = dbm.dataType;

exports.up = function (db, callback) {
    db.renameColumn('invitations', 'address', 'comment', callback);
};

exports.down = function (db, callback) {
    db.renameColumn('invitations', 'comment', 'address', callback);
};

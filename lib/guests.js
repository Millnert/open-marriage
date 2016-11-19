var pg     = require('pg'),
    dbhelp = require('../lib/dbhelp'),

    GUEST_BY_ID      = 'SELECT * FROM guests WHERE id=$1 LIMIT 1',
    GUEST_BY_EMAIL   = 'SELECT * FROM guests WHERE email=$1 LIMIT 1',
    UPDATE_GUEST     = 'UPDATE guests SET $UPDATES WHERE id=$1',
    INVITATION_BY_ID = 'SELECT * FROM invitations WHERE id=$1 LIMIT 1',
    ADDGUEST_TO_INV  = 'INSERT INTO guests (invitation_id, name, is_plusone) VALUES($1, $2, true)',
    DELGUEST         = 'DELETE FROM guests WHERE id = $1 AND is_plusone = true',
    INV_BY_GUEST_ID  = 'SELECT i.id AS id, g.name AS name FROM invitations i INNER JOIN guests g ON g.invitation_id = i.id WHERE g.id = $1',

    UPDATE_SCHEMA = {
        title                 : true,
        name                  : true,
        is_attending          : true,
        is_attending_badminton: true,
        drink                 : true
    };

exports.DRINKS = [
    {id: 'alcohol',     label: 'Alcohol'},
    {id: 'non-alcohol', label: 'Non-Alcohol (< 0.5%)'},
    {id: 'no-alcohol',  label: 'No Alcohol (0.0%)'},
];

exports.loadGuest        = loadGuest;
exports.loadGuestByEmail = loadGuestByEmail;
exports.updateGuest      = updateGuest;
exports.addGuest         = addGuest;
exports.deleteGuest      = deleteGuest;

function loadGuest(id, callback) {
    dbhelp.runQuery(GUEST_BY_ID, [id], callback);
}

function loadGuestByEmail(email, callback) {
    dbhelp.runQuery(GUEST_BY_EMAIL, [email], callback);
}

function updateGuest(id, changes, callback) {
    var values  = [id],
        updates = [],
        query;

    Object.keys(UPDATE_SCHEMA).forEach(function (col) {
        if (col in changes) {
            updates.push(col + '=$' + values.push(changes[col]));
        }
    });

    query = UPDATE_GUEST.replace('$UPDATES', updates.join(', '));

    dbhelp.runQuery(query, values, callback);
}

function addGuest(invitation_id, callback) {
    var inv_id        = [invitation_id],
	insert_values = [invitation_id, 'New Guest'],
	chk_query     = INVITATION_BY_ID,
	ins_query     = ADDGUEST_TO_INV;

    dbhelp.runQuery(chk_query, inv_id, function(err, invitation) {
        if (err) { return callback(err); }
        if (!invitation) { return callback(err); }

	if (!invitation.allow_plusone) {
	    return res.redirect('/rsvp/');
	}

        dbhelp.runQuery(ins_query, insert_values, function(err, result) {
            if (err) { return callback(err); }
            if (!result) { return callback(err); }
	    console.log('result: %s', result);
	});

    });
}

function deleteGuest(invitation_id, guest_id, callback) {
    var guest_id_arr  = [guest_id],
	chk_query     = INV_BY_GUEST_ID;
	del_query     = DELGUEST;

	/**
	 *  Input: Invitation ID of session
	 *         Guest ID that is to be deleted
	 *  1. Lookup invitation id given guest ID
	 *  2. Compare looked up invitation's id with argument invitation_id
	 *  3. Delete guest if compare matches
	 */
    dbhelp.runQuery(chk_query, guest_id_arr, function(err, invitation) {
        if (err) { return callback(err); }
        if (!invitation) { return callback(err); }

        console.log("lib/guests.js:deleteGuest(): invitation.id: %s", invitation.id);
	if (invitation.id != invitation_id) {
	    console.log("ids don't match");
	    return;
	}

        dbhelp.runQuery(del_query, guest_id_arr, function(err, result) {
            if (err) { return callback(err); }
            if (!result) { return callback(err); }
	    console.log('result: %s', result);
	});

    });
}

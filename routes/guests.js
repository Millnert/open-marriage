var guests = require('../lib/guests');

exports.read        = read;
exports.update      = update;
exports.addGuest    = addGuest;
exports.deleteGuest = deleteGuest;

function read(req, res, next) {
    res.json(req.guest);
}

function update(req, res, next) {
    guests.updateGuest(req.guest.id, req.body, function (err) {
        if (err) { return next(err); }
        res.send(204);
    });
}

function addGuest(req, res, next) {
    guests.addGuest(req.invitation.id, function (err) {
        if (err) { return next(err); }
	res.send(204);
    });
}

function deleteGuest(req, res, next) {
    guests.deleteGuest(req.invitation.id, req.guest.id, function (err) {
        if (err) { return next(err); }
	res.send(204);
    });
}

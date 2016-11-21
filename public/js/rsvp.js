YUI.add('le-rsvp', function (Y) {

    // -- Y.Models Overrides ---------------------------------------------------

    Y.Model.prototype.promiseSave = function (options) {
        var model = this;

        return new Y.Promise(function (resolve, reject) {
            model.save(options, function (err, res) {
                return err ? reject(err) : resolve(res);
            });
        });
    };

    Y.ModelSync.REST.prototype._sendSyncIORequest = function (config) {
        return Y.io.queue(config.url, {
            'arguments': {
                action  : config.action,
                callback: config.callback,
                url     : config.url
            },

            context: this,
            data   : config.entity,
            headers: config.headers,
            method : config.method,
            timeout: config.timeout,

            on: {
                start  : this._onSyncIOStart,
                failure: this._onSyncIOFailure,
                success: this._onSyncIOSuccess,
                end    : this._onSyncIOEnd
            }
        });
    };

    // -- Models ---------------------------------------------------------------

    Y.Guest = Y.Base.create('guest', Y.Model, [Y.ModelSync.REST], {
        root: '/guests/',

        drinkLabel: function () {
            var drink = '';

            Y.Array.some(Y.Guest.DRINKS, function (drinkOption) {
                if (drinkOption.id === this.get('drink')) {
                    drink = drinkOption.label;
                    return true;
                }
            }, this);

            return drink;
        }
    }, {
        DRINKS: YUI.Env.LE.DRINKS
    });


    Y.Guests = Y.Base.create('guests', Y.ModelList, [Y.ModelSync.REST], {
        model: Y.Guest,

        attending: function () {
            return this.filter({asList: true}, function (guest) {
                return guest.get('is_attending');
            });
        },

        attending_badminton: function () {
            return this.filter({asList: true}, function (guest) {
                return guest.get('is_attending_badminton');
            });
        },

        invited: function () {
            return this.filter({asList: true}, function (guest) {
                return !guest.get('is_plusone');
            });
        },

        plusones: function () {
            return this.filter({asList: true}, function (guest) {
                return guest.get('is_plusone');
            });
        },

        names: function (guests) {
            return (guests || this).filter({asList: true}, function (guest) {
                return !!guest.get('name');
            }).map(function (guest) {
                return Y.Escape.html(guest.get('name').split(' ')[0]);
            });
        }
    });


    Y.Invitation = Y.Base.create('invitation', Y.Model, [Y.ModelSync.REST], {
        root: '/invitations/',

        initializer: function () {
            this.guests = new Y.Guests({bubbleTargets: this});
        },

        confirm: function () {
            var url = this.getURL() + 'confirm';

            return new Y.Promise(function (resolve, reject) {
                Y.io.queue(url, {
                    method : 'POST',
                    headers: {'X-CSRF-Token': YUI.Env.CSRF_TOKEN},

                    on: {
                        failure: reject,
                        success: resolve
                    }
                });
            });
        },

        _setGuests: function (guests) {
            return this.guests.reset(guests);
        }
    }, {
        ATTRS: {
            guests: {setter: '_setGuests'}
        }
    });

    // -- Views ----------------------------------------------------------------

    Y.InvitationView = Y.Base.create('invitationView', Y.View, [], {
        guestNeedsDrinkMsg: 'Choose which Drink Option you prefer.',
        invitationDoneMsg: 'Everything is set with your invitation response.',

        events: {
            '[data-edit]'               : {click: 'edit'},
            '[data-done]'               : {click: 'done'},
            '[data-add-guest]'          : {click: 'addGuest'},
	    '[data-delete-guest]'       : {click: 'deleteGuest'},
            '[data-attending]'          : {click: 'proposeUpdates'},
            '[data-attending-badminton]': {click: 'proposeUpdates'},
            '[data-drink]'              : {click: 'proposeUpdates'},
            'input, textarea'           : {blur: 'proposeUpdates'}
        },

        initializer: function () {
            this.get('invitation').after('*:change', this.syncUI, this);
        },

        edit: function (e) {
            if (e) { e.preventDefault(); }
            this.get('container').addClass('is-inv-editing');
        },

        done: function (e) {
            var invitation = this.get('invitation');

            if (e) { e.preventDefault(); }
            this.get('container').removeClass('is-inv-editing');

            invitation.get('guests').plusones().each(function (guest) {
                if (!guest.get('name')) {
                    guest.set('is_attending', null);
                    this.getGuestNode(guest).addClass('guest-available');
                }
            }, this);

            this.proposeUpdates({src: 'done'});
	    this.syncUI();
        },

        addGuest: function (e) {
            if (e) { e.preventDefault(); }

            this.get('container').all('.guest').removeClass('guest-available');

	    var guest = {
		invitation_id: this.get('invitation').get('id')
	    };
            this.fire('addGuest', {
		guest: guest
	    	});
        },

        deleteGuest: function (e) {
            if (e) { e.preventDefault(); }
	    var guest_container = e.target.get('parentNode').get('parentNode').get('parentNode').get('parentNode'),
		guest_id = parseInt(guest_container.getData('guest'));

            this.fire('deleteGuest', {
		guest_id: guest_id
	    	});
        },

        getGuestNode: function (guest) {
            var id = guest.get('id');
            return this.get('container').one('[data-guest="' + id + '"]');
        },

        proposeUpdates: function (e) {
            var container = this.get('container'),
                invitation;

            invitation = {
                comment: container.one('[data-comment]').get('value'),
                guests : []
            };

            container.all('[data-guest]').each(function (node) {
                var drink = null;

                node.all('[data-drink]').some(function (drinkOption) {
                    if (drinkOption.get('checked')) {
                        drink = drinkOption.get('value');
                        return true;
                    }
                });

                invitation.guests.push({
                    id                    : parseInt(node.getData('guest'), 10),
                    title                 : node.one('[data-title]').get('value'),
                    name                  : node.one('[data-name]').get('value'),
                    is_attending          : node.one('[data-attending]').get('checked'),
                    is_attending_badminton: node.one('[data-attending-badminton]').get('checked'),
                    drink                 : drink
                });
            });

            this.fire('invitationUpdate', {
                src    : e && e.src,
                updates: invitation
            });
        },

        syncUI: function () {
            var container  = this.get('container'),
                invitation = this.get('invitation'),
                guestsNeedsDrink;

	    console.log("doing syncUI()");

            guestsNeedsDrink = invitation.get('guests').some(function (guest) {
                return guest.get('is_attending') && !guest.get('drink');
            });

            container.one('.inv-status').set('text', guestsNeedsDrink ?
                this.guestNeedsDrinkMsg : this.invitationDoneMsg);

            container.all('comment, [data-comment]')
                .setHTML(Y.Escape.html(invitation.get('comment')));

            invitation.get('guests').each(function (guest) {
                var node                 = this.getGuestNode(guest),
                    isAttending          = guest.get('is_attending');
                    isAttendingBadminton = guest.get('is_attending_badminton');

                if (!node) { return; }

                node.toggleClass('is-guest-attending', isAttending);

                node.one('.guest-title').set('text', guest.get('title'));
                node.one('[data-title]').set('value', guest.get('title'));

                node.one('.guest-name').set('text', guest.get('name'));
                node.one('[data-name]').set('value', guest.get('name'));

                node.one('[data-attending]').set('checked', isAttending);

                node.one('[data-attending-badminton]').set('checked', isAttendingBadminton);
		if (isAttendingBadminton) {
		    node.one('.guest-attending-badminton b').set('text', 'Attending Badminton');
		} else {
		    node.one('.guest-attending-badminton b').set('text', 'Not Attending Badminton');
		}

                node.one('.guest-drink span').set('text', guest.drinkLabel());
                node.all('[data-drink]').set('checked', false)
                    .filter('[value=' + guest.get('drink') + ']')
                        .set('checked', true);
            }, this);
        }
    });


    Y.AnnouncementView = Y.Base.create('announcementView', Y.View, [], {
        namesSeparator : ' <span class="ann-sep">&amp;</span> ',
        attendingMsg   : 'Yay, I’m Happy You’ll Be Attending!',
        notAttendingMsg: 'I’m Sorry You Won’t Be Attending.',

        initializer: function () {
            this.get('guests').after('guest:change', this.syncUI, this);
        },

        syncUI: function () {
            var container = this.get('container'),
                guests    = this.get('guests'),
                attending = guests.attending(),
                names     = guests.names(attending.size() && attending),
                msg;

            container.one('.ann-primary')
                .setHTML(names.join(this.namesSeparator) + ',');

            msg = attending.size() ? this.attendingMsg : this.notAttendingMsg;
            container.one('.ann-secondary').setHTML(msg);
        }
    });


    Y.RsvpView = Y.Base.create('rsvpView', Y.View, [], {
        events: {
            '[data-attending]': {click: 'rsvp'}
        },

        rsvp: function (e) {
            var isAttending = e.currentTarget.getData('attending') === 'true';
            this.fire('rsvp', {isAttending: isAttending});
        }
    });


    Y.AttendingView = Y.Base.create('attendingView', Y.View, [], {
        initializer: function () {
            var container  = this.get('container'),
                invitation = this.get('invitation');

            this.announcementView = new Y.AnnouncementView({
                container    : container.one('.ann'),
                guests       : invitation.get('guests'),
                bubbleTargets: this
            }).attachEvents();

            this.invitationView = new Y.InvitationView({
                container    : container.one('.inv'),
                invitation   : invitation,
                bubbleTargets: this
            }).attachEvents();
        }
    });


    Y.NotAttendingView = Y.Base.create('notAttendingView', Y.View, [], {
        initializer: function () {
            this.invitationView = new Y.InvitationView({
                container    : this.get('container').one('.inv'),
                invitation   : this.get('invitation'),
                bubbleTargets: this
            }).attachEvents();
        }
    });

    // -- App ------------------------------------------------------------------

    var app = new Y.App({
        container      : '#main',
        viewContainer  : '#main',
        contentSelector: '#main',
        linkSelector   : null,

        transitions: true,
        root       : '/rsvp/',

        views: {
            rsvp        : {type: Y.RsvpView},
            attending   : {type: Y.AttendingView},
            notAttending: {type: Y.NotAttendingView}
        }
    });

    app.invitation     = new Y.Invitation(YUI.Env.LE.invitation);
    app.initialContent = Y.one('#main > [data-view]');

    app.rsvp = function (isAttending) {
        var invitation = this.invitation.set('rsvpd', true),
            guests     = invitation.get('guests');

        if (isAttending) {
            guests.invited().invoke('set', 'is_attending', true);
        } else {
            guests.invoke('set', 'is_attending', false);
        }

        return this.saveInvitation().then(function () {
            if (isAttending) {
                app.needsConfirmation = true;
                app.replace('');
            } else {
                app.invitation.confirm().then(function () {
                    app.replace('');
                });
            }
        });
    };

    app.addGuest = function (inv_id) {
	var guest = new Y.Guest({invitation_id: inv_id});

        guest.save(function (err, response) {
	    if (!err) {
                location.reload(true);
	    }
	});
    };

    app.deleteGuest = function (guest_id) {
	var invitation = this.invitation,
            guests     = invitation.get('guests'),
	    guest      = guests.getById(guest_id);

	guest.destroy({remove: true}, function (err, response) {
	    if (!err) {
		location.reload(true);
	    }
	});
    };

    app.updateInvitation = function (updates) {
        updates || (updates = {});

        var invitation   = this.invitation,
            guests       = invitation.get('guests'),
            guestUpdates = updates.guests || [];

        delete updates.guests;
        invitation.setAttrs(updates);

        Y.Array.each(guestUpdates, function (gUpdates) {
            var guest = guests.getById(gUpdates.id);
            if (guest) {
                guest.setAttrs(gUpdates);
            }
        });

        return this.saveInvitation();
    };

    app.saveInvitation = function () {
        var invitation = this.invitation,
            guests     = invitation.get('guests'),
            saves      = [];

        saves.push(invitation.isModified() && invitation.promiseSave());
        saves.push.apply(saves, guests.map(function (guest) {
            return guest.isModified() && guest.promiseSave();
        }));

        return Y.batch.apply(null, saves);
    },

    app.route('/', 'loadContent', function (req, res, next) {
        var content = res.content.node.one('[data-view]');

        this.once('activeViewChange', function (e) {
            if (this.invitation.get('guests').attending().size()) {
                e.newVal.invitationView.edit();
            }
        });

        this.showContent(content, {
            view: {
                name  : content.getData('view'),
                config: {invitation: this.invitation}
            }
        });
    });

    app.on('*:rsvp', function (e) {
        this.rsvp(e.isAttending);
    });

    app.on('*:addGuest', function (e) {
        console.log('app.on(addGuest):e: %s', e);
        console.log('app.on(addGuest):e.guest: %s', e.guest);
        console.log('app.on(addGuest):e.guest.invitation_id: %s', e.guest.invitation_id);
	this.addGuest(e.guest.invitation_id);
    });

    app.on('*:deleteGuest', function (e) {
        console.log('app.on(deleteGuest):e: %s', e);
        console.log('app.on(deleteGuest):e.guest_id: %s', e.guest_id);
	this.deleteGuest(e.guest_id);
    });

    app.on('*:invitationUpdate', function (e) {
        this.updateInvitation(e.updates).then(function () {
            if (e.src === 'done' && app.needsConfirmation) {
                app.needsConfirmation = false;
                app.invitation.confirm();
            }
        });
    });

    app.render().showContent(app.initialContent, {
        transition: false,

        view: {
            name  : app.initialContent.getData('view'),
            config: {invitation: app.invitation}
        }
    });

}, '1.8.0', {
    requires: [
        'le-main',
        'app-base',
        'app-content',
        'app-transitions',
        'escape',
        'event-focus',
        'io-queue',
        'model',
        'model-list',
        'model-sync-rest',
        'selector-css3',
        'view',
        'promise'
    ]
});

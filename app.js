var combo   = require('combohandler'),
    express = require('express'),
    exphbs  = require('express3-handlebars'),
    state   = require('express-state'),

    config     = require('./config'),
    helpers    = require('./lib/helpers'),
    middleware = require('./middleware'),
    routes     = require('./routes'),

    app = express();

// -- Configure ----------------------------------------------------------------

app.set('name', 'Martin Millnert Open-Event');
app.set('env', config.env);
app.set('port', config.port);
app.set('views', config.dirs.views);
app.set('view engine', 'hbs');
app.set('state namespace', 'YUI.Env.LE');
app.enable('strict routing');

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname      : '.hbs',
    helpers      : helpers,
    layoutsDir   : config.dirs.layouts,
    partialsDir  : config.dirs.partials
}));

// -- Locals -------------------------------------------------------------------

app.expose(config.yui.config, 'window.YUI_config');

app.locals({
    title   : 'Behnaz PhD Dissertation',
    appTitle: 'Behnaz PhD Dissertation',

    version    : config.version,
    yui_version: config.yui.version,

    nav: [
        {id: 'event',       url: '/event/',       label: 'Event'},
        {id: 'rsvp',        url: '/rsvp/',        label: 'RSVP'}
    ],

    yui_module: 'le-main',

    pictos : config.pictos,
    typekit: config.typekit,

    isDevelopment: config.isDevelopment,
    isProduction : config.isProduction,

    min: config.isProduction ? '-min' : ''
});

// -- Middleware ---------------------------------------------------------------

if (config.isDevelopment) {
    app.use(express.logger('tiny'));
}

app.use(express.compress());
app.use(express.favicon(config.dirs.pub + '/favicon.ico'));
app.use(express.cookieParser());
app.use(express.cookieSession(config.session));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.csrf());
app.use(middleware.csrfToken);
app.use(middleware.invitation);
app.use(middleware.pjax('bare'));
app.use(middleware.checkDate);
app.use(app.router);
app.use(middleware.slash());
app.use(express.static(config.dirs.pub));
app.use(middleware.notfound);

if (config.isDevelopment) {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack     : true
    }));
} else {
    app.use(middleware.error);
}

// -- Routes -------------------------------------------------------------------

app.get('/', routes.render('home'));

app.get('/event/', routes.render('event'));

app.get('/badminton/',         routes.render('badminton'));

app.get( '/rsvp/',                          routes.rsvp.pub, routes.rsvp.edit);
app.post('/rsvp/',                          routes.rsvp.resend);
app.get( '/rsvp/:invitation_key',           routes.rsvp.login);

app.all( '/invitations/:invitation/*',        middleware.auth.ensureInvitation);
app.get( '/invitations/:invitation/',         routes.invitations.read);
app.put( '/invitations/:invitation/',         routes.invitations.update);
app.get( '/invitations/:invitation/guests',   routes.invitations.readGuests);
//app.post('/invitations/:invitation/addguest', routes.invitations.addGuest);
app.post('/invitations/:invitation/confirm',  routes.invitations.confirm);

app.post('/guests/', routes.guests.addGuest);
app.all( '/guests/:guest/', middleware.auth.ensureGuest);
app.get( '/guests/:guest/', routes.guests.read);
app.put( '/guests/:guest/', routes.guests.update);
app.delete( '/guests/:guest/', routes.guests.deleteGuest);

app.get('/yui', [
    combo.combine({rootPath: config.dirs.yui}),
    combo.respond
]);

app.get('/combo/:version', [
    combo.combine({rootPath: config.dirs.pub}),
    combo.respond
]);

module.exports = app;

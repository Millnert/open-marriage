var isProduction = process.env.NODE_ENV === 'production',
    version      = require('../package').version,

    YUI_VERSION = '3.18.1';

exports.version = YUI_VERSION;
exports.config  = {
    combine: isProduction,
    filter : isProduction ? 'min' : 'raw',
    root   : 'build/' + YUI_VERSION + '/',
    comboBase : '///yui?',

    modules: {
        'mapbox-css': 'https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.css',

        'mapbox': {
            fullpath: 'https://api.mapbox.com/mapbox.js/v2.4.0/mapbox.js',
            requires: ['mapbox-css']
        },

        'mapbox-gl-css': 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.26.0/mapbox-gl.css',

        'mapbox-gl': {
            fullpath: 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.26.0/mapbox-gl.js',
            requires: ['mapbox-gl-css']
        },

	'mapboxgltest': '/js/mapboxgltest.js'
    },

    groups: {
        'app': {
            combine  : isProduction,
            comboBase: '/combo/' + version + '?',
            base     : '/',
            root     : '/',

            modules: {
                'hide-address-bar': {
                    path: 'vendor/hide-address-bar/hide-address-bar.js'
                },

                'le-home': {
                    use: ['le-main', 'le-maps']
                },

                'le-main': {
                    path    : 'js/main.js',
                    requires: ['node-base', 'hide-address-bar']
                },

                'le-maps': {
                    path    : 'js/maps.js',
                    requires: ['node-base', 'mapbox', 'mapbox-gl', 'mapboxgltest']
                },

                'le-rsvp': {
                    path    : 'js/rsvp.js',
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
                },

                'le-event': {
                    path: 'js/event.js',
                    requires: ['le-main', 'le-maps', 'event-resize', 'graphics']
                }
            }
        }
    }
};

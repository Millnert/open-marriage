YUI.add('le-maps', function (Y) {

    var isRetina = Y.config.win.devicePixelRatio >= 2;

    Y.all('[data-map]').each(function (mapNode) {
        L.mapbox.accessToken = 'pk.eyJ1IjoibWlsbG5lcnQiLCJhIjoiY2l2NnUxNjF2MDAwMTJ4bXZqNmJ4eHZuMiJ9.8CvG2KOAWS3dzDzPFBDNkg';
        var map = L.mapbox.map('map', 'mapbox.streets').setView([55.710, 13.208], 18);
    });

}, '1.8.0', {
    requires: ['node-base', 'mapbox']
});

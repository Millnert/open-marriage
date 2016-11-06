YUI.add('le-maps', function (Y) {

    var isRetina = Y.config.win.devicePixelRatio >= 2;

    Y.all('[data-map]').each(function (mapNode) {
	/*
        L.mapbox.accessToken = 'pk.eyJ1IjoibWlsbG5lcnQiLCJhIjoiY2l2NnUxNjF2MDAwMTJ4bXZqNmJ4eHZuMiJ9.8CvG2KOAWS3dzDzPFBDNkg';
        var map = L.mapbox.map('map', 'mapbox.streets').setView([55.710, 13.208], 18);
	*/
	mapboxgl.accessToken = 'pk.eyJ1IjoibWlsbG5lcnQiLCJhIjoiY2l2NnUxNjF2MDAwMTJ4bXZqNmJ4eHZuMiJ9.8CvG2KOAWS3dzDzPFBDNkg';
        var map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
            center: [13.208, 55.710], // starting position
            zoom: 18 // starting zoom
});
    });

}, '1.8.0', {
    requires: ['node-base', 'mapbox-gl']
});

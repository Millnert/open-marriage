YUI.add('le-maps', function (Y) {

    var supportlevel = 0;

    if (mapboxgl.supported({failIfMajorPerformanceCaveat: true})) {
        console.log('mapbox-gl-js fully supported');
	supportlevel = 2;
    } else if (mapboxgl.supported({failIfMajorPerformanceCaveat: false})) {
	console.log('mapbox-gl-js not fully supported');
        supportlevel = 1;
    } else {
	console.log('mapbox-gl-js not supported');
	supportlevel = 0;
    }

    var isRetina = Y.config.win.devicePixelRatio >= 2;

    if (supportlevel < 2) {
        L.mapbox.accessToken = 'pk.eyJ1IjoibWlsbG5lcnQiLCJhIjoiY2l2NnUxNjF2MDAwMTJ4bXZqNmJ4eHZuMiJ9.8CvG2KOAWS3dzDzPFBDNkg';
        var map = L.mapbox.map('map', 'mapbox.streets').setView([55.710529, 13.207675], 13);
    } else {
        Y.all('[data-map]').each(function (mapNode) {
        mapboxgl.accessToken = 'pk.eyJ1IjoibWlsbG5lcnQiLCJhIjoiY2l2NnUxNjF2MDAwMTJ4bXZqNmJ4eHZuMiJ9.8CvG2KOAWS3dzDzPFBDNkg';
            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/millnert/civ6u34b500572ilc703iaagy', //stylesheet location
                center: [13.207675, 55.710529], // starting position
                zoom: 17 // starting zoom
            });
        });
    }

}, '1.8.0', {
    requires: ['node-base', 'mapbox-gl']
});

YUI.add('le-maps', function (Y) {

    var supportlevel = 0,
	accesstoken = 'pk.eyJ1IjoibWlsbG5lcnQiLCJhIjoiY2l2NnUxNjF2MDAwMTJ4bXZqNmJ4eHZuMiJ9.8CvG2KOAWS3dzDzPFBDNkg',
	style = 'mapbox://styles/millnert/civ6u34b500572ilc703iaagy',
	lat = 55.710529,
	lon = 13.207675,
	zoom = 17;

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
        L.mapbox.accessToken = accesstoken;
        var map = L.mapbox.map('map', 'mapbox.streets').setView([lat, lon], (zoom+1));
	L.mapbox.styleLayer(style).addTo(map);
    } else {
        Y.all('[data-map]').each(function (mapNode) {
        mapboxgl.accessToken = accesstoken;
            var map = new mapboxgl.Map({
                container: 'map',
                style: style,
                center: [lon, lat],
                zoom: zoom
            });
        });
    }

}, '1.8.0', {
    requires: ['node-base', 'mapbox', 'mapbox-gl']
});

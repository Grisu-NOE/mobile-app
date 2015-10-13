angular.module('grisu-noe').factory('geoService', function($http, $q, $window, $cordovaGeolocation) {
    var geocodeAddr = 'https://maps.googleapis.com/maps/api/geocode/json';
    var wastlHydrantsAddr = 'https://secure.florian10.info/ows/infoscreen/geo/umkreis.ashx';
    var httpTimeout = 30000;

    return {
        geocodeAddress: function(address) {
            var deferred = $q.defer();

            $http.get(geocodeAddr, {
                timeout: httpTimeout,
                params: {
                    address: address
                }
            }).success(function(data) {
                console.info('Geocoding data loaded from Google server', data);
                deferred.resolve(data);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error with geocoding', code, data);
            });

            return deferred.promise;
        },

        findHydrantsForPosition: function(lat, lng) {
            var deferred = $q.defer();

            $http.get(wastlHydrantsAddr, {
                timeout: httpTimeout,
                params: {
                    lat: lat,
                    lng: lng
                }
            }).success(function(data) {
                console.info('Hydrants for position "' + lat + ', ' + lng + '" loaded from server', data);
                deferred.resolve(data);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error loading hydrants for position  "' + lat + ', ' + lng + '". Error code', code);
            });

            return deferred.promise;
        },

        getCurrentPosition: function() {
            var deferred = $q.defer();

            //Wolfsgraben
            var position = {
                lat: 48.16387421351802,
                lng: 16.12121343612671
            };

            if (!$window.cordova) {
                console.debug('faking geolocation using Wolfsgraben as starting point');
                deferred.resolve(position);
                return deferred.promise;
            }

            console.debug('calculating coordinates with Cordova\'s geolocation plugin');
            var posOptions = {timeout: 10000, enableHighAccuracy: false};

            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(result) {
                position.lat = result.coords.latitude;
                position.lng = result.coords.longitude;
                deferred.resolve(position);
                console.debug('calculated current position: ' + position.lat + ', ' + position.lng);
            }, function(error) {
                deferred.reject(error);
                console.error('error calculating current position: ' + angular.toJson(error, true));
            });

            return deferred.promise;
        },

        getStandardLayers: function(overlaysActive) {
            if (angular.isUndefined(overlaysActive)) {
                overlaysActive = true;
            }

            return {
                baselayers: {
                    basemap: {
                        name: 'basemap.at',
                        type: 'xyz',
                        url: 'http://maps{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg',
                        layerOptions: {
                            subdomains: ['', '1', '2', '3', '4']
                        }
                    },
                    osm: {
                        name: 'OpenStreetMap',
                        type: 'xyz',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    },
                    hybrid: {
                        name: 'Satellit',
                        type: 'xyz',
                        url: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
                        layerOptions: {
                            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                        }
                    },
                    terrain: {
                        name: 'Gel&auml;nde',
                        type: 'xyz',
                        url: 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
                        layerOptions: {
                            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                        }
                    }
                },
                overlays: {
                    fire: {
                        name: 'OpenFireMap',
                        type: 'xyz',
                        visible: overlaysActive,
                        url: 'http://openfiremap.org/hytiles/{z}/{x}/{y}.png'
                    }
                }
            };
        },

        addHydrantsToMap: function(data, map, hydrants) {
            for (var i = 0; i < data.points.length; i++) {
                var hydrant = data.points[i];
                var hydIcon;
                var hydType;

                // check for undefined, null or empty string
                if (!hydrant.typ) {
                    continue;
                }

                switch (hydrant.typ) {
                    case 'BA':
                        hydIcon = L.icon({
                            iconUrl: 'img/ba.png',
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Bach';
                        break;
                    case 'BRUNNEN':
                        hydIcon = L.icon({
                            iconUrl: 'img/brunnen.png',
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Brunnen';
                        break;
                    case 'LT':
                        hydIcon = L.icon({
                            iconUrl: 'img/lt.png',
                            iconSize: [32, 19],
                            iconAnchor: [16, 9],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Löschteich';
                        break;
                    case 'LWBH':
                        hydIcon = L.icon({
                            iconUrl: 'img/lwbh.png',
                            iconSize: [32, 19],
                            iconAnchor: [16, 9],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Löschwasserbehälter';
                        break;
                    case 'PU':
                        hydIcon = L.icon({
                            iconUrl: 'img/pu.png',
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Pumpe';
                        break;
                    case 'SL':
                        hydIcon = L.icon({
                            iconUrl: 'img/sl.png',
                            iconSize: [26, 26],
                            iconAnchor: [13, 13],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Steigleitung';
                        break;
                    case 'SS':
                        hydIcon = L.icon({
                            iconUrl: 'img/ss.png',
                            iconSize: [26, 26],
                            iconAnchor: [13, 13],
                            popupAnchor: [0, 0]
                        });
                        hydType = 'Saugstelle';
                        break;
                    case 'UF':
                        hydIcon = L.icon({
                            iconUrl: 'img/uf.png',
                            iconSize: [18, 32],
                            iconAnchor: [9, 32],
                            popupAnchor: [0, -32]
                        });
                        hydType = 'Unterflurhydrant';
                        break;
                    default:
                        hydIcon = L.icon({
                            iconUrl: 'img/of.png',
                            iconSize: [18, 32],
                            iconAnchor: [9, 32],
                            popupAnchor: [0, -32]
                        });
                        hydType = 'Oberflurhydrant';
                }

                var hydrantMarker = L.marker([hydrant.lat, hydrant.lng], { icon: hydIcon });
                hydrantMarker.bindPopup(
                    'Objekttyp: ' + hydType + '<br>' +
                    'Distanz: ' + hydrant.dis + 'm<br>' +
                    'Kennung: ' + hydrant.eid + '<br>' +
                    'Standort: ' + hydrant.adr + '<br>' +
                    'Bemerkung: ' + hydrant.txt + '<br>'
                );

                if (hydrants) {
                    hydrants.push(hydrantMarker);
                }
                map.addLayer(hydrantMarker);
            }
        },

        addCircleToMap: function(map, circle, layers) {
            var circleObj = L.circle(map.getCenter(), circle.radius, {
                fillColor: circle.color,
                color: circle.color,
                weight: 2,
                opacity: 1,
                fillOpacity: 0.15,
                clickable: false
            });

            map.addLayer(circleObj);

            if (layers) {
                layers.push(circleObj);
            }
        },

        getRadiusCircles: function() {
            return [
                {radius: 50, color: '#43cee6'},
                {radius: 100, color: '#66cc33'},
                {radius: 150, color: '#f0b840'},
                {radius: 300, color: '#ef4e3a'}
            ];
        },

        addDistanceLegendToMap: function(map, circles) {
            var legend = L.control({position: 'bottomright'});

            legend.onAdd = function() {
                var div = L.DomUtil.create('div', 'legend');

                angular.forEach(circles, function(circle) {
                    div.innerHTML += '<i style="background:' + circle.color + '"></i> ' + circle.radius + ' m<br>';
                });

                return div;
            };

            legend.addTo(map);
        }
    };
});
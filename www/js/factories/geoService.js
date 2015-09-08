angular.module('grisu-noe').factory('geoService', function($http, $q) {
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

        getStandardLayers: function() {
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
                    }
                },
                overlays: {
                    fire: {
                        name: 'OpenFireMap',
                        type: 'xyz',
                        visible: true,
                        url: 'http://openfiremap.org/hytiles/{z}/{x}/{y}.png'
                    }
                }
            }
        }
    };
});
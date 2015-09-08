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
                console.debug("faking geolocation using Wolfsgraben as starting point");
                deferred.resolve(position);
                return deferred.promise;
            }

            console.debug("calculating coordinates with Cordova's geolocation plugin");
            var posOptions = {timeout: 10000, enableHighAccuracy: false};

            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(result) {
                position.lat = result.coords.latitude;
                position.lng = result.coords.longitude;
                deferred.resolve(position);
                console.debug("calculated current position: " + position.lat + ", " + position.lng);
            }, function(error) {
                deferred.reject(error);
                console.error("error calculating current position: " + angular.toJson(error, true));
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
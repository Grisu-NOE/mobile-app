angular.module('grisu-noe').factory('geoService', function($http, $q) {
    var osmGeocodeAddr = 'http://nominatim.openstreetmap.org/search';
    var wastlHydrantsAddr = 'https://secure.florian10.info/ows/infoscreen/geo/umkreis.ashx';
    var httpTimeout = 30000;

    return {
        geocodeAddress: function(address) {
            var deferred = $q.defer();

            $http.get(osmGeocodeAddr, {
                timeout: httpTimeout,
                params: {
                    format: 'json',
                    'accept-language': 'de',
                    limit: 5,
                    countrycodes: 'at',
                    q: address
                }
            }).success(function(data) {
                console.info('Geocoding data loaded from OSM server', data);
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
        }
    };
});
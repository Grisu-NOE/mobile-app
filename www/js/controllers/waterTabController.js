angular.module('grisu-noe').controller('waterTabController',
    function($scope, $ionicLoading, util, geoService, leafletData) {

    var marker = null;
    var hydrants = [];
    var isErrorShown = false;

    $ionicLoading.show({
        template: '<i class="icon ion-loading-c"></i> Bestimme aktuelle Position'
    });

    angular.extend($scope, {
        center: {
            autoDiscover: true,
            zoom: 15
        }
    });

    $scope.centerMap = function(latLng) {
        leafletData.getMap().then(function(map) {
            map.panTo(latLng);
        });
    };

    $scope.updateMarkerAndHydrants = function() {
        leafletData.getMap().then(function(map) {
            var icon = L.AwesomeMarkers.icon({
                prefix: 'ion',
                icon: 'radio-waves',
                markerColor: 'red',
                iconColor: 'white'
            });

            if (marker != null) {
                map.removeLayer(marker);
            }

            marker = L.marker(map.getCenter(), { icon: icon });
            map.addLayer(marker);

            geoService.findHydrantsForPosition(map.getCenter().lat, map.getCenter().lng).then(function(data) {
                for (var i = 0; i < hydrants.length; i++) {
                    map.removeLayer(hydrants[i]);
                }
                hydrants = [];

                angular.forEach(data.points, function(hydrant) {
                    var hydIcon;
                    var hydType;

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

                    hydrants.push(hydrantMarker);
                    map.addLayer(hydrantMarker);
                });
            }, function() {
                util.showErrorDialog('Hydranten von der Umgebung konnten nicht geladen werden.');
            });
        });
    };

    $scope.$on('leafletDirectiveMap.click', function(event, eventObj) {
        $scope.centerMap(eventObj.leafletEvent.latlng);
        $scope.updateMarkerAndHydrants();
    });

    $scope.$on('leafletDirectiveMap.locationfound', function() {
        util.hideLoading();
        $scope.updateMarkerAndHydrants();
    });

    $scope.$on('leafletDirectiveMap.locationerror', function() {
        util.hideLoading();

        // Wolfsgraben
        $scope.center.lat = 48.163350;
        $scope.center.lng = 16.121937;

        $scope.updateMarkerAndHydrants();
        if (!isErrorShown) {
            util.showErrorDialog('Konnte aktuelle Position nicht automatisch bestimmen. ' +
                'Bitte gewünschte Position manuell wählen.');
            isErrorShown = true;
        }
    });
});
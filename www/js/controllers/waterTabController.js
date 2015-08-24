angular.module('grisu-noe').controller('waterTabController',
    function($scope, $ionicLoading, util, geoService, leafletData, $cordovaToast, $window) {

    var layers = [];
    var hydrants = [];
    var isErrorShown = false;

    var circles = [
        {radius: 50, color: '#43cee6'},
        {radius: 100, color: '#66cc33'},
        {radius: 150, color: '#f0b840'},
        {radius: 300, color: '#ef4e3a'}
    ];

    angular.extend($scope, {
        center: {
            autoDiscover: true,
            zoom: 15
        },
        layers: geoService.getStandardLayers()
    });

    var removeLayers = function(map) {
        angular.forEach(layers, function(layer) {
            map.removeLayer(layer);
        });
        layers = [];
    };

    var addCircle = function(map, radius, color) {
        var circle = L.circle(map.getCenter(), radius, {
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.15,
            clickable: false
        });

        map.addLayer(circle);
        layers.push(circle);
    };

    var addMarker = function(map) {
        var marker = L.marker(map.getCenter(), {
            icon: L.AwesomeMarkers.icon({
                prefix: 'ion',
                icon: 'radio-waves',
                markerColor: 'red',
                iconColor: 'white'
            })
        });

        map.addLayer(marker);
        layers.push(marker);
    };

    var addLayers = function(map) {
        removeLayers(map);

        addMarker(map);

        angular.forEach(circles, function(circle) {
            addCircle(map, circle.radius, circle.color);
        });
    };

    var addLegend = function(map) {
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function() {
            var div = L.DomUtil.create('div', 'legend');

            angular.forEach(circles, function(circle) {
                div.innerHTML += '<i style="background:' + circle.color + '"></i> ' + circle.radius + ' m<br>';
            });

            return div;
        };

        legend.addTo(map);
    };

    $scope.centerMap = function(latLng) {
        leafletData.getMap().then(function(map) {
            map.panTo(latLng);
        });
    };

    $scope.updateLayersAndHydrants = function() {
        leafletData.getMap().then(function(map) {
            addLayers(map);

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
                if ($window.cordova) {
                    $cordovaToast.showShortBottom('In der Umgebung gelegene Wasserentnahmestellen konnten nicht geladen werden.');
                }
            }).finally(function() {
                util.hideLoading();
            });
        });
    };

    $scope.$on('leafletDirectiveMap.click', function(event, eventObj) {
        $scope.centerMap(eventObj.leafletEvent.latlng);
        $scope.updateLayersAndHydrants();
    });

    $scope.$on('$ionicView.loaded', function() {
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-light" icon="ripple"></ion-spinner><div>Bestimme aktuelle Position...</div>'
        });
    });

    $scope.$on('leafletDirectiveMap.locationfound', function() {
        $scope.updateLayersAndHydrants();
    });

    $scope.$on('leafletDirectiveMap.load', function() {
        leafletData.getMap().then(function(map) {
            addLegend(map);
        });
    });

    $scope.$on('leafletDirectiveMap.locationerror', function() {
        // Wolfsgraben
        var latLng = L.latLng(48.16387421351802, 16.12121343612671);
        leafletData.getMap().then(function(map) {
            map.setView(latLng, $scope.center.zoom);
        });

        $scope.updateLayersAndHydrants();
        if (!isErrorShown) {
            util.showErrorDialog('Konnte aktuelle Position nicht automatisch bestimmen. ' +
                'Bitte gewünschte Position manuell wählen.');
            isErrorShown = true;
        }
    });
});
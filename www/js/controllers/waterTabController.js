angular.module('grisu-noe').controller('waterTabController',
    function($scope, $ionicLoading, util, geoService, leafletData, $cordovaToast, $window, $ionicModal) {

    var layers = [];
    var hydrants = [];
    var isErrorShown = false;

    var circles = geoService.getRadiusCircles();

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
            geoService.addCircleToMap(map, circle, layers);
        });
    };

    var centerMap = function(latLng) {
        leafletData.getMap().then(function(map) {
            map.panTo(latLng);
        });
    };

    var updateLayersAndHydrants = function() {
        leafletData.getMap().then(function(map) {
            addLayers(map);

            geoService.findHydrantsForPosition(map.getCenter().lat, map.getCenter().lng).then(function(data) {
                // cleanup
                for (var i = 0; i < hydrants.length; i++) {
                    map.removeLayer(hydrants[i]);
                }
                hydrants = [];

                // add hydrants
                geoService.addHydrantsToMap(data, map, hydrants);
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
        centerMap(eventObj.leafletEvent.latlng);
        updateLayersAndHydrants();
    });

    /**
     * hack to bring the overlays (e.g. OpenFireMap) in front of the base layer when the base layer changes
     */
    $scope.$on('leafletDirectiveMap.baselayerchange', function() {
        leafletData.getLayers().then(function(layer) {
            angular.forEach(layer.baselayers, function(baseLayer) {
                baseLayer.setZIndex(-1);
            }); 
        });
    });

    $scope.$on('$ionicView.loaded', function() {
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-light" icon="ripple"></ion-spinner><div>Bestimme aktuelle Position...</div>'
        });

        $ionicModal.fromTemplateUrl('templates/hydrantsHelp.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.helpDialog = modal;
        });
    });

    $scope.$on('leafletDirectiveMap.locationfound', function() {
        updateLayersAndHydrants();
    });

    $scope.$on('leafletDirectiveMap.load', function() {
        leafletData.getMap().then(function(map) {
            geoService.addDistanceLegendToMap(map, circles);
        });
    });

    $scope.$on('leafletDirectiveMap.locationerror', function() {
        // Wolfsgraben
        var latLng = L.latLng(48.16387421351802, 16.12121343612671);
        leafletData.getMap().then(function(map) {
            map.setView(latLng, $scope.center.zoom);
        });

        updateLayersAndHydrants();
        if (!isErrorShown) {
            util.showErrorDialog('Konnte aktuelle Position nicht automatisch bestimmen. ' +
                'Bitte gewünschte Position manuell wählen.');
            isErrorShown = true;
        }
    });

    $scope.openHelpDialog = function() {
        $scope.helpDialog.show();
    };

    $scope.closeHelpDialog = function() {
        $scope.helpDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.helpDialog.remove();
    });
});
angular.module('grisu-noe').controller('extendedIncidentController',
    function($scope, $stateParams, dataService, util, geoService, leafletData, $ionicModal, $cordovaDevice, $window) {

    $scope.isMapAvailable = false;
    $scope.isMapRefreshing = false;

    $scope.layers = geoService.getStandardLayers();

    $scope.updateMapToLocation = function() {
        $scope.isMapRefreshing = true;
        console.debug('Update of map with geocoding string: ' + $scope.geocodeAddress);

        geoService.geocodeAddress($scope.geocodeAddress + ', Niederösterreich').then(function(data) {
            if (data.length == 0) {
                // no results found
                return;
            }
            var validEntry = data[0];

            leafletData.getMap().then(function(map) {
                map.setView(new L.LatLng(validEntry.lat, validEntry.lon), 16);

                var redIcon = L.AwesomeMarkers.icon({
                    prefix: 'ion',
                    icon: 'flame',
                    markerColor: 'red',
                    iconColor: 'white'
                });

                var marker = L.marker([validEntry.lat, validEntry.lon], { icon: redIcon });
                marker.bindPopup(validEntry.display_name, {
                    closeButton: false
                });

                map.addLayer(marker);

                $scope.isMapAvailable = true;
            });
        }).finally(function() {
            $scope.isMapRefreshing = false;
        });
    };

    var processData = function(extIncident) {
        $scope.incident = extIncident;

        var dateTime = extIncident.EinsatzErzeugt;
        var pattern = 'YYYY-MM-DD HH:mm:ss';
        dateTime = dateTime.substring(0, 19).replace('T', ' ');
        $scope.bygone = util.calculateBygoneTime(dateTime, pattern);
        $scope.incidentDate = moment(dateTime, pattern).format('DD.MM.YYYY HH:mm:ss');

        var address = '';
        var geocodeAddress = '';

        var filter = {
            street: [ ' WN', '-BN', '-WN', ' (BL)', ' (GD)', ' (GF)', ' (HL)', ' (HO)', '(KO)',
                      ' (LF)', ' (ME)', ' (TU)', ' (WT)', ' (WUK)', ' (WUP)', ' (WUS)', ' (ZT)' ],
            sector: [ 'BasisAbschnitt' ]
        };

        if (extIncident.hasOwnProperty('Strasse') && extIncident.Strasse != '') {
            var street = extIncident.Strasse;
            angular.forEach(filter.street, function(value) {
               street = street.replace(value, '');
            });

            if (street != '') {
                address += street;
                geocodeAddress += street;
            }
        }

        if (extIncident.hasOwnProperty('Nummer1') && extIncident.Nummer1 != '') {
            address += ' ' + extIncident.Nummer1.replace('.000', '');
            geocodeAddress += ' ' + extIncident.Nummer1.replace('.000', '');
        }

        if (extIncident.hasOwnProperty('Nummer2') && extIncident.Nummer2 != '') {
            address += '/' + extIncident.Nummer2;
        }

        if (extIncident.hasOwnProperty('Nummer3') && extIncident.Nummer3 != '') {
            address += '/' + extIncident.Nummer3;
        }

        if (address != '') {
            address += '<br>';
        }

        if (geocodeAddress != '') {
            geocodeAddress += ', ';
        }

        if (extIncident.hasOwnProperty('Plz') && extIncident.Plz != '') {
            address += extIncident.Plz + ' ';
            geocodeAddress += extIncident.Plz + ' ';
        }

        if (extIncident.hasOwnProperty('Ort') && extIncident.Ort != '') {
            address += extIncident.Ort;
            geocodeAddress += extIncident.Ort;
        }

        if (extIncident.hasOwnProperty('Objekt') && extIncident.Objekt != '') {
            address = extIncident.Objekt + '<br>' + address;
        }

        if (extIncident.hasOwnProperty('Abschnitt') && extIncident.Abschnitt != '') {
            var sector = extIncident.Abschnitt;
            angular.forEach(filter.sector, function(value) {
                sector = sector.replace(value, '');
            });

            if (sector != '') {
                address += '<br>' + 'Abschnitt ' + sector;
            }
        }

        $scope.address = address;
        $scope.geocodeAddress = geocodeAddress;
    };

    $scope.formatDate = function(dateStr) {
        return util.formatWastlDate(dateStr);
    };

    $scope.isHistoricIncident = function() {
        return $stateParams.isHistoricIncident === 'true';
    };

    $scope.doRefresh = function() {
        var promise = dataService.getInfoScreenData(true);
        if ($scope.isHistoricIncident()) {
            promise = dataService.getInfoScreenHistory();
        }

        util.genericRefresh($scope, promise, function(extData) {
            if (extData.CurrentState === 'data') {
                angular.forEach(extData.EinsatzData, function(extIncident) {
                    if (extIncident.EinsatzID === $stateParams.extendedIncidentId) {
                        processData(extIncident);

                        // trigger only on first refresh or map isn't available
                        if (!$scope.isMapAvailable) {
                            $scope.updateMapToLocation();
                        }
                    }
                });

                if (!(typeof $scope.incident === 'object')) {
                    util.showErrorDialog('Einsatz wurde nicht gefunden. Eventuell ist er nicht mehr aktiv.');
                }
            } else {
                util.showErrorDialog('Sie sind nicht für erweiterte Einsatzdaten berechtigt. Status: ' + extData.CurrentState);
            }
        });

        if (!$scope.isHistoricIncident()) {
            dataService.getVotingData($stateParams.extendedIncidentId, getDeviceId()).then(function(data) {
                $scope.votingData = data;
            });
        }
    };

    $scope.onVotingButtonClick = function(answer) {
        if (answer !== 'yes' && answer !== 'no') {
            console.error('Wrong answer given. Only "yes" and "no" are allowed.');
            return;
        }

        dataService.postVoting($stateParams.extendedIncidentId, answer, getDeviceId()).then(function() {
            $scope.doRefresh();
        }, function() {
            util.showErrorDialog('Fehler: Die Einsatz-Rückmeldung war nicht erfolgreich!');
        });
    };

    var getDeviceId = function() {
        $deviceId = 'dev';
        if ($window.cordova) {
            $deviceId = $cordovaDevice.getUUID();
        }
        return $deviceId;
    };

    $scope.toggleDispo = function(dispo) {
        if ($scope.isDispoShown(dispo)) {
            $scope.shownDispo = null;
        } else {
            $scope.shownDispo = dispo;
        }
    };

    $scope.isDispoShown = function(dispo) {
        if (angular.isUndefinedOrNull($scope.shownDispo)) {
            return false;
        }

        // don't compare object equality, compare name equality because of refresh
        return angular.toJson($scope.shownDispo, false) === angular.toJson(dispo, false);
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.doRefresh();
    });

    $ionicModal.fromTemplateUrl('templates/incident-map.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.mapDialog = modal;
    });

    $scope.openMapDialog = function() {
        $scope.mapDialog.show();
    };

    $scope.closeMapDialog = function() {
        $scope.mapDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.mapDialog.remove();
    });
});
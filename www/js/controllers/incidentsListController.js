angular.module('grisu-noe').controller('incidentsListController',
    function($scope, $state, $stateParams, dataService, $ionicNavBarDelegate, util, $window, storageService) {

    var extendedIncidentIds = [];

    $scope.doRefresh = function() {
        util.genericRefresh($scope, dataService.getMainData(true), function(data) {
            angular.forEach(data.Bezirke, function(district) {
                if (district.k == $stateParams.id) {
                    $ionicNavBarDelegate.title(district.t);

                    dataService.getBazInfo(false).then(function(info) {
                        $scope.bazOnline = info['d_' + district.k];
                    });
                }
            });
        }, {
            hideRefreshers: false,
            showErrorDialog: false
        });

        util.genericRefresh($scope, dataService.getActiveIncidents($stateParams.id), function(data) {
            if (storageService.getObject('settings').showExtendedIncidentData === false) {
                $scope.incidents = data.Einsatz;

                // hide loading indicators manually
                util.hideLoadingInScope($scope);
                return;
            }

            util.genericRefresh($scope, dataService.getInfoScreenData(false), function(extData) {
                if (extData.CurrentState === 'data') {
                    angular.forEach(extData.EinsatzData, function(extIncident) {
                        extendedIncidentIds.push(extIncident.EinsatzID);
                    });
                }

                $scope.incidents = data.Einsatz;
            }, {
                showErrorDialog: false
            });
        }, { hideRefreshers: false });
    };

    $scope.isExtendedIncident = function(incidentId) {
        return extendedIncidentIds.indexOf(incidentId) !== -1;
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.doRefresh();
    });

    $scope.goToIncident = function(incident) {
        var params = {
            incidentId: incident.i,
            districtId: $stateParams.id
        };

        if ($scope.isExtendedIncident(incident.n)) {
            angular.extend(params, {
                extendedIncidentId: incident.n,
                isHistoricIncident: false
            });
        }

        if ($window.location.hash.indexOf('overview-incidents') > -1) {
            if ($scope.isExtendedIncident(incident.n)) {
                $state.go('tabs.overview-extended-incident', params);
            } else {
                $state.go('tabs.overview-incident', params);
            }
        } else if ($window.location.hash.indexOf('district-incidents') > -1) {
            if ($scope.isExtendedIncident(incident.n)) {
                $state.go('tabs.districts-extended-incident', params);
            } else {
                $state.go('tabs.districts-incident', params);
            }
        } else {
            console.error('Wrong window location hash set', $window.location.hash);
        }
    };
});
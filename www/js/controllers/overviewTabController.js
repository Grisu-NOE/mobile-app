angular.module('grisu-noe').controller('overviewTabController',
    function($scope, $rootScope, dataService, util, $ionicModal, $state, $window, storageService) {

    $scope.doRefresh = function(loadFromCache) {
        util.genericRefresh($scope, dataService.getMainData(loadFromCache), function(data) {
            $scope.mainData = data;

            var svg = document.getElementsByClassName('lower-austria-map');
            var warnStatesString = dataService.getConfig().warnStates.join(' ');

            // cleanup of css classes
            angular.forEach(svg[0].getElementsByTagName('path'), function(path) {
                angular.element(path).removeClass(warnStatesString);
            });

            // add new classes to colorize map
            angular.forEach(data.mapColorStates, function(colorState) {
                var paths = svg[0].getElementsByClassName(colorState.key);
                angular.forEach(paths, function(path) {
                    angular.element(path).addClass(colorState.value);
                });
            });
        });
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.doRefresh(true);
    });

    $scope.onMapClicked = function(event) {
        var district = event.target.classList[0];
        var mappings = dataService.getConfig().districtMapMappings;
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (mappings[key] === district) {
                    $state.go('tabs.overview-incidents', { id: key });
                }
            }
        }
    };

    $scope.$on('$ionicView.loaded', function() {
        $scope.settings = storageService.getObject('settings');

        if ($scope.settings.jumpToDistrict === true &&
            $scope.settings.myDistrict.k !== 'LWZ' &&
            $rootScope.alreadyJumpedToDistrict !== true) {

            $rootScope.alreadyJumpedToDistrict = true;
            $state.go('tabs.overview-incidents', {
                id: $scope.settings.myDistrict.k
            });
        }

        $ionicModal.fromTemplateUrl('templates/about.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.date = new Date();
            $scope.aboutDialog = modal;
        });

        $ionicModal.fromTemplateUrl('templates/settings.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            if (!$scope.settings.myDistrict) {
                $scope.settings.myDistrict = {
                    k: 'LWZ'
                };
            }

            $scope.$watch('settings', function(newValue, oldValue) {
                console.debug('Settings changed', oldValue, newValue);
                storageService.setObject('settings', newValue);
            }, true);

            $scope.settingsDialog = modal;
        });
    });

    $scope.onExtendedIncidentDataChanged = function() {
        updateToken();
    };

    function updateToken() {
        if (!$scope.settings.showExtendedIncidentData) {
            return;
        }

        util.genericRefresh($scope, dataService.getInfoScreenData(true), function(data) {
            if (data.CurrentState == 'token' || data.CurrentState == 'waiting') {
                $scope.token = data.Token;
                $scope.waitForToken = true;
            } else {
                $scope.waitForToken = false;
            }
        });
    }

    $scope.openAboutDialog = function() {
        $scope.aboutDialog.show();
    };

    $scope.closeAboutDialog = function() {
        $scope.aboutDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.aboutDialog.remove();
    });
    
    $scope.openSettingsDialog = function() {
        updateToken();
        $scope.settingsDialog.show();
    };

    $scope.closeSettingsDialog = function() {
        $scope.settingsDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.settingsDialog.remove();
    });
});
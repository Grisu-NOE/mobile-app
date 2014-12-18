angular.module('grisu-noe').controller('overviewTabController',
    function($scope, dataService, util, $ionicModal, $state, $window, storageService) {

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

        $scope.$on('$ionicView.enter', function() {
    $ionicModal.fromTemplateUrl('templates/about.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        if ($window.cordova) {
            cordova.getAppVersion().then(function(version) {
                $scope.appVersion = version;
            });
        } else {
            $scope.appVersion = 'N/A';
        }

        $scope.date = new Date();
        $scope.aboutDialog = modal;
    });
            });

    $scope.openAboutDialog = function() {
        $scope.aboutDialog.show();
    };

    $scope.closeAboutDialog = function() {
        $scope.aboutDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.aboutDialog.remove();
    });
    
    $ionicModal.fromTemplateUrl('templates/settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.settings = storageService.getObject('settings');
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
    
    $scope.openSettingsDialog = function() {
        $scope.settingsDialog.show();
    };

    $scope.closeSettingsDialog = function() {
        $scope.settingsDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.settingsDialog.remove();
    });
});
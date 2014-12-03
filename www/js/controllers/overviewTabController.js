angular.module('grisu-noe').controller('overviewTabController', function($scope, dataService, util, $ionicModal, $state, $window) {

    $scope.doRefresh = function(loadFromCache) {
        util.genericRefresh($scope, dataService.getMainData(loadFromCache), function(data) {
            $scope.departmentCount = data.departmentCount;
            $scope.incidentCount = data.incidentCount;
            $scope.districtCount = data.districtCount;

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

    $scope.doRefresh(true);

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

    $ionicModal.fromTemplateUrl('templates/about.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.aboutDialog = modal;
    });

    $scope.openAboutDialog = function() {
        if ($window.cordova) {
            cordova.getAppVersion().then(function(version) {
                $scope.appVersion = version;
            });
        } else {
            $scope.appVersion = 'N/A';
        }

        $scope.date = new Date();

        $scope.aboutDialog.show();
    };

    $scope.closeAboutDialog = function() {
        $scope.aboutDialog.hide();
    };

    // cleanup the dialog when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.aboutDialog.remove();
    });
});
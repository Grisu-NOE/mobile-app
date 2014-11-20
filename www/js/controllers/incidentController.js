angular.module('grisu-noe').controller('incidentController', function($scope, $stateParams, dataService, util) {

    $scope.doRefresh = function() {
        util.genericRefresh($scope, dataService.getIncidentData($stateParams.id), function(data) {
            $scope.incident = data;
        });
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.doRefresh();

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
        return $scope.shownDispo.n === dispo.n;
    };
});
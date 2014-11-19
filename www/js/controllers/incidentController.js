angular.module('grisu-noe').controller('incidentController', function($scope, $stateParams, dataService, util) {
    $scope.doRefresh = function() {
        util.showLoadingDelayed();
        $scope.isRefreshing = true;

        dataService.getIncidentData($stateParams.id).then(function(data) {
            $scope.incident = data;
        }, function(code) {
            util.showLoadingErrorDialog(code);
        }).finally(function() {
            $scope.isRefreshing = false;
            $scope.$broadcast('scroll.refreshComplete');
            util.hideLoading();
        });
    };

    $scope.toggleDispo = function(dispo) {
        if ($scope.isDispoShown(dispo)) {
            $scope.shownDispo = null;
        } else {
            $scope.shownDispo = dispo;
        }
    };

    $scope.isDispoShown = function(dispo) {
        if (typeof $scope.shownDispo == 'undefined' || $scope.shownDispo == null) {
            return false;
        }

        // don't compare object equality, compare name equality because of refresh
        return $scope.shownDispo.n === dispo.n;
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.doRefresh();
});
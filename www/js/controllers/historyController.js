angular.module('grisu-noe').controller('historyController', function($scope, dataService, $state, util) {
    var updateHistory = function() {
        util.genericRefresh($scope, dataService.getInfoScreenHistory(), function(data) {
            if (data.CurrentState == 'data') {
                $scope.historyError = false;
                $scope.historyData = data.EinsatzData;
            } else {
                $scope.historyError = true;
            }
        });
    };

    $scope.$on('cordova.resume', function() {
        updateHistory();
    });

    $scope.$on('$ionicView.enter', function() {
        updateHistory();
    });

    $scope.goToHistoryIncident = function(incident) {
        $state.go('tabs.overview-extended-incident', {
            districtId: 0, // dummy
            extendedIncidentId: incident.EinsatzID,
            isHistoricIncident: true
        });
    };

    $scope.formatDate = function(dateStr) {
        return util.formatWastlDate(dateStr);
    };
});
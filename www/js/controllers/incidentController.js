angular.module('grisu-noe').controller('incidentController', function($scope, $stateParams, dataService, util) {

    $scope.doRefresh = function() {
        util.genericRefresh($scope, dataService.getIncidentData($stateParams.id), function(data) {
            $scope.incident = data;
            $scope.bygone = $scope.calculateBygoneTime(data.d + ' ' + data.t);
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

    $scope.calculateBygoneTime = function(dateTimeStr) {
        var begin = moment(dateTimeStr, 'DD.MM.YYYY HH:mm:ss').utc();

        if (!begin.isValid()) {
            console.error('Parsing of bygone time failed!');
            return null;
        }

        var millis = moment().utc().diff(begin);
        var duration = moment.duration(millis);

        return {
            hours: Math.floor(duration.asHours()),
            minutes: moment.utc(millis).format('m')
        };
    };
});
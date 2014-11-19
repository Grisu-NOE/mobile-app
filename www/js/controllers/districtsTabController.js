angular.module('grisu-noe').controller('districtsTabController', function($scope, dataService, $ionicScrollDelegate, util) {
    $scope.clearSearch = function() {
        $scope.search = '';
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    };

    $scope.doRefresh = function(loadFromCache) {
        $scope.isRefreshing = true;
        util.showLoadingDelayed();

        dataService.getMainData(loadFromCache).then(function(data) {
            $scope.districts = data.Bezirke;
        }, function(code) {
            util.showLoadingErrorDialog(code);
        }).finally(function() {
            $scope.isRefreshing = false;
            $scope.$broadcast('scroll.refreshComplete');
            util.hideLoading();
        });
    };

    $scope.showBadge = function(district) {
        return district.e || district.f;
    };

    $scope.incidentsAndDepartments = function(district) {
        return district.f && district.e;
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.doRefresh(true);
});
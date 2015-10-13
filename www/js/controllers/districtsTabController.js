angular.module('grisu-noe').controller('districtsTabController',
    function($scope, dataService, $ionicScrollDelegate, util) {

    $scope.doRefresh = function(loadFromCache) {
        util.genericRefresh($scope, dataService.getMainData(loadFromCache), function(data) {
            $scope.districts = data.Bezirke;

            util.genericRefresh($scope, dataService.getBazInfo(loadFromCache), function(info) {
                $scope.bazInfo = info;
            });
        });
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.doRefresh(true);
    });

    $scope.clearSearch = function() {
        $scope.search = '';
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
    };
});
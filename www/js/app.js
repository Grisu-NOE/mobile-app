angular.module("grisu", ["ionic"])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar
        // above the keyboard for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if (window.StatusBar) {
            window.StatusBar.styleLightContent();
        }
    });
})

.config(function($ionicTabsConfig, $stateProvider, $urlRouterProvider) {
    // Override the Android platform default to add "tabs-striped" class to "ion-tabs" elements.
    $ionicTabsConfig.type = '';

    $stateProvider
        .state('tabs', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state('tabs.overview', {
            url: "/overview",
            views: {
                'overview-tab': {
                    templateUrl: "templates/overview.html",
                    controller: 'OverviewTabCtrl'
                }
            }
        })
        .state('tabs.list', {
            url: "/list",
            views: {
                'list-tab': {
                    templateUrl: "templates/list.html"
                }
            }
        })
        .state('tabs.statistics', {
            url: "/statistics",
            views: {
                'statistics-tab': {
                    templateUrl: "templates/statistics.html"
                }
            }
        });

        $urlRouterProvider.otherwise("/tab/overview");
})

.service('DataProvider', function($http, $q) {
    var infoScreenUrl = "https://infoscreen.florian10.info/OWS/Infoscreen/";
    var baseUrl = "https://infoscreen.florian10.info/OWS/wastlMobile/";

    this.getMainData = function() {
        return $http.get(baseUrl + "getMainData.ashx").then(function(response) {
            if (typeof response.data === 'object') {
                console.info("Main data loaded.", response.data);
                return response.data;
            } else {
                console.info("Error loading main data. Main data is no valid object.", response);
                return $q.reject(response.data);
            }
        }, function(response) {
            console.info("Error loading main data. Something went wrong", response);
            return $q.reject(response.data);
        })
    };

    this.getDepartmentCount = function(districts) {
        var count = 0;
        angular.forEach(districts, function(value, key) {
            count += value.f;
        });
        return count;
    };

    this.getIncidentsCount = function(districts) {
        var count = 0;
        angular.forEach(districts, function(value, key) {
            count += value.e;
        });
        return count;
    };
})

.service('Util', function($ionicPopup) {
    this.showErrorDialog = function(title) {
        $ionicPopup.alert({
            title: title,
            buttons: [{
                text: 'OK',
                type: 'button-assertive'
            }]
        });
    }
})

.controller("OverviewTabCtrl", function($scope, DataProvider, Util) {
    $scope.doRefresh = function() {
        DataProvider.getMainData().then(function(data) {
            $scope.departmentCount = DataProvider.getDepartmentCount(data.Bezirke);
            $scope.incidentsCount = DataProvider.getIncidentsCount(data.Bezirke);
            $scope.$broadcast("scroll.refreshComplete");
        }, function(data) {
            Util.showErrorDialog("Error refreshing main data");
            $scope.$broadcast("scroll.refreshComplete");
        });
    };

    $scope.doRefresh();
});

/*
 WastlMobile.processData = function(data) {

 var self = this;
 var zustandStorageTemp = "";

 if(!self.initialized){
 WastlMobile.Initialize(data);
 }

 self.countFeuerwehren = 0;
 self.countEinsatz = 0;

 for (var i = 0; i < data.Bezirke.length ; i++) {

 var val = data.Bezirke[i];

 if(val.k == ""){
 val.k = "LWZ";
 }

 self.daten[val.k] = val.z;
 zustandStorageTemp += val.z;

 self.countFeuerwehren += val.f;
 self.countEinsatz += val.e;

 $("#listItemBezirk_"+val.k+" span.ui-li-count").html(self.GetLeitstelleStatusText(val.f,val.e));

 var target = $("#listItemBezirk_"+val.k+" span.bezirkEinsatzCounter");
 if(self.GetLeitstelleStatusText(val.f,val.e) == ""){
 target.hide();
 target.css("border-bottom","");
 }else{
 target.show();
 target.css("border-bottom","3px solid " + self.colors[val.z]);
 }

 }

 $("#einsatzHistory1").html(self.GetEinsatzHistoryContent(data.h1));
 $("#einsatzHistory2").html(self.GetEinsatzHistoryContent(data.h2));
 $("#einsatzHistory3").html(self.GetEinsatzHistoryContent(data.h3));

 $("#countText").html(self.GetNoeStatusText(self.countFeuerwehren,self.countEinsatz));

 if(self.zustandStorage != zustandStorageTemp){
 self.zustandStorage = zustandStorageTemp;
 if(self.DrawNoe)
 self.DrawNoe();
 }

 }; //processData();
 */
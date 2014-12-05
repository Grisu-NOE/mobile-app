angular.isUndefinedOrNull = function(val) {
    return angular.isUndefined(val) || val === null;
};

angular.module('grisu-noe', ['ionic', 'ngCordova', 'leaflet-directive'])

.config(function($ionicTabsConfig, $stateProvider, $urlRouterProvider) {
    // Override the Android platform default to add "tabs-striped" class to "ion-tabs" elements.
    $ionicTabsConfig.type = '';

    $stateProvider.state('tabs', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    });

    $stateProvider.state('tabs.overview', {
        url: '/overview',
        views: {
            'overview-tab': {
                templateUrl: 'templates/overview.html',
                controller: 'overviewTabController'
            }
        }
    });

    // ionic doesn't support nested states/views very well yet.
    // so we are faking nested states with conventions
    $stateProvider.state('tabs.overview-incidents', {
        url: '/overview-incidents/:districtName/:id',
        views: {
            'overview-tab': {
                templateUrl: 'templates/incidents.html',
                controller: 'incidentsListController'
            }
        }
    });

    $stateProvider.state('tabs.overview-incident', {
        url: '/overview-incident/:districtId/:incidentId',
        views: {
            'overview-tab': {
                templateUrl: 'templates/incident.html',
                controller: 'incidentController'
            }
        }
    });

    $stateProvider.state('tabs.districts', {
        url: '/districts',
        views: {
            'districts-tab': {
                templateUrl: 'templates/districts.html',
                controller: 'districtsTabController'
            }
        }
    });

    $stateProvider.state('tabs.districts-incidents', {
        url: '/district-incidents/:id',
        views: {
            'districts-tab': {
                templateUrl: 'templates/incidents.html',
                controller: 'incidentsListController'
            }
        }
    });

    $stateProvider.state('tabs.districts-incident', {
        url: '/district-incident/:districtId/:incidentId',
        views: {
            'districts-tab': {
                templateUrl: 'templates/incident.html',
                controller: 'incidentController'
            }
        }
    });

    $stateProvider.state('tabs.statistics', {
        url: '/statistics',
        views: {
            'statistics-tab': {
                templateUrl: 'templates/statistics.html',
                controller: 'statisticsTabController'
            }
        }
    });

    $urlRouterProvider.otherwise('/tab/overview');
})

.run(function($ionicPlatform, $window, $rootScope, $timeout, $cordovaSplashscreen) {
    $ionicPlatform.ready(function () {

        if ($window.cordova) {
            $timeout(function() {
                console.debug("hiding splash screen");
                $cordovaSplashscreen.hide();
            }, 2000);
        }

        // Hide the accessory bar by default (remove this to show the accessory bar
        // above the keyboard for form inputs)
        if ($window.cordova) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if ($window.StatusBar) {
            $window.StatusBar.styleLightContent();
        }

        document.addEventListener('resume', function() {
            console.debug('Resuming app. Broadcasting event.');
            $rootScope.$broadcast('cordova.resume');
        }, false);
		
        /**
         * Opens a native web browser with given url supported by the running OS
         */
        $rootScope.openBrowser = function(url) {
            $window.open(url, '_system');
        };
    });
});
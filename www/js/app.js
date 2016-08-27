angular.isUndefinedOrNull = function(val) {
    return angular.isUndefined(val) || val === null;
};

angular.module('grisu-noe',
    ['ionic', 'ngCordova', 'leaflet-directive', 'chart.js', 'xml', 'angular-md5', 'cordovaHTTP'])

.config(function($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
    $ionicConfigProvider.views.transition('ios');

    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.tabs.position('bottom');

    $ionicConfigProvider.backButton.icon('ion-arrow-left-c');
    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.backButton.previousTitleText(false);

    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.navBar.positionPrimaryButtons('left');
    $ionicConfigProvider.navBar.positionSecondaryButtons('right');

    // interceptor for XML responses
    $httpProvider.interceptors.push('xmlHttpInterceptor');

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

    $stateProvider.state('tabs.overview-history', {
        url: '/overview-history',
        views: {
            'overview-tab': {
                templateUrl: 'templates/history.html',
                controller: 'historyController'
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

    $stateProvider.state('tabs.overview-extended-incident', {
        url: '/overview-extended-incident/:districtId/:extendedIncidentId/:isHistoricIncident',
        views: {
            'overview-tab': {
                templateUrl: 'templates/extended-incident.html',
                controller: 'extendedIncidentController'
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

    $stateProvider.state('tabs.districts-extended-incident', {
        url: '/district-extended-incident/:districtId/:extendedIncidentId/:isHistoricIncident',
        views: {
            'districts-tab': {
                templateUrl: 'templates/extended-incident.html',
                controller: 'extendedIncidentController'
            }
        }
    });

    $stateProvider.state('tabs.water', {
        url: '/water',
        views: {
            'water-tab': {
                templateUrl: 'templates/water.html',
                controller: 'waterTabController'
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

.run(function($ionicPlatform, $window, $rootScope, $timeout, $cordovaSplashscreen, $cordovaDevice, dataService, $screenshotService, util) {
    $ionicPlatform.ready(function() {
                         
        /** opens an external link with Cordova's inappbrowser plugin */
        $rootScope.openExternalUrl = function(url) {
            $window.open(url, '_system');
        };

        /** take screenshots of the current view */
        $rootScope.takeScreenshot = function() {
            $screenshotService.capture('grisu-noe-' + new Date().getTime()).then(function(filePath) {
                util.showSuccessDialog('Screenshot erfolgreich gespeichert. Speicherort: ' + filePath);
            }, function() {
                util.showErrorDialog('Fehler beim Erstellen des Screenshots.');
            });
        };

        if ($window.cordova) {
            $timeout(function() {
                console.debug('hide splash screen');
                $cordovaSplashscreen.hide();
            }, 1000);
        }

        if ($window.StatusBar) {
            $window.StatusBar.styleLightContent();
        }

        document.addEventListener('resume', function() {
            console.debug('Resuming app. Broadcasting event.');
            $rootScope.$broadcast('cordova.resume');
        }, false);

        /** indicator for initial view change (my district) */
        $rootScope.alreadyJumpedToDistrict = false;

        /** detect Android version and disable map if < 4.4 KitKat (SVG support) */
        $rootScope.showMap = true;
        if ($window.cordova && $cordovaDevice.getPlatform() === 'Android') {
            var version = parseFloat($cordovaDevice.getVersion().substr(0, 3));
            if (version < 4.4) {
                $rootScope.showMap = false;
            }
        }

        // preload BAZ info into cache
        dataService.getBazInfo(false);
    });
});
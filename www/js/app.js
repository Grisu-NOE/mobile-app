angular.module('grisu-noe', ['ionic'])

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
                controller: 'OverviewTabController'
            }
        }
    });

    // ionic doesn't support nested states/views very well yet.
    // so we are faking nested states with conventions
    $stateProvider.state('tabs.overview-incidents', {
        url: '/overview-incidents/:id',
        views: {
            'overview-tab': {
                templateUrl: 'templates/incidents.html',
                controller: 'IncidentsListController'
            }
        }
    });

    $stateProvider.state('tabs.overview-incident', {
        url: '/overview-incident/:id',
        views: {
            'overview-tab': {
                templateUrl: 'templates/incident.html',
                controller: 'IncidentController'
            }
        }
    });

    $stateProvider.state('tabs.districts', {
        url: '/districts',
        views: {
            'districts-tab': {
                templateUrl: 'templates/districts.html',
                controller: 'DistrictsTabController'
            }
        }
    });

    $stateProvider.state('tabs.districts-incidents', {
        url: '/district-incidents/:id',
        views: {
            'districts-tab': {
                templateUrl: 'templates/incidents.html',
                controller: 'IncidentsListController'
            }
        }
    });

    $stateProvider.state('tabs.districts-incident', {
        url: '/district-incident/:id',
        views: {
            'districts-tab': {
                templateUrl: 'templates/incident.html',
                controller: 'IncidentController'
            }
        }
    });

    $stateProvider.state('tabs.statistics', {
        url: '/statistics',
        views: {
            'statistics-tab': {
                templateUrl: 'templates/statistics.html',
                controller: 'StatisticsTabController'
            }
        }
    });

    $urlRouterProvider.otherwise('/tab/overview');
})

.run(function($ionicPlatform, $window, $rootScope) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar
        // above the keyboard for form inputs)
        if ($window.cordova && $window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if ($window.StatusBar) {
            $window.StatusBar.styleLightContent();
        }

        document.addEventListener('resume', function() {
            console.debug('Resuming app. Broadcasting event.');
            $rootScope.$broadcast('cordova.resume');
        }, false);
    });
})

.factory('dataService', function($http, $q) {
    var config = {
        districtMapMappings: {
            '01': 'amstetten',
            '02': 'baden',
            '03': 'bruck-leitha',
            '04': 'gaenserndorf',
            '05': 'gmuend',
            '061': 'klosterneuburg',
            '062': 'purkersdorf',
            '063': 'schwechat',
            '07': 'hollabrunn',
            '08': 'horn',
            '09': 'stockerau',
            '10': 'krems',
            '11': 'lilienfeld',
            '12': 'melk',
            '13': 'mistelbach',
            '14': 'moedling',
            '15': 'neunkirchen',
            '17': 'st-poelten',
            '18': 'scheibbs',
            '19': 'tulln',
            '20': 'waidhofen-thaya',
            '21': 'wr-neustadt',
            '22': 'zwettl'
        },
        warnStates: ['none', 'low', 'medium', 'high'],
        infoScreenBaseUrl: 'https://infoscreen.florian10.info/OWS/Infoscreen/',
        wastlMobileBaseUrl: 'https://infoscreen.florian10.info/OWS/wastlMobile/',
        httpTimeout: 30000 // 30 sec. max req. time
    };

    var cache = {
        mainData: null,
        mainDataCreated: null
    };

    function processMainData(data) {
        var extension = {
            departmentCount: 0,
            incidentCount: 0,
            districtCount: 0,
            mapColorStates: []
        };

        angular.forEach(data.Bezirke, function(district) {
            extension.departmentCount += district.f;
            extension.incidentCount += district.e;

            // k = identifier of district, LWZ = 'Landeswarnzentrale', is not on map
            if (district.k == '') {
                district.k = 'LWZ';
            }

            if (district.z > 0) {
                extension.mapColorStates.push({
                    key: config.districtMapMappings[district.k],
                    value: config.warnStates[district.z]
                });
            }
        });

        extension.districtCount = extension.mapColorStates.length;

        console.debug('Extended WASTL data with', extension);
        return angular.extend(data, extension);
    }

    function createCurrentTimestamp() {
        return parseInt(Date.now() / 1000);
    }

    /**
     * Checks if cache is valid and if cache creation time isn't too old.
     */
    function isCacheAlive(cacheData, cacheTimestamp) {
        if (cacheData === null) {
            return false;
        }

        var nowTimestamp = createCurrentTimestamp();
        var timeDifference = nowTimestamp - cacheTimestamp;
        console.debug('Now timestamp', nowTimestamp);
        console.debug('Cache timestamp', cacheTimestamp);
        console.debug('Time difference in seconds', timeDifference);

        // max. age of cache is one minute
        if (cacheTimestamp === null || timeDifference >= 60) {
            return false;
        }

        return true;
    }

    return {
        getMainData: function(loadFromCache) {
            var deferred = $q.defer();

            if (loadFromCache && isCacheAlive(cache.mainData, cache.mainDataCreated)) {
                console.info('Main data loaded from cache', cache.mainData);
                deferred.resolve(cache.mainData);
                return deferred.promise;
            }

            $http.get(config.wastlMobileBaseUrl + 'getMainData.ashx', { timeout: config.httpTimeout }).success(function(data) {
                console.info('Main data loaded from server', data);
                cache.mainData = processMainData(data);
                cache.mainDataCreated = createCurrentTimestamp();
                console.debug('Updated mainData cache with timestamp', cache.mainDataCreated);
                deferred.resolve(cache.mainData);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error loading main data. Error code', code);
            });

            return deferred.promise;
        },

        getActiveIncidents: function(districtId) {
            var deferred = $q.defer();

            $http.get(config.wastlMobileBaseUrl + 'getEinsatzAktiv.ashx', {
                timeout: config.httpTimeout,
                params: {
                    id: 'bezirk_' + districtId
                }
            }).success(function(data) {
                console.info('Incident data for district "' + districtId + '" loaded from server', data);
                deferred.resolve(data);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error loading incident data for district "' + districtId + '". Error code', code);
            });

            return deferred.promise;
        },

        getConfig: function() {
            return config;
        },

        getIncidentData: function(incidentId) {
            var deferred = $q.defer();

            $http.get(config.wastlMobileBaseUrl + 'geteinsatzdata.ashx', {
                timeout: config.httpTimeout,
                params: {
                    id: incidentId
                }
            }).success(function(data) {
                console.info('Detailed data for incidentId "' + incidentId + '" loaded from server', data);
                deferred.resolve(data);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error loading detailed data for incident "' + incidentId + '". Error code', code);
            });

            return deferred.promise;
        }
    };
})

.service('util', function($ionicPopup, $ionicLoading) {
    this.showErrorDialog = function(title) {
        $ionicPopup.alert({
            title: title,
            buttons: [{
                text: 'OK',
                type: 'button-assertive'
            }]
        });
    };

    this.showLoadingDelayed = function() {
        $ionicLoading.show({
            template: '<i class="icon ion-loading-c"></i> Lade Daten...',
            delay: 1000
        });
    };

    this.hideLoading = function() {
        $ionicLoading.hide();
    };
})

.controller('OverviewTabController', function($scope, dataService, util, $ionicModal, $state, $window) {
    $scope.doRefresh = function(loadFromCache) {
        util.showLoadingDelayed();
        var promise = dataService.getMainData(loadFromCache);

        promise.then(function(data) {
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
        }, function(code) {
            util.showErrorDialog('Daten konnten nicht geladen werden: Fehler ' + code);
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
            util.hideLoading();
        });
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

        $scope.aboutDialog.show();
    };

    $scope.closeAboutDialog = function() {
        $scope.aboutDialog.hide();
    };

    // cleanup the dialog when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.aboutDialog.remove();
    });

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

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

    $scope.doRefresh(true);
})

.controller('DistrictsTabController', function($scope, dataService, $ionicScrollDelegate, util) {
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
            util.showErrorDialog('Daten konnten nicht geladen werden: Fehler ' + code);
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
})

.controller('IncidentsListController', function($scope, $state, $stateParams, dataService, $ionicNavBarDelegate, util, $window) {
    $scope.doRefresh = function() {
        util.showLoadingDelayed();
        $scope.isRefreshing = true;

        dataService.getMainData(true).then(function(data) {
            angular.forEach(data.Bezirke, function(district) {
                if (district.k == $stateParams.id) {
                    $ionicNavBarDelegate.setTitle(district.t);
                }
            });

            if (!$ionicNavBarDelegate.getTitle().length) {
                $ionicNavBarDelegate.setTitle('Einsätze von Bezirk');
            }
        });

        dataService.getActiveIncidents($stateParams.id).then(function(data) {
            $scope.incidents = data.Einsatz;
        }, function(code) {
            util.showErrorDialog('Daten konnten nicht geladen werden: Fehler ' + code);
        }).finally(function() {
            $scope.isRefreshing = false;
            $scope.$broadcast('scroll.refreshComplete');
            util.hideLoading();
        });
    };

    $scope.goToIncident = function(incidentId) {
        if ($window.location.hash.indexOf('overview-incidents') > -1) {
            $state.go('tabs.overview-incident', { id: incidentId });
        } else if ($window.location.hash.indexOf('district-incidents') > -1) {
            $state.go('tabs.districts-incident', { id: incidentId });
        } else {
            console.error('Wrong window location hash set', $window.location.hash);
        }
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.doRefresh();
})

.controller('IncidentController', function($scope, $stateParams, dataService, util) {
    $scope.doRefresh = function() {
        util.showLoadingDelayed();
        $scope.isRefreshing = true;

        dataService.getIncidentData($stateParams.id).then(function(data) {
           $scope.incident = data;
        }, function(code) {
            util.showErrorDialog('Daten konnten nicht geladen werden: Fehler ' + code);
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
})

.controller('StatisticsTabController', function(util, dataService, $scope, $timeout, $ionicScrollDelegate) {
    $scope.tabs = [
        { isActive: true },
        { isActive: false },
        { isActive: false }
    ];

    var chartInstances = [];

    $scope.doRefresh = function(loadFromCache) {
        $scope.isRefreshing = true;
        util.showLoadingDelayed();

        dataService.getMainData(loadFromCache).then(function(data) {
            $scope.mainData = data;
            $scope.createCharts(data);
        }, function(code) {
            util.showErrorDialog('Daten konnten nicht geladen werden: Fehler ' + code);
        }).finally(function() {
            $scope.isRefreshing = false;
            $scope.$broadcast('scroll.refreshComplete');
            util.hideLoading();
        });
    };

    $scope.setTabActive = function(tabNo) {
        var activeTab = -1;
        for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].isActive) {
                activeTab = i;
                break;
            }
        }

        if (activeTab != -1 && tabNo != activeTab) {
            $scope.tabs[activeTab].isActive = false;
            $scope.tabs[tabNo].isActive = true;

            // hack to render chart correctly
            $timeout(function() {
                $scope.createCharts($scope.mainData);
            }, 1);

            $ionicScrollDelegate.scrollTop(true);
        }
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.doRefresh(true);

    $scope.createCharts = function(data) {
        var chartData = [
            { key: 'T1', c1: 0, c2: 0, c3: 0},
            { key: 'T2', c1: 0, c2: 0, c3: 0},
            { key: 'T3', c1: 0, c2: 0, c3: 0},
            { key: 'B1', c1: 0, c2: 0, c3: 0},
            { key: 'B2', c1: 0, c2: 0, c3: 0},
            { key: 'B3', c1: 0, c2: 0, c3: 0},
            { key: 'B4', c1: 0, c2: 0, c3: 0},
            { key: 'S1', c1: 0, c2: 0, c3: 0},
            { key: 'S2', c1: 0, c2: 0, c3: 0},
            { key: 'S3', c1: 0, c2: 0, c3: 0},
        ];

        function createArray(key) {
            var result = [];
            for (var i = 0; i < chartData.length; i++) {
                if (chartData[i].hasOwnProperty(key)) {
                    result.push(chartData[i][key]);
                }
            }
            return result;
        }

        function populateData(key, historyData) {
            angular.forEach(historyData, function(entry) {
                for (var i = 0; i < chartData.length; i++) {
                    if (chartData[i].key == entry.a) {
                        chartData[i][key] += entry.s;
                    }
                }
            });
        }

        function isElementHidden(element) {
            return (element.offsetParent === null);
        }

        function tryBuildBarChart(cssId, matrixKey) {
            var element = document.getElementById(cssId);
            if (isElementHidden(element)) {
                return null;
            }

            var data = {
                labels: createArray('key'),
                datasets: [{
                    fillColor: 'rgba(220,220,220,0.5)',
                    strokeColor: 'white',
                    highlightFill: 'rgba(220,220,220,0.75)',
                    highlightStroke: 'white',
                    data: createArray(matrixKey)
                }]
            };

            var ctx = element.getContext('2d');
            var barChart = new Chart(ctx).Bar(data, {
                responsive: true,
                scaleGridLineColor : 'rgba(255,255,255,.09)',
                animation: false
            });

            // hack to specify different colors for bars of a dataset
            for (var i = 0; i < 10; i++) {
                var color;
                var highlightColor;

                if (i < 3) {
                    color = '#4a87ee';
                    highlightColor = '#4a99ee';
                } else if (i < 7) {
                    color = '#ef4e3a';
                    highlightColor = '#ed6657';
                } else {
                    color = '#66cc33';
                    highlightColor = '#80e050';
                }

                barChart.datasets[0].bars[i].fillColor = color;
                barChart.datasets[0].bars[i].highlightFill = highlightColor;
            }

            barChart.update();

            return barChart;
        }

        function tryBuildPieChart(cssId, matrixKey) {
            var element = document.getElementById(cssId);
            if (isElementHidden(element)) {
                return null;
            }

            var t = 0;
            var b = 0;
            var s = 0;

            for (var i = 0; i < chartData.length; i++) {
                if (chartData[i].key.substr(0, 1) == 'T') {
                    t += chartData[i][matrixKey];
                } else if (chartData[i].key.substr(0, 1) == 'B') {
                    b += chartData[i][matrixKey];
                } else {
                    s += chartData[i][matrixKey];
                }
            }

            var data = [{
                value: t,
                color: '#4a87ee',
                highlight: '#4a99ee',
                label: 'T'
            }, {
                value: b,
                color: '#ef4e3a',
                highlight: '#ed6657',
                label: 'B'
            }, {
                value: s,
                color: '#66cc33',
                highlight: '#80e050',
                label: 'S'
            }];

            var ctx = element.getContext('2d');
            return new Chart(ctx).Pie(data, {
                responsive: true,
                // android is too slow for animation ;(
                animation: false
            });
        }

        populateData('c1', data.h1.v);
        populateData('c2', data.h2.v);
        populateData('c3', data.h3.v);

        // cleanup of existing instances to prevent memory leaks
        angular.forEach(chartInstances, function(instance) {
            if (instance !== null) {
                instance.destroy();
            }
        });
        chartInstances = [];

        chartInstances.push(tryBuildBarChart('barchart1', 'c1'));
        chartInstances.push(tryBuildPieChart('piechart1', 'c1'));
        chartInstances.push(tryBuildBarChart('barchart2', 'c2'));
        chartInstances.push(tryBuildPieChart('piechart2', 'c2'));
        chartInstances.push(tryBuildBarChart('barchart3', 'c3'));
        chartInstances.push(tryBuildPieChart('piechart3', 'c3'));
    };
});
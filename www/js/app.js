angular.module('grisu-noe', ['ionic', 'pascalprecht.translate'])

.constant('config', {
    defaultAppState: '/tab/overview',
    appStates: [{
        key: 'tabs',
        config: {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        }
    }, {
        key: 'tabs.overview',
        config: {
            url: '/overview',
            views: {
                'overview-tab': {
                    templateUrl: 'templates/overview.html',
                    controller: 'OverviewTabController'
                }
            }
        }
    }, {
        // ionic doesn't support nested states/views very well yet.
        // so we are faking nested states with conventions
        key: 'tabs.overview-incidents',
        config: {
            url: '/overview-incidents/:id',
            views: {
                'overview-tab': {
                    templateUrl: 'templates/incidents.html',
                    controller: 'IncidentsListController'
                }
            }
        }
    }, {
        key: 'tabs.overview-incident',
        config: {
            url: '/overview-incident/:id',
            views: {
                'overview-tab': {
                    templateUrl: 'templates/incident.html',
                    controller: 'IncidentController'
                }
            }
        }
    }, {
        key: 'tabs.districts',
        config: {
            url: '/districts',
            views: {
                'districts-tab': {
                    templateUrl: 'templates/districts.html',
                    controller: 'DistrictsTabController'
                }
            }
        }
    }, {
        key: 'tabs.districts-incidents',
        config: {
            url: '/district-incidents/:id',
            views: {
                'districts-tab': {
                    templateUrl: 'templates/incidents.html',
                    controller: 'IncidentsListController'
                }
            }
        }
    }, {
        key: 'tabs.districts-incident',
        config: {
            url: '/district-incident/:id',
            views: {
                'districts-tab': {
                    templateUrl: 'templates/incident.html',
                    controller: 'IncidentController'
                }
            }
        }
    }, {
        key: 'tabs.statistics',
        config: {
            url: '/statistics',
            views: {
                'statistics-tab': {
                    templateUrl: 'templates/statistics.html',
                    controller: 'StatisticsTabController'
                }
            }
        }
    }],
    languages: [{
        key: 'de',
        translations: {
            common: {
                loading: 'Lade Daten ...',
                loadingError: 'Daten konnten nicht geladen werden: Fehler {{code}}',
                search: 'Suche',
                noAlarmImage: 'Kein Meldebild'
            },
            overview: {
                title: 'Grisu NÖ',
                tabName: 'Übersicht',
                departmentCount: 'Ausgerückte Feuerwehren',
                incidentCount: 'Aktuelle Einsätze',
                districtCount: 'Aktive Bezirke'
            },
            districts: {
                title: 'Aktuelle Einsätze',
                tabName: 'Bezirke',
                incidents: 'Einsätze',
                departments: 'FF'
            },
            incidents: {
                title: 'Einsätze von Bezirk',
                noEntries: 'Zurzeit sind keine Einsätze vorhanden.'
            },
            incident: {
                disposition: 'Disposition',
                alarmed: 'Alarmierung',
                disengaged: 'Ausgerückt',
                indented: 'Eingerückt',
                ownAlarmed: 'Eigenalarmiert'
            },
            statistics: {
                title: 'Statistiken',
                tabName: 'Statistik',
                history6: 'Rückblick 6h',
                history12: 'Rückblick 12h',
                history24: 'Rückblick 24h',
                sum: 'Insgesamt {{ sum }} Einsätze'
            },
            about: {
                title: 'Info'
            }
        }
    }, {
        key: 'en',
        translations: {
            common: {
                loading: 'Loading data ...',
                loadingError: 'Can\'t fetch data: Error {{code}}',
                search: 'Search',
                noAlarmImage: 'No alarm image'
            },
            overview: {
                title: 'Grisu NÖ',
                tabName: 'Overview',
                departmentCount: 'Fire departments in action',
                incidentCount: 'Current incidents',
                districtCount: 'Active districts'
            },
            districts: {
                title: 'Active incidents',
                tabName: 'Districts',
                incidents: 'Incid',
                departments: 'Deps'
            },
            incidents: {
                title: 'Incidents of district',
                noEntries: 'Currently there are no incidents.'
            },
            incident: {
                disposition: 'Disposition',
                alarmed: 'Alarmed',
                disengaged: 'Disengaged',
                indented: 'Indented',
                ownAlarmed: 'Own alarmed'
            },
            statistics: {
                title: 'Statistics',
                tabName: 'Statistics',
                history6: 'History 6h',
                history12: 'History 12h',
                history24: 'History 24h',
                sum: '{{ sum }} incidents in total'
            },
            about: {
                title: 'About'
            }
        }
    }]
})

.config(function($ionicTabsConfig, $stateProvider, $urlRouterProvider, $translateProvider, config) {
    // Override the Android platform default to add "tabs-striped" class to "ion-tabs" elements.
    $ionicTabsConfig.type = '';

    // app states
    angular.forEach(config.appStates, function(state) {
        $stateProvider.state(state.key, state.config);
    });
    $urlRouterProvider.otherwise(config.defaultAppState);

    // translations
    angular.forEach(config.languages, function(lang) {
        $translateProvider.translations(lang.key, lang.translations);
    });

    $translateProvider.preferredLanguage(config.languages[0].key);
    $translateProvider.fallbackLanguage(config.languages[0].key);
    $translateProvider.useMissingTranslationHandlerLog();
})

.run(function($ionicPlatform, $translate, config, $window, $rootScope) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar
        // above the keyboard for form inputs)
        if ($window.cordova && $window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if ($window.StatusBar) {
            $window.StatusBar.styleLightContent();
        }

        if (navigator.globalization) {
            navigator.globalization.getPreferredLanguage(function(language) {
                var langShort = language.value.substring(0, 2).toLowerCase();

                angular.forEach(config.languages, function(lang) {
                    if (angular.equals(lang.key, langShort)) {
                        $translate.use(langShort);
                        // TODO: use break (return false) here as soon angular supports it
                    }
                });
            }, function() {
                console.warn('Can\'t determine preferred language');
            });
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
        wastlMobileBaseUrl: 'https://infoscreen.florian10.info/OWS/wastlMobile/'
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

            $http.get(config.wastlMobileBaseUrl + 'getMainData.ashx').success(function(data) {
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

.service('util', function($ionicPopup, $translate, $ionicLoading) {
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
            template: $translate('common.loading'),
            delay: 1000
        });
    };

    this.hideLoading = function() {
        $ionicLoading.hide();
    };
})

.controller('OverviewTabController', function($scope, dataService, util, $translate, $ionicModal, $state, $window) {
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
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
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

.controller('DistrictsTabController', function($scope, dataService, $ionicScrollDelegate, util, $translate) {
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
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
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

.controller('IncidentsListController', function($scope, $state, $stateParams, dataService, $translate, $ionicNavBarDelegate, util, $window) {
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
                $translate('incidents.title').then(function(msg) {
                    $ionicNavBarDelegate.setTitle(msg);
                });
            }
        });

        dataService.getActiveIncidents($stateParams.id).then(function(data) {
            $scope.incidents = data.Einsatz;
        }, function(code) {
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
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
            console.error("Wrong window location hash set", $window.location.hash);
        }
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh();
    });

    $scope.doRefresh();
})

.controller('IncidentController', function($scope, $stateParams, dataService, $translate, util) {
    $scope.doRefresh = function() {
        util.showLoadingDelayed();
        $scope.isRefreshing = true;

        dataService.getIncidentData($stateParams.id).then(function(data) {
           $scope.incident = data;
        }, function(code) {
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
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

.controller('StatisticsTabController', function($translate, util, dataService, $scope, $timeout, $ionicScrollDelegate) {
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
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
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
                barStrokeWidth: 1,
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
                segmentStrokeWidth: 1,
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

// statistik sehr sehr langsam auf android animation
// write issues for this list following list
// doRefresh() inheritance with callback
// write tests
// gulp install script (plugins, platform resources)
// icons for ios/android and also splashscreen (cordova plugin), 512x512 android...
// alle einsätze auf einmal von ganz NÖ (all in one) -> leider alle bezirke abfragen, mit cache! auch mit OSM karte, wenn geolaction ok! (wastl mobile daten xml?)
// direkt in meinen bezirk springen -> einstellungen (localStorage)
// infoscreendaten verwenden, einsatz mit speziellen icon kennzeichen und erweiterte daten laden, anzeigen von token + beschreibung für freischaltung
// komme/komme nicht funktion, müsste eventuell eigener server laufen (DB-id -> einsatzid, abfrage ob android oder ios (sicherheit, kein overflow), keine ip verwenden sondern geräteid)
// dazu krems fragen, ob sie funktion implementieren wollen
// wasser.leitstelle122.at nahmachen
// analyze rest of other apps to see if there are some features to implement
// ausrückscreen flo
// remove our app and set link to appstore (info -> flo admin/ alex)
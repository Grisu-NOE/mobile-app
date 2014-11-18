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
                search: 'Suche'
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
            statistics: {
                title: 'Statistiken',
                tabName: 'Statistik'
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
                search: 'Search'
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
            statistics: {
                title: 'Statistics',
                tabName: 'Statistics'
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
        mainData: null
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

    return {
        getMainData: function(loadFromCache) {
            var deferred = $q.defer();

            if (loadFromCache && cache.mainData !== null) {
                console.info('Main data loaded from cache', cache.mainData);
                deferred.resolve(cache.mainData);
                return deferred.promise;
            }

            $http.get(config.wastlMobileBaseUrl + 'getMainData.ashx').success(function(data) {
                console.info('Main data loaded from server', data);
                cache.mainData = processMainData(data);
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

.controller('OverviewTabController', function($scope, dataService, util, $translate, $ionicModal, $state) {
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
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
        }).finally(function() {
            $scope.isRefreshing = false;
            util.hideLoading();
        });
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
    dataService.getIncidentData($stateParams.id).then(function(data) {
        $scope.incident = data;
    }, function(code) {
        $translate('common.loadingError', {code: code}).then(function(translation) {
            util.showErrorDialog(translation);
        });
    }).finally(function() {
        $scope.isRefreshing = false;
        util.hideLoading();
    });
})

.controller('StatisticsTabController', function() {
    var data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
            {
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: "My Second dataset",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: [28, 48, 40, 19, 86, 27, 90]
            }
        ]
    };

    var ctx = document.getElementById("myChart").getContext("2d");
    var myBarChart = new Chart(ctx).Bar(data, {
        responsive: true,
        maintainAspectRatio: true
    });
});

// ionic loading icons not really round when animated
// timeout for refreshing (1 minute)
// disable animations at statistics, maybe fix performance issues
// border of list in infoindow needs to be removed
// split files
// remove english language. not needed
// icons in subheader statistics not aligned correctly on android
// issues with number of ffs/incidents (oft inkonstistenz), klosterneuburg auf karte aktiv, obwohl einsätze in stockerau
// write issues for this list following list
// einfärben rest von einsatzstufen
// write tests
// gulp install script (plugins, platform resources)
// icons for ios/android and also splashscreen (cordova plugin), 512x512 android...
// statistics (provided by main data, only list and diagram per unit)
// collapsible accordion: http://forum.ionicframework.com/t/how-to-create-collapsible-list-in-ionic/6920/3
// alle einsätze auf einmal von ganz NÖ (all in one) -> leider alle bezirke abfragen, mit cache! auch mit OSM karte, wenn geolaction ok! (wastl mobile daten xml?)
// direkt in meinen bezirk springen -> einstellungen (localStorage)
// infoscreendaten verwenden, einsatz mit speziellen icon kennzeichen und erweiterte daten laden, anzeigen von token + beschreibung für freischaltung
// komme/komme nicht funktion, müsste eventuell eigener server laufen (DB-id -> einsatzid, abfrage ob android oder ios (sicherheit, kein overflow), keine ip verwenden sondern geräteid)
// wasser.leitstelle122.at nahmachen

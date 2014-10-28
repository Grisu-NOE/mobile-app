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
        key: 'tabs.incidents',
        config: {
            url: '/incidents/:id',
            views: {
                'districts-tab': {
                    templateUrl: 'templates/incidents.html',
                    controller: 'IncidentsListController'
                }
            }
        }
    }, {
        key: 'tabs.statistics',
        config: {
            url: '/statistics',
            views: {
                'statistics-tab': {
                    templateUrl: 'templates/statistics.html'
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
                departmentCount: 'Feuerwehren im Einsatz',
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
                title: 'Einsätze von Bezirk'
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
                title: 'Incidents of district'
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
                    $state.go('tabs.incidents', { id: key });
                }
            }
        }
    };

    util.showLoadingDelayed();
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
        dataService.getMainData(loadFromCache).then(function(data) {
            $scope.districts = data.Bezirke;
        }, function(code) {
            $translate('common.loadingError', {code: code}).then(function(translation) {
                util.showErrorDialog(translation);
            });
        }).finally(function() {
            $scope.isRefreshing = false;
        });
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.doRefresh(true);
})

.controller('IncidentsListController', function($scope, $stateParams, dataService) {
    dataService.getMainData(true).then(function(data) {
        angular.forEach(data.Bezirke, function(district) {
            if (district.k == $stateParams.id) {
                $scope.title = district.t;
            }
        });

        if (!$scope.title.length) {
            $scope.title = $translate('incidents.title');
        }
    });

    dataService.getActiveIncidents($stateParams.id).then(function(data) {
        $scope.incidents = data.Einsatz;
    });
    // TODO write tests
    // TODO gulp install script (plugins, platform resources)
});
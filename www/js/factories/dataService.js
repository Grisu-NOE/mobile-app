angular.module('grisu-noe').factory('dataService', function($http, $q, $window, storageService) {
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
        bazInfoUrl: 'http://atlas.feuerwehr-krems.at/CodePages/Wastl/GetDaten/GetWastlMainS3.asp?Time',
        httpTimeout: 60000 // 60 seconds maximum request time
    };

    var cache = {
        mainData: null,
        mainDataCreated: null,
        bazInfo: null
    };

    var processMainData = function(data) {
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
            if (district.k === '') {
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
    };

    var processBazInfo = function(data) {
        var result = {};

        angular.forEach(data.root.aBAZID, function(baz) {
            var district = baz.cBezirk.toString() === '' ? 'LWZ' : baz.cBezirk.toString();
            result['d_' + district] = baz.nBAZStatus.toString() === 'ledgreen.gif';
        });

        console.debug('Processed BAZ info', result);
        return result;
    };

    var createCurrentTimestamp = function() {
        return parseInt(Date.now() / 1000);
    };

    /**
     * Checks if cache is valid and if cache creation time isn't too old.
     */
    var isCacheAlive = function(cacheData, cacheTimestamp) {
        if (cacheData === null) {
            return false;
        }

        var nowTimestamp = createCurrentTimestamp();
        var timeDifference = nowTimestamp - cacheTimestamp;
        console.debug('Now timestamp', nowTimestamp);
        console.debug('Cache timestamp', cacheTimestamp);
        console.debug('Time difference in seconds', timeDifference);

        // max. age of cache is one minute
        return !(cacheTimestamp === null || timeDifference >= 60);
    };

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
        },

        getInfoScreenData: function(useDemoData) {
            var deferred = $q.defer();
            var magicCookie = storageService.get('magicCookie');
            var url = config.infoScreenBaseUrl;
            var options = {
                timeout: config.httpTimeout
            };

            if (useDemoData) {
                url += 'demo.ashx';
                angular.extend(options, {
                    params: {
                        demo: 3
                    }
                });
            } else {
                url += 'Einsatz.ashx';
            }

            if ($window.cordova && !angular.isUndefinedOrNull(magicCookie) && magicCookie.length > 0) {
                cordovaHTTP.get(url, options.params || {}, {
                    Cookie: 'xFFK_InfoScrCookie_SessionID=' + magicCookie
                }, function(response) {
                    var json = angular.fromJson(response.data);
                    console.info('Cordova HTTP plugin: Extended info screen data loaded from server', json);
                    deferred.resolve(json);
                }, function(response) {
                    console.error('Cordova HTTP plugin: Error loading extended info screen data. Error code', response.status);
                    deferred.reject(response.status, response.error);
                });
            } else {
                $http.get(url, options).success(function(data) {
                    console.info('Extended info screen data loaded from server', data);
                    deferred.resolve(data);
                }).error(function (data, code) {
                    deferred.reject(code, data);
                    console.error('Error loading extended info screen data. Error code', code);
                });
            }

            return deferred.promise;
        },

        getInfoScreenHistory: function() {
            var deferred = $q.defer();

            $http.get(config.infoScreenBaseUrl + 'historic.ashx', { timeout: config.httpTimeout }).success(function(data) {
                console.info('Historic info screen data loaded from server', data);
                deferred.resolve(data);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error loading historic info screen data. Error code', code);
            });

            return deferred.promise;
        },

        getBazInfo: function(loadFromCache) {
            var deferred = $q.defer();

            if (loadFromCache) {
                console.info('BAZ info loaded from cache', cache.bazInfo);
                deferred.resolve(cache.bazInfo);
                return deferred.promise;
            }

            $http.get(config.bazInfoUrl, { timeout: config.httpTimeout }).success(function(data) {
                console.info('BAZ info loaded from server', data);
                cache.bazInfo = processBazInfo(data);
                deferred.resolve(cache.bazInfo);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error loading BAZ info. Error code', code);
            });

            return deferred.promise;
        },

        postVoting: function(incidentNumber, answer) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: config.infoScreenBaseUrl + 'rsvp.ashx',
                data: 'einsatz=' + incidentNumber + '&answer=' + answer,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: config.httpTimeout
            }).success(function(data) {
                console.info('Successfully posted voting');
                deferred.resolve(data);
            }).error(function(data, code) {
                deferred.reject(code, data);
                console.error('Error with posting voting', code, data.status);
            });

            return deferred.promise;
        }
    };
});
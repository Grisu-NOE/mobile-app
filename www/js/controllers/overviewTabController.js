angular.module('grisu-noe').controller('overviewTabController',
    function($scope, $rootScope, dataService, util, $ionicModal, $state,
             $window, storageService, $cordovaClipboard, $cordovaToast, $ionicPopover, md5) {

    var easterEggClickCount;
    var calculatedHashes;

    $scope.doRefresh = function(loadFromCache) {
        util.genericRefresh($scope, dataService.getMainData(loadFromCache), function(data) {
            $scope.mainData = data;

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
        });

        if (!$scope.settings.showExtendedIncidentData) {
            return;
        }

        util.genericRefresh($scope, dataService.getInfoMessages(), function(data) {
            if (data.CurrentState != 'data') {
                $scope.messagesError = true;
                return;
            }
            handleInfoMessages(data.Infos);
        }, { hideRefreshers: false });
    };

    function handleInfoMessages(messages) {
        var storedHashes = storageService.get('messages', []);
        $scope.hasNewMessages = false;
        calculatedHashes = [];

        angular.forEach(messages, function(message) {
            var hash = md5.createHash(message.Title + message.Text);
            calculatedHashes.push(hash);
            if (storedHashes.indexOf(hash) === -1) {
                $scope.hasNewMessages = true;
            }
        });

        $scope.infoMessages = messages;
    }

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.doRefresh(true);
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

    $scope.$on('$ionicView.loaded', function() {
        easterEggClickCount = 0;
        $scope.settings = storageService.getObject('settings');
        $scope.magicCookie = storageService.getObject('magicCookie');

        if ($scope.settings.jumpToDistrict === true &&
            $scope.settings.myDistrict.k !== 'LWZ' &&
            $rootScope.alreadyJumpedToDistrict !== true) {

            $rootScope.alreadyJumpedToDistrict = true;
            $state.go('tabs.overview-incidents', {
                id: $scope.settings.myDistrict.k
            });
        }

        $ionicModal.fromTemplateUrl('templates/about.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.date = new Date();
            $scope.aboutDialog = modal;
        });

        $ionicModal.fromTemplateUrl('templates/settings.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            if (!$scope.settings.myDistrict) {
                $scope.settings.myDistrict = {
                    k: 'LWZ'
                };
            }

            if (angular.isUndefinedOrNull($scope.settings.showIncidentDistance)) {
                $scope.settings.showIncidentDistance = true;
            }

            if (angular.isUndefinedOrNull($scope.settings.showIncidentHydrants)) {
                $scope.settings.showIncidentHydrants = true;
            }

            $scope.$watch('settings', function(newValue, oldValue) {
                console.debug('Settings changed', oldValue, newValue);
                storageService.setObject('settings', newValue);
            }, true);

            $scope.settingsDialog = modal;
        });

        $ionicModal.fromTemplateUrl('templates/info-messages.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.infoMessagesDialog = modal;
        });

        $ionicPopover.fromTemplateUrl('templates/magic-cookie.html', {
            scope: $scope
        }).then(function(popover) {
            // check for empty object
            if (angular.toJson($scope.magicCookie) === '{}') {
                $scope.magicCookie = {
                    value: '',
                    active: false
                };
            }

            $scope.$watch('magicCookie', function(newValue, oldValue) {
                console.debug('Magic cookie changed', oldValue, newValue);
                storageService.setObject('magicCookie', newValue);
            }, true);

            $scope.popover = popover;
        });
    });

    $scope.onExtendedIncidentDataChanged = function() {
        updateToken();
    };

    function updateToken() {
        if (!$scope.settings.showExtendedIncidentData) {
            return;
        }

        $scope.loadingTokenInfo = true;

        util.genericRefresh($scope, dataService.getInfoScreenData(false), function(data) {
            if (data.CurrentState == 'token' || data.CurrentState == 'waiting') {
                $scope.token = data.Token;
                $scope.waitForToken = true;
            } else {
                $scope.waitForToken = false;
            }

            $scope.loadingTokenInfo = false;
        });
    }

    $scope.copyTokenToClipboard = function() {
        if (!$window.cordova) {
            return;
        }

        $cordovaClipboard.copy($scope.token).then(function() {
            $cordovaToast.showShortBottom('Code wurde in die Zwischenablage kopiert');
        });
    };

    $scope.openAboutDialog = function() {
        $scope.aboutDialog.show();
    };

    $scope.closeAboutDialog = function() {
        $scope.aboutDialog.hide();
    };
    
    $scope.openSettingsDialog = function() {
        updateToken();
        $scope.settingsDialog.show();
    };

    $scope.closeSettingsDialog = function() {
        $scope.settingsDialog.hide();
    };

    $scope.openInfoMessagesDialog = function() {
        storageService.setObject('messages', calculatedHashes);
        $scope.hasNewMessages = false;
        $scope.infoMessagesDialog.show();
    };

    $scope.closeInfoMessagesDialog = function() {
        $scope.infoMessagesDialog.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.aboutDialog.remove();
        $scope.settingsDialog.remove();
        $scope.infoMessagesDialog.remove();
        $scope.popover.remove();
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.closePopover = function() {
        $scope.popover.hide();
    };

    $scope.onEasterEggClicked = function(event) {
        easterEggClickCount++;
        if (easterEggClickCount > 10) {
            easterEggClickCount = 0;
            $scope.openPopover(event);
        }
    };
});
angular.module('grisu-noe').service('util', function($ionicPopup, $ionicLoading) {
    this.showErrorDialog = function(message) {
        $ionicPopup.alert({
            title: message,
            buttons: [{
                text: 'OK',
                type: 'button-assertive'
            }]
        });
    };

    this.showLoadingErrorDialog = function(httpCode) {
        var message = 'Daten konnten nicht geladen werden. ';

        switch (httpCode) {
            case 0:
                message += 'Möglicherweise besteht keine Internetverbindung.';
                break;
            default:
                message += 'Fehlercode ' + httpCode;
                break;
        }

        this.showErrorDialog(message);
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

    this.hideLoadingInScope = function(scope) {
        scope.isRefreshing = false;
        scope.$broadcast('scroll.refreshComplete');
        this.hideLoading();
    };

    this.genericRefresh = function(scope, dataPromise, callback, options) {
        var self = this;
        scope.isRefreshing = true;
        this.showLoadingDelayed();

        var hideLoading = true;
        if ((typeof options === 'object') &&
            options.hasOwnProperty('hideRefreshers') &&
            options.hideRefreshers === false) {
            hideLoading = false;
        }

        var showErrorDialog = true;
        if ((typeof options === 'object') &&
            options.hasOwnProperty('showErrorDialog') &&
            options.showErrorDialog === false) {
            showErrorDialog = false;
        }

        dataPromise.then(function(data) {
            callback(data);
        }, function(errCode) {
            if (showErrorDialog) {
                self.showLoadingErrorDialog(errCode);
            }

            if (!hideLoading) {
                self.hideLoadingInScope(scope);
            }
        }).finally(function() {
            if (hideLoading) {
                self.hideLoadingInScope(scope);
            }
        });
    };

    this.calculateBygoneTime = function(dateTimeStr, pattern) {
        var begin = moment(dateTimeStr, pattern).utc();

        if (!begin.isValid()) {
            console.error('Parsing of bygone time failed!');
            return null;
        }

        var millis = moment().utc().diff(begin);

        if (millis < 1000) {
            console.debug('Value of milliseconds is too small', millis);
            return null;
        }

        var duration = moment.duration(millis);

        return {
            hours: Math.floor(duration.asHours()),
            minutes: moment.utc(millis).format('m')
        };
    };

    this.formatWastlDate = function(dateStr) {
        if (angular.isUndefinedOrNull(dateStr)) {
            return null;
        }
        return moment(dateStr.substring(0, 19).replace('T', ' '), 'YYYY-MM-DD HH:mm:ss').format('DD.MM.YYYY HH:mm:ss');
    };
});
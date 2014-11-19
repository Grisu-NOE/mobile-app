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
                message += 'Fehlercode ' + code;
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
});
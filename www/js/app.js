angular.module('app', ['ionic'])

    .config(['$ionicTabsConfig', function($ionicTabsConfig) {
        // Override the Android platform default to add "tabs-striped" class to "ion-tabs" elements.
        $ionicTabsConfig.type = '';
    }])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar
            // above the keyboard for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            if (window.StatusBar) {
                window.StatusBar.styleLightContent();
            }
        });
    });
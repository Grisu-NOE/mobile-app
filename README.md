Grisu NÖ [![MIT License][license-image]][license-url] [![Build Status][travis-image]][travis-url]
============

[![Apple App Store][app-store-image]][app-store-url] [![Google Play Store][play-store-image]][play-store-url]

The already existing mobile web-app (http://mobile.leitstelle122.at/) of WASTL - shortened for "<strong>Wa</strong>rn- und Alarm<strong>st</strong>ufen<strong>l</strong>iste" in German - is used to display several realtime information of currently running fire brigade incidents in Lower Austria. The incident data is kindly provided by the voluntary fire department "Freiwillige Feuerwehr Krems". WASTL is a project by several public sector entities:

> Die Warn- und Alarmstufenliste ist ein gemeinsames Projekt des NÖ Landesfeuerwehrverbandes, der NÖ Landesregierung, des Bundesrechenzentrums, des Bezirksfeuerwehrkommandos Krems, des Magistrates der Stadt Krems sowie der Freiwilligen Feuerwehr Krems.

This project aims to build a modern mobile web-app based on the [Ionic framework](http://ionicframework.com/) to improve the functionality of the existing solution. The new resulting mobile app should be available in several app stores for different mobile platforms to have a native look and feel.

Contributing
------------

You want to contribute? Great! Thanks for being awesome! Please see the project related [issues](https://github.com/l-e-X/grisu-noe/issues) before you start coding. Pull requests are always welcome!

### Coding guidelines

- 4 spaces for indentation
- 140 character max. line length
- In general, try to make your code blend in with the surrounding code.

### Testing

Please consider to write unit and integration tests for your code. We use [Travis CI](https://travis-ci.org/l-e-X/grisu-noe) as continuous integration system where all tests will get executed after each git push.

### Setup of development environment

- Install [node.js](http://nodejs.org/) and [python](https://www.python.org/downloads/) (v2.7.x)
- `npm install -g cordova ionic gulp`
- Go to project root folder
- Install required node dependencies: `npm install`
  - When an "python not found" error occurs when using Windows try [this](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
- Run Gulp dependency installation: `gulp install`
  - If you have problems to execute the Gulp task, try to execute `git config url."https://".insteadOf git://` before
- Add platforms
  - `ionic platform add ios` (only works on Mac OSX)
  - `ionic platform add android` (you need to install the [Android SDK](https://developer.android.com/sdk/) before)
- ENJOY!

### Useful commands and hints
- Show app log in console when debugging app on Android device with USB
  - `adb logcat -s CordovaLog:D`
- Start Google Chrome with disabled web security to retrieve data from remote servers
  - see http://stackoverflow.com/a/6083677/1296333
- Watch SASS changes and compile / move it immediately
  - `gulp watch-sass`
- Run unit and integration test suite
  - `gulp test`
- Start web server and open browser. It also watches for code changes.
  - `ionic serve`
- Emulate an iOS device with Mac OSX
  - List available emulators: `<PROJECT_ROOT>/platforms/ios/cordova/lib/list-emulator-images`
  - Start emulator: `ionic emulate ios --target="<TARGET>"` e.g.: `ionic emulate ios --target="iPad (Retina)"`

Licencing
---------

Grisu NÖ is licenced under the [MIT License (MIT)](LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[travis-url]: https://travis-ci.org/l-e-X/grisu-noe
[travis-image]: https://travis-ci.org/l-e-X/grisu-noe.svg?branch=master

[app-store-url]: https://itunes.apple.com/at/app/grisu-no-feuerwehr-wastl/id961696829?mt=8&uo=4
[app-store-image]: https://linkmaker.itunes.apple.com/htmlResources/assets/en_us/images/web/linkmaker/badge_appstore-lrg.png

[play-store-url]: https://play.google.com/store/apps/details?id=at.lex.grisu.noe
[play-store-image]: https://developer.android.com/images/brand/en_generic_rgb_wo_45.png

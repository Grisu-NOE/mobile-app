Grisu NÖ [![Build Status](https://travis-ci.org/l-e-X/grisu-noe.svg?branch=master)](https://travis-ci.org/l-e-X/grisu-noe)
============

The already existing mobile web-app (http://mobile.leitstelle122.at/) of WASTL - shortened for "<strong>Wa</strong>rn- und Alarm<strong>st</strong>ufen<strong>l</strong>iste" in German - is used to display several realtime information of currently running fire brigade incidents in Lower Austria. The incident data is kindly provided by the voluntary fire department "Freiwillige Feuerwehr Krems". WASTL is a project by several public sector entities:

> Die Warn- und Alarmstufenliste ist ein gemeinsames Projekt des NÖ Landesfeuerwehrverbandes, der NÖ Landesregierung, des Bundesrechenzentrums, des Bezirksfeuerwehrkommandos Krems, des Magistrates der Stadt Krems sowie der Freiwilligen Feuerwehr Krems.

This project aims to build a modern mobile web-app based on the [Ionic framework](http://ionicframework.com/) to improve the functionality of the existing solution. The new resulting mobile app should be available in several app stores for different mobile platforms to have a native look and feel.

Contributing
------------

You want to contribute? Great! Thanks for being awesome! At the moment, we have a big internal todo list to get the first version to work, so please see the project related [issues](https://github.com/l-e-X/grisu-noe/issues) before you start coding. Pull requests are always welcome!

### Coding guidelines

- 4 spaces for indentation
- 140 character max. line length
- In general, try to make your code blend in with the surrounding code.

### Testing

Please consider to write unit and integration tests for your code. We use [Travis CI](https://travis-ci.org/l-e-X/grisu-noe) as continuous integration system where all tests will get executed after each git push.

### Setup of development environment

- Install [node.js](http://nodejs.org/)
- `npm install -g cordova ionic gulp`
- Go to project root folder
- Install required node dependencies: `npm install`
- Run Gulp dependency installation: `gulp install`
  - If you have problems to execute the Gulp task, try to execute `git config url."https://".insteadOf git://` before
- Install Cordova and Ionic plugins with command `ionic plugin add <plugin>`
  - `org.apache.cordova.console`
  - `org.apache.cordova.device`
  - `com.ionic.keyboard`
  - `org.apache.cordova.statusbar`
  - `org.apache.cordova.globalization`
- Add platforms
  - `ionic platform add ios`
  - `ionic platform add android`
- Copy platform specific assets from folder `platform_assets` to corresponding folder in generated platform

Licencing
---------

Grisu NÖ is licenced under the [MIT License (MIT)](http://opensource.org/licenses/MIT).

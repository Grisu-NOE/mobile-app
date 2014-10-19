Grisu NÖ [![Build Status](https://travis-ci.org/l-e-X/wastl-mobile.svg?branch=master)](https://travis-ci.org/l-e-X/wastl-mobile)
============

The already existing mobile web-app (http://mobile.leitstelle122.at/) of WASTL - shortened for "<strong>Wa</strong>rn- und Alarm<strong>st</strong>ufen<strong>l</strong>iste" in German - is used to display several realtime information of currently running fire brigade incidents in Lower Austria. The incident data is kindly provided by the voluntary fire department "Freiwillige Feuerwehr Krems". WASTL is a project by several public sector entities:

> Die Warn- und Alarmstufenliste ist ein gemeinsames Projekt des NÖ Landesfeuerwehrverbandes, der NÖ Landesregierung, des Bundesrechenzentrums, des Bezirksfeuerwehrkommandos Krems, des Magistrates der Stadt Krems sowie der Freiwilligen Feuerwehr Krems.

This project aims to build a modern mobile web-app based on the framework ionic (http://ionicframework.com/) to improve the functionality of the existing solution. The new resulting mobile app should be available in several app stores for different mobile platforms to have a native look and feel.

Contributing
------------

You want to contribute? Great! Thanks for being awesome! At the moment, we have a big internal todo list to get the first version to work, so please see the project related [issues](https://github.com/l-e-X/wastl-mobile/issues) and the [contribution guide](https://github.com/l-e-X/wastl-mobile/wiki/Contribution-guide) before you start coding. Pull requests are always welcome!

Licencing
---------

WASTL Mobile is licenced under the [MIT License (MIT)](http://opensource.org/licenses/MIT).



We welcome pull requests to WASTL Mobile. If you'd like to add a small or larger feature, keep reading. If you have any questions, or want help solving a problem, feel free to contact l-e-X for further information.

Installation Guide

Install node.js
npm install -g cordova ionic gulp
Install Cordova and Ionic plugins
org.apache.cordova.console
org.apache.cordova.device
com.ionic.keyboard
with command ionic plugin add ...
Add platforms
ionic platform add ios
ionic platform add android
Copy platform specific assets from platform_assets to corresponding folder in generated platform TODO: complete guide
Unit tests

TODO: write unit test text (howto)

Coding guidelines

4 spaces for indentation
140 character max. line length
In general, try to make your code blend in with the surrounding code.

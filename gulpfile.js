var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var del = require('del');
var jshint = require('gulp-jshint');

var requiredCordovaPlugins = [
    'cordova-plugin-whitelist@1.2.2',
    'cordova-plugin-console@1.0.3',
    'cordova-plugin-device@1.1.2',
    'cordova-plugin-statusbar@2.1.3',
    'cordova-plugin-splashscreen@3.2.2',
    'cordova-plugin-geolocation@2.2.0',
    'cordova-plugin-inappbrowser@1.4.0',
    'https://github.com/VersoSolutions/CordovaClipboard', // only master available
    'https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git#2.5.2',
    'https://github.com/wymsee/cordova-HTTP.git#v1.2.0',
    'https://github.com/robertklein/cordova-ios-security.git', // only master branch available
    'https://github.com/gitawego/cordova-screenshot.git#v0.1.5'
];

gulp.task('sass', function() {
    return processSass();
});

gulp.task('sass:watch', function() {
    gulp.watch('./scss/ionic.app.scss', ['sass']);
});

gulp.task('lint', function() {
    return gulp.src('./www/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('bower', function(done) {
    bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        }).on('end', function() {
            done();
        }).on('error', function() {
            printErrorMessageAndExit('ERROR: Bower install ended NOT OK!');
        });
});

gulp.task('cordova', function(done) {
    for (var i = 0; i < requiredCordovaPlugins.length; i++) {
        var plugin = requiredCordovaPlugins[i];
        if (sh.exec('ionic plugin add --nosave ' + plugin).code !== 0) {
            printErrorMessageAndExit('Error: Couldn\'t install Cordova plugin ' + plugin);
        }
    }
    done();
});

gulp.task('git:check', function(done) {
    if (!sh.which('git')) {
        printErrorMessageAndExit('Git is not installed.\n' +
            'Git, the version control system, is required to download Ionic.\n' +
            'Download git here: http://git-scm.com/downloads\n' +
            'Once git is installed, run \'gulp install\' again.'
        );
    }
    done();
});

gulp.task('install', ['git:check', 'cordova', 'bower'], function() {
    // this is a hack for simulating a synchronous behavior
    console.log("*** Compiling SASS ***");
    processSass();
});

gulp.task('clean', function(done) {
    del([
        'node_modules/**',
        'plugins/**',
        'platforms/**',
        'www/css/**',
        'www/lib/**'
    ], done());
});

function printErrorMessageAndExit(msg) {
    console.log(gutil.colors.red(msg));
    process.exit(1);
}

function processSass() {
    return gulp.src('./scss/ionic.app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./www/css/'))
        .pipe(cleanCss({ keepSpecialComments: 0 }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'));
}

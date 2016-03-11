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
    'cordova-plugin-whitelist',
    'cordova-plugin-console',
    'cordova-plugin-device',
    'cordova-plugin-statusbar',
    'cordova-plugin-splashscreen',
    'cordova-plugin-geolocation',
    'cordova-plugin-inappbrowser',
    'https://github.com/VersoSolutions/CordovaClipboard',
    'https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git',
    'https://github.com/Grisu-NOE/cordova-HTTP.git',
    'https://github.com/robertklein/cordova-ios-security.git'
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
var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var karma = require('gulp-karma');
var sh = require('shelljs');
var del = require('del');

var paths = {
    sass: ['./scss/**/*.scss']
};

var requiredCordovaPlugins = [
    'cordova-plugin-whitelist',
    'cordova-plugin-console',
    'cordova-plugin-device',
    'cordova-plugin-statusbar',
    'cordova-plugin-splashscreen',
    'cordova-plugin-geolocation',
    'https://github.com/VersoSolutions/CordovaClipboard',
    'https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin.git'
];

var isSassWatchOn = false;

gulp.task('sass', function() {
    processSass();
});

gulp.task('watch-all', ['watch-sass', 'watch-test']);

gulp.task('watch-sass', function() {
    isSassWatchOn = true;
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('test', function() {
    // NOTE: Using the fake './foobar' so as to run the files
    // listed in karma.conf.js INSTEAD of what was passed to
    // gulp.src !
    return gulp.src('./foobar')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});

gulp.task('watch-test', function() {
    return gulp.watch(['www/js/**/*.js', 'test/unit/*.js'], ['test']);
});

gulp.task('install-bower-components', function(done) {
    bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        }).on('end', function() {
            done();
        }).on('error', function() {
            printErrorMessageAndExit('ERROR: Bower install ended NOT OK!');
        });
});

gulp.task('install-cordova-plugins', function(done) {
    for (var i = 0; i < requiredCordovaPlugins.length; i++) {
        var plugin = requiredCordovaPlugins[i];
        if (sh.exec('ionic plugin add --nosave ' + plugin).code !== 0) {
            printErrorMessageAndExit('Error: Couldn\'t install Cordova plugin ' + plugin);
        }
    }
    done();
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        printErrorMessageAndExit('Git is not installed.\n' +
            'Git, the version control system, is required to download Ionic.\n' +
            'Download git here: http://git-scm.com/downloads\n' +
            'Once git is installed, run \'gulp install\' again.'
        );
    }
    done();
});

gulp.task('install', ['git-check', 'install-cordova-plugins', 'install-bower-components'], function() {
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
    var sassOptions = {};
    if (isSassWatchOn) {
        sassOptions.errLogToConsole = true;
    }
    return gulp.src('./scss/ionic.app.scss')
        .pipe(sass(sassOptions))
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'));
}

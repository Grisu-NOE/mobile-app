var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var karma = require('gulp-karma');
var sh = require('shelljs');

var paths = {
    sass: ['./scss/**/*.scss']
};

var requiredCordovaPlugins = [
    'org.apache.cordova.console',
    'org.apache.cordova.device',
    'com.ionic.keyboard',
    'org.apache.cordova.statusbar',
    'https://github.com/whiteoctober/cordova-plugin-app-version.git'
];

var isSassWatchOn = false;

gulp.task('sass', function(done) {
    var sassOptions = {};
    if (isSassWatchOn) {
        sassOptions.errLogToConsole = true;
    }
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass(sassOptions))
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
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

gulp.task('install', ['git-check', 'install-cordova-plugins', 'sass'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('install-cordova-plugins', function(done) {
    for (var i = 0; i < requiredCordovaPlugins.length; i++) {
        var plugin = requiredCordovaPlugins[i];
        if (sh.exec('ionic plugin add ' + plugin).code !== 0) {
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

function printErrorMessageAndExit(msg) {
    console.log(gutil.colors.red(msg));
    process.exit(1);
}
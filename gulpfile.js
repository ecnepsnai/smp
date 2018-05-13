/* global require */
/* jshint esversion:6 */
const gulp = require('gulp');
const stylus = require('gulp-stylus');
const htmlmin = require('gulp-htmlmin');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const es = require('event-stream');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

const BUILD_DIRECTORY_BASE = './static';

gulp.task('js', function() {
    'use strict';

    return es.merge([
        gulp.src('./js/ng/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(concat('ng.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/js')),
        gulp.src(['./js/*.js', './../shared/*.js'])
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/js'))
    ]);
});

gulp.task('html', function() {
    'use strict';

    return es.merge([
        gulp.src('./js/ng/pages/**/*.html')
            .pipe(htmlmin({
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeComments: true,
            }))
            .pipe(rename({dirname: ''}))
            .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/html/')),
        gulp.src('./html/*.html')
            .pipe(htmlmin({
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeComments: true,
            }))
            .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/'))
        ]);
});

gulp.task('css', function() {
    'use strict';

    return es.merge([
        gulp.src(['./fonts/*.css'])
            .pipe(concat('fonts.css'))
            .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/css')),
        gulp.src(['./css/*.styl', './../shared/*.styl'])
            .pipe(concat('main.styl'))
            .pipe(stylus())
            .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/css'))
    ]);
});

gulp.task('img', function() {
    'use strict';

    return gulp.src('./img/**/*')
        .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/img'));
});

gulp.task('fonts', function() {
    'use strict';

    return gulp.src(['./fonts/*.eot', './fonts/*.svg', './fonts/*.ttf', './fonts/*.woff', './fonts/*.woff2'])
        .pipe(gulp.dest(BUILD_DIRECTORY_BASE + '/assets/fonts'));
});

gulp.task('clean', function() {
    'use strict';

    return gulp.src(BUILD_DIRECTORY_BASE + '/', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('copy', function() {
    'use strict';

    return gulp.src('./copy/**/*')
        .pipe(gulp.dest(BUILD_DIRECTORY_BASE));
});

gulp.task('watch', function() {
    'use strict';

    watch('./js/**/*.js', batch(function(events, done) {
        gulp.start('js', done);
    }));
    watch(['./css/*.styl', './../shared/*.styl'], batch(function(events, done) {
        gulp.start('css', done);
    }));
    watch(['./html/**/*.html', './include/*.html', './js/ng/pages/**/*.html'], batch(function(events, done) {
        gulp.start('html', done);
    }));
    watch('./img/**/*', batch(function(events, done) {
        gulp.start('img', done);
    }));
    watch('./fonts/*', batch(function(events, done) {
        gulp.start('fonts', done);
    }));
});

gulp.task('release', function() {
    'use strict';
    return gulp.src([BUILD_DIRECTORY_BASE + '/assets/**/*.map'], {read: false})
        .pipe(clean({force: true}));
});

gulp.task('start', ['default', 'watch']);
gulp.task('default', ['css', 'js', 'html', 'img', 'fonts', 'copy']);

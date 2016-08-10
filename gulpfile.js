var gulp = require('gulp');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var size = require('gulp-size');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var del = require('del');
var runSequence = require('run-sequence');
var tape = require('gulp-tape');
var tapspec = require('tap-spec');

var paths = {
    js: ['./frontend/src/js/**/*.jsx', './app.jsx', './frontend/src/js/vera-parser.js'],
    jsLibs: './frontend/src/lib/**/*.js',
    css: './frontend/src/css/**/*.css',
    fonts: ['./frontend/src/fonts/**/*', './node_modules/font-awesome/fonts/**/*'],
    extCss: './frontend/src/ext/css/**/*.css',
    buildDir: './frontend/build',
    jsBuild: './frontend/build/js',
    cssBuild: './frontend/build/css',
    fontsBuild: './frontend/build/fonts',
    distDir: './dist',
    indexHtml: './frontend/src/index.html',
    favicon: './frontend/src/favicon.png'
}

var env = process.env.NODE_ENV || 'development'

gulp.task('compile-js', function () {
    return browserify('./app.jsx')
        .transform(reactify)
        .bundle()
        .on('error', handleError)
        .pipe(source('vera.js'))
        .pipe(buffer())
        .pipe(gulpif(env === 'production', uglify().on('error', e => {console.log("error from uglify", e)})))
        .pipe(size())
        .pipe(gulp.dest(paths.jsBuild));
});

gulp.task('bundle-css', function () {
    return gulp.src(['./node_modules/font-awesome/css/font-awesome.css',paths.extCss, paths.css ])
        .pipe(concat('bundle.css'))
        .pipe(minifyCSS())
        .pipe(size())
        .pipe(gulp.dest(paths.cssBuild));
});

gulp.task('copy-fonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.fontsBuild));
});

gulp.task('copy-indexhtml', function () {
    return gulp.src(paths.indexHtml)
        .pipe(gulp.dest(paths.buildDir));
});


gulp.task('copy-favicon', function() {
    return gulp.src(paths.favicon).pipe(gulp.dest(paths.buildDir));
})

gulp.task('watch', function () {
    gulp.watch(paths.js, ['compile-js']);
    gulp.watch(paths.css, ['bundle-css']);
    gulp.watch(paths.indexHtml, ['copy-indexhtml']);
});

gulp.task('handle-dist-files', function () {
    del(paths.distDir, function () {
        gulp.src(paths.buildDir + '/**/*')
            .pipe(gulp.dest(paths.distDir + '/frontend/build'));
        gulp.src('./server.js')
            .pipe(gulp.dest(paths.distDir));
        gulp.src('./backend/**/*')
            .pipe(gulp.dest(paths.distDir + '/backend'));
    })
});

gulp.task('clean', function (cb) {
    return del(paths.buildDir, cb);
});

gulp.task('default', ['watch', 'clean-build']);

gulp.task('clean-build', function () {
    runSequence('clean', 'build');
});

gulp.task('build', ['compile-js', 'bundle-css', 'copy-fonts', 'copy-indexhtml', 'copy-favicon']);

gulp.task('dist', function () {
    env = 'production';
    runSequence('clean', 'build', 'handle-dist-files');
});

gulp.task('test', function () {
    return gulp.src('test/*.js')
    .pipe(tape({reporter: tapspec()}));
});

var handleError = function(err){
    console.error(err);
    console.error("[ERROR]", err.description)
    this.emit('end');
};
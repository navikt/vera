var gulp = require('gulp');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var del = require('del');
var runSequence = require('run-sequence');

var paths = {
    js: ['./frontend/src/js/**/*.jsx', './app.jsx'],
    css: './frontend/src/css/**/*.css',
    buildDir: './frontend/build',
    jsBuild: './frontend/build/js',
    cssBuild: './frontend/build/css',
    fontsBuild: './frontend/build/fonts',
    dockerBuild: './docker',
    indexHtml: './frontend/src/index.html'
}

gulp.task('compile-js', function () {
    return browserify('./app.jsx')
        .transform(reactify)
        .bundle()
        .pipe(source('vera.js'))
        .pipe(buffer())
        //.pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest(paths.jsBuild));
});

gulp.task('copy-css', function () {
    return gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.css', paths.css, './node_modules/font-awesome/css/font-awesome.css'])
        .pipe(gulp.dest(paths.cssBuild));
});

gulp.task('copy-fonts', function () {
    return gulp.src('./node_modules/font-awesome/fonts/**/*')
        .pipe(gulp.dest(paths.fontsBuild));
});

gulp.task('copy-indexhtml', function () {
    return gulp.src(paths.indexHtml)
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['compile-js']);
    gulp.watch(paths.css, ['copy-css']);
    gulp.watch(paths.indexHtml, ['copy-indexhtml']);
});

gulp.task('handle-docker-files', function () {
    del(paths.dockerBuild, function () {
        gulp.src(paths.buildDir + '/**/*')
            .pipe(gulp.dest(paths.dockerBuild + '/frontend/build'));
        gulp.src('./server.js')
            .pipe(gulp.dest(paths.dockerBuild));
        gulp.src('./backend/**/*')
            .pipe(gulp.dest(paths.dockerBuild + '/backend'));
    })
});

gulp.task('clean', function (cb) {
    return del(paths.buildDir, cb);
});

gulp.task('default', ['watch', 'clean-build']);

gulp.task('clean-build', function () {
    runSequence('clean', 'build');
});

gulp.task('build', ['compile-js', 'copy-css', 'copy-fonts', 'copy-indexhtml']);

gulp.task('docker', function () {
    runSequence('clean', 'build', 'handle-docker-files');
});
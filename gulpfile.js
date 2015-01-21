var gulp = require('gulp');

var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var del = require('del');

var paths = {
    js: ['./frontend/src/js/**/*.jsx', './app.jsx'],
    css: ['./frontend/src/css/**/*.css'],
    buildDir: './frontend/build',
    jsBuild: './frontend/build/js',
    cssBuild: './frontend/build/css',
    fontsBuild: './frontend/build/fonts'
}

del.sync(paths.buildDir);

gulp.task('compile-js', function () {
    var compileJavascript = function () {
        browserify('./app.jsx')
            .transform(reactify)
            .bundle()
            .pipe(source('vera.js'))
            .pipe(buffer())
            //.pipe(uglify())
            .pipe(size())
            .pipe(gulp.dest(paths.jsBuild));
    };

    del(paths.jsBuild, compileJavascript);
})

gulp.task('copy-css', function () {
    var copyCss = function () {
        gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css')
            .pipe(gulp.dest(paths.cssBuild));
        gulp.src(paths.css)
            .pipe(gulp.dest(paths.cssBuild));
        gulp.src('./node_modules/font-awesome/css/font-awesome.css')
            .pipe(gulp.dest(paths.cssBuild));
        gulp.src('./node_modules/react-select/dist/default.css')
            .pipe(rename('react-select.css'))
            .pipe(gulp.dest(paths.cssBuild));
    };

    del(paths.cssBuild, copyCss);
});

gulp.task('copy-fonts', function () {
    var copyFonts = function () {
        gulp.src('./node_modules/font-awesome/fonts/**/*')
            .pipe(gulp.dest(paths.fontsBuild));
    };

    del(paths.fontsBuild, copyFonts);
});

gulp.task('copy-indexhtml', function () {
    gulp.src('./frontend/src/index.html')
        .pipe(gulp.dest(paths.buildDir));
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['compile-js']);
    gulp.watch(paths.css, ['copy-css']);
});

gulp.task('default', ['watch', 'compile-js', 'copy-css', 'copy-fonts', 'copy-indexhtml']);




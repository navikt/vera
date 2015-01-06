var gulp = require('gulp');

var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var size = require('gulp-size');

gulp.task('js', function() {
    browserify('./public/src/js/vera.jsx')
        .transform(reactify)
        .bundle()
        .pipe(source('vera.js'))
        .pipe(buffer())
//        .pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest('./public/build/'));
})

gulp.task('watch', function(){
    gulp.watch('./public/src/js/**/*.jsx', ['js']);
});

gulp.task('default', ['watch', 'js']);


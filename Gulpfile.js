var gulp = require('gulp');

var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var del = require('del');

gulp.task('js', ['clean'], function() {
    browserify('./app.jsx')
        .transform(reactify)
        .bundle()
        .pipe(source('vera.js'))
        .pipe(buffer())
//        .pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest('./public/build/'));
})

gulp.task('copy-css', ['clean'], function(){
    gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css')
    .pipe(gulp.dest('./public/build/'))
});

gulp.task('watch', function(){
    gulp.watch('./public/src/js/**/*.jsx', ['js', 'copy-css']);
});

gulp.task('clean', function(cb){
    del(['./public/build'], cb);
});

gulp.task('build', ['js', 'copy-css']);

gulp.task('default', ['watch', 'build']);




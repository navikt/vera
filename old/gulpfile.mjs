import gulp from 'gulp';
import buffer from 'vinyl-buffer';
import browserify from 'browserify';
import reactify from 'reactify';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';
//import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import size from 'gulp-size';
import minifyCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import { deleteAsync } from 'del';
import tape from 'gulp-tape';
import tapspec from 'tap-spec';

const { task, dest, src, watch, series, parallel } = gulp;

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
    indexHtml: ['./frontend/src/index.html'],
    favicon: './frontend/src/favicon.png'
}

var env = process.env.NODE_ENV || 'development'

async function compileJs() {
    return browserify('./app.jsx')
        .transform(reactify)
        .bundle()
        .on('error', handleError)
        .pipe(source('vera.js'))
        .pipe(buffer())
        .pipe(gulpif(env === 'production', uglify().on('error', e => {console.log("error from uglify", e)})))
        .pipe(size())
        .pipe(dest(paths.jsBuild));
}

async function bundleCss () {
    return src(['./node_modules/font-awesome/css/font-awesome.css',paths.extCss, paths.css ])
        .pipe(concat('bundle.css'))
        .pipe(minifyCSS())
        .pipe(size())
        .pipe(dest(paths.cssBuild));
}

async function copyFonts() {
    return src(paths.fonts)
        .pipe(dest(paths.fontsBuild));
}

async function copyIndexhtml() {
    return src(paths.indexHtml)
        .pipe(dest(paths.buildDir));
}


async function copyFavicon() {
    return src(paths.favicon).pipe(dest(paths.buildDir));
}

task('watch', () => {
    watch(paths.js, compileJs);
    watch(paths.css, bundleCss);
    watch(paths.indexHtml, copyIndexhtml);
});

async function handleDistFiles() {
    await deleteAsync(paths.distDir, () => {
            src(paths.buildDir + '/**/*')
                .pipe(dest(paths.distDir + '/frontend/build'));
            src('./server.js')
                .pipe(dest(paths.distDir));
            src('./backend/**/*')
                .pipe(dest(paths.distDir + '/backend'));
            resolve();
        })
}

async function clean() {
    await deleteAsync(paths.buildDir);
}

task('build', parallel(compileJs, bundleCss, copyFonts, copyIndexhtml, copyFavicon));
task('clean-build', series(clean, 'build'));
task('default', series('watch', 'clean-build'));

task('dist', series(async ()  => {
    env = 'production';
    await series(clean, 'build', handleDistFiles)();
}));

task('test', () => {
    return src('test/*.js')
    .pipe(tape({reporter: tapspec()}));
});

const handleError = function(err){
    console.error(err);
    console.error("[ERROR]", err.description)
    this.emit('end');
};

export {
    compileJs,
    bundleCss,
    copyFonts,
    copyIndexhtml,
    copyFavicon,
    handleDistFiles,
    clean
    // ... (export other tasks if needed)
};
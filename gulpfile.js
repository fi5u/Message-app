var gulp = require('gulp'),
    sass = require('gulp-sass'),

    paths = {
        sass: './message_app/static/css',
        css: './message_app/static/css'
    };

gulp.task('sass', function() {
    gulp.src(paths.sass + '/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.css));
});


gulp.task('watch', function() {
    gulp.watch(paths.sass + '/**/*.scss', ['sass']);
});

gulp.task('default', ['watch']);
import gulp from 'gulp';
import gulpEsbuild from 'gulp-esbuild';
import gulpPostcss from 'gulp-postcss';
import postcssCsso from 'postcss-csso';

function styles() {
  return gulp
    .src('src/main.css')
    .pipe(gulpPostcss([postcssCsso]))
    .pipe(gulp.dest('dist'));
}

function scripts() {
  return gulp
    .src('src/main.js')
    .pipe(gulpEsbuild({
      minify: true,
      platform: 'browser',
    }))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', gulp.parallel(styles, scripts));

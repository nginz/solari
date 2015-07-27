var gulp        = require('gulp')
    browserify  = require('browserify'),
    watchify    = require('watchify'),
    uglify      = require('gulp-uglify'),
    eslint      = require('gulp-eslint'),
    shim        = require('browserify-shim'),
    notify      = require('gulp-notify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    del         = require('del');

var config = {
  js: {
    bundle: {entries: './src/solari.js', standalone: 'Solari'},
    source: 'solari.js',
    dist: './dist'
  }
}

gulp.task('clean', function(cb) {
  del(['./solari.js'], cb);
});

gulp.task('watchify', function() {
  var bundler = watchify(browserify(config.js.bundle, watchify.args));
  bundler.transform(shim)

  function rebundle(){
    return bundler.bundle()
      .on('error', notify.onError())
      .pipe(source(config.js.source))
      .pipe(buffer())
      .pipe(gulp.dest(config.js.dist));
  }

  bundler.on('update', rebundle);
  return rebundle();
});

gulp.task('browserify', function() {
  var bundler = browserify(config.js.bundle);
  bundler.transform(shim)
    .bundle()
    .pipe(source(config.js.source))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.js.dist));
});

gulp.task('lint', function(){
  return gulp.src(['./src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
});

gulp.task('build', ['clean'], function() {
  process.env.NODE_ENV = 'production';
  gulp.start(['browserify']);
});

gulp.task('default', function() {
  console.log('Run "gulp watchify or gulp build"');
});
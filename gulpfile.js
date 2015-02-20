/*
 * Dependencias
 */
var gulp = require('gulp'),
 del = require('del'),
 server = require('karma').server,
 args = require('yargs'),
 browserify = require('browserify'),
 watchify = require('watchify'),
 browserSync = require('browser-sync'),
 assign = require('lodash.assign'),
 source = require('vinyl-source-stream'),
 buffer = require('vinyl-buffer'),
  $ = require('gulp-load-plugins')({
    lazy: true
  });

var colors = $.util.colors;
var envenv = $.util.env;

var demo = './demo/';
var src = './src/';
var core = src + 'CrowdSim.js';

var config = {
  src: src,
  demo: demo,
  lib: demo + 'js/lib/',
  dist: './dist/',
  core: core,
  js: {
    demo: demo + 'js/*.js',
    src: src + '**/*.js',
  },
  optimized: {
    simulator: 'crowd-sim.js',
    minified: 'crowd-sim.min.js'
  },
  report: './report/',
  watchify: {
    opts: {
      entries: [core],
      debug: true
    }
  }
};

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * @description Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
  var delconfig = [config.dist, config.lib, config.report];
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * @description vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
  var vetsource = [config.js.src, config.js.demo];
  log('Analyzing source with JSHint and JSCS: ' + $.util.colors.blue(vetsource));
  return gulp
      .src(vetsource)
      //.pipe($.plumber())
      .pipe($.if(args.verbose, $.print()))
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
      .pipe($.jshint.reporter('fail'))
      .pipe($.jscs());
});

gulp.task('test', function(done) {
  log('Running tests');
  var options = {
    configFile: __dirname + '/karma.conf.js',
    singleRun: !args.dev,
  };
  server.start(options, done);
});

var opts = assign({}, watchify.args, config.watchify.opts);
var w = watchify(browserify(opts));
w.on('update',function() {
  doBrowserify(w);
  browserSync.notify('reloading now ...');
  browserSync.reload();
});
w.on('log', $.util.log);

gulp.task('build', ['vet', 'test'], function() {
  return doBrowserify(browserify(config.core))
    /*gulp.src(config.jsSimulator)
    .pipe($.concat(config.optimized.simulator))
    .pipe(gulp.dest(config.dist))
    .pipe($.rename(config.optimized.minified))
    .pipe($.uglify())*/
    .pipe($.uglify())
    .pipe(gulp.dest(config.dist));
});

gulp.task('js', ['clean'],function() {
  var port = 8080;
  log('Starting BrowserSync on port ' + port);
  var options = {
      //proxy: 'localhost:' + port,
      server: {
        baseDir: config.demo
      },
      port: 3000,
      files: [
          config.demo + '**/*.*',
          config.src + '**/*.*'
        ],
      ghostMode: { // these are the defaults t,f,t,t
        clicks: true,
        location: false,
        forms: true,
        scroll: true
      },
      injectChanges: true,
      logFileChanges: true,
      logLevel: 'debug',
      logPrefix: 'gulp-patterns',
      notify: true,
      reloadDelay: 0 //1000
    } ;
  browserSync(options);
  doBrowserify(w);
});

function doBrowserify(b) {
  return b.bundle()
  .on('error', $.util.log.bind($.util, 'Browserify Error'))
  //.pipe($.plumber())
  .pipe(source('CrowdSim.js'))
  .pipe(buffer())
  .pipe($.sourcemaps.init({loadMaps: true})) // loads map from browserify file
  .pipe($.sourcemaps.write('./')) // writes .map file
  .pipe(gulp.dest(config.lib));
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
  var notifier = require('node-notifier');
  var notifyOptions = {
    sound: 'Bottle',
    contentImage: path.join(__dirname, 'gulp.png'),
    icon: path.join(__dirname, 'gulp.png')
  };
  _.assign(notifyOptions, options);
  notifier.notify(notifyOptions);
}

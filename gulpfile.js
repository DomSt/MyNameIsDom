var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync");
var useref = require("gulp-useref");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var minifyCSS = require("gulp-minify-css");
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");
var del = require("del");
var runSequence = require("run-sequence");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");

//  ----------------------------------------------------------------------------
//  GENERAL GULP TASKS
//  ----------------------------------------------------------------------------

//  gulp.task('task-name', function() {
//    --> Stuff here
//  });

// Compiling SCSS to CSS
gulp.task("sass", function() {
  return gulp.src("dev/scss/**/*.scss")
    .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))
      .pipe(autoprefixer({
        browsers: ["last 2 versions"]
      }))
    .pipe(sourcemaps.write("./."))
    .pipe(gulp.dest("dev/css"))
    .pipe(browserSync.reload({
      stream: true
    }));
});

//Starting server and syncing browser
// #BACKLOG:10 Add firefox DevEd to browser.
gulp.task("browserSync", function() {
  browserSync({
    server: {
      baseDir: "dev",
      index: "patternLib.html",
      browser: ["google chrome"]
    }
  });
});

//Concatenating and minifying JS and CSS
gulp.task('useref', function(){
  var assets = useref.assets();

  return gulp.src('dev/**/*.html')
    .pipe(assets)
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', minifyCSS()))
    // Uglifies only if it's a Javascript file
    .pipe(gulpIf('*.js', uglify()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

//Optimizing Images
gulp.task("images", function() {
  return gulp.src("dev/img/**/*.+(png|jpg|gif|svg)")
    .pipe(cache(imagemin({
      // --> ImageMin options
    })))
    .pipe(gulp.dest("dist/img"));
});

//Copying font files
gulp.task("fonts", function() {
  return gulp.src("dev/fonts/**/*")
    .pipe(gulp.dest("dist/fonts"));
});

//Clean dist folder
gulp.task("clean:all", function(callback) {
  del("dist");
  return cache.clearAll(callback);
});

// #BACKLOG:0 Clean Gulp Task works only with del 1.2.1 (Globbing issue). Find a Fix.
//Clean dist folder EXCEPT images
gulp.task("clean", function(callback) {
  del(["dist/**/*", "!dist/img", "!dist/img/**/*"], callback);
});

// Watch for file changes
gulp.task("watch", ["browserSync", "sass"], function() {
  gulp.watch("dev/scss/**/*.scss", ["sass"]);
  gulp.watch("dev/*.html", browserSync.reload);
  gulp.watch("dev/js/**/*.js", browserSync.reload);
  // --> More watchers
});


//  ----------------------------------------------------------------------------
//  DEVELOPMENT GULP TASKS
//  ----------------------------------------------------------------------------

//Default task
gulp.task("default", function(callback) {
  runSequence(["sass", "browserSync", "watch"],
    callback
  );
});


//  ----------------------------------------------------------------------------
//  BUILD GULP TASKS
//  ----------------------------------------------------------------------------

//Build site
gulp.task("build", function(callback) {
  runSequence("clean",
    ["sass", "useref", "images", "fonts"],
    callback
  );
});

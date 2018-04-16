var gulp = require('gulp')
var eslint = require('gulp-eslint')
var babel = require('gulp-babel')
var watch = require('gulp-watch')
var concat = require('gulp-concat')
var webserver = require('gulp-webserver')
var rollup = require('rollup')
var rollupConfig = require('./rollup.config')

// task: default
gulp.task('default', function() {
  // 将你的默认的任务代码放在这
})

// task: lint
gulp.task('build', ['lint'], async () => {
  for (var key in rollupConfig) {
    let bundle = await rollup.rollup(rollupConfig[key])
    bundle.write(rollupConfig[key].output)
  }
})

// task: lint
gulp.task('lint', () => {
  gulp.src(['src/**.js','!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

// task: dev
gulp.task('dev', () => {
  gulp.src('./')
  .pipe(webserver({
    // path: './test',
    livereload: true,
    directoryListing: true,
    open: true
  }))
})

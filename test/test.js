'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var umd = require('../');
var fs = require('fs');

module.exports = {
  testExports: function(test) {
    gulp.src('test/fixture/*.js')
      .pipe(umd({
        exports: function() {
          return 'Foo.Bar';
        }
      }))
      .pipe(gutil.buffer(function(err, files) {
        assertFilesContents(test, files[0], 'testExports.txt');
        test.done();
      }));
  },

  testNamespace: function(test) {
    gulp.src('test/fixture/*.js')
      .pipe(umd({
        namespace: function() {
          return 'Foo.Bar';
        }
      }))
      .pipe(gutil.buffer(function(err, files) {
        assertFilesContents(test, files[0], 'testNamespace.txt');
        test.done();
      }));
  },

  testWithDependencies: function(test) {
    gulp.src('test/fixture/*.js')
      .pipe(umd({
        dependencies: function() {
          return [
            'm0',
            {
              name: 'm1',
              amd: 'm1amd',
              cjs: 'm1cjs',
              global: 'm1glob',
              param: 'm1param'
            },
            {
              name: 'm2',
              amd: 'm2amd',
              cjs: 'm2cjs',
              global: 'm2glob',
              param: 'm2param'
            }
          ];
        }
      }))
      .pipe(gutil.buffer(function(err, files) {
        assertFilesContents(test, files[0], 'testWithDependencies.txt');
        test.done();
      }));
  },

  testWithoutDependencies: function(test) {
    gulp.src('test/fixture/*.js')
      .pipe(umd())
      .pipe(gutil.buffer(function(err, files) {
        assertFilesContents(test, files[0], 'testWithoutDependencies.txt');
        test.done();
      }));
  }
};

function assertFilesContents(test, file, compareFilepath) {
  test.equal(
    file.contents.toString(),
    fs.readFileSync(__dirname + '/fixture/' + compareFilepath).toString(),
    'Wrapped file content is different from test template'
  );
}

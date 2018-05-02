'use strict';

var gulp = require('gulp');
var concat = require('concat-stream');
var umd = require('../');
var fs = require('fs');
var path = require('path');

var genericTest = function (options, fixtureFilename) {
  return function (test) {
    var isDone = {
      buffer: false,
      stream: false
    };
    var done = key => {
      isDone[key] = true;
      if (isDone.buffer && isDone.stream) {
        test.done();
      }
    };
    var compare = fs.readFileSync(path.join(__dirname, 'fixture', fixtureFilename), 'utf-8');
    var assertContents = contents => {
      test.equal(contents, compare, 'Wrapped file content is different from test template ' + fixtureFilename);
    };

    gulp.src('test/fixture/foo.js', {buffer: false})
      .pipe(umd(options))
      .pipe(concat({encoding: 'object'}, function(files) {
        var file = files[0];
        file.contents.pipe(concat({encoding: 'utf-8'}, contents => {
          assertContents(contents);
          done('stream');
        }));
      }));
    gulp.src('test/fixture/foo.js', {buffer: true})
      .pipe(umd(options))
      .pipe(concat({encoding: 'object'}, function(files) {
        var file = files[0];
        assertContents(file.contents.toString());
        done('buffer');
      }));
  };
};

module.exports = {
  /* Generic test structure
  misc: {
    testExports: genericTest(
      {
        templateName: 'xxxx',
        exports: function() {
          return 'Foo.Bar';
        }
      },
      'xxxxx/testExports.js'
    ),

    testNamespace: genericTest(
      {
        templateName: 'xxxx',
        namespace: function() {
          return 'Foo.Bar';
        }
      },
      'xxxxx/testNamespace.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'xxxx',
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
      },
      'xxxxx/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'xxxx'

      },
      'xxxxx/testWithoutDependencies.js'
    )
  },
  /**/

  amd: {
    testExports: genericTest(
      {
        templateName: 'amd',
        exports: function() {
          return 'Foo.Bar';
        }
      },
      'amd/testExports.js'
    ),

    testNamespace: genericTest(
      {
        templateName: 'amd',
        namespace: function() {
          return 'Foo.Bar';
        }
      },
      'amd/testNamespace.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'amd',
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
      },
      'amd/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'amd'
      },
      'amd/testWithoutDependencies.js'
    )
  },

  amdCommonWeb: {
    testExports: genericTest(
      {
        templateName: 'amdCommonWeb',
        exports: function() {
          return 'Foo';
        }
      },
      'amdCommonWeb/testExports.js'
    ),

    testExportsMap: genericTest(
      {
        templateName: 'amdCommonWeb',
        exports: function() {
          return {
            'FooFunc': 'Foo',
            'FooLength': 'Foo.length'
          };
        }
      },
      'amdCommonWeb/testExportsMap.js'
    ),

    testNamespace: genericTest(
      {
        templateName: 'amdCommonWeb',
        namespace: function() {
          return 'Foo.Bar';
        }
      },
      'amdCommonWeb/testNamespace.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'amdCommonWeb',
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
      },
      'amdCommonWeb/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'amdCommonWeb'
      },
      'amdCommonWeb/testWithoutDependencies.js'
    )
  },

  amdWeb: {
    testExports: genericTest(
      {
        templateName: 'amdWeb',
        exports: function() {
          return 'Foo.Bar';
        }
      },
      'amdWeb/testExports.js'
    ),

    testNamespace: genericTest(
      {
        templateName: 'amdWeb',
        namespace: function() {
          return 'Foo.Bar';
        }
      },
      'amdWeb/testNamespace.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'amdWeb',
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
      },
      'amdWeb/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'amdWeb'
      },
      'amdWeb/testWithoutDependencies.js'
    )
  },

  common: {
    testExports: genericTest(
      {
        templateName: 'common',
        exports: function() {
          return {
            'FooBar': 'Foo.Bar'
          };
        }
      },
      'common/testExports.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'common',
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
      },
      'common/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'common'
      },
      'common/testWithoutDependencies.js'
    )
  },

  node: {
    testExports: genericTest(
      {
        templateName: 'node',
        exports: function() {
          return 'Foo.Bar';
        }
      },
      'node/testExports.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'node',
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
      },
      'node/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'node'
      },
      'node/testWithoutDependencies.js'
    )
  },

  'umd / returnExports': {
    testExports: genericTest(
      {
        exports: function() {
          return 'Foo.Bar';
        }
      },
      'returnExports/testExports.js'
    ),

    testNamespace: genericTest(
      {
        namespace: function() {
          return 'Foo.Bar';
        }
      },
      'returnExports/testNamespace.js'
    ),

    testWithDependencies: genericTest(
      {
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
      },
      'returnExports/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
      },
      'returnExports/testWithoutDependencies.js'
    ),

    testWithoutDependenciesAlias: genericTest(
      {
        templateName: 'amdNodeWeb'
      },
      'returnExports/testWithoutDependencies.js'
    )
  },

  web: {
    testExports: genericTest(
      {
        templateName: 'web',
        exports: function() {
          return 'Foo.Bar';
        }
      },
      'web/testExports.js'
    ),

    testNamespace: genericTest(
      {
        templateName: 'web',
        namespace: function() {
          return 'Foo.Bar';
        }
      },
      'web/testNamespace.js'
    ),

    testWithDependencies: genericTest(
      {
        templateName: 'web',
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
      },
      'web/testWithDependencies.js'
    ),

    testWithoutDependencies: genericTest(
      {
        templateName: 'web'
      },
      'web/testWithoutDependencies.js'
    )
  }
};

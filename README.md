gulp-umd
============

[![Build Status](http://img.shields.io/travis/eduardolundgren/gulp-umd.svg?style=flat)](https://travis-ci.org/eduardolundgren/gulp-umd)

This repository provides a simple way to build your files with support for the design and implementation of the Universal Module Definition (UMD) API for JavaScript modules. These are modules which are capable of working everywhere, be it in the client, on the server or elsewhere.

The UMD pattern typically attempts to offer compatibility with the most popular script loaders of the day (e.g RequireJS amongst others). In many cases it uses [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) as a base, with special-casing added to handle [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) compatibility.

## Variations

### Regular Module

* amdNodeWeb / returnExports / [templates/returnExports.js](https://github.com/umdjs/umd/blob/master/returnExports.js) -
  Defines a module that works in Node, AMD and browser globals. If you also want
  to export a global even when AMD is in play (useful if you are loading other
  scripts that still expect that global), use
  [returnExportsGlobal.js](https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js).

* amd / [templates/amd.js](test/fixture/amd/testWithDependencies.js)
  Defines a module that works in AMD.
  
* amdCommonWeb / [templates/amdCommonWeb.js](test/fixture/amdCommonWeb/testWithDependencies.js)
  Defines a module that works in CommonJS Strict, AMD and browser globals.
   
* amdWeb / [templates/amdWeb.js](test/fixture/amdWeb/testWithDependencies.js)
  Defines a module that works in AMD and browser globals.
  
* common / [templates/common.js](test/fixture/common/testWithDependencies.js)
  Defines a module that works in CommonJS Strict.
  
* node / [templates/node.js](test/fixture/node/testWithDependencies.js)
  Defines a module that works in Node.
  
* web / [templates/web.js](test/fixture/web/testWithDependencies.js)
  Defines a module that works in browser globals.

See more variation options that can be added as [templates onto this project](https://github.com/eduardolundgren/gulp-umd/tree/master/templates) on the [UMD (Universal Module Definition) patterns](https://github.com/umdjs/umd).

## Options

The following options are the ones available with the current default values:

```js
{
  dependencies: function(file) {
    return [];
  },
  exports: function(file) {
    return capitalizeFilename(file);
  },
  namespace: function(file) {
    return capitalizeFilename(file);
  },
  templateName: 'amdNodeWeb',
  template: path.join(__dirname, 'templates/returnExports.js'),
  templateSource: 'module.exports = <%= exports %>'
}
```

* `dependencies`:
  Function which returns an array of dependencies.
  Each dependency is specified either as a string, or as an object of the form.
  ```js
  {
    dependencies: function (file) {
      return {
        name: 'defaultModuleName',
        amd: 'moduleNameInAMD',
        cjs: 'moduleNameInCommonJsAndNodeJs',
        global: 'moduleNameInBrowserGlobals',
        param: 'ModuleIdentifier'
      }
  }
  ```
  
* `exports`:
  Specifies the item (or for CommonJS, *item's*) which the module will export.
  For non CommonJS, this value should be a string specifying the exported item.
  ```js
  {
    exports: function (file) {
      return 'Foo.Bar';
    }
  }
  ```
  For CommonJS, this value should be an object with keys specifying the names and values specifying the exported items.
  ```js
  {
    exports: function (file) {
      return {
        'Foo': 'Foo',
        'FooBar': 'Foo.Bar'
      };
    }
  }
  ```

* `namespace`:
  Specifies the global namespace to export to. Only used for Web globals.
  ```js
  {
    namespace: function (file) {
      return 'My.Global.Namespace';
    }
  }
  ```

* `templateName`:
  Specifies the name of the template to use.
  Available template names are amd, amdNodeWeb, amdCommonWeb, amdWeb, common, node, returnExports and web. 
  *See above for descriptions.*
  If specified, overrides the template and templateSource.
  ```js
  {
    templateName: 'amdNodeWeb'
  }
  ```

* `templateSource`:
  Specifies the lodash template source to use when wrapping input files.
  If specified, overrides template.
  ```js
  {
    template: '<%= contents %>'
  }
  ```
    
* `template`:
  Specifies the path to a file containing a lodash template to use when wrapping input files.
  ```
  {
    template: '/path/to/my/template'
  }
  ```

## Examples

#### Build a simple module

Let's wrap `src/foo.js` file with UMD definition:

```js
'use strict';
function Foo() {}
```

Then, in the gulp task:

```js
gulp.task('umd', function() {
  return gulp.src('src/*.js')
    .pipe(umd())
    .pipe(gulp.dest('build'));
});
```

After build `build/foo.js` will look like:

```js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Foo = factory();
  }
}(this, function() {
'use strict';
  function Foo() {}
  return Foo;
}));
```

Note that by default the filename `foo.js` is uppercased and will be used as the return exports for your module and also for the global namespace, in this case `root.Foo`. This is configurable, see the advanced build section below.

#### Build with dependencies

Let's wrap `src/foo.js` file with UMD definition defining some dependencies:

```js
'use strict';
function Foo() {}
```

Then, in the gulp task:

```js
gulp.task('umd', function(file) {
  return gulp.src('src/*.js')
    .pipe(umd({
        dependencies: function(file) {
          return [
            {
              name: 'moduleName1',
              amd: 'moduleName1_amd',
              cjs: 'moduleName1_cjs',
              global: 'moduleName1_glob',
              param: 'moduleName1'
            },
            {
              name: 'moduleName2',
              amd: 'moduleName2_amd',
              cjs: 'moduleName2_cjs',
              global: 'moduleName2_glob',
              param: 'moduleName2'
            }
          ];
        }
      }))
    .pipe(gulp.dest('build'));
});
```

After build `build/foo.js` will look like:

```js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['moduleName1_amd', 'moduleName2_amd'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('moduleName1_cjs'), require('moduleName2_cjs'));
  } else {
    root.Foo = factory(root.moduleName1_glob, root.moduleName2_glob);
  }
}(this, function(moduleName1, moduleName2) {
'use strict';
  function Foo() {}
  return Foo;
}));
```

The advanced configuration for the dependencies allows you to have full control of how your UMD wrapper should handle dependency names.

#### Advanced build

Let's wrap `src/foo.js` file with UMD definition and exports the `Foo.Bar` class:

```js
'use strict';
function Foo() {};
Foo.Bar = function() {};
```

Then, in the gulp task:

```js
gulp.task('umd', function() {
  return gulp.src('src/*.js')
    .pipe(umd({
      exports: function(file) {
          return 'Foo.Bar';
        },
        namespace: function(file) {
          return 'Foo.Bar';
        }
    }))
    .pipe(gulp.dest('build'));
});
```

After build `build/foo.js will look like:

```js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Foo.Bar = factory();
  }
}(this, function() {
'use strict';
  function Foo() {};
  Foo.Bar = function() {};
  return Foo.Bar;
}));
```

## Templates

In order to use any of the variations defined on the [UMD (Universal Module Definition) patterns](https://github.com/umdjs/umd) repository you can use the following template keys:

* `<%= amd %>`: Contains the AMD normalized values from the options dependencies array, e.g. `['a', 'b']` turns into `['a', 'b']`.
* `<%= cjs %>`: Contains the CommonJS normalized values from the options dependencies array, e.g. `['a', 'b']` turns into `require('a'), require('b')`.
* `<%= commaCjs %>`: As above, prefixed with ', ' if not empty.
* `<%= global %>`: Contains the browser globals normalized values from the options dependencies array, e.g. `['a', 'b']` turns into `root.a, root.b`.
* `<%= commaGlobal %>`: As above, prefixed with ', ' if not empty.
* `<%= namespace %>`: The namespace where the exported value is going to be set on the browser, e.g. `root.Foo.Bar`.
* `<%= exports %>`: What the module should return, e.g. `Foo.Bar`. By default it returns the filename with uppercase without extension, e.g. `foo.js` returns `Foo`.
  If using CommonJS, this value may be an object as specified by the result of options.exports
* `<%= param %>`: Comma seperated list of variable names which are bound to their respective modules, eg `a, b`.
* `<%= commaParam %>`: As above, prefixed with ', ' if not empty.

You can also use [umd-templates](https://www.npmjs.com/package/umd-templates), using the `patternName.path` property if `template` option is used, and `patternName.template` if `templateSource` is used. 

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


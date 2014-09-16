'use strict';

var es = require('event-stream');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var tpl = require('lodash.template');

var defaultOptions = {
  dependencies: function() {
    return [];
  },
  exports: function(file) {
    return capitalizeFilename(file);
  },
  namespace: function(file) {
    return capitalizeFilename(file);
  },
  template: path.join(__dirname, 'templates/returnExports.js')
};

function umd(options) {
  options = extend(extend({}, defaultOptions), options);
  var template = fs.readFileSync(options.template);
  return es.map(function(file, callback) {
    wrap(file, template, buildFileTemplateData(file, options), callback);
  });
}

function buildFileTemplateData(file, options) {
  var amd = [];
  var cjs = [];
  var global = [];
  var param = [];
  var dependencies = options.dependencies(file);

  dependencies.forEach(function(dep) {
    if (typeof dep === 'string') {
      dep = {
        amd: dep,
        cjs: dep,
        global: dep,
        param: dep
      };
    }
    amd.push('\'' + (dep.amd || dep.name) + '\'');
    cjs.push('require(\'' + (dep.cjs || dep.name) + '\')');
    global.push('root.' + (dep.global || dep.name));
    param.push(dep.param || dep.name);
  });

  return {
    dependencies: dependencies,
    exports: options.exports(file),
    namespace: options.namespace(file),
    // Adds resolved dependencies for each environment into the template data
    amd: '[' + amd.join(', ') + ']',
    cjs: cjs.join(', '),
    global: global.join(', '),
    param: param.join(', ')
    // =======================================================================
  };
}

function capitalizeFilename(file) {
  var name = path.basename(file.path, path.extname(file.path));
  return name.charAt(0).toUpperCase() + name.substring(1);
}

function extend(target, source) {
  source = source || {};
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
}

function wrap(file, template, data, callback) {
  data.file = file;

  if (gutil.isStream(file.contents)) {
    var through = es.through();
    var wait = es.wait(function(err, contents) {
      data.contents = contents;
      through.write(tpl(template, data));
      through.end();
    });
    file.contents.pipe(wait);
    file.contents = through;
  }

  if (gutil.isBuffer(file.contents)) {
    data.contents = file.contents.toString();
    file.contents = new Buffer(tpl(template, data));
  }
  callback(null, file);
}

module.exports = umd;

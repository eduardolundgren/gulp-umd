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
  template: path.join(__dirname, 'templates/returnExports.js'),

  /* null or string
   * null is auto mode (detect by code)
   * string is indent string, examples: '  ', '    ', '[TAB]' */
  indent: null,

  /* if "indent" option is null (auto mode) and can't detect indent by code
   * then uses this value for "indent" option as default. */
  defaultIndentValue: '  '
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
    param: param.join(', '),
    // =======================================================================
    indent: options.indent,
    defaultIndentValue: options.defaultIndentValue
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

function prepareIndent(options) {
  var indentMatch;

  if (typeof options.contents !== 'string') {
    throw new Error('"contents" option must be a string.');
  }

  if (options.indent === null) {
    // auto detect by code
    indentMatch = options.contents.match(/^([ \t])/);
    options.indent =
      (indentMatch) ? indentMatch[1] : options.defaultIndentValue;
  } else if (typeof options.indent !== 'string') {
    throw new Error('Unknown type of "indent" option value.');
  }

  var getContentsWithIndent;

  (function (contents, indent) {
    getContentsWithIndent = function (count) {
      var indentStr = '';
      for (var i=0; i<count; i++) {
        indentStr += indent;
      }
      return contents
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n/g, '\n' + indentStr);
    };
  })(options.contents.toString(), options.indent);

  options.getContentsWithIndent = getContentsWithIndent;
}

function wrap(file, template, data, callback) {
  data.file = file;

  if (gutil.isStream(file.contents)) {
    var through = es.through();
    var wait = es.wait(function(err, contents) {
      data.contents = contents;
      prepareIndent(data);
      through.write(tpl(template, data));
      through.end();
    });
    file.contents.pipe(wait);
    file.contents = through;
  }

  if (gutil.isBuffer(file.contents)) {
    data.contents = file.contents.toString();
    prepareIndent(data);
    file.contents = new Buffer(tpl(template, data));
  }

  callback(null, file);
}

module.exports = umd;

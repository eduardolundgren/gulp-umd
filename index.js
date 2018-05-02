'use strict';

var concat = require('concat-stream');
var fs = require('fs');
var path = require('path');
var _template = require('lodash.template');
var through = require('through2');

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
  template: path.join(__dirname, 'templates', 'returnExports.js')
};

function umd(options) {
  options = Object.assign({}, defaultOptions, options);

  var text;

  if(options.templateName) {
    text = options.templateName;
    if (text === 'amdNodeWeb') {
      text = 'returnExports';
    }
    text = path.join(__dirname, 'templates', text + '.js');
    text = fs.readFileSync(text);
  }
  else if(options.templateSource) {
    text = options.templateSource;
  }
  else {
    text = fs.readFileSync(options.template);
  }

  var compiled = _template(text);

  return through.obj(function(file, enc, next) {
    var data;
    var err;

    try {
      data = buildFileTemplateData(file, options);
      wrap(file, compiled, data);
    } catch (e) {
      err = e;
    }

    next(err, file);
  });
}

function buildFileTemplateData(file, options) {
  var amd = [];
  var cjs = [];
  var global = [];
  var param = [];
  var requires = [];
  var dependencies = options.dependencies(file);
  var commaPrefix;

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
    requires.push((dep.param || dep.name) + '=require(\'' + (dep.cjs || dep.name) + '\')');
  });

  commaPrefix = function (items) {
    return items.map(function (value) {
      return ', ' + value;
    }).join('');
  };

  return {
    dependencies: dependencies,
    exports: options.exports(file),
    namespace: options.namespace(file),
    // Adds resolved dependencies for each environment into the template data
    amd: '[' + amd.join(', ') + ']',
    cjs: cjs.join(', '),
    commaCjs: commaPrefix(cjs),
    global: global.join(', '),
    commaGlobal: commaPrefix(global),
    param: param.join(', '),
    commaParam: commaPrefix(param)
    // =======================================================================
  };
}

function capitalizeFilename(file) {
  var name = path.basename(file.path, path.extname(file.path));
  return name.charAt(0).toUpperCase() + name.substring(1);
}

function wrap(file, template, data) {
  data.file = file;

  if (file.isStream()) {
    var contents = through();

    file.contents.pipe(concat({encoding: 'utf-8'}, function(s) {
      data.contents = s;
      contents.push(template(data));
      contents.push(null);
    }));
    file.contents = contents;
  } else if (file.isBuffer()) {
    data.contents = file.contents.toString();
    file.contents = Buffer.from(template(data));
  }
}

module.exports = umd;

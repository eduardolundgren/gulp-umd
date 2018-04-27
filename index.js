'use strict';

var es = require('event-stream');
var fs = require('fs');
var path = require('path');
var _template = require('lodash.template');

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
  options = Object.assign({}, defaultOptions, options);

  var text;

  if(options.templateName) {
    text = options.templateName;
    if (text === 'amdNodeWeb') {
      text = 'returnExports';
    }
    text = path.join(__dirname, 'templates/' + text + '.js');
    text = fs.readFileSync(text);
  }
  else if(options.templateSource) {
    text = options.templateSource;
  }
  else {
    text = fs.readFileSync(options.template);
  }

  var compiled = _template(text);

  return es.mapSync(function(file) {
    return wrap(file, compiled, buildFileTemplateData(file, options));
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
    var through = es.through();
    var wait = es.wait(function(err, contents) {
      data.contents = contents;
      through.write(template(data));
      through.end();
    });
    file.contents.pipe(wait);
    file.contents = through;
  } else if (file.isBuffer()) {
    data.contents = file.contents.toString();
    file.contents = Buffer.from(template(data));
  }

  return file;
}

module.exports = umd;

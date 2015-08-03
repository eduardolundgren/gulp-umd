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

  var template;

  if(options.templateName) {
    template = options.templateName;
    if (template === 'amdNodeWeb') {
      template = 'returnExports';
    }
    template = path.join(__dirname, 'templates/' + template + '.js');
    template = fs.readFileSync(template);
  }
  else if(options.templateSource) {
    template = options.templateSource;
  }
  else {
    template = fs.readFileSync(options.template);
  }

  return es.map(function(file, callback) {
    wrap(file, template, buildFileTemplateData(file, options), callback);
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

    if (file.sourceMap) {
      (function () {
        var sourceMap = require('source-map');
        var applySourceMap = require('vinyl-sourcemaps-apply');
        var generator = new sourceMap.SourceMapGenerator(file.sourceMap);
        var consumer = new sourceMap.SourceMapConsumer(file.sourceMap);
        var output;
        var ilineAdustment = 0;
        var correctContents = data.contents;
        var correctContentsNewLines = correctContents.split('\n').length - 1;

        // f8b4dd18-72da-4e25-80bb-451b67a88dba is just a magic number to find where the contents is being placed.
        // It's a bit of a hack, but should cover 99% of use cases

        data.contents = 'f8b4dd18-72da-4e25-80bb-451b67a88dba';
        output = tpl(template, data);

        output = output.split('\n').map(function (line, iline) {
          return line.replace(/f8b4dd18-72da-4e25-80bb-451b67a88dba/g, function () {
            consumer.eachMapping(function (mapping) {
              return generator.addMapping({
                generated: {
                  line: mapping.generatedLine + iline + ilineAdustment,
                  column: mapping.generatedColumn + (mapping.generatedLine == 1 ? (iline + ilineAdustment) : 0) // adjust first line
                },
                original: {
                  line: mapping.originalLine,
                  column: mapping.originalColumn
                },
                source: mapping.source,
                name: mapping.name
              });
            });
            ilineAdustment += correctContentsNewLines;
            return correctContents;
          });
        }).join('\n');

        file.contents = new Buffer(output);
        applySourceMap(file, generator.toString());
      })();
    }
    else {
    file.contents = new Buffer(tpl(template, data));
    }

  }
  callback(null, file);
}

module.exports = umd;

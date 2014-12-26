/*!
 * vinyl-yaml-data | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/vinyl-yaml-data
*/
'use strict';

var path = require('path');

var BufferStreams = require('bufferstreams');
var objectPath = require('object-path');
var replaceExt = require('replace-ext');
var through = require('through2');
var tryStreamPush = require('try-stream-push');
var xtend = require('xtend');
var yaml = require('js-yaml');

module.exports = function vinylYamlData(options) {
  options = options || {};

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb();
      return;
    }

    if (file.path === undefined) {
      this.emit('error', new TypeError('Expecting vinyl object to have "path" property.'));
      cb();
      return;
    }

    var props = path.relative(file.base, file.path).split(path.sep);

    if (!options.ext) {
      props[props.length - 1] = replaceExt(props[props.length - 1], '');
    }

    var self = this;

    function parseYaml(buf, cb) {
      var result = {};
      var yamlOptions = xtend(options, {
        filename: path.resolve(file.cwd, path.relative('', file.path)),
        ext: undefined
      });

      tryStreamPush(self, function() {
        objectPath.set(result, props, yaml.safeLoad(buf, xtend(options, yamlOptions)));
        return result;
      });

      cb();
    }

    if (file.isStream()) {
      file.contents = file.contents.pipe(new BufferStreams(function(none, buf, cb) {
        parseYaml(buf, cb);
      }));
      return;
    }

    parseYaml(file.contents, cb);
  });
};

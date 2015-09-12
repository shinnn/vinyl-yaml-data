/*!
 * vinyl-yaml-data | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/vinyl-yaml-data
*/
'use strict';

const path = require('path');
const Transform = require('stream').Transform;

const BufferStreams = require('bufferstreams');
const objectPath = require('object-path');
const replaceExt = require('replace-ext');
const tryStreamPush = require('try-stream-push');
const yaml = require('js-yaml');

module.exports = function vinylYamlData(options) {
  options = options || {};

  return new Transform({
    objectMode: true,
    transform(file, enc, cb) {
      if (file.isNull()) {
        cb();
        return;
      }

      if (file.path === undefined) {
        this.emit('error', new TypeError('Expecting vinyl object to have "path" property.'));
        cb();
        return;
      }

      const props = path.relative(file.base, file.path).split(path.sep);

      if (!options.ext) {
        props[props.length - 1] = replaceExt(props[props.length - 1], '');
      }

      const parseYaml = (buf, done) => {
        const result = {};
        const yamlOptions = Object.assign({}, options, {
          filename: path.resolve(file.cwd, path.relative('', file.path))
        });

        tryStreamPush(this, function parseVinylContentsAsYaml() {
          objectPath.set(result, props, yaml.safeLoad(buf, yamlOptions));
          return result;
        });

        done();
      };

      if (file.isStream()) {
        file.contents = file.contents.pipe(new BufferStreams(
          function parseYamlTransform(none, buf, done) {
            parseYaml(buf, done);
            cb();
          }
        ));
        return;
      }

      parseYaml(file.contents, cb);
    }
  });
};

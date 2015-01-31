# vinyl-yaml-data

[![NPM version](https://img.shields.io/npm/v/vinyl-yaml-data.svg?style=flat)](https://www.npmjs.com/package/vinyl-yaml-data)
[![Build Status](https://img.shields.io/travis/shinnn/vinyl-yaml-data.svg?style=flat)](https://travis-ci.org/shinnn/vinyl-yaml-data)
[![Build status](https://ci.appveyor.com/api/projects/status/4rcpnepnghwekpgv?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/vinyl-yaml-data)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/vinyl-yaml-data.svg?style=flat)](https://coveralls.io/r/shinnn/vinyl-yaml-data)
[![Dependency Status](https://img.shields.io/david/shinnn/vinyl-yaml-data.svg?style=flat&label=deps)](https://david-dm.org/shinnn/vinyl-yaml-data)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/vinyl-yaml-data.svg?style=flat&label=devDeps)](https://david-dm.org/shinnn/vinyl-yaml-data#info=devDependencies)

Convert [vinyl](https://github.com/wearefractal/vinyl) objects of [YAML](http://www.yaml.org/) files into plane objects

```javascript
var gulp = require('gulp');
var through = require('through2');
var vinylYamlData = require('vinyl-yaml-data');

// data/person.yaml: 'name: Bob'

gulp.task('default', function() {
  return gukl.src('data/*.yaml')
    .pipe(vinylYamlData());
    .pipe(through.obj(function(obj, enc, cb) {
      obj; //=> {person: {name: 'Bob'}}
      cb();
    }));
});
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```sh
npm install vinyl-yaml-data
```

## API

```javascript
var vinylYamlData = require('vinyl-yaml-data');
```

### vinylYamlData([*options*])

[file.path]: https://github.com/wearefractal/vinyl#optionspath

*options*: `Object`  
Return: `Object` ([stream.Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform_1))

It returns a transform stream. The stream parses [`file.contents`](https://github.com/wearefractal/vinyl#optionscontents) as YAML, and read back an object which contains the parsed data.

The parsed object will be assigned to the specific object path based on the [`file.path`][file.path]. For example,

| [file.path]            | object path          |
| :--------------------- | :------------------- |
| `foo.yam`              | `foo`                |
| `foo/bar.yaml`         | `foo.bar`            |
| `foo/bar/baz.qux.yaml` | `foo.bar['baz.qux']` |
| `../foo/bar.txt`       | `['..'].foo.bar`     |
| `foo/../bar/baz.txt`   | `bar.baz`            |

Path components included in [`file.base`](https://github.com/wearefractal/vinyl#optionsbase) will be omitted from the object path.

```javascript
var File = require('vinyl');
var vinylYamlData = require('vinyl-yaml-data');

var vinylYamlStream = vinylYamlData();

vinylYamlStream.on('data', function(data) {
  data; //=> {baz: ['Hello', 'world']}
});

vinylYamlStream.write(new File({
  cwd: 'foo',
  base: 'bar',
  path: 'bar/baz.yaml',
  contents: new Buffer('[Hello, world]')
}));

vinylYamlStream.end();
```

#### options

The argument will be directly passed to [`yaml.safeLoad`](https://github.com/nodeca/js-yaml#safeload-string---options-)'s option and used on parsing.

Additionally, [`ext` option](#optionsext) is available.

##### options.ext

Type: `Boolean`  
Default: `false`

By default object paths don't include file extension. `true` keeps it in the last property name.

```javascript
var File = require('vinyl');
var vinylYamlData = require('vinyl-yaml-data');

vinylYamlData()
.on('data', function(data) {
  data; //=> {'foo.yml': {a: 'b'}}
})
.end(new File({
  path: 'foo.yml',
  contents: new Buffer('a: b')
}));
```

## Example

### Simulate [`_data`](http://jekyllrb.com/docs/datafiles/) directory of [Jekyll](http://jekyllrb.com/)

[deep-extend-stream](https://github.com/shinnn/deep-extend-stream) helps you to merge multiple YAML data into a single object in a stream.

```javascript
var gulp = require('gulp');
var jade = require('gulp-jade');

var vinylYamlData = require('vinyl-yaml-data');
var deepExtend = require('deep-extend-stream');

var locals;

gulp.task('data', function() {
  locals = {};

  return gulp.src('data/**/*.y{,a}ml')
    .pipe(vinylYamlData())
    .pipe(deepExtend(locals));
});

gulp.task('views', ['data'], function() {
  return gulp.src('views/**/*.jade')
    .pipe(jade({locals: locals}))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['views']);
```

## License

Copyright (c) 2014 - 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

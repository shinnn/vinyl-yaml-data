# vinyl-yaml-data

[![NPM version](https://img.shields.io/npm/v/vinyl-yaml-data.svg)](https://www.npmjs.com/package/vinyl-yaml-data)
[![Build Status](https://img.shields.io/travis/shinnn/vinyl-yaml-data.svg)](https://travis-ci.org/shinnn/vinyl-yaml-data)
[![Build status](https://ci.appveyor.com/api/projects/status/4rcpnepnghwekpgv?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/vinyl-yaml-data)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/vinyl-yaml-data.svg)](https://coveralls.io/r/shinnn/vinyl-yaml-data)
[![Dependency Status](https://img.shields.io/david/shinnn/vinyl-yaml-data.svg?label=deps)](https://david-dm.org/shinnn/vinyl-yaml-data)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/vinyl-yaml-data.svg?label=devDeps)](https://david-dm.org/shinnn/vinyl-yaml-data#info=devDependencies)

Convert [vinyl](https://github.com/gulpjs/vinyl) objects of [YAML](http://www.yaml.org/) files into plane objects

```javascript
const gulp = require('gulp');
const {Transform} = require('stream');
const vinylYamlData = require('vinyl-yaml-data');

// data/person.yaml: 'name: Bob'

gulp.task('default', () => {
  return gukl.src('data/*.yaml')
    .pipe(vinylYamlData());
    .pipe(new Transform({
      objectMode: true,
      transform(obj, enc, cb) {
        obj; //=> {person: {name: 'Bob'}}
        cb();
      })
    );
});
```

**The latest version requires Node v4+. If you're using Node v0.x, use [v1.1.0](https://github.com/shinnn/vinyl-yaml-data/tree/v1.1.0).**

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install vinyl-yaml-data
```

## API

```javascript
const vinylYamlData = require('vinyl-yaml-data');
```

### vinylYamlData([*options*])

[file.path]: https://github.com/gulpjs/vinyl#optionspath

*options*: `Object`  
Return: `Object` ([stream.Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform_1))

It returns a transform stream. The stream parses [`file.contents`](https://github.com/gulpjs/vinyl#optionscontents) as YAML, and read back an object which contains the parsed data.

The parsed object will be assigned to the specific object path based on the [`file.path`][file.path]. For example,

| [file.path]            | object path          |
| :--------------------- | :------------------- |
| `foo.yaml`             | `foo`                |
| `foo/bar.yaml`         | `foo.bar`            |
| `foo/bar/baz.qux.yaml` | `foo.bar['baz.qux']` |
| `../foo/bar.txt`       | `['..'].foo.bar`     |
| `foo/../bar/baz.txt`   | `bar.baz`            |

Path components included in [`file.base`](https://github.com/gulpjs/vinyl#optionsbase) will be omitted from the object path.

```javascript
const File = require('vinyl');
const vinylYamlData = require('vinyl-yaml-data');

const vinylYamlStream = vinylYamlData();

vinylYamlStream.on('data', data => {
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
const File = require('vinyl');
const vinylYamlData = require('vinyl-yaml-data');

vinylYamlData()
.on('data', data => {
  data; //=> {'foo.yml': {a: 'b'}}
})
.end(new File({
  path: 'foo.yml',
  contents: new Buffer('a: b')
}));
```

## Example

### Simulate [`_data`](https://jekyllrb.com/docs/datafiles/) directory of [Jekyll](https://jekyllrb.com/)

[deep-extend-stream](https://github.com/shinnn/deep-extend-stream) helps you to merge multiple YAML data into a single object in a stream.

```javascript
const gulp = require('gulp');
const jade = require('gulp-jade');

const vinylYamlData = require('vinyl-yaml-data');
const deepExtend = require('deep-extend-stream');

const locals;

gulp.task('data', () => {
  locals = {};

  return gulp.src('data/**/*.y{,a}ml')
    .pipe(vinylYamlData())
    .pipe(deepExtend(locals));
});

gulp.task('views', ['data'], () => {
  return gulp.src('views/**/*.jade')
    .pipe(jade({locals}))
    .pipe(gulp.dest('build'));
});

gulp.task('default', ['views']);
```

## License

Copyright (c) 2014 - 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

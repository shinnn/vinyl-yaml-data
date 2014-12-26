'use strict';

var path = require('path');

var bufferStream = require('simple-bufferstream');
var File = require('vinyl');
var test = require('tape');
var vinylYamlData = require('./');
var yaml = require('js-yaml');

test('vinylYamlData()', function(t) {
  t.plan(12);

  t.equal(vinylYamlData.name, 'vinylYamlData', 'should have a function name.');

  vinylYamlData({schema: yaml.FAILSAFE_SCHEMA})
  .on('data', function(data) {
    t.deepEqual(data, {foo: ['true', '1', '2']}, 'should parse YAML buffer.');
  })
  .end(new File({
    path: path.resolve('foo.yaml'),
    contents: new Buffer('[true, 1, 2]')
  }));

  vinylYamlData()
  .on('data', function(data) {
    t.deepEqual(
      data,
      {bar: {a: 0, b: true}},
      'should add property to the object path based on `base` and `path` properties.'
    );
  })
  .end(new File({
    base: 'foo',
    path: 'foo/bar.yaml',
    contents: new Buffer('a: 0\nb: true')
  }));

  vinylYamlData()
  .on('data', function(data) {
    t.deepEqual(data, {foo: []}, 'should parse a stream of YAML data.');
  })
  .end(new File({
    path: 'foo.yaml',
    contents: bufferStream(new Buffer('[]'))
  }));

  vinylYamlData()
  .on('data', function(data) {
    t.deepEqual(
      data, {foo: {'01': {baz: undefined}}},
      'should set `undefined` property when the file content is an empty buffer.'
    );
  })
  .end(new File({
    path: path.resolve('foo/bar/../01/baz.yaml'),
    contents: new Buffer('')
  }));

  vinylYamlData()
  .on('data', function(data) {
    t.deepEqual(
      data, {'..': {'0': undefined}},
      'should set `undefined` property when the stream emits only an empty buffer.'
    );
  })
  .end(new File({
    path: path.resolve('../0.yaml'),
    contents: bufferStream(new Buffer(''))
  }));

  vinylYamlData()
  .on('data', t.fail.bind(t, 'should not emit any data when the file has no contents.'))
  .end(new File({path: path.resolve('foo.yaml')}));

  vinylYamlData({ext: true})
  .on('data', function(data) {
    t.deepEqual(
      data, {'..': {'foo.yaml': {a: [true, {b: 'cd'}]}}},
      'should not remove file extenston form the property name when `ext` option is enabled.'
    );
  })
  .end(new File({
    base: 'foo',
    path: 'foo.yaml',
    contents: new Buffer('a: [true, {b: cd}]')
  }));

  vinylYamlData()
  .on('error', function(err) {
    t.equal(
      err.name,
      'YAMLException',
      'should emit an error when it fails to parse YAML buffer.'
    );
    t.equal(
      err.mark.name,
      path.resolve('foo.yaml'),
      'should include source file name in the error message.'
    );
  })
  .end(new File({
    path: 'foo.yaml',
    contents: new Buffer('\n[\n')
  }));

  vinylYamlData()
  .on('error', function(err) {
    t.equal(
      err.name,
      'YAMLException',
      'should emit an error when it fails to parse the stream of YAML data.'
    );
    t.equal(
      err.mark.name,
      path.resolve('foo/bar/baz.yaml'),
      'should reflect `cwd` property of the file to the error message.'
    );
  })
  .end(new File({
    cwd: 'foo',
    base: 'bar',
    path: path.resolve('bar/baz.yaml'),
    contents: bufferStream(new Buffer('"--'))
  }));

  vinylYamlData()
  .on('error', function(err) {
    t.equal(
      err.name,
      'TypeError',
      'should emit a type error when the file doesn\'t have path.'
    );
  })
  .end(new File({
    base: 'foo',
    contents: new Buffer('foo: Hello')
  }));
});

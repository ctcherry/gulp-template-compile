'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var tpl = require('./index');

it('should precompile lodash templates', function(cb) {

	var stream = tpl();

	stream.on('data', function (file) {
		assert.equal(file.path, __dirname + path.join('/fixture','fixture.js'));
		assert.equal(file.relative, path.join('fixture','fixture.js'));
		assert(/["JST"]/.test(file.contents.toString()));
		assert(/["fixture\/fixture.html"]/.test(file.contents.toString()));
		cb();
	});

	stream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/fixture/fixture.html',
		contents: new Buffer('<h1><%= test %></h1>')
	}));
});

it('should support supplying custom name in a callback', function (cb) {

	var stream = tpl(
	{
		name: function (file) {
			return 'custom';
		}
	});

	stream.on('data', function (file) {
		assert(/\]\["custom"]/.test(file.contents.toString()));
		cb();
	});

	stream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/fixture/fixture.html',
		contents: new Buffer('<h1><%= test %></h1>')
	}));
});

it('should support supplying a custom namespace', function (cb) {

	var stream = tpl(
	{
		namespace: 'customNS',
	});

	stream.on('data', function (file) {
		assert(/window\["customNS"\]/.test(file.contents.toString()));
		cb();
	});

	stream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/fixture/fixture.html',
		contents: new Buffer('<h1><%= test %></h1>')
	}));
});

it('should support supplying a custom nested namespace', function (cb) {

	var stream = tpl(
	{
		namespace: 'customNS.childNS.grandchildNS',
	});

	stream.on('data', function (file) {
		assert(/window\["customNS"\]\["childNS"\]\["grandchildNS"\]/.test(file.contents.toString()));
		cb();
	});

	stream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/fixture/fixture.html',
		contents: new Buffer('<h1><%= test %></h1>')
	}));
});

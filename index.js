'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var tpl = require('lodash.template');
var PluginError = gutil.PluginError;
var os = require('os');
var PLUGIN_NAME = 'gulp-template-compile';

module.exports = function (options) {
	options = options || {};

	function compiler (file) {
		var name = typeof options.name === 'function' && options.name(file) || file.relative;
		var namespace = options.namespace || 'JST';
		var namespaceList = namespace.split('.');
		var namespaceLevels = [];
		var namespaceDecls = [];

		for(var n = 1; n <= namespaceList.length; n++) {
			var tree = namespaceList.slice(0,n);
			var buffer = tree.map(function(elm) {
				return '["'+elm+'"]';
			}).join('');
			namespaceLevels.push(buffer);
			namespaceDecls.push('window'+buffer+' = window'+buffer+' || {};'+os.EOL);
		}
		var finalNamespace = namespaceLevels[namespaceLevels.length-1];

		var NSwrapper = '(function() {'+os.EOL;
		NSwrapper += namespaceDecls.join('');
		NSwrapper += 'window'+finalNamespace+'["'+ name.replace(/\\/g, '/') +'"] = ';

		var template = tpl(file.contents.toString(), false, options.templateSettings).source;

		return NSwrapper + template + '})();';
	}

	var stream = through.obj(function (file, enc, callback) {

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
			return callback();
		}

		var filePath = file.path;

		try {
			var compiled = compiler(file);

			file.contents = new Buffer(compiled);
			file.path = gutil.replaceExtension(file.path, '.js');
		} catch (err) {
			this.emit('error', new PluginError(PLUGIN_NAME, err, {fileName: filePath}));
			return callback();
		}

		this.push(file);
		callback();
	});

	return stream;
};

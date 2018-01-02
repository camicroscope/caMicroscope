/*!
 * sjs
 * Copyright(c) 2011 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');
var assert = require('assert');
var AsyncParser = require('./lib/async/Parser');
var tools = require('./lib/tools');


function parse(source, options){
	var result;
	var parser;

	result = '';
	parser = new AsyncParser(function(data) {
		result += data;
	}, options);
	parser.end(source);

	return result;
}//parse


function register(options){
	require.extensions['.sjs'] = function(module, filename) {
	    var content = parse(fs.readFileSync(filename, 'utf-8'), options);
		 module._compile(content, filename);
	}
}//parse




//exports
exports.parse = parse;
exports.register = register;



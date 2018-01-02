/*!
 * php for js
 * Copyright(c) 2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var fs = require('fs');
var assert = require('assert');
var Parser = require('./lib/php/Parser');
var tools = require('./lib/tools');


function parse(source, options){
	var result;
	var parser;

	result = '';
	parser = new Parser(function(data) {
		result += data;
	}, options);
	parser.end(source);

	return result;
}//parse




function compile(template, options) {
	var fn = new Function('write', 'end', 'locals', parse(template, options));
	return function(){
		var buffer = '';
		function echo(data){
			buffer += data;
		}
		fn.call(options.scope, echo, echo, options.locals);
		return buffer;
	};
}//compile


var cache = {};
function render(template, options) {
	var options = tools.extend({}, options);
	var fn = options.filename 
	? (cache[options.filename] || (cache[options.filename] = compile(template, options)))
	: compile(template, options)
	;
	return fn.call(options.scope, options.locals || {});
}//render



function registerExtension(options){
	require.extensions['.php'] = function(module, filename) {
	    var content = parse(fs.readFileSync(filename, 'utf-8'), options);
		 module._compile(content, filename);
	}
}//parse




//exports
exports.parse = parse;
exports.compile = compile;
exports.render = render;
exports.registerExtension = registerExtension;


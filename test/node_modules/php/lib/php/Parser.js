/*!
 * NodePhpParser
 * Copyright(c) 2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */


var util = require("util");
var tools = require("../tools");
var assert = require("assert");



var expressions = {
	"default":	null
	, "whitespace":	/\s+/
	, "semicolon":	/(\s*)(;)/		

	, "phpOpen":  /\<\%|\<\?php|\<\?\=|\<\?/
	, "phpClose": /\%\>|\?\>/

	, "phpBeginBlock":	"{"
	, "phpEndBlock":	"}"
	
	, "phpBeginGroup":	"("
	, "phpEndGroup":	")"
	

	, "tagComment":	/<!--([\s\S]*?)-->\s*/
};





var base = require("2kenizer");
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.unexpected = function(token){
		throw new SyntaxError('php - unexpected token ' + token.category + ' line ' + this.line + '');
	}

	target.prototype.onToken = function(token, buffer) {
		this.line += tools.countLines(buffer);

		this.options.trace && console.log(this.line, token.category, token[0]);
		this.context.content += buffer;
		this.context.echo(buffer, this);

		var firstTime = true;
		do{
			token.redo = false;
			var previousContext = this.context;
			this.context = this.context.onToken(token);
			this.categories = this.context.categories;
			if(firstTime && this.context === previousContext) {
				firstTime = false;
				this.context.content += token[0];
			}
		} while(token.redo);

		if(this.atEnd && this.context !== this){
			throw new Error("parse error");
		}

		this.line += tools.countLines(token[0]);
	};//onToken


	return target;

})(function(echo, options){
	var RootContext = require('./RootContext');

	this.options = tools.extend({
		debug: false
		, trace: false
	}, options);

	base.call(this, this.onToken, expressions, this.options);

	this.echo = echo;
	this.parser = this;

	this.line = 1;

	this.context = new RootContext(this, null);
	this.categories = this.context.categories;
});


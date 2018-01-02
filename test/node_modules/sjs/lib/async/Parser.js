/*!
 * JsAsyncParser
 * Copyright(c) 2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */


var util = require("util");
var tools = require("../tools");
var assert = require("assert");
var JsContext = require('./JsContext');
var newline = "\n";



var expressions = {
	"default":	null
	, "whitespace":	/\s+/
	, "semicolon":	/(\s*)(;)/		

	, "jsIdentifier":	/^(\s*)([$_A-Za-z][$_A-Za-z0-9]*)/
	, "jsMember":		/^(\.)([$_A-Za-z][$_A-Za-z0-9]*)/

	, "jsBeginBlock":	"{"
	, "jsEndBlock":	"}"
	
	, "jsBeginGroup":	"("
	, "jsEndGroup":	")"
	
	, "jsBeginArray":	"["
	, "jsEndArray":	"]"

	, "jsDoubleQuote":	/"(?:\\.|.)*?[^\\]?"/
	, "jsSingleQuote":	/'(?:\\.|.)*?[^\\]?'/
	, "jsRegExp":		/\/(?:\\.|.)+?[^\\]?\/[gim]*/

	, "jsCommentLine":	/\/\/(.*?)\n/
	, "jsCommentBlock":	/\/\*([\s\S]*?)\*\//
};




var base = require("2kenizer");
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.onToken = function onToken(token, buffer) {
		/*
		if the debug option is on, track the line number
		*/
		if(this.options.debug)	{
			for(var index = buffer.indexOf(newline); ~index && index < token.index; index = buffer.indexOf(newline, index + newline.length))	{
				this.line++;
			}
		}

		this.options.trace && console.log(this.line, token.category, token[0]);
		this.context.content += buffer;
		this.context.echo(buffer);

		var firstTime = true;
		do{
			token.redo = false;
			var previousContext = this.context;
			this.context = this.context.onToken(token);
			this.categories = this.context.categories;
			//this.context.line = this.line;
			if(firstTime && this.context === previousContext) {
				firstTime = false;
				this.context.content += token[0];
			}
		} while(token.redo);

		/*
		if there is no token, we are finished
		*/
		if(!token.category && this.context !== this){
			throw new Error("parse error");
		}

		if(this.options.debug)	{
			for(var index = token[0].indexOf(newline); ~index && index < token[0].length; index = token[0].indexOf(newline, index + newline.length))	{
				this.line++;
			}
		}
		
	};//onToken


	return target;

})(function(echo, options){
	this.options = tools.extend({
		debug: false
		, trace: false
	}, options);

	base.call(this, this.onToken, expressions, this.options);

	this.echo = echo;

	this.line = 1;

	this.context = new JsContext(this, null, null);
	this.categories = this.context.categories;
	this.context.isRoot = true;
});


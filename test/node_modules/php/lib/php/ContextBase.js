var util = require("util");
var assert = require("assert");
var tools = require("../tools");



var base = Object;
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.categories = [];

	target.prototype.onToken = function(token){
		this.parser.unexpected(token);
	};//onToken

	target.prototype.echo = function(data, source){
		this.parent && this.parent.echo(data, source || this);
	};//echo

	target.prototype.end = function(endToken){
		this.echo(this.suffix, {});
		endToken && (this.content += endToken[0]);
		this.parent && (this.parent.content += this.content);
		return this.parent;
	};//end

	return target;

})(function(parent, beginToken){

	base.call(this);

	this.parent = parent;
	this.beginToken = beginToken;
	
	this.parser = this.parser || this.parent.parser;
	this.suffix = this.suffix || '';
	this.content = this.content || '';
	
	this.beginToken && (this.content += this.beginToken[0]);
});



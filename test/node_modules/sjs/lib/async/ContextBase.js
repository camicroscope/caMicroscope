var util = require("util");
var assert = require("assert");



var base = Object;
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.categories = [];

	target.prototype.onToken = function(token){
		this.unexpected(token);
	};//onToken

	target.prototype.echo = function(data){
		this.parent && this.parent.echo(data);
	};//echo

	target.prototype.end = function(endToken){
		this.echo(this.suffix);
		endToken && (this.content += endToken[0]);
		!this.isRoot && (this.parent.content += this.content);
		return this.parent;
	};//end


	target.prototype.unexpected = function(token){
		throw new SyntaxError('sjs - unexpected token ' + token.category);
	};//unexpected

	return target;

})(function(parent, beginToken){

	base.call(this);

	this.parent = parent;
	this.suffix = '';

	this.content = '';
	beginToken && (this.content += beginToken[0]);
	
});



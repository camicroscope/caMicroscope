var util = require("util");
var assert = require("assert");



var base = require('./ContextBase');
module.exports = (function(target){

	util.inherits(target, base);
	
	target.prototype.echo = function(data, source){
		this.parent.echo(data, this);
	}

	target.prototype.categories = [
		"phpClose"
	];

	target.prototype.onToken = function(token){
		switch(token.category){
			case 'phpClose':
			return this.end(token);
		}

		return base.prototype.onToken.apply(this, arguments);
	};//onToken


	return target;

})(function(parent, beginToken){
	base.call(this, parent, beginToken);

});




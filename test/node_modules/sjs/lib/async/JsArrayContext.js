var util = require("util");
var assert = require("assert");



var base = require('./JsContext');
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.onToken = function(token){
		switch(token.category){
			case 'jsEndArray':
			this.suffix += ']';
			return this.end(token);

			default:
			return base.prototype.onToken.apply(this, arguments);
		}

	};//onToken

	return target;

})(function(parent, beginToken){
	assert.equal('jsBeginArray', beginToken.category);

	base.call(this, parent, beginToken);

	this.echo('[');
});



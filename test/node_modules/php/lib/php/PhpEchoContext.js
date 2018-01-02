var util = require("util");
var assert = require("assert");



var base = require('./PhpContext');
module.exports = (function(target){

	util.inherits(target, base);
	

	return target;

})(function(parent, beginToken){
	base.call(this, parent, beginToken);

	this.echo('write(');
	this.suffix = ');';

});




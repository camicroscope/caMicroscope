var util = require("util");

var ErrorStackEntry = require("./ErrorStackEntry");
var newline = '\n';

var base = Array;
module.exports = (function(target){

	util.inherits(target, base);

	target.parse = function(value){
		var lines = value.split(newline);
		
		var result = new target;
		lines.forEach(function(line){
			var entry = ErrorStackEntry.parse(line) || line;
			result.push(entry);
		});
		return result;
	};//parse

	target.prototype.toString = function(){
		return this.map(function(entry){return entry.toString()}).join(newline)
	};//toString

	return target;

})(function(){

	base.call(this);
});



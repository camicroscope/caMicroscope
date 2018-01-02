var util = require("util");

var base = Object;
module.exports = (function(target){

	util.inherits(target, base);

	target.parse = function(value){
		var match = null;

		match = /^    at (.+) \((.+)\:(\d+)\:(\d+)\)$/.exec(value);
		if(match) {
			var result = new target();
			result.target = match[1];
			result.filename = match[2];
			result.line = parseInt(match[3]);
			result.column = parseInt(match[4]);
			return result;
		}

		match = /^    at (.+)\:(\d+)\:(\d+)$/.exec(value);
		if(match) {
			var result = new target();
			result.filename = match[1];
			result.line = parseInt(match[2]);
			result.column = parseInt(match[3]);
			return result;
		}

		return null;
	};//parse


	target.prototype.toString = function(){
		if(this.source){
			return '    at ' + this.target + ' (' + this.filename +':' + this.line + ':' + this.column + ')'		
		}
		else{
			return '    at ' + this.filename +':' + this.line + ':' + this.column + ''		
		}
	};//toString

	return target;

})(function(){

	base.call(this);

	this.source = null;
	this.filename = '';
	this.line = 0;
	this.column = 0;

});



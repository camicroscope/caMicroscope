var util = require("util");
var tools = require("../tools");
var assert = require("assert");



var base = require('./ContextBase');
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.echo = function(data, source){
		if(source === this.parser){
			if(this.parser.atEnd){
				this.parent.echo('end(' + tools.stringifyWithLines(data) + ');', this);
			}
			else{
				this.parent.echo('write(' + tools.stringifyWithLines(data) + ');', this);
			}
		}
		else{
			this.parent.echo(data, this);
		}
	}

	target.prototype.categories = [
		"tagComment"
		, "phpOpen"
	];

	target.prototype.onToken = function(token){
		var PhpContext = require('./PhpContext');
		var PhpEchoContext = require('./PhpEchoContext');

		switch(token.category){
			case 'tagComment':
			this.echo('write(' + tools.stringifyWithLines(token[0]) + ');', this);
			return this;

			case 'phpOpen':
			if(token[0] == '<?='){
				return new PhpEchoContext(this, token);
			}
			else{
				return new PhpContext(this, token);
			}

			case null:
			return this.end(token);
		}

		return base.prototype.onToken.apply(this, arguments);
	};//onToken


	return target;

})(function(parent, beginToken){
	base.call(this, parent, beginToken);
});




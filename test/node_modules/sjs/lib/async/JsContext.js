var util = require("util");
var assert = require("assert");



var base = require('./ContextBase');
module.exports = (function(target){

	util.inherits(target, base);

	target.prototype.echo = function(data){
		if(this.isAsync) base.prototype.echo.call(this, data);
		else this.buffer += data;
	};//echo

	target.prototype.end = function(endToken){
		var result = base.prototype.end.apply(this, arguments);

		if(this.isAsync) base.prototype.echo.call(this, this.buffer);
		else base.prototype.echo.call(this, this.content);

		return result;
	};//end



	target.prototype.categories = base.prototype.categories.concat([
		'semicolon'
		, 'jsIdentifier'
		, 'jsCommentLine'
		, 'jsCommentBlock'
		, 'jsDoubleQuote'
		, 'jsSingleQuote'
		, 'jsRegExp'
		, 'jsBeginBlock'
		, 'jsBeginGroup'
		, 'jsBeginArray'
		, 'jsEndBlock'
		, 'jsEndGroup'
		, 'jsEndArray'
	]);


	target.prototype.onToken = function(token){
		
		var JsBlockContext = require('./JsBlockContext');
		var JsGroupContext = require('./JsGroupContext');
		var JsArrayContext = require('./JsArrayContext');

		var JsAsyncContext = require('./JsAsyncContext');
		var JsWhileContext = require('./JsWhileContext');
		var JsIfContext = require('./JsIfContext');
		var JsForContext = require('./JsForContext');
		var JsDoContext = require('./JsDoContext');
		var JsSwitchContext = require('./JsSwitchContext');


		switch(token.category){
			case 'jsCommentLine':
			this.echo('/*' + token[1] + '*/\n');
			return this;

			case 'jsCommentBlock':
			case 'whitespace':
			case 'semicolon':
			case 'jsDoubleQuote':
			case 'jsSingleQuote':
			case 'jsRegExp':
			this.echo(token[0]);
			return this;
		
			case 'jsBeginBlock':
			return new JsBlockContext(this, token);

			case 'jsBeginGroup':
			return new JsGroupContext(this, token);

			case 'jsBeginArray':
			return new JsArrayContext(this, token);

			case 'jsIdentifier':
			this.echo(token[1]);
			switch(token[2]){
				case 'async':
				return new JsAsyncContext(this, token);

				case 'while':
				return new JsWhileContext(this, token);

				case 'if':
				return new JsIfContext(this, token);

				case 'for':
				return new JsForContext(this, token);

				case 'do':
				return new JsDoContext(this, token);
				
				case 'switch':
				return new JsSwitchContext(this, token);

				default:
				this.echo(token[2]);
				return this;
			}

			case null:
			return this.end(token);

			default:
			return base.prototype.onToken.apply(this, arguments);
		}

	};//onToken

	target.prototype.setAsync = function(){
		base.prototype.echo.call(this, this.buffer)
		this.buffer = '';
		this.isAsync = true;

		!this.isRoot && this.parent.setAsync();
	};//setAsync


	return target;

})(function(parent, beginToken){
	this.buffer = '';
	this.isAsync = false;

	base.call(this, parent, beginToken);
});




var util = require("util");
var assert = require("assert");



var base = require('./JsContext');
module.exports = (function(target){
	util.inherits(target, base);

	target.prototype.index = -1;
	target.prototype.next = function(){
		this.index++;
		this.onToken = this.onTokenSteps[this.index];
		this.categories = this.categoriesSteps[this.index];
	};

	target.prototype.categoriesSteps = [
		base.prototype.categories.concat([
		])
		, base.prototype.categories.concat([
		])

		, base.prototype.categories.concat([
		])
		, base.prototype.categories.concat([
		])

		, [
			"jsIdentifier"
			, "default"
		]

		, base.prototype.categories.concat([
		])
		, base.prototype.categories.concat([
		])
	
		, [
			"default"
		]
	];//categoriesSteps

	target.prototype.onTokenSteps = [
		function(token){
			this.bufferKey = 'condition';
			switch(token.category){
				case 'whitespace':
				this.echo(token[0]);
				return this;

				case 'jsBeginGroup':
				this.next();
				return this;
			}
			this.unexpected(token);
		}
		, function(token){
			switch(token.category){
				case 'jsEndGroup':
				this.next();
				return this;
			}
			return base.prototype.onToken.apply(this, arguments);
		}
		, function(token){
			this.bufferKey = 'if';
			switch(token.category){
				case 'whitespace':
				this.echo(token[0]);
				return this;

				case 'jsBeginBlock':
				this.next();
				return this;
			}
			this.unexpected(token);
		}
		, function(token){
			switch(token.category){
				case 'jsEndBlock':
				this.next();
				this.echo('__continue();');
				return this;
			}
			return base.prototype.onToken.apply(this, arguments);
		}

		, function(token){
			switch(token.category){
				case 'jsIdentifier':
				switch(token[2]){
					case 'default':
					return this.end(token);

					case 'else':
					this.echo(token[1]);
					this.next();
					return this;
				}

			}

			token.redo = true;
			return this.end(null);
		}

		, function(token){
			this.bufferKey = 'else';
			switch(token.category){
				case 'whitespace':
				this.echo(token[0]);
				return this;

				case 'jsBeginBlock':
				this.next();
				return this;
			}
			this.unexpected(token);
		}
		, function(token){
			switch(token.category){
				case 'jsEndBlock':
				this.next();
				this.echo('__continue();');
				return this;
			}
			return base.prototype.onToken.apply(this, arguments);
		}

		, function(token){
			switch(token.category){
				case 'default':
				return this.end(token);
			}

			token.redo = true;
			return this.end(null);
		}

	];


	target.prototype.echo = function(buffer){
		if(this.bufferKey){
			if(this.bufferKey in this.buffers) this.buffers[this.bufferKey] += buffer;
			else this.buffers[this.bufferKey] = buffer;
		}
	};//echo

	target.prototype.end = function(){
		var result = base.prototype.end.apply(this, arguments);

		var prefix = '';
		prefix += '(function(__continue){';
		prefix += 'if(' + this.buffers['condition'] + '){';
		prefix += this.buffers['if'] + '';
		prefix += '}';
		prefix += 'else{';
		prefix += this.buffers['else'] || '__continue();' + '';
		prefix += '}';
		prefix += '})(function(){';

		var suffix = '';
		suffix += '});';

		this.parent.echo(prefix);
		this.parent.suffix += suffix;

		return result;
	};//end

	return target;
})(function(parent, beginToken){
	assert.equal('if', beginToken[2]);

	base.call(this, parent, beginToken);

	this.buffers = [];
	this.bufferKey = '';

	this.isAsync = parent.isAsync;

	this.next();
});




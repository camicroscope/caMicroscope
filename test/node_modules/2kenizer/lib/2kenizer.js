/*!
 * 2kenizer
 * Copyright(c) 2011-2012 Elmer Bulthuis <elmerbulthuis@gmail.com>
 * MIT Licensed
 */

var util = require("util");
var assert = require("assert");
var stream = require('stream');
var tools = require("./tools");





module.exports = (function(target){
	util.inherits(target, stream.Stream);

	target.prototype.writable = true;

	target.prototype.write = function(data){
		data = tools.toString(data);
		while(data.length > 0)	{
			var chunk = data.substring(0, this.options.bufferLimit);
			data = data.substring(chunk.length);
			this.buffer += chunk;
			if(this.buffer.length > this.options.bufferLimit)	{
				this.flush(this.options.bufferSize);
			}
		}
	};//write

	target.prototype.end = function(){
		this.write.apply(this, arguments);
		this.flush(0);
		this.atEnd = true;
		var endToken = tools.extend([""], {
			category: null
			, index: this.buffer.length
		});
	    this.tokenCallback.call(this, endToken, this.buffer);
	    this.buffer = '';
	    this.tokenSet = {};
	};//end


	/**
	process data in the buffer.
	*/
    target.prototype.flush = function(bufferSize) {
		var token;
        while(this.buffer.length > bufferSize && (token = this.nextToken())) {
        	if(this.tokenCallback.call(this, token, this.buffer.substring(0, token.index)) === false){
        		this.flush(bufferSize);
        		return;
        	}
			/*
			the offset to which we are going to flush.
			*/
        	var offset = token.index + token[0].length;
			
			/*
			trim the buffer.
			*/
			this.buffer = this.buffer.substr(offset);

			this.syncCache(offset);
		}
    };//flush
	
    target.prototype.syncCache = function(offset) {
		var token;

		/*
		sync the cache with the buffer.
		*/
		for(var category in this.tokenSet)	{
            token = this.tokenSet[category];
			/*
			when the index of the cached match is before the
			offset, it is trimmed off! so remove it from the
			cache
			*/
            if(token.index < offset) delete this.tokenSet[category];
            /*
            if the cached match is not before the offset, it is
            still in the buffer but if moved a litte to the
            beginning. So adjust the index.
            */
            else token.index -= offset;
		}
	}//syncCache

	/**
	finds the next token in the buffer.
	*/
    target.prototype.nextToken = function() {
		var foundToken = null;
		this.categories.forEach(function(category) {
            var expression = this.expressionSet[category];
			/*
			look for a cached token
			*/
           	var token = this.tokenSet[category];
			/*
			if there is no cached token
			*/
            if(!token)	{
            	if(expression)	{
                	if(expression.exec){
		        		/*
	            		when there is an exec method on the expression, assume it is
	            		a regular expression and execute it!
	            		*/
		            	var match = expression.exec(this.buffer);
		            	if(match)	{
		            		token = tools.extend(match, {
		            			category:	category
		            		});
		            	}
	            	}
	            	else{
		            	/*
		            	maybe it's a string!
		            	*/
		            	var index = this.buffer.indexOf(expression);
		            	/*
		            	if we found the string (remember, ~-1 == 0) then
		            	create a token object
		            	*/
		            	if(~index)	{
		            		token = tools.extend([expression], {
		            			index:	index
		            			, category:	category
		            		});
			           	}
	            	}
	            	/*
	            	if there is a match, cache it!
	            	*/
	            	if(token) this.tokenSet[category] = token;
	            }
	            else	{
	            	/*
	            	when there is no exrpression, there is always a match!
	            	*/
	            	token = tools.extend([""], {
            			index:	0
            			, category:	category
            		});
	            }
            }
            
			/*
			if there is no token or, if there is a token and it is before
			the current token.
			*/
            if (token && (!foundToken || token.index < foundToken.index)) {
                foundToken = token;
            }

            if(foundToken && foundToken.index <= 0) return false;
		}, this);
		/*
		if there is no token found, this will return null
		*/
        return foundToken;
    };//nextToken



	return target;

})(function(tokenCallback, expressionSet, options){
	this.tokenCallback = tokenCallback;
	this.expressionSet = expressionSet;
	this.options = tools.extend({bufferSize: 1024, bufferLimit: 4096}, options);

	this.atEnd = false;
    this.buffer = '';

	/**
	matches in the current buffer. Serves as a cache.
	*/
	this.tokenSet = {};

	/**
	What categories should we look for?
	*/
	this.categories = [];
	for(var category in expressionSet)	{
		this.categories.push(category);
	}

});




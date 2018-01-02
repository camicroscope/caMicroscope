# SJS (Synchronous JavaScript)
Asynchronous JavaScript for synchronous people


## Installation
	
	npm install sjs


## Lambda functions

sjs introduces lambda expressions to make your code a little prettier. You may use a lambda function without any arguments.

	() => 10;

will expand to

	function(){
		return 10;
	};

There are two ways of writing lambda functions with arguments:

	(arg) => arg * 2;

or

	arg => arg * 2;

will both expand to

	function(arg){
		return arg;
	}

When using more than one argument, there is only one syntax:

	(x, y) => return x * y;

will expand to:

	function(x, y){
		x * y;
	};

you may also use curly braces to have multiple statements in your lambda function body:

	(x, y) => {
		var z = x * y;
		return z;
	}

will expend to:

	function(x, y){
		var z = x * y;
		return z;
	}

last, but not least. Lambda functions do not need to return a value. This is fine:

	(x, y) => console.log(x * y);

and will expand to:

	function(x, y){
		console.log(x * y);
	}

Now that we have lambda functions. Some neat stuff is possible:

	var a = [1, 2, 3];
	a.sort((x,y) => Math.round(Math.random() * 2 - 1));


## Async statement

The async statement makes async programming a lot easier. Just wrap your async code in the async block. Supply name(s) of callback functions that should be called when the async action ends and call those name(s) as if they were a function.

this:

	console.log('begin');
	async(sync){
		window.setTimeout(function(){
			sync();
			console.log('timeout!');
		}, 1000);
	}
	console.log('end');

Will first print 'begin', then wait one second, print 'timeout!', and then print 'end'.


Another example:

	console.log('begin');
	async(sync1, sync2){
		window.setTimeout(function(){
			console.log('first timeout');
			sync1();
		}, 1000);

		window.setTimeout(function(){
			console.log('second timeout');
			sync2();
		}, 2000);
	}
	console.log('end');

this first print 'begin', then after one second it will print 'first tieout', and two seconds after 'begin' it will print 'second timeout'. After it has printed 'first timeout' and 'second timeout' it will print 'end'.


Another example:

	console.log('begin');
	for(var c = 0; c < 10; c++)	{
		async(sync){
			window.setTimeout(function(){
				console.log(c);
				sync();
			}, 1000);
		}
	}
	console.log('end');

this will first print 'begig', then count from 0 to 9, printing a number every second. Finally it will print 'end'.









const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;
// 4 items: 0 - info, 1 - warning, 2 - error, 3 - multiple messages
let mList;

describe('Message Queue Component',function(){
	
	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function(done){
	 JSDOM.fromURL(
	    `${global.origin}${global.testFolder}/ui/messagequeue-test-cases.html`, 
	    {
	      runScripts: "dangerously",
	      resources: "usable"
	    }
	  ).then(jsdom => {
	  	dom = jsdom;
	  	// check the loading flag
		let checkLoaded = setInterval(function(){
			if(jsdom.window.document.getElementById('isLoad').checked){
				clearInterval(checkLoaded);
				mList = jsdom.window.document.querySelectorAll('.bullet-container');
				done();
			}
		},100);
	  }).catch(function(error) {
	  	// error
		done(error);
	  });
	
	});

	// 
	describe('constructor:options', function () {

		// options.position: top-left(default)
		it('position:top-left(default)', function () {
			// position
			assert.equal(mList[0].style.top,'0px');
			assert.equal(mList[0].style.left,'0px');
			
			
		});

		// options.position:  top-right
		it('position:top-right', function () {
			// position
			assert.equal(mList[1].style.top,'0px');
			assert.equal(mList[1].style.right,'0px');
		});

		// options.position: bottom-left
		it('position:bottom-left', function () {
			// position
			assert.equal(mList[2].style.bottom, '0px');
			assert.equal(mList[2].style.left, '0px');

		});

		// options.position: bottom-right
		it('position:bottom-right', function () {

			// position
			assert.equal(mList[3].style.bottom, '0px');
			assert.equal(mList[3].style.right, '0px');
		});
	});


	describe('add(text, time)', function () {
		it('text and css',function(){
			// css class
			assert(mList[0].querySelector('.bullet').classList.contains('info'));
			
			// text
			assert.equal(mList[0].querySelector('.bullet').textContent,'info message');
		});
	});

	describe('addWarning(text, time)', function () {
		it('text and css',function(){
			// css class
			assert(mList[1].querySelector('.bullet').classList.contains('warning'));
			
			// text
			assert.equal(mList[1].querySelector('.bullet').textContent,'warning message');
	
		});
	});


	describe('addError(text, time)', function () {
		it('text and css',function(){
			
			// css class
			assert(mList[2].querySelector('.bullet').classList.contains('error'));
			
			// text
			assert.equal(mList[2].querySelector('.bullet').textContent,'error message');
		});
	});


	describe('multiple messages', function () {
		let messages;
		before(function(){
			messages = mList[3].querySelectorAll('.bullet');
		});

		it('matching the number of messages',function(){
			assert.equal(messages.length, 3);
		});
		it('each text and css',function(){
			assert(messages[0].classList.contains('info'));
			assert.equal(messages[0].textContent,'message1');
			
			assert(messages[1].classList.contains('error'));
			assert.equal(messages[1].textContent,'message2');
			
			assert(messages[2].classList.contains('warning'));
			assert.equal(messages[2].textContent,'message3');
		});
	});





});


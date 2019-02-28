//sidemenu-test-cases.js
const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;

describe('Side Menu Component',function(){
	
	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function(done){

		JSDOM.fromURL(
			`${global.origin}${global.testFolder}/ui/sidemenu-test-cases.html`, 
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
					done();
				}
			},100);
		}).catch(function(error) {
			// error
			done(error);
		});

	});
	/* --  prepare test END -- */
	

	/* -- test cases START -- */
	describe('constructor:options[default]', function () {

		// menu is close
		it('menu close', function () {
			const menu = dom.window.document.getElementById('menu1');
			assert.equal(menu.style.width, '0px');
		});
	});

	describe('constructor:options(isOpen:true,width:500px)', function () {

		// menu is open and 
		it('menu open and width is 500px', function () {
			const menu = dom.window.document.getElementById('menu2');
			assert.equal(menu.style.width, '500px');
		});

	});


	describe('addContext(String/Element)', function () {
		let contents;
		before(function(){
			contents = dom.window.document.querySelector('#menu1 .side_content').children;
		});
		
		it(`the number of content's children matching`, function () {
			assert.equal(contents.length, 4);
		});

		it(`children's textContent are correct`, function () {
			[...contents].forEach( function(element, index) {
				//console.log(element);
				assert.equal(element.textContent, index+1);
			});
			
		});

	});

	describe('clearContext()', function(){
		// clear context
		it('all contents was clear', function () {
			const contents = dom.window.document.querySelector('#menu2 .side_content')
			assert.equal(contents.children.length, 0);
			assert.equal(contents.textContent,'');
		});

	});

	describe('callback function', function(){
		it(`open menu1`, function () {
			dom.window.menu1.open();
			const menu = dom.window.document.getElementById('menu1');
			const status = dom.window.document.getElementById('status');
			const name = dom.window.document.getElementById('name');

			assert.equal(menu.style.width, '300px');
			assert.equal(status.checked, true);
			assert.equal(name.textContent, 'menu1');
		});

		it(`close menu2`, function () {
			dom.window.menu2.close();
			const menu = dom.window.document.getElementById('menu2');
			const status = dom.window.document.getElementById('status');
			const name = dom.window.document.getElementById('name');

			assert.equal(menu.style.width, '0px');
			assert.equal(status.checked, false);
			assert.equal(name.textContent, 'menu2');
		});

		it(`simulate a click event on the close button`,function(){
			const closeBtn = dom.window.document.querySelector('#menu1 .close');
			eventFire(closeBtn,'click');

			const menu = dom.window.document.getElementById('menu1');
			const status = dom.window.document.getElementById('status');
			const name = dom.window.document.getElementById('name');

			assert.equal(menu.style.width, '0px');
			assert.equal(status.checked, false);
			assert.equal(name.textContent, 'menu1');
		});
	});

	function eventFire(el, etype){
		if (el.fireEvent) {
			el.fireEvent('on' + etype);
		} else {
			var evObj = dom.window.document.createEvent('Events');
			evObj.initEvent(etype, true, false);
			el.dispatchEvent(evObj);
		}
	}



});
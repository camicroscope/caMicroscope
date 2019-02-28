//toolbar-test-cases.js
const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;

describe('Toolbar Component', function () {

	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function (done) {

		JSDOM.fromURL(
			`${global.origin}${global.testFolder}/ui/toolbar-test-cases.html`,
			{
				runScripts: "dangerously",
				resources: "usable"
			}
		).then(jsdom => {
			dom = jsdom;
			// check the loading flag
			let checkLoaded = setInterval(function () {
				if (jsdom.window.document.getElementById('isLoad').checked) {
					clearInterval(checkLoaded);
					done();
				}
			}, 100);
		}).catch(function (error) {
			// error
			done(error);
		});

	});
	/* --  prepare test END -- */


	/* -- test cases START -- */
	describe('constructor:options[default]', function () {
		// menu is close
		
			it('style', function () {
				//const tools = ;
				let list = dom.window.tools.elt.querySelectorAll('li[class]');
				//console.log(list[0].classList)
				//const menu = dom.window.document.getElementById('menu1');
				assert.equal(list[0].classList.contains('separator'), true);
				assert.equal(list[1].classList.contains('handler'), true);
				list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				assert.equal(list.length, 6);
			});

			it('li > states', function () {
				// status of check/btn				
				dom.window.tools.elt.querySelectorAll(' .tools > li:not([class]) > input[type=checkbox]').forEach(chk=>{
					assert.equal(chk.checked, false);
				});
			});
			
			it('handler events', function() {
				const handler = dom.window.tools.elt.querySelector('.handler > label');
				// click first then all `li`s hide
				eventFire(handler,'click', dom);
				const list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				assert.equal(list[0].style.display,'');
				assert.equal(list[1].style.display,'');
				assert.equal(list[2].style.display,'none');
				assert.equal(list[3].style.display,'none');
				assert.equal(list[4].style.display,'none');
				assert.equal(list[5].style.display,'none');

				// click first then a;; `li`s diplay
				eventFire(handler,'click', dom);	
				dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])').forEach(li=>{
					assert.equal('','');
				});

			});

	});

	describe('click events for each tool', function () {
			it('main tool click events', function () {
				const list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				let label = list[0].querySelector('label');
				eventFire(label,'click', dom);
				assert.equal(list[0].querySelector('input[type=checkbox]').checked,true);
				assert.equal(list[1].querySelector('input[type=checkbox]').checked,false);
				assert.equal(dom.window.changedData.apps, true);
				assert.equal(dom.window.changedData.layers, false);

				label = list[1].querySelector('label');
				eventFire(label,'click', dom);
				assert.equal(list[0].querySelector('input[type=checkbox]').checked,false);
				assert.equal(list[1].querySelector('input[type=checkbox]').checked,true);
				assert.equal(dom.window.changedData.apps, false);
				assert.equal(dom.window.changedData.layers, true);
			});

			it('btn tool click events', function () {
				const list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				let i = list[2].querySelector('i');
				eventFire(i,'click', dom);
				assert.equal(dom.window.changedData.value, 'btn');
			});
			it('check tool click events', function () {
				const list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				let label = list[3].querySelector('label');
				eventFire(label,'click', dom);
				assert.equal(list[3].querySelector('input[type=checkbox]').checked,true);
				assert.equal(dom.window.changedData.checked, true);

				eventFire(label,'click', dom);
				assert.equal(list[3].querySelector('input[type=checkbox]').checked,false);
				assert.equal(dom.window.changedData.checked, false);
			});
			it('multistates tool click events', function () {
				const list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				let label = list[4].querySelector('label');
				eventFire(label,'click', dom);
				assert.equal(dom.window.changedData.state, 1);

				eventFire(label,'click', dom);
				assert.equal(dom.window.changedData.state, 2);

				eventFire(label,'click', dom);
				assert.equal(dom.window.changedData.state, 0);
			});

			it('dropdown tool click events', function () {
				const list = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])');
				let label = list[5].querySelector('label');
				const li = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])')[5].querySelectorAll('ul li');
				const checkList = dom.window.tools.elt.querySelectorAll(' .tools > li:not([class])')[5].querySelectorAll('ul li input[type=radio]');
				
				assert.equal(checkList[0].checked,true);
				assert.equal(checkList[1].checked,false);
				assert.equal(checkList[2].checked,false);

				eventFire(label,'click', dom);
				console.log(dom.window.changedData);
				assert.equal(dom.window.changedData.value, 'dropdown');
				assert.equal(dom.window.changedData.checked, true);
				assert.equal(dom.window.changedData.status, 'a');
			});

	});

});
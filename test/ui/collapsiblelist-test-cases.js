//sidemenu-test-cases.js
const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;

describe('Collapsible List Component',function(){
	
	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function(done){

		JSDOM.fromURL(
			`${global.origin}${global.testFolder}/ui/collapsiblelist-test-cases.html`, 
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
	// test:
	// constructor:options:id,title,icon,isExpand,
	// setList : refeash UI
	// triggerContent(itemId, action = 'close')
	// addContent(itemId, elt)
	// clearContent(itemId)
	// callback
	describe('constructor:options', function () {

		
		before(function(){
			heads = dom.window.document.querySelectorAll('#list .item_head');
			bodies = dom.window.document.querySelectorAll('#list .item_body');			
		});
		// has two heads and contents
		it(`has two heads and contents`,function(){
			assert.equal(heads.length,2);
			assert.equal(bodies.length,2);
		});

		it('item1 is expand', function () {
			// item1 is expand
			assert(bodies[0].classList.contains('expand'));
		});

		it('item2 is collapse', function () {
			// item2 is collapse
			assert(bodies[1].classList.contains('collapse'));
		});

		// item1 has checkbox [checked] and div [textContent = 1111]
		it(`item1 has checkbox [checked] and div [textContent = 1111]`,function(){
			const content = bodies[0].querySelector('.item_content');
			assert.equal(content.children.length, 2);
			assert.equal(content.children[0].checked, true);
			assert.equal(content.children[1].textContent, '1111');
		});

		// item2 has a input and text value is text input
		it('item2 has a input and text value is text input', function () {
			const content = bodies[1].querySelector('.item_content');
			assert.equal(content.children.length, 1);
			assert.equal(content.children[0].type, 'text');
			assert.equal(content.children[0].value, 'text input');
		});
	});

	describe('triggerContent(itemId,action)', function () {
		
		it(`triggerContent('item2','open')`, function () {
			const list = dom.window.list;
			// open item2
			list.triggerContent('item2','open');

			// item2 is expand
			const bodies = dom.window.document.querySelectorAll('#list .item_body');
			assert(bodies[1].classList.contains('expand'));
			// item1 is collapsed
			assert(bodies[0].classList.contains('collapse'));
		});
		// open item1
		it(`triggerContent('item1')`, function () {
			const list = dom.window.list;
			// open item1
			list.triggerContent('item1','open');
			list.triggerContent('item2');
			const bodies = dom.window.document.querySelectorAll('#list .item_body');
			assert(bodies[0].classList.contains('expand'));
			// item2 is collapsed
			assert(bodies[1].classList.contains('collapse'));
		});
	});


	describe('addContent(itemId, elt)', function () {
		let contents;
		before(function(){
			contents = dom.window.document.querySelectorAll('#list .item_content');
		});
		

		// add string 
		it(`add stringified HTMLelement to the content`, function () {
			dom.window.list.addContent('item1','<div>this is a test</div>');
			assert.equal(contents[0].children.length, 3);
			assert.equal(contents[0].children[2].textContent, 'this is a test');
		});

		it(`add HTMLElement to the content`, function () {
			const input = dom.window.document.createElement('input');
			input.type = 'text';
			input.value = 'this is a test'
			dom.window.list.addContent('item1',input);
			assert.equal(contents[0].children.length, 4);
			assert.equal(contents[0].children[3].type, 'text');
			assert.equal(contents[0].children[3].value, 'this is a test');
		});

	});


	describe('clearContext(itemId)', function(){
		let contents;
		before(function(){
			contents = dom.window.document.querySelectorAll('#list .item_content');
		});
		// clear context
		it(`clear item1's content`, function () {
			dom.window.list.clearContent('item1');
			assert.equal(contents[0].children.length, 0);
			assert.equal(contents[0].textContent,'');
		});

	});

	describe('callback function', function(){

		it(`open item2`, function () {
			dom.window.list.triggerContent('item2','open');
			const status = dom.window.listStatus;
			assert.equal(status[0].id, 'item1');
			assert.equal(status[0].isExpand, false);
			assert.equal(status[1].id, 'item2');
			assert.equal(status[1].isExpand, true);
			
		});

		it(`open item1`, function () {
			dom.window.list.triggerContent('item1','open');
			const status = dom.window.listStatus;
			assert.equal(status[0].id, 'item1');
			assert.equal(status[0].isExpand, true);
			assert.equal(status[1].id, 'item2');
			assert.equal(status[1].isExpand, false);
		});

		it(`simulate a click event on the item1's head, which closes item1`,function(){
			const head1 = dom.window.document.querySelector('#list .item_head');
			eventFire(head1,'click');
			const status = dom.window.listStatus;
			assert.equal(status[0].id, 'item1');
			assert.equal(status[0].isExpand, false);
			assert.equal(status[1].id, 'item2');
			assert.equal(status[1].isExpand, false);
		});
	});


	describe('setList(list)', function () {

		before(function(){

			const list = [
					{
						id:'item1',
						title:'item1',
						icon:'find_replace',
						content: `<div>1</div><div>2</div><div>3</div>`, //$UI.annotOptPanel.elt
						

					},{
						id:'item2',
						icon:'search',
						title:'item2',
						content:`<h1>hahahah</h1>` //$UI.algOptPanel.elt,
					},{
						id:'item3',
						icon:'face',
						title:'item3',
						content:`<input type = 'range'></input>`, //$UI.algOptPanel.elt,
						isExpand:true
					}
			];
			dom.window.list.setList(list);
			heads = dom.window.document.querySelectorAll('#list .item_head');
			bodies = dom.window.document.querySelectorAll('#list .item_body');			
		});
		// has two heads and contents
		it(`has three heads and contents`,function(){
			assert.equal(heads.length,3);
			assert.equal(bodies.length,3);
		});

		it('item3 is expand', function () {
			// item3 is expand
			assert(bodies[2].classList.contains('expand'));
		});

		it('item1 and item2 are collapse', function () {
			// item1 and item2 are collapse
			assert(bodies[1].classList.contains('collapse'));
			assert(bodies[0].classList.contains('collapse'));
		});

		// item1 has checkbox [checked] and div [textContent = 1111]
		it(`item1 has three divs`,function(){
			const content = bodies[0].querySelector('.item_content');
			assert.equal(content.children.length, 3);
			assert.equal(content.children[0].textContent, '1');
			assert.equal(content.children[1].textContent, '2');
			assert.equal(content.children[2].textContent, '3');
		});

		// item2 has a h1 and textContent is hahahah
		it('item2 has a h1 and textContent is hahahah', function () {
			const content = bodies[1].querySelector('.item_content');
			assert.equal(content.children.length, 1);
			assert.equal(content.children[0].textContent, 'hahahah');
		});
		// item3 has a input and text value is text input
		it('item3 has a input.type=range', function () {
			const content = bodies[2].querySelector('.item_content');
			assert.equal(content.children.length, 1);
			assert.equal(content.children[0].type, 'range');
		});
	});

	describe('After setList: triggerContent(id,action)', function () {
		
		it(`triggerContent('item2','open')`, function () {
			const list = dom.window.list;
			// open item2
			list.triggerContent('item2','open');

			// item2 is expand
			const bodies = dom.window.document.querySelectorAll('#list .item_body');
			assert(bodies[1].classList.contains('expand'));
			// item1 is collapsed
			assert(bodies[0].classList.contains('collapse'));
			assert(bodies[2].classList.contains('collapse'));
		});
		// close item2
		it(`triggerContent('item2')`, function () {
			const list = dom.window.list;
			// close item2
			list.triggerContent('item2');
			const bodies = dom.window.document.querySelectorAll('#list .item_body');
			assert(bodies[0].classList.contains('collapse'));
			assert(bodies[1].classList.contains('collapse'));
			assert(bodies[2].classList.contains('collapse'));
		});
	});


	describe('After setList: addContent(itemId, elt)', function () {
		let contents;
		before(function(){
			contents = dom.window.document.querySelectorAll('#list .item_content');
		});
		

		// add string 
		it(`add stringified HTMLelement to the content`, function () {
			dom.window.list.addContent('item1','<div>this is a test</div>');
			assert.equal(contents[0].children.length, 4);
			assert.equal(contents[0].children[3].textContent, 'this is a test');
		});

		it(`add HTMLElement to the content`, function () {
			const input = dom.window.document.createElement('input');
			input.type = 'text';
			input.value = 'this is a test'
			dom.window.list.addContent('item1',input);
			assert.equal(contents[0].children.length, 5);
			assert.equal(contents[0].children[4].type, 'text');
			assert.equal(contents[0].children[4].value, 'this is a test');
		});

	});


	describe('After setList: clearContext(itemId)', function(){
		let contents;
		before(function(){
			contents = dom.window.document.querySelectorAll('#list .item_content');
		});
		// clear context
		it(`clear item1's content`, function () {
			dom.window.list.clearContent('item1');
			assert.equal(contents[0].children.length, 0);
			assert.equal(contents[0].textContent,'');
		});

	});

	describe('After setList: callback function', function(){

		it(`open item2`, function () {
			dom.window.list.triggerContent('item2','open');
			const status = dom.window.listStatus;
			assert.equal(status[0].id, 'item1');
			assert.equal(status[0].isExpand, false);
			assert.equal(status[1].id, 'item2');
			assert.equal(status[1].isExpand, true);
			assert.equal(status[2].id, 'item3');
			assert.equal(status[2].isExpand, false);	
		});

		it(`open item1`, function () {
			dom.window.list.triggerContent('item1','open');
			const status = dom.window.listStatus;
			assert.equal(status[0].id, 'item1');
			assert.equal(status[0].isExpand, true);
			assert.equal(status[1].id, 'item2');
			assert.equal(status[1].isExpand, false);
			assert.equal(status[2].id, 'item3');
			assert.equal(status[2].isExpand, false);
		});

		it(`simulate a click event on the item1's head, which closes item1`,function(){
			const head1 = dom.window.document.querySelector('#list .item_head');
			eventFire(head1,'click');
			const status = dom.window.listStatus;
			assert.equal(status[0].id, 'item1');
			assert.equal(status[0].isExpand, false);
			assert.equal(status[1].id, 'item2');
			assert.equal(status[1].isExpand, false);
			assert.equal(status[2].id, 'item3');
			assert.equal(status[2].isExpand, false);
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
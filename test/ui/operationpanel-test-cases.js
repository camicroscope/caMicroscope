// operationpanel-test-cases.js


const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;
describe('Operation Panel Component',function(){
		let singleElt;
		let multipleElt;
		before(function(){

		});
	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function(done){
	 JSDOM.fromURL(
	    `${global.origin}${global.testFolder}/ui/operationpanel-test-cases.html`,
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
				singleElt = jsdom.window.document.getElementById('single');
				multipleElt = jsdom.window.document.getElementById('multiple');
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
		// let singleElt;
		// let multipleElt;
		// before(function(){
		// 	singleElt = dom.window.document.getElementById('single');
		// 	multipleElt = dom.window.document.getElementById('multiple');
		// });
		// Options Error: No Schema Error
		it('Options Error: No Schema Error', function () {
			let error = dom.window.document.getElementById('error1');
			assert.equal(error.textContent,'OperationPanel:No Form Schema ...');
		});

		// Options Error: No Action Error
		it('Options Error: No Action Error', function () {
			let error = dom.window.document.getElementById('error2');
			assert.equal(error.textContent,'OperationPanel:No Action ...');
		});

		// check title
		it(`Options:check action's text and states`,function(){
			const btn1 = singleElt.querySelector('.action');
			const btn2 = multipleElt.querySelector('.action');
			assert.equal(btn1.textContent,'Save');
			//assert.equal(btn1.disabled,true);
			assert.equal(btn2.textContent,'Submit');
			//assert.equal(btn2.disabled,true);
		});

		// check callback
		it('Options:check callback',function(){

		});


	});

	//describe
	describe('Schema Setting', function () {

		// Check schema's default value
		it(`Check schema's default value`,function(){
			const arg1 = singleElt.querySelector('#arg1');
			const arg2 = singleElt.querySelector('#arg2');
			const arg3 = singleElt.querySelector('#arg3');
			const arg4 = singleElt.querySelector('#arg4');
			assert.equal(arg1.checked,true);
			assert.equal(arg2.value,'arg_04');
			assert.equal(arg3.value,'test test test111');
			assert.equal(arg4.value,'D');
		});

		// Check validation on form
		it(`Check validation on form`,function(){
			const arg3 = singleElt.querySelector('#arg3');
			arg3.value = 'done';
			assert.equal(arg3.value,'done');
			const btn1 = singleElt.querySelector('.action');
			assert.equal(btn1.textContent,'Save');
		});

	});

	//
	describe(`Callback Function`, function(){
		it(`click On Save`,function(){
			const btn1 = singleElt.querySelector('.action');
			global.eventFire(btn1,'click',dom);
			var form =dom.window.changedData;
			assert.equal(form.id,'algorithm01');
			assert.equal(btn1.textContent,'Save');
			const arg1 = singleElt.querySelector('#arg1');
			const arg2 = singleElt.querySelector('#arg2');
			const arg3 = singleElt.querySelector('#arg3');
			const arg4 = singleElt.querySelector('#arg4');
			assert.equal(arg1.value,form.data.arg1);
			assert.equal(arg2.value,form.data.arg2);
			assert.equal(arg3.value,form.data.arg3);
			assert.equal(arg4.value,form.data.arg4);
		});
	})

	// For multiple schemas, changing select
	describe(`multiple schemas`,function(){
		it('Form Select changed',function(){
			let multipleElt = dom.window.document.getElementById('multiple');
			let select = multipleElt.querySelector('.head select');
			select.value = 1;
			global.eventFire(select,'change',dom);
			const arg1 = multipleElt.querySelector('#arg1');
			const arg2 = multipleElt.querySelector('#arg2');
			const arg3 = multipleElt.querySelector('#arg3');
			const arg4 = multipleElt.querySelector('#arg4');
			assert.equal(arg1.checked,false);
			assert.equal(arg2.value,'arg_04');
			assert.equal(arg3.value,'');
			assert.equal(arg4,null);

		});

		it('Callback Function',function(){
			const arg1 = multipleElt.querySelector('#arg1');
			const arg2 = multipleElt.querySelector('#arg2');
			const arg3 = multipleElt.querySelector('#arg3');
			arg1.checked = true;
			arg2.value = 'arg_01';
			arg3.value = 'test3';
			const btn1 = multipleElt.querySelector('.action');
			global.eventFire(btn1,'click',dom);
			var form =dom.window.changedData;
			assert.equal(form.id,'algorithm03');
			assert.equal(arg1.value,form.data.arg1);
			assert.equal(arg2.value,form.data.arg2);
			assert.equal(arg3.value,form.data.arg3);
		});
	});

});

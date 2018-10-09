//multselector-test-cases.js
const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;
const options = [[0,'test0'],[1,'test1'],[2,'test2'],[3,'test3']];
let selector1, selector2;
describe('Mult-Selector Component',function(){
	
	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function(done){
	 JSDOM.fromURL(
	    `${global.origin}${global.testFolder}/ui/multselector-test-cases.html`, 
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
				selector1 = window.document.getElementById('selector1');
				selector2 = window.document.getElementById('selector2');
				done();
			}
		},100);
	  }).catch(function(error) {
	  	// error
		done(error);
	  });
	
	});

	// constructor
	describe(`constructor`, function(){

		it(`window.mSel1: no control`,function(){
			assert.equal(selector1.querySelector('.footer'),null);
		});

		it(`window.mSel1: no options`,function(){
			const nodeList = selector1.querySelectorAll('select option');
			assert.equal(nodeList.length, 0);
		});

		it(`window.mSel2: has control`,function(){
			assert.notEqual(selector2.querySelector('.footer'),null);
		});
		
		it(`window.mSel2: has options`,function(){
			const nodeList = selector2.querySelectorAll('select option');
			nodeList.forEach( function(element, index) {
				// statements
				assert.equal(+element.value,index);
				assert(element instanceof Option);
				assert.equal(element.text,`opt${index}`);
			});
		});
	});

	// check set setData
	describe(`setData()`, function(){
		
		// it(`setData():invalid data`,function(){

		// });

		it(`setData():valid data`,function(){
			window.mSel1.setData(options);
			const nodeList = selector1.querySelectorAll('select option');
			nodeList.forEach( function(element, index) {
				// statements
				assert.equal(+element.value,index);
				assert(element instanceof Option);
				assert.equal(element.text,`test${index}`);
			});
		});

	})
	// check event 
	describe(`events`, function(){
		

		// select
		it(`event:select`, function(){
			// simulate to select 5 options on selector2
			const nodeList = selector2.querySelectorAll('.main select option');
			for(let i = 0;i<5;i++){
				nodeList[i].selected = true;
			}
			//
			const btn1 = selector2.querySelector('.action');
			global.eventFire(btn1,'click',dom);
		});

		// remove
		it(`event:remove`, function(){
			// simulate to remove 2 options on selector2
		});
		
		// action
		it(`event:action`, function(){
			//selected 3 options on selector2
		});

		// cancel
		it(`event:cancel`, function(){

		});

		// select-all
		it(`event:select-all`, function(){
			
		});
		// remove-all
		it(`event:remove-all`, function(){
				
		});
	}

	describe(`getSelected()`,function(){
		

		it(`Nothing selected`,function(){

		});
		
		it(`Something selected`,function(){
			
		});
	});




});


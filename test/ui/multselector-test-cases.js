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
				selector1 = jsdom.window.document.getElementById('selector1');
				selector2 = jsdom.window.document.getElementById('selector2');
				done();
			}
		},100);
	  }).catch(function(error) {
	  	// error
	  	console.log(error);
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
				assert.equal(element.text,`opt${index}`);
			});
		});
	});

	// check set setData
	describe(`setData()`, function(){
		
		// it(`setData():invalid data`,function(){

		// });

		it(`setData():valid data`,function(){
			dom.window.mSel1.setData(options);
			const nodeList = selector1.querySelectorAll('select option');
			nodeList.forEach( function(element, index) {
				// statements
				assert.equal(+element.value,index);
				assert.equal(element.text,`test${index}`);
			});
		});

	})
	// check event 
	describe(`events`, function(){
		let btns;
		before(function(){
			btns = selector2.querySelectorAll('button');
		});

		// select
		it(`event:select`, function(){
			// simulate to select 5 options on selector2
			const nodeList = selector2.querySelectorAll('.main select option');
			for(let i = 0;i<5;i++){ //0,1,2,3,4
				nodeList[i].selected = true;
			}

			// click on select
			global.eventFire(btns[1],'click',dom);

			// check change
			const selected = selector2.querySelectorAll('.selected select option');

			assert.equal(dom.window.eventName,'select');
			const data = dom.window.eventData;
			for(let i = 0;i < data.length; i++){
				assert.equal(+data[i][0],i);	
				assert.equal(data[i][1],`opt${i}`);	
			}
			
			

			// check the length of options
			assert.equal(selected.length,5);
			for(let i = 0;i<selected.length;i++){
				assert.equal(+selected[i].value,i);
				assert.equal(selected[i].text,`opt${i}`);
			}


		});

		// remove
		it(`event:remove`, function(){
			// simulate to remove 2 options on selector2
			const nodeList = selector2.querySelectorAll('.selected select option');
			for(let i = 0;i<2;i++){ //0,1
				nodeList[i].selected = true;
			}
			// click on select
			global.eventFire(btns[2],'click',dom);

			// check change
			const selected = selector2.querySelectorAll('.selected select option');
			
			assert.equal(dom.window.eventName,'remove');
			const data = dom.window.eventData;
			console.log(data);
			for(let i = 0;i < data.length; i++){
				assert.equal(+data[i][0],i);	
				assert.equal(data[i][1],`opt${i}`);	
			}
			// check the length of options
			assert.equal(selected.length,3);
			for(let i = 0;i<selected.length;i++){
				assert.equal(+selected[i].value,i+2);
				assert.equal(selected[i].text,`opt${i+2}`);
			}
		});
		
		// action
		it(`event:action`, function(){
			//selected 3 options on selector2
			global.eventFire(btns[5],'click',dom);

			// check change
			const selected = selector2.querySelectorAll('.selected select option');

			assert.equal(dom.window.eventName,'action');
			const data = dom.window.eventData;
			for(let i = 0;i < data.length; i++){
				assert.equal(+data[i][0],i+2);	
				assert.equal(data[i][1],`opt${i+2}`);	
			}
			// check the length of options
			assert.equal(selected.length,3);
			for(let i = 0;i<selected.length;i++){
				assert.equal(+selected[i].value,i+2);
				assert.equal(selected[i].text,`opt${i+2}`);
			}
		});

		// cancel
		it(`event:cancel`, function(){
			global.eventFire(btns[4],'click',dom);
			assert.equal(dom.window.eventName,'cancel');
		});

		// select-all
		it(`event:select-all`, function(){
			global.eventFire(btns[0],'click',dom);
			assert.equal(dom.window.eventName,'select-all');
		});
		// remove-all
		it(`event:remove-all`, function(){
			global.eventFire(btns[3],'click',dom);
			assert.equal(dom.window.eventName,'remove-all');
		});
	});

	describe(`getSelected()`,function(){
		it(`Nothing selected`,function(){

		});
		
		it(`Something selected`,function(){
			
		});
	});




});


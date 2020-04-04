const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;

describe('Ca Message Component', function () {
	
	/* --  prepare test START -- */
	// loading the test page and wait til the scripts on the test pages are executed.
	before(function(done){
		
		// load test page
		 JSDOM.fromURL(
		    `${global.origin}${global.testFolder}/ui/camessage-test-cases.html`, 
		    {
		      runScripts: "dangerously",
		      resources: "usable"
		    }
		  ).then(jsdom => {
		  	dom = jsdom;
		  	// check the loading flag, waiting the scripts executed
			let checkLoaded = setInterval(function(){
				if(jsdom.window.document.getElementById('isLoad').checked){
					clearInterval(checkLoaded);
					// run test cases if page is ready. 
					done();
				}
			},100);
		  }).catch(function(error) {
		  	// error
		    done(error);
		  })		
	});
	/* --  prepare test END -- */

	// case1: initialize 
	it('Initialize', function () {
		const case1 = dom.window.document.getElementById('case1');
		assert.equal(case1.textContent,'Hello World');
	});

	// case 2: change text
	it('Change Text', function () { 
		const case2 = dom.window.document.getElementById('case2');
		assert.equal(case2.innerHTML,'Change Text');
	});

	// case 3: change style
	it('Change Style', function () {
		const case3 = dom.window.document.getElementById('case3');
		assert.equal(case3.innerHTML,'case3');
		assert.equal(case3.style.color,'rgb(9, 2, 35)');
		assert.equal(case3.style.fontSize,'2rem');
		assert.equal(case3.style.backgroundColor,'rgb(193, 13, 13)');
	});
});
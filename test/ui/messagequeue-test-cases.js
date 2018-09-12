const jsdom = require('jsdom');
const assert = require('assert');
const { JSDOM } = jsdom;

// jsdom instance
let dom;
let mList;
// read test page
 JSDOM.fromURL(
    'http://127.0.0.1:8080/test/ui/messagequeue-test-cases.html', 
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
			console.log(mList);
			run();
		}
	},100);
  }).catch(function(error) {
    console.log(error);
  })

// 
describe('Message Queue Component', function () {
	console.log('test1...')
	describe('Initialize', function () {
		console.log('Initialize...')
		// case1: initialize top-left top-right bottom-left bottom-right
		it('position:top-left(default)', function () {
			console.log('test1...')
			assert.equal(mList[0].style.top,'0px');
			assert.equal(mList[0].style.left,'0px');
			assert.equal(mList[0].querySelector('.bullet').textContent,'info message');
			
		});

		it('position:top-right', function () {
			assert.equal(mList[1].style.top,'0px');
			assert.equal(mList[1].style.right,'0px');
			assert.equal(mList[1].querySelector('.bullet').textContent,'warning message');
		});

		it('position:bottom-left', function () {
			assert.equal(mList[2].style.bottom, '0px');
			assert.equal(mList[2].style.left, '0px');
			assert.equal(mList[2].querySelector('.bullet').textContent,'error message');
		});

		it('position:bottom-right', function () {
			assert.equal(mList[3].style.bottom, '0px');
			assert.equal(mList[3].style.right, '0px');
			assert.equal(mList[3].querySelector('.bullet').textContent,'message');
		});
	});
});
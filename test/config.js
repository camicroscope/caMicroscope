//config.js
//
//global.origin = 'http://localhost:4010'
global.origin = 'http://127.0.0.1:8080'
global.testFolder = '/test'


global.eventFire = function(el, etype, dom){
	if (el.fireEvent) {
		el.fireEvent('on' + etype);
	} else {
		var evObj = dom.window.document.createEvent('Events');
		evObj.initEvent(etype, true, false);
		el.dispatchEvent(evObj);
	}
}

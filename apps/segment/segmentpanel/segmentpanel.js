// segmentpanel.js
// 

function SegmentPanel(viewer){
	const temp = `
		<div id='close' class = 'material-icons settings'>close</div>
		<div id='save' class = 'material-icons settings'>save</div>
		<div id='thresh' class = 'material-icons settings'>all_out</div>
		<div id='amin' class = 'material-icons settings'>arrow_downward</div>
		<div id='amax' class = 'material-icons settings'>arrow_upward</div>

		<div id='twrap' class='segment-setting'><input id='threshold' type='range' min='0' max='1' step='0.01' value='0.7'><label id='tlabel'>0.7</label></div>
		
		<div id='minwrap' class='segment-setting'><input id='minarea' type='range' min='0' max='1' step='1' value='400'><label id='minlabel'>400</label></div>
		
		<div id='maxwrap' class='segment-setting'><input id='maxarea' type='range' min='0' max='5000' step='1' value='4500'><label id='maxlabel'>4500</label></div>
		
		<div class='segment-count'><label>Object Count: </label><label id='segcount'></label></div>
		
		<canvas class='out'></canvas>
		<canvas class='src'></canvas>
	`;
	this.viewer = viewer;
	this.elt = document.createElement('div');
	this.elt.classList.add('segment-panel');
	this.elt.innerHTML = temp;
	this.__out = this.elt.querySelector('.out');
	this.__src = this.elt.querySelector('.src');
	this.__input = this.elt.querySelector('.segment-setting input[type=range]#threshold');
	this.__label = this.elt.querySelector('.segment-setting label#tlabel');
	this.__twrap = this.elt.querySelector('#twrap');
	this.viewer.addOverlay({
      element: this.elt,
      location: new OpenSeadragon.Rect(0,0,0,0),
      checkResize: false
    });
    this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
    this.elt.querySelector('#close').addEventListener('click',function(e){
    	this.close();
		}.bind(this));
		this.elt.querySelector('#save').addEventListener('click',function(e){
    	this.save();
		}.bind(this));
		this.elt.querySelector('#thresh').addEventListener('click',function(e){
    	this.showThreshBar();
		}.bind(this));
		this.elt.querySelector('#amin').addEventListener('click',function(e){
    	this.save();
		}.bind(this));
		this.elt.querySelector('#amax').addEventListener('click',function(e){
    	this.save();
		}.bind(this));
		
    this.close()
}

SegmentPanel.prototype.open = function(){
	this.elt.style.display = '';
};

SegmentPanel.prototype.close = function(){
	this.elt.style.display = 'none';
};

SegmentPanel.prototype.save = function(){
	alert('Saving Image and Mask!');
};

SegmentPanel.prototype.showThreshBar = function(){
	if(this.__twrap.getAttribute('hidden') == 'true') {
		this.__twrap.setAttribute('hidden', 'false');
	} else {
		this.__twrap.setAttribute('hidden', 'true');
	}
	// alert('Showing Bar');
};


SegmentPanel.prototype.setPosition = function(x,y,w,h){
	this.overlay.location.x = x;
	this.overlay.location.y = y;
	this.overlay.width = w;
	this.overlay.height = h;
	this.overlay.drawHTML(this.viewer.overlaysContainer,this.viewer.viewport);
};
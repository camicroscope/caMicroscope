// segmentpanel.js
//

function SegmentPanel(viewer){

	const temp = `
		<div tooltip='Close ROI' tooltip-position='top'><div id='close' class='material-icons settings'>close</div></div>
		<div id='save' class='settings' tooltip='Save PNG Image' tooltip-position='top'><div class='material-icons'>save</div></div>
		<div id='savecsv' class='settings' tooltip='Save CSV of segmentation' tooltip-position='top'><div class='material-icons settings'>list</div></div>
		<div id='thresh' class='settings' tooltip='Adjust settings' tooltip-position='top'><div class='material-icons'>all_out</div></div>
		<div id='amin' class='material-icons settings'>arrow_downward</div>
		<div id='amax' class='material-icons settings'>arrow_upward</div>

    <div id='twrap' class='segment-setting settings'>
      <label for="threshold">Threshold</label><input type='range' id='threshold' min='0' max='1' step='0.01' value='0.7'><label id='tlabel'>0.7</label>
    </div>

    <div id='minwrap' class='segment-setting settings' style="display: none;">
      <label for="minarea">Min Area</label><input id='minarea' type='range' min='0' max='5000' step='1' value='400'><label id='minlabel'>400</label>
    </div>

    <div id='maxwrap' class='segment-setting settings' style="display: none;">
      <label for="maxarea">Max Area</label><input id='maxarea' type='range' min='0' max='5000' step='1' value='4500'><label id='maxlabel'>4500</label>
    </div>
		
		<div class='segment-count'><label>Object Count: </label><label id='segcount'></label></div>
		
		<canvas class='out'></canvas>
		<canvas class='src'></canvas>
		<canvas id ='fullsrc' class='hiddenCanvas'></canvas>
		<canvas id='c2s' class='hiddenCanvas'></canvas>
		<canvas id='fullSegImg' class='hiddenCanvas'></canvas>
		<img id='imageEle' class='hiddenCanvas'></img>
		<a id='csvDLB'></a>
	`;
	
	this.viewer = viewer;

	this.elt = document.createElement('div');
	this.elt.classList.add('segment-panel');
	this.elt.innerHTML = temp;
	this.__contours = null;
	this.__top_left = null;
	this.__x = null;
	this.__y = null;
	this.__width = null;
	this.__height = null;
	this.__spImgX = null;
	this.__spImgY = null;
	this.__spImgWidth = null;
	this.__spImgHeight = null;

	this.__out = this.elt.querySelector('.out');
	this.__src = this.elt.querySelector('.src');
	this.__fullsrc = this.elt.querySelector('#fullsrc');
	this.__img = this.elt.querySelector('#imageEle');
	this.__c2s = this.elt.querySelector('#c2s');
	this.__btn_save = this.elt.querySelector('#save');
	this.__btn_savecsv = this.elt.querySelector('#savecsv');
	this.__btn_csvDL = this.elt.querySelector('#csvDLB');

	//threshold
	this.__threshold = this.elt.querySelector('.segment-setting input[type=range]#threshold');
	this.__tlabel = this.elt.querySelector('.segment-setting label#tlabel');
	this.__twrap = this.elt.querySelector('#twrap');

	//min
	this.__minarea = this.elt.querySelector('.segment-setting input[type=range]#minarea');
	this.__minlabel = this.elt.querySelector('.segment-setting label#minlabel');
	this.__minwrap = this.elt.querySelector('#minwrap');

	//max
	this.__maxarea = this.elt.querySelector('.segment-setting input[type=range]#maxarea');
	this.__maxlabel = this.elt.querySelector('.segment-setting label#maxlabel');
	this.__maxwrap = this.elt.querySelector('#maxwrap');

	this.viewer.addOverlay({
      element: this.elt,
      location: new OpenSeadragon.Rect(0,0,0,0),
      checkResize: false
    });
    this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
    this.elt.querySelector('#close').addEventListener('click',function(e){
    	this.close();
		}.bind(this));
		// this.elt.querySelector('#save').addEventListener('click',function(e){
    // 	this.save();
		// }.bind(this));
		this.elt.querySelector('#thresh').addEventListener('click',function(e){
    	this.showThreshBar();
		}.bind(this));
		this.elt.querySelector('#amin').addEventListener('click',function(e){
    	this.showMinBar();
		}.bind(this));
		this.elt.querySelector('#amax').addEventListener('click',function(e){
    	this.showMaxBar();
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
	if(this.__twrap.style.display === 'none') {
		this.__twrap.style.display = 'flex';
		this.__minwrap.style.display = 'none';
		this.__maxwrap.style.display = 'none';
	}

	// alert('Showing Bar');
};

SegmentPanel.prototype.showMinBar = function(){

	if(this.__minwrap.style.display === 'none') {
		this.__minwrap.style.display = 'flex';
		this.__twrap.style.display = 'none';
		this.__maxwrap.style.display = 'none';
	}

};

SegmentPanel.prototype.showMaxBar = function(){

	if(this.__maxwrap.style.display === 'none') {
		this.__maxwrap.style.display = 'flex';
		this.__minwrap.style.display = 'none';
		this.__twrap.style.display = 'none';
	}

};


SegmentPanel.prototype.setPosition = function(x,y,w,h){
	this.overlay.location.x = x;
	this.overlay.location.y = y;
	this.overlay.width = w;
	this.overlay.height = h;
	this.overlay.drawHTML(this.viewer.overlaysContainer,this.viewer.viewport);
};
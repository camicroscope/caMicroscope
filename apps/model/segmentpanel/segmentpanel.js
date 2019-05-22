// segmentpanel.js
//

function SegmentPanel(viewer){

	const temp = `
		<div class='result' id='result'></div>
		<div id='close' class='material-icons settings'>close</div>
		<div id='save' class='material-icons settings' title='Save ROI Image'>save</div>
		<div id='savecsv' class='material-icons settings' title='Save ROI CSV File'>list</div>
		<select id='modelselect' class='settings' title='Select the model'><option hidden disabled selected value> -- select a model -- </option>	</select>
		
		<div id='processing' class='segment-processing'><span class='blink_me'><em>Processing</em></span></div>
		
		<canvas class='out'></canvas>
		<canvas class='src'></canvas>
		<canvas id ='fullsrc' class='hiddenCanvas'></canvas>
		<canvas id='c2s' class='hiddenCanvas'></canvas>
		<canvas id='fullSegImg' class='hiddenCanvas'></canvas>
		<img id='imageEle' class='hiddenCanvas'></img>
		<a id='csvDLB'></a>
		<input id='inProgress' type='hidden' />
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

	// canvases
	this.__out = this.elt.querySelector('.out');
	this.__src = this.elt.querySelector('.src');
	this.__fullsrc = this.elt.querySelector('#fullsrc');
	this.__img = this.elt.querySelector('#imageEle');
	this.__c2s = this.elt.querySelector('#c2s');

	// clear
	this.__btn_save = this.elt.querySelector('#save');
	this.__btn_savecsv = this.elt.querySelector('#savecsv');
	this.__btn_csvDL = this.elt.querySelector('#csvDLB');
	this.__indicator = this.elt.querySelector('#processing');
	this.__result = this.elt.querySelector('#result');

	//threshold
	this.__modelselector = this.elt.querySelector('#modelselect');
	var opt = document.createElement('option');
    opt.value = 'demo';
    opt.innerHTML = "Demo model 0";
    this.__modelselector.appendChild(opt);
    opt = document.createElement('option');
    opt.value = 'demo1';
    opt.innerHTML = "Demo model 1";
    this.__modelselector.appendChild(opt);

	this.viewer.addOverlay({
      element: this.elt,
      location: new OpenSeadragon.Rect(0,0,0,0),
      checkResize: false
    });
    this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
    this.elt.querySelector('#close').addEventListener('click',function(e){
    	console.log('close');
    	this.close();
		}.bind(this));

    this.close()
}

SegmentPanel.prototype.open = function(){
	this.elt.style.display = '';
};

SegmentPanel.prototype.close = function(){
	empty(this.__result);
	this.__modelselector.selectedIndex = 0;
	this.elt.style.display = 'none';
};

SegmentPanel.prototype.save = function(){
	alert('Saving Image and Mask!');
};

SegmentPanel.prototype.showProgress = function(text){
	// console.log('In Progress');
	this.__indicator.style.display = 'flex';
	if (text) this.__indicator.innerHTML = text;
}

SegmentPanel.prototype.hideProgress = function(){
	// console.log('Progress Finished');
	this.__indicator.style.display = 'none';
}

SegmentPanel.prototype.showResults = function(text){
	// console.log('Progress Finished');
	this.__result.innerHTML = text;
}

SegmentPanel.prototype.setPosition = function(x,y,w,h){
	this.overlay.location.x = x;
	this.overlay.location.y = y;
	this.overlay.width = w;
	this.overlay.height = h;
	this.overlay.drawHTML(this.viewer.overlaysContainer,this.viewer.viewport);
};
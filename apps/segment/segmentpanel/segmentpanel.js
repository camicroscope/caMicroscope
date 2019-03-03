// segmentpanel.js
// 

function SegmentPanel(viewer){
	const temp = `
		<div class = 'material-icons settings'>close</div>
		<div class='segment-setting'><input type='range' min=0 max=1 step=0.05 value=0.3 ><label>0.7</label></div>
		<canvas class='out'></canvas>
		<canvas class='src'></canvas>
	`;
	this.viewer = viewer;
	this.elt = document.createElement('div');
	this.elt.classList.add('segment-panel');
	this.elt.innerHTML = temp;
	this.__out = this.elt.querySelector('.out');
	this.__src = this.elt.querySelector('.src');
	this.__input = this.elt.querySelector('.segment-setting input[type=range]');
	this.__label = this.elt.querySelector('.segment-setting label');
	this.viewer.addOverlay({
      element: this.elt,
      location: new OpenSeadragon.Rect(0,0,0,0),
      checkResize: false
    });
    this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
    this.elt.querySelector('.material-icons').addEventListener('click',function(e){
    	this.close();
    }.bind(this));
    this.close()
}

SegmentPanel.prototype.open = function(){
	this.elt.style.display = '';
};

SegmentPanel.prototype.close = function(){
	this.elt.style.display = 'none';
};
SegmentPanel.prototype.setPosition = function(x,y,w,h){
	this.overlay.location.x = x;
	this.overlay.location.y = y;
	this.overlay.width = w;
	this.overlay.height = h;
	this.overlay.drawHTML(this.viewer.overlaysContainer,this.viewer.viewport);
};
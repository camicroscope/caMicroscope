function CaZoomControl(opt){
	this.name = 'CaZoomControl';
	this.setting = {
		// max 
		// min
		// step
		// current zoom
		// viewer: 
		// color - font color
		// bg_color - background color	
	}
	extend(this.setting, opt);


	this.elt = document.getElementById(this.setting.id);
	if(!this.elt || !this.setting.viewer) {
		console.error(`${this.name}: No Viewer or DOM Element`);
		return;
	}

	// zoom attributes
	this._zoom = this.setting.zoom;

	// create UI Elements
	this.__refresh();
	
	// detach it
	this.elt.parentNode.removeChild(this.elt);
	// move zoom control into viewer 
	var nav_btm_right = this.setting.viewer.controls.bottomright;
    nav_btm_right.insertBefore(this.elt,nav_btm_right.firstChild);
	
	// setting 
	this._range.max = this._zoom.max;
	this._range.min = this._zoom.min;
	this._range.value = this._zoom.cur;
	this._range.step = this._zoom.step;
	this._txt.innerText = this._zoom.cur;

	// event
	this._z_in.addEventListener('click',this.__zoomIn.bind(this));
	this._z_out.addEventListener('click',this.__zoomOut.bind(this));
	this._range.addEventListener('change',this.__zoomTo.bind(this));
	this._range.addEventListener('mousemove',this.__zoomTo.bind(this));

	// test for zoom event
    this.setting.viewer.addHandler('zoom', function(e){
    	this.__updateZoom(e.zoom);
    }.bind(this));


}
/*
	refresh UI
*/
CaZoomControl.prototype.__refresh = function() {

	empty(this.elt);
	// create UI
	this.elt.classList.add('zoom_ctrl');
	// zoom out area
	this._z_out = document.createElement('div');
	this._z_out.title = 'Zoom Out';
	this._z_out.classList.add('zoom');
	this._z_out.classList.add('out');
	
	const zout_ic = document.createElement('i');
	zout_ic.classList.add('material-icons');
	zout_ic.classList.add('md-24');
	zout_ic.textContent = 'remove';
	
	this._z_out.appendChild(zout_ic);
	this.elt.appendChild(this._z_out);

	// slide
	this._range = document.createElement('input');
	this._range.type = 'range';
	this._range.classList.add('slider');
	
	this.elt.appendChild(this._range);

	// zoom in area
	this._z_in = document.createElement('div');
	this._z_in.title = 'Zoom In';
	this._z_in.classList.add('zoom');
	this._z_in.classList.add('in');
	
	const zin_ic = document.createElement('i');
	zin_ic.classList.add('material-icons');
	zin_ic.classList.add('md-24');
	zin_ic.textContent = 'add';
	
	this._z_in.appendChild(zin_ic);
	this.elt.appendChild(this._z_in);

	// indicator
	const _div = document.createElement('div');
	_div.classList.add('idx');

	this._txt = document.createElement('div');
	this._txt.classList.add('content');
	
	_div.appendChild(this._txt);
	this.elt.appendChild(_div);
}
/**
	update the zoom slide bar and indicator by a value
*/
CaZoomControl.prototype.__updateZoom = function(value) {
	value = +value
	value = value.toFixed(2);
	this._zoom.cur = +value;
	this._range.value = +value;
	this._txt.innerText = `x${value}`;
}

CaZoomControl.prototype.__zoomTo = function() {
	var value = +this._range.value;

	this.setting.viewer.viewport.zoomTo(value);
	this.__updateZoom(value);

}

CaZoomControl.prototype.__zoomIn = function() {
	const viewer = this.setting.viewer;
	if(this._zoom.cur >= this._zoom.max) return;
	this._zoom.cur+= this._zoom.step;
	var val = this._zoom.cur.toFixed(2);
	viewer.viewport.zoomTo(val);
	this.__updateZoom(val);
}
CaZoomControl.prototype.__zoomOut = function() {
	const viewer = this.setting.viewer;
	if(this._zoom.cur <= this._zoom.min) return;
	this._zoom.cur -= this._zoom.step;
	var val = this._zoom.cur.toFixed(2);
	viewer.viewport.zoomTo(val);
	this.__updateZoom(val);
}


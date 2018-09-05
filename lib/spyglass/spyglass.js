// spyglass.js

function Spyglass(options){
	this.className = 'Spyglass';
	
	if(!OpenSeadragon){
		console.error(`${this.className}: Requires OpenSeadragon`)
		return null;		
	}
	if(!OpenSeadragon.MouseTracker){
		console.error(`${this.className}: Requires OpenSeadragon.MouseTracker`)
		return null;		
	}
	if(!options.targetViewer){
		console.error(`${this.className}: Requires Target Viewer`)
		return null;
	}
	if(!options.imgsrc){
		console.error(`${this.className}: Requires Image Source`)
		return null;
	}
	// create container
	this.elt = document.createElement('div');
	this.elt.classList.add('spyglass');

	
	// set default setting
	options.width = options.width || '20%';
	options.height = options.height || '20%';
	options.zIndex = options.zIndex || 300;

	// set options
	this.setOptions(options);

	// create osd viewer
	this._viewer = new OpenSeadragon.Viewer({
		element: this.elt,
		prefixUrl: "images/",
		showNavigationControl : false
    });
	this.imgsrc = options.imgsrc;
	this._target_viewer = options.targetViewer;
	this._viewer.open(this.imgsrc);

	
	this._tracker = new OpenSeadragon.MouseTracker({
		element: this._target_viewer.container,
		startDisabled: true,
		moveHandler: this.moving.bind(this)
	});
	this._tracker.setTracking(false);
	this.events = {
		zoom:this.__zoom.bind(this)
	}

	this.elt.style.position = 'absolute';
}

Spyglass.prototype.setOptions = function(opt){
	if(!opt) return;
	if(opt.width) this.elt.style.width = opt.width;
	if(opt.height) this.elt.style.height = opt.height;
	if(opt.zIndex) this.elt.style.zIndex = opt.zIndex;
}

Spyglass.prototype.__zoom = function(e){
	const maxZoom = this._viewer.viewport.getMaxZoom();
	let currentZoom  = e.zoom*10;
	currentZoom = Math.min(currentZoom,maxZoom);
	this._viewer.viewport.zoomTo(currentZoom);
}

Spyglass.prototype.setPosition = function(pos){
	this.elt.style.left = `${pos.x}px`;
	this.elt.style.top = `${pos.y}px`;
}

Spyglass.prototype.open = function(x = 0,y = 0){
	this.elt.style.display = 'block';
	this.setPosition({x:x,y:y});
	this._target_viewer.addHandler('zoom', this.events.zoom);
	this._tracker.setTracking(true);
	this._target_viewer.container.appendChild(this.elt);
	this.__zoom({zoom:this._target_viewer.viewport.getZoom()});
}

Spyglass.prototype.close = function(){
	// 
	this.elt.style.display = 'none';
	this.elt.style.top = '-100%';
	this.elt.style.left = '-100%';
	this._target_viewer.removeHandler('zoom', this.events.zoom);
	this._tracker.setTracking(false);
	this._target_viewer.container.removeChild(this.elt);
}

Spyglass.prototype.moving = function(e){
	this.setPosition(e.position);
	var pt = this._target_viewer.viewport.pointFromPixel(e.position);
	this._viewer.viewport.panTo(pt);
}

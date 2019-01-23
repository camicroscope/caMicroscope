// spyglass.js
// test:
// constructor
// setOptions
// setPosition
// open
// close
// 

/**
 * @constructor
 * Spyglass has the ability to magnify the current osd's viewer.
 * 
 * Dependency:
 * OpenSeadragon, OpenSeadragon.MouseTracker, OpenSeadragon.Viewer 
 * 
 * @param {Object} options
 *        allows configurable properties to be entirely specified by passing an options object to the constructor.
 * @param {Viewer} options.targetViewer
 *        the target viewer that will open the spyglass
 * @param {String} options.imgsrc
 *        the source/url of the image
 * @param {Number} options.width
*        the width of spyglass on screen
 * @param {Number} options.height
 *        the height of spyglass on screen
 * @param {Number} options.zIndex
 *        z-index of spyglass
 */
function Spyglass(options){
    this.className = 'Spyglass';
    
    // validate options
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
    this.elt = document.createElement('div');
    this.elt.classList.add('spyglass');
    this.indicator = document.createElement('div');
    this.indicator.classList.add('indicator');
    this.indicator.style.display = 'none';
    this.indicator.style.zIndex = options.zIndex || 300;
    this.factor = 10;

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

    //
    this._target_viewer.addOverlay(this.indicator,new OpenSeadragon.Rect(0,0,0,0));
    this._overlayer = this._target_viewer.currentOverlays[this._target_viewer.currentOverlays.length-1];
}

/**
 * set options to spyglass
 * @param {Number} options.width
 *        the width of spyglass on screen       
 * @param {Number} options.height
 *        the height of spyglass on screen
 * @param {Number} options.zIndex
 *        z-index of spyglass
 */
Spyglass.prototype.setOptions = function(opt){
    if(!opt) return;
    if(opt.width) this.elt.style.width = opt.width;
    if(opt.height) this.elt.style.height = opt.height;
    if(opt.zIndex) this.elt.style.zIndex = opt.zIndex;
}

/**
 * @private
 * __zoom the spyclass's zoom level will change when the target viewer's zoom level is changed
 * @param  {Event} e
 *         Event
 */
Spyglass.prototype.__zoom = function(e){
    //console.log('zoom')
    //const maxZoom = this._viewer.viewport.getMaxZoom();
    let currentZoom  = e.zoom * this.factor;
    //currentZoom = Math.min(currentZoom,maxZoom);
    this._viewer.viewport.zoomTo(currentZoom);
    
    this.adjust();
}
Spyglass.prototype.adjust = function(){
    const rect = this._viewer.viewport.getBounds();
    this._overlayer.location.x = rect.x;
    this._overlayer.location.y = rect.y;
    this._overlayer.width = rect.width;
    this._overlayer.height = rect.height;
    this._overlayer.drawHTML(this._target_viewer.overlaysContainer,this._target_viewer.viewport);
}
/**
 * set spyglass to the specific position
 * @param {Object} pos
 *        the position data
 * @param {Number} pos.x
 *        the horizontal coordinate within the application's client area       
 * @param {Number} pos.y
 *        the vertical coordinate within the application's client area
 *               
 */
Spyglass.prototype.setPosition = function(pos){

    this.elt.style.left = `${pos.x + this.elt.offsetWidth*0.5}px`;
    this.elt.style.top = `${pos.y - this.elt.offsetHeight*0.5}px`;
    // calculate position
    if(!this.elt.offsetParent) return;
    const mostLeftPosition = this.elt.offsetWidth + this.elt.offsetLeft;
    
    // check right edge
    if(mostLeftPosition > this.elt.offsetParent.offsetWidth) {
        this.elt.style.left = `${pos.x - this.elt.offsetWidth*1.5}px`;
        
    }
    // check top edge
    if(this.elt.offsetTop < 0){
        this.elt.style.left = `${pos.x - this.elt.offsetWidth*0.5}px`;
        this.elt.style.top = `${pos.y + this.elt.offsetHeight*0.5}px`;
    }
    // check bottom edge
    if(this.elt.offsetTop + this.elt.offsetHeight > this.elt.offsetParent.offsetHeight){
        this.elt.style.left = `${pos.x - this.elt.offsetWidth*0.5}px`;
        this.elt.style.top = `${pos.y - this.elt.offsetHeight*1.5}px`;
    }
    
}

/**
 * open the spyglass in an specific position
 * @param  {Number} [x=0]
 *         the horizontal coordinate within the application's client area
 * @param  {Number} [y=0]
 *         the vertical coordinate within the application's client area
 */
Spyglass.prototype.open = function(x = 0,y = 0){
    this.elt.style.display = 'none';
    this.setPosition({x:x,y:y});
    this._target_viewer.addHandler('zoom', this.events.zoom);
    this._tracker.setTracking(true);
    this._target_viewer.container.appendChild(this.elt);
    this.__zoom({zoom:this._target_viewer.viewport.getZoom()});
}

/**
 * close the spyglass
 */
Spyglass.prototype.close = function(){
    // 
    this.elt.style.display = 'none';
    this.indicator.style.display = 'none';
    this.elt.style.top = '-100%';
    this.elt.style.left = '-100%';
    this._target_viewer.removeHandler('zoom', this.events.zoom);
    this._target_viewer.removeOverlay(this.indicator);
    this._tracker.setTracking(false);
    if(this.elt.parentNode)this._target_viewer.container.removeChild(this.elt);
}

/**
 * @private
 * moving triggle on mousemove if the spyglass is opened
 * @param  {Event} e
 *         The event
 */
Spyglass.prototype.moving = function(e){
    
    const point = new OpenSeadragon.Point(e.position.x, e.position.y);
    const img_point = this._target_viewer.viewport.windowToImageCoordinates(point);
    const image1 = this._target_viewer.world.getItemAt(0);
    const imgWidth = image1.source.dimensions.x;
    const imgHeight = image1.source.dimensions.y;

    if(0 > img_point.x || imgWidth < img_point.x || 0 > img_point.y || imgHeight < img_point.y ){
        this.elt.style.display = 'none';
        this.indicator.style.display = 'none';
        this.indicator.style.cursor = 'default';
        return;
    }

    
    this.open(e.position.x,e.position.y);
    this.elt.style.display = '';
    this.indicator.style.display = '';
    this.indicator.style.cursor = 'crosshair';
    this.setPosition(e.position);
    var pt = this._target_viewer.viewport.pointFromPixel(e.position);
    this._viewer.viewport.panTo(pt);

}

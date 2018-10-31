// openseadragon-labeling.js
(function($){
    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }

    // check version
    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonCanvasDrawOverlay requires ' +
                'OpenSeadragon version 2.2.0+');
    }
    // initialize the instance of DrawOverlay
    $.Viewer.prototype.createPatchManager = function(options) {
        if (!this.pmanager) {
            // declare and initialize the instance based on the options
            options = options || {};
            options.viewer = this;
            this.pmanager = new $.PatchManager(options);
        } else {
            // update the options
            //this.pmanager.updateOptions(options);
        }
    };

    $.PatchManager = function(options) {
        
        this.events ={
            press:this._press.bind(this),
            click:this._click.bind(this)//,
            //zoom:zoom.bind(this)
        }
        this.isPoint = false;
        this.isCreatePatch = true;
        this.viewer = options.viewer;
        
        //this.status
        this.patches = [];
        this.activePatch = null;

        // save key handler
        this.keyHandler = this.viewer.innerTracker.keyHandler;

        var image1 = this.viewer.world.getItemAt(0);
        this.imgWidth = image1.source.dimensions.x;
        this.imgHeight = image1.source.dimensions.y;

        this.viewer.canvas.addEventListener('click', this.events.click);
        this.viewer.addHandler('canvas-press', this.events.press);
        //this.viewer.addHandler('zoom', this.events.zoom);
    
    }

    // function zoom(e){
    // 	if(this.activePatch) this.activePatch.deactive();
    // }

    $.PatchManager.prototype.addPatch = function(center, noteType){
        const _patch = document.createElement('div');

        const rect = getRect(img_point,noteType.model.width,noteType.height,this.imgWidth,this.imgHeight,this.viewer);
    }

    $.PatchManager.prototype._press = function(e){
        this.isCreatePatch = true;
    }
   
    $.PatchManager.prototype._click = function(e){
	    //const img_point = this.viewer.viewport.windowToImageCoordinates(new $.Point(e.originalEvent.clientX,e.originalEvent.clientY));
	    const img_point = this.viewer.viewport.windowToImageCoordinates(new $.Point(e.clientX,e.clientY));
	    const view_point = this.viewer.viewport.windowToViewportCoordinates(new $.Point(e.clientX,e.clientY));


	    if(0 > img_point.x || this.imgWidth < img_point.x || 0 > img_point.y || this.imgHeight < img_point.y || !this.isCreatePatch) return;
	    

	    this.viewer.innerTracker.keyHandler = this.keyHandler;
	    
	    

	    // create new one
	    let options = {
	    	data:'',
			//size:new $.Point(width,height),
			center:view_point,
			viewer:this.viewer,
			color:'#ff0000'
		};

	    if(this.activePatch){
	    	options = this.activePatch.templateOptions(options);
			options.center = view_point;
	    }else{
	    	const viewer_bounds = $CAMIC.viewer.viewport.getBounds();
	    	const width = viewer_bounds.width * 0.1;
	    	const height = viewer_bounds.height * 0.1;
	    	options.size = new $.Point(width,height);
	    }
        options.isPoint = this.isPoint;

        console.log(options);

	    this.patches.push(new $.Patch(options));
    }
    			// data:'',
    			// size: new $.Point(250,300),
    			// center:img_point,
    			// viewer:this.viewer,
    			// color:'#ff0000'
    function getRect(center, size, viewer, isPoint=false){
        const max = viewer.viewport.imageToViewportCoordinates(viewer.world.getItemAt(0).source.dimensions);
        const width = size.x;
        const height = size.y;
        const maxWidth = max.x;
        const maxHeight = max.y;

        const top = center.x - width/2;
        const left = center.y - height/2;
        let top_left = new $.Point(top,left);
        
        const bottom = center.x + width/2;
        const right = center.y + height/2;
        let bottom_right = new $.Point(bottom,right);

        top_left.x = adjust(top_left.x,0,maxWidth);
        top_left.y = adjust(top_left.y,0,maxHeight);

        bottom_right.x = adjust(bottom_right.x,0,maxWidth);
        bottom_right.y = adjust(bottom_right.y,0,maxHeight);

        return isPoint ? 
            new $.Rect(center.x, center.y, 0, 0) : 
            new $.Rect(top_left.x, top_left.y, bottom_right.x-top_left.x, bottom_right.y-top_left.y);
    }
    function adjust(a, min, max){
        if(a < min)
            return min;
        if(a > max )
            return max;
        return a;
    }

    // function (){

    // }
    // $.PatchManager.prototype = {

    //     /**
    //      * [add description]
    //      */
    //     add:function(centerPoint, nodeType){
    //         // calculate boundaries
            
    //         //  
    //     },
    //     remove:function(element){

    //     }
    // };
    

    /**
     * [Patch description]
     */
    $.Patch = function(options){ // base on images
        // options:{
        //     [color: String],
        //     center: OpenSeadragon.Point,
        //     size: OpenSeadragon.Point,// Point: - center point
        //     viewer: OpenSeaDragon.Viewer,
        //     [data:''];
        //     //  create Id 
        // }
        if(!validatePatchOptions(options)) return;
        this.viewer = options.viewer;

        this.events = {
        	//
        	//resizeStart:this.resize_start.bind(this),
        	resizing:this.resizing.bind(this),
        	moving:this.moving.bind(this),
        	//resizeEnd:this.resize_end.bind(this),
        	//
            clickOnPatch:this._click_on_patch.bind(this),
            clickOnColor:this._click_on_color.bind(this),
            clickOnNote:this._click_on_note.bind(this),
            clickOnRemove:this._click_on_remove.bind(this),
        }

        // create random id
        this.id = randomId();
        // element
        this.element = document.createElement('div');
        this.element.id = this.id;

        const rect = getRect(options.center, options.size, options.viewer, options.isPoint);
        this.color = options.color;
        this.data =  options.data || '';
        // create ui part    
        if(options.isPoint){
            createPointElement(this.element, options);
        }else{
            createPatchElement(this.element, rect, options);
        }

        // add to viewer
        this.viewer.addOverlay({
            element: this.element,
            location: rect,
            checkResize: false//this.viewer.viewport.imageToViewportRectangle(rect)

        });


        // get overlay object
        this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
        
        // record the zoom level
        this.zoom = this.viewer.viewport.getZoom();
        
        if(!options.isPoint)this.setSizeText();

        // create color picker
        const box = this.element.querySelector('.color');
        const input = this.element.querySelector('.color input');
        const element = this.element;
        box.setAttribute('data-color', input.value);
        this.picker = new CP(box);
        this.picker.on('change',function(color){
            color = `#${color}`;
            box.style.background = color;
            input.value = color;
            element.style.borderColor = color;
        }) 

        // add events
        this.element.addEventListener('click',this.events.clickOnPatch);
        this.element.querySelector('.remove').addEventListener('click',this.events.clickOnRemove);
        this.element.querySelector('.note').addEventListener('click',this.events.clickOnNote);
        this.element.querySelector('.color').addEventListener('click',this.events.clickOnColor);
        
        // moving patch
        this.innerTracker = new $.MouseTracker({
            element:     this.element,
            dragHandler: this.events.moving
        });


        // adjust the size of patch
        if(!options.isPoint){
            const resizeIcon = this.element.querySelector('.corner');
    		this.innerTracker = new $.MouseTracker({
    			element:     resizeIcon,
    			dragHandler: this.events.resizing
    		});
        }
        // 
        this.active();

    }

    $.Patch.prototype.setSizeText = function(){
    	const info = this.element.querySelector('.info_block');
    	const rect = this.viewer.viewport.viewportToImageRectangle(this.overlay.getBounds(this.viewer.viewport));
    	this.element.querySelector('.info_block').textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}px`; 
    } 

    $.Patch.prototype.moving = function(e){
    	const delta = this.viewer.viewport.deltaPointsFromPixels(e.delta, true);
		const top_left = this.viewer.viewport.viewportToImageCoordinates(new $.Point(
				this.overlay.location.x + delta.x, 
				this.overlay.location.y + delta.y
			));
		const bottom_right = this.viewer.viewport.viewportToImageCoordinates(new $.Point(
				this.overlay.location.x + delta.x + this.overlay.width, 
				this.overlay.location.y + delta.y + this.overlay.height
			));
		const image1 = this.viewer.world.getItemAt(0);
		const imgWidth = image1.source.dimensions.x;
		const imgHeight = image1.source.dimensions.y;

		if(top_left.x < 0 || top_left.y < 0 || bottom_right.x > imgWidth|| bottom_right.y > imgHeight) return;

		this.overlay.location.x += delta.x; 
		this.overlay.location.y += delta.y;
	    this.overlay.drawHTML(this.viewer.overlaysContainer,this.viewer.viewport);
    	this.viewer.pmanager.isCreatePatch = false;
    }
 	
 	$.Patch.prototype.resizing = function(e){
	    const img_point = this.viewer.viewport.windowToImageCoordinates(new $.Point(e.originalEvent.clientX,e.originalEvent.clientY));
	    const view_point = this.viewer.viewport.windowToViewportCoordinates(new $.Point(e.originalEvent.clientX,e.originalEvent.clientY));
		const image1 = this.viewer.world.getItemAt(0);
		const imgWidth = image1.source.dimensions.x;
		const imgHeight = image1.source.dimensions.y;
	    
	    if(0 > img_point.x || imgWidth < img_point.x || 0 > img_point.y || imgHeight < img_point.y) return;
	    const delta = this.viewer.viewport.deltaPointsFromPixels(e.delta, true);
	    
	    const width = this.overlay.width + delta.x;
	    const height = this.overlay.height + delta.y;

	    const sizeInScreen = this.viewer.viewport.deltaPixelsFromPoints(new $.Point(width,height)); // 24 X 24 pixel
	    //console.log(e.delta, delta, width, height, sizeInScreen);
	    if(sizeInScreen.x > 42){
	    	this.overlay.width = width;
	    }
	    if(sizeInScreen.y > 42){
	    	this.overlay.height = height;
	    }
	    this.overlay.drawHTML(this.viewer.overlaysContainer,this.viewer.viewport);
        this.setSizeText();
	    this.viewer.pmanager.isCreatePatch = false;
 		
    }  
    /* resize end */
    $.Patch.prototype._click_on_patch = function(e){
        // close color
        this.closeColorPicker();
        // close note panel
        this.closeNotePanel();
        // active current patch
        this.active();

        e.stopPropagation();
        e.preventDefault();

    };
    $.Patch.prototype._click_on_note = function(e){
        this.closeColorPicker();
        this.openNotePanel();
        e.stopPropagation();
        e.preventDefault();
    };
    $.Patch.prototype._click_on_color = function(e){
        this.closeNotePanel();
        this.openColorPicker();
        e.stopPropagation();
        e.preventDefault();

    };
    $.Patch.prototype._click_on_remove = function(e){
        this.closeNotePanel();
        this.closeColorPicker();
        this.remove();
        e.stopPropagation();
        e.preventDefault();
    };

    $.Patch.prototype.active = function(){
        if(this.viewer.pmanager.activePatch) this.viewer.pmanager.activePatch.deactive();
        this.element.classList.add('active');
        this.viewer.pmanager.activePatch = this;
    }

    $.Patch.prototype.deactive = function(){
    	this.closeColorPicker();
    	this.closeNotePanel();
    	this.element.classList.remove('active');
    	this.viewer.pmanager.activePatch = null;
    }
    
    $.Patch.prototype.openNotePanel = function(e){
        this.viewer.innerTracker.keyHandler = null;
        this.element.querySelector('.note_panel').style.display = 'block';
        this.element.querySelector('.note_panel textarea').focus();
    }
    
    $.Patch.prototype.closeNotePanel = function(e){
        this.element.querySelector('.note_panel').style.display = '';
    }

    $.Patch.prototype.openColorPicker = function(e){
        this.picker.enter();
    }
    
    $.Patch.prototype.closeColorPicker = function(e){
        this.picker.exit();
    }    
    $.Patch.prototype.remove = function(){
        this.viewer.removeOverlay(this.overlay.element); 
        this.deactive();
        this.overlay.destroy();
        this.destroy();
    }

    $.Patch.prototype.destroy = function(){
        // remove this patch from
        const index = this.viewer.pmanager.patches.indexOf(this);
        if(index != -1)
        this.viewer.pmanager.patches.splice(index,1);
        console.log(index);
        console.log(`${this.id}:destroy`);

    }
    $.Patch.prototype.templateOptions = function(){
    	return {
    		data:this.element.querySelector('.note_panel textarea').value,
			size:new $.Point(this.overlay.width,this.overlay.height),
			viewer:this.viewer,
			color:this.element.querySelector('.color input').value
    	}
    }

    function createPatchElement(elt, rect, options){
        elt.classList.add('patch');
        elt.style.borderColor = options.color;
        const info = document.createElement('div');
        info.classList.add('info_block');

        elt.appendChild(info);
        // controls
        
        // remove
        const clear = document.createElement('div');
        clear.classList.add('material-icons');
        clear.classList.add('remove');
        clear.textContent = 'clear';
        elt.appendChild(clear);
        
        // note
        const create = document.createElement('div');
        create.classList.add('material-icons');
        create.classList.add('note');
        create.textContent = 'create';
        elt.appendChild(create);
        
        // note panel
        const note_panel = document.createElement('div');
        note_panel.classList.add('note_panel');
        const textarea = document.createElement('textarea');
        textarea.textContent = options.data;
        note_panel.appendChild(textarea);
        elt.appendChild(note_panel);

        // corner
        const corner = document.createElement('div');
        corner.classList.add('material-icons');
        corner.classList.add('corner');
        //corner.textContent = 'rounded_corner';
        corner.textContent = 'signal_cellular_4_bar';
        elt.appendChild(corner);
        
        // color
        const color = document.createElement('div');
        color.classList.add('color');
        const input = document.createElement('input');
        input.type = 'text';
        input.textContent = options.color;
        input.value = options.color;
        color.style.background = options.color;
        color.appendChild(input);
        elt.appendChild(color);
    }

    function createPointElement(elt, options){
        elt.classList.add('patch');
        elt.classList.add('dot');


        //color
        // color
        const dot = document.createElement('div');
        dot.classList.add('color');
        const input = document.createElement('input');
        input.type = 'text';
        input.textContent = options.color;
        input.value = options.color;
        dot.style.background = options.color;
        dot.appendChild(input);
        elt.appendChild(dot);

        // const dot = document.createElement('div');
        // dot.classList.add('dot');
        // elt.appendChild(dot);
        
        const controls = document.createElement('div');
        controls.classList.add('controls');
        elt.appendChild(controls);

        // const info = document.createElement('div');
        // info.classList.add('info_block');
        // controls.appendChild(info);
        // controls
        
        // remove
        const clear = document.createElement('div');
        clear.classList.add('material-icons');
        clear.classList.add('remove');
        clear.textContent = 'clear';
        controls.appendChild(clear);
        
        // note
        const create = document.createElement('div');
        create.classList.add('material-icons');
        create.classList.add('note');
        create.textContent = 'create';
        controls.appendChild(create);
        
        // note panel
        const note_panel = document.createElement('div');
        note_panel.classList.add('note_panel');
        const textarea = document.createElement('textarea');
        textarea.textContent = options.data;
        note_panel.appendChild(textarea);
        controls.appendChild(note_panel);

    }


    $.Patch.prototype.updateColor = function(){}
    $.Patch.prototype.updatePositionAndSize = function(){}
    $.Patch.prototype.updatePosition = function(){}
    $.Patch.prototype.updateInfo = function(){}
    
    function validatePatchOptions(options){
        if(!options.color){
            console.error(`invalid options:color`);
            return false;
        }
        if(!options.center || !(options.center instanceof OpenSeadragon.Point)){
            console.error(`invalid options:center`);
            return false;
        }
        if(!options.size || !(options.size instanceof OpenSeadragon.Point)){
            console.error(`invalid options:size`);
            return false;
        }
        if(!options.viewer || !(options.viewer instanceof OpenSeadragon.Viewer)){
            console.error(`invalid options:viewer`);
            return false;
        }
        this.viewer = options.viewer;


        return true;
    } 

})(OpenSeadragon);

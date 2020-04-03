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
            press:_press.bind(this),
            click:_click.bind(this),
            dragEnd:_drag_end.bind(this)//,
            //zoom:zoom.bind(this)
        }
        this.isOn = options.isOn || false;
        this.isPoint = false;
        this.isCreatePatch = true;
        this.viewer = options.viewer;
        const {x, y, width, height} = this.viewer.viewport.imageToViewportRectangle(new OpenSeadragon.Rect(0, 0, 1024, 1024));
        this.width = width;
        this.height = height;

        //this.status
        this.patches = [];

        this.activePatch = null;

        this.selection = options.selection || null;

        // save key handler
        this.keyHandler = this.viewer.innerTracker.keyHandler;

        var image1 = this.viewer.world.getItemAt(0);
        this.imgWidth = image1.source.dimensions.x;
        this.imgHeight = image1.source.dimensions.y;

        if(this.isOn) this.on();
        // this.viewer.addHandler('zoom', this.events.zoom);
        // this.viewer.addHandler('canvas-click', this.events.click);
        // this.viewer.addHandler('canvas-press', this.events.press);
        // this.viewer.addHandler('canvas-drag-end', this.events.dragEnd);
        //this.viewer.addHandler('zoom', this.events.zoom);
    
    }

    $.PatchManager.prototype.on = function(){
        // stop turning on labeling mode if already turn on
        if(this.isOn === true) return;
        this.isOn = true; 
        
        // add mouse events
        this.viewer.addHandler('zoom', this.events.zoom);
        this.viewer.addHandler('canvas-click', this.events.click);
        this.viewer.addHandler('canvas-press', this.events.press);
        this.viewer.addHandler('canvas-drag-end', this.events.dragEnd);
        
    };
    $.PatchManager.prototype.hasPatches = function(){
        return this.patches.length?true:false;
    }
    $.PatchManager.prototype.off = function(){
        // stop turning off labeling mode if already turn off
        if(this.isOn === false) return;
        this.isOn = false;

        // remove mouse events
        this.viewer.removeHandler('zoom', this.events.zoom);
        this.viewer.removeHandler('canvas-click', this.events.click);
        this.viewer.removeHandler('canvas-press', this.events.press);
        this.viewer.removeHandler('canvas-drag-end', this.events.dragEnd);
        
    };

    $.PatchManager.prototype.initPathStates = function(){
        this.patches.forEach(patch => {
            patch.closeNotePanel();
            patch.closeColorPicker();
        });
    }

    $.PatchManager.prototype.addPatch = function(center, noteType){
        const _patch = document.createElement('div');

        const rect = getRect(img_point,noteType.model.width,noteType.height,this.imgWidth,this.imgHeight,this.viewer);
    }

    $.PatchManager.prototype.exportPatchesAsJSON = function(coordinates='normalize'){
        return this.patches.map(p=>p.toJSON(coordinates))
    }

    function _press(e){
        this.isCreatePatch = true;
        this.initPathStates();
    }
    function _drag_end(e){
        this.isCreatePatch = false;
        //if(this.activePatch) this.activePatch.deactive();
    }
    function zoom(e){
        //this.isCreatePatch = false;
        //if(this.activePatch) this.activePatch.deactive();
    }

    function _click(e){
        // if(this.activePatch){
        //     this.activePatch.deactive();
        //     return
        // }

        const img_point = this.viewer.viewport.windowToImageCoordinates(new $.Point(e.originalEvent.clientX,e.originalEvent.clientY));
        const view_point = this.viewer.viewport.windowToViewportCoordinates(new $.Point(e.originalEvent.clientX,e.originalEvent.clientY));

        if(0 > img_point.x || this.imgWidth < img_point.x || 0 > img_point.y || this.imgHeight < img_point.y || !this.isCreatePatch) return;
        

        this.viewer.innerTracker.keyHandler = this.keyHandler;
        
        

        // create new one
        let options = {
            data:'',
            size:new $.Point(this.width, this.height),
            center:view_point,
            viewer:this.viewer,
            color:'#7cfc00'
        };

        if(this.activePatch){
            options = this.activePatch.templateOptions(options);
            options.center = view_point;
            if(!this.isPoint && this.activePatch.isPoint){
                options.size = new $.Point(this.width, this.height);
            }
        }else if(this.patches[this.patches.length-1]){
            options = this.patches[this.patches.length-1].templateOptions(options);
            options.center = view_point;
        }

        options.isPoint = this.isPoint;
        options.manager = this;
        console.log('options:',options);
        this.patches.push(new $.Patch(options));
    }

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
        this.isPoint = options.isPoint;
        // create random id
        this.id = randomId();
        // element
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.manager = options.manager;
        

        const rect = getRect(options.center, options.size, options.viewer, options.isPoint);
        this.color = options.color;

        // only for note is list (select)
        this.selIdx = options.selIdx || 0;
        if(this.manager&&this.manager.selection&&this.manager.selection[0]&&this.manager.selection[0].color){
            options.color = this.color = this.manager.selection[this.selIdx].color;
        }

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
            checkResize: false
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
            const ctrl = element.querySelector('.controls');
            if(ctrl) ctrl.style.borderColor = color;
        }) 

        // create selector event
        if(this.manager&&this.manager.selection){
            const hasColor = this.manager.selection[0].color?true:false;
            const sel = element.querySelector('.note_panel select');
            sel.selectedIndex = +this.selIdx;
            sel.addEventListener('change',function(e){
                // set color
                if(!hasColor) return;
                const color = this.manager.selection[sel.selectedIndex].color;
                box.style.background = color;
                input.value = color;
                element.style.borderColor = color;
                const ctrl = element.querySelector('.controls');
                if(ctrl) ctrl.style.borderColor = color;
            }.bind(this))
            if(hasColor&&!this.isPoint) this.element.querySelector('.color').style.display = 'none';
        }

        // trackers
        this.patchTrackers = {};

        // add events
        const removeIcon = this.element.querySelector('.remove');
        const noteIcon = this.element.querySelector('.note');
        const colorIcon = this.element.querySelector('.color');

        this.patchTrackers['element'] = new $.MouseTracker({
            element: this.element,
            pressHandler: press.bind(this),
            dragHandler: moving.bind(this)

        });


        this.patchTrackers['remove'] = new $.MouseTracker({
            element:     removeIcon,
            pressHandler: press.bind(this),
            releaseHandler: clickOnRemove.bind(this)
        });

        
        this.patchTrackers['color'] = new $.MouseTracker({
            element:     colorIcon,
            pressHandler: press.bind(this),
            releaseHandler: clickOnColor.bind(this)
        });
        if(this.manager&&this.manager.selection&&this.manager&&this.manager.selection[0].color&&this.isPoint) this.patchTrackers['color'].setTracking(false);

        this.patchTrackers['note'] = new $.MouseTracker({
            element:     noteIcon,
            pressHandler: press.bind(this),
            releaseHandler: clickOnNote.bind(this)
        });

        const notePanel = this.element.querySelector('.note_panel');
        this.patchTrackers['note_panel'] = new $.MouseTracker({
            element:     notePanel
        });

        // adjust the size of patch
        if(!options.isPoint){
            const resizeIcon = this.element.querySelector('.corner');
            this.patchTrackers['resizing'] = new $.MouseTracker({
                element:     resizeIcon,
                pressHandler: press.bind(this),
                dragHandler: resizing.bind(this)
            });
        }

        this.active();

    }

    $.Patch.prototype.setSizeText = function(e){
        const info = this.element.querySelector('.info_block');
        const rect = this.viewer.viewport.viewportToImageRectangle(this.overlay.getBounds(this.viewer.viewport));
        this.element.querySelector('.info_block').textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}px`; 
    }

    function createSelector(options){
        const sel = document.createElement('select');
        sel.size = options.length;
        options.forEach((opt,idx) => {
            const option = document.createElement('option');
            option.text = opt.text;
            option.value = opt.value!=undefined?opt.value:idx;
            sel.appendChild(option);
        });
        return sel;
    }



    function moving(e){
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
    
    function resizing(e){
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
    function press(e){
        this.closeNotePanel();
        this.closeColorPicker();
        this.active();
    }
    function clickOnNote(e){
        this.openNotePanel();
        // e.stopPropagation();
        // e.preventDefault();
    };
    function clickOnColor(e){
        this.openColorPicker();
        // e.stopPropagation();
        // e.preventDefault();

    };
    function clickOnRemove(e){
        this.remove();
        // e.stopPropagation();
        // e.preventDefault();
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
        if(this.manager.selection){
            this.element.querySelector('.note_panel select').focus();
        }else{
            this.element.querySelector('.note_panel textarea').focus(); 
        }
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
        
        this.deactive();

        this.viewer.removeOverlay(this.overlay.element); 
        this.overlay.destroy();
        this.destroy();
    }

    $.Patch.prototype.destroy = function(){
        // remove this patch from
        const index = this.viewer.pmanager.patches.indexOf(this);
        if(index != -1)
        this.viewer.pmanager.patches.splice(index,1);
    }
    
    $.Patch.prototype.templateOptions = function(){
        const options = {
            size:new $.Point(this.overlay.width,this.overlay.height),
            viewer:this.viewer,
            color:this.element.querySelector('.color input').value
        }
        if(this.manager&&this.manager.selection){
            options.data = this.element.querySelector('.note_panel select option:checked').text;
            options.selIdx = +this.element.querySelector('.note_panel select').selectedIndex;
        }else{
            options.data = this.element.querySelector('.note_panel textarea').value;
        }
        return options;
    }

    $.Patch.prototype.toJSON = function(coordinates = 'normalize'){ // l/image
        return {
            note:this.element.querySelector('.note_panel textarea').value,
            color:this.element.querySelector('.color input').value,
            isPoint:this.isPoint,
            size:this.getRect(coordinates),
            widthInClient:this.element.offsetWidth
            //,
            //size:this.getRect(coordinates)
        }
    }
    /**
     * getBounds 
     * @param  {String} coordinates coordinates system. Default value is 'normalize'. There are two opinions: 'normalize' and 'image'.
     * @return {Array}  
     *         if a patch is point return position point [x,y].
     *         if a patch is rectangle return polygon description points [top-left, top-right, bottom-right, bottom-left].        
     */
    $.Patch.prototype.getBounds = function(coordinates = 'normalize'){ // normalize or image
        const imagingHelper = this.viewer.imagingHelper;
        const bounds = this.overlay.getBounds(this.viewer);

        const x = bounds.x; // x in logical/normalize
        const y = bounds.y * imagingHelper.imgAspectRatio; // y in logical/normalize
        const width = bounds.width; // width in logical/normalize
        const height = bounds.height * imagingHelper.imgAspectRatio; // height in logical/normalize

        if(this.isPoint){
            return coordinates == 'normalize'?[x,y]:[Math.round(imagingHelper.logicalToDataX(x)),Math.round(imagingHelper.logicalToDataY(y))];
        }else{
            const x1 = x + width;
            const y1 = y + height;
            return coordinates == 'normalize'?
            [[x,y],[x1,y],[x1,y1],[x,y1]]:
            [
                [
                    Math.round(imagingHelper.logicalToDataX(x)),
                    Math.round(imagingHelper.logicalToDataY(y))
                ],
                [
                    Math.round(imagingHelper.logicalToDataX(x1)),
                    Math.round(imagingHelper.logicalToDataY(y))
                ],
                [
                    Math.round(imagingHelper.logicalToDataX(x1)),
                    Math.round(imagingHelper.logicalToDataY(y1))
                ],
                [
                    Math.round(imagingHelper.logicalToDataX(x)),
                    Math.round(imagingHelper.logicalToDataY(y1))
                ]
            ];

        }
    }

    $.Patch.prototype.getRect = function(coordinates = 'normalize'){ // normalize or image
        if(coordinates == 'normalize'){
            const bounds = this.overlay.getBounds(this.viewer);
            const imagingHelper = this.viewer.imagingHelper;
            const x = bounds.x; // x in logical/normalize
            const y = bounds.y * imagingHelper.imgAspectRatio; // y in logical/normalize
            const width = bounds.width; // width in logical/normalize
            const height = bounds.height * imagingHelper.imgAspectRatio; // height in logical/normalize
            return this.isPoint?{x:x,y:y}:{x:x,y:y,width:width,height:height};
        }else{
            const bounds = this.viewer.viewport.viewportToImageRectangle(this.overlay.getBounds(this.viewer.viewport));
            return this.isPoint?{x:Math.round(bounds.x),y:Math.round(bounds.y)}:{x:Math.round(bounds.x),y:Math.round(bounds.y),width:Math.round(bounds.width),height:Math.round(bounds.height)};
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

        if(options.manager&&options.manager.selection && Array.isArray(options.manager.selection)){    
            const selector = createSelector(options.manager.selection);
            note_panel.appendChild(selector);
        }else{
            const textarea = document.createElement('textarea');
            textarea.textContent = options.data;
            note_panel.appendChild(textarea);
        }

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
        
        const controls = document.createElement('div');
        controls.classList.add('controls');
        controls.style.borderColor = options.color;
        elt.appendChild(controls);
        
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
        
        if(options.manager&&options.manager.selection && Array.isArray(options.manager.selection)){    
            const selector = createSelector(options.manager.selection);
            note_panel.appendChild(selector);
        }else{
            const textarea = document.createElement('textarea');
            textarea.textContent = options.data;
            note_panel.appendChild(textarea);
        }
        controls.appendChild(note_panel);

    }
    
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

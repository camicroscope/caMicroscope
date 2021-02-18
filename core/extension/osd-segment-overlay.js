//osd-segment-overlay.js
/**
 * @constructor
 * OpenSeadragon segment Plugin 0.0.1.
 */
(function($){
    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }

    // check version
    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonScalebar requires ' +
                'OpenSeadragon version 2.2.0+');
    }
    $.Viewer.prototype.createSegment = function(options) {
        if (!this.segment) {
            options = options || {};
            options.viewer = this;
            this.segment = new $.Segment(options);
        } else {
            this.segment.updateOptions(options);
        }
    };

    $.Segment = function(options) {
        this._viewer = options.viewer;

        this._loading = createLoading();


        // necessary Options
        this._store = options.store;
        this._slide = options.slide;
        this._data = options.data || []; // [{id,data[...]}...]
        //this._editedData = options.editedData || [];
        this.mode = options.mode || 'stroke'; // 'fill' 'broke'
        this._minFootprint = options.minFootprint || 9;
        // set default options' values if no corresponding values.



        this._offset = [null, null];
        this._interval = null;
        this._intervalTime = options.intervalTime || 300;

        this.events = {
            updateView:this.updateView.bind(this),
            zooming:this._zooming.bind(this),
            panning:this._panning.bind(this)
        };

        // create a container div and set the default attributes
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        this._div.style.width = '150%';
        this._div.style.height = '150%';
        this._div.style.transformOrigin = '0 0';
        this._div.style.transform = 'scale(1,1)';
        this._div.style.zIndex =  options.zIndex || 99;
        this._div.style.opacity = options.opacity || 1;//0.8;

        this._viewer.canvas.appendChild(this._div);

        // create display_canvas
        this._display_ = document.createElement('canvas');
        this._display_.style.position = 'absolute';
        this._display_.style.top = 0;
        this._display_.style.left = 0;
        this._display_ctx_ = this._display_.getContext('2d');
        this._div.appendChild(this._display_);


        this._isOn = false;



        // turn on
        if(this._data.length > 0) this.on();
        else this.off();
        // get the position of the current center points
        this._center = this._viewer.viewport.getCenter(true);

    }



    $.Segment.prototype = {
        updateOptions:function(options){

            // necessary Options
            this._data = options.data || this._data;
            this.mode = options.mode || this.mode; // two modes - 'fill' : 'stroke'

            this._offset = [null, null];
            this._interval = null;


            this._intervalTime = options.intervalTime || 300;

            this.events = {
                updateView:this.updateView.bind(this),
                zooming:this._zooming.bind(this),
                panning:this._panning.bind(this)
            };

            // create a container div and set the default attributes
            // create display_cancavs
            this._display_.style.position = 'absolute';
            this._display_.style.top = 0;
            this._display_.style.left = 0;
            this._display_ctx_ = this._display_.getContext('2d');
            this._isOn = false;

            // turn on the segment
            if(this._data.length > 0) this.on();
             else this.off();
            // get the position of the current center points
            this._center = this._viewer.viewport.getCenter(true);
        },

        /**
         * turn on the segment
         */
        on:function(isDraw = true){
            if(this._isOn) return;

            // show segment
            this._div.style.display = '';
            // add events
            this._viewer.addHandler('resize',this.events.updateView);
            this._viewer.addHandler('pan',this.events.panning);
            this._viewer.addHandler('zoom',this.events.zooming);
            this._viewer.addHandler('animation-finish', this.events.updateView);

            // draw segment immediately
            if(isDraw)this.updateView(0);

            // set on/off flag to true
            this._isOn = true;
        },

        /**
         * turn off the segment
         */
        off:function(){
            if(!this._isOn) return;

            // remove events
            this._viewer.removeHandler('resize',this.events.updateView);
            this._viewer.removeHandler('pan',this.events.panning);
            this._viewer.removeHandler('zoom',this.events.zooming);
            this._viewer.removeHandler('animation-finish', this.events.updateView);

            // hidden segment
            this._div.style.display = 'none';

            // set on/off flag to false
            this._isOn = false;
        },

        /**
         * setOpacity
         * set the opacity for the canvas div.
         * @param {Number} num the value of the opacity
         */
        setOpacity:function(num){
            // valid num [0 , 1]
            if(1 < num || 0 > num ){
                console.warn(`segment.setOpacity: Invalid Opacity`);
                return;
            }
            this._div.style.opacity = num;
        },

        /**
         * change the mode of segment
         * @param  {String} mode 'binal' or 'gradient'
         */
        changeMode:function(mode){
            if(this.mode == mode) return;
            this.mode = mode;
            this.drawOnCanvas();
        },

        /**
         * it will be called when viewport zooming.
         * This method is for optimized UX.
         */
        _zooming:function(e){
            // get the scaling original point on the screen
            if(!e.refPoint || e.zoom > this._viewer.viewport.getMaxZoom() || e.zoom < this._viewer.viewport.getMinZoom()) return;
            if(e.refPoint === true){
                // get the current center to set as an referent point if there is no referent point
                e.refPoint = this._viewer.viewport.getCenter(true);
            }
            // the referent point on the screen.
            const viewerElement = this._viewer.viewport.viewportToViewerElementCoordinates(e.refPoint);
            // get current zoom value.
            var viewportZoom = this._viewer.viewport.getZoom();
            var zoom = this._viewer.viewport.viewportToImageZoom(e.zoom);

            // calculate the scaling value
            var scale = viewportZoom/this._zoom;
            // ignore scaling if the value to small
            if(scale == 1 || Math.abs(1 - scale) < 0.01) return;
            // scaling view
            this._div.style.transformOrigin = `${this._offset[0] + viewerElement.x}px ${this._offset[1] + viewerElement.y}px`;
            this._div.style.transform = `scale(${scale},${scale})`;
        },

        /**
         * it will be called when viewport panning.
         * This method is for optimized UX.
         */
        _panning:function(e){

            // delta distance/ the actual moving distance(normalized coordinate)
            let dx = this._center.x - e.center.x;
            let dy = this._center.y - e.center.y;

            // convert distance form normalized/logical to screen/physical
            const distance = this._viewer.viewport.deltaPixelsFromPoints(new $.Point(dx,dy), true);

            // ignore if moving distance too small
            if(Math.abs(distance.x) < 0.01 && Math.abs(distance.y) < 0.01) return;

            // transform the top and left position of the canvas div
            let top = parseFloat(this._div.style.top);
            let left = parseFloat(this._div.style.left);

            // set transform position
            this._div.style.top = `${top + distance.y}px`;
            this._div.style.left = `${left + distance.x}px`;
            this._center = e.center;
        },

        addSegmentId:function(segmentId){
            const index = this._data.findIndex(d=>d.id==segmentId);
            if(index!=-1) return;
            this._data.push({id:segmentId,data:null});
            this.on(false);
            this.resize();
            const {x, y, width, height} = this.getCanvasBoundBox();
            const footprint = getMinFootprint(this._viewer.imagingHelper,this._minFootprint);
            // start
            this.startLoading();
            this._store.findMark(this._slide, segmentId, footprint, null, x, x+width, y, y+height).then(function(segments){
                this._data[this._data.length-1].data = [...segments];
                // redraw
                this.stopLoading();
                this.drawOnCanvas();
            }.bind(this));
        },

        removeSegmentId:function(segmentId){
            const index = this._data.findIndex(d=>d.id==segmentId);
            if(index==-1) return;
            this._data.splice(index,1);
            if(this._data.length==0) this.off();
            // redraw
            this.resize();
            this.drawOnCanvas();
        },
        /**
         * getViewBoundBox
         * get the current bound box of the view in the normalized coordinate system.
         * @return {Object} bbox which has x, y, width, height;
         */
        getViewBoundBox:function(){
            const {x,y} = this._viewer.imagingHelper._viewportOrigin;
            const width = this._viewer.imagingHelper._viewportWidth;
            const height = this._viewer.imagingHelper._viewportHeight;
            return {x,y,width,height};
        },

        /**
         * getCanvasBoundBox
         * get the current bound box of the canvas in the normalized coordinate system.
         * @return {Object} bbox which has x, y, width, height;
         */
        getCanvasBoundBox:function(){
            const x = this._viewer.imagingHelper.physicalToLogicalX(-this._offset[0]);
            const y = this._viewer.imagingHelper.physicalToLogicalY(-this._offset[1]);
            const width = physicalToLogicalDistanceX(this._viewer.canvas.clientWidth + 2*this._offset[0], this._viewer.imagingHelper);
            const height = physicalToLogicalDistanceY(this._viewer.canvas.clientHeight + 2*this._offset[1], this._viewer.imagingHelper);

            return {x,y,width,height};
        },

        /**
         * update view/segment
         * @param  {Number} the debounce time (in milliseconds) to draw
         */
        updateView:function(time){
            time = isNaN(time)?this._intervalTime:time;
            clearTimeout(this._interval);
            this._interval = setTimeout(function(){
                if(this._data.length==0){
                    //this.resize();
                    //this.drawOnCanvas();
                    return;
                }
                const {x, y, width, height} = this.getCanvasBoundBox();
                const footprint = getMinFootprint(this._viewer.imagingHelper,this._minFootprint);
                // start
                this.startLoading();
                const ids = this._data[this._data.length-1].id;
                this._store.findMark(this._slide, ids, footprint, null, x, x+width, y, y+height).then(function(segments){
                    this._data[this._data.length-1].data = [...segments];
                    this.stopLoading();
                    // redraw
                    this.resize();
                    this.drawOnCanvas();
                }.bind(this));



            }.bind(this),time);
        },
        /**
         * reset viewport and canvas css attributes if window resize or viewport changed
         */
        resize:function(){
            // resize the canvas size
            this._display_.width = this._div.clientWidth;
            this._display_.height = this._div.clientHeight;

            // get the offset[x,y] in pixel
            this._offset[0] = (this._div.clientWidth - this._viewer.canvas.clientWidth)*0.5;
            this._offset[1] = (this._div.clientHeight - this._viewer.canvas.clientHeight)*0.5;

            // set the current position for the canvas div
            this._div.style.left = `${-this._offset[0]}px`;
            this._div.style.top = `${-this._offset[1]}px`;
            // reset the origin point and scale
            this._div.style.transformOrigin = '0 0';
            this._div.style.transform = 'scale(1,1)';

            // recording the current center and zoom
            this._center = this._viewer.viewport.getCenter(true);
            this._zoom = this._viewer.viewport.getZoom(true);

            // get the current canvas bounding box under the normalized coordinate
            this._getCanvasBoundBox = this.getCanvasBoundBox();
            // TODO filter with view boundaries
            //this._t_data = this.data.filter(this.viewBoundFilter,this);
        },
        startLoading:function(){
            if(this._viewer.container.contains(this._loading)) return;
            this._viewer.container.appendChild(this._loading);
        },
        stopLoading:function(){
            if(!this._viewer.container.contains(this._loading)) return;
            this._viewer.container.removeChild(this._loading);
        },
        /**
         * According to the data, thresholds and the size of current screen, draw the segment
         */
        drawOnCanvas:function(){
            // clear canvas before draw
            DrawHelper.clearCanvas(this._display_);
            if(this._data.length == 0 || this._isOn==false) return;
            const ctx = this._display_ctx_;
                this._data.forEach(d=>{
                    d.data.forEach(segment=>{
                        const polygon = segment.geometries.features[0];
                        const points = polygon.geometry.coordinates[0];
                        const style = polygon.properties.style;

                        // default coordinate is 'normalized'
                        let convertX = this._viewer.imagingHelper.logicalToPhysicalX.bind(this._viewer.imagingHelper);
                        let convertY = this._viewer.imagingHelper.logicalToPhysicalY.bind(this._viewer.imagingHelper);
                        // if coordinate is 'image'
                        if(segment.provenance &&
                            segment.provenance.analysis &&
                            segment.provenance.analysis.coordinate &&
                            segment.provenance.analysis.coordinate == 'image'){
                                convertX = this._viewer.imagingHelper.dataToPhysicalX.bind(this._viewer.imagingHelper);
                                convertY = this._viewer.imagingHelper.dataToPhysicalY.bind(this._viewer.imagingHelper);                          
                        }
                        this._display_ctx_.lineJoin = style.lineJoin;
                        this._display_ctx_.lineCap = style.lineCap;
                        this._display_ctx_.lineWidth = 1;

                        if(this.mode === 'fill'){
                            this._display_ctx_.fillStyle = style.color;
                        }else if(this.mode === 'stroke'){
                            this._display_ctx_.strokeStyle = style.color;
                        }
                        this._display_ctx_.beginPath()
                        // starting draw drawPolygon
                        this._display_ctx_.moveTo(
                            convertX(points[0][0]) + this._offset[0],
                            convertY(points[0][1]) + this._offset[1],
                        );

                        for (var i = 1; i < points.length-1; i++) {
                             const x = convertX(points[i][0]);
                             const y = convertY(points[i][1]);
                            this._display_ctx_.lineTo(x+this._offset[0],y+this._offset[1]);
                        }
                        this._display_ctx_.lineTo(
                            convertX(points[0][0]) + this._offset[0],
                            convertY(points[0][1]) + this._offset[1]);
                        if(this.mode === 'fill'){
                            this._display_ctx_.fill();
                        }else if(this.mode === 'stroke'){
                            this._display_ctx_.stroke();
                        }
                    },this)
                },this)
        }
    }


    /**
     * @private
     * covert the distance from screen coordinate(in pixel) to normalized coordinate in x-axis.
     * @param  {Number} width/the distance in x-axis.
     * @param  {OpenSeadragon.ImagingHelper} helper
     *
     * @return {Number}
     *         width/the distance in the normalized/Logical coordinate.
     */
    function physicalToLogicalDistanceX(width,helper){
        return helper._haveImage ? ((width / helper.getViewerContainerSize().x) * helper._viewportWidth) : 0;
    }

    /**
     * @private
     * covert the distance from screen coordinate(in pixel) to normalized coordinate in y-axis.
     * @param  {Number} width/the distance in y-axis.
     * @param  {OpenSeadragon.ImagingHelper} helper
     *
     * @return {Number}
     *         width/the distance in the normalized/Logical coordinate.
     */
    function physicalToLogicalDistanceY(height,helper){
        return helper._haveImage ? ((height / helper.getViewerContainerSize().y) * helper._viewportHeight) : 0;
    }

    /**
     * @private
     * covert the distance from normalized coordinate to screen coordinate(in pixel) in x-axis.
     * @param  {Number} width/the distance in x-axis.
     * @param  {OpenSeadragon.ImagingHelper} helper
     *
     * @return {Number}
     *         width/the distance in the Screen/Physical coordinate.
     */
    function logicalToPhysicalDistanceX(width,helper){
        return helper._haveImage ? ((width / helper._viewportWidth) * helper.getViewerContainerSize().x) : 0;
    }

    /**
     * @private
     * covert the distance from normalized coordinate to screen coordinate(in pixel) in y-axis.
     * @param  {Number} width/the distance in y-axis.
     * @param  {OpenSeadragon.ImagingHelper} helper
     *
     * @return {Number}
     *         width/the distance in the Screen/Physical coordinate.
     */
    function logicalToPhysicalDistanceY(height,helper){
        return helper._haveImage ? ((height / helper._viewportHeight) * helper.getViewerContainerSize().y) : 0;
    }

    function createLoading(){
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.borderRadius = '5px';
        div.style.border = '1px solid #155724';//#0c5460
        div.style.color = ' #155724';//'#0c5460';
        div.style.margin = '3px';
        div.style.padding = '5px';
        div.style.top = 0;
        div.style.left = 'calc(50% - 80px)';
        div.style.background = '#d4edda';//'#d1ecf1';
        div.style.fontSize = '13px';
        div.style.zIndex = 300;
        div.textContent = 'Loading Segmentation ... ';
        return div;
    }
    $.extend( $.Segment.prototype, $.EventSource.prototype);


})(OpenSeadragon)

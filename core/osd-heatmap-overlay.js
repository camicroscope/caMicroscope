//osd-heatmap-overlay.js

/**
 * @constructor
 * OpenSeadragon heatmap Plugin 0.0.1.
 * A OpenSeadragon pulgin that provides a way to show 'heatmap' overlays. 
 * @param {Object} [options]
 *        Allows configurable properties to be entirely specified by passing an options object to the constructor.
 * @param {Object} options.data
 *        A instance of viewer in Openseadragon.
 * @param {Array} options.fields
 *        A instance of viewer in Openseadragon.
 * @param {Array} options.size
 *        A instance of viewer in Openseadragon.
 * @param {Object} [zIndex=100]
 *        specifies the z-order of a positioned element
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
    $.Viewer.prototype.createHeatmap = function(options) {
        if (!this.heatmap) {
            options = options || {};
            options.viewer = this;
            this.heatmap = new $.Heatmap(options);
        } else {
           	//this.heatmap.updateOptions(options);
        }
    };

    $.Heatmap = function(options) {
        this._viewer = options.viewer;
        
        // heatmap data model
        // necessary Options 
        this._data = options.data || [];
        this._fields = createFields(options.fields);
        this._size = options.size;
        this._t_data = null;
        
        this.__thresholdingData();

        this._color = options.color || "#1034A6";
        this._offset = [null, null];
        this._interval = null;
        this._intervalTime = options.intervalTime || 300;
        // opacity

        //{
        //	name:
        //	range:
        //	threshold:	
        //}
        //this._fields = createFields(options.fields, options.ranges);

        this.events = {
            updateView:this.updateView.bind(this),
            zooming:this._zooming.bind(this),
            panning:this._panning.bind(this)
        };

        // -- create container div and display canvas -- //
        
        // create container div
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        
        this._div.style.width = '150%';
        this._div.style.height = '150%';
        this._div.style.transformOrigin = '0 0';
        this._div.style.transform = 'scale(1,1)';
        //this._div.style.display = 'none';
        this._div.style.zIndex =  options.zIndex || 100;
        //this._div.style.backgroundColor = 'blue';
        this._div.style.opacity = options.opacity || 0.8;
        this._viewer.canvas.appendChild(this._div);
        // create display_cancavs
        this._display_ = document.createElement('canvas');
        this._display_.style.position = 'absolute';
        this._display_.style.top = 0;
        this._display_.style.left = 0;
        this._display_ctx_ = this._display_.getContext('2d');
        this._div.appendChild(this._display_);

        
        this._isOn = false;




        this.on();
        






        this._center = this._viewer.viewport.getCenter(true);




    }



    $.Heatmap.prototype = {
    	on:function(){
    		if(this._isOn) return;
    		this._div.style.display = '';
    		// add events
        	this._viewer.addHandler('resize',this.events.updateView);
        	this._viewer.addHandler('pan',this.events.panning);
        	this._viewer.addHandler('zoom',this.events.zooming);
        	this._viewer.addHandler('animation-finish', this.events.updateView);

        	this.updateView(0);
        	
        	
        	this._isOn = true;
    	},
    	
    	off:function(){
    		if(!this._isOn) return;

    		// remove events
        	this._viewer.removeHandler('resize',this.events.updateView);
        	this._viewer.removeHandler('pan',this.events.panning);
        	this._viewer.removeHandler('zoom',this.events.zooming);
        	this._viewer.removeHandler('animation-finish', this.events.updateView);
        	this._div.style.display = 'none';
        	this._isOn = false;
    	},
    	
    	setThresholdByName:function(name,value){
    		const field = this._fields.find(f=> f.name === name);
    		if(field){
    			field.setThreshold(value);
    			this.__thresholdingData();
    			this.drawOnCanvas();
    		}
    	},
    	
    	__thresholdingData:function(){
    		const thresholds = this._fields.map(f=>f._threshold);
    		this._t_data = this._data.filter(d=>{
    			const p = d.slice(2);
    			return t(p,thresholds,$.gte);
    		},this);
    	},
    	/**
    	 * setOpacity
    	 * set the opacity for the canvas
    	 * @param {[type]} num [description]
    	 */
    	setOpacity:function(num){
    		// TODO valid num [0 , 1]
    		this._div.style.opacity = num;
    	},

    	setColor:function(color){
    		this._color = color;
    		this.drawOnCanvas();
    	},

        _zooming:function(e){

            if(!e.refPoint) return;
            if(e.refPoint === true){
                e.refPoint = this._viewer.viewport.getCenter(true);
            }
            const windowPoint = this._viewer.viewport.viewportToWindowCoordinates(e.refPoint);
            const image1 = this._viewer.world.getItemAt(0);
            var viewportZoom = this._viewer.viewport.getZoom();
            var zoom = image1.viewportToImageZoom(e.zoom);
            var scale = viewportZoom/this._zoom;
            if(scale == 1 || Math.abs(1 - scale) < 0.01) return; 
            this._div.style.transformOrigin = `${this._offset[0] + windowPoint.x}px ${this._offset[1] + windowPoint.y}px`;
            this._div.style.transform = `scale(${scale},${scale})`;
        },

        _panning:function(e){

            let dx = this._center.x - e.center.x;
            let dy = this._center.y - e.center.y;
            const distance = this._viewer.viewport.deltaPixelsFromPoints(new $.Point(dx,dy), true);
            if(Math.abs(distance.x) < 0.01 && Math.abs(distance.y) < 0.01) return;
            let top = parseFloat(this._div.style.top);
            let left = parseFloat(this._div.style.left);
            this._div.style.top = `${top + distance.y}px`;
            this._div.style.left = `${left + distance.x}px`;
            this._center = e.center;
        },

    	/**
    	 * getViewBoundBox
    	 * get the current bound box of the view in the normalized coordinate system. 
    	 * @return {[type]} bbox which has x, y, width, height;
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
    	 * @return {[type]} bbox which has x, y, width, height;
    	 */
    	getCanvasBoundBox:function(){
			const x = this._viewer.imagingHelper.physicalToLogicalX(-this._offset[0]);
			const y = this._viewer.imagingHelper.physicalToLogicalY(-this._offset[1]);
    		const width = physicalToLogicalDistanceX(this._viewer.canvas.clientWidth + 2*this._offset[0], this._viewer.imagingHelper);
    		const height = physicalToLogicalDistanceY(this._viewer.canvas.clientHeight + 2*this._offset[1], this._viewer.imagingHelper);
    		
    		return {x,y,width,height};
    	},

    	filter:function(d){
    		const x = d[0];
    		const y = d[1];
    		return $.isIntersectBbox(this._getCanvasBoundBox, {
    			x:x,
    			y:y,
    			width:this._size[0],
    			height:this._size[1]
    		});
    	},

    	updateView:function(time){
    		time = isNaN(time)?this._intervalTime:time;
			clearTimeout(this._interval);
            this._interval = setTimeout(function(){
    		    this.resize();
                this.drawOnCanvas();
            }.bind(this),time);
    	},
    	resize:function(){
    		
    		// resize the canvas size
    		this._display_.width = this._div.clientWidth;
    		this._display_.height = this._div.clientHeight;
    		this._offset[0] = (this._div.clientWidth - this._viewer.canvas.clientWidth)*0.5;
    		this._offset[1] = (this._div.clientHeight - this._viewer.canvas.clientHeight)*0.5;
			
			this._div.style.left = `${-this._offset[0]}px`;
        	this._div.style.top = `${-this._offset[1]}px`;
            this._div.style.transformOrigin = '0 0';
            this._div.style.transform = 'scale(1,1)';
            this._center = this._viewer.viewport.getCenter(true);
            this._zoom = this._viewer.viewport.getZoom(true);

    		this._getCanvasBoundBox = this.getCanvasBoundBox();
    	},
    	drawOnCanvas:function(){
    		console.time('filter');
    		const finalData = this._t_data.filter(this.filter,this);
    		console.timeEnd('filter');
    		//console.log(finalData.length);
    		DrawHelper.clearCanvas(this._display_);
			this._display_ctx_.fillStyle = this._color;
  			const w = logicalToPhysicalDistanceX(this._size[0],this._viewer.imagingHelper);
  			const h = logicalToPhysicalDistanceY(this._size[1],this._viewer.imagingHelper);
  			this._display_ctx_.beginPath();
			console.time('draw');
			for (let i = 0; i < finalData.length; i++) {
				let d = finalData[i];
				
				const x = this._viewer.imagingHelper.logicalToPhysicalX(d[0]);
				const y = this._viewer.imagingHelper.logicalToPhysicalY(d[1]);
				this._display_ctx_.rect(x+this._offset[0],y+this._offset[1],w,h) 
			}
			this._display_ctx_.fill();
			console.timeEnd('draw');
    	}


    }

    // private methods
    function t(p, t, func){
    	return p.reduce((acc,v,i)=>{
    		return acc&&func.call(this, v, t[i]);
    	},true);
    }

	function createFields(fields){
		return fields.map(d=>{
			return new $.Heatmap.Field(d)
		});
		
	}    
    function physicalToLogicalDistanceX(width,helper){
    	return helper._haveImage ? ((width / helper.getViewerContainerSize().x) * helper._viewportWidth) : 0;
    }
    function physicalToLogicalDistanceY(height,helper){
    	return helper._haveImage ? ((height / helper.getViewerContainerSize().y) * helper._viewportHeight) : 0;
    }
    function logicalToPhysicalDistanceX(width,helper){
    	return helper._haveImage ? ((width / helper._viewportWidth) * helper.getViewerContainerSize().x) : 0;
    }
    function logicalToPhysicalDistanceY(height,helper){
    	return helper._haveImage ? ((height / helper._viewportHeight) * helper.getViewerContainerSize().y) : 0;
    }
    $.extend( $.Heatmap.prototype, $.EventSource.prototype);

    $.isIntersectBbox = function(bbox1,bbox2){
		return (bbox2.x + bbox2.width >= bbox1.x) && 
		(bbox2.x <= bbox1.x + bbox1.width) && 
		(bbox2.y + bbox2.height>= bbox1.y) && 
		(bbox2.y <= bbox1.y + bbox1.height);
    }

    $.gte = function(value,threshold){
    	return value >= threshold;
    }
    $.gt = function(value,threshold){
    	return value >= threshold;
    }

    // TODO create Field Class to store the field's name and range
    // []
    // 	
    // 
    $.Heatmap.Field = function({name, range, threshold=0}){

    	
    	_validate(name, range, threshold)
    	
    	this.name = name; // string
    	this.range = range; // [start,end] Number
    	this._threshold = threshold; // Number [default value = 0]


    	function _validate(name,range,threshold){
    		// check on name
    		if(!name){
    			throw 'invalid Field.name';
    			return;
    		}
    		// check on range
    		if(!range ||
    			!Array.isArray(range) ||
    			range.length !==2 ||
    			isNaN(range[0]) ||
    			isNaN(range[1])
    		){
    			throw 'invalid Field.range';
    			return;
    		}
    		//check on threshold
    		if(range[0] > threshold || range[1] < threshold){
    			throw 'invalid Field.range';
    			return;
    		}
    	}

    	return this;

    }

    $.Heatmap.Field.prototype = {
    	getThreshold:function(){
    		return this._threshold;
    	},
    	setThreshold:function(num){
    		if(isNaN(num) || this.range[0] > num || this.range[1] < num){
    			console.warn('threshold set fail:invalid value');
    			return;
    		}
    		this._threshold = num;
    	}
    }





})(OpenSeadragon)
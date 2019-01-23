//osd-heatmap-overlay.js
/**
 * @constructor
 * OpenSeadragon heatmap Plugin 0.0.1.
 * A OpenSeadragon pulgin that provides a way to show 'heatmap' overlays. 
 * @param {Object} options
 *        Allows configurable properties to be entirely specified by passing an options object to the constructor.
 * @param {Object} options.data
 *        The data of heatmap
 *        etc. 
 *        data:[
 *        [x,y,p1,p2,p3...],
 *        [x,y,p1,p2,p3...]
 *        ...]
 *        explanation:
 *        <x,y> is the position of the top-left point of a patch.
 *        p1,p2,p3 ... are the probabilities that is the corresponding fields.
 * @param {Array} options.fields
 *        the array that each element describes the feild of heatmap
 * @param {String} options.fields.name
 *        the name of a field
 * @param {Array} options.fields.range
 *        the range of a field - [min, max] in the field
 * @param {Array} [options.fields.thresholds]
 *        the treshold of a field.
 * @param {Array} options.size
 *        the size of patchs - size:[width,height]
 * @param {Array} [options.intervalTime=300]
 *        the delay time that will update the heatmap when the view changed. deault time is 300 milliseconds. 
 * @param {Number} [opacity=0.8]
 *        the opacity of the heatmap. default is 0.8.
 * @param {String} [color='#1034A6']
 *        the patch's color. default is '#1034A6'.
 * @param {Number} [zIndex=100]
 *        the z-index of heatmap in the entire viewport.
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
           	this.heatmap.updateOptions(options);
        }
    };

    $.Heatmap = function(options) {
        this._viewer = options.viewer;
        
        // validate data model
        if(!_validate(options)){
            return;
        }

        // heatmap data model
        // necessary Options
        // 
        this._data = options.data || [];
        this.mode = options.mode || 'binal';
        this._fields = createFields(options.fields);
        this._size = options.size;
        this._steps = options.steps || 3;
        this._t_data = null;
        this._operator = 'AND';
        this._currentField = options.currentField || this._fields[0];
        this._color = options.color || "#045a8d"; // heatmap color
        this._colors = options.colors || ["#edf8e9","#006d2c"]; // heatmap color
        this.intervals = _getIntervals(this._currentField, this._colors, this._steps);
        // filter the data
        //this.__thresholdingData();

        // set default options' values if no corresponding values.
        
        

        this._offset = [null, null];
        this._interval = null;
        this._intervalTime = options.intervalTime || 300;

        this.events = {
            updateView:this.updateView.bind(this),
            zooming:this._zooming.bind(this),
            panning:this._panning.bind(this)
        };

        // -- create cover div -- //
        this._cover_div = document.createElement( 'div');
        this._cover_div.style.position = 'absolute';
        this._cover_div.style.width = '150%';
        this._cover_div.style.height = '150%';
        this._cover_div.style.background = options.coverColor || "#000000";
        this._cover_div.style.zIndex =  options.zIndex - 1 || 99;
        this._cover_div.style.opacity = options.coverOpacity || 0.6;
        this._viewer.canvas.appendChild(this._cover_div);

        // create a container div and set the default attributes
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        this._div.style.width = '150%';
        this._div.style.height = '150%';
        this._div.style.transformOrigin = '0 0';
        this._div.style.transform = 'scale(1,1)';
        this._div.style.zIndex =  options.zIndex || 100;
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



        // turn on the heatmap
        this.on();

        // get the position of the current center points
        this._center = this._viewer.viewport.getCenter(true);

    }



    $.Heatmap.prototype = {
        updateOptions:function(options){
            // validate data model
            if(!_validate(options)){
                return;
            }

            // heatmap data model
            // necessary Options 
            this._data = options.data || this._data;
            this.mode = options.mode || this.mode; // two modes - 'binal' : 'gradient'
            this._fields = options.fields?createFields(options.fields):this._fields;
            this._size = options.size || this._size;
            this._steps = options.steps || this._steps;

            // set default options' values if no corresponding values.
            this._currentField = options.currentField || this._currentField;
            this._color = options.color || this._color || "#006d2c";
            this._colors = options.colors || ["#FFFFFF","#1034A6"];
            this.intervals = _getIntervals(this._currentField, this._colors, this._steps);

            this._offset = [null, null];
            this._interval = null;


            this._intervalTime = options.intervalTime || 300;

            this.events = {
                updateView:this.updateView.bind(this),
                zooming:this._zooming.bind(this),
                panning:this._panning.bind(this)
            };

            // -- create container div and display canvas -- //
            if(options.coverColor) this._cover_div.style.background = options.coverColor;
            this._cover_div.style.zIndex =  options.zIndex - 1 || 99;
            if(options.coverOpacity) this._cover_div.style.opacity = options.coverOpacity;

            // create a container div and set the default attributes
            //this._div = document.createElement( 'div');
            this._div.style.position = 'absolute';
            this._div.style.width = '150%';
            this._div.style.height = '150%';
            this._div.style.transformOrigin = '0 0';
            this._div.style.transform = 'scale(1,1)';
            this._div.style.zIndex =  options.zIndex || 100;
            this._div.style.opacity = options.opacity || 0.8;
            //this._viewer.canvas.appendChild(this._div);

            // create display_cancavs
            //this._display_ = document.createElement('canvas');
            this._display_.style.position = 'absolute';
            this._display_.style.top = 0;
            this._display_.style.left = 0;
            this._display_ctx_ = this._display_.getContext('2d');
            //this._div.appendChild(this._display_);
            this._isOn = false;

            // turn on the heatmap
            this.on();

            // get the position of the current center points
            this._center = this._viewer.viewport.getCenter(true);
        },
        
        /**
         * display the cover of heatmap
         */
        coverOn:function(){
            this._cover_div.style.display = '';
        },
        
        /**
         * hide the cover of heatmap
         */
        coverOff:function(){
            this._cover_div.style.display = 'none';
        },

        /**
         * set the opacity of heatmap's cover
         * @param {Number} opacity the value of opacity
         */
        setCoverOpacity:function(opacity){
            if(opacity < 0 || opacity > 1){
                console.warn('Heatmap.setsetCoverOpacity: Invalid Opacity');
                return;
            }
            this._cover_div.style.opacity = opacity;
        },
        
        /**
         * set the coloer of heatmap's cover
         * @param {String} color color in Hex form
         */
        setCoverColor:function(color){
            this._cover_div.style.background = color;
        },
        
        /**
         * turn on the heatmap
         */
    	on:function(){
    		if(this._isOn) return;

            // show heatmap
    		this._div.style.display = '';
    		// add events
        	this._viewer.addHandler('resize',this.events.updateView);
        	this._viewer.addHandler('pan',this.events.panning);
        	this._viewer.addHandler('zoom',this.events.zooming);
        	this._viewer.addHandler('animation-finish', this.events.updateView);

            // draw heatmap immediately
        	this.updateView(0);
        	
        	// set on/off flag to true
        	this._isOn = true;
    	},
    	
        /**
         * turn off the heatmap
         */
    	off:function(){
    		if(!this._isOn) return;

    		// remove events
        	this._viewer.removeHandler('resize',this.events.updateView);
        	this._viewer.removeHandler('pan',this.events.panning);
        	this._viewer.removeHandler('zoom',this.events.zooming);
        	this._viewer.removeHandler('animation-finish', this.events.updateView);
        	
            // hidden heatmap
            this._div.style.display = 'none';
        	
            // set on/off flag to false
            this._isOn = false;
    	},
    	setCurrentField:function(name,draw=true){
            const field = this._fields.find(f => f.name === name);
            if(field){
                this._currentField = field;
                if(draw)this.drawOnCanvas();
            }
        },
        /**
         *  set Threshold by field's name
         * @param {String} name
         *        field's name
         * @param {Number} value 
         *        field's threshold
         */
    	setThresholdsByName:function(name,min,max,draw = true){
    		const field = this._fields.find(f => f.name === name);
    		if(field){
    			field.setThresholds(min, max);
    			if(draw) this.drawOnCanvas();
    		}
    	},
        
        /**
         *  set Threshold by field's index
         * @param {Integer} index
         *        field's index
         * @param {Number} value 
         *        field's threshold
         */
        setThresholdsByIndex:function(index, min, max){
            const field = this._fields[index];
            if(field){
                field.setThresholds(min, max);
                //this.__thresholdingData();
                this.drawOnCanvas();
            }
        },   	
        
        /**
         * filter the data according to the threstholds.
         */
    	__thresholdingData:function(){
    		const thresholds = this._fields.map(f=>f._thresholds);
            let t = TESTER[this._operator];
    		return this._data.filter(d=>{
    			const p = d.slice(2);
    			return t.call(this, p, thresholds, $.inTheRange);
    		},this);
    	},

    	/**
    	 * setOpacity
    	 * set the opacity for the canvas div.
    	 * @param {Number} num the value of the opacity
    	 */
    	setOpacity:function(num){
    		// valid num [0 , 1]
            if(1 < num || 0 > num ){
                console.warn(`Heatmap.setOpacity: Invalid Opacity`);
                return;
            }
    		this._div.style.opacity = num;
    	},
        
        /**
         * change the mode of heatmap
         * @param  {String} mode 'binal' or 'gradient'
         */
        changeMode:function(mode){
            if(this.mode == mode) return;
            this.mode = mode;
            this.drawOnCanvas();
        },

        /**
         * set the steps of heatmap for gradient mode
         * @param {Integer} steps how many intervals for color gradients
         */
        setSteps:function(steps){
            //if(!Number.isInteger(steps) || steps > 10 || steps < 3) return;
            this._steps = steps;
            // refresh view/heatmap/ui if the heatmap is in 'gradient' mode
            if(this.mode == 'gradient') this.drawOnCanvas();
        },
        
        /**
         * set the color of heatmap
         * @param {String} the color of the heatmap
         */
    	setColor:function(color){
    		this._color = color;
            // refresh view/heatmap/ui if the heatmap is in 'binal' mode
    		if(this.mode == 'binal') this.drawOnCanvas();
    	},

        /**
         * set the colors of heatmap
         * @param {Array} the list of colors for the color gradient heatmap
         */
        setColors:function(colors){
            if(!Array.isArray(colors)||colors.length < 2) return;
            this._colors = colors;
            // refresh view/heatmap/ui if the heatmap is in 'gradient' mode
            if(this.mode == 'gradient') this.drawOnCanvas();
        },

        /**
         * it will be called when viewport zooming.
         * This method is for optimized UX.
         */
        _zooming:function(e){

            // get the scaling original point on the screen 
            if(!e.refPoint) return;
            if(e.refPoint === true){
                // get the current center to set as an referent point if there is no referent point
                e.refPoint = this._viewer.viewport.getCenter(true);
            }
            // the referent point on the screen.
            const windowPoint = this._viewer.viewport.viewportToWindowCoordinates(e.refPoint);
            

            const image1 = this._viewer.world.getItemAt(0);
            // get current zoom value.
            var viewportZoom = this._viewer.viewport.getZoom();
            var zoom = image1.viewportToImageZoom(e.zoom);
            
            // calculate the scaling value
            var scale = viewportZoom/this._zoom;
            // ignore scaling if the value to small
            if(scale == 1 || Math.abs(1 - scale) < 0.01) return; 
            // scaling view
            this._div.style.transformOrigin = `${this._offset[0] + windowPoint.x}px ${this._offset[1] + windowPoint.y}px`;
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
         * filter data by using the current view's bounding box.
         * @param  {Array} d
         *         data array
         * @return {Boolean}
         *         true if 
         */
    	viewBoundFilter:function(d){
    		const x = d[0]; // left
    		const y = d[1]; // top

            // current view's bounding box against a patch
    		return $.isIntersectBbox(this._getCanvasBoundBox, {
    			x:x,
    			y:y,
    			width:this._size[0],
    			height:this._size[1]
    		});
    	},
        /**
         * [filter description]
         * @param  {[type]} d [description]
         * @return {[type]}   [description]
         */
        gradient:function(d){
            const x = d[0]; // left
            const y = d[1]; // top

            // current view's bounding box against a patch
            return $.isIntersectBbox(this._getCanvasBoundBox, {
                x:x,
                y:y,
                width:this._size[0],
                height:this._size[1]
            });
        },
        /**
         * update view/heatmap
         * @param  {Number} the debounce time (in milliseconds) to draw
         */
    	updateView:function(time){
    		time = isNaN(time)?this._intervalTime:time;
			clearTimeout(this._interval);
            this._interval = setTimeout(function(){
    		    this.resize();
                this.drawOnCanvas();
            }.bind(this),time);
    	},

        /**
         * reset viewport and canvas css attributes if window resize or viewport changed
         */
    	resize:function(){
    		// resize the canvas size
    		this._display_.width = this._div.clientWidth;
    		this._display_.height = this._div.clientHeight;

            // get the offset[x,y] in piexl
    		this._offset[0] = (this._div.clientWidth - this._viewer.canvas.clientWidth)*0.5;
    		this._offset[1] = (this._div.clientHeight - this._viewer.canvas.clientHeight)*0.5;
			
            // set the current position for the canvas div
			this._div.style.left = `${-this._offset[0]}px`;
        	this._div.style.top = `${-this._offset[1]}px`;
            this._cover_div.style.left = `${-this._offset[0]}px`;
            this._cover_div.style.top = `${-this._offset[1]}px`;            
            // reset the origin point and scale
            this._div.style.transformOrigin = '0 0';
            this._div.style.transform = 'scale(1,1)';
            
            // recording the current center and zoom 
            this._center = this._viewer.viewport.getCenter(true);
            this._zoom = this._viewer.viewport.getZoom(true);

            // get the current canvas bounding box under the normalized coordiante
    		this._getCanvasBoundBox = this.getCanvasBoundBox();
            // TODO filter with view boundaries
            //this._t_data = this.data.filter(this.viewBoundFilter,this);
    	},

        /**
         * According to the data, thresholds and the size of current screen, draw the heatmap
         */
    	drawOnCanvas:function(){
            // filter data by using threshold values
            let finalData = this._data.filter(this.viewBoundFilter,this);
            
            // clear canvas before draw
            DrawHelper.clearCanvas(this._display_);
    		if(this.mode === 'binal'){
                // filter by thresholds
                finalData = this.__thresholdingData();
                // set patch color
                this._display_ctx_.fillStyle = this._color;
      			// get the patch's size on the screen 
                const w = logicalToPhysicalDistanceX(this._size[0],this._viewer.imagingHelper);
      			const h = logicalToPhysicalDistanceY(this._size[1],this._viewer.imagingHelper);
      			
                // start to draw each patch
                this._display_ctx_.beginPath();
    			for (let i = 0; i < finalData.length; i++) {
    				let d = finalData[i];
                    // get the top-left point of a patch on the sreen
    				const x = this._viewer.imagingHelper.logicalToPhysicalX(d[0]);
    				const y = this._viewer.imagingHelper.logicalToPhysicalY(d[1]);
    				// draw patch
                    this._display_ctx_.rect(x+this._offset[0],y+this._offset[1],w,h) 
    			}
    			this._display_ctx_.fill();
            }else if(this.mode === 'gradient'){

                this.intervals = _getIntervals(this._currentField, this._colors, this._steps);
                
                const index = this._fields.findIndex(f => f.name === this._currentField.name, this)+2;
                let finalDatas = finalData.reduce((rs, d)=>{
                    for (var i = 0; i < rs.length; i++) {
                        if(rs[i].range[0] <= d[index] && d[index] < rs[i].range[1]){
                            rs[i].data.push(d);
                            //break;
                            return rs;
                        }
                    }
                    return rs;
                },this.intervals);
                
                const w = logicalToPhysicalDistanceX(this._size[0],this._viewer.imagingHelper);
                const h = logicalToPhysicalDistanceY(this._size[1],this._viewer.imagingHelper);
                
                finalDatas.forEach(cluster => {
                    this._display_ctx_.fillStyle = cluster.color;
                    this._display_ctx_.beginPath();
                    cluster.data.forEach(d =>{
                        const x = this._viewer.imagingHelper.logicalToPhysicalX(d[0]);
                        const y = this._viewer.imagingHelper.logicalToPhysicalY(d[1]);
                        // draw patch
                        this._display_ctx_.rect(x+this._offset[0],y+this._offset[1],w,h) 
                    }, this);
                    this._display_ctx_.fill();

                }, this);
            }
    	}

    }

    function _getIntervals(field, colors=['#FFFFFF','#000000'], steps=3){
        // get list of colors
        // 
        // const colorList = interpolateColors(hexToRgb(colors[0]),hexToRgb(colors[1]),steps);
        



        const colorList = ['#2b83ba','#abdda4','#ffffbf','#fdae61','#d7191c'];
        //const colorList = ['#f2f0f7','#cbc9e2','#9e9ac8','#756bb1','#54278f'];
        //const colorList = ['#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c'];
        //const colorList = ['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15'];
        // const colorList = ['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603'];
        //const colorList = ['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'];
        steps = 5;
        // get a boundary list of intervals
        const threstholds = field._thresholds; 
        const boundaries = interpolateNums(threstholds[0], threstholds[1], steps + 1);
        const rs = [];
        for(let i = 0 ;i < colorList.length; i++){
            // create a new interval
            rs.push({
                color:colorList[i],
                range:[boundaries[i],boundaries[i+1]],
                data:[]
            })
        }
        return rs;
    }
    /**
     * validate heatmap's options
     * @param  {Obejct} options
     *         heatmap's options
     * @return {Boolean}
     *         true if heatmap's options. Otherwise, false.
     */
    function _validate(options){
        
        // check data
        if(!Array.isArray(options.data)){
            console.error('Heatmap: options.data');
            return false;
        }
        // check fields
        if(!Array.isArray(options.fields)){
            console.error('Heatmap: options.fields');
            return false;
        }
        // check size
        if(!Array.isArray(options.size) || options.size.length!==2){
            console.error('Heatmap: options.size');
            return false;
        }
        return true;
    }
    var TESTER = {
        AND:function(p, t, func){
            return p.reduce((acc,v,i)=>{
                return acc&&func.call(this, v, t[i]);
            },true);
        },
        OR:function(p, t, func){
            return p.reduce((acc,v,i)=>{
                return acc||func.call(this, v, t[i]);
            },true);
        },
        FIELD:function(p, t, func){
            return func.call(this, p[this._currentField.index], t[this._currentField.index]);
        }
    }
    /**
     * @private
     * compare p and t if all elements in p and the corresponding t pass the comparison function 
     * @param  {Array} p [p1, p2, p3 ...]
     * @param  {Array} t [t1, t2, t3 ...]
     * @param  {Function} compare function
     * 
     * @return true if all p and t pass the comparison function. Otherwise, false.
     */
    
    function and(p, t, func){
    	return p.reduce((acc,v,i)=>{
    		return acc&&func.call(this, v, t[i]);
    	},true);
    }

    function or(p,t, func){
        return p.reduce((acc,v,i)=>{
            return acc||func.call(this, v, t[i]);
        },true);
    }

    /**
     * @private
     * covert object array to OpenSeadragon.Heatmap.Field array.
     * @param  {Array} fields
     * each field should has the same data constructure.
     * etc.[{
     *         name:'',
     *         range:[0,1],
     *         threshold:0.4
     *      }...]
     *      
     * @return {OpenSeadragon.Heatmap.Field array} All fields
     * 
     */
	function createFields(fields){
		return fields.map((d,index)=>{
			return new $.Heatmap.Field(d,index)
		});
		
	}

    /**
     * @private
     * covert the distance from screen coordinate(in piexl) to normalized coordinate in x-axis.
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
     * covert the distance from screen coordinate(in piexl) to normalized coordinate in y-axis.
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
     * covert the distance from normalized coordinate to screen coordinate(in piexl) in x-axis.
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
     * covert the distance from normalized coordinate to screen coordinate(in piexl) in y-axis.
     * @param  {Number} width/the distance in y-axis.  
     * @param  {OpenSeadragon.ImagingHelper} helper
     * 
     * @return {Number}
     *         width/the distance in the Screen/Physical coordinate.
     */
    function logicalToPhysicalDistanceY(height,helper){
    	return helper._haveImage ? ((height / helper._viewportHeight) * helper.getViewerContainerSize().y) : 0;
    }


    $.extend( $.Heatmap.prototype, $.EventSource.prototype);

    /**
     * [uity function] does two bounding boxes intersect
     * example of a bounding box:
     * {
     *     x: the position of the most left point,
     *     y: the position of the most top point,
     *     width: the width of the box,
     *     height: the height of the box
     * }
     * 
     * @param  {bbox}  bbox1
     *         A bounding box1
     * @param  {bbox}  bbox2
     *         A bounding box2
     * 
     * @return {Boolean} 
     *         return ture if only if two bounding boxes intersect; otherwise, false.
     */
    $.isIntersectBbox = function(bbox1,bbox2){
		return (bbox2.x + bbox2.width >= bbox1.x) && 
		(bbox2.x <= bbox1.x + bbox1.width) && 
		(bbox2.y + bbox2.height>= bbox1.y) && 
		(bbox2.y <= bbox1.y + bbox1.height);
    }

    /**
     * @private 
     * id value1 greater than or equal to value2.
     * @param  {Number} v1
     *         value1
     * @param  {Number} v2
     *         value2
     * @return {Boolean} 
     *         return ture if v1 >= v2; otherwise, false.
     */
    $.gte = function(v1,v2){
    	return v1 >= v2;
    }

    $.inTheRange = function(value,range){
        return range[0] <= value && value <= range[1]
    }
    /**
     * @private 
     * is value1 greater than value2.
     * @param  {Number} v1
     *         value1
     * @param  {Number} v2
     *         value2
     * @return {Boolean} 
     *         return ture if v1 > v2; otherwise, false.
     */
    $.gt = function(v1,v2){
    	return v1 > v2;
    }

    /**
     * the field for the heatmap
     * @param {String} options.name
     *        field's name
     * @param {Array} options.range
     *        the range of value for the field
     * @param {Number} [options.threshold=0]
     *        the treshold value for filtering current field
     */
    $.Heatmap.Field = function({name, range, thresholds = range.slice()}, index){
    	// validate 
    	_validate(name, range, thresholds)
    	
    	this.name = name; // string
    	this.range = range; // [start,end] Number
    	this._thresholds = thresholds; // Number [default value same as range]
        this.index = index;

    	function _validate(name,range,thresholds){
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
            // check on thresholds
            if(!thresholds ||
                !Array.isArray(thresholds) ||
                thresholds.length !==2 ||
                isNaN(thresholds[0]) ||
                isNaN(thresholds[1])
            ){
                throw 'invalid Field.thresholds';
                return;
            }
    		//check on thresholds' values
    		if(range[0] > thresholds[0] ||
                range[1] < thresholds[0] ||
                range[0] > thresholds[1] ||
                range[1] < thresholds[1]
            ){
    			throw 'invalid the values of Field.thresholds';
    			return;
    		}
    	}

    	return this;

    }

    $.Heatmap.Field.prototype = {
        /**
         * get the threshold for the current field
         * @return {Number} the threshold value
         */
    	getThresholds:function(){
    		return this._thresholds;
    	},
        /**
         * set the threshold for the currnet field
         * @param {Number} num the threshold value
         */
    	setThresholds:function(min,max){
    		if(isNaN(min) || this.range[0] > min || this.range[1] < min ||
               isNaN(max) || this.range[0] > max || this.range[1] < max ||
               min > max){
    			console.warn('threshold set fail:invalid value');
    			return;
    		}
    		this._thresholds[0] = min;
            this._thresholds[1] = max;
    	}
    }



})(OpenSeadragon)
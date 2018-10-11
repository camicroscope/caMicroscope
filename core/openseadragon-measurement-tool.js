//openseadragon-measurement-tool.js
// Measurement
// proposal:
// test:
// 
// on()
// off()


/**
 * @constructor
 * OpenSeadragon measurement plugin 0.0.1 based on canvas overlay plugin.
 * A OpenSeadragon pulgin that provides a way to measure on the image. 
 * @param {Object} [options]
 *        Allows configurable properties to be entirely specified by passing an options object to the constructor.
 * @param {Object} options.viewer
 *        A instance of viewer in Openseadragon.
 * @param {Object} options.mpp
 *        the unit of micron per pixel
 * @param {Number} options.mpp.x
 *        micron per pixel on horizontal direction
 * @param {Number} options.mpp.y
 *        micron per pixel on vertical direction
 */
(function($) {
    
    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }

    // check version
    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonMeasurementTool requires ' +
                'OpenSeadragon version 2.2.0+');
    }
    // initialize the instance of DrawOverlay
    // MeasurementTool
    $.Viewer.prototype.measurementTool = function(options) {
        if (!this.measureInstance) {
            // declare and initialize the instance based on the options
            options = options || {};
            options.viewer = this;
            this.measureInstance = new $.MeasurementTool(options);
        } else {
            // update the options
            this.measureInstance.setMPP(options.mpp);
        }
    };


    $.MeasurementTool = function(options) {
    	this.className = `OpenSeadragon.MeasurementTool`;
        this.mpp = {
        	x:1,
        	y:1
        }
        this._viewer = options.viewer;
        if(!this.setMPP(options.mpp)) return;
        // on/off
        this.isOn = false;
        // is measuring things
        this.isMeasuring = false;
        // this._ruler: the ruler element
        // this._h_text: the horizontal scale text
        // this._v_text: the vertical scale text
    
        // global events list for easily remove and add
        this._event = {
          start:this.start.bind(this), 
          stop:this.stop.bind(this),
          measuring:this.measuring.bind(this)
        };

        // start and stop points
        this._start = null;
        this._end = null;

        // receive the event for measurement tool - div
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        this._div.style.left = 0;
        this._div.style.top = 0;
        this._div.style.width = '100%';
        this._div.style.height = '100%';
        this._div.style.display = 'none';
        this._div.style.zIndex =  options.zIndex || 201;
        this._viewer.canvas.appendChild(this._div);

        var image1 = this._viewer.world.getItemAt(0);
        this.imgWidth = image1.source.dimensions.x;
        this.imgHeight = image1.source.dimensions.y;

        this.__createRuler();
    }

    $.MeasurementTool.prototype = {
    	/**
    	 * setMPP 'micron per pixel' for measurement tool
		 * @param {Object} options.mpp
		 *        the unit of micron per pixel
		 * @param {Number} options.mpp.x
		 *        micron per pixel on horizontal direction
		 * @param {Number} options.mpp.y
		 *        micron per pixel on vertical direction
    	 */
    	setMPP:function(mpp){
    		if(!mpp || !mpp.x || !mpp.y ){
    			console.error(`${this.className}:invalid mpp`);
    			return false;
    		}
    		this.mpp = mpp;
    		return true;
    	},
    	/**
    	 * @private
    	 * create a ruler for measurement tool and it will show on the screen
    	 * 
    	 */
    	__createRuler:function(){
    		this._ruler = document.createElement('div');
    		
    		// close btn
    		const close = document.createElement('div');
    		close.classList.add('material-icons');
    		close.classList.add('md-12');
    		close.textContent = 'close';
    		close.style.position = 'absolute';
    		close.style.top = '0px';
    		close.style.left = '4px';
    		close.style.color = 'black';
    		close.style.background ='white';
    		close.style.border = '1px solid black';
    		close.style.display = 'none';
    		this._ruler.appendChild(close);

    		// h
    		const h_scale = document.createElement('div');
	  		h_scale.style.position = 'absolute';
	  		h_scale.style.boxSizing = 'border-box';
			h_scale.style.bottom = '-8px';
			h_scale.style.left = 0;
			h_scale.style.width = '100%';
			h_scale.style.height = '10px';
			h_scale.style.borderLeft = '2px solid rgb(39, 29, 223)';
			h_scale.style.borderRight = '2px solid rgb(39, 29, 223)';
			h_scale.style.borderTop = '2px solid rgb(39, 29, 223)';
			h_scale.style.textAlign = 'center';
			
			// scale text
			const h_text = document.createElement('div');
			h_text.style.display ='table';
  			h_text.style.margin = '0 auto';
			h_text.style.whiteSpace='nowrap';
			h_text.style.color = 'rgb(0, 0, 0)';
			h_text.textContent = 'H_test';
			h_text.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
			
			h_scale.appendChild(h_text);

			this._h_text = h_text;

    		const v_scale = document.createElement('div'); 
	  		v_scale.style.position = 'absolute';
	  		v_scale.style.boxSizing = 'border-box';
			v_scale.style.top = 0;
			v_scale.style.left = '-8px';
			v_scale.style.width = '10px';
			v_scale.style.height = '100%';
			v_scale.style.borderRight = '2px solid rgb(39, 29, 223)';
			v_scale.style.borderTop = '2px solid rgb(39, 29, 223)';
			v_scale.style.borderBottom = '2px solid rgb(39, 29, 223)';
			v_scale.style.alignItems = 'center';
			v_scale.style.display = 'flex';

			// scale text
			const v_text = document.createElement('div');

			v_text.style.display='in-block';
			v_text.style.whiteSpace='nowrap';
			v_text.textContent = 'V_test';
			v_text.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
			v_text.style.color = 'rgb(0, 0, 0)';

			v_scale.appendChild(v_text);
			this._v_text = v_text;

			this._ruler.appendChild(h_scale);
			this._ruler.appendChild(v_scale);

			this._ruler.addEventListener('mouseover', e=>{close.style.display = ''});
			this._ruler.addEventListener('mouseout', e=>{close.style.display = 'none'});
			close.addEventListener('click',e=>{
            	this._viewer.removeOverlay(this._ruler);
            	close.style.display = 'none';
            },this);
    	},
        /**
         * turn on measurement functionality.
         */
        on:function(){
            // stop turning on draw mode if already turn on
            if(this.isOn === true) return;
            // clock viewer
            this._viewer.setMouseNavEnabled(false);
            this._div.style.cursor = 'pointer';
            this._div.style.display = 'block';

            // add Events
            this._div.addEventListener('mousemove', this._event.measuring);
            this._div.addEventListener('mouseout',this._event.stop);
            this._div.addEventListener('mouseup',this._event.stop);
            this._div.addEventListener('mousedown',this._event.start);

            this.isOn = true;
        },

        /**
         * turn off measurement functionality.
         */
        off:function(){
            // stop turning off measurement if already turn off
            if(this.isOn === false) return;
            // unclock viewer
            this._viewer.setMouseNavEnabled(true);
            this._div.style.cursor = 'default';
            this._div.style.display = 'none';

            // remove Events
            this._div.removeEventListener('mousemove', this._event.measuring);
            this._div.removeEventListener('mouseout',this._event.stop);
            this._div.removeEventListener('mouseup',this._event.stop);
            this._div.removeEventListener('mousedown',this._event.start);

            this.isOn = false;
        },

        /*
        * @private
        * start to measure the image
        */
        start:function(e){

            let point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const imagePoint = this._viewer.viewport.windowToImageCoordinates(point);

            if(0 > imagePoint.x || this.imgWidth < imagePoint.x || 0 > imagePoint.y || this.imgHeight < imagePoint.y )return;
            // start drawing
            this.isMeasuring = true;
            this._viewer.canvas.style.cursor = 'crosshair'
			
            //
			this._start = imagePoint;
            
        },

        /**
         * @private
         * each drawing and collects the path data as point.
         * @param  {Event} e the event
         */
        measuring:function(e){
            if(!this.isMeasuring || !this.isOn) return;
            // drawing
            let point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const imagePoint = this._viewer.viewport.windowToImageCoordinates(point);
         
            if(0 > imagePoint.x || this.imgWidth < imagePoint.x || 0 > imagePoint.y || this.imgHeight < imagePoint.y )return;
     			
            	this._end = imagePoint;
				if(this._start && this._end){
					// remove scale
					this._viewer.removeOverlay(this._ruler);

					// get the width and height in the image's piexl
					const [x,y,width, height] = this.__forRect(this._start,this._end);
					// calculate 
					const widthInUnit = this.__getScaleUnit(this.mpp.x, width);
					const heightInUnit = this.__getScaleUnit(this.mpp.y, height);

					// set values for scale
					this._h_text.textContent = widthInUnit;
					this._v_text.textContent = heightInUnit;
					// 
					var rect = this._viewer.viewport.imageToViewportRectangle(new $.Rect(
						x,y,width,height
					));

					this._viewer.addOverlay({
						element: this._ruler,
						location: rect
					});
				}

        },

        /*
        * @private
        * stop to measure the image
        */
        stop:function(e){
            // if(this.isMeasuring) {
            //	do something
            // }
            this.isMeasuring = false;
            this._viewer.canvas.style.cursor = 'pointer';
        },

		__getRect:function(start,end){
		    if(start < end){
		        return [start, end-start]
		    }else{
		        return [end, start-end]
		    }
		},

		__forRect:function(start,end){
		    let [x,width] = this.__getRect(start.x,end.x);
		    let [y,height] = this.__getRect(start.y,end.y);
		    return [x,y,width,height];
		},
		/**
		 * @private
		 * get the unit based on mpp and value in the image piexl
		 * @param  {Number} mpp               the micron per pixel
		 * @param  {Number} valueInImagePiexl the size of piexl
		 * @return {String}                   the value of unit on a string form
		 */
        __getScaleUnit:function(mpp, valueInImagePiexl){
        	const value = mpp*valueInImagePiexl;
			if (value < 0.000001) {
			    return (value * 1000000000).toFixed(3) + " pm";
			}
			if (value < 0.001) {
			    return (value * 1000000).toFixed(3) + " nm";
			}
			if (value < 1) {
			    return (value * 1000).toFixed(3) + " mm";
			}
			if (value >= 1000) {
			    return (value / 1000).toFixed(3) + " cm";
			}
			return (value).toFixed(3) + " μm";
        },
        /**
         * Function to destroy the instance of MeasurementTool and clean up everything created by MeasurementTool.
         *
         * Example:
         * var measure = MeasurementTool({
         *   [...]
         * });
         *
         * //when you are done with the measure:
         * measure.destroy();
         * measure = null; //important
         *
         */
        destory:function(){
            for(const key in this){
                this[key] = null;
            }
        },


    };

})(OpenSeadragon);

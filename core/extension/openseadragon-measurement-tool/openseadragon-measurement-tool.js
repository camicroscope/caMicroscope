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
        this.mode = 'straight'; // straight : coordinate

        this._ruler = document.createElement('div');
        this._ruler.classList.add('ruler');
        // this._ruler: the ruler element
        // this._h_text: the horizontal scale text
        // this._v_text: the vertical scale text
        
    
        // global events list for easily remove and add
        this._event = {
          start:this.start.bind(this), 
          stop:this.stop.bind(this),
          measuring:this.measuring.bind(this)
        };

        // start and stop points in image
        this._start = null;
        this._end = null;
        // start and stop points in client
        this._start_client = null;
        this._end_client = null;
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

        
    }

    $.MeasurementTool.prototype = {
        __clearPoints:function(){
            this._start = null;
            this._end = null;
            // start and stop points in client
            this._start_client = null;
            this._end_client = null;
        },
        setMode:function(mode){
            if(mode == 'straight' || mode == 'coordinate') {
                this.mode = mode;
            }

        },
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
    	__createRuler:function(mode){
            if(mode == 'coordinate'){
                this.__createCoordinateRuler();
            }else if(mode == 'straight'){
                this.__createStraightRuler();
            }
            // close btn
            const close = document.createElement('div');
            close.classList.add('material-icons');
            close.classList.add('md-12');
            close.classList.add('close');
            close.textContent = 'close';
            close.style.display = 'none';
            this._ruler.appendChild(close);
            this._ruler.style.zIndex = 101;
            // close
			this._ruler.addEventListener('mouseover', e=>{close.style.display = ''});
			this._ruler.addEventListener('mouseout', e=>{close.style.display = 'none'});
			close.addEventListener('click',e=>{
            	this._viewer.removeOverlay(this._ruler);
            	close.style.display = 'none';
                this.__clearPoints();
            },this);
    	},


        __createCoordinateRuler:function(){
            empty(this._ruler);
            // h
            const h_scale = document.createElement('div');
            h_scale.classList.add('h_scale');
            
            // scale text
            const h_text = document.createElement('div');
            h_text.classList.add('h_text');
            h_scale.appendChild(h_text);

            this._h_text = h_text;

            const v_scale = document.createElement('div');
            v_scale.classList.add('v_scale');

            // scale text
            const v_text = document.createElement('div');
            v_text.classList.add('v_text');

            v_scale.appendChild(v_text);
            this._v_text = v_text;

            this._ruler.appendChild(h_scale);
            this._ruler.appendChild(v_scale);
        },

        __createStraightRuler:function(){
            empty(this._ruler);
            // create text
            const box = document.createElement('div');
            box.classList.add('box');
            const text = document.createElement('div');
            text.classList.add('text');
            box.appendChild(text);
            this._ruler.appendChild(box);

            // create circle
            const circle = document.createElement('div');
            circle.classList.add('circle');
            this._ruler.appendChild(circle);

            // create scale
            const scale = document.createElement('div');
            scale.classList.add('scale');
            this._scale = scale;
            
            const l = document.createElement('div');
            l.classList.add('l');
            scale.appendChild(l);

            const r = document.createElement('div');
            r.classList.add('r');
            scale.appendChild(r);

            this._ruler.appendChild(scale);
        },
        calcAngle:function(opposite, adjacent) {
            return Math.atan(opposite / adjacent);
        },

        __adjustStraightRuler:function(){

            const w = Math.abs(this._start_client.x-this._end_client.x);
            const h = Math.abs(this._start_client.y-this._end_client.y);
            const z = Math.sqrt(w*w+h*h);

            const scale = this._ruler.querySelector('.scale');
            const circle = this._ruler.querySelector('.circle');
            circle.style.display = '';
            const text = this._ruler.querySelector('.text');
            text.textContent = this.__getScaleUnit(1,Math.sqrt(w*w*this.mpp.x*this.mpp.x + h*h*this.mpp.y*this.mpp.y));

            if(this._start.x == this._end.x && this._start.y != this._end.y){
                // change the both sides of ticks
                scale.classList.add('v');
                scale.classList.remove('h');
                scale.style.width = '2px';
                scale.style.transform = '';
                scale.style.left = 0;
                circle.style.width = this._ruler.offsetHeight+'px';
                circle.style.left = `-${this._ruler.offsetHeight/2}px`;

            }else if(this._start.y == this._end.y && this._start.x != this._end.x){
                // change the both sides of ticks
                
                scale.classList.add('h');
                scale.classList.remove('v');
                scale.style.width = '100%';
                scale.style.transform = '';
                scale.style.left = 0;
                circle.style.height = this._ruler.offsetWidth+'px';
                circle.style.top = `-${this._ruler.offsetWidth/2}px`;
            }else if((this._start.x < this._end.x && this._start.y < this._end.y) ||
                    (this._start.x > this._end.x && this._start.y > this._end.y)){
                // change the both sides of ticks
                scale.classList.add('h');
                scale.classList.remove('v');

                // calculate position
                const w_percent = (z/w)*100;
                const h_percent = (z/h)*100;

                //const left = -(((z-w)/2)/w)*100;
                const left = -(50*z-50*w)/w;
                //const top = -(((z-h)/2)/h)*100;
                const top = -(50*z-50*h)/h;

                // circle
                circle.style.width = `${w_percent}%`;
                circle.style.height = `${h_percent}%`;
                circle.style.top = `${top}%`;
                circle.style.left = `${left}%`;
                // scale
                scale.style.width = `${w_percent}%`
                scale.style.transformOrigin = `0 0`;
                scale.style.left = 0;
                scale.style.transform= `rotate(${this.calcAngle(h,w)}rad)`;

            }else if((this._start.x < this._end.x && this._start.y > this._end.y) ||
                    (this._start.x > this._end.x && this._start.y < this._end.y)){
                scale.classList.add('h');
                scale.classList.remove('v');

                // calculate position
                const w_percent = (z/w)*100;
                const h_percent = (z/h)*100;

                //const left = -(((z-w)/2)/w)*100;
                const left = -(50*z-50*w)/w;
                //const top = -(((z-h)/2)/h)*100;
                const top = -(50*z-50*h)/h;

                // circle
                circle.style.width = `${w_percent}%`;
                circle.style.height = `${h_percent}%`;
                circle.style.top = `${top}%`;
                circle.style.left = `${left}%`;
                // scale
                scale.style.width = `${w_percent}%`
                scale.style.transformOrigin = `0 0`;
                scale.style.left = `100%`;
                scale.style.transform= `rotate(${3.14159 - this.calcAngle(h,w)}rad)`;
            }else {
                console.log('end');
            }
            
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
            this._start_client = new $.Point(e.clientX, e.clientY);
            
            this.__createRuler(this.mode);
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
                this._end_client = new $.Point(e.clientX, e.clientY);
				if(this._start && this._end){
					// remove scale
					this._viewer.removeOverlay(this._ruler);

					// get the width and height in the image's piexl
					const [x,y,width, height] = this.__forRect(this._start,this._end);
                    const widthInUnit = this.__getScaleUnit(this.mpp.x, width);
                    const heightInUnit = this.__getScaleUnit(this.mpp.y, height);

                    // 
                    var rect = this._viewer.viewport.imageToViewportRectangle(new $.Rect(
                        x,y,width,height
                    ));

                    this._viewer.addOverlay({
                        element: this._ruler,
                        location: rect
                    });

                    if(this.mode == 'coordinate'){
                        // calculate 
    					// set values for scale
    					this._h_text.textContent = widthInUnit;
    					this._v_text.textContent = heightInUnit;
                    }else if(this.mode == 'straight'){
                        this.__adjustStraightRuler();
                        this._ruler.querySelector('.text').textContent = this.__getScaleUnit(1,Math.sqrt(this.mpp.x*this.mpp.x*width*width+ this.mpp.y*this.mpp.y*height*height));

                    }


                    this._ruler.style.display = 'flex';
				}

        },

        /*
        * @private
        * stop to measure the image
        */
        stop:function(e){
            if(this.isMeasuring===false) return;
            this.isMeasuring = false;
            this._viewer.canvas.style.cursor = 'pointer';
            if(this.mode =='straight') this._ruler.querySelector('.circle').style.display='none';
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
			    return (value * 1000000000).toFixed(3) + " fm";
			}
			if (value < 0.001) {
			    return (value * 1000000).toFixed(3) + " pm";
			}
			if (value < 1) {
			    return (value * 1000).toFixed(3) + " nm";
			}
			if (value >= 1000) {
			    return (value / 1000).toFixed(3) + " mm";
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

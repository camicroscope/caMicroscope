//openseadragon-zoom-control.js


/**
 * @constructor
 * OpenSeadragon zoom control 0.0.1.
 * A OpenSeadragon plugin that provides a scalable and nice zoom control
 * @param {Object} [options]
 *        Allows configurable properties to be entirely specified by passing an options object to the constructor.
 */
(function($) {

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonScalebar requires ' +
                'OpenSeadragon version 2.0.0+');
    }

    $.Viewer.prototype.cazoomctrl = function(options) {
        if (this.cazoomctrlInstance) return;
            options = options || {};
            options.viewer = this;
            this.cazoomctrlInstance = new $.CaZoomControl(options);
    };
    /*
        A explanation of the relationship of Image Zoom, MPP and Magnification(... 20X,40X,80X...)
        mpp           Image Zoom             Magnification
          .                    .                         .
          .                    .                         .
         10                0.025                        1x
          5                 0.05                        2x
        2.5                  0.1                        4x
       1.25                  0.2                        8x
          1                 0.25                       10x
        0.5                  0.5                       20x
       0.25                    1                       40x
      0.125                    2                       80x
          .                    .                         .

        Image Zoom to Viewport Zoom: viewer.viewport.imageToViewportZoom()
        Viewport Zoom to Image Zoom: $CAMIC.viewer.viewport.viewportToImageZoom()
    */
    $.CaZoomControl = function(options) {
        this.base = 40;
        this.zoomIndex;
        this._viewer = options.viewer;
        var viewer = this._viewer;
        var    viewerSize;
        var   navigatorSize;

        //We may need to create a new element and id if they did not
        //provide the id for the existing element
        if( !options.id ){
            options.id              = 'cazoomctrl-' + $.now();
            this.element            = $.makeNeutralElement( "div" );
            options.controlOptions  = {
                anchor:           $.ControlAnchor.TOP_RIGHT,
                attachToViewer:   true,
                autoFade:         options.autoFade
            };

            if( options.position ){
                if( 'BOTTOM_RIGHT' == options.position ){
                   options.controlOptions.anchor = $.ControlAnchor.BOTTOM_RIGHT;
                } else if( 'BOTTOM_LEFT' == options.position ){
                   options.controlOptions.anchor = $.ControlAnchor.BOTTOM_LEFT;
                } else if( 'TOP_RIGHT' == options.position ){
                   options.controlOptions.anchor = $.ControlAnchor.TOP_RIGHT;
                } else if( 'TOP_LEFT' == options.position ){
                   options.controlOptions.anchor = $.ControlAnchor.TOP_LEFT;
                } else if( 'ABSOLUTE' == options.position ){
                   options.controlOptions.anchor = $.ControlAnchor.ABSOLUTE;
                   options.controlOptions.top = options.top;
                   options.controlOptions.left = options.left;
                   options.controlOptions.height = options.height;
                   options.controlOptions.width = options.width;
                }
            }

        } else {
            this.element            = document.getElementById( options.id );
            options.controlOptions  = {
                anchor:           $.ControlAnchor.NONE,
                attachToViewer:   false,
                autoFade:         false
            };
        }
        this.element.id         = options.id;
        this.element.className  += ' cazoomctrl';
        //this.element.style.background='#fff';
        //this.element.textContent ='test zoom control';
        $.setElementTouchActionNone( this.element );

        this.borderWidth = 2;
        //At some browser magnification levels the display regions lines up correctly, but at some there appears to
        //be a one pixel gap.
        this.fudge = new $.Point(1, 1);
        this.totalBorderWidths = new $.Point(this.borderWidth * 2, this.borderWidth * 2).minus(this.fudge);

        if ( options.controlOptions.anchor != $.ControlAnchor.NONE ) {
            (function( style, borderWidth ){
                style.margin        = '3px 0';
                style.padding       = '0px';
                style.background    = '#365f9c';
                style.display = 'flex';
            }( this.element.style, this.borderWidth));
        }

        viewer.addControl(
            this.element,
            options.controlOptions
        );


        //
        this.createZoomControl();
        // get all possible image zoom level and range
        this.getAllImageZoomLevelAndRange(this._viewer);
        //viewer.viewport.zoomTo(min);
        this.setImageZoomLevel({zoom:this._viewer.viewport.getMinZoom()});

        // let the control correspond to the zoom
        viewer.addHandler('zoom',this.setImageZoomLevel.bind(this));
        viewer.addHandler('resize', function(e){
            this.getAllImageZoomLevelAndRange(this._viewer);
            this.setImageZoomLevel({zoom:this._viewer.viewport.getZoom(true)});
        }.bind(this));
        this.toggle.addEventListener('click', this.toggleUp.bind(this));
        this.zoomIn.addEventListener('click', this.doZoomIn.bind(this));
        this.zoomOut.addEventListener('click', this.doZoomOut.bind(this));
        viewer.addHandler("canvas-click", function(e){
          if (e.shift){
            this.doZoomOut()
          }
        }.bind(this))
        this.range.addEventListener('change', this.rangeChange.bind(this));
        this.range.addEventListener('mousemove', this.rangeChange.bind(this));

    }

    /**
     * @private
     * range Change
     * @param  {Event} e
     *         the event
     */
    $.CaZoomControl.prototype.rangeChange =  function(e){
        const index = +this.range.value;
        if(index == this.imageZoomIndex) return;
        this.imageZoomIndex = index;
        const imageZoom = this.imageZoomLevels[index];
        this._viewer.viewport.zoomTo(this._viewer.viewport.imageToViewportZoom(imageZoom));
    }

    /**
     * @private
     * set Zoom Level
     * @param {Event} e
     *        Event
     */
    $.CaZoomControl.prototype.setImageZoomLevel = function(e){
            const index = getImageZoomIndex(
                    this.imageZoomRanges,
                    this._viewer.viewport.viewportToImageZoom(e.zoom)
                );
            if(index!=null) this.imageZoomIndex = this.range.value = index;
            this.txt.textContent =  `${Number((this._viewer.viewport.viewportToImageZoom(e.zoom)*this.base).toFixed(3))}x`;

    }
    $.CaZoomControl.prototype.zoomScaleVisible = function(visible) {
        if(visible) {
            this.zoomIn.style.display = '';
            this.range.style.display = '';
            this.zoomOut.style.display = '';
            this.idx.style.display = '';
        } else {
            this.zoomIn.style.display = 'none';
            this.range.style.display = 'none';
            this.zoomOut.style.display = 'none';
            this.idx.style.display = 'none';
        }
    }
    /**
     * toggleUp - show/hide navigator
     *
     */
    $.CaZoomControl.prototype.toggleUp = function() {
        if(this.toggle.textContent=='unfold_more') {
            this.toggle.textContent = 'unfold_less';
            this.zoomScaleVisible(true);
            this._viewer.controls[0].setVisible(true)
        } else {
            this.toggle.textContent = 'unfold_more';
            this.zoomScaleVisible(false);
            this._viewer.controls[0].setVisible(false)
        }
    }
    /**
     * doZoomIn - do one scale move in action
     *
     */
    $.CaZoomControl.prototype.doZoomIn = function() {
        if(this.imageZoomIndex == 0) return;
        this.imageZoomIndex--;
        this.range.value = this.imageZoomIndex;
        this._viewer.viewport.zoomTo(
            this._viewer.viewport.imageToViewportZoom(this.imageZoomLevels[this.imageZoomIndex])
            ,true);
    }

    /**
     * doZoomOut - do one scale move out action
     *
     */
    $.CaZoomControl.prototype.doZoomOut = function() {
        if(this.imageZoomIndex == this.imageZoomLevels.length-1) return;
        this.imageZoomIndex++;
        this.range.value = this.imageZoomIndex;
        this._viewer.viewport.zoomTo(
            this._viewer.viewport.imageToViewportZoom(this.imageZoomLevels[this.imageZoomIndex])
            ,true);
    }
    /**
     * Function to destroy the instance of CaZoomControl and clean up everything created by CaZoomControl.
     *
     * Example:
     * var zoomctrl = CaZoomControl({
     *   [...]
     * });
     *
     * //when you are done with the zoomctrl:
     * zoomctrl.destroy();
     * zoomctrl = null; //important
     *
     */
    $.CaZoomControl.prototype.destroy = function(){
        for(const key in this){
            this[key] = null;
        }
    }
    /**
     * @private
     * create Zoom Control
     */
    $.CaZoomControl.prototype.createZoomControl = function(){
        if(this.element.parentNode) this.element.parentNode.style = 'block';
        this.element.style.display = 'flex';

        // toggle
        this.toggle = document.createElement( 'div' );
        this.toggle.classList.add('material-icons');
        this.toggle.classList.add('md-24');
        this.toggle.classList.add('zoom');
        this.toggle.textContent = 'unfold_less';

        // zoom in
        this.zoomIn = document.createElement( 'div' );
        this.zoomIn.classList.add('material-icons');
        this.zoomIn.classList.add('md-24');
        this.zoomIn.classList.add('zoom');
        this.zoomIn.textContent = 'add';

        // zoom out
        this.zoomOut = document.createElement( 'div' );
        this.zoomOut.classList.add('material-icons');
        this.zoomOut.classList.add('md-24');
        this.zoomOut.classList.add('zoom');
        this.zoomOut.textContent = 'remove';

        // indicator
        this.idx = document.createElement( 'div' );
        this.idx.classList.add('idx');
        //this.txt = $.makeNeutralElement( 'div' );
        this.txt = document.createElement('div');
        this.txt.classList.add('txt');

        // input
        this.ip = document.createElement('input');
        this.ip.type='text';
        this.ip.classList.add('ip');
        this.idx.addEventListener('click', function(e){
            // set image zoom value to input
            let value = this.txt.textContent;
            value = value.slice(0, value.length-1);
            this.ip.value = +value;
            // hide txt
            this.txt.classList.add('hide');

            this.ip.focus();
        }.bind(this));
        this.idx.addEventListener('keydown', function(e){
            if(event.key === 'Enter'){
                this.ip.blur();
                //setZoom.call(this);
            }
        }.bind(this))

        this.ip.addEventListener('blur', function(e){
            setZoom.call(this);
        }.bind(this))

        this.idx.appendChild(this.txt);
        this.idx.appendChild(this.ip);



        // range
        this.range = $.makeNeutralElement( 'input' );
        this.range.type = 'range';

        this.element.appendChild(this.zoomIn);
        this.element.appendChild(this.range);
        this.element.appendChild(this.zoomOut);
        this.element.appendChild(this.idx);
        this.element.appendChild(this.toggle);
    }


    /**
     * @private
     * get All Zoom Level
     * @param  {Number} min
     *         the min zoom level in current osd's viewer
     * @param  {Number} max
     *         the max zoom level in current osd's viewer
     * @param  {Number} preScroll
     *         the ratio of zoom pre scroll
     *
     */
    $.CaZoomControl.prototype.getAllImageZoomLevelAndRange = function(viewer){

        this.imageZoomLevels = getAllImageZoomLevel(viewer);

        this.imageZoomRanges = [];
        this.imageZoomRanges.push(Number.POSITIVE_INFINITY);
        for(let i = 0; i < this.imageZoomLevels.length - 1; i++){
             this.imageZoomRanges.push((this.imageZoomLevels[i] + this.imageZoomLevels[i+1])/2);
        }
        this.imageZoomRanges[this.imageZoomRanges.length] = Number.NEGATIVE_INFINITY;

        this.range.min = 0;
        this.range.max = this.imageZoomLevels.length - 1;
        this.range.step = 1;
    }
    $.CaZoomControl.prototype.getMaxImageZoom = function() {
        return getMaxImageZoom(this._viewer);
    }
    /**
     * @private
     * getZoomIndex
     *
     * @param  {Array} range
     *         the collection of each range of zoom levels.
     * @param  {Number} zoom
     *         the current zoom level in the viewer
     * @return {Number} index of the zoom level on zoom'range
     */
    function getImageZoomIndex(range, zoom){
        for(let i = 0; i < range.length - 1; i++){
            if(range[i] >= zoom && zoom > range[i+1]) return i;
        }
        return null;
    }
    function getAllImageZoomLevel(viewer){
        const max = getMaxImageZoom(viewer);
        const min = getMinImageZoom(viewer);
        const samples = [1, 0.5, 0.25];
        let divisor = 1;
        //const zoomNums = 3 - (Math.log2(min) >> 0);
        let zooms = [];
        do {
            zooms = [...zooms,...samples.map(e=>e/divisor)]
            divisor *= 10;
        } while(zooms[zooms.length-1] > min);

        while( zooms[zooms.length-1] < min ){
            zooms.pop();
        }
        zooms.push(min);
        return zooms;
    }

    function getCurrentImageZoom(viewer){
        return viewer.viewport.viewportToImageZoom(viewer.viewport.getZoom(true));
    }

    function getMaxImageZoom(viewer){
        return viewer.viewport.viewportToImageZoom(viewer.viewport.getMaxZoom());
    }

    function getMinImageZoom(viewer){
        return viewer.viewport.viewportToImageZoom(viewer.viewport.getMinZoom());
    }

    function verifyImageZoom(str, min, max){
        const rs = {
            verified:true,
            value:str
        }
        //const num = Number.parseFloat(str);
        if(isNaN(str)){
            rs.verified = false;
            rs.value = 'Not a Number'
            return rs;
        }else if(min.toFixed(3) > (+str)||max < (+str)){
            rs.verified = false;
            rs.value = `Zoom Range:${min.toFixed(3)} ~ ${max}`;
            return rs;
        }
        rs.value = +str;
        return rs;
    }
    function setZoom(){
            const rs = verifyImageZoom(
                this.ip.value, // current zoom
                this.imageZoomLevels[this.imageZoomLevels.length-1]*this.base, // min zoom
                this.imageZoomLevels[0]*this.base // max zoom
                );
            if(rs.verified){
                this._viewer.viewport.zoomTo(this._viewer.viewport.imageToViewportZoom(rs.value/this.base),this._viewer.viewport.getCenter(),true);

                if(rs.value%1===0){
                    this.txt.textContent = `${rs.value}x`;
                }else{
                    this.txt.textContent = `${rs.value.toFixed(3)}x`;
                }
                delete this.idx.dataset.error;
                this.txt.classList.remove('hide');
            }else{
                // give error tip
                this.idx.dataset.error = rs.value;
                this.ip.focus();
            }
    }

}(OpenSeadragon))

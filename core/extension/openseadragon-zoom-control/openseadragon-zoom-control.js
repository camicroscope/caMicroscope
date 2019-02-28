//openseadragon-zoom-control.js


/**
 * @constructor
 * OpenSeadragon zoom control 0.0.1.
 * A OpenSeadragon pulgin that provides a scaleable and nice zoom control 
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

    $.CaZoomControl = function(options) {
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
        const min = viewer.viewport.getMinZoom();
        const max = viewer.viewport.getMaxZoom();
        const preScroll = viewer.zoomPerScroll;
        this.createZoomControl();
        this.getAllZoomLevel(min, max, preScroll);
        viewer.viewport.zoomTo(min);
        this.setZoomLevel({zoom:min});

        // let the control correspond to the zoom
        viewer.addHandler('zoom',this.setZoomLevel.bind(this));
        viewer.addHandler('resize', function(e){
            const min = viewer.viewport.getMinZoom();
            const max = viewer.viewport.getMaxZoom();
            const preScroll = viewer.zoomPerScroll;
            this.getAllZoomLevel(min, max, preScroll);
        }.bind(this));
        this.zoomIn.addEventListener('click', this.doZoomIn.bind(viewer));
        this.zoomOut.addEventListener('click', this.doZoomOut.bind(viewer));
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

        if(index == this.zoomIndex) return;
        
        const zoom = (this.zoomRanges[index]+this.zoomRanges[index+1])/2
        this._viewer.viewport.zoomTo(zoom);
        this.setZoomLevel({zoom:zoom});
    }

    /**
     * @private
     * set Zoom Level
     * @param {Event} e
     *        Event
     */
    $.CaZoomControl.prototype.setZoomLevel = function(e){
            const index = getZoomIndex(this.zoomRanges,e.zoom);
            if(index!=null) this.zoomIndex = this.range.value = index;
            this.txt.textContent =  `${Number(e.zoom.toFixed(2))}x`;

    }

    /**
     * doZoomIn - do one scale move in action
     * 
     */
    $.CaZoomControl.prototype.doZoomIn = function() {
        const zoom = this.viewport.getZoom();
        const ranges = this.cazoomctrlInstance.zoomRanges;
        let index = getZoomIndex(ranges,zoom);
        if(index == 0)  return;
        index--;
        const nextZoom = (ranges[index]+ranges[index+1])/2;
        this.viewport.zoomTo(nextZoom,true);
    }

    /**
     * doZoomOut - do one scale move out action
     *  
     */
    $.CaZoomControl.prototype.doZoomOut = function() {
        const zoom = this.viewport.getZoom();
        const ranges = this.cazoomctrlInstance.zoomRanges;
        let index = getZoomIndex(ranges,zoom);
        if(index == ranges.length-2) return;
        index++;
        const nextZoom = (ranges[index]+ranges[index+1])/2;
        this.viewport.zoomTo(nextZoom,true);
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
    $.CaZoomControl.prototype.destory = function(){
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
        // zoom in
        this.zoomIn = document.createElement( 'div' );
        this.zoomIn.classList.add('material-icons');
        this.zoomIn.classList.add('md-24');
        this.zoomIn.classList.add('zoom');
        this.zoomIn.textContent = 'remove';

        // zoom out
        this.zoomOut = document.createElement( 'div' );
        this.zoomOut.classList.add('material-icons');
        this.zoomOut.classList.add('md-24');
        this.zoomOut.classList.add('zoom');
        this.zoomOut.textContent = 'add';

        // indicator
        this.idx = $.makeNeutralElement( 'div' );
        this.idx.classList.add('idx');
        this.txt = $.makeNeutralElement( 'div' );
        this.txt = document.createElement('div');
        this.txt.classList.add('txt');
        this.idx.appendChild(this.txt);

        // range
        this.range = $.makeNeutralElement( 'input' );
        this.range.type = 'range';


        this.element.appendChild(this.zoomIn);
        this.element.appendChild(this.range);
        this.element.appendChild(this.zoomOut);
        this.element.appendChild(this.idx);

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
    $.CaZoomControl.prototype.getAllZoomLevel = function(min,max,preScroll){

        const zoomLevels = [];
        zoomLevels.push(min * (1/preScroll));
        while(min <= max){
            zoomLevels.push(min);
            min = min * preScroll;
        }

        zoomLevels.push(max);
        zoomLevels.push(max*preScroll);

        this.zoomRanges = [];
        for(let i = 0; i < zoomLevels.length - 1; i++){
             this.zoomRanges.push((zoomLevels[i] + zoomLevels[i+1])/2); 
        }
        this.range.min = 0;
        this.range.max = this.zoomRanges.length - 2;
        this.range.step = 1;
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
    function getZoomIndex(range,zoom){
        for(let i = 0; i < range.length - 1; i++){
            if(range[i] <= zoom && zoom < range[i+1]) return i;
        }
        return null;
    }
}(OpenSeadragon))
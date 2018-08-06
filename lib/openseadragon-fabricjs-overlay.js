// OpenSeadragon canvas Overlay plugin 0.0.1 based on svg overlay plugin

(function() {

    if (!window.OpenSeadragon) {
        console.error('[openseadragon-canvas-overlay] requires OpenSeadragon');
        return;
    }


    /**
     * @param {Object} options
     *      Allows configurable properties to be entirely specified by passing
     *      an options object to the constructor.
     * @param {Number} options.scale
     *      Fabric 'virtual' canvas size, for creating objects
     **/
    OpenSeadragon.Viewer.prototype.fabricjsOverlay = function(options) {


        this._fabricjsOverlayInfo = new Overlay(this);
        this._fabricjsOverlayInfo._scale = options.scale;

        return this._fabricjsOverlayInfo;
    };
    // static counter for multiple overlays differentiation
    var counter = (function () {
        var i = 1;

        return function () {
            return i++;
        }
    })();
    // ----------
    var Overlay = function(viewer) {
        var self = this;

        this._viewer = viewer;

        this._containerWidth = 0;
        this._containerHeight = 0;

        this._canvasdiv = document.createElement( 'div');
        this._canvasdiv.style.position = 'absolute';
        this._canvasdiv.style.left = 0;
        this._canvasdiv.style.top = 0;
        this._canvasdiv.style.width = '100%';
        this._canvasdiv.style.height = '100%';
        this._viewer.canvas.appendChild(this._canvasdiv);

        this._canvas = document.createElement('canvas');

        this._id='osd-overlaycanvas-'+counter();
        this._canvas.setAttribute('id', this._id);
        this._canvasdiv.appendChild(this._canvas);
        this.resize();
        this._fabricCanvas=new fabric.Canvas(this._canvas);
        // disable fabric selection because default click is tracked by OSD
        this._fabricCanvas.selection=false;
        // prevent OSD click elements on fabric objects
        this._fabricCanvas.on('mouse:down', function (options) {
            if (options.target) {

                options.e.preventDefaultAction = true;
                options.e.preventDefault();
                options.e.stopPropagation();
            }
        });





        this._viewer.addHandler('update-viewport', function() {
            self.resize();
            self.resizecanvas();

        });

        this._viewer.addHandler('open', function() {
            self.resize();
            self.resizecanvas();
        });


    };

    // ----------
    Overlay.prototype = {
        // ----------
        canvas: function() {
            return this._canvas;
        },
        fabricCanvas: function() {
            return this._fabricCanvas;
        },
        // ----------
        clear: function() {
            this._fabricCanvas.clearAll();
        },
        // ----------
        resize: function() {
            if (this._containerWidth !== this._viewer.container.clientWidth) {
                this._containerWidth = this._viewer.container.clientWidth;
                this._canvasdiv.setAttribute('width', this._containerWidth);
                this._canvas.setAttribute('width', this._containerWidth);
            }

            if (this._containerHeight !== this._viewer.container.clientHeight) {
                this._containerHeight = this._viewer.container.clientHeight;
                this._canvasdiv.setAttribute('height', this._containerHeight);
                this._canvas.setAttribute('height', this._containerHeight);
            }

        },
       resizecanvas: function() {

           var origin = new OpenSeadragon.Point(0, 0);
           var viewportZoom = this._viewer.viewport.getZoom(true);
           this._fabricCanvas.setWidth(this._containerWidth);
           this._fabricCanvas.setHeight(this._containerHeight);
           var zoom = this._viewer.viewport._containerInnerSize.x * viewportZoom / this._scale;
           this._fabricCanvas.setZoom(zoom);
           var viewportWindowPoint = this._viewer.viewport.viewportToWindowCoordinates(origin);
           var x=Math.round(viewportWindowPoint.x);
           var y=Math.round(viewportWindowPoint.y);
           var canvasOffset=this._canvasdiv.getBoundingClientRect();

           var pageScroll = OpenSeadragon.getPageScroll();

           this._fabricCanvas.absolutePan(new fabric.Point(canvasOffset.left - x + pageScroll.x, canvasOffset.top - y + pageScroll.y));

       }

    };

})();

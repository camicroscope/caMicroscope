// openseadragon-overlays-manager.js
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
    $.Viewer.prototype.overlaysManager = function(options) {
        if (!this.omanager) {
            options = options || {};
            options.viewer = this;
            this.omanager = new $.OverlaysManager(options);
        } else {
            this.omanager.updateOptions(options);
        }
    };

    $.OverlaysManager = function(options) {
        this._viewer = options.viewer;
    	this.overlays = [];
        this.events = {
            highlight:this.highlight.bind(this),
            click:this.pathClick.bind(this)
        }
        // -- create container div, and hover, display canvas -- // 
        this._containerWidth = 0;
        this._containerHeight = 0;
    	
        // create container div
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        this._div.style.left = 0;
        this._div.style.top = 0;
        this._div.style.width = '100%';
        this._div.style.height = '100%';
        this._div.style.display = 'none';
        this._div.style.zIndex =  options.zIndex || 100;
        this._viewer.canvas.appendChild(this._div);
        // create display_cancavs
        this._display_ = document.createElement('canvas');
        this._display_.style.position = 'absolute';
        this._display_.style.top = 0;
        this._display_.style.left = 0;
        this._display_ctx_ = this._display_.getContext('2d');
        this._div.appendChild(this._display_);
        
        // create hover_cancavs
        this._hover_ = document.createElement('canvas');
        this._hover_.style.position = 'absolute';
        this._hover_.style.top = 0;
        this._hover_.style.left = 0;
        this._hover_ctx_ = this._hover_.getContext('2d');
        this._div.appendChild(this._hover_);

        this.updateView();
        this._viewer.addHandler('update-viewport',this.updateView.bind(this));
        this._viewer.addHandler('open',this.updateView.bind(this));

        //this._viewer.addHandler('canvas-click',function(){console.log('click')});
        this._div.addEventListener('mousemove', this.events.highlight);
        //this._div.addEventListener('dbl ', this.events.pathClick);
        this._div.addEventListener('click', this.events.click);
    	
    }

    $.OverlaysManager.prototype = {
        highlight:function(e){
            this._div.style.cursor = 'default';
            DrawHelper.clearCanvas(this._hover_);
            const point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const img_point = this._viewer.viewport.windowToImageCoordinates(point);
            for(let i = 0;i<this.overlays.length;i++){
                const layer = this.overlays[i];
                if(!layer.isShow) continue;
                const features = layer.data.geometries.features;
                for(let j = 0;j < features.length;j++){
                    const path = features[j].geometry.path;
                    const style = features[j].properties.style;
                    if(path.contains(img_point.x,img_point.y)){
                        this.resize();
                        this.highlightPath = path;
                        this.highlightStyle = style;
                        this.highlightLayer = layer;
                        this.drawOnCanvas(this.drawOnHover,[this._hover_ctx_,this._div,path,style]);
                        return;
                    }else{
                        this.highlightPath = null;
                        this.highlightStyle = null;
                        this.highlightLayer = null;
                    }
                }
            }

        },

        pathClick:function(e){
            //if(this.highlightLayer) 
            this._viewer.raiseEvent('canvas-lay-click',{position:{x:e.clientX, y:e.clientY},data:this.highlightLayer?this.highlightLayer.data:null});
        },
        setOverlays:function(overlays){
            if(!$.isArray(overlays)) return;
            for(let i = 0;i<overlays.length;i++){
                this.addOverlay(overlays[i]);
            }
        },
        resize: function() {
            if (this._containerWidth !== this._viewer.container.clientWidth) {
                this._containerWidth = this._viewer.container.clientWidth;
                this._div.setAttribute('width', this._containerWidth);
                this._hover_.setAttribute('width', this._containerWidth);
                this._display_.setAttribute('width', this._containerWidth);
            }

            if (this._containerHeight !== this._viewer.container.clientHeight) {
                this._containerHeight = this._viewer.container.clientHeight;
                this._div.setAttribute('height', this._containerHeight);
                this._hover_.setAttribute('height', this._containerHeight);
                this._display_.setAttribute('height', this._containerHeight);
            }
            this._viewportOrigin = new $.Point(0, 0);
            var boundsRect = this._viewer.viewport.getBounds(true);
            this._viewportOrigin.x = boundsRect.x;
            this._viewportOrigin.y = boundsRect.y * this.imgAspectRatio;
            
            this._viewportWidth = boundsRect.width;
            this._viewportHeight = boundsRect.height * this.imgAspectRatio;
            var image1 = this._viewer.world.getItemAt(0);
            this.imgWidth = image1.source.dimensions.x;
            this.imgHeight = image1.source.dimensions.y;
            this.imgAspectRatio = this.imgWidth / this.imgHeight;
        },
        drawOnCanvas:function(drawFuc,args){
            var viewportZoom = this._viewer.viewport.getZoom(true);
            var image1 = this._viewer.world.getItemAt(0);
            var zoom = image1.viewportToImageZoom(viewportZoom);

            var x=((this._viewportOrigin.x/this.imgWidth-this._viewportOrigin.x )/this._viewportWidth)*this._containerWidth;
            var y=((this._viewportOrigin.y/this.imgHeight-this._viewportOrigin.y )/this._viewportHeight)*this._containerHeight;

            DrawHelper.clearCanvas(args[0].canvas);
            args[0].translate(x,y);
            args[0].scale(zoom,zoom);
            drawFuc.apply(this,args);
            //this.drawOnDisplay(this._display_ctx_);
            args[0].setTransform(1, 0, 0, 1, 0, 0);
        },
        isShowDiv:function(){
            return this.overlays.some(lay => lay.isShow == true);
        },
        drawOnDisplay:function(ctx){
            for (var i = 0; i < this.overlays.length; i++) {
                const layer = this.overlays[i];
                if(layer.isShow) layer.onDraw(ctx);
            }
        },
        drawOnHover:function(ctx,div,path,style){
            div.style.cursor = 'point';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.fillStyle = hexToRgbA(style.color,0.5);
            ctx.strokeStyle = style.color;
            ctx.lineWidth = style.lineWidth;
            path.strokeAndFill(this._hover_ctx_);
        },
        updateView:function(){
            this.resize();
            if(this.isShowDiv()) {
                this._div.style.display = 'block';
            }else{
                this._div.style.display = 'none';
                return;
            };
            this.drawOnCanvas(this.drawOnDisplay,[this._display_ctx_]);
            if(this.highlightPath)this.drawOnCanvas(this.drawOnHover,[this._hover_ctx_,this._div,this.highlightPath,this.highlightStyle]);

        },
    	addOverlay:function(options){ // id, data, render
            if(this.overlays.find(layer => layer.id == options.id)){
              console.warn('duplicate overlay ID');
              return;
            }

            const lay = new Overlay(options)
            this.overlays.push(lay);
            // TODO redraw

            return lay;
            
    	},

    	removeOverlay:function(id){
            const index = this.overlays.findIndex(layer => layer.id == id);
            if (index > -1) {
              this.overlays.splice(index, 1);
              this.updateView();
              //const sort = this.overlays.map(layer=>layer.id);
              //this.setSort(sort.reverse());
              return true;
            }
            
            return false;    		
    	},
        getOverlay:function(id){
            return this.overlays.find(layer => layer.id == id);
 
        },
        sort:function(){
            // for (var i = data.length - 1; i >= 0; i--) {
            //     const id = data[i];
            //     const layer = this.getOverlayer(id);
            //     const index = data.length - i;
            //     layer.index = index;
            // }
        },
        clearOverlays:function(){
            this.overlays = [];
        },
        clearCanvas:function(){
            DrawHelper.clearCanvas(this._display_);
            DrawHelper.clearCanvas(this._hover_);
        },
        clear:function(){
            this.clearCanvas();
            this.clearOverlays();
        },


    }



    // overlay for manager
    var Overlay = function(options){
        this.className = 'Overlay'
        if(!options){
            console.error(`${this.className}: No Options.`);
            return;
        }
        if(!options.id){
            console.error(`${this.className}: No ID.`);
            return;
        }
        if(!options.data){
            console.error(`${this.className}: No Data.`);
            return;
        }
        if(!options.render || typeof options.render !== 'function'){
            console.error(`${this.className}: No Render or Illegal.`);
            return;
        }
		this.id = options.id;
		this.data = options.data; 
		this.render = options.render;
		this.clickable = options.clickable || false;
		this.hoverable = options.hoverable || false;
        this.isShow = options.isShow || true;
    }

    Overlay.prototype = {
    	onDraw:function( ctx, data){
    		if(data) this.data = data;
    		this.render( ctx, this.data);
    	}
    }






})(OpenSeadragon)
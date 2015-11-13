var annotools = function(element, options) {
	this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	this.isFirefox = typeof InstallTrigger !== 'undefined';
	this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	this.isChrome = !!window.chrome;
	this.annotationActive = !(this.isFirefox || this.isIE || this.isOpera);
	this.source = element; //The Tool Source Element
    this.left = options.left || '150px'; //The Tool Location
    this.ratio = options.ratio || 0.005; //One pixel equals to the length in real situation. Will be used in the measurement tool
    this.maxWidth = options.maxWidth || 4000; //MaxWidth of the Image
    this.maxHeight = options.maxHeight || 800; ////MaxHeight of the Image
    this.initialized = false;
	this.top = options.top || '0px';
    this.color = options.color || 'lime'; //Default Annotation Color
    this.height = options.height || '30px';
    this.width = options.width || '270px';
    this.zindex = options.zindex || '100'; //To Make Sure The Tool Appears in the Front
    this.iidDecoded = decodeURI(options.iid);
	this.canvas = options.canvas; //The canvas Element that The Use will be drawing annotatoins on.
    this.iid = options.iid || null; //The Image ID
    this.annotVisible = true; //The Annotations are Set to be visible at the First Loading
    this.mode = 'default'; //The Mode is Set to Default

    this.viewer = options.viewer;
    this.imagingHelper = this.viewer.imagingHelper;
	this.mpp = options.mpp;
	this.mppx = parseFloat(this.mpp["mpp-x"]);
	this.mppy = parseFloat(this.mpp["mpp-y"]);
	this.x1 = 0.0;
	this.x2 = 1.0;
	this.y1 = 0.0;
	this.y2 = 1.0;

	this.annotationHandler = options.annotationHandler || new AnnotoolsOpenSeadragonHandler();
        this.viewer.addHandler('animation-finish', function (event) {
            this.getAnnot();
        }.bind(this));
        this.viewer.addHandler('animation-start', function (event) {
            var markup_svg = document.getElementById("markups");
            if (markup_svg) {
                markup_svg.destroy()
            }
        });
        window.addEvent("domready", function () {
            //this.getAnnot();
		this.createButtons();
        }.bind(this)); //Get the annotation information and Create Buttons
        /*window.addEvent("keydown", function (event) {
            this.keyPress(event.code)
        }.bind(this)); //Add KeyDown Events*/
        //this.viewer.viewport.zoomTo(1);
        //this.iid = "AA00448";
        if(this.annotationActive)
	    this.getAnnot();
        this.imagingHelper.addHandler('image-view-changed',function (event)
        {
            //this.getAnnot();
        }.bind(this));

    };

    annotools.prototype.createButtons= function () //Create Buttons
    {
        this.tool = document.id(this.source); //Get The Element with the Source ID.
        this.tool.setStyles({
            'position': 'absolute',
            'left': this.left,
            'top': this.top,
            'width': this.width,
            'height': this.height,
            'z-index': this.zindex
        });
        this.tool.addClass('annotools'); //Update Styles
        //this.tool.makeDraggable(); //Make it Draggable.
        if(this.annotationActive)
	{
	this.rectbutton = new Element('img', {
            'title': 'Draw Rectangle',
            'class': 'toolButton firstToolButtonSpace',
            'src': 'images/rect.svg'
        }).inject(this.tool); //Create Rectangle Tool
        this.ellipsebutton = new Element('img', {
            'title': 'Draw Ellipse',
            'class': 'toolButton',
            'src': 'images/ellipse.svg'
        }).inject(this.tool); //Ellipse Tool
        this.pencilbutton = new Element('img', {
            'title': 'Draw Freeline',
            'class': 'toolButton',
            'src': 'images/pencil.svg'
        }).inject(this.tool); //Pencil Tool
        this.spacer1 = new Element('img', {
            'class': 'spacerButton',
            'src': 'images/spacer.svg'
        }).inject(this.tool);
        this.measurebutton = new Element('img', {
            'title': 'Measurement Tool',
            'class': 'toolButton',
            'src': 'images/measure.svg'
        }).inject(this.tool); //Measurement Tool
        this.spacer2 = new Element('img', {
            'class': 'spacerButton',
            'src': 'images/spacer.svg'
        }).inject(this.tool);
        this.filterbutton = new Element('img', {
            'title': 'Filter Markups',
            'class': 'toolButton',
            'src': 'images/filter.svg'
        }).inject(this.tool); //Filter Button
        this.hidebutton = new Element('img', {
            'title': 'Show/Hide Markups',
            'class': 'toolButton',
            'src': 'images/hide.svg'
        }).inject(this.tool); //Show/Hide Button
	    this.fullDownloadButton = new Element('img', {
            'title': 'Download All Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/fullDownload.svg'
        }).inject(this.tool); //Full Download
        this.partialDownloadButton = new Element('img', {
            'title': 'Download Partial Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/partDownload.svg'
        }).inject(this.tool); //Partial Download
	
        /*this.savebutton = new Element('img', {
            'title': 'Save Current State',
            'class': 'toolButton',
            'src': 'images/save.svg'
        }).inject(this.tool); //Save Button
*/
	}
	this.titleButton = new Element('<p>',{
		'class' : 'titleButton',
		'text' : 'caMicroscope'
	}).inject(this.tool);

	this.iidbutton = new Element('<p>',{
		'class':'iidButton',
		'text':'SubjectID :' + this.iid
	}).inject(this.tool);

/* ASHISH - disable quit button
        this.quitbutton = new Element('img', {
            'title': 'quit',
            'class': 'toolButton',
            'src': 'images/quit.svg'
        }).inject(this.tool); //Quit Button
*/
	if(this.annotationActive)
	{
        this.rectbutton.addEvents({
            'click': function () {
                this.mode = 'rect';
                this.drawMarkups();
            }.bind(this)
        }); //Change Mode
        this.ellipsebutton.addEvents({
            'click': function () {
                this.mode = 'ellipse';
                this.drawMarkups();
            }.bind(this)
        });
      /*  this.polybutton.addEvents({
            'click': function () {
                this.mode = 'polyline';
                this.drawMarkups();
            }.bind(this)
        }); */
        this.pencilbutton.addEvents({
            'click': function () {
                this.mode = 'pencil';
                this.drawMarkups();
            }.bind(this)
        });
        this.measurebutton.addEvents({
            'click': function () {
                this.mode = 'measure';
                this.drawMarkups();
            }.bind(this)
        });
        /*this.magnifybutton.addEvents({
            'click': function () {
                this.mode = 'magnify';
                this.magnify();
            }.bind(this)
        });
        this.colorbutton.addEvents({
            'click': function () {
                this.selectColor()
            }.bind(this)
        });*/
        this.hidebutton.addEvents({
            'click': function () {
                this.toggleMarkups()
            }.bind(this)
        });
        this.filterbutton.addEvents({
            'click': function () {
                this.removeMouseEvents();
                this.promptForAnnotation(null, "filter", this, null);
            }.bind(this)
        });
        /*this.analyzebutton.addEvents({
            'click': function () {
                this.analyze()
            }.bind(this)
        });
        /*this.savebutton.addEvents({
            'click': function () {
                this.saveState()
            }.bind(this)
        });*/
/* ASHISH Disable quit button
        this.quitbutton.addEvents({
            'click': function () {
                this.quitMode();
                this.quitbutton.hide();
            }.bind(this)
        });
        this.quitbutton.hide(); //Quit Button Will Be Used To Return To the Default Mode
*/
        var toolButtons = document.getElements(".toolButton");
        for (var i = 0; i < toolButtons.length; i++) {
            toolButtons[i].addEvents({
                'mouseenter': function () {
                    this.addClass('selected')
                },
                'mouseleave': function () {
                    this.removeClass('selected')
                }
            });
        }
        this.messageBox = new Element('div', {
            'id': 'messageBox'
        }).inject(document.body); //Create A Message Box
        this.showMessage("Press white space to toggle annotations");
        this.drawLayer = new Element('div', {
            html: "",
            styles: {
                position: 'absolute',
                'z-index': 1
            }
        }).inject(document.body); //drawLayer will hide by default
        this.drawCanvas = new Element('canvas').inject(this.drawLayer);
        this.drawLayer.hide();
        this.magnifyGlass = new Element('div', {
            'class': 'magnify'
        }).inject(document.body); //Magnify glass will hide by default
        this.magnifyGlass.hide();
	}
};



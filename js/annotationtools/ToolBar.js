var ToolBar = function(element, options){


    this.source = element; //The Tool Source Element
    this.top = options.top || '0px';
    this.left = options.left || '150px'; //The Tool Location   
    this.height = options.height || '30px';
    this.width = options.width || '270px';
    this.zindex = options.zindex || '100'; //To Make Sure The Tool Appears in the Front


    this.annotationActive = true;
}


ToolBar.prototype.createButtons = function(){
    this.tool = $(this.source);
    var tool = jQuery("#"+"tool"); //Temporary dom element while we clean up mootools
    console.log("creating buttons...");
    /*
    this.tool.setStyles({
        'position': 'absolute',
        'left': this.left,
        'top': this.top,
        'width': this.width,
        'height': this.height,
        'z-index': this.zindex
    });
    */
    tool.css({
        "position": "absolute", 
        'left': this.left,
        'top': this.top,
        'width': this.width,
        'height': this.height,
        'z-index': this.zindex   
    });

    tool.addClass('annotools'); //Update Styles
    //this.tool.makeDraggable(); //Make it Draggable.
    
    
    if(this.annotationActive)
    {
        
        /*
         * Ganesh
         * Mootools to Jquery for creation of toolbar buttons
         */
        /*
        this.rectbutton = new Element('img', {
            'title': 'Draw Rectangle',
            'class': 'toolButton firstToolButtonSpace',
            'src': 'images/rect.svg'
        }).inject(this.tool); //Create Rectangle Tool
        */
        //console.log(this.rectbutton);
        //console.log(this.source);
        //this.rectbutton = new Element(rectbutton);    

        this.rectbutton = jQuery("<img>", {
            title: "Draw Rectangle", 
            class: "toolButton firstToolButtonSpace", 
            src: "images/rect.svg"
        });
        tool.append(this.rectButton);
        //tool.append(this.rectTB;
        //console.log(tool);    


        /*
        this.ellipsebutton = new Element('img', {
            'title': 'Draw Ellipse',
            'class': 'toolButton',
            'src': 'images/ellipse.svg'
        }).inject(this.tool); //Ellipse Tool
        */
        this.ellipsebutton = jQuery("<img>", {
            'title': 'Draw Ellipse',
            'class': 'toolButton',
            'src': 'images/ellipse.svg'
        });
        tool.append(this.ellipsebutton);

       
        /*
        this.pencilbutton = new Element('img', {
            'title': 'Draw Freeline',
            'class': 'toolButton',
            'src': 'images/pencil.svg'
        }).inject(this.tool); //Pencil Tool
        */
        this.pencilbutton = jQuery('<img>', {
            'title': 'Draw Freeline',
            'class': 'toolButton',
            'src': 'images/pencil.svg'
        });
        tool.append(this.pencilbutton); //Pencil Tool
        
        
        /*
        this.spacer1 = new Element('img', {
            'class': 'spacerButton',
            'src': 'images/spacer.svg'
        }).inject(this.tool);
        */
        this.spacer1 = jQuery("<img>", {
            'class': 'spacerButton', 
            'src': 'images/spacer.svg'
        });
        tool.append(this.spacer1);
        
        
        /*
        this.measurebutton = new Element('img', {
            'title': 'Measurement Tool',
            'class': 'toolButton',
            'src': 'images/measure.svg'
        }).inject(this.tool); //Measurement Tool
        */
        this.measurebutton = jQuery('<img>', {
            'title': 'Measurement Tool',
            'class': 'toolButton',
            'src': 'images/measure.svg'
        });
        tool.append(this.measurebutton);


        /*
        this.spacer2 = new Element('img', {
            'class': 'spacerButton',
            'src': 'images/spacer.svg'
        }).inject(this.tool);
        */
        this.spacer2 = jQuery('<img>', {
            'class': 'spacerButton',
            'src': 'images/spacer.svg'
        });
        tool.append(this.spacer2);
        
        /*
        this.filterbutton = new Element('img', {
            'title': 'Filter Markups',
            'class': 'toolButton',
            'src': 'images/filter.svg'
        }).inject(this.tool); //Filter Button
        */
        
        this.filterbutton = jQuery('<img>', {
            'title': 'Filter Markups',
            'class': 'toolButton',
            'src': 'images/filter.svg'
        });
        tool.append(this.filterbutton); //Filter Button
       
        /*
        this.hidebutton = new Element('img', {
            'title': 'Show/Hide Markups',
            'class': 'toolButton',
            'src': 'images/hide.svg'
        }).inject(this.tool); //Show/Hide Button
        */
        this.hidebutton = jQuery('<img>', {
            'title': 'Show/Hide Markups',
            'class': 'toolButton',
            'src': 'images/hide.svg'
        });
        tool.append(this.hidebutton);
        /*
        this.fullDownloadButton = new Element('img', {
            'title': 'Download All Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/fullDownload.svg'
        }).inject(this.tool); //Full Download
        */
        this.fullDownloadButton = jQuery('<img>', {
            'title': 'Download All Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/fullDownload.svg'
        });
        tool.append(this.fullDownloadButton);
        
        /*
        this.partialDownloadButton = new Element('img', {
            'title': 'Download Partial Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/partDownload.svg'
        }).inject(this.tool); //Partial Download
        */

        this.partialDownloadButton = jQuery('<img>', {
            'title': 'Download Partial Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/partDownload.svg'
        });
        tool.append(this.partialDownloadButton);  //Partial Download


        /*this.savebutton = new Element('img', {
            'title': 'Save Current State',
            'class': 'toolButton',
            'src': 'images/save.svg'
        }).inject(this.tool); //Save Button
        */
    }
    
    /*
    this.titleButton = new Element('<p>',{
        'class' : 'titleButton',
        'text' : 'caMicroscope'
    }).inject(this.tool);
    */
    this.titleButton = jQuery('<p>',{
        'class' : 'titleButton',
        'text' : 'caMicroscope'
    });
    tool.append(this.titleButton);

    /*
    this.iidbutton = new Element('<p>',{
        'class':'iidButton',
        'text':'SubjectID :' + this.iid
    }).inject(this.tool);
    */
    this.iidbutton = jQuery('<p>', {
        'class': 'iidButton',
        'text': 'SubjectID :' + this.iid
    });
    tool.append(this.iidbutton);

    /* ASHISH - disable quit button
        this.quitbutton = new Element('img', {
            'title': 'quit',
            'class': 'toolButton',
            'src': 'images/quit.svg'
        }).inject(this.tool); //Quit Button
    */
    if(this.annotationActive)
    {
        this.rectbutton.on("click", function(){
            this.mode = 'rect';
            this.drawMarkups();
        }.bind(this));
        /*
        this.rectbutton.addEvents({
            'click': function () {
                this.mode = 'rect';
                this.drawMarkups();
            }.bind(this)
        }); //Change Mode
        */
        
        this.ellipsebutton.on("click", function(){
            this.mode = 'ellipse';
            this.drawMarkups();

        }.bind(this));

        /*
        this.ellipsebutton.addEvents({
            'click': function () {
                this.mode = 'ellipse';
                this.drawMarkups();
            }.bind(this)
        });
        */
      /*  this.polybutton.addEvents({
            'click': function () {
                this.mode = 'polyline';
                this.drawMarkups();
            }.bind(this)
        }); */
        /*
        this.pencilbutton.addEvents({
            'click': function () {
                this.mode = 'pencil';
                this.drawMarkups();
            }.bind(this)
        });
        */
        this.pencilbutton.on('click', function () {
                this.mode = 'pencil';
                this.drawMarkups();
        }.bind(this));


        /*
        this.measurebutton.addEvents({
            'click': function () {
                this.mode = 'measure';
                this.drawMarkups();
            }.bind(this)
        });
        */
        this.measurebutton.on('click', function () {
                this.mode = 'measure';
                this.drawMarkups();
        }.bind(this));       
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
        /*
        this.hidebutton.addEvents({
            'click': function () {
                this.toggleMarkups()
            }.bind(this)
        });
        */
        this.hidebutton.on('click', function () {
            this.toggleMarkups()
        }.bind(this));
        /*
        this.filterbutton.addEvents({
            'click': function () {
                this.removeMouseEvents();
                this.promptForAnnotation(null, "filter", this, null);
            }.bind(this)
        });
        */

        this.filterbutton.on('click', function () {
            this.removeMouseEvents();
            this.promptForAnnotation(null, "filter", this, null);
        }.bind(this));
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
       
        //var toolButtons = document.getElements(".toolButton");
        var toolButtons = jQuery(".toolButton");
        toolButtons.each(function(){
            jQuery(this).on({
                'mouseenter': function(){
                    this.addClass('selected');
                },
                'mouseleave': function(){
                    this.removeClass('selected');
                }
            });
        });

        /*
        for (var i = 0; i < toolButtons.length; i++) {
            toolButtons[i].on({
                'mouseenter': function () {
                    this.addClass('selected')
                },
                'mouseleave': function () {
                    this.removeClass('selected')
                }
            });
        }
        */
        
        /*
         * Ganesh: Using the Mootools version as the jquery version breaks things 
         *
        this.messageBox = jQuery('<div>', {
            'id': 'messageBox'
        });
        jQuery("body").append(this.messageBox);
        */
    }
};



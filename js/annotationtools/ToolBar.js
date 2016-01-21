var ToolBar = function(element, options){


    this.source = element; //The Tool Source Element
    this.top = options.top || '0px';
    this.left = options.left || '150px'; //The Tool Location   
    this.height = options.height || '30px';
    this.width = options.width || '270px';
    this.zindex = options.zindex || '100'; //To Make Sure The Tool Appears in the Front

    this.iid = options.iid || null; 
    this.annotationActive = isAnnotationActive();
}


ToolBar.prototype.createButtons = function(){
    //this.tool = jQ(this.source);
    var tool = jQuery("#"+"tool"); //Temporary dom element while we clean up mootools
    console.log("creating buttons...");


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
        this.rectbutton = jQuery("<img>", {
            title: "Draw Rectangle", 
            class: "toolButton firstToolButtonSpace", 
            src: "images/rect.svg"
        });
        tool.append(this.rectButton);

        this.ellipsebutton = jQuery("<img>", {
            'title': 'Draw Ellipse',
            'class': 'toolButton',
            'src': 'images/ellipse.svg'
        });
        tool.append(this.ellipsebutton);

        this.pencilbutton = jQuery('<img>', {
            'title': 'Draw Freeline',
            'class': 'toolButton',
            'src': 'images/pencil.svg'
        });
        tool.append(this.pencilbutton); //Pencil Tool
        
        this.spacer1 = jQuery("<img>", {
            'class': 'spacerButton', 
            'src': 'images/spacer.svg'
        });
        tool.append(this.spacer1);
        
        this.measurebutton = jQuery('<img>', {
            'title': 'Measurement Tool',
            'class': 'toolButton',
            'src': 'images/measure.svg'
        });
        tool.append(this.measurebutton);

        this.spacer2 = jQuery('<img>', {
            'class': 'spacerButton',
            'src': 'images/spacer.svg'
        });
        tool.append(this.spacer2);
        
        this.filterbutton = jQuery('<img>', {
            'title': 'Filter Markups',
            'class': 'toolButton',
            'src': 'images/filter.svg'
        });
        tool.append(this.filterbutton); //Filter Button

        this.hidebutton = jQuery('<img>', {
            'title': 'Show/Hide Markups',
            'class': 'toolButton',
            'src': 'images/hide.svg'
        });
        tool.append(this.hidebutton);

        this.fullDownloadButton = jQuery('<img>', {
            'title': 'Download All Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/fullDownload.svg'
        });
        tool.append(this.fullDownloadButton);
        
        this.partialDownloadButton = jQuery('<img>', {
            'title': 'Download Partial Markups (Coming Soon)',
            'class': 'toolButton',
            'src': 'images/partDownload.svg'
        });
        tool.append(this.partialDownloadButton);  //Partial Download

        /*
         * Event handlers on click for the buttons
         */
        this.rectbutton.on("click", function(){
            this.mode = 'rect';
            this.drawMarkups();
        }.bind(this));

        this.ellipsebutton.on("click", function(){
            this.mode = 'ellipse';
            this.drawMarkups();

        }.bind(this));

        this.pencilbutton.on('click', function () {
                this.mode = 'pencil';
                this.drawMarkups();
        }.bind(this));

        this.measurebutton.on('click', function () {
                this.mode = 'measure';
                this.drawMarkups();
        }.bind(this));       

        this.hidebutton.on('click', function () {
            this.toggleMarkups()
        }.bind(this));

        this.filterbutton.on('click', function () {
            this.removeMouseEvents();
            this.promptForAnnotation(null, "filter", this, null);
        }.bind(this));

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
    
    
    this.titleButton = jQuery('<p>',{
        'class' : 'titleButton',
        'text' : 'caMicroscope'
    });
    tool.append(this.titleButton);


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

    }
};



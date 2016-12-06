var ToolBar = function (element, options) {
  // console.log(options)
  this.annotools = options.annotool
  // console.log(this.annotools)
  this.FilterTools = options.FilterTools
  this.source = element // The Tool Source Element
  this.top = options.top || '0px'
  this.left = options.left || '150px' // The Tool Location   
  this.height = options.height || '30px'
  this.width = options.width || '270px'
  this.zindex = options.zindex || '100' // To Make Sure The Tool Appears in the Front

  this.iid = options.iid || null
  this.annotationActive = isAnnotationActive()
}
ToolBar.prototype.showMessage = function (msg) {
  console.log(msg)
}

ToolBar.prototype.algorithmSelector = function () {
  var self = this
  var ftree
  xxx = []
}

var available_colors = ['lime', 'red', 'blue', 'orange']
var algorithm_color = {}

function goodalgo (data, status) {
  // console.log(data)
  
  /*
  data.push({

    "title": "Human Test",
    "provenance": {
      "analysis_execution_id": "humantest"
    }
  });
  */  
  var blob = []
  for (i = 0;i < data.length;i++) {
    var n = {}
    //console.log(data[i])
    n.title = "<div class='colorBox' style='background:" + available_colors[i] + "'></div>" + data[i].title
    n.key = i.toString()
    n.refKey = data[i].provenance.analysis_execution_id
    n.color = available_colors[i]
    algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i]
    blob.push(n)
  }
}
var ALGORITHM_LIST = {};
var SELECTED_ALGORITHM_LIST = [];
var SELECTED_ALGORITHM_KEYS = [];
var AlgorithmSelectorHidden = true;
ToolBar.prototype.toggleAlgorithmSelector = function () {
  var self  = this;
	//jQuery("#panel").show("slide");
  var url = 'api/Data/getAlgorithmsForImage.php?iid=' + self.iid;

  var htmlStr = "<div id='panelHeader'> <h4>Select Algorithm </h4> </div> <div id='panelBody'> <ul id='algorithmList'>";
  jQuery.get(url, function (data) {

    d = JSON.parse(data)

    ALGORITHM_LIST = d;
    for(var i=0; i < d.length; i++){

      htmlStr += "<li><input type='checkbox' class='algorithmCheckbox' value="+i+" /> "+d[i].title + "</li>";
    }

    htmlStr +="</ul> <br /> <button class='btn' id='cancelAlgorithms'>Hide</button> </div>";

    jQuery("#panel").html(htmlStr);



    jQuery("#algorithmList input[type=checkbox]").each(function() {

      var elem = jQuery(this)
      var id = (this).value*1;
      for(var i=0; i < SELECTED_ALGORITHM_KEYS.length; i++){
        if(SELECTED_ALGORITHM_KEYS[i] == (id)){

          elem.prop('checked', true); 
        }
      }
      
      
    });

    self.annotools.getMultiAnnot();

    jQuery('#algorithmList input[type=checkbox]').change(function() {
      console.log("change");
      SELECTED_ALGORITHM_LIST = [];
      SELECTED_ALGORITHM_KEYS = [];
      jQuery("#algorithmList input:checked").each(function() {
	console.log(ALGORITHM_LIST);
        SELECTED_ALGORITHM_LIST.push(ALGORITHM_LIST[(this).value * 1].provenance.analysis_execution_id);
        SELECTED_ALGORITHM_KEYS.push((this).value*1);
      });
	console.log(self.annotools.getMultiAnnot);
      self.annotools.getMultiAnnot();


    })
    
    /*
    jQuery("#submitAlgorithms").click(function(){
      var selected= [];
      SELECTED_ALGORITHM_LIST = [];
      jQuery("#algorithmList input:checked").each(function() {
        SELECTED_ALGORITHM_LIST.push(ALGORITHM_LIST[(this).value * 1].analysis.execution_id);
        SELECTED_ALGORITHM_KEYS.push((this).value*1);
      });

      self.annotools.getMultiAnnot();
      jQuery("#panel").html("");
      jQuery("#panel").hide("slide");
    });
    */
    jQuery("#cancelAlgorithms").click(function(){
      jQuery("#panel").html("");
      jQuery("#panel").hide("slide");
    });
  });
   if(AlgorithmSelectorHidden == true){
   	jQuery("#panel").show("slide");   
    AlgorithmSelectorHidden = false;
  } else {
    jQuery("#panel").html("");
    jQuery("#panel").hide("slide");

    AlgorithmSelectorHidden = true;
  } 
    
}

ToolBar.prototype.setNormalMode = function() {
  this.annotools.mode = 'normal';
  jQuery("canvas").css("cursor", "default");
  jQuery("#drawRectangleButton").removeClass('active');
  jQuery("#drawFreelineButton").removeClass('active');
  this.annotools.drawLayer.hide()
  this.annotools.addMouseEvents()       
}

ToolBar.prototype.createButtons = function () {
  // this.tool = jQ(this.source)
  var tool = jQuery('#' + 'tool') // Temporary dom element while we clean up mootools
  var self = this


  // Fetch algorithms for Image
  jQuery(document).ready(function () {
    // console.log(options)
    // var self= this
    var url = 'api/Data/getAlgorithmsForImage.php?iid=' + self.iid;
    console.log(url);
    jQuery.get(url, function (data) {
      console.log(data);
      d = JSON.parse(data)

      goodalgo(d, null)
    })
    // console.log("here")
    jQuery('#submitbtn').click(function () {
      var selKeys = jQuery('#tree').fancytree('getTree').getSelectedNodes()
      var param = ''
      for (i = 0;i < selKeys.length;i++) {
        param = param + '&Val' + (i + 1).toString() + '=' + selKeys[i].title
      }
    })
  })

  tool.css({
    'position': 'absolute',
    'left': this.left,
    'top': this.top,
    'width': this.width,
    'height': this.height,
    'z-index': this.zindex
  })

  tool.addClass('annotools') // Update Styles
  // this.tool.makeDraggable(); //Make it Draggable.


  if (this.annotationActive) {

    /*
     * Ganesh
     * Mootools to Jquery for creation of toolbar buttons
     */
    this.rectbutton = jQuery('<img>', {
      title: 'Draw Rectangle',
      class: 'toolButton firstToolButtonSpace inactive',
      src: 'images/rect.svg',
      id: 'drawRectangleButton'
    })
    tool.append(this.rectbutton)

    this.ellipsebutton = jQuery('<img>', {
      'title': 'Draw Ellipse',
      'class': 'toolButton inactive',
      'src': 'images/ellipse.svg'
    })
    tool.append(this.ellipsebutton)

    this.pencilbutton = jQuery('<img>', {
      'title': 'Draw Freeline',
      'class': 'toolButton inactive',
      'src': 'images/pencil.svg',
      'id': 'drawFreelineButton'
    })
    tool.append(this.pencilbutton) // Pencil Tool

    this.measurebutton = jQuery('<img>', {
      'title': 'Measurement Tool',
      'class': 'toolButton inactive',
      'src': 'images/measure.svg'
    })
    // tool.append(this.measurebutton)

    this.spacer2 = jQuery('<img>', {
      'class': 'spacerButton inactive',
      'src': 'images/spacer.svg'
    })
    tool.append(this.spacer2)

    this.filterbutton = jQuery('<img>', {
      'title': 'Filter Markups',
      'class': 'toolButton inactive',
      'src': 'images/filter.svg'
    })
    tool.append(this.filterbutton) // Filter Button

    this.hidebutton = jQuery('<img>', {
      'title': 'Show/Hide Markups',
      'class': 'toolButton inactive',
      'src': 'images/hide.svg'
    })
    tool.append(this.hidebutton)


    /*
    this.fullDownloadButton = jQuery('<img>', {
      'title': 'Download All Markups (Coming Soon)',
      'class': 'toolButton inactive',
      'src': 'images/fullDownload.svg'
    })
    tool.append(this.fullDownloadButton)
    */
    this.spacer1 = jQuery('<img>', {
      'class': 'spacerButton inactive',
      'src': 'images/spacer.svg'
    })
    tool.append(this.spacer1)

    /*
    this.analyticsbutton = jQuery('<img>', {
      'title': 'Analytics Serviecs',
      'class': 'toolButton',
      'src': 'images/analyze.png'

    })
    tool.append(this.analyticsbutton)

    this.filterImgButton = jQuery('<img>', {
      'title': 'Image Filtering',
      'class': 'toolButton',
      'src': 'images/insta.png'
    })
<<<<<<< HEAD
    tool.append(this.filterImgButton)
    */

    //tool.append(this.filterImgButton)	
    //
    /*
    this.bookmarkButton = jQuery('<img>', {
      'title': 'Bookmark/Share current state',
      'class': 'toolButton',
      'src': 'images/ic_insert_link_white_24dp_1x.png'
    })
    //tool.append(this.bookmarkButton)
	*/
    this.partialDownloadButton = jQuery('<img>', {
      'title': 'Download Partial Markups (Coming Soon)',
      'class': 'toolButton inactive',
      'src': 'images/partDownload.svg'
    })
     tool.append(this.partialDownloadButton)  //Partial Download

    /*
     * Event handlers on click for the buttons
     */
    this.rectbutton.on('click', function () {
      //console.log(this.mode);
      if(this.annotools.mode == 'rect'){
        this.setNormalMode();
        //this.
      } else {
        this.mode = 'rect'
        this.annotools.mode = 'rect'
        this.annotools.drawMarkups();
        jQuery("canvas").css("cursor", "crosshair");
        jQuery("#drawRectangleButton").addClass("active"); 
        //console.log(jQuery("#drawRectangleButton")); 
        jQuery("#drawFreelineButton").removeClass("active");

        //console.log("added class");     
      }
    // alert("Creation of markups is disabled on QuIP")
    }.bind(this))
    this.partialDownloadButton.on('click', function(){
      this.annotools.downloadROI();
    }.bind(this));
    this.ellipsebutton.on('click', function () {
      // this.mode = 'ellipse'
      // this.annotools.mode = 'ellipse'
      // this.annotools.drawMarkups()
      alert('Creation of markups is disabled on QuIP')
    }.bind(this))

    this.pencilbutton.on('click', function () {

      if(this.annotools.mode == 'pencil'){
        this.setNormalMode();
      } else {
        //set pencil mode
        this.annotools.mode = 'pencil'
        this.annotools.drawMarkups()
        
        jQuery("canvas").css("cursor", "crosshair");
        //jQuery("drawFreelineButton").css("opacity", 1);
        jQuery("#drawRectangleButton").removeClass("active");
        jQuery("#drawFreelineButton").addClass("active");

      }

    }.bind(this))

    this.measurebutton.on('click', function () {
      this.mode = 'measure'
      this.drawMarkups()
    }.bind(this))

    this.hidebutton.on('click', function () {
      this.annotools.toggleMarkups()
    }.bind(this))

    this.filterbutton.on('click', function () {
      this.toggleAlgorithmSelector()
    // this.removeMouseEvents()
    // this.promptForAnnotation(null, "filter", this, null)
    }.bind(this))
	/*
    this.analyticsbutton.on('click', function () {
      this.annotools.createWorkOrder()
    }.bind(this))

    this.filterImgButton.on('click', function () {
      this.FilterTools.showFilterControls()
    }.bind(this))
	*/
    var toolButtons = jQuery('.toolButton')
    toolButtons.each(function () {
      jQuery(this).on({
        'mouseenter': function () {
          this.addClass('selected')
        },
        'mouseleave': function () {
          this.removeClass('selected')
        }
      })
    })

    /*
    for (var i = 0; i < toolButtons.length; i++) {
        toolButtons[i].on({
            'mouseenter': function () {
                this.addClass('selected')
            },
            'mouseleave': function () {
                this.removeClass('selected')
            }
        })
    }
    */

    /*
     * Ganesh: Using the Mootools version as the jquery version breaks things 
     *
    this.messageBox = jQuery('<div>', {
        'id': 'messageBox'
    })
    jQuery("body").append(this.messageBox)
    */

  }
  this.colorMapButton = jQuery('<img>', {
    'class': 'colorMapButton',
    'title': 'ColorMap',
    'src': 'images/colors.svg'
  })
  tool.append(this.colorMapButton)
  this.ajaxBusy = jQuery('<img>', {
    'class': 'colorMapButton',
    'id': 'ajaxBusy',
    'style': 'scale(0.5, 1)',
    'src': 'images/progress_bar.gif'
  })
  tool.append(this.ajaxBusy)
  this.ajaxBusy.hide()

  this.titleButton = jQuery('<p>', {
    'class': 'titleButton',
    'text': 'caMicroscope'
  })
  tool.append(this.titleButton)

  this.iidbutton = jQuery('<p>', {
    'class': 'iidButton',
    'text': 'SubjectID :' + this.iid
  })
  tool.append(this.iidbutton)

  /* ASHISH - disable quit button
      this.quitbutton = new Element('img', {
          'title': 'quit',
          'class': 'toolButton',
          'src': 'images/quit.svg'
      }).inject(this.tool) //Quit Button
  */
  if (this.annotationActive) {
  }
}



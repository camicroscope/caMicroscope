
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

  this.iid = options.iid || null;
  this.cancerType = options.cancerType;
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

//var available_colors = ['lime', 'red', 'blue', 'orange','silver','maroon','aqua','fuchsia','green','black']
var available_colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

var algorithm_color = {}

function goodalgo (data, status) {
   console.log("goodalgo data is: "+data);
   console.log("data.length is: "+data.length)  
  
  var blob = []
  for (i = 0;i < data.length;i++) {
    var n = {}
    //console.log(data[i])
    data[i].title=data[i].provenance.analysis_execution_id;    
    n.title = "<div class='colorBox' style='background:" + available_colors[i%available_colors.length] + "'></div>" + data[i].title
    n.key = i.toString()
    n.refKey = data[i].provenance.analysis_execution_id
    n.color = available_colors[i%available_colors.length]   
    algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i%available_colors.length];
    blob.push(n)
  }
  
  console.log("blob is: "+blob);
  
  ftree = jQuery('#tree').fancytree({
    source: [{
      title: 'Algorithms', key: '1', folder: true,
      children: blob,
      expanded: true
    }],
    minExpandLevel: 1, // 1: root node is not collapsible
    activeVisible: true, // Make sure, active nodes are visible (expanded).
    aria: false, // Enable WAI-ARIA support.
    autoActivate: true, // Automatically activate a node when it is focused (using keys).
    autoCollapse: false, // Automatically collapse all siblings, when a node is expanded.
    autoScroll: false, // Automatically scroll nodes into visible area.
    clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
    checkbox: true, // Show checkboxes.
    debugLevel: 2, // 0:quiet, 1:normal, 2:debug
    disabled: false, // Disable control
    focusOnSelect: false, // Set focus when node is checked by a mouse click
    generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
    idPrefix: 'ft_', // Used to generate node id´s like <span id='fancytree-id-<key>'>.
    icons: true, // Display node icons.
    keyboard: true, // Support keyboard navigation.
    keyPathSeparator: '/', // Used by node.getKeyPath() and tree.loadKeyPath().
    minExpandLevel: 1, // 1: root node is not collapsible
    quicksearch: false, // Navigate to next node by typing the first letters.
    selectMode: 2, // 1:single, 2:multi, 3:multi-hier
    tabbable: true, // Whole tree behaves as one single control
    titlesTabbable: false, // Node titles can receive keyboard focus
    beforeSelect: function (event, data) {
      // A node is about to be selected: prevent this for folders:
      if (data.node.isFolder()) {
        return false
      }
    },
    select: function (event, data) {
      jQuery('#tree').attr('algotree', true)
      var node = data.node

      console.log('!SELECTED NODE : ' + node.title)
      targetType = data.targetType
      annotool.getMultiAnnot()
    }
  })
}

/*
ToolBar.prototype.toggleAlgorithmSelector = function () {
  if (!jQuery('#algosel').attr('eb')) {
    jQuery('#algosel').attr('eb', true)
    // console.log("initializing...")
    jQuery('#algosel').css({
      'width': '300px',
      'zIndex': 199,
      'visibility': 'hidden'
    })
    jQuery('#algosel').on('mousedown', function (e) {
      jQuery(this).addClass('draggable').parents().on('mousemove', function (e) {
        jQuery('.draggable').offset({
          top: e.pageY - jQuery('.draggable').outerHeight() / 2,
          left: e.pageX - jQuery('.draggable').outerWidth() / 2
        }).on('mouseup', function () {
          jQuery(this).removeClass('draggable')
        })
      })
      e.preventDefault()
    }).on('mouseup', function () {
      jQuery('.draggable').removeClass('draggable')
    })
  }
  if (jQuery('#algosel').css('visibility') == 'visible') {
    jQuery('#algosel').css({
      'visibility': 'hidden'
    })
  } else {
    jQuery('#algosel').css({
      'visibility': 'visible'
    })
  }
  this.showMessage('Algorithm Selection Toggled')
}
*/


var ALGORITHM_LIST = {};
var SELECTED_ALGORITHM_LIST = [];
var SELECTED_ALGORITHM_KEYS = [];
var SELECTED_ALGORITHM_COLOR = {};
var AlgorithmSelectorHidden = true;

ToolBar.prototype.toggleAlgorithmSelector = function () {
  var self  = this;
  console.log("toggleAlgorithmSelector");
	//jQuery("#panel").show("slide");
  var url = 'api/Data/getAlgorithmsForImage.php?iid=' + self.iid;

  var htmlStr = "<div id='panelHeader'> <h4>Select Algorithm </h4> </div> <div id='panelBody'> <ul id='algorithmList'>";
  
  jQuery.get(url, function (data) {

    d = JSON.parse(data)

    ALGORITHM_LIST = d;
	
	var tmp_algorithm_list=[];
	
	for(var i=0; i < d.length; i++){
	   tmp_algorithm_list[i]=d[i].provenance.analysis_execution_id;		 
	}
	
	//tmp_algorithm_list = tmp_algorithm_list.sort();
	
    for(var i=0; i < tmp_algorithm_list.length; i++){
      //n.color = available_colors[i%7];
      //algorithm_color[d[i].provenance.analysis_execution_id] = available_colors[i%7]
      algorithm_color[tmp_algorithm_list[i]] = available_colors[i%available_colors.length];
      SELECTED_ALGORITHM_COLOR[tmp_algorithm_list[i]]= available_colors[i%available_colors.length];
      htmlStr += "<li><input type='checkbox' class='algorithmCheckbox' value="+i+" /><span class='algoColorBox' style='background:"+ algorithm_color[tmp_algorithm_list[i]] +"'></span> "+tmp_algorithm_list[i]
       + "</li>";
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
      SELECTED_ALGORITHM_LIST.push(tmp_algorithm_list[(this).value * 1]);
      SELECTED_ALGORITHM_KEYS.push((this).value*1);
	  
	  console.log("tmp_algorithm_list is: "+tmp_algorithm_list);
	  
	  console.log("index value of array is: "+(this).value * 1);
      });
	  
	   console.log("SELECTED_ALGORITHM_LIST is: "+SELECTED_ALGORITHM_LIST);
	   console.log("SELECTED_ALGORITHM_KEYS is: "+SELECTED_ALGORITHM_KEYS);
      self.annotools.getMultiAnnot();
    }) 

	
   	
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
  jQuery("#drawDotButton").removeClass("active");   // Dot Tool
  jQuery("#mergeStep2Button").removeClass("active");   // merge Step2 Button
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
    
    console.log("self.iid is: "+self.iid);	 
	
    jQuery.get('api/Data/getAlgorithmsForImage.php?iid=' + self.iid, function (data) {
      d = JSON.parse(data);	  
      
	    console.log("data before goodalgo is:"+data);
      console.log("d before goodalgo is:"+d);	
          
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
	 
    this.homebutton = jQuery('<img>', {
      title: 'caMicroscope Home',
      class: 'toolButton firstToolButtonSpace inactive',
      src: 'images/home.png',
      id: 'gotohomebutton'
    })
    tool.append(this.homebutton) 
	 
    this.spacer1 = jQuery('<img>', {
      'class': 'spacerButton inactive',
      'src': 'images/spacer.svg'
    })
    tool.append(this.spacer1)
	
    this.rectbutton = jQuery('<img>', {
      title: 'Draw Rectangle',
      class: 'toolButton inactive',
      src: 'images/rect.svg',
      id: 'drawRectangleButton'
    })
    //tool.append(this.rectbutton)	
   
   
    this.pencilbutton = jQuery('<img>', {
      'title': 'Draw Freeline',
      'class': 'toolButton inactive',
      'src': 'images/pencil.svg',
      'id': 'drawFreelineButton'
    })
    //tool.append(this.pencilbutton) // Pencil Tool	
	
	
    this.mergebutton1 = jQuery('<img>', {
      'title': 'Save ViewPort',
      'class': 'toolButton inactive',
      'src': 'images/merge1.png'
    })
    tool.append(this.mergebutton1) // Merge step 1
	
    this.mergebutton2 = jQuery('<img>', {
      'title': 'Save Rectangle And Delete Annotation(s) Within This Area',
      'class': 'toolButton inactive',
      'src': 'images/rect.svg',
	  'id': 'mergeStep2Button'
    })
    tool.append(this.mergebutton2) // Merge step 2
	
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
	
	
   this.measurebutton = jQuery('<img>', {
      'title': 'Measurement Tool',
      'class': 'toolButton inactive',
      'src': 'images/measure.svg'
    })
    // tool.append(this.measurebutton)

    this.spacer3 = jQuery('<img>', {
      'class': 'spacerButton inactive',
      'src': 'images/spacer.svg'
    })
    tool.append(this.spacer3)

	  
   this.mergebutton3 = jQuery('<img>', {
      'title': 'Generate Composite Dataset',
      'class': 'toolButton inactive',
      'src': 'images/merge2.png',
	  'id': 'mergeStep3Button'
    })
    tool.append(this.mergebutton3) // Merge step 3
   
    this.hidebutton = jQuery('<img>', {
      'title': 'Show/Hide Markups',
      'class': 'toolButton inactive',
      'src': 'images/hide.svg'
    })
   // tool.append(this.hidebutton)
    
	
    this.spacer4 = jQuery('<img>', {
      'class': 'spacerButton inactive',
      'src': 'images/spacer.svg'
    })
    tool.append(this.spacer4)
    
    this.partialDownloadButton = jQuery('<img>', {
      'title': 'Download Partial Markups (Coming Soon)',
      'class': 'toolButton inactive',
      'src': 'images/partDownload.svg'
    })
     //tool.append(this.partialDownloadButton)  //Partial Download
     
    this.spacer5 = jQuery('<img>', {
      'class': 'spacerButton inactive',
      'src': 'images/spacer.svg'
    });
   // tool.append(this.spacer5);
    
    this.dotToolButton = jQuery('<img>', {
        'title': 'Dot Tool',
        'class': 'toolButton inactive',
        'src': 'images/analyze.png',
        'id': 'drawDotButton'
    });
   // tool.append(this.dotToolButton); // Dot Tool
	
   
    /*
     * Event handlers on click for the buttons
     */
	 
    this.homebutton.on('click', function () {
      this.mode = 'home';	 
      var tissueId=annotool.iid;     
      var cancerType=annotool.cancerType;    	  
      //window.location.href = "/camicroscope/osdCamicroscope.php?tissueId="+tissueId+"&cancerType="+cancerType;     	    
      var x1 = annotool.imagingHelper._viewportOrigin['x'];
      var y1 = annotool.imagingHelper._viewportOrigin['y'];
      var x2 = x1 + annotool.imagingHelper._viewportWidth;
      var y2 = y1 + annotool.imagingHelper._viewportHeight;  
      var zoom = viewer.viewport.getZoom();	
      if (zoom<1.0) zoom=1.0;	    
      var width,height;	  
      //get image width and height	
      var url = 'api/Data/getImageInfoByCaseID.php?case_id=' + tissueId;
      jQuery.get(url, function (data) {
      //console.log(data);
      try {
          this_image = JSON.parse(data); 
          width  = this_image[0].width;
	  height = this_image[0].height;	
	  var x= parseInt(((x1+x2)/2.0)*width);
	  var y= parseInt(((y1+y2)/2.0)*height);       
	  window.location.href = "/camicroscope/osdCamicroscope.php?tissueId="+tissueId+"&x="+x+"&y="+y+"&zoom="+zoom;	  
	  } catch (error){
	  window.location.href = "/camicroscope/osdCamicroscope.php?tissueId="+tissueId;
	  }	   
      })        
    }.bind(this))
	 
	 
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
       	jQuery("#mergeStep2Button").removeClass("active"); // merge step 2 button		
        //console.log("added class");     
      }
    // alert("Creation of markups is disabled on QuIP")
    }.bind(this))  
	
    this.partialDownloadButton.on('click', function(){
      this.annotools.downloadROI();
    }.bind(this));
	
	
	this.mergebutton1.on('click', function () {
		this.annotools.mergeStep1();     
     }.bind(this))	 
	
	
	this.mergebutton2.on('click', function () {
      //console.log(this.mode);
      if(this.mode == 'merge_step2'){
		 this.mode = 'normal';
        this.setNormalMode();       
      } else {
        this.mode = 'merge_step2'
        this.annotools.mode = 'rect'
        this.annotools.drawMarkups();		
        jQuery("canvas").css("cursor", "crosshair");
		jQuery("#mergeStep2Button").addClass("active"); // merge step 2 button		
                  
      }    
    }.bind(this))    
    

    this.mergebutton3.on('click', function () {
		this.annotools.generateCompositeDataset();     
    }.bind(this))	
	 
      
    // Dot Tool start
    this.dotToolButton.on('click', function(){
        if (this.annotools.mode == 'dot') {
            this.setNormalMode();
        }else{
            this.mode = 'dot';
            this.annotools.mode = 'dot';
            this.annotools.drawDots();
            jQuery("svg").css("cursor", "crosshair");
            jQuery("#drawRectangleButton").removeClass("active");
            jQuery("#drawFreelineButton").removeClass("active");
			jQuery("#mergeStep2Button").removeClass("active"); // merge step 2 button		
            jQuery("#drawDotButton").addClass("active");
       }   
    }.bind(this)); 
    // Dot Tool end
	

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
        jQuery("#drawDotButton").removeClass("active");     // Dot Tool
		jQuery("#mergeStep2Button").removeClass("active"); // merge step 2 button	
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
    'text': 'caMic Segment Curation App'
  })
  tool.append(this.titleButton)

  this.iidbutton = jQuery('<p>', {
    'class': 'iidButton',
    'text': 'Case ID: ' + this.iid
  })
  tool.append(this.iidbutton)

  
  if (this.annotationActive) {
  }
}



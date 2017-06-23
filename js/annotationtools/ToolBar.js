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


//var available_colors = ['lime', 'red', 'blue', 'orange','lime', 'red', 'blue', 'orange','lime', 'red', 'blue', 'orange']
var available_colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

var algorithm_color = {}

function goodalgo (data, status) {
  // console.log(data)

  var blob = []
  for (i = 0;i < data.length;i++) {
    var n = {}
     
     data[i].title=data[i].provenance.analysis_execution_id;
    
    n.title = "<div class='colorBox' style='background:" + available_colors[i] + "'></div>" + data[i].title;
    n.key = i.toString()
    n.refKey = data[i].provenance.analysis_execution_id
    n.color = available_colors[i%7];
    //algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i%7]
    algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i%available_colors.length];
    blob.push(n)
  }
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

// sorting the algorithms
   var tmp_algorithm_list=[];	
  for(var i=0; i < d.length; i++){
    tmp_algorithm_list[i]=d[i].provenance.analysis_execution_id;		 
   }	
  tmp_algorithm_list = tmp_algorithm_list.sort();    
	  
    ALGORITHM_LIST = d;
    for(var i=0; i < tmp_algorithm_list.length; i++){
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
	console.log(ALGORITHM_LIST);
        SELECTED_ALGORITHM_LIST.push(tmp_algorithm_list[(this).value * 1]);
        SELECTED_ALGORITHM_KEYS.push((this).value*1);
      });

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
      //console.log(data);
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

      /**
       * Toolbar buttons
       */
      this.homebutton = jQuery('<img>', {
          'data-toggle': 'tooltip', 'data-placement': 'bottom',
          src: 'images/ic_home_white_24px.svg',
          class: 'toolButton firstToolButtonSpace',
          title: 'QuIP Home'
      });
      tool.append(this.homebutton);

      this.lymphbutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Lymphocyte & Plasma Cell Annotation App',
          'class': 'toolButton',
          'src': 'images/Heatmap.svg'
      });

      tool.append(this.lymphbutton); // Lymphocyte Button

      this.spacer1 = jQuery('<img>', {
          'class': 'spacerButton',
          'src': 'images/spacer.svg'
      });
      tool.append(this.spacer1);

      /*a link to segment curation application with this composite button */
      this.compositebutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          title: 'Segment Curation App',
          class: 'toolButton',
          src: 'images/composite.png',
          id: 'gotocompositebutton'
      });
      tool.append(this.compositebutton);


      this.rectbutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          title: 'Draw Rectangle',
          id: 'drawRectangle',
          class: 'toolButton firstToolButtonSpace',
          src: 'images/rect.svg'
      });
      //tool.append(this.rectbutton)

      this.ellipsebutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Draw Ellipse',
          'class': 'toolButton',
          'src': 'images/ellipse.svg'
      });
      //tool.append(this.ellipsebutton)

      this.pencilbutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Draw Freeline',
          'class': 'toolButton',
          'src': 'images/pencil.svg'
      });
      //tool.append(this.pencilbutton) // Pencil Tool

      this.measurebutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Measurement Tool',
          'class': 'toolButton',
          'src': 'images/measure.svg'
      });
      // tool.append(this.measurebutton)

      this.spacer2 = jQuery('<img>', {
          'class': 'spacerButton',
          'src': 'images/spacer.svg'
      });
      tool.append(this.spacer2);

      this.filterbutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Filter Markups',
          'class': 'toolButton firstToolButtonSpace',
          'src': 'images/filter.svg'
      });
      tool.append(this.filterbutton); // Filter Button


      this.hidebutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Show/Hide Markups',
          'class': 'toolButton',
          'src': 'images/hide.svg'
      });
      //tool.append(this.hidebutton)

      this.fullDownloadButton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Download All Markups (Coming Soon)',
          'class': 'toolButton',
          'src': 'images/fullDownload.svg'
      });
      //tool.append(this.fullDownloadButton)
      this.spacer1 = jQuery('<img>', {
          'class': 'spacerButton',
          'src': 'images/spacer.svg'
      });
      tool.append(this.spacer1);

      this.analyticsbutton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Image Analysis',
          'class': 'toolButton',
          'src': 'images/analyze.png'

      });
      tool.append(this.analyticsbutton);

      this.filterImgButton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'View Results',
          'class': 'toolButton',
          'src': 'images/insta.png'
      });
      //tool.append(this.filterImgButton)

      this.bookmarkButton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Bookmark/Share current state',
          'class': 'toolButton',
          'src': 'images/ic_insert_link_white_24dp_1x.png'
      });
      //tool.append(this.bookmarkButton)

      this.partialDownloadButton = jQuery('<img>', {
          'data-toggle': 'tooltip',
          'data-placement': 'bottom',
          'title': 'Download Partial Markups (Coming Soon)',
          'class': 'toolButton',
          'src': 'images/partDownload.svg'
      });
    // tool.append(this.partialDownloadButton)  //Partial Download

    /*
     * Event handlers for toolbar buttons
     */
		this.homebutton.on('click', function(){
		 window.location.href = "/select.php";
		});
    
    this.lymphbutton.on('click', function () {
        var tissueId=this.iid;	
	window.location.href = "/camicroscope/osdCamicroscope_Lymph.php?tissueId="+tissueId;	
    }.bind(this))
   
    this.compositebutton.on('click', function () {
       this.mode = 'composite';
       var tissueId=this.iid;
       //window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId="+tissueId;
      	    
       var x1 = annotool.imagingHelper._viewportOrigin['x'];
       var y1 = annotool.imagingHelper._viewportOrigin['y'];
       var x2 = x1 + annotool.imagingHelper._viewportWidth;
       var y2 = y1 + annotool.imagingHelper._viewportHeight;  
       var zoom = viewer.viewport.getZoom();	
       //zoom = parseInt(zoom);    
       if (zoom<1.0) zoom=1.0;  
       var width,height;	  
	//get image width and height	
       var url = 'api/Data/getImageInfoByCaseID.php?case_id=' + tissueId;
        //console.log(url);
       jQuery.get(url, function (data) {
           //console.log(data);
	   try{
           	this_image = JSON.parse(data); 
           	width  = this_image[0].width;
	  	height = this_image[0].height;	
	  	var x= parseInt(((x1+x2)/2.0)*width);
	   	var y= parseInt(((y1+y2)/2.0)*height);       
	  	window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId="+tissueId+"&cancerType=quip&x="+x+"&y="+y+"&zoom="+zoom;
	   } catch (error) {
		window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId="+tissueId;
	   }
      })
	    
    }.bind(this))
    
    

    this.rectbutton.on('click', function () {
      this.mode = 'rect'
      this.annotools.mode = 'rect'
      this.annotools.drawMarkups()
    // alert("Creation of markups is disabled on QuIP")
    }.bind(this))

    this.bookmarkButton.on('click', function () {
      console.log('bookmark')

      /* Get ViewPort */
      var bounds = viewer.viewport.getBounds()
      console.log(bounds)

      /* Get Filters */
      var filters = []
      jQuery('#selected li').each(function () {
        var id = this.id
        var filter = hashTable[id]
        // filters.push(filter.generatedFilter.getFilter())
        // console.log(filter)
        var f = {}
        var filterName = filter.name
        var filterVal = filter.generatedFilter.getParams()
        f.name = filterName
        f.value = filterVal
        filters.push(f)
      // sync &= filter.generatedFilter.sync
      })
      console.log(filters)

      var state = {
        'state': {
          'filters': filters,
          'viewport': bounds,
          'pan': viewer.viewport.getCenter(),
          'zoom': viewer.viewport.getZoom(),
          'tissueId': this.annotools.iid
        }
      }
      console.log(state)
      // var bookmarkURLDiv = jQuery.create('<div>').addClass('bookmarkURLDiv')
      var bookmarkURLDiv = jQuery('#bookmarkURLDiv')
      bookmarkURLDiv.html('')
      var input = jQuery('<input>')
      var submit = jQuery('<button>')
      submit.html("Close");
      bookmarkURLDiv.append(input)
      bookmarkURLDiv.append(submit)
      bookmarkURLDiv.show()
      jQuery.ajax({
        'type': 'POST',
        //'url': 'https://test-8f679.firebaseio.com/camicroscopeStates.json?auth=kweMPSAo4guxUXUodU0udYFhC27yp59XdTEkTSJ4',
        'url': 'api/Data/loadState.php',
        'data': JSON.stringify(state),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
          console.log('posted!')
          console.log(data)
          var url = 'http://dragon.cci.emory.edu/camicroscope3/osdCamicroscope.php?tissueId=TCGA-02-0001&stateID=' + data.name
          console.log(url)
          input.val(url)
          input.select()
        }
      });

      submit.on("click", function() {
        bookmarkURLDiv.hide();
      });

    }.bind(this))

    this.ellipsebutton.on('click', function () {
      // this.mode = 'ellipse'
      // this.annotools.mode = 'ellipse'
      // this.annotools.drawMarkups()
      alert('Creation of markups is disabled on QuIP')
    }.bind(this))

    this.pencilbutton.on('click', function () {
      this.annotools.mode = 'pencil'
      this.annotools.drawMarkups()
    // alert("Creation of markups is disabled on QuIP")
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

    this.analyticsbutton.on('click', function () {
      this.annotools.createWorkOrder()
    }.bind(this))

    this.filterImgButton.on('click', function () {
      this.FilterTools.showFilterControls()
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
  //tool.append(this.colorMapButton)
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
    'id': 'titleButton',
    'text': 'caMicroscope'
  })
  tool.append(this.titleButton)

  this.iidbutton = jQuery('<p>', {
    'class': 'iidButton',
    'text': 'Case ID: ' + this.iid
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



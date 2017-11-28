/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.
 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

console.log("osdAnnotationTools_Lymph.js");

var annotools = function (options) {
  this.AnnotationStore = new AnnotationStore(options.iid)

  this.annotationActive = isAnnotationActive()

  this.ratio = options.ratio || 0.005; // One pixel equals to the length in real situation. Will be used in the measurement tool
  this.maxWidth = options.maxWidth || 4000 // MaxWidth of the Image
  this.maxHeight = options.maxHeight || 800 // //MaxHeight of the Image
  this.initialized = false
  this.color = options.color || 'lime' // Default Annotation Color

  this.iidDecoded = decodeURI(options.iid)
  this.canvas = options.canvas; // The canvas Element that The Use will be drawing annotatoins on.
  this.iid = options.iid || null // The Image ID
  this.annotVisible = true // The Annotations are Set to be visible at the First Loading
  this.mode = 'default' // The Mode is Set to Default

  this.username = options.username; // Username from session variable
  console.log(this.username);

  this.viewer = options.viewer
  this.imagingHelper = this.viewer.imagingHelper
  this.mpp = options.mpp
  this.mppx = parseFloat(this.mpp['mpp-x'])
  this.mppy = parseFloat(this.mpp['mpp-y'])
  this.x1 = 0.0
  this.x2 = 1.0
  this.y1 = 0.0
  this.y2 = 1.0

  this.annotationHandler = options.annotationHandler || new AnnotoolsOpenSeadragonHandler()
  // Added variables and event handler
  //this.heatmap_opacity = 0.4;
  //this.heatmapColor = ['#bd0026','#fd8d3c','#fecc5c','#feedde'];
  this.marking_choice = 'LymPos';
  //this.isLoadedWeight = false;
  this.loadHeatmapWeight();
  this.loadChangeUsername();
  this.isLymphSuperuser();
  this.lymphSuperuser = false;
  this.btn_revertWeight = document.getElementById('btn_revertWeight');
  this.btn_saveWeight = document.getElementById('btn_saveHeatmapWeight');
  this.btn_saveweight_help = document.getElementById('btn_heatmapweight_help');
  this.rb_lymposbig = document.getElementById('LymPosBig');
  this.rb_lymnegbig = document.getElementById('LymNegBig');
  this.rb_lympos = document.getElementById('LymPos');
  this.rb_lymneg = document.getElementById('LymNeg');
  this.rb_tumpos = document.getElementById('TumorPos');
  this.rb_tumneg = document.getElementById('TumorNeg');
  this.rb_move = document.getElementById('rb_Moving');
  this.rb_lymposbig.addEventListener('click', this.radiobuttonChange.bind(this), false);
  this.rb_lymnegbig.addEventListener('click', this.radiobuttonChange.bind(this), false);
  this.rb_lympos.addEventListener('click', this.radiobuttonChange.bind(this), false);
  this.rb_lymneg.addEventListener('click', this.radiobuttonChange.bind(this), false);
  this.rb_tumpos.addEventListener('click', this.radiobuttonChange.bind(this), false);
  this.rb_tumneg.addEventListener('click', this.radiobuttonChange.bind(this), false);
  this.rb_move.addEventListener('click', this.radiobuttonChange.bind(this), false);

  this.btn_revertWeight.addEventListener('click', this.revertWeight.bind(this), false);
  this.btn_saveWeight.addEventListener('click', this.saveHeatmapWeight.bind(this), false);
  this.btn_saveweight_help.addEventListener('click', function(){alert('\
This panel allows you to adjust the automatic lymphocyte prediction results for this slide, with the options described below.\n\n\
Lymphocyte Sensitivity bar:\n       Ddjust the sensitivity of lymphocyte prediction.\n\
       Choose a higher volume for more predicted lymphocyte regions\n\n\
Necrosis Specificity bar:\n       Ddjust the specificity of necrosis prediction.\n\
       Choose a higher volume for more predicted lymphocyte regions\n\n\
Lymphocyte Prediction box:\n       Show lymphocyte prediction without necrosis filtering.\n\n\
Necrosis Prediction box:\n       Show necrosis prediction.\n\n\
Lym Prediction with Nec Filtering box:\n       Show lymphocyte prediction with necrosis filtering (recommended).\n\n\
');}, false);

  /*
  for (var su_i = 0; su_i <= 64; ++su_i) {
      switch_user_eles = document.getElementById('switch_user_' + su_i.toString());
      if (switch_user_eles != null) {
          switch_user_eles.addEventListener('click', this.switchUserRadiobuttonChange.bind(this), false);
      } else {
          break;
      }
  }
  */

  this.btn_savemark_var = document.getElementById('btn_savemark');
  this.btn_savemark_var.addEventListener('click', this.markSaveClick.bind(this), false);
  this.btn_undomark_var = document.getElementById('btn_undomark');
  this.btn_undomark_help_var = document.getElementById('btn_mark_help');
  this.btn_undomark_var.addEventListener('click', this.undoStroke.bind(this), false);
  this.btn_undomark_help_var.addEventListener('click', function(){alert('\
This panel provides tools to manually mark lymphocyte/non-lymphocyte, tumor/non-tumor regions.\n\n\
If you are unsatisfied with the lymphocyte prediction result, please polish it using options described below:\n\
   LymPos (draw thin line):\n\
       Draw lines across lymphocyte squares.\n\
       After saved, squares crossed by the line\n\
       will be marked as lymphocyte squares.\n\
   LymNeg (draw thin line):\n\
       Draw lines across non-lymphocyte squares.\n\
       After saved, squares crossed by the line\n\
       will be marked as non-lymphocyte squares.\n\
   LymPos (draw thick line):\n\
       Draw lines across lymphocyte squares.\n\
       After saved, squares close to the line\n\
       will be marked as lymphocyte squares.\n\
   LymNeg (draw thick line):\n\
       Draw lines across non-lymphocyte squares.\n\
       After saved, squares close to the line\n\
       will be marked as non-lymphocyte squares.\n\n\
Please indicate tumor regions using options described below:\n\
   TumorPos (draw polygon):\n\
       Draw curves around tumor regions of this slide.\n\
       Regions not included will be considered as non-tumor\n\
       regions by default.\n\
   TumorNeg (draw polygon):\n\
       Draw curves around non-tumor regions of this slide.\n\
       Note that you can draw curves around tumor regions\n\
       using the TumorPos option, and regions not included in\n\
       the TumorPos region will be considered as non-tumor by\n\
       default. Therefore you do not have to use this option.\n\
       Nevertheless, you can use this option to overwrite\n\
       regions you previously masked as tumor regions to\n\
       non-tumor regions.\n\n\
To save/cancel your work, use the buttons described below:\n\
   Save then Move Around:\n\
       Save all markings and switch to the navigation\n\
       mode (Zoom in/out, move the slide around).\n\
   Save:\n\
       Save all markings, and continue to mark.\n\
   Cancel:\n\
       Cancel the most recent, unsaved marking.\n\
       To change saved markings, you can simply\n\
       overwrite them by drawing new markings.\
');}, false);

  this.heatmap_opacity = 0.4;
  this.heatmapColor = ['#feedde','#fecc5c','#fd8d3c','#bd0026', '#33b5ff'];
  this.multipleHeatmapColor = [];
  this.cb_checked = [false, false, false];
  this.heat_weight = [0.77, 1.00, 0.15];
  this.prev_heat_weight = [0.77, 1.00, 0.15];
  this.loadedWeight = false;
  //this.loadHeatmapWeight();
  bar_var1 = document.getElementById('bar1');
  bar_var2 = document.getElementById('bar2');
  bar_var3 = document.getElementById('bar3');
  slide_var1 = document.getElementById('slide1');
  slide_var2 = document.getElementById('slide2');
  slide_var3 = document.getElementById('slide3');
  cb1 = document.getElementById('cb1');
  cb2 = document.getElementById('cb2');
  cb3 = document.getElementById('cb3');
  bar_click = 0;    // 0: no bar is clicked, 1: bar_1 is clicked, 2: bar_2 is clicked, 3: bar_3 is clicked

  bar_var1.addEventListener('mousedown', this.barMouseDown, false);
  bar_var1.addEventListener('mouseup', this.barMouseUp.bind(this), false);
  bar_var1.addEventListener('mousemove', this.barMouseSlide, false);
  bar_var1.addEventListener('mouseleave', this.barMouseUp.bind(this), false);

  bar_var2.addEventListener('mousedown', this.barMouseDown, false);
  bar_var2.addEventListener('mouseup', this.barMouseUp.bind(this), false);
  bar_var2.addEventListener('mousemove', this.barMouseSlide, false);
  bar_var2.addEventListener('mouseleave', this.barMouseUp.bind(this), false);

  bar_var3.addEventListener('mousedown', this.barMouseDown, false);
  bar_var3.addEventListener('mouseup', this.barMouseUp.bind(this), false);
  bar_var3.addEventListener('mousemove', this.barMouseSlide, false);
  bar_var3.addEventListener('mouseleave', this.barMouseUp.bind(this), false);

  cb1.addEventListener('change', this.checkboxChange.bind(this), false);
  cb2.addEventListener('change', this.checkboxChange.bind(this), false);
  cb3.addEventListener('change', this.checkboxChange.bind(this), false);

  // Markup line width
  this.markupline_width = 1;

  // Added code for temp radio box on weights
  var lymse = document.getElementById('LymSe');
  var necse = document.getElementById('NecSe');
  var bothse = document.getElementById('BothSe');
  lymse.addEventListener('change', this.lymnecWeightChange.bind(this), false);
  necse.addEventListener('change', this.lymnecWeightChange.bind(this), false);
  bothse.addEventListener('change', this.lymnecWeightChange.bind(this), false);
  cb1.style.visibility = "hidden";
  cb2.style.visibility = "hidden";
  cb3.style.visibility = "hidden";
    
  // Turn on-off lymphocyte heat
  this.lymheat = true;

  /*
   * OpenSeaDragon events
   */
  this.viewer.addHandler('animation-finish', function (event) {
    var self = this
    self.getMultiAnnot()
  }.bind(this))
  this.viewer.addHandler('animation-start', function (event) {
    var markup_svg = document.getElementById('markups')
    if (markup_svg) {
      // console.log("destroying")
      markup_svg.destroy()
    // console.log("destroyed")
    }
  })

  window.addEvent('domready', function () {
    /*temp*/
    var self = this
    self.setupHandlers()

  // this.getAnnot()
  // ToolBar.createButtons()
  }.bind(this)) // Get the annotation information and Create Buttons

  if (this.annotationActive) {
    // this.getAnnot()
  }
  this.imagingHelper.addHandler('image-view-changed', function (event) {
    // this.getAnnot()
  }.bind(this))

  this.messageBox = new Element('div', {
    'id': 'messageBox'
  }).inject(document.body) // Create A Message Box

  this.showMessage('Press white space to toggle annotations')
  /*
  this.drawLayer = jQuery('<div>', {
      html: "",
      styles: {
          position: 'absolute', 
          'z-index': 1
      }
  })
  jQuery("body").append(this.drawLayer)
  */

  this.drawLayer = new Element('div', {
    html: '',
    styles: {
      position: 'absolute',
      'z-index': 1
    }
  }).inject(document.body) // drawLayer will hide by default
  //this.drawLayer.bind('keydown', this.keyPress);

  // this.drawCanvas = jQuery('<canvas></canvas>')
  // this.drawCanvas.css({"position": "absolute", "z-index": 1})
  // this.drawLayer.append(this.drawCanvas)

  this.drawCanvas = new Element('canvas').inject(this.drawLayer)
  // this.drawLayer.hide()
  /*
  this.magnifyGlass = new Element('div', {
      'class': 'magnify'
  }).inject(document.body) //Magnify glass will hide by default
  this.magnifyGlass.hide()
  */
  this.magnifyGlass = jQuery('<div>', {
    'class': 'magnify'
  })
  jQuery('body').append(this.magnifyGlass)
  this.magnifyGlass.hide()
}

annotools.prototype.destroyMarkups = function (viewer) {
  var markup_svg = document.getElementById('markups')
  if (markup_svg) {
    // console.log("destroying")
    markup_svg.destroy()
  // console.log("destroyed")
  }
}

annotools.prototype.getMultiAnnot = function (viewer) {
  var opa = []

  var val1 = ''
  var val2 = ''
  var val3 = ''

  
    
  var algorithms = []

  /*
  if (jQuery('#tree').attr('algotree')) {
    var selalgos = jQuery('#tree').fancytree('getTree').getSelectedNodes()
    console.log("selalgos is: "+selalgos);
    for (i = 0; i < selalgos.length; i++) {
      //console.log(selalgos[i])
      algorithms.push(selalgos[i].refKey)
      console.log("selalgos refKey is: "+selalgos[i].refKey);
    // opa["Val" + (i + 1).toString()] = selalgos[i].refKey
    }
  }*/
  
  console.log(ALGORITHM_LIST);
  console.log(SELECTED_ALGORITHM_LIST);
  SELECTED_ALGORITHM_LIST = SELECTED_ALGORITHM_LIST.sort();
  console.log("....");
  algorithms = SELECTED_ALGORITHM_LIST;
    
    
  //console.log(algorithms);
  //console.log(this.imagingHelper._viewportWidth);
  //console.log(this.imagingHelper._viewportHeight);
  var self = this
  this.x1 = this.imagingHelper._viewportOrigin['x']
  this.y1 = this.imagingHelper._viewportOrigin['y']
  this.x2 = this.x1 + this.imagingHelper._viewportWidth
  this.y2 = this.y1 + this.imagingHelper._viewportHeight

  boundX1 = this.imagingHelper.physicalToLogicalX(200)
  boundY1 = this.imagingHelper.physicalToLogicalY(20)
  boundX2 = this.imagingHelper.physicalToLogicalX(20)
  boundY2 = this.imagingHelper.physicalToLogicalY(20)
  var boundX = boundX1 - this.x1
  var boundY = boundX

  var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9))
  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0))
  var area = (max.x - origin.x) * (max.y - origin.y)
  //algorithms.push('test')

  var t1 = 0
  if (algorithms.length) {
    if (this.toolBar !== undefined && this.toolBar !== null) {
      this.toolBar.titleButton.hide();
      this.toolBar.ajaxBusy.show();
    }
    //this.toolBar.titleButton.hide()
    //this.toolBar.ajaxBusy.show()
    this.annotations = this.AnnotationStore.fetchAnnotations(this.x1, this.y1, this.x2, this.y2, area, algorithms, function (data) {
      // console.log(data)
      self.annotations = data
      self.displayGeoAnnots()
      self.setupHandlers()
      var t2 = 10

      self.toolBar.titleButton.show()
      self.toolBar.ajaxBusy.hide()
    })
  } else {
    self.setupHandlers()
    self.destroyMarkups()
  // destroy canvas
  }
}

annotools.prototype.getAnnot = function (viewer) // Get Annotation from the API
{
  var self = this
  this.x1 = this.imagingHelper._viewportOrigin['x']
  this.y1 = this.imagingHelper._viewportOrigin['y']
  this.x2 = this.x1 + this.imagingHelper._viewportWidth
  this.y2 = this.y1 + this.imagingHelper._viewportHeight

  boundX1 = this.imagingHelper.physicalToLogicalX(200)
  boundY1 = this.imagingHelper.physicalToLogicalY(20)
  boundX2 = this.imagingHelper.physicalToLogicalX(20)
  boundY2 = this.imagingHelper.physicalToLogicalY(20)
  var boundX = boundX1 - this.x1
  var boundY = boundX

  var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9))
  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0))
  var area = (max.x - origin.x) * (max.y - origin.y)

  // var t1 = performance.now()
  this.annotations = this.AnnotationStore.getAnnotations(this.x1, this.y1, this.x2, this.y2, area, boundX, boundY, boundX, boundY, function (data) {
    self.annotations = data
    self.displayGeoAnnots()
    self.setupHandlers()
  // var t2 = performance.now()

  })
}

annotools.prototype.getAnnotFilter = function (author, grade, multi) // Get Annotation from the API
{
  if (this.initialized) {
    this.x1 = this.imagingHelper._viewportOrigin['x']
    this.y1 = this.imagingHelper._viewportOrigin['y']
    this.x2 = this.x1 + this.imagingHelper._viewportWidth
    this.y2 = this.y1 + this.imagingHelper._viewportHeight
  }

  this.initialized = true

  var jsonRequest = new Request.JSON({
    // url: IP + 'api/getAnnotSpatial.php',
    url: 'api/Data/getAnnotSpatialFilter.php',
    onSuccess: function (e) {
      if (e == null) this.annotations = []
      else this.annotations = e
      this.convertAllToNative()
      this.displayAnnot() // Display The Annotations
      this.relativeToGlobal()
      this.setupHandlers()
    // console.log("successfully get annotations")
    }.bind(this),
    onFailure: function (e) {
      this.showMessage('cannot get the annotations,please check your getAnnot function')
      this.annotations = []
    }.bind(this)
  }).get({
    'iid': this.iid,
    'x': this.x1,
    'y': this.y1,
    'x1': this.x2,
    'y1': this.y2,
    'author': author,
    'grade': grade,
    'multi': multi
  })
}

annotools.prototype.keyPress = function (code) // Key Down Events Handler
{
  console.log('enter keypress');
  switch (code) {
    case 84:
      // press t to toggle tools
      this.tool.toggle()
      break
    /* ASHISH Disable quit
            case 81:
                //press q to quit current mode and return to the default mode
                this.quitMode()
                this.quitbutton.hide()
                break
    */
    case 72:
      // press white space to toggle annotations
      this.toggleMarkups()
      break
    case 82:
      // 1 for rectangle mode
      this.mode = 'rect'
      this.drawMarkups()
      break
    case 67:
      // 2 for ellipse mode
      this.mode = 'ellipse'
      this.drawMarkups()
      break
    case 80:
      // 3 for polyline mode
      this.mode = 'polyline'
      this.drawMarkups()
      break
    case 70:
      // 4 for pencil mode
      this.mode = 'pencil'
      this.drawMarkups()
      break
    case 77:
      // 5 for measurement mode
      this.mode = 'measure'
      this.drawMarkups()
      break
    case 69:
      // 6 for magnify mode
      this.mode = 'magnify'
      this.magnify()
      break
    case 81:
      console.log('abc');
      break;
  }
}

annotools.prototype.drawMarkups = function () // Draw Markups
{
  this.showMessage() // Show Message
  this.drawCanvas.removeEvents('mouseup')
  this.drawCanvas.removeEvents('mousedown')
  this.drawCanvas.removeEvents('mousemove')
  this.drawLayer.show() // Show The Drawing Layer
  /* ASHISH Disable quit
      this.quitbutton.show() //Show The Quit Button
  */
  this.magnifyGlass.hide() // Hide The Magnifying Tool
  // this.container = document.id(this.canvas) //Get The Canvas Container
  this.container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
  // this.container = document.getElementById('container') //Get The Canvas Container
  if (this.container) {
    // var left = parseInt(this.container.offsetLeft), //Get The Container Location
    var left = parseInt(this.container.getLeft()), // Get The Container Location
      top = parseInt(this.container.offsetTop),
      width = parseInt(this.container.offsetWidth),
      height = parseInt(this.container.offsetHeight),
      oleft = left,
      otop = top,
      owidth = width,
      oheight = height

    if (left < 0) {
      left = 0
      width = window.innerWidth
    } // See Whether The Container is outside The Current ViewPort
    if (top < 0) {
      top = 0
      height = window.innerHeight
    }
    // Recreate The CreateAnnotation Layer Because of The ViewPort Change Issue.
    this.drawLayer.set({
      'styles': {
        left: left,
        top: top,
        width: width,
        height: height
      }
    })
    // Create Canvas on the CreateAnnotation Layer
    this.drawCanvas.set({
      width: width,
      height: height
    })
    // The canvas context
    var ctx = this.drawCanvas.getContext('2d')
    // Draw Markups on Canvas
    switch (this.mode) {
      case 'rect':
        this.drawRectangle(ctx)
        break
      case 'ellipse':
        this.drawEllipse(ctx)
        break
      case 'pencil':
        this.drawPencil(ctx)
        break
      case 'polyline':
        this.drawPolyline(ctx)
        break
      case 'measure':
        this.drawMeasure(ctx)
        break
      case 'free_markup':
        this.drawMarking(ctx)
        break
    }
  } else this.showMessage('Container Not SET Correctly Or Not Fully Loaded Yet')
}

annotools.prototype.createWorkOrder = function () {
  this.showMessage() // Show Message
  this.drawCanvas.removeEvents('mouseup')
  this.drawCanvas.removeEvents('mousedown')
  this.drawCanvas.removeEvents('mousemove')
  this.drawLayer.show() // Show The Drawing Layer
  /* ASHISH Disable quit
      this.quitbutton.show() //Show The Quit Button
  */
  this.magnifyGlass.hide() // Hide The Magnifying Tool
  // this.container = document.id(this.canvas) //Get The Canvas Container
  this.container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
  // this.container = document.getElementById('container') //Get The Canvas Container
  if (this.container) {
    // var left = parseInt(this.container.offsetLeft), //Get The Container Location
    var left = parseInt(this.container.getLeft()), // Get The Container Location
      top = parseInt(this.container.offsetTop),
      width = parseInt(this.container.offsetWidth),
      height = parseInt(this.container.offsetHeight),
      oleft = left,
      otop = top,
      owidth = width,
      oheight = height

    if (left < 0) {
      left = 0
      width = window.innerWidth
    } // See Whether The Container is outside The Current ViewPort
    if (top < 0) {
      top = 0
      height = window.innerHeight
    }
    // Recreate The CreateAnnotation Layer Because of The ViewPort Change Issue.
    this.drawLayer.set({
      'styles': {
        left: left,
        top: top,
        width: width,
        height: height
      }
    })
    // Create Canvas on the CreateAnnotation Layer
    this.drawCanvas.set({
      width: width,
      height: height
    })
    // The canvas context
    var ctx = this.drawCanvas.getContext('2d')

   
    this.removeMouseEvents()
    var started = false
    var min_x,min_y,max_x,max_y,w,h
    var startPosition
    this.drawCanvas.addEvent('mousedown', function (e) {
      started = true
      startPosition = OpenSeadragon.getMousePosition(e.event)
      x = startPosition.x
      y = startPosition.y
    })

    this.drawCanvas.addEvent('mousemove', function (e) {
      if (started) {
        ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height)
        var currentMousePosition = OpenSeadragon.getMousePosition(e.event)

        min_x = Math.min(currentMousePosition.x, startPosition.x)
        min_y = Math.min(currentMousePosition.y, startPosition.y)
        max_x = Math.max(currentMousePosition.x, startPosition.x)
        max_y = Math.max(currentMousePosition.y, startPosition.y)
        w = Math.abs(max_x - min_x)
        h = Math.abs(max_y - min_y)
        ctx.strokeStyle = this.color
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.fillRect(min_x, min_y, w, h)
        ctx.strokeRect(min_x, min_y, w, h)
      }
    }.bind(this))

    this.drawCanvas.addEvent('mouseup', function (e) {
      started = false
      var finalMousePosition = new OpenSeadragon.getMousePosition(e.event)

      min_x = Math.min(finalMousePosition.x, startPosition.x)
      min_y = Math.min(finalMousePosition.y, startPosition.y)
      max_x = Math.max(finalMousePosition.x, startPosition.x)
      max_y = Math.max(finalMousePosition.y, startPosition.y)

      var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
      var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
      var newAnnot = {
        x: startRelativeMousePosition.x,
        y: startRelativeMousePosition.y,
        w: w,
        h: h,
        type: 'rect',
        color: this.color,
        loc: []
      }

      var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))

      newAnnot.x = globalNumbers.nativeX
      newAnnot.y = globalNumbers.nativeY
      newAnnot.w = globalNumbers.nativeW
      newAnnot.h = globalNumbers.nativeH
      var loc = []
      loc[0] = parseFloat(newAnnot.x)
      loc[1] = parseFloat(newAnnot.y)
      newAnnot.loc = loc

      // convert to geojson 
      // var geoNewAnnot = this.convertRectToGeo(newAnnot)
      geoNewAnnot = newAnnot
      this.promptForWorkOrder(geoNewAnnot, 'new', this, ctx)
    }.bind(this))
  }
}

annotools.prototype.magnify = function () // Magnify Tool
{
  /* ASHISH Disable quit
      this.quitbutton.show()
  */
  this.drawLayer.hide()
  this.magnifyGlass.hide()
  this.magnifyGlass.set({
    html: ''
  })
  var content = new Element('div', {
    'class': 'magnified_content',
    styles: {
      width: document.getSize().x,
      height: document.getSize().y
    }
  })
  content.set({
    html: document.body.innerHTML
  })
  content.inject(this.magnifyGlass)
  var scale = 2.0
  var left = parseInt(this.magnifyGlass.style.left)
  var top = parseInt(this.magnifyGlass.style.top)
  this.magnifyGlass.set({
    'styles': {
      left: left,
      top: top
    }
  })
  content.set({
    'styles': {
      left: -scale * left,
      top: -scale * top
    }
  })
  this.magnifyGlass.show()
  this.magnifyGlass.makeDraggable({
    onDrag: function (draggable) {
      this.showMessage('drag the magnifying glass')
      var left = parseInt(this.magnifyGlass.style.left)
      var top = parseInt(this.magnifyGlass.style.top)
      this.magnifyGlass.set({
        'styles': {
          left: left,
          top: top
        }
      })
      content.set({
        'styles': {
          left: -scale * left,
          top: -scale * top
        }
      })
    }.bind(this)
  /*ASHISH DIsable quit
          ,onDrop: function (draggable) {
              this.showMessage("Press q to quit")
          }.bind(this)
  */
  })
}

annotools.prototype.selectColor = function () // Pick A Color
{
  this.colorContainer = new Element('div').inject(this.tool)
  var blackColor = new Element('img', {
    'class': 'colorButton',
    'title': 'black',
    'styles': {
      'background-color': 'black'
    },
    'events': {
      'click': function () {
        this.color = 'black'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var redColor = new Element('img', {
    'class': 'colorButton',
    'title': 'Default',
    'styles': {
      'background-color': 'red'
    },
    'events': {
      'click': function () {
        this.color = 'red'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var blueColor = new Element('img', {
    'class': 'colorButton',
    'title': 'blue',
    'styles': {
      'background-color': 'blue'
    },
    'events': {
      'click': function () {
        this.color = 'blue'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var greenColor = new Element('img', {
    'class': 'colorButton',
    'title': 'lime',
    'styles': {
      'background-color': 'lime'
    },
    'events': {
      'click': function () {
        this.color = 'lime'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var purpleColor = new Element('img', {
    'class': 'colorButton',
    'title': 'purple',
    'styles': {
      'background-color': 'purple'
    },
    'events': {
      'click': function () {
        this.color = 'purple'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var orangeColor = new Element('img', {
    'class': 'colorButton',
    'title': 'orange',
    'styles': {
      'background-color': 'orange'
    },
    'events': {
      'click': function () {
        this.color = 'orange'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var yellowColor = new Element('img', {
    'class': 'colorButton',
    'title': 'yellow',
    'styles': {
      'background-color': 'yellow'
    },
    'events': {
      'click': function () {
        this.color = 'yellow'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var pinkColor = new Element('img', {
    'class': 'colorButton',
    'title': 'pink',
    'styles': {
      'background-color': 'pink'
    },
    'events': {
      'click': function () {
        this.color = 'pink'
        this.colorContainer.destroy()
      }.bind(this)
    }
  }).inject(this.colorContainer)
  var colorButtons = document.getElements('.colorButton')
  for (var i = 0; i < colorButtons.length; i++) {
    colorButtons[i].addEvents({
      'mouseenter': function () {
        this.addClass('selected')
      },
      'mouseleave': function () {
        this.removeClass('selected')
      }
    })
  }
}

annotools.prototype.addnewAnnot = function (newAnnot) // Add New Annotations
{
  // console.log(this)
  // newAnnot.iid = this.iid
  // newAnnot.annotIdi = MD5(new Date().toString())
  // console.log(newAnnot)
  // this.annotations.push(newAnnot)
  // console.log(this.annotations)
  //console.log(newAnnot)
  this.saveAnnot(newAnnot)
  // console.log("saved annotation")

  this.displayGeoAnnots()
}

annotools.prototype.addnewAnnot_Array = function (newAnnot_arr) // Add New Annotations
{
  for (i = 0; i< newAnnot_arr.length; i++) {
      this.saveAnnot_noRefresh(newAnnot_arr[i]);
  }
  $(document).ajaxStop(function () {
      // 0 === $.active
      this.getMultiAnnot();
      this.displayGeoAnnots();
  });

  // Sleep a while to have enough time for synchronization between web and database
  var start = new Date().getTime();
  var delay = 200;
  while (new Date().getTime() < start + delay);


  this.getMultiAnnot();
  this.displayGeoAnnots();
}

/*ASHISH DIsable quit
quitMode: function () //Return To the Default Mode
{
    this.drawLayer.hide()
    this.magnifyGlass.hide()
},
*/
annotools.prototype.toggleMarkups = function () // Toggle Markups
{
  if (this.svg) {
    if (this.annotVisible) {
      this.annotVisible = false
      this.svg.hide()
      document.getElements('.annotcontainer').hide()
    } else {
      this.annotVisible = true
      this.displayGeoAnnots()
      document.getElements('.annotcontainer').show()
    }
  } else {
    this.annotVisible = true

    this.displayGeoAnnots()
  }
  this.showMessage('annotation toggled')
}

annotools.prototype.showMessage = function (msg) // Show Messages
{
  /*ASHISH DIsable quit
      if (!(msg)) msg = this.mode + " mode,press q to quit"
  */
  this.messageBox.set({
    html: msg
  })
  var myFx = new Fx.Tween('messageBox', {
    duration: 'long',
    transition: 'bounce:out',
    link: 'cancel',
    property: 'opacity'
  }).start(0, 1).chain(function () {
    this.start(0.5, 0)
  })
}

annotools.prototype.relativeToGlobal = function () {
  for (var i = 0; i < $('viewport').getChildren().length; i++) {
    var object = $('viewport').getChildren()[i]

    if (object.tagName == 'ellipse') {
      var originalCoord = {}
      console.log('relativeToGlobal: ' + viewer.viewport.getZoom() + '  ' + this.annotationHandler.zoomBase)
      originalCoord.cx = object.getAttribute('cx')
      originalCoord.cy = object.getAttribute('cy')
      if (viewer.viewport.getZoom() != this.annotationHandler.zoomBase) {
        originalCoord.rx = object.getAttribute('rx') * this.annotationHandler.zoomBase
        originalCoord.ry = object.getAttribute('ry') * this.annotationHandler.zoomBase
      } else {
        originalCoord.rx = object.getAttribute('rx')
        originalCoord.ry = object.getAttribute('ry')
      }
      originalCoord.zoom = viewer.viewport.getZoom()
      this.annotationHandler.originalCoords[object.id] = originalCoord
      var bbox = object.getBBox()

      var objectCenterPt = new OpenSeadragon.Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2)
      var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt)

      // SBA
      originalCoord.cx = objectCenterRelPt.x
      originalCoord.cy = objectCenterRelPt.y

      this.annotationHandler.objectCenterPts[i] = objectCenterRelPt
    } else if (object.tagName == 'rect') {
      var originalCoord = {}
      originalCoord.x = object.getAttribute('x')
      originalCoord.y = object.getAttribute('y')
      originalCoord.width = object.getAttribute('width')
      originalCoord.height = object.getAttribute('height')
      originalCoord.zoom = viewer.viewport.getZoom()
      this.annotationHandler.originalCoords[object.id] = originalCoord
      var bbox = object.getBBox()
      var objectCenterPt = new OpenSeadragon.Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2)
      var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt)
      this.annotationHandler.objectCenterPts[i] = objectCenterRelPt
    }else {
      var bbox = object.getBBox()
      var objectCenterPt =
      new OpenSeadragon.Point(
        bbox.x + bbox.width / 2,
        bbox.y + bbox.height / 2
      )
      console.log('bbox: ' + bbox)
      var objectCenterRelPt =
      this.viewer.viewport.pointFromPixel(objectCenterPt)
      this.annotationHandler.objectCenterPts[i] = objectCenterRelPt
      var originalCoord = {}
      originalCoord.cx = objectCenterPt.x
      originalCoord.cy = objectCenterPt.y
      var points =
      String.split(object.getAttribute('points').trim(), ' ')

      var distances = []
      for (var j = 0; j < points.length; j++) {
        var pointPair = String.split(points[j], ',')
        var point =
        new OpenSeadragon.Point(
          parseFloat(pointPair[0]),
          parseFloat(pointPair[1])
        )
        var relPt = this.viewer.viewport.pointFromPixel(point)
        var dist = relPt.minus(objectCenterRelPt)
        distances.push(dist)
      }

      this.annotationHandler.originalCoords[object.id] = {
        center: objectCenterRelPt,
      distances: distances}
    }
  }
}

annotools.prototype.setupHandlers = function () {
  //console.log('setting up handlers')

  var root = document.getElementsByTagName('svg')[0]
  // console.log(root); 
  if (root != undefined) {
    if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) {
      window.addEventListener('mousewheel', this.annotationHandler.handleMouseWheel, false) // Chrome/Safari
    } else {
      window.addEventListener('DOMMouseScroll', this.annotationHandler.handleMouseWheel, false) // Others
    }
    this.addMouseEvents()
    window.addEventListener('keypress', this.annotationHandler.handleKeyPress, false)
  }
  // console.log("...")
  for (var i = 0; i < this.viewer.buttons.buttons.length; i++) {
    var button = this.viewer.buttons.buttons[i]

    if (button.tooltip.toLowerCase() == 'go home') {
      var onHomeRelease = button.onRelease
      var annot = this
      button.onRelease = function (args) {
        $$('svg')[0].setStyle('opacity', 0)
        onHomeRelease(args)
        setTimeout(annotationHandler.goHome, annotationHandler.animateWaitTime, annot)
      }
    }
  }
}

annotools.prototype.displayTip = function (id) // Display Tips
{

  // var container = document.id(this.canvas)
  var container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
  var width = parseInt(container.offsetWidth),
    height = parseInt(container.offsetHeight),
    annot = this.annotations[id]
  var d = new Element('div', {
    'class': 'annotip',
    styles: {
      position: 'absolute',
      left: Math.round(width * annot.x),
      top: Math.round(height * annot.y)
    },
    html: annot.text
  }).inject(container)
  this.showMessage('Double Click to Edit')
}

annotools.prototype.destroyTip = function () // Destroy Tips
{
  // var container = document.id(this.canvas)
  var container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
  container.getElements('.annotip').destroy()
}

annotools.prototype.editTip = function (id) // Edit Tips
{
  this.removeMouseEvents()
  var annotools = this
  var annotation = this.annotations[id]
  var annotationTextJson = annotation.text
  var content = ''
  for (var key in annotationTextJson) {
    content += "<p class='labelText'>" + key + ': ' + annotationTextJson[key] + '</p>'
  }
  content += "<p class='labelText'>Created by: " + this.annotations[id].username + '</p>'
  var SM = new SimpleModal()
  SM.addButton('Edit Annotation', 'btn primary', function () {
    annotools.promptForAnnotation(annotation, 'edit', annotools, null)
  })
  SM.addButton('Edit Markup', 'btn primary', function () {
    annotools.addMouseEvents()
    this.hide()
  })
  SM.addButton('Delete', 'btn primary', function () {
    var NSM = new SimpleModal()
    NSM.addButton('Confirm', 'btn primary', function () {
      annotools.deleteAnnot(id)
      annotools.addMouseEvents()
      this.hide()
    })
    NSM.addButton('Cancel', 'btn cancel', function () {
      annotools.addMouseEvents()
      this.hide()
    })
    NSM.show({
      'model': 'modal',
      'title': 'Confirm deletion',
      'contents': 'Are you sure you want to delete this annotation?'
    })
  })
  SM.addButton('Cancel', 'btn secondary', function () {
    annotools.addMouseEvents()
    this.hide()
  })
  SM.show({
    'model': 'modal',
    'title': 'Annotation',
    'contents': content
  })
}

annotools.prototype.deleteAnnot = function (id) // Delete Annotations
{
  var testAnnotId = this.annotations[id].annotId
  this.annotations.splice(id, 1)
  // ########### Do the delete using bindaas instead of on local list.
  if (this.iid) {
    var jsonRequest = new Request.JSON({
      url: 'api/Data/deleteAnnot.php',
      async: false,
      onSuccess: function (e) {
        this.showMessage('deleted from server')
      }.bind(this),
      onFailure: function (e) {
        this.showMessage('Error deleting the Annotations, please check your deleteAnnot php')
      }
      .bind(this)}
    ).get({'annotId': testAnnotId})
  }
  this.displayAnnot()
}

annotools.prototype.updateAnnot = function (annot) // Save Annotations
{
  var jsonRequest = new Request.JSON({
    url: 'api/Data/updateAnnot.php',
    onSuccess: function (e) {
      this.showMessage('saved to the server')
    }.bind(this),
    onFailure: function (e) {
      this.showMessage('Error Saving the Annotations,please check you saveAnnot funciton')
    }.bind(this)
  }).post({
    'iid': this.iid,
    'annot': annot
  })
  this.displayAnnot()
}

annotools.prototype.saveAnnot = function (annotation) // Save Annotations
{
  var self = this;
  //console.log('Save annotation function')
  //console.log(annotation)
  jQuery.ajax({
    'type': 'POST',
    url: 'api/Data/getAnnotSpatialLymph.php',
    data: annotation,
    success: function (res, err) {
      //console.log("response: ")
      //console.log(res)
      if(res == "unauthorized"){
        alert("Error saving markup! Wrong secret");
      } else {   
        //alert("Successfully saved markup!");
      }
      //console.log(err)
      self.getMultiAnnot();
      //console.log('succesfully posted')
    }
  })

/*
var jsonRequest = new Request.JSON({
    //url: IP + '/api/annotation_relative.php',
    url:  'api/Data/getAnnotSpatial.php',
    async:false,
    onSuccess: function (e) {
        console.log(e)
        console.log("success")
        this.showMessage("saved to the server")
    }.bind(this),
    onFailure: function (e) {
        console.log(e)
        console.log("fail")
        this.showMessage("Error Saving the Annotations,please check you saveAnnot funciton")
    }.bind(this)
}).post({
    'iid': this.iid,
    'annot': this.annotations
})
*/
}

annotools.prototype.saveAnnot_noRefresh = function (annotation) // Save Annotations
{
  var self = this;
  //console.log('Save annotation function')
  //console.log(annotation)
  jQuery.ajax({
    'type': 'POST',
    url: 'api/Data/getAnnotSpatialLymph.php',
    data: annotation,
    success: function (res, err) {
      //console.log("response: ")
      console.log(res)
      if(res == "unauthorized"){
        alert("Error saving markup! Wrong secret");
      } else {
        //alert("Successfully saved markup!");
      }
      //console.log(err)
      //self.getMultiAnnot();
      //console.log('succesfully posted')
    }
  })
}

annotools.prototype.convertToNative = function (annot) {
  if (annot.type == 'rect' || annot.type == 'ellipse') {
    var x = annot.x
    var y = annot.y
    var w = annot.w
    var h = annot.h

    var nativeW = this.imagingHelper.logicalToPhysicalDistance(w)
    var nativeH = this.imagingHelper.logicalToPhysicalDistance(h)
    var nativeX = this.imagingHelper.logicalToPhysicalX(x)
    var nativeY = this.imagingHelper.logicalToPhysicalY(y)
    var nativeNumbers = JSON.encode({nativeW: nativeW,nativeH: nativeH,nativeX: nativeX,nativeY: nativeY})
    return nativeNumbers
  }

  else if (annot.type == 'polyline' || annot.type == 'pencil' || annot.type == 'line') {
    var x = annot.x
    var y = annot.y
    var w = annot.w
    var h = annot.h
    var point = annot.points

    var nativeW = this.imagingHelper.logicalToPhysicalDistance(w)
    var nativeH = this.imagingHelper.logicalToPhysicalDistance(h)
    var nativeX = this.imagingHelper.logicalToPhysicalX(x)
    var nativeY = this.imagingHelper.logicalToPhysicalY(y)

    var poly_first_split = String.split(point, ' ')
    var points = ''
    for (var k = 0; k < poly_first_split.length - 1; k++) {
      var poly_second_split = String.split(poly_first_split[k], ',')

      var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]), parseFloat(poly_second_split[1]))

      points += this.imagingHelper.logicalToPhysicalX(polyPoint.x) + ',' + this.imagingHelper.logicalToPhysicalY(polyPoint.y) + ' '
    }

    var last_poly_split = String.split(poly_first_split[k], ',')

    var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]), parseFloat(last_poly_split[1]))

    points += this.imagingHelper.logicalToPhysicalX(lastPolyPoint.x) + ',' + this.imagingHelper.logicalToPhysicalY(lastPolyPoint.y)

    var nativeNumbers = JSON.encode({nativeW: nativeW,nativeH: nativeH,nativeX: nativeX,nativeY: nativeY,nativePoints: points})
    return nativeNumbers
  }

  else
    return JSON.encode(annot)
}

annotools.prototype.convertFromNative = function (annot, end) {
  if (annot.type == 'rect' || annot.type == 'ellipse') {
    var x = annot.x
    var y = annot.y
    var w = annot.w
    var h = annot.h
    var x_end = end.x
    var y_end = end.y

    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end)
    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end)
    var nativeX = this.imagingHelper.physicalToLogicalX(x)
    var nativeY = this.imagingHelper.physicalToLogicalY(y)
    var nativeW = nativeX_end - nativeX
    var nativeH = nativeY_end - nativeY

    var globalNumber = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY})

    return globalNumber
  }

  else if (annot.type == 'polyline' || annot.type == 'pencil' || annot.type == 'line') {
    var x = annot.x
    var y = annot.y
    var w = annot.w
    var h = annot.h
    var point = annot.points
    var poly_first_split = String.split(point, ' ')
    var points = ''
    for (var k = 0; k < poly_first_split.length - 1; k++) {
      var poly_second_split = String.split(poly_first_split[k], ',')

      var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]), parseFloat(poly_second_split[1]))

      points += this.imagingHelper.physicalToLogicalX(polyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(polyPoint.y) + ' '
    }

    var last_poly_split = String.split(poly_first_split[k], ',')

    var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]), parseFloat(last_poly_split[1]))

    points += this.imagingHelper.physicalToLogicalX(lastPolyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(lastPolyPoint.y)
    var x_end = end.x
    var y_end = end.y


    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end)
    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end)

    var nativeX = this.imagingHelper.physicalToLogicalX(x)
    var nativeY = this.imagingHelper.physicalToLogicalY(y)
    var nativeW = nativeX_end - nativeX
    var nativeH = nativeY_end - nativeY
    var nativePoints = points

    var globalNumber = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY,points: nativePoints})

    return globalNumber
  }
  else if (annot.type == 'pencil_mark') {
    var x = annot.x
    var y = annot.y
    var w = annot.w
    var h = annot.h
    var point = annot.points
    var poly_first_split = String.split(point, ' ')
    var points = ''
    for (var k = 0; k < poly_first_split.length - 1; k++) {
      var poly_second_split = String.split(poly_first_split[k], ',')

      var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]), parseFloat(poly_second_split[1]))

      points += this.imagingHelper.physicalToLogicalX(polyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(polyPoint.y) + ' '
    }

    var last_poly_split = String.split(poly_first_split[k], ',')

    var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]), parseFloat(last_poly_split[1]))

    points += this.imagingHelper.physicalToLogicalX(lastPolyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(lastPolyPoint.y)
      
    if ( typeof(end) !== 'undefined') {
        var x_end = end.x;
        var y_end = end.y;
    }
    
    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end)
    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end)
    var nativeX = this.imagingHelper.physicalToLogicalX(x)
    var nativeY = this.imagingHelper.physicalToLogicalY(y)
    var nativeW = nativeX_end - nativeX
    var nativeH = nativeY_end - nativeY
    var nativePoints = points

    console.log(x_end);
    console.log(nativeX_end);
    console.log(nativeY_end);
    //console.log(nativeX);
    //console.log(nativeW);
    //console.log(nativePoints);

    var globalNumber = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY,points: nativePoints})

    return globalNumber
  }

  else
    return JSON.encode(annot)
}

annotools.prototype.convertAllToNative = function () {
  for (index = 0; index < this.annotations.length; index++) {
    // unparsed = this.convertToNative(this.annotations[index])
    newannot = JSON.parse(this.convertToNative(this.annotations[index]))
    this.annotations[index].x = newannot.nativeX
    this.annotations[index].y = newannot.nativeY
    this.annotations[index].w = newannot.nativeW
    this.annotations[index].h = newannot.nativeH
  }
}

annotools.prototype.drawEllipse = function (ctx) {
  console.log('ellipsing!')
  this.removeMouseEvents()
  var started = false
  var min_x,min_y,max_x,max_y,w,h
  var startPosition
  this.drawCanvas.bind('mousedown', function (e) {
    started = true
    startPosition = OpenSeadragon.getMousePosition(e.event)
    x = startPosition.x
    y = startPosition.y
  })

  this.drawCanvas.bind('mousemove', function (e) {
    if (started) {
      ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height)
      var currentMousePosition = OpenSeadragon.getMousePosition(e.event)

      min_x = Math.min(currentMousePosition.x, startPosition.x)
      min_y = Math.min(currentMousePosition.y, startPosition.y)
      max_x = Math.max(currentMousePosition.x, startPosition.x)
      max_y = Math.max(currentMousePosition.y, startPosition.y)
      w = Math.abs(max_x - min_x)
      h = Math.abs(max_y - min_y)

      var kappa = .5522848
      var ox = (w / 2) * kappa
      var oy = (h / 2) * kappa
      var xe = min_x + w
      var ye = min_y + h
      var xm = min_x + w / 2
      var ym = min_y + h / 2

      ctx.beginPath()
      ctx.moveTo(min_x, ym)
      ctx.bezierCurveTo(min_x, ym - oy, xm - ox, min_y, xm, min_y)
      ctx.bezierCurveTo(xm + ox, min_y, xe, ym - oy, xe, ym)
      ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
      ctx.bezierCurveTo(xm - ox, ye, min_x, ym + oy, min_x, ym)
      ctx.closePath()
      ctx.strokeStyle = this.color
      ctx.stroke()
    }
  }.bind(this))

  this.drawCanvas.bind('mouseup', function (e) {
    started = false
    var finalMousePosition = new OpenSeadragon.getMousePosition(e.event)
    min_x = Math.min(finalMousePosition.x, startPosition.x)
    min_y = Math.min(finalMousePosition.y, startPosition.y)
    max_x = Math.max(finalMousePosition.x, startPosition.x)
    max_y = Math.max(finalMousePosition.y, startPosition.y)

    var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
    var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
    var newAnnot = {
      x: startRelativeMousePosition.x,
      y: startRelativeMousePosition.y,
      w: w,
      h: h,
      type: 'ellipse',
      color: this.color,
      loc: []
    }

    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))

    newAnnot.x = globalNumbers.nativeX
    newAnnot.y = globalNumbers.nativeY
    newAnnot.w = globalNumbers.nativeW
    newAnnot.h = globalNumbers.nativeH
    var loc = []
    loc[0] = parseFloat(newAnnot.x)
    loc[1] = parseFloat(newAnnot.y)
    newAnnot.loc = loc
    this.promptForAnnotation(newAnnot, 'new', this, ctx)
  }.bind(this))
}

annotools.prototype.drawRectangle = function (ctx) {
  console.log('drawing rectangle')

  /*Highlight drawRectangle button and change cursor*/

  this.removeMouseEvents()
  var started = false
  var min_x,min_y,max_x,max_y,w,h
  var startPosition
  this.drawCanvas.addEvent('mousedown', function (e) {
    started = true
    startPosition = OpenSeadragon.getMousePosition(e.event)
    x = startPosition.x
    y = startPosition.y
  })

  this.drawCanvas.addEvent('mousemove', function (e) {
    if (started) {
      ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height)
      var currentMousePosition = OpenSeadragon.getMousePosition(e.event)

      min_x = Math.min(currentMousePosition.x, startPosition.x)
      min_y = Math.min(currentMousePosition.y, startPosition.y)
      max_x = Math.max(currentMousePosition.x, startPosition.x)
      max_y = Math.max(currentMousePosition.y, startPosition.y)
      w = Math.abs(max_x - min_x)
      h = Math.abs(max_y - min_y)
      ctx.strokeStyle = this.color
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(min_x, min_y, w, h)
      ctx.strokeRect(min_x, min_y, w, h)
    }
  }.bind(this))

  this.drawCanvas.addEvent('mouseup', function (e) {
    started = false
    var finalMousePosition = new OpenSeadragon.getMousePosition(e.event)

    min_x = Math.min(finalMousePosition.x, startPosition.x)
    min_y = Math.min(finalMousePosition.y, startPosition.y)
    max_x = Math.max(finalMousePosition.x, startPosition.x)
    max_y = Math.max(finalMousePosition.y, startPosition.y)

    var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
    var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
    var newAnnot = {
      x: startRelativeMousePosition.x,
      y: startRelativeMousePosition.y,
      w: w,
      h: h,
      type: 'rect',
      color: this.color,
      loc: []
    }

    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))

    newAnnot.x = globalNumbers.nativeX
    newAnnot.y = globalNumbers.nativeY
    newAnnot.w = globalNumbers.nativeW
    newAnnot.h = globalNumbers.nativeH
    var loc = []
    loc[0] = parseFloat(newAnnot.x)
    loc[1] = parseFloat(newAnnot.y)
    newAnnot.loc = loc;

    console.log(newAnnot);

    // convert to geojson 
    var geoNewAnnot = this.convertRectToGeo(newAnnot)
    // geoNewAnnot = newAnnot
    this.promptForAnnotation(geoNewAnnot, 'new', this, ctx);
    jQuery("canvas").css("cursor", "default");
    jQuery("#drawRectangleButton").removeClass("active");


  }.bind(this))
}

annotools.prototype.drawPencil = function (ctx) {
  this.removeMouseEvents()
  var started = false
  var pencil = []
  var newpoly = []

  /*Change button and cursor*/
  jQuery("canvas").css("cursor", "crosshair");
  //jQuery("#drawFreelineButton").css("opacity", 1);
  /**/

  this.drawCanvas.addEvent('mousedown', function (e) {
    started = true
    var startPoint = OpenSeadragon.getMousePosition(e.event)
    var relativeStartPoint = startPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas))
    newpoly.push({
      'x': relativeStartPoint.x,
      'y': relativeStartPoint.y
    })
    ctx.beginPath()
    ctx.moveTo(relativeStartPoint.x, relativeStartPoint.y)
    ctx.strokeStyle = this.color
    ctx.stroke()
  }.bind(this))

  this.drawCanvas.addEvent('mousemove', function (e) {
    var newPoint = OpenSeadragon.getMousePosition(e.event)
    var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas))
    if (started) {
      newpoly.push({
        'x': newRelativePoint.x,
        'y': newRelativePoint.y
      })

      ctx.lineTo(newRelativePoint.x, newRelativePoint.y)
      ctx.stroke()
    }
  })

  this.drawCanvas.addEvent('mouseup', function (e) {
    started = false
    pencil.push(newpoly)
    newpoly = []
    numpoint = 0
    var x,y,w,h
    x = pencil[0][0].x
    y = pencil[0][0].y

    var maxdistance = 0
    var points = ''
    var endRelativeMousePosition
    for (var i = 0; i < pencil.length; i++) {
      newpoly = pencil[i]
      for (j = 0; j < newpoly.length - 1; j++) {
        points += newpoly[j].x + ',' + newpoly[j].y + ' '
        if (((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y)) > maxdistance) {
          maxdistance = ((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y))
          var endMousePosition = new OpenSeadragon.Point(newpoly[j].x, newpoly[j].y)
          endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas))
        }
      }

      points = points.slice(0, -1)
      points += ';'
    }
    points = points.slice(0, -1)

    var newAnnot = {
      x: x,
      y: y,
      w: w,
      h: h,
      type: 'pencil',
      points: points,
      color: this.color,
      loc: []
    }

    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))
    newAnnot.x = globalNumbers.nativeX
    newAnnot.y = globalNumbers.nativeY
    newAnnot.w = globalNumbers.nativeW
    newAnnot.h = globalNumbers.nativeH
    newAnnot.points = globalNumbers.points
    var loc = []
    loc[0] = parseFloat(newAnnot.x)
    loc[1] = parseFloat(newAnnot.y)
    newAnnot.loc = loc
    console.log(newAnnot)
    var geojsonAnnot = this.convertPencilToGeo(newAnnot)
    this.promptForAnnotation(geojsonAnnot, 'new', this, ctx)

    /* Change button back to inactive*/
    jQuery("canvas").css("cursor", "default");
    jQuery("#drawFreelineButton").removeClass("active");
    console.log('end of mouse up');

  }.bind(this))
}

annotools.prototype.drawMeasure = function (ctx) {
  this.removeMouseEvents()
  var started = false
  var x0,y0,x1,y1
  var length

  this.drawCanvas.addEvent('mousedown', function (e) {
    if (!started) {
      var startPosition = OpenSeadragon.getMousePosition(e.event)
      var startRelativeMousePosition = startPosition.minus(OpenSeadragon.getElementOffset(viewer.canvas))
      x0 = startRelativeMousePosition.x
      y0 = startRelativeMousePosition.y
      started = true
    }else {
      var endPosition = OpenSeadragon.getMousePosition(e.event)
      var endRelativePosition = endPosition.minus(OpenSeadragon.getElementOffset(viewer.canvas))
      x1 = endRelativePosition.x
      y1 = endRelativePosition.y
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.strokeStyle = this.color
      ctx.stroke()
      ctx.closePath()

      var minX, minY = 0
      var maxX, maxY = 0
      if (x1 > x0) {
        minX = x0
        maxX = x1
      }else {
        minX = x1
        maxX = x0
      }
      if (y1 > y0) {
        minY = y0
        maxY = y1
      }else {
        minY = y1
        maxY = y0
      }

      var x_dist = ((this.imagingHelper.physicalToDataX(x0)) - (this.imagingHelper.physicalToDataX(x1)))
      var y_dist = ((this.imagingHelper.physicalToDataY(y0)) - (this.imagingHelper.physicalToDataY(y1)))

      var x_micron = this.mppx * x_dist
      var y_micron = this.mppy * y_dist

      var length = Math.sqrt(x_micron.pow(2) + y_micron.pow(2))
      points = (x1 + ',' + y1)
      var w = 0
      var h = 0
      var newAnnot =
      {
        x: x0,
        y: y0,
        w: w,
        h: h,
        type: 'line',
        points: points,
        color: this.color,
        loc: [],
        length: length
      }
      var finalPosition = new OpenSeadragon.Point(maxX, maxY)
      var finalRelativePosition = finalPosition.minus(OpenSeadragon.getElementOffset())

      var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, finalRelativePosition))
      newAnnot.x = globalNumbers.nativeX
      newAnnot.y = globalNumbers.nativeY
      newAnnot.w = globalNumbers.nativeW
      newAnnot.h = globalNumbers.nativeH
      newAnnot.points = globalNumbers.points
      var loc = []
      loc[0] = parseFloat(newAnnot.x)
      loc[1] = parseFloat(newAnnot.y)
      newAnnot.loc = loc
      this.promptForAnnotation(newAnnot, 'new', this, ctx)
      started = false
    }
  }.bind(this))

  this.drawCanvas.addEvent('mousemove', function (e) {
    if (started) {
      ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height)
      var currentPosition = OpenSeadragon.getMousePosition(e.event)
      var currentRelativePosition = OpenSeadragon.getMousePosition(e.event)

      x1 = currentRelativePosition.x
      y1 = currentRelativePosition.y

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.strokeStyle = this.color
      ctx.stroke()
      ctx.closePath()
    }
  }.bind(this))
}

annotools.prototype.drawPolyline = function (ctx) {
  this.removeMouseEvents()
  var started = true
  var newpoly = []
  var numpoint = 0
  this.drawCanvas.addEvent('mousedown', function (e) {
    if (started) {
      var newPoint = OpenSeadragon.getMousePosition(e.event)
      var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas))
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(e.event.layerX, e.event.layerY, 2, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.fill
      newpoly.push({'x': newRelativePoint.x,
      'y': newRelativePoint.y})

      if (numpoint > 0) {
        ctx.beginPath()
        ctx.moveTo(newpoly[numpoint].x, newpoly[numpoint].y)
        ctx.lineTo(newpoly[numpoint - 1].x, newpoly[numpoint - 1].y)
        ctx.strokeStyle = this.color
        ctx.stroke()
      }

      numpoint++
    }
  }.bind(this))

  this.drawCanvas.addEvent('dblclick', function (e) {
    started = false
    ctx.beginPath()
    ctx.moveTo(newpoly[numpoint - 1].x, newpoly[numpoint - 1].y)
    ctx.lineTo(newpoly[0].x, newpoly[0].y)
    ctx.stroke()
    var x,y,w,h

    x = newpoly[0].x
    y = newpoly[0].y

    var maxdistance = 0

    // var tip = prompt("Please Enter Some Description","")

    var points = ''

    var endMousePosition
    for (var i = 0; i < numpoint - 1; i++) {
      points += newpoly[i].x + ',' + newpoly[i].y + ' '
      if (((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y)) > maxdistance) {
        maxdistance = ((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y))

        endMousePosition = new OpenSeadragon.Point(newpoly[i].x, newpoly[i].y)
        w = Math.abs(newpoly[i].x - x)
        h = Math.abs(newpoly[i].y - y)
      }
    }

    points += newpoly[i].x + ',' + newpoly[i].y

    var endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas))

    var newAnnot = {
      x: x,
      y: y,
      w: w,
      h: h,
      type: 'polyline',
      points: points,
      color: this.color,
      loc: []
    }

    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))

    newAnnot.x = globalNumbers.nativeX
    newAnnot.y = globalNumbers.nativeY
    newAnnot.w = globalNumbers.nativeW
    newAnnot.h = globalNumbers.nativeH
    newAnnot.points = globalNumbers.points
    var loc = []
    loc[0] = newAnnot.x
    loc[1] = newAnnot.y
    newAnnot.loc = loc
    this.promptForAnnotation(newAnnot, 'new', this, ctx)
  }.bind(this))
}
annotools.prototype.saveState = function () {
  if (this.iid) {
    var jsonRequest = new Request.JSON({
      // url: IP + 'api/state.php',
      url: 'api/Data/state.php',
      onSuccess: function (e) {
        this.showMessage('saved to the server')
      }.bind(this),
      onFailure: function (e) {
        this.showMessage('Error Saving the state,please check you saveState funciton')
      }.bind(this)
    }).post({
      'iid': this.iid,
      'zoom': iip.view.res,
      'left': iip.view.x,
      'top': iip.view.y
    })
  } else this.showMessage('Sorry, This Function is Only Supported With the Database Version')
}
annotools.prototype.retrieveTemplate = function () {
  var jsonReturn = ''
  /*
   * Ganesh
   */

  var jsonRequest = new Request.JSON({
    url: 'api/Data/retreiveTemplate.php', // Ameen, fix your spelling!
    async: false,
    onSuccess: function (e) {
      jsonReturn = JSON.parse(e)[0]
      console.log(jsonReturn)
    }.bind(this),
    onFailure: function (e) {
      this.showMessage('Error retrieving AnnotationTemplate, please check your retrieveTemplate.php')
    }.bind(this)
  }).get()

  /*
  var jsonRequest = jQuery.ajax({
      url: "api/Data/retreiveTemplate.php",
      success: function(e){
          console.log(e)
          jsonReturn  = JSON.parse(e)[0]
          console.log(jsonReturn)
      },
      async: false
  })
  */
  return jsonReturn
}
annotools.prototype.retrieveSingleAnnot = function (annotId) {
  var jsonReturn
  var jsonRequest = new Request.JSON({
    url: 'api/Data/retreiveSingleAnnot.php', // Ameen, fix your spelling! Again!
    async: false,
    onSuccess: function (e) {
      jsonReturn = JSON.parse(e)[0]
    }.bind(this),
    onFailure: function (e) {
      this.showMessage('Error retrieving Annotation, please check your trieveSingleAnnot.php')
    }.bind(this)
  }).get({'annotId': annotId})

  return jsonReturn
}
annotools.prototype.populateForm = function (annotationTemplateJson, annotationTextJson, mode) {
  var form = ''
  for (var key in annotationTemplateJson) {
    if (annotationTemplateJson.hasOwnProperty(key) && key != '_id') {
      form += "<p class='labelText'>" + key + ': </p>'
      var val = annotationTemplateJson[key]
      if (val == 'text') {
        form += "<input type='text' size='45' name='" + key + "' id='" + key + "'"
        if (mode == 'edit') {
          form += " value='" + annotationTextJson[key] + "'"
        }
        form += '\><br \>'
      } else {
        var options = val['enumerable'].replace(/ /g, '').split(',')
        if (val['multi'] == 'true' && mode != 'filter') {
          for (var i = 0; i < options.length; i++) {
            form += "<input type='checkbox' name='" + key + "' id='" + options[i] + "' value='" + options[i] + "'"
            if (mode == 'edit' && annotationTextJson[key].indexOf(options[i])) {
              form += " checked='true'"
            }
            form += '>' + options[i] + '</input>'
          }
        } else {
          for (var i = 0; i < options.length; i++) {
            form += "<input type='radio' name='" + key + "' id='" + options[i] + "' value='" + options[i] + "'"
            if (mode == 'edit' && annotationTextJson[key] == options[i]) {
              form += " checked='true'"
            }
            form += '>' + options[i] + '</input>'
          }
        }
      }
    }
  }
  return form
}

function handleWorkOrder (annot) {
  console.log(annot)
}

/*
annotools.prototype.showFilterControls = function(newAnnot, mode, annotools, ctx){
    var panel = jQuery("#panel")
    panel.show("slide")

    panel.html("<div id='panelHeader'>Filters</div><div id='panelBody'>Brightness: <input type='range' id='controlBright'>"+
        "<br /> Contrast: <input type='range' min=0 max=2.5 step=0.05 id='controlContrast'><br />"
            +" Threshold: <input type='range' min=0 max=255 step=1 id='controlThreshhold' /><br />"
            + "<button class='btn' id='controlSobel'>Sobel Edge Detection</button> <button class='btn' id='controlInvert'>Invert Colors</button>" +
    "</div>")
   
    
    jQuery("#controlInvert").on("click", function(){
        viewer.setFilterOptions({
            filters: {
                processors: OpenSeadragon.Filters.INVERT()
            }
        })
    });    
 
    jQuery("#controlSobel").on("click", function(){
        viewer.setFilterOptions({
            filters: {
                processors: [
                    OpenSeadragon.Filters.CONVOLUTION([
                        0.0625, 0.125, 0.0625,
                        0.125, 0.25, 0.125,
                        0.0625, 0.125, 0.625
                    ]),
                    OpenSeadragon.Filters.CONVOLUTION([
                    -1, 0, 1,
                    -2, 0, 2,
                    -1, 0, 1
                    ])
                ]
            }
        })
    });    
    jQuery("#controlThreshhold").on("change", function(){
        var threshhold = 1*jQuery(this).val()
        console.log(threshhold)
        viewer.setFilterOptions({
            filters: {
                processors: OpenSeadragon.Filters.THRESHOLDING(threshhold)
            }
        })
        console.log(viewer);   
    })

    jQuery("#controlContrast").on("change", function(){
        var contrast = 1*jQuery(this).val()
        console.log(contrast)
        viewer.setFilterOptions({
            filters: {
                processors: OpenSeadragon.Filters.CONTRAST(contrast)
            }
        })
        console.log(viewer);   
    })
    jQuery("#controlBright").on("change", function(){
        //console.log(viewer)
        var brightness = 1*jQuery(this).val()
        console.log(brightness)
        viewer.setFilterOptions({
            filters: {
                processors: OpenSeadragon.Filters.BRIGHTNESS(brightness)
            }
        })
        console.log(viewer)
        //console.log(jQuery(this).val())
    })
}
*/

annotools.prototype.promptForWorkOrder = function (newAnnot, mode, annotools, ctx) {
  console.log(newAnnot)
  console.log(mode)
  console.log(annotools)
  console.log(ctx)

  var panel = jQuery('#panel').show()
  var iid = this.iid
  var x = annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x))
  var y = annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y))
  var w = (annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x + newAnnot.w)))) - x
  var h = (annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y + newAnnot.h))) - y
  x = parseInt(x)
  y = parseInt(y)
  w = parseInt(w)
  h = parseInt(h)
  if (w * h > 1000000) {
    newAnnot.w = annotools.imagingHelper.dataToLogicalX(1000)
    newAnnot.h = annotools.imagingHelper.dataToLogicalY(1000)
    w = 1000
    h = 1000
    panel.html(function () {
      return "<div id='panelHeader'><h4> Work Order(Error) </h4></div><div id='panelBody'> Error: Very large ROI. <br />" + 'Width: ' + w + '<br />' + 'Height: ' + h + "<br />Please try creating a smaller ROI. Zooming into the ROI would help.<br /> We currently support 1000X1000 tiles <br />  <button id='cancelWorkOrder'>Cancel</button></div>"
    })
    jQuery('#cancelWorkOrder').click(function () {
      console.log('here')
      jQuery('#panel').hide()
      annotools.drawLayer.hide()
      annotools.addMouseEvents()
    })
    return
  }
  panel.html(function () {
    return "<div id='panelHeader'><h4> Work Order </h4></div><div id='panelBody'> <ul><li> x1: " + x + '</li> <li> y1: ' + y + '</li> <li> w: ' + w + '</li> <li>h: ' + h + '</li> <li>Algorithm: SuperSegmenter</li> '
    + "<li>Execution Id:<input id='order-execution_id'></input></li>" + "<li>Notes: <textarea id='order-notes'></textarea>" + "</ul> <br /> <button id='submitWorkOrder'>Submit</button> <button id='cancelWorkOrder'>Cancel</button></div>"
  })

  /*
  console.log(annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x)))
  console.log(annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y)))
  console.log(annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x+newAnnot.w))))
  console.log(annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y+newAnnot.h)))
  */

  jQuery('#cancelWorkOrder').click(function () {
    console.log('here')
    jQuery('#panel').hide()
    annotools.drawLayer.hide()
    annotools.addMouseEvents()
  })

  jQuery('#submitWorkOrder').click(function () {
    console.log('events...')

    // annotools.drawCanvas.removeEvents('mouseup')
    // annotools.drawCanvas.removeEvents('mousedown')
    // annotools.drawCanvas.removeEvents('mousemove')
    annotools.drawLayer.hide()
    annotools.addMouseEvents()
    // annotools.removeMouseEvents()
    // annotools.getMultiAnnot();            

    var username = 'lastlegion'
    var execution_id = jQuery('#order-execution_id').val()
    var notes = jQuery('#order-notes').val()
    var width = 48002
    var height = 35558
    if (iid == 'TCGA-06-0148-01Z-00-DX1') {
      width = 26001
      height = 27968
    }
    var order = {
      'type': 'order',

      'data': {
        'title': username + ' :: ' + execution_id,
        'algorithm': 'SuperSegmenter',
        'execution_id': execution_id,
        'created_by': username,
        'notes': notes,
        'order': {
          'metadata': {
            'created_on': Date.now(),
            'created_by': 'lastlegion'
          },
          'image': {
            'width': width,
            'height': height,
            'case_id': iid
          },
          'roi': {
            'x': x,
            'y': y,
            'w': w,
            'h': h
          },
          'execution': {
            'execution_id': execution_id,
            'algorithm': 'SuperSegmenter',
            'parameters': [
              {
                'blur': 0.4
              },
              {
                'format': 'jpg'
              }
            ]
          }
        }
      }
    }

    /*
    var order = {
        "type": "order",

        "data":{ 
            "created_on": Date.now(),
            "created_by": "lastlegion"
        }
    }
    */
    jQuery.post('api/Data/workOrder.php', order)
      .done(function (res) {
        console.log(res)
        panel.html(function () {
          annotools.addMouseEvents()
          return 'Order Submitted!'
        })
        panel.hide('slide')
      })
    console.log('submit')
    console.log(newAnnot)
    console.log(order)
  }.bind(newAnnot))
}

annotools.prototype.promptForWorkOrder = function (newAnnot, mode, annotools, ctx) {
  console.log(newAnnot)
  console.log(mode)
  console.log(annotools)
  console.log(ctx)

  var panel = jQuery('#panel').show()
  var iid = this.iid
  var x = annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x))
  var y = annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y))
  var w = (annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x + newAnnot.w)))) - x
  var h = (annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y + newAnnot.h))) - y
  x = parseInt(x)
  y = parseInt(y)
  w = parseInt(w)
  h = parseInt(h)
  if (w * h > 1000000) {
    newAnnot.w = annotools.imagingHelper.dataToLogicalX(1000)
    newAnnot.h = annotools.imagingHelper.dataToLogicalY(1000)
    w = 1000
    h = 1000
    panel.html(function () {
      return "<div id='panelHeader'><h4> Work Order(Error) </h4></div><div id='panelBody'> Error: Very large ROI. <br />" + 'Width: ' + w + '<br />' + 'Height: ' + h + "<br />Please try creating a smaller ROI. Zooming into the ROI would help.<br /> We currently support 1000X1000 tiles <br />  <button id='cancelWorkOrder'>Cancel</button></div>"
    })
    jQuery('#cancelWorkOrder').click(function () {
      console.log('here')
      jQuery('#panel').hide()
      annotools.drawLayer.hide()
      annotools.addMouseEvents()
    })
    return
  }
  panel.html(function () {
    return "<div id='panelHeader'><h4> Work Order </h4></div><div id='panelBody'> <ul><li> x1: " + x + '</li> <li> y1: ' + y + '</li> <li> w: ' + w + '</li> <li>h: ' + h + '</li> <li>Algorithm: SuperSegmenter</li> '
    + "<li>Execution Id:<input id='order-execution_id'></input></li>" + "<li>Notes: <textarea id='order-notes'></textarea>" + "</ul> <br /> <button id='submitWorkOrder'>Submit</button> <button id='cancelWorkOrder'>Cancel</button></div>"
  })

  /*
  console.log(annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x)))
  console.log(annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y)))
  console.log(annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x+newAnnot.w))))
  console.log(annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y+newAnnot.h)))
  */

  jQuery('#cancelWorkOrder').click(function () {
    console.log('here')
    jQuery('#panel').hide()
    annotools.drawLayer.hide()
    annotools.addMouseEvents()
  })

  jQuery('#submitWorkOrder').click(function () {
    console.log('events...')

    // annotools.drawCanvas.removeEvents('mouseup')
    // annotools.drawCanvas.removeEvents('mousedown')
    // annotools.drawCanvas.removeEvents('mousemove')
    annotools.drawLayer.hide()
    annotools.addMouseEvents()
    // annotools.removeMouseEvents()
    // annotools.getMultiAnnot();            

    var username = 'lastlegion'
    var execution_id = jQuery('#order-execution_id').val()
    var notes = jQuery('#order-notes').val()
    var width = 48002
    var height = 35558
    if (iid == 'TCGA-06-0148-01Z-00-DX1') {
      width = 26001
      height = 27968
    }
    var order = {
      'type': 'order',

      'data': {
        'title': username + ' :: ' + execution_id,
        'algorithm': 'SuperSegmenter',
        'execution_id': execution_id,
        'created_by': username,
        'notes': notes,
        'order': {
          'metadata': {
            'created_on': Date.now(),
            'created_by': 'lastlegion'
          },
          'image': {
            'width': width,
            'height': height,
            'case_id': iid
          },
          'roi': {
            'x': x,
            'y': y,
            'w': w,
            'h': h
          },
          'execution': {
            'execution_id': execution_id,
            'algorithm': 'SuperSegmenter',
            'parameters': [
              {
                'blur': 0.4
              },
              {
                'format': 'jpg'
              }
            ]
          }
        }
      }
    }

    /*
    var order = {
        "type": "order",

        "data":{ 
            "created_on": Date.now(),
            "created_by": "lastlegion"
        }
    }
    */
    jQuery.post('api/Data/workOrder.php', order)
      .done(function (res) {
        console.log(res)
        panel.html(function () {
          annotools.addMouseEvents()
          return 'Order Submitted!'
        })
        panel.hide('slide')
      })
    console.log('submit')
    console.log(newAnnot)
    console.log(order)
  }.bind(newAnnot))
}

annotools.prototype.promptForAnnotation = function (newAnnot, mode, annotools, ctx) {
  jQuery('#panel').show('slide')
  console.log(newAnnot);
  jQuery('panel').html('');
  jQuery('#panel').html('' +
    "<div id = 'panelHeader'> <h4>Enter a new annotation </h4></div>"
    + "<div id='panelBody'>"
    + "<form id ='annotationsForm' action='#'>"
    + '</form>'

    + '</div>'
  )
  jQuery.get('api/Data/retrieveTemplate.php', function (data) {
    console.log(data);
    var schema = JSON.parse(data)
    schema = JSON.parse(schema)[0]
    console.log(schema)
    // console.log("retrieved template")
    var formSchema = {
      'schema': schema,
      'form': [
        '*',
        {
          'type': 'submit',
          'title': 'Submit'

        },
        {
          'type': 'button',
          'title': 'Cancel',
          'onClick': function (e) {
            console.log(e)
            e.preventDefault()
            // console.log("cancel")
            cancelAnnotation()
          }
        }
      ]
    }

    formSchema.onSubmit = function (err, val) {
      // Add form data to annotation
      newAnnot.properties.annotations = val

      // Post annotation
      annotools.addnewAnnot(newAnnot)

      // Hide Panel
      jQuery('#panel').hide('slide')
      annotools.drawLayer.hide()
      annotools.addMouseEvents()

      return false
    }

    var cancelAnnotation = function () {
      console.log('cancel handler')
      jQuery('#panel').hide('slide')
      annotools.drawLayer.hide()
      annotools.addMouseEvents()
    }

    jQuery('#annotationsForm').jsonForm(formSchema)
  })
}

annotools.prototype.promptForAnalysis = function (annotools, analysisBox) {
  var title = 'Analysis Tool'
  var form = "<select id='algorithm'>"
  form += "<option value='canny_edge'>Canny Edge</option>"
  form += "<option value='marching_cubes'>Marching Cubes</option>"
  form += '</select>'
  var SM = new SimpleModal()
  SM.addButton('Confirm', 'btn primary', function () {
    var algorithm = $('algorithm').value
    this.hide()
    annotools.promptForParameters(annotools, analysisBox, algorithm)
  })
  SM.addButton('Cancel', 'btn secondary', function () {
    annotools.addMouseEvents()
    this.hide()
    return false
  })
  SM.show({
    'model': 'modal',
    'title': title,
    'contents': form
  })
}
annotools.prototype.promptForParameters = function (annotools, analysisBox, algorithm) {
  var title = 'Enter the parameters'
  var form = '<form>'
  var field = []
  var parameters = '{ '
  /*====================test samples, will need to be retrived from API calls===============*/
  var sample = '{ "param_1" : "text" , "param_2" : "text" }'
  var sampleJson = JSON.parse(sample)
  /*===================================*/
  switch (algorithm) {
    case 'canny_edge':
      for (var key in sampleJson) {
        field.push(key)
        form += "<p class='labelText'>" + key + "</p><input type='text' size='45' name='" + key + "' id='" + key + "'/><br />"
        parameters += '"' + key + '" : '
        parameters += '__' + key + '__, '
      }
      break
    case 'marching_cubes':
      for (var key in sampleJson) {
        field.push(key)
        form += "<p class='labelText'>" + key + "</p><input type='text' size='45' name='" + key + "' id='" + key + "'/><br />"
        parameters += '"' + key + '" : '
        parameters += '__' + key + '__, '
      }
      break
  }
  form += '</form>'
  parameters = parameters.substring(0, parameters.length - 2) + ' }'
  var SM = new SimpleModal()
  SM.addButton('Confirm', 'btn primary', function () {
    for (var i = 0; i < field.length; i++) {
      var fieldElem = $$(document.getElementsByName(field[i]))
      var replacement = '"' + $(field[i]).value + '"'
      parameters = parameters.replace('__' + field[i] + '__', replacement)
    }
    var submission = '{ "Algorithm" : "' + algorithm + '", "x" : "' + analysisBox.x + '", "y" : "' + analysisBox.y + '", "w" : "' + analysisBox.w + '", "h" : "' + analysisBox.h + '", "Parameters" : ' + parameters + ' }'
    console.log(submission)
    submission = JSON.parse(submission)
    /*============after this point, submission is ready to be handed over to bindaas=========*/
    annotools.addMouseEvents()
    this.hide()
    return false
  })
  SM.addButton('Cancel', 'btn secondary', function () {
    annotools.addMouseEvents()
    this.hide()
    return false
  })
  SM.show({
    'model': 'modal',
    'title': title,
    'contents': form
  })
}

annotools.prototype.addMouseEvents = function () {
  //console.log('adding mouse events')
  // console.log(this.annotationHandler)
  window.addEventListener('mousemove', this.annotationHandler.handleMouseMove, false)
}

annotools.prototype.removeMouseEvents = function () {
  //console.log('removing events')
  // console.log(this.annotationHandler)
  window.removeEventListener('mousemove', this.annotationHandler.handleMouseMove, false)
  //window.removeEventListener('mousedown', this.annotationHandler.handleMouseDown, false)
  //window.removeEventListener('mouseup', this.annotationHandler.handleMouseUp, false)
// window.removeEventListener('mouseup',      this.getAnnot(), false)
}

annotools.prototype.downloadROI = function(){
  this.showMessage() // Show Message
  this.drawCanvas.removeEvents('mouseup')
  this.drawCanvas.removeEvents('mousedown')
  this.drawCanvas.removeEvents('mousemove')
  this.drawLayer.show() // Show The Drawing Layer
  /* ASHISH Disable quit
      this.quitbutton.show() //Show The Quit Button
  */
  this.magnifyGlass.hide() // Hide The Magnifying Tool
  // this.container = document.id(this.canvas) //Get The Canvas Container
  this.container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
  // this.container = document.getElementById('container') //Get The Canvas Container
  if (this.container) {
    // var left = parseInt(this.container.offsetLeft), //Get The Container Location
    var left = parseInt(this.container.getLeft()), // Get The Container Location
      top = parseInt(this.container.offsetTop),
      width = parseInt(this.container.offsetWidth),
      height = parseInt(this.container.offsetHeight),
      oleft = left,
      otop = top,
      owidth = width,
      oheight = height
    // console.log("left: " + left + " top: " + top + " width: " + width + " height: " + height)
    if (left < 0) {
      left= 0
      width = window.innerWidth
    } // See Whether The Container is outside The Current ViewPort
    if (top < 0) {
      top = 0
      height = window.innerHeight
    }
    // Recreate The CreateAnnotation Layer Because of The ViewPort Change Issue.
    this.drawLayer.set({
      'styles': {
        left: left,
        top: top,
        width: width,
        height: height
      }
    })
    // Create Canvas on the CreateAnnotation Layer
    this.drawCanvas.set({
      width: width,
      height: height
    })
    // The canvas context
    var ctx = this.drawCanvas.getContext('2d')

    
    this.removeMouseEvents()
    var started = false
    var min_x,min_y,max_x,max_y,w,h
    var startPosition
    this.drawCanvas.addEvent('mousedown', function (e) {
      started = true
      startPosition = OpenSeadragon.getMousePosition(e.event)
      x = startPosition.x
      y = startPosition.y
    })

    this.drawCanvas.addEvent('mousemove', function (e) {
      if (started) {
        ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height)
        var currentMousePosition = OpenSeadragon.getMousePosition(e.event)

        min_x = Math.min(currentMousePosition.x, startPosition.x)
        min_y = Math.min(currentMousePosition.y, startPosition.y)
        max_x = Math.max(currentMousePosition.x, startPosition.x)
        max_y = Math.max(currentMousePosition.y, startPosition.y)
        w = Math.abs(max_x - min_x)
        h = Math.abs(max_y - min_y)
        ctx.strokeStyle = this.color
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.fillRect(min_x, min_y, w, h)
        ctx.strokeRect(min_x, min_y, w, h)
      }
    }.bind(this))

    this.drawCanvas.addEvent('mouseup', function (e) {
      started = false
      var finalMousePosition = new OpenSeadragon.getMousePosition(e.event)

      min_x = Math.min(finalMousePosition.x, startPosition.x)
      min_y = Math.min(finalMousePosition.y, startPosition.y)
      max_x = Math.max(finalMousePosition.x, startPosition.x)
      max_y = Math.max(finalMousePosition.y, startPosition.y)

      var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
      var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas))
      var newAnnot = {
        x: startRelativeMousePosition.x,
        y: startRelativeMousePosition.y,
        w: w,
        h: h,
        type: 'rect',
        color: this.color,
        loc: []
      }

      var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))

      newAnnot.x = globalNumbers.nativeX
      newAnnot.y = globalNumbers.nativeY
      newAnnot.w = globalNumbers.nativeW
      newAnnot.h = globalNumbers.nativeH
      var loc = []
      loc[0] = parseFloat(newAnnot.x)
      loc[1] = parseFloat(newAnnot.y)
      newAnnot.loc = loc

      // convert to geojson 
      // var geoNewAnnot = this.convertRectToGeo(newAnnot)
      geoNewAnnot = newAnnot
      this.promptForDownload(geoNewAnnot, 'new', this, ctx)
    }.bind(this))
  }
}

annotools.prototype.promptForDownload = function(newAnnot, mode, annotools, ctx) {
  var panel = jQuery('#panel').show()
  var iid = this.iid
  var x = annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x))
  var y = annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y))
  var w = (annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x + newAnnot.w)))) - x;
  var h = (annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y + newAnnot.h))) - y
  x = parseInt(x)
  y = parseInt(y)
  w = parseInt(w)
  h = parseInt(h)
  var max = 2000;
  var url;
  var iipSrv = "http://quip1.uhmc.sunysb.edu/fcgi-bin/iipsrv.fcgi?IIIF=";
  console.log(fileLocation);
  var fileLocationReal = fileLocation.substr(0, fileLocation.length -4);
  console.log(fileLocationReal);
    if(w*h > max*max){
      w = max;
      h = max;

      url = iipSrv + fileLocationReal + "/"+x+ ","+y+","+w+","+h +"/full/0/default.jpg";

      panel.html(function () {
      return "<div id='panelHeader'><h4> Download ROI </h4></div><div id='panelBody'> <ul><li> x: " 
        + x + "</li> <li> y: "
         + y + "</li> <li> w: " + w + "</li> <li>h: " + h + "</li> </ul> <br /> Error! The ROI was too large. We've resized it to 2000 x 2000 tile<br /> <a href='"+url+ "' target='_blank'> <button class='btn' id='downloadROI'>Download</button></a> <button class='btn' id='cancelWorkOrder'>Cancel</button></div>";
    });
    } else {

      url = iipSrv + fileLocationReal + "/"+x+ ","+y+","+w+","+h +"/full/0/default.jpg";


      panel.html(function () {
      return "<div id='panelHeader'><h4> Download ROI </h4></div><div id='panelBody'> <ul><li> x: " 
        + x + "</li> <li> y: "
         + y + "</li> <li> w: " + w + "</li> <li>h: " + h + "</li> </ul> <br /> <a href='"+url+ "' target='_blank'> <button class='btn' id='downloadROI'>Download</button></a> <button class='btn' id='cancelWorkOrder'>Cancel</button></div>";
      });
    }
  jQuery('#cancelWorkOrder').click(function () {
   
    jQuery('#panel').hide()
    annotools.drawLayer.hide()
    annotools.addMouseEvents()
  })
  console.log(fileLocation);
    console.log(fileLocation);
    console.log(url);
  jQuery('#submitWorkOrder').click(function () {
    
    // annotools.drawCanvas.removeEvents('mouseup')
    // annotools.drawCanvas.removeEvents('mousedown')
    // annotools.drawCanvas.removeEvents('mousemove')
    annotools.drawLayer.hide()
    annotools.addMouseEvents()
    // annotools.removeMouseEvents()
    // annotools.getMultiAnnot();            

    var username = 'lastlegion'
    var execution_id = jQuery('#order-execution_id').val()
    var notes = jQuery('#order-notes').val()
    var width = 48002;
    var height = 35558;

  }.bind(newAnnot))

}

annotools.prototype.barMouseDown = function(event)
{
    if (document.getElementById('div_weight_locked').innerHTML == 'Locked')
    {
        return;
    }

    console.log('bar_mousedown');
    console.log(bar_click);
    console.log(event.target.id);
    var set_perc = ((((event.clientX - bar_var1.offsetLeft) / bar_var1.offsetWidth)).toFixed(2));
    if (event.target.id == 'slide1' || event.target.id == 'bar1')
    {
        bar_click = 1;
        //slide_var1.style.width = (set_perc * 100) + '%';
        selected_slide = slide_var1;
    }
    else if (event.target.id == 'slide2' || event.target.id == 'bar2')
    {
        bar_click = 2;
        selected_slide = slide_var2;
    }
    else
    {
        bar_click = 3;
        selected_slide = slide_var3;
    }

    selected_slide.style.width = (set_perc * 100) + '%';
}

annotools.prototype.barMouseUp = function(event)
{
    if (document.getElementById('div_weight_locked').innerHTML == 'Locked')
    {
        return;
    }

    var self = this;
    //console.log('bar_mouseup');
    if (bar_click == 0)
    {
        return;
    }
    var set_perc = ((((event.clientX - bar_var1.offsetLeft) / bar_var1.offsetWidth)).toFixed(2));
    //this.prev_heat_weight[bar_click-1] = this.heat_weight[bar_click-1];
    this.prev_heat_weight = this.heat_weight.slice();
    this.heat_weight[bar_click-1] = set_perc;
    console.log(set_perc);
    bar_click = 0;
    this.cb_checked[0] = document.getElementById('cb1').checked;
    this.cb_checked[1] = document.getElementById('cb2').checked;
    this.cb_checked[2] = document.getElementById('cb3').checked;
    self.getMultiAnnot();
}

annotools.prototype.barMouseSlide = function(event)
{
    if (document.getElementById('div_weight_locked').innerHTML == 'Locked')
    {
        return;
    }

    if (bar_click != 0)
    {
        //console.log('bar_mouseslide');
        var set_perc = ((((event.clientX - bar_var1.offsetLeft) / bar_var1.offsetWidth)).toFixed(2));
        if (bar_click == 1)
        {
            slide_var1.style.width = (set_perc * 100) + '%';
        }
        else if (bar_click == 2)
        {
            slide_var2.style.width = (set_perc * 100) + '%';
        }
        else
        {
            slide_var3.style.width = (set_perc * 100) + '%';
        }
    }
}

annotools.prototype.checkboxChange = function(event)
{
    var self = this;
    if (event.target.id == 'cb1')
    {
    }
    else
    {
    }
    self.getMultiAnnot();
}

// Added for temp weight boxes
annotools.prototype.lymnecWeightChange = function(event)
{
        var self = this;
        self.getMultiAnnot();
}

/*
annotools.prototype.saveHeatmapWeight = function(event)
{
    var self = this;
    console.log('enter save heatmap');
    $.ajax({
        type: "POST",
        url: "php/save_weight.php",
        data: {iid: self.iid, lymweight: this.heat_weight[0], necweight: this.heat_weight[1], smoothness: this.heat_weight[2], user: this.username},
        dataType: "text",
        success: function(data) {
            console.log(data);
            if (data.startsWith('Locked')) {
                console.log('being locked');
                alert ('This heatmap has been locked');
            } else {
                document.getElementById('div_weight_locked').innerHTML = 'Locked';
                alert('Saved heatmap weights');
            }
        }
    });
}
*/

annotools.prototype.saveHeatmapWeight = function(event)
{
    console.log('Start saveHeatmapWeight');
    
    var self = this;
    var weightData = {
        'case_id': self.iid,
        'lymweight': this.heat_weight[0],
        'necweight': this.heat_weight[1],
        'smoothness': this.heat_weight[2],
        'username': this.username   
    };
    
    //Check if record for this case_id and this username already exists in mongodb
    var url1 = "api/Data/lymphocyteData.php?case_id="+  self.iid + "&username=" + this.username;
    
    // Debug
    console.log(url1);

    jQuery.get(url1, function(d){
        try{
            var data = JSON.parse(d);
            console.log('Retrived heat weights: ' + JSON.stringify(data[0]));
            console.log("Fetched data length: " + data.length);
      
            if (data.length > 0){
                console.log('Record exists');
                alert ('This heatmap has been locked');
            }
			else {
                 jQuery.ajax({
                'type': 'POST',
                 url: 'api/Data/lymphocyteData.php',
                 data: weightData,
                 success: function (res, err) {
                    //console.log("response: ")
                    console.log(res)
                    console.log(err)

                    console.log('successfully posted')
                    document.getElementById('div_weight_locked').innerHTML = 'Locked';
                    alert('Saved heatmap weights');
                    }
                })   
            }
        } catch (e){
            console.log('ERROR');
            console.log(e);
        }
        
    });
}

annotools.prototype.loadHeatmapWeight = function()
{
    var self = this;
    //console.log('Load heatmap weights');
    //console.log(self.iid);
    //console.log(this.username);
    
    // Start API
     var url1 = "api/Data/lymphocyteData.php?case_id="+  self.iid +"&username=" + this.username;
    
    // Debug
    console.log(url1);

    jQuery.get(url1, function(d){

        try{
            var data = JSON.parse(d);
            //console.log('Retrived heat weights: ' + JSON.stringify(data[0]));
            //console.log("Fetched data length: " + data.length);
            
            // Start weights
            var sl1 = document.getElementById('slide1');
            var sl2 = document.getElementById('slide2');
            var sl3 = document.getElementById('slide3');
            var div_lock = document.getElementById('div_weight_locked');
            console.log(data);
            
            if ( data.length > 0) {
    
                //console.log("case_id" + data[0].case_id);
                //console.log("lymweight" + data[0].lymweight);
                //console.log("necweight" + data[0].necweight);
                //console.log("smoothness" + data[0].smoothness);
                //console.log("username" + data[0].username);
                
                var lym = data[0].lymweight;
                var nec = data[0].necweight;
                var smh = data[0].smoothness;

                if (lym){
                   lym = (parseFloat(lym) * 100).toString() + '%';
                }else {
                   lym = '50%';
                }

                if (nec){
                    nec = (parseFloat(nec) * 100).toString() + '%';
                }else {
                    nec = '50%';
                }

                if (smh){
                    smh = (parseFloat(smh) * 100).toString() + '%';   
                }else {
                    smh = '0%';
                }

                sl1.style.width = lym;
                sl2.style.width = nec;
                sl3.style.width = smh;
                this.prev_heat_weight = [lym, nec, smh];
                div_lock.innerHTML = "Locked";
                self.updateHeatVarFromSlideBar();
            }else {
                console.log('go else');
                sl1.style.width = '77%';
                sl2.style.width = '100%';
                sl3.style.width = '15%';
                this.prev_heat_weight = [0.77, 1.00, 0.15];
                div_lock.innerHTML = "Free";
            }
        } catch (e){
            console.log('ERROR');
            console.log(e);
        }
    });
        
    // Wait for the load weight transfering data
    var start = new Date().getTime();
    var delay = 200;
    while (new Date().getTime() < start + delay);
    //console.log(document.getElementById('slide1').style.width);
    //console.log(document.getElementById('div_weight_locked').innerHTML);
    self.getMultiAnnot();
}

/*
annotools.prototype.loadHeatmapWeight = function()
{
    var self = this;
    console.log('Load heatmap weights');
    console.log(self.iid);
    $.ajax({
        type: "POST",
        url: "php/load_weight.php",
        data: {iid: self.iid, user: this.username},
        dataType: "text",
        success: function(data) {
            var sl1 = document.getElementById('slide1');
            var sl2 = document.getElementById('slide2');
            var sl3 = document.getElementById('slide3');
            var div_lock = document.getElementById('div_weight_locked');
            console.log(data);
            if (!data.startsWith('NaN')) { 
                parts = data.split('\n');
                //arr = [parseFloat(parts[0]), parseFloat(parts[1])];
                //var sl1 = document.getElementById('slide1');
                //var sl2 = document.getElementById('slide2');
                //var sl3 = document.getElementById('slide3');
                var lym = (parseFloat(parts[0]) * 100).toString() + '%';
                if (lym == 'NaN%') {
                    lym = '50%';
                }
                var nec = (parseFloat(parts[1]) * 100).toString() + '%';
                if (nec == 'NaN%') {
                    nec = '50%';
                }
                var smh = (parseFloat(parts[2]) * 100).toString() + '%';
                if (smh == 'NaN%') {
                    smh = '0%';
                }
                sl1.style.width = lym;
                sl2.style.width = nec;
                sl3.style.width = smh;
		        this.prev_heat_weight = [lym, nec, smh];
                div_lock.innerHTML = "Locked";
                //var lym_f = parseFloat(lym.substring(0, lym.length)) / 100;
                //var nec_f = parseFloat(nec.substring(0, nec.length)) / 100;
                //var smh_f = parseFloat(smh.substring(0, smh.length)) / 100;
                //this.heat_weight = [lym_f, nec_f, smh_f];
                //console.log(this.heat_weight);
                self.updateHeatVarFromSlideBar();
            } else {
                console.log('go else');
                sl1.style.width = '77%';
                sl2.style.width = '100%';
                sl3.style.width = '0%';
		        this.prev_heat_weight = [0.77, 1.00, 0];
                div_lock.innerHTML = "Free";
            }
        }
    });

    // Wait for the load weight transfering data
    var start = new Date().getTime();
    var delay = 200;
    while (new Date().getTime() < start + delay);
    console.log(document.getElementById('slide1').style.width);
    console.log(document.getElementById('div_weight_locked').innerHTML);
    self.getMultiAnnot();
}
*/

annotools.prototype.updateHeatVarFromSlideBar = function()
{
    this.prev_heat_weight = this.heat_weight;
    var sl1 = document.getElementById('slide1');
    var sl2 = document.getElementById('slide2');
    var sl3 = document.getElementById('slide3');
    var lym = parseFloat(sl1.style.width.substring(0, sl1.style.width.length)) / 100;
    var nec = parseFloat(sl2.style.width.substring(0, sl2.style.width.length)) / 100;
    var smh = parseFloat(sl3.style.width.substring(0, sl3.style.width.length)) / 100;
    this.heat_weight = [lym, nec, smh];
}

annotools.prototype.revertWeight = function(event)
{
    var self = this;
    if (document.getElementById('div_weight_locked').innerHTML == 'Locked')
    {
        return;
    }
    console.log('revert weights');
    var sl1 = document.getElementById('slide1');
    var sl2 = document.getElementById('slide2');
    var sl3 = document.getElementById('slide3');
    var div_lock = document.getElementById('div_weight_locked');

    console.log(this.prev_heat_weight);
    sl1.style.width = this.prev_heat_weight[0]*100 + '%';
    sl2.style.width = this.prev_heat_weight[1]*100 + '%';
    sl3.style.width = this.prev_heat_weight[2]*100 + '%';
    self.updateHeatVarFromSlideBar();

    self.getMultiAnnot();

}

annotools.prototype.isLymphSuperuser = function()
{
    var self = this;
    //console.log("lymphUser.superuserRole: " + lymphUser.superuserRole);
    
    self.username = self.username.toLowerCase();
    var role = lymphUser.superuserRole;
    var url = "api/Data/lymphocyteSuperusers.php?email=" + self.username + "&role=" + role;
    
    // Debug
    console.log(url);

    jQuery.get(url, function(d) {
        try {
            var data = JSON.parse(d);
            console.log("Fetched data users length: " + data.length);
            
            // Start users
            console.log(data);
            //console.log("email: " + data[0].email);
            //console.log("role: " + data[0].role);
            
            if ( data.length > 0) {
                self.lymphSuperuser = true;   
            }
            console.log('self.lymphSuperuser: ' + self.lymphSuperuser);
            
        } catch (e){
            console.log('ERROR');
            console.log(e);
        }
    }); 
}

annotools.prototype.loadChangeUsername = function()
{
    var self = this;
    
    console.log('loadChangeUsername ' + self.username);
    
    var url1 = "api/Data/getLymphocyteDataByCaseId.php?case_id=" +  self.iid;
    
    // Debug
    console.log(url1);

    jQuery.get(url1, function(d) {
        
        var container =  jQuery('#switchuserpanel');
        
        jQuery('#closeSwitchUser').click(function (e) {
	        e.preventDefault();
            jQuery('#switchuserpanel').hide('slide');
        })

        try {
            var data = JSON.parse(d);
            //console.log("Fetched data users length: " + data.length);
            
            // Start users
            console.log(data);
            
            if ( data.length > 0) {
                for ( var j = 0; j < data.length; j++ ) {
                    //console.log("username: " + data[j].username);
                    if (data[j].username != null) {
                        if (data[j].username.trim() === self.username) {
                            container.append('<label><input type="radio" name="usergroup" value="' + data[j].username + '" id="switch_user_'+ j +'" class="radio_user" checked="checked" /> ' + data[j].username + '</label><br />');
                        }else {
                            container.append('<label><input type="radio" name="usergroup" value="' + data[j].username + '" id="switch_user_'+ j +'" class="radio_user" /> ' + data[j].username + '</label><br />');      
                        }
                    
                        //switch
                        var switch_user_eles = document.getElementById('switch_user_' + j.toString());
                        if (switch_user_eles != null) {
                            switch_user_eles.addEventListener('click', self.switchUserRadiobuttonChange.bind(self), false);
                        } else {
                            break;
                        }
                    }
                } 
            }
        } catch (e){
            console.log('ERROR');
            console.log(e);
        }
    });
}


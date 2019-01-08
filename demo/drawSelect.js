let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: '../apps/table.html',
    table: '../apps/table.html'
  },
  params: null // parameter from url - slide Id and status in it (object).
};

/**
 * Toolbar button callback
 * @param e
 */
function drawRectangle(e) {
  console.log(e);
  let canvas = $CAMIC.viewer.drawer.canvas; //Original Canvas
  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

  //let ctx = $CAMIC.viewer.drawer.context;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'rect';
  canvasDraw.style.color = '#FFFF00';
  canvasDraw.style.isFill = false;

  if (e.checked) {
    canvasDraw.drawOn();
    
  
    // User initiates rectangle-draw
    //customDraw(document.getElementById('main_viewer')); // <-- custom rectangle select
    //camicDraw(e); // <-- uses default rectangle tool

    // ctx.fillStyle = "pink";
    // ctx.fillRect(0, 0, 300, 150);

  } else {
    canvasDraw.drawOff();
    // User is done with the tool
    //customStopDraw(canvas); // <-- custom rectangle select

    // ctx.clearRect(0, 0, 300, 150);
  }

}


/**
 * Custom rectangle draw
 *
 * @param canvas
 */
function customDraw(canvas) {

  function setMousePosition(e) {
    let ev = e || window.event; //Moz || IE
    if (ev.pageX) { //Moz
      mouse.x = ev.pageX + window.pageXOffset;
      mouse.y = ev.pageY + window.pageYOffset;
    } else if (ev.clientX) { //IE
      mouse.x = ev.clientX + document.body.scrollLeft;
      mouse.y = ev.clientY + document.body.scrollTop;
    }
  }

  let mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
  };
  let element = null;

  canvas.onmousemove = function (e) {
    setMousePosition(e);
    if (element !== null) {
      element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
      element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
      element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
      element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
    }
  };

  canvas.onclick = function (e) {
    // console.log(e);
    if (element !== null) {
      element = null;
      canvas.style.cursor = "default";
      // console.log("finished.");
      customStopDraw(e);
    } else {
      // console.log("begun.");
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      element = document.createElement('div');
      element.id = 'myDiv';
      element.className = 'rectangle';
      element.style.left = mouse.x + 'px';
      element.style.top = mouse.y + 'px';
      canvas.appendChild(element);
      canvas.style.cursor = "crosshair";
    }
  }
}

/**
 * Copy canvas selection as image.
 *
 * @param e
 */
function customStopDraw(e) {

  let myDiv = document.getElementById('myDiv');

  let dim = getDim(myDiv);

  // Original canvas
  // let canvas = document.querySelector('canvas');

  // Create equivalent canvas in same location as myDiv
  let canvas = document.createElement('canvas');
  canvas.id = 'myCanvas';
  canvas.width = parseInt(dim.w);
  canvas.height = parseInt(dim.h);
  canvas.style.left = dim.x + 'px';
  canvas.style.top = dim.y + 'px';
  document.body.appendChild(canvas);

  // TODO: fix (getting transparent image)

  let image = new Image();
  image.src = canvas.toDataURL("image/png");

  document.body.appendChild(image); // TESTING.
  console.log(image.src);


  // let ctx = $CAMIC.viewer.drawer.context;
  // let imgData = ctx.getImageData(x, y, w, h);
  // var c = document.createElement('canvas');
  // c.id = 'myCanvas';
  // var ct = c.getContext("2d");
  // ct.putImageData(imgData, 10, 70);

  /*
  var doc = document,
      docElem = doc.documentElement,
      body = document.body,
      win = window,
      clientTop = docElem.clientTop || body.clientTop || 0,
      clientLeft = docElem.clientLeft || body.clientLeft || 0,
      scrollTop = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop || body.scrollTop,
      scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
      top = box.top + scrollTop - clientTop,
      left = box.left + scrollLeft - clientLeft;

  console.log('x', left);
  console.log('y', top);
  */
}

/**
 * getDim
 *
 * @param obj
 * @returns {{w: string, x: string, h: string, y: string}}
 */
function getDim(obj) {

  // Get bounding rectangle
  let box = {left: 0, top: 0};
  try {
    box = obj.getBoundingClientRect();
  } catch (e) {
  }

  // Round:
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    w: Math.round(box.width),
    h: Math.round(box.height)
  }

}

/**
 * getDimFromStyle
 *
 * @param style
 * @returns {{w: string, x: string, h: string, y: string}}
 */
function getDimFromStyle(style)
{
  let w = style.width;
  let h = style.height;
  let x = style.left;
  let y = style.top;

  // Strip off the 'px':
  return {
    x: x.substring(0, x.length - 2),
    y: y.substring(0, y.length - 2),
    w: w.substring(0, w.length - 2),
    h: h.substring(0, h.length - 2)
  }
}


/**
 * Uses camic draw instance to draw the rectangle
 * @param e
 */
function camicDraw(e) {

  // TODO: Implement ability to set stroke and fill
  // canvasDraw currently uses one color, only. Transparency when drawing then opaque upon finish.

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'rect';
  canvasDraw.style.color = '#FFFF00';
  // TODO: This is a hack b/c of a bug. Fix bug where rectangle turns black.
  canvasDraw._display_ctx_.fillStyle = 'rgba(255, 255, 0, 0.5)';

  /*
  // Original "#000000"
  const ctx = canvasDraw._display_ctx_;
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.strokeStyle = '#FF0000';
  ctx.shadowColor = 'rgba(255, 255, 255, 0)';

  // Original "#7cfc00"
  const draw = canvasDraw._draw_ctx_;
  draw.fillStyle = 'rgba(255, 255, 255, 0)';
  draw.strokeStyle = '#FF0000';
  draw.shadowColor = 'rgba(255, 255, 255, 0)';
  */

  if (e.checked) {
    // Button clicked
    canvasDraw.drawOn();
  } else {
    // Button un-clicked
    canvasDraw.drawOff();
  }
  //canvasDraw.addHandler('stop-drawing', camicStopDraw);
}

/**
 * Get pixels to create image (pass to ImageJs)
 * @param event
 */
function camicStopDraw(event) {
  const viewer = $CAMIC.viewer;
  const canvas = viewer.drawer.canvas;
  const ctx = viewer.drawer.context;
  const canvasDraw = viewer.canvasDrawInstance;

  console.log('canvas:\n', canvas);
  console.log('ctx:\n', ctx);
  console.log('canvasDraw:\n', canvasDraw);

  let imgColl = canvasDraw.getImageFeatureCollection();
  let bound;
  if (imgColl.features.length > 0) {

    // 5x2 array
    bound = imgColl.features[0].bound;

    // Convert to screen coordinates
    convertCoordinates(viewer.imagingHelper, bound);

    console.log('bound:\n', bound);

    const xCoord = bound[0][0];
    const yCoord = bound[0][1];

    width = (bound[2][0] - xCoord);
    height = (bound[2][1] - yCoord);
    console.log('width, height:\n', width, height);

    // Clear rect
    ctx.clearRect(xCoord, yCoord, width, height);
    console.log(ctx);


    // TODO: NOTE! When we do document.body.append, the rectangle turns black again. :(
    // ImageData - Uint8ClampedArray, width, height
    let imgData = ctx.getImageData(xCoord, yCoord, width, height);

    // TODO: fix (getting transparent image)
    let c = document.createElement('canvas');
    c.id = 'myCanvas';
    let ct = c.getContext("2d");
    ct.putImageData(imgData, 0, 0);
    document.body.appendChild(c);

    let data = imgData.data;
    console.log('Pixel data:\n', data);

    // Data URI containing representation of image
    let omg = c.toDataURL("image/png");
    console.log('Data URI containing representation of image:\n', omg);
    let img = document.createElement('img');
    img.id = 'testing';
    img.src = omg;
    //document.body.appendChild(img);


  } else {
    console.error('Could not get feature collection.')
  }

}

/**
 * Image coordinate to screen coordinate
 *
 * @param imagingHelper
 * @param bound
 */
function convertCoordinates(imagingHelper, bound) {

  // 'image coordinate' to 'normalized'
  // console.log('normalized:\n', imagingHelper.dataToLogicalX(bound[0][0]), imagingHelper.dataToLogicalY(bound[0][1]));

  // 'image coordinate' to 'screen coordinate'
  for (let i = 0; i < bound.length; i++) {
    let boundElement = bound[i];
    for (let j = 0; j < boundElement.length; j++) {
      bound[i][j] = j === 0 ? Math.round(imagingHelper.dataToPhysicalX(boundElement[j])) : Math.round(imagingHelper.dataToPhysicalY(boundElement[j]));
    }
  }

}


function initialize() {
  initUIcomponents();
  initCore();
}

function initUIcomponents() {
  $UI.toolbar = new CaToolbar({
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    subTools: [
      // rectangle draw
      {
        icon: 'timeline',
        type: 'check',
        value: 'rect',
        title: 'Rectangle',
        callback: drawRectangle
      }
    ]
  });
}

// setting core functionality
function initCore() {
  // start initial
  const opt = {
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: true
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }
  try {
    $CAMIC = new CaMic("main_viewer", $D.params.slideId, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }
  $CAMIC.loadImg(function (e) {
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message)
    }
  });

  // 
  $CAMIC.viewer.addOnceHandler('open',function(e){
    // add stop draw function 
    $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', camicStopDraw);
  });
}

function redirect(url, text = '', sec = 5) {
  let timer = sec;
  setInterval(function () {
    if (!timer) {
      window.location.href = url;
    }

    if (Loading.instance.parentNode) {
      Loading.text.textContent = `${text} ${timer}s.`;
    } else {
      Loading.open(document.body, `${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;

  }, 1000);
}

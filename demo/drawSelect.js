let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: './table.html',
    table: './table.html'
  },
  params: null // parameter from url - slide Id and status in it (object).
};

/**
 * Toolbar button callback
 * @param e
 */
function drawRectangle(e) {

  let canvas = $CAMIC.viewer.drawer.canvas; //Original Canvas
  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

  //let ctx = $CAMIC.viewer.drawer.context;

  if (e.checked) {

    // User initiates rectangle-draw
    //initDraw(document.getElementById('main_viewer')); // <-- custom rectangle select
    initDrawTemp(e); // <-- uses default rectangle tool

    // ctx.fillStyle = "pink";
    // ctx.fillRect(0, 0, 300, 150);

  } else {

    // User is done with the tool
    //stopDraw(canvas); // <-- custom rectangle select

    // ctx.clearRect(0, 0, 300, 150);
  }

}

/**
 * Get pixels to create image (pass to ImageJs)
 * @param event
 */
function stopDrawTemp(event) {

  const viewer = $CAMIC.viewer;
  const canvas = viewer.drawer.canvas;
  const ctx = viewer.drawer.context;
  const canvasDraw = viewer.canvasDrawInstance;

  let imgColl = canvasDraw.getImageFeatureCollection();
  let bound;
  if (imgColl.features.length > 0) {

    // 5x2 array
    bound = imgColl.features[0].bound;

    const xCoord = bound[0][0];
    const yCoord = bound[0][1];

    // ImageData - Uint8ClampedArray, width, height
    let imgData = ctx.getImageData(xCoord, yCoord, canvas.width, canvas.height);

    // Copy the pixel data
    let data = imgData.data;

    // Data URI containing representation of image
    let img    = canvas.toDataURL("image/png");

  }
  else
  {
    console.error('Could not get feature collection.')
  }

}

/**
 * Uses camic draw instance to draw the rectangle
 * @param e
 */
function initDrawTemp(e) {

  // TODO: Implement ability to set stroke and fill
  // canvasDraw currently uses one color, only. Transparency when drawing then opaque upon finish.

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'rect';
  //canvasDraw.style.color = '#FF0000';
  canvasDraw.style.color = '#FFFF00';
  // Hack.
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
    canvasDraw.drawOn();
  } else {
    canvasDraw.drawOff();
  }
  canvasDraw.addHandler('stop-drawing', stopDrawTemp);
}

/**
 * Copy canvas selection as image.
 */
function stopDraw(e) {

  let my_div = document.getElementById('yabbadabbadoo');

  // layout width in pixels as integer
  // let intElemOffsetWidth = my_div.offsetWidth;
  // let intElemOffsetHeight = my_div.offsetHeight;

  // Get bounding rectangle
  let box = {left: 0, top: 0};
  try {
    box = my_div.getBoundingClientRect();
  } catch (e) {
  }
  console.log('box', box);

  // TODO: convert coordinates, and get pixels from canvas.

  // Offset 2px for draw?
  let x = Math.round(box.x);
  let y = Math.round(box.y);
  let w = Math.round(box.width);
  let h = Math.round(box.height);

  console.log(x, y, w, h);

  //convert somehow

  //let canvas = $CAMIC.viewer.drawer.canvas;
  // let ctx = $CAMIC.viewer.drawer.context;
  //
  // const xCoord = bound[0][0];
  // const yCoord = bound[0][1];
  // const canvasWidth = event.eventSource._display_.width;
  // const canvasHeight = event.eventSource._display_.height;
  //
  // let imgData = ctx.getImageData(xCoord, yCoord, canvasWidth, canvasHeight);
  //
  // let data = imgData.data;
  // console.log('array', Array.isArray(data));
  // console.log('type', typeof data);
  // console.log('imgData', data);

  // copy(bound, event, canvasDraw);
  // var canvas = event.eventSource._draw_;
  // var img    = canvas.toDataURL("image/png");
  // console.log(img);


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
 * init draw
 * @param canvas
 */
function initDraw(canvas) {

  function setMousePosition(e) {
    var ev = e || window.event; //Moz || IE
    if (ev.pageX) { //Moz
      mouse.x = ev.pageX + window.pageXOffset;
      mouse.y = ev.pageY + window.pageYOffset;
    } else if (ev.clientX) { //IE
      mouse.x = ev.clientX + document.body.scrollLeft;
      mouse.y = ev.clientY + document.body.scrollTop;
    }
  }

  var mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
  };
  var element = null;

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
      stopDraw(e);
    } else {
      // console.log("begun.");
      mouse.startX = mouse.x;
      mouse.startY = mouse.y;
      element = document.createElement('div');
      element.id = 'yabbadabbadoo';
      element.className = 'rectangle';
      element.style.left = mouse.x + 'px';
      element.style.top = mouse.y + 'px';
      canvas.appendChild(element);
      canvas.style.cursor = "crosshair";
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

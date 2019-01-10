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

  let canvas = $CAMIC.viewer.drawer.canvas; //Original Canvas
  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

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

  let image = new Image();
  image.src = canvas.toDataURL("image/png");

  document.body.appendChild(image); // TESTING.
  console.log(image.src);
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
function getDimFromStyle(style) {
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

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'rect';
  canvasDraw.style.color = '#FFFF00';

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

  console.log(event);

  const viewer = $CAMIC.viewer;
  const ctx = viewer.drawer.context;
  const canvasDraw = viewer.canvasDrawInstance;

  let imgColl = canvasDraw.getImageFeatureCollection();

  if (imgColl.features.length > 0) {

    // Do something with it
    testDraw(imgColl, viewer.imagingHelper);

  } else {
    console.error('Could not get feature collection.')
  }

}

function testDraw(imgColl, imagingHelper)
{
  let camicanv = $CAMIC.viewer.drawer.canvas; //Original Canvas

  // 5x2 array
  let bound = imgColl.features[0].bound;
  console.log('bound:\n', bound);

  // Convert to screen coordinates
  let foo = convertCoordinates(imagingHelper, bound, 1);
  console.log('Convert to screen:\n', foo);

  // let bar = convertCoordinates(viewer.imagingHelper, bound, 0);
  // console.log('Convert to normalized:\n', bar);

  //retina screen
  let newArray = foo.map(function (a) {
    let x = a.slice();
    x[0] *= 2;
    x[1] *= 2; // need to adjust, try layer
    return x;
  });

  const xCoord = newArray[0][0];
  const yCoord = newArray[0][1];

  let width = (newArray[2][0] - xCoord);
  let height = (newArray[2][1] - yCoord);
  console.log('width, height:\n', width, height);

  let imgData = (camicanv.getContext('2d')).getImageData(xCoord, yCoord, width, height);
  // Draw as canvas
  let canvas = document.createElement('canvas');
  canvas.id = 'myCanvas';
  canvas.style.border = "thick solid #0000FF";
  canvas.width = imgData.width;
  canvas.height = imgData.height;

  let context = canvas.getContext("2d");
  context.putImageData(imgData, 0, 0);
  document.body.appendChild(canvas);

  /*
  let data = imgData.data;
  console.log('Pixel data:\n', data);

  // Draw as image
  let omg = canvas.toDataURL("image/png");
  // console.log('Data URI containing representation of image:\n', omg);
  let img = document.createElement('img');
  img.id = 'testing';
  img.src = omg;
  img.width = imgData.width;
  img.height = imgData.height;
  img.style.border = "thick solid #FFFF00";
  document.body.appendChild(img);
  */
}


/**
 * Image coordinate to screen coordinate
 */
function convertCoordinates(imagingHelper, bound, type) {

  let newArray = bound.map(function (arr) {
    return arr.slice(); // copy
  });

  if (type === 0) {
    // 'image coordinate' to 'normalized'
    for (let i = 0; i < newArray.length; i++) {
      let boundElement = newArray[i];
      for (let j = 0; j < boundElement.length; j++) {

        newArray[i][j] = j === 0 ? Math.round(imagingHelper.dataToLogicalX(boundElement[j]))
            : Math.round(imagingHelper.dataToLogicalY(boundElement[j]));
      }
    }

  } else {
    // 'image coordinate' to 'screen coordinate'
    for (let i = 0; i < newArray.length; i++) {
      let boundElement = newArray[i];
      for (let j = 0; j < boundElement.length; j++) {

        newArray[i][j] = j === 0 ? Math.round(imagingHelper.dataToPhysicalX(boundElement[j]))
            : Math.round(imagingHelper.dataToPhysicalY(boundElement[j]));
      }
    }
  }
  return newArray;

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

  $CAMIC.viewer.addOnceHandler('open', function (e) {
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

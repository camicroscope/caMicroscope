let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: '../apps/table.html',
    table: '../apps/table.html'
  },
  params: null // parameter from url - slide Id and status in it (object).
};

let PDR = OpenSeadragon.pixelDensityRatio;
console.log('pixelDensityRatio:', PDR);

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

  } else {
    canvasDraw.drawOff();

  }

}

/**
 * Get pixels to create image (pass to ImageJs)
 * @param event
 */
function camicStopDraw(e) {

  //let main_viewer = document.getElementById('main_viewer');
  //let clickPos = getClickPosition(e, main_viewer);

  const viewer = $CAMIC.viewer;
  const canvasDraw = viewer.canvasDrawInstance;

  let imgColl = canvasDraw.getImageFeatureCollection();

  if (imgColl.features.length > 0) {

    // Do something with it

    testDraw(imgColl, viewer.imagingHelper);

    //drawAllTheThings(imgColl, viewer.imagingHelper);

  } else {
    console.error('Could not get feature collection.')
  }

}

function getClickPosition(e, htmlElement) {
  let event = e.originalEvent;

  if (typeof event !== 'undefined') {
    console.log(event.type);
  } else {
    event = e;
    console.log(event.type);
  }


  let clickPos = {};
  clickPos.x = event.offsetX ? (event.offsetX) : event.pageX - htmlElement.offsetLeft;
  clickPos.y = event.offsetY ? (event.offsetY) : event.pageY - htmlElement.offsetTop;

  clickPos.x *= PDR;
  clickPos.y *= PDR;

  console.log('clickPos', clickPos);
  return clickPos;

}

function testDraw(imgColl, imagingHelper) {
  let camicanv = $CAMIC.viewer.drawer.canvas; //Original Canvas

  // 5x2 array
  let bound = imgColl.features[0].bound;

  // Convert to screen coordinates
  let foo = convertCoordinates(imagingHelper, bound, 1);

  // let bar = convertCoordinates(viewer.imagingHelper, bound, 0);
  // console.log('Convert to normalized:\n', bar);

  //retina screen
  let newArray = foo.map(function (a) {
    let x = a.slice();
    x[0] *= PDR;
    x[1] *= PDR; // need to adjust, try layer
    return x;
  });
  console.log('bounds', newArray);

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


function drawAllTheThings(imgColl, imagingHelper) {

  const collection = document.querySelectorAll('canvas');
  collection.forEach((currentCanvas, index) => {
    console.log(`Current index: ${index}`);

    // 5x2 array
    let bound = imgColl.features[0].bound;

    // Convert to screen coordinates
    let foo = convertCoordinates(imagingHelper, bound, 1);

    //retina screen
    let newArray = foo.map(function (a) {
      let x = a.slice();
      x[0] *= PDR;
      x[1] *= PDR;
      return x;
    });

    const xCoord = newArray[0][0];
    const yCoord = newArray[0][1];

    let width = (newArray[2][0] - xCoord);
    let height = (newArray[2][1] - yCoord);
    console.log('width, height:\n', width, height);
    console.log('current canvas width, height:\n', currentCanvas.width, currentCanvas.height);

    let imgData = (currentCanvas.getContext('2d')).getImageData(xCoord, yCoord, width, height);

    // Draw as canvas
    let canvas = document.createElement('canvas');
    canvas.id = `myCanvas${index}`;
    canvas.style.border = "thick solid #0000FF";
    canvas.width = imgData.width;
    canvas.height = imgData.height;

    let context = canvas.getContext("2d");
    context.putImageData(imgData, 0, 0);
    document.body.appendChild(canvas);

  });

}


/**
 * Convert image coordinates
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

        newArray[i][j] = j === 0 ? imagingHelper.dataToLogicalX(boundElement[j])
            : imagingHelper.dataToLogicalY(boundElement[j]);
      }
    }

  } else {
    // 'image coordinate' to 'screen coordinate'
    for (let i = 0; i < newArray.length; i++) {
      let boundElement = newArray[i];
      for (let j = 0; j < boundElement.length; j++) {
        newArray[i][j] = j === 0 ? imagingHelper.dataToPhysicalX(boundElement[j])
            : imagingHelper.dataToPhysicalY(boundElement[j]);
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

    // let m = document.getElementById('main_viewer');
    // m.addEventListener('mousedown', function (e) {
    //   getClickPosition(e, m);
    // });

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

let PDR = OpenSeadragon.pixelDensityRatio;
const IDB_URL = "indexeddb://";

// INITIALIZE DB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// id(autoinc), name, location(name+id), classes
var request, db;

// tensorflowjs creates its own IndexedDB on saving a model.
(async function(callback) {
    const model = tf.sequential();
  await model.save('indexeddb://dummy');
  await tf.io.removeModel('indexeddb://dummy');
  console.log('DB initialised');
  callback();
})(dbInit)

// Opening the db created by tensorflowjs
function dbInit() {
  request = window.indexedDB.open("tensorflowjs", 1);

  request.onupgradeneeded = function (e) {
    console.log('nasty!');
  }
  request.onerror = function (e){
    console.log("ERROR", e);
  }
  request.onsuccess = function(e) {
    db = request.result;
    console.log(db.objectStoreNames);
    console.log('tfjs db opened and ready');
  }
}


let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: '',
    table: ''
  },
  params: null
};
// const objAreaMin = 400;
// const objAreaMax = 4500;
// const lineWidth = 2;
// const timeOutMs = 10;


function initialize() {
      var checkPackageIsReady = setInterval(function () {
        if(IsPackageLoading) {
          clearInterval(checkPackageIsReady);
            initUIcomponents();
            initCore();
        }
      }, 100);
}

function initUIcomponents() {
  /* create UI components */

  // Create uploadModal for model uploads.
  $UI.uploadModal = new ModalBox({
    id:'upload_panel',
    hasHeader:true,
    headerText:'Upload Model',
    hasFooter:false,
    provideContent: true,
    content: `
      <form action="#">
        <label align="left"> Name:  </label> <input name="name" id="name" type="text" required /> <br> <hr>
        <div> Enter the classes model classifies into separated by comma. </div>
        <label align="left"> Classes: </label> <input name="classes" id="classes" type="text" required /> <br><hr>
        <label align="left"> Input image size: </label> <input name="image_size" id="image_size" type="number" required /> <br><hr>
        <div>Select model.json first followed by the weight binaries.</div> <br> 
        <input name="filesupload" id="modelupload" type="file" required/>
        <input name="filesupload" id="weightsupload" type="file" multiple="" required/> <br> <br>
        <button id="submit">Upload</button> <span id="status"></span>
      </form>  
    `
  });

  // Create infoModal to show information about models uploaded.
  $UI.infoModal = new ModalBox({
    id: "model_info",
    hasHeader: true,
    headerText: "Available Models",
    hasFooter: false,
    provideContent: true,
    content: `
      <table id='mtable'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Classes</th>
            <th>Input Size</th>
            <th>Size (MB)</th>
            <th>Date Saved</th>
          </tr>
          <tbody id="mdata">
          </tbody>
        </thead>
      </table>
    `
  });

  // create the message queue
  $UI.message = new MessageQueue();

  // create toolbar
  $UI.toolbar = new CaToolbar({
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    subTools: [
      {
        icon: 'aspect_ratio',
        type: 'check',
        value: 'rect',
        title: 'Run Model',
        callback: drawRectangle
      }, {
        icon: 'insert_photo',
        type: 'btn',
        value: 'viewer',
        title: 'Viewer',
        callback: function () {
          if (window.location.search.length > 0) {
            window.location.href = '../viewer/viewer.html' + window.location.search;
          } else {
            window.location.href = '../viewer/viewer.html';
          }
        }
      },{
        icon: 'add',
        type: 'btn',
        value: 'Upload model',
        title: 'Add model',
        callback: uploadModel
      },{
        icon: 'info',
        type: 'btn',
        value: 'Model info',
        title: 'Model info',
        callback: showInfo
      },{
        icon: 'bug_report',
        title: 'Bug Report',
        value: 'bugs',
        type: 'btn',
        callback: () => {
          window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53', '_blank').focus()
        }
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
    let slideQuery = {}
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    $CAMIC = new CaMic("main_viewer", slideQuery, opt);
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
    }else{
      $D.params.data = e;
    }
  });

  $CAMIC.viewer.addOnceHandler('open', function (e) {
    const viewer =  $CAMIC.viewer;
    // add stop draw function
    viewer.canvasDrawInstance.addHandler('stop-drawing', camicStopDraw);

    // UI to select the part of image
    $UI.modelPanel = new ModelPanel(viewer);

    // Model is selected and run right after you choose it from the select.
    $UI.modelPanel.__modelselector.addEventListener('change', function(e) {
      console.log($UI.modelPanel.__modelselector.value);
      runPredict($UI.modelPanel.__modelselector.value);
    }.bind($UI.modelPanel));

    // TO-DO
    $UI.modelPanel.__btn_save.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.png';

      download($UI.modelPanel.__fullsrc,fname);
    }.bind($UI.modelPanel));

    // TO-DO -Save class probabilities
    $UI.modelPanel.__btn_savecsv.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.csv';
      // buildAndDownloadCSV($UI.modelPanel.__contours,fname);
    }.bind($UI.modelPanel));
  });
  
}
  // ************************************************************************ //

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
 * This is basically onmouseup after drawing rectangle.
 * @param e
 */
function camicStopDraw(e) {

  const viewer = $CAMIC.viewer;
  const canvasDraw = viewer.canvasDrawInstance;

  let imgColl = canvasDraw.getImageFeatureCollection();
  if (imgColl.features.length > 0) {

    // Check size first
    let box = checkSize(imgColl, viewer.imagingHelper);

    if (Object.keys(box).length === 0 && box.constructor === Object) {
      console.error('SOMETHING WICKED THIS WAY COMES.');
    } else { 

      $UI.modelPanel.setPosition(box.rect.x,box.rect.y,box.rect.width,box.rect.height);
 

      const self = $UI.modelPanel;

      var fullResCvs = self.__fullsrc;
      // const prefix_url = ImgloaderMode == 'iip'?`${window.location.origin}/img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;
      const prefix_url = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;
      var img = new Image();   // Create new img element
      img.addEventListener('load', function() {

        fullResCvs.height = img.height;
        fullResCvs.width = img.width;
        fullResCvs.getContext('2d').drawImage(img, 0, 0);

        $UI.modelPanel.open();
        // close
        canvasDraw.clear();  
      }, false);
      img.src = prefix_url+'\/'+self.__spImgX+','+self.__spImgY+','+self.__spImgWidth+','+self.__spImgHeight+'\/'+self.__spImgWidth+',/0/default.jpg';     

    }

  } else {
    console.error('Could not get feature collection.')
  }

}

function checkSize(imgColl, imagingHelper) {

  // 5x2 array
  let bound = imgColl.features[0].bound;
// slide images svsslide images svs
  // get position on viewer

  const top_left = imgColl.features[0].bound[0];
  const bottom_right = imgColl.features[0].bound[2];
  const min = imagingHelper._viewer.viewport.imageToViewportCoordinates(top_left[0],top_left[1]);
  const max = imagingHelper._viewer.viewport.imageToViewportCoordinates(bottom_right[0],bottom_right[1]);
  const rect = new OpenSeadragon.Rect(min.x,min.y,max.x-min.x,max.y-min.y);
  const self = $UI.modelPanel;
  
  self.__top_left = top_left;
  self.__spImgX = top_left[0];
  self.__spImgY = top_left[1];
  self.__spImgWidth = bottom_right[0]-top_left[0];
  self.__spImgHeight = bottom_right[1]-top_left[1];
  console.log('iX: '+self.__spImgX);
  console.log('iY: '+self.__spImgY);
  console.log('iW: '+self.__spImgWidth);
  console.log('iH: '+self.__spImgHeight);
  
  console.log(top_left);
  console.log(bottom_right);
  // console.log(imagingHelper._viewer.viewport.viewportToImageCoordinates(0,0));

  // Convert to screen coordinates
  let foo = convertCoordinates(imagingHelper, bound);

  //retina screen
  let newArray = foo.map(function (a) {
    let x = a.slice();
    x[0] *= PDR;
    x[1] *= PDR;
    return x;
  });
  console.log('bounds', newArray);

  const xCoord = Math.round(newArray[0][0]);
  const yCoord = Math.round(newArray[0][1]);
  let width = Math.round(newArray[2][0] - xCoord);
  let height = Math.round(newArray[2][1] - yCoord);

  self.__x = xCoord;
  self.__y = yCoord;
  self.__width = xCoord;
  self.__height = yCoord;

  // check that image size is ok
  if (width * height > 8000000) {
    alert("Selected ROI too large, current version is limited to 4 megapixels");
    // Clear the rectangle  canvas-draw-overlay.clear()
    $CAMIC.viewer.canvasDrawInstance.clear();
    return {}; //throw('image too large')
  } else {
    return {rect:rect,'xCoord': xCoord, 'yCoord': yCoord, 'width': width, 'height': height};
  }
}

/**
 * Make a canvas element & draw the ROI.
 * @param imgData
 * @param canvasId
 * @param hidden
 */
function loadImageToCanvas(imgData, canvas) {
  // console.log(typeof(imgData));
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  let context = canvas.getContext("2d");
  context.putImageData(imgData, 0, 0);

}

/**
 * Run model
 * @param key
 */
function runPredict(key) {

  // But first, some setup...
  const self = $UI.modelPanel;

  self.showProgress("Predicting...");

  let fullResCvs = self.__fullsrc;

  var imgData = fullResCvs.getContext('2d').getImageData(0,0,fullResCvs.width,fullResCvs.height);

  // Starting the transaction and opening the model store
  let tx = db.transaction("models_store", "readonly");
  let store = tx.objectStore("models_store");

  store.get(key).onsuccess = async function (e) {
    let classes = e.target.result.classes;

    let input_shape = e.target.result.input_shape
    let image_size = input_shape[1];

    model = await tf.loadLayersModel(IDB_URL + key);

    // Warmup the model before using real data.
    const warmupResult = model.predict(tf.zeros([1, image_size, image_size, 3]));
    warmupResult.dataSync();
    warmupResult.dispose();
    console.log("Model ready");

    // TODO: Allow the users to decide below params.
    const logits = tf.tidy(() => {
    // tf.browser.fromPixels() returns a Tensor from an image element.
      const img = tf.browser.fromPixels(imgData).toFloat();
      const img2 = tf.image.resizeBilinear(img, [image_size, image_size])

      const offset = tf.scalar(127.5);
      // Normalize the image from [0, 255] to [-1, 1].
      const normalized = img2.sub(offset).div(offset);
      // Reshape to a single-element batch so we can pass it to predict.
      const batched = normalized.reshape(input_shape);

      // Make a prediction through mobilenet.
      return model.predict(batched);
    });

    // Retrieving the top class
    const predictions = await getTopKClasses(logits, classes, 1);

    self.hideProgress();

    // Show the classes in the DOM.
    self.showResults(predictions[0].className + " - " + predictions[0].probability);
    
  };
}

/**
 * Computes the probabilities of the topK classes given logits by computing
 * softmax to get probabilities and then sorting the probabilities.
 * @param logits Tensor representing the logits from MobileNet.
 * @param topK The number of top predictions to show.
 */
async function getTopKClasses(logits, classes, topK) {
    const values = await logits.data();
    console.log(values);

    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
        className: classes[parseInt(topkIndices[i])],
        probability: topkValues[i]
    })
    }
    console.log(topkIndices[0]);
    return topClassesAndProbs;
}


function uploadModel() {

  var _name = document.querySelector('#name'),
      _classes = document.querySelector('#classes'),
      _image_size = document.querySelector("#image_size"),
      topology = document.querySelector('#modelupload'),
      weights = document.querySelector('#weightsupload'),
      status = document.querySelector('#status'),
      submit = document.querySelector("#submit");

  // Reset previous input
  _name.value = _classes.value = topology.value = weights.value = status.innerHTML = _image_size.value = '';

  $UI.uploadModal.open();

  submit.addEventListener('click', async function (e) {
    e.preventDefault();
    
    if (_name.value && _classes.value && _image_size.value) {

      status.innerHTML = "Uploading";
      status.classList.remove('error');
      status.classList.add('blink');

      // Adding some extra digits in the end to maintain uniqueness
      let name = _name.value + (new Date().getTime().toString()).slice(-4, -1);
      // Create an array from comma separated values of classes
      let classes = _classes.value.split(/\s*,\s*/);
      
      try {

        // This also ensures that valid model is uploaded.
        const model = await tf.loadLayersModel(tf.io.browserFiles(
          [topology.files[0],
          ...weights.files
          ]))
        await model.save(IDB_URL + name);

        // Update the model store db entry to have the classes array
        tx = db.transaction("models_store", "readwrite");
        store = tx.objectStore("models_store");

        store.get(name).onsuccess = function (e) {
          let data = e.target.result;
          data['classes'] = classes;
          data['input_shape'] = [1, parseInt(_image_size.value), parseInt(_image_size.value), 3]

          let req = store.put(data);
          req.onsuccess = function (e) {
            console.log("SUCCESS, ID:", e.target.result);
            status.innerHTML = "Done!";
            status.classList.remove('blink');
          }
          req.onerror = function (e) {
            status.innerHTML = "Some error this way!";
            console.log(e);
            status.classList.remove('blink');
          }
        }
        
      } catch (e) {
        // It throws syntax error when json not found. Add validation.
        if (e instanceof SyntaxError) {
          status.classList.add('error');
          status.classList.remove('blink');
          status.innerHTML = "Please upload the model.json in first input.";
        } else {
          status.classList.add('error');
          status.classList.remove('blink');
          status.innerHTML = "Please enter a valid model. Input model.json in first input and weight binaries in second one.";
          console.error(e);
        }
      } 

    } else {
      status.innerHTML = "Please fill out all the fields."
      status.classList.add('error');
    }
    
  });  
}

// Shows the uploaded models' details
async function showInfo() {
  
  var data = await tf.io.listModels(),
      table = document.querySelector('#mdata'),
      tx = db.transaction("models_store", "readonly"),
      store = tx.objectStore("models_store");

  empty(table);
  // Update table data
  (function (callback) {
    for (let key in data) {
      let name = key.split("/").pop(),
          date = data[key].dateSaved.toString().slice(0,15),
          size = (data[key].modelTopologyBytes + data[key].weightDataBytes + data[key].weightSpecsBytes) / (1024*1024),
          row = table.insertRow(),
          classes, input_shape, td;
      store.get(name).onsuccess = function (e) {
        classes = (e.target.result.classes.join(', '));
        input_shape = e.target.result.input_shape.slice(1, 3).join("x");
        td = row.insertCell();
        td.innerHTML = name.slice(0, -3);
        td = row.insertCell();
        td.innerHTML = classes;
        td = row.insertCell();
        td.innerHTML = input_shape;
        td = row.insertCell();
        td.innerHTML = +size.toFixed(2);
        td = row.insertCell();
        td.innerHTML = date;
      }
    }
    callback;
  })($UI.infoModal.open())


}

/**
 * Convert a dataURI to a Blob
 *
 * @param dataURI
 * @returns {Blob}
 */
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
}

/**
 * Convert image coordinates
 */
function convertCoordinates(imagingHelper, bound) {

  let newArray = bound.map(function (arr) {
    return arr.slice(); // copy
  });

  // 'image coordinate' to 'screen coordinate'
  for (let i = 0; i < newArray.length; i++) {
    let boundElement = newArray[i];
    for (let j = 0; j < boundElement.length; j++) {
      newArray[i][j] = j === 0 ? imagingHelper.dataToPhysicalX(boundElement[j])
        : imagingHelper.dataToPhysicalY(boundElement[j]);
    }
  }

  return newArray;

}

// Save the canvas to filename.  Uses local save dialog.
function download(canvas, filename) {

  /// create an "off-screen" anchor tag
  var lnk = document.createElement('a'),
      e;

  /// the key here is to set the download attribute of the a tag
  lnk.download = filename;

  /// convert canvas content to data-uri for link. When download
  /// attribute is set the content pointed to by link will be
  /// pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL();

  /// create a "fake" click-event to trigger the download
  if (document.createEvent) {

      e = document.createEvent("MouseEvents");
      e.initMouseEvent("click", true, true, window,
                       0, 0, 0, 0, 0, false, false, false,
                       false, 0, null);

      lnk.dispatchEvent(e);

  } else if (lnk.fireEvent) {

      lnk.fireEvent("onclick");
  }
}

// Build a csv of the polygons and associated metadata
// function buildAndDownloadCSV(contours,fname) {
//   let data = '';
//   let tmp = new cv.Mat();
//   const self = $UI.modelPanel;
//   const nl = '\n';
//   const vpx = self.__top_left[0];
//   const vpy = self.__top_left[1];
//   const spx = self.__x;
//   const spy = self.__y;

//   console.log('In Download and Save CSV');
//   data += 'AreaInPixels,PereimeterInPixels,Polygon\n';

//   for (let i = 1; i < contours.size(); ++i) {
//     let cnt = contours.get(i);
//     // console.log(contours[i]);
//     let area = cv.contourArea(cnt,false);
//     let perimeter = cv.arcLength(cnt,true);
//     if(area < self.__maxarea.value && area > self.__minarea.value) {
//       data += area + ',' + perimeter + ',[';
//       cv.approxPolyDP(cnt, tmp, 1, true);
//       let carray = tmp.data32S;
//       let asize = tmp.data32S.length;
//       for(j = 0;j < asize-1;j+=2) {
//         let imgX = carray[j]+vpx+spx;
//         let imgY = carray[j+1]+vpy+spy;
//         if(j<(asize-2)) {
//           data += imgX + ':' + imgY + ':';
//         } else {
//           data += imgX + ':' + imgY + ']';
//         }
//       }
//       data += nl;
//     }
//   }
//   downloadCSV(data, fname);
// }

// Save the polygons to csv with filename.  Uses local save dialog.
function downloadCSV(data,filename) {
  let csv = data;
  const self = $UI.modelPanel;
  // console.log(data);

  if (csv == null) return;

  filename = filename || 'export.csv';

  if (csv.search(/^data:text\/csv/i) == -1) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  link.click();
}

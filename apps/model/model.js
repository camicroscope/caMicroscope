let PDR = OpenSeadragon.pixelDensityRatio;
const IDB_URL = "indexeddb://";


////////////////////////////

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

  // Create modalbox for model uploads
  $UI.modalbox = new ModalBox({
    id:'upload_panel',
    hasHeader:true,
    headerText:'Upload Model',
    hasFooter:false,
    provideContent: true,
    content: `
      <form>
        <label align="left"> Name:  </label> <input name="name" id="name" type="text" required /> <br> <hr>
        <div> Enter the classes model classifies into separated by comma. </div>
        <label align="left"> Classes: </label> <input name="classes" id="classes" type="text" required /> <br><hr>
        <label align="left"> Image size: </label> <input name="img_size" id="img_size" type="number" required /> <br><hr>
        <div>Select model.json first followed by the weight binaries.</div> <br> 
        <input name="filesupload" id="filesupload" type="file" multiple="" required/>
        <div id="listfiles" style="max-height:80px; overflow:scroll;"></div>
        <button type="button", id="submit">Upload</button>
      </form>  
    `
  });

  // create the message queue
  $UI.message = new MessageQueue();
  $UI.toolbar = new CaToolbar({
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    subTools: [
      // rectangle draw
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

  // let button = document.createElement('button');
  // button.id = 'trigger';
  // button.style.display = "none";
  // document.body.appendChild(button);

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

    $UI.modelPanel = new ModelPanel(viewer);

    // ************************************************************************ //
    // HERE YOU GOTTA ADD THE MODEL SELECTION PART

    $UI.modelPanel.__modelselector.addEventListener('change', function(e) {
      console.log($UI.modelPanel.__modelselector.value);
      runPredict($UI.modelPanel.__modelselector.value);
    }.bind($UI.modelPanel));

    $UI.modelPanel.__btn_save.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.png';
      download($UI.modelPanel.__c2s,fname);
    }.bind($UI.modelPanel));

    $UI.modelPanel.__btn_savecsv.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.csv';
      buildAndDownloadCSV($UI.modelPanel.__contours,fname);
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
      // call tfjs
      // let keys = Object.keys(await tf.io.listModels())
      $UI.modelPanel.open();
      // if ($UI.modelPanel.__modelselector.value) predict(box);

      // close
      canvasDraw.clear();
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

// *****************************************
//This has to be the model

/**
 * Segment! :)
 * @param box
 */
function runPredict(key) {

  // But first, some setup...
  const self = $UI.modelPanel;

  // SEGMENTATION CANVAS
  self.showProgress("Predicting...");

  let fullResCvs = self.__fullsrc;
  // const prefix_url = ImgloaderMode == 'iip'?`${window.location.origin}/img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;
  const prefix_url = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;

  self.__img.src = prefix_url+'\/'+self.__spImgX+','+self.__spImgY+','+self.__spImgWidth+','+self.__spImgHeight+'\/'+self.__spImgWidth+',/0/default.jpg';
  self.__img.onload = async function() {
    let image = cv.imread(self.__img);
    cv.imshow(fullResCvs, image);
    image.delete();
    let imgData = fullResCvs.getContext('2d').getImageData(0,0,fullResCvs.width,fullResCvs.height);


    let tx = db.transaction("model_info_store", "readonly");
    let store = tx.objectStore("model_info_store");
    // loadImageToCanvas(imgData, $UI.modelPanel.__out);
    loadImageToCanvas(imgData, self.__src);

    // let classes, model;


    store.get(key).onsuccess = async function (e) {
      var classes = e.target.result.classes;
      var image_size = e.target.result.image_size;
      model = await tf.loadLayersModel(IDB_URL + key);

      // TODO: Allow the users to decide below params.
      const logits = tf.tidy(() => {
        console.log('start itt');
      // tf.browser.fromPixels() returns a Tensor from an image element.
        const img = tf.browser.fromPixels(imgData).toFloat();
        const img2 = tf.image.resizeBilinear(img, [image_size, image_size])
        console.log('img resized')
        const offset = tf.scalar(127.5);
        // Normalize the image from [0, 255] to [-1, 1].
        const normalized = img2.sub(offset).div(offset);
        console.log('image ready')
        // Reshape to a single-element batch so we can pass it to predict.
        const batched = normalized.reshape([image_size, image_size, 3]);
        batched.expandDims().print(true);

        // Make a prediction through mobilenet.
        console.log('off to predictions');
        return model.predict(batched.expandDims());
      });

      const predictions = await getTopKClasses(logits, classes, 1);
      console.log(predictions);

      self.hideProgress();

      // Show the classes in the DOM.
      self.showResults(predictions[0].className + " - " + predictions[0].probability);
    }
    
    // Decide MODEL_PATH with model_val, hardcoded for now
    // const image_size = 96;

    
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
        className: classes[topkIndices[i]],
        probability: topkValues[i]
    })
    }
    return topClassesAndProbs;
}


function uploadModel() {
  // open one pop up for upload part
  $UI.modalbox.open();

  var input = document.querySelector('#filesupload');
  var list = document.querySelector('#listfiles');
  input.addEventListener('change', function (e) {
    for (var x = 0; x < input.files.length; x++) {
      //add to list     
      var li = document.createElement('li');
      if (x == 0) {
        li.innerHTML = 'Model topology (.json)' + ':  ' + input.files[x].name;
        list.append(li);
      } else{
        li.innerHTML = 'Weight File ' + (x) + ':  ' + input.files[x].name;
        list.append(li);
      }
    }
  });

  var submit = document.querySelector("#submit");
  submit.addEventListener('click', async function (e) {
    // e.preventDefault();
    var name = document.querySelector('#name').value + Math.floor(new Date().getTime()/100000000);
    console.log(name);
    var classes = document.querySelector('#classes').value.split(/\s*,\s*/);
    var image_size = document.querySelector("#img_size").value
    // var addr;

    
    const model = await tf.loadLayersModel(tf.io.browserFiles(
      [...input.files
      ]))
    await model.save(IDB_URL + name);
    console.log('Model saved to IndexedDB ');

    tx = db.transaction("model_info_store", "readwrite");
    store = tx.objectStore("model_info_store");
    store.put({
      modelPath: name,
      classes: classes,
      image_size: image_size
    }).onsuccess = function (e) {
      console.log("SUCCESS, ID:", e.target.result);
    }

    
    
    
  });

  $UI.modalbox.__close.addEventListener('click', function (e) {
    input.value = '';
    empty(list);
  });
  
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
function buildAndDownloadCSV(contours,fname) {
  let data = '';
  let tmp = new cv.Mat();
  const self = $UI.modelPanel;
  const nl = '\n';
  const vpx = self.__top_left[0];
  const vpy = self.__top_left[1];
  const spx = self.__x;
  const spy = self.__y;

  console.log('In Download and Save CSV');
  data += 'AreaInPixels,PereimeterInPixels,Polygon\n';

  for (let i = 1; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    // console.log(contours[i]);
    let area = cv.contourArea(cnt,false);
    let perimeter = cv.arcLength(cnt,true);
    if(area < self.__maxarea.value && area > self.__minarea.value) {
      data += area + ',' + perimeter + ',[';
      cv.approxPolyDP(cnt, tmp, 1, true);
      let carray = tmp.data32S;
      let asize = tmp.data32S.length;
      for(j = 0;j < asize-1;j+=2) {
        let imgX = carray[j]+vpx+spx;
        let imgY = carray[j+1]+vpy+spy;
        if(j<(asize-2)) {
          data += imgX + ':' + imgY + ':';
        } else {
          data += imgX + ':' + imgY + ']';
        }
      }
      data += nl;
    }
  }
  downloadCSV(data, fname);
}

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

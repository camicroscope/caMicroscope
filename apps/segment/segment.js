let PDR = OpenSeadragon.pixelDensityRatio;
const IDB_URL = "indexeddb://";

// INITIALIZE DB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// id(autoinc), name, location(name+id), classes
var request, db;

// tensorflowjs creates its own IndexedDB on saving a model.
async function dbInit() {
  const model = tf.sequential();
  await model.save('indexeddb://dummy');
  await tf.io.removeModel('indexeddb://dummy');
  console.log('DB initialised');
}

// Opening the db created by tensorflowjs
function dbOpen() {
  request = window.indexedDB.open("tensorflowjs", 1);

  request.onupgradeneeded = function (e) {
    console.log('nasty!');
  }
  request.onerror = function (e){
    console.log("ERROR", e);
  }
  request.onsuccess = function(e) {
    db = request.result;
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
const objAreaMin = 60;
const objAreaMax = 4500;
const lineWidth = 2;
const timeOutMs = 10;


function initialize() {
  var checkPackageIsReady = setInterval(async function () {
    if(IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      await dbInit().then(e => dbOpen());
      initUIcomponents();
      initCore();
    }
  }, 100);
}

async function initUIcomponents() {
  /* create UI components */

  // Create uploadModal for model uploads.
  $UI.uploadModal = new ModalBox({
    id:'upload_panel',
    hasHeader:true,
    headerText:'Upload Model',
    hasFooter:false,
    provideContent: true,
    content: `
      <form class="form-style" action="#">
        <ul>
          <li>
            <label align="left"> Name:  </label> 
            <input name="name" id="name" type="text" required />
            <span> Name of the model </span>
          </li>
          <li>
            <label align="left"> Input patch size: </label> 
            <input name="image_size" id="image_size" type="number" required />
            <span> The image size on which the model is trained </span>
          </li>
            <label>Input image format:</label> <br>            
            <input type="radio" id="gray" name="channels" value=1 checked>
            <label for="gray">Gray</label> <br>
            <input type="radio" id="rgb" name="channels" value=3>
            <label for="rgb" padding="10px">RGB</label> 
          <li id="mg">
            <label for="magnification">Magnification:</label>
            <select id="magnification">
              <option value=10>10x</option>
              <option value=20>20x</option>
              <option value=40>40x</option>
            </select>
            <span> Magnification of input images </span>
          </li>
          <hr>

          <label class="switch"><input type="checkbox" id="togBtn"><div class="slider"></div></label> <br> <br>
          <div class="checkfalse"><div>Select model.json first followed by the weight binaries.</div> <br> 
          <input name="filesupload" id="modelupload" type="file" required/>
          <input name="filesupload" id="weightsupload" type="file" multiple="" required/> <br> <br> </div>
          <div class="checktrue" > URL to the ModelAndWeightsConfig JSON describing the model. <br> <br> 
          <label align-"left"> Enter the URL: </label> <input type="url" name="url" id="url" required> <br><br></div>
          <button id="submit">Upload</button> <span id="status"></span>
        </ul>

      </form>  
      <button id="refresh" class='material-icons'>cached</button> 

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
            <th>Input Size</th>
            <th>Size (MB)</th>
            <th>Date Saved</th>
            <th>Remove Model</th>
          </tr>
          <tbody id="mdata">
          </tbody>
        </thead>
      </table>
    `
  });
  // create the message queue
  $UI.message = new MessageQueue();

  let dropDownList = [
    {
      icon: "timeline",
      title: "Watershed",
      value: "watershed",
      checked: true
    }];

  Object.keys(await tf.io.listModels()).forEach(function (element) {
    let dict = {};    
    let value = element.split("/").pop();
    if (value.slice(0, 3) == 'seg') {
      let title = element.split("/").pop().split("_")[1].slice(0, -3);
      dict.icon = "flip_to_back";
      dict.title = title;
      dict.value = value;
      dict.checked = false;
      dropDownList.push(dict);
    }
  });

  let filterList = [
    {
      icon: "filter_1",
      title: "Normalization",
      value: "norm",
      checked: true
    },{
      icon: "filter_2",
      title: "Centering",
      value: 'center',
      checked: false
    },{
      icon: "filter_3",
      title: "Standardization",
      value: 'std',
      checked: false
    }
  ];

  
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
        title: 'Segment',
        callback: drawRectangle
      },{
        icon: 'keyboard_arrow_down',
        type: 'dropdown',
        dropdownList: dropDownList,
        title: 'Select Model',
        callback: setValue
      },{
        icon: 'photo_filter',
        type: 'dropdown',
        dropdownList: filterList,
        title: 'Pixel Scaling',
        callback: setFilter
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
      }, {
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

    viewer.addHandler('zoom', (e) => {
      let mask = $UI.segmentPanel.__mask;
      fitCvs(mask);
    });

    $UI.segmentPanel = new SegmentPanel(viewer);

    //add event for threshold
    $UI.segmentPanel.__threshold.addEventListener('input', function(e){
      const alpha = +this.__threshold.value;
      this.__tlabel.innerHTML = alpha;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__threshold.addEventListener('change', function(e){
      if (!$UI.args || $UI.args.status == 'watershed'){
        let src = this.__src;
        let out = this.__out;
        const self = this;
        const alpha = +this.__threshold.value;
        self.__tlabel.innerHTML = alpha;
        self.showProgress();
        setTimeout(function() {
          watershed(src,out,null,alpha);
          self.hideProgress();
        },timeOutMs);
      }
    }.bind($UI.segmentPanel));

    //add event for min
    $UI.segmentPanel.__minarea.addEventListener('input', function (e) {
      this.__minlabel.innerHTML = +this.__minarea.value;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__minarea.addEventListener('change', function (e) {
      if (!$UI.args || $UI.args.status == 'watershed') {
        let src = this.__src;
        let out = this.__out;
        const self = this;
        const alpha = +this.__threshold.value;
        this.__minlabel.innerHTML = +this.__minarea.value;
        self.showProgress();
        setTimeout(function() {
          watershed(src,out,null,alpha);
          self.hideProgress();
        },timeOutMs);
      }
    }.bind($UI.segmentPanel));

    //add event for max
    $UI.segmentPanel.__maxarea.addEventListener('input', function (e) {
      this.__maxlabel.innerHTML = +this.__maxarea.value;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__maxarea.addEventListener('change', function (e) {
      if (!$UI.args || $UI.args.status == 'watershed') {
        let src = this.__src;
        let out = this.__out;
        let self = this;
        let alpha = +this.__threshold.value;
        this.__maxlabel.innerHTML = +this.__maxarea.value;
        self.showProgress();
        setTimeout(function() {
          watershed(src,out,null,alpha);
          self.hideProgress();
        },timeOutMs);
      }
    }.bind($UI.segmentPanel));

    //add event for opacity
    $UI.segmentPanel.__opacity.addEventListener('input', function(e){
      let out = this.__out;
      const alpha = +this.__opacity.value;
      out.style.opacity = alpha;
      this.__oplabel.innerHTML = alpha;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__opacity.addEventListener('change', function(e){
      let out = this.__out;
      let mask =  this.__mask;
      const alpha = +this.__opacity.value;
      this.__oplabel.innerHTML = alpha;
      out.style.opacity = alpha;
      mask.style.opacity = alpha;
      
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__btn_save.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.png';
      if (!$UI.args || $UI.args.status == 'watershed') download($UI.segmentPanel.__c2s,fname);
      else download($UI.segmentPanel.__mask,fname);
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__btn_savecsv.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.csv';
      buildAndDownloadCSV($UI.segmentPanel.__contours,fname);
    }.bind($UI.segmentPanel));
  });
}

function setValue(args) {
  $UI.args = args;
}

function setFilter(filter) {
  $UI.filter = filter;
}
/**
 * Toolbar button callback
 * @param e
 */
function drawRectangle(e) {

  let canvas = $CAMIC.viewer.drawer.canvas; //Original Canvas
  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  let args = $UI.args;
  if (!args || args.status == 'watershed') {
    canvasDraw.drawMode = 'rect';
  } else {
    canvasDraw.drawMode = 'stepSquare';
    // Save size in an arg list
    let size = args.status.split('_')[0].split('-')[1]
    canvasDraw.size = size;
    // change naming convention to hold image size
  }
  
  canvasDraw.style.color = '#FFFF00';
  canvasDraw.style.isFill = false;

  if (e.checked) {
    // Warn about zoom level
    let current_zoom = Math.round($CAMIC.viewer.imagingHelper._zoomFactor * 40);
    required_zoom = $UI.args && $UI.args.status!="watershed"? parseInt($UI.args.status.split('_')[0].split('-')[2]):current_zoom;
    if (current_zoom != required_zoom) {
      alert(`You are testing the model for a different zoom level (recommended: ${required_zoom}). Performance might be affected.`);
    }
    document.querySelector(".drop_down").classList.add('disabled');
    canvasDraw.drawOn();
  } else {
    canvasDraw.drawOff();
    document.querySelector(".drop_down").classList.remove('disabled');
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
      let args = $UI.args;
      if (!args || args.status == 'watershed') {
        segmentROI(box);
      } else {
        segmentModel(args.status);
      }
      var memory = tf.memory();
      console.log(memory);
      $UI.segmentPanel.setPosition(box.rect.x,box.rect.y,box.rect.width,box.rect.height);
      $UI.segmentPanel.open(args);

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

  // get position on viewer

  let top_left = imgColl.features[0].bound[0];
  let bottom_right = imgColl.features[0].bound[2];
  let min = imagingHelper._viewer.viewport.imageToViewportCoordinates(top_left[0],top_left[1]);
  let max = imagingHelper._viewer.viewport.imageToViewportCoordinates(bottom_right[0],bottom_right[1]);
  let rect = new OpenSeadragon.Rect(min.x,min.y,max.x-min.x,max.y-min.y);
  let self = $UI.segmentPanel;
  
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
    alert("Selected ROI Too Large, Current Version Is Limited To 4 Megapixels");
    // Clear the rectangle  canvas-draw-overlay.clear()
    $CAMIC.viewer.canvasDrawInstance.clear();
    return {}; //throw('image too large')
  } else {
    return {rect:rect,'xCoord': xCoord, 'yCoord': yCoord, 'width': width, 'height': height};
  }
}

/**
 * Upload tensorflowjs layers model converted from Keras. Considering channels-last - tensorflow backend models.
 * @return {none}
 */
function uploadModel() {

  var _name = document.querySelector('#name'),
      _image_size = document.querySelector("#image_size"),
      mag = document.querySelector('#magnification'),
      topology = document.querySelector('#modelupload'),
      weights = document.querySelector('#weightsupload'),
      status = document.querySelector('#status'),
      toggle = document.querySelector('#togBtn'),
      url = document.querySelector("#url"),
      refresh = document.querySelector("#refresh"),
      submit = document.querySelector("#submit");

  // Reset previous input
  _name.value = topology.value = weights.value = status.innerHTML = _image_size.value = url.value = '';

  $UI.uploadModal.open();

  toggle.addEventListener('change', function (e) {
    if (this.checked) {
      document.querySelector(".checktrue").style.display = "block";
      document.querySelector(".checkfalse").style.display = "none";
    } else {
      document.querySelector(".checktrue").style.display = "none";
      document.querySelector(".checkfalse").style.display = "block";
    }

  });

  refresh.addEventListener('click', () => {
    initUIcomponents();
  });

  submit.addEventListener('click', async function (e) {
    e.preventDefault();
    
    if ( _name.value && _image_size.value && 
      ((!toggle.checked && topology.files[0].name.split('.').pop() == 'json') || (toggle.checked && url))) {

      status.innerHTML = "Uploading";
      status.classList.remove('error');
      status.classList.add('blink');

      if (toggle.checked) { var modelInput = url.value; }
      else { var modelInput = tf.io.browserFiles([topology.files[0], ...weights.files]) }
      
      try {

        // This also ensures that valid model is uploaded.
        // Adding some extra digits in the end to maintain uniqueness
        let _channels = parseInt(document.querySelector('input[name="channels"]:checked').value);
        const size = parseInt(_image_size.value);
        let name = 'seg-' + size.toString() + '-' + mag.value.toString() + '_' +  _name.value + (new Date().getTime().toString()).slice(-4, -1);
        const model = await tf.loadLayersModel(modelInput);
        const result = model.predict(tf.ones([1, size, size, _channels]))
        const shape = result.shape;
        result.dispose();
        if (shape[1] != size || shape[2] != size) {
          console("Shape:", shape[1], shape[2])
          throw "The application only supports 1:1 image Masks. Import a valid model."
        }

        await model.save(IDB_URL + name);

        // Update the model store db entry to have the classes array
        tx = db.transaction("models_store", "readwrite");
        store = tx.objectStore("models_store");

        store.get(name).onsuccess = function (e) {
          let data = e.target.result;
          data['input_shape'] = [1, size, size, _channels]

          let req = store.put(data);
          req.onsuccess = function (e) {
            console.log("SUCCESS, ID:", e.target.result);
            status.innerHTML = "Done! Click refresh below.";
            status.classList.remove('blink');
          }
          req.onerror = function (e) {
            status.innerHTML = "Some error this way!";
            console.log(e);
            status.classList.remove('blink');
          }
        }
        
      } catch (e) {
        status.classList.add('error');
        status.classList.remove('blink');
        if (toggle.checked) status.innerHTML = "Please enter a valid URL."
        else status.innerHTML = "Please enter a valid model. Input model.json in first input and all weight binaries in second one without renaming.";
        console.error(e);
      } 

    } else {
      status.innerHTML = "Please fill out all the fields with valid values."
      status.classList.add('error');
      console.error(e);
    }
    
  });  
}


/**
 * Make a canvas element & draw the ROI.
 * @param imgData
 * @param canvasId
 * @param hidden
 */
function loadImageToCanvas(imgData, canvas) {
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  let context = canvas.getContext("2d");
  context.putImageData(imgData, 0, 0);

}

/**
 * Segment using the selected model.
 * @param  {String} key The primary key of model in indexedDB
 * @return {none}
 */
async function segmentModel(key) {
  let self = $UI.segmentPanel;
  let X = self.__spImgX,
      Y = self.__spImgY,
      totalSize = self.__spImgWidth,
      step = parseInt(key.split('_')[0].split('-')[1]);

  const prefix_url = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;


  // model loading
  let tx = db.transaction("models_store", "readonly");
  let store = tx.objectStore("models_store");

  let req = store.get(key);

  req.onsuccess = async function (e) {
    self.showProgress("Loading model...");

    // Keras sorts the labels by alphabetical order.
    let input_shape = e.target.result.input_shape
    let input_channels = parseInt(input_shape[3]);
    let image_size = parseInt(input_shape[1]);

    model = await tf.loadLayersModel(IDB_URL + key);
    console.log('Model Loaded');
     
    tf.tidy(()=>{
    // Warmup the model before using real data.
    const warmupResult = model.predict(tf.zeros([1, image_size, image_size, input_channels]));
    self.showProgress("Model loaded...");
    });

    let fullResCvs = self.__fullsrc;
    fullResCvs.height = step;
    fullResCvs.width = step;
    let finalRes = document.querySelector('#mask');
    finalRes.height = totalSize;
    finalRes.width = totalSize;
    finalRes.getContext('2d').clearRect(0, 0, totalSize, totalSize);
    let temp = document.querySelector('#dummy');
    temp.height = step;
    temp.width = step;

    function addImageProcess(src){
      return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    }
    self.showProgress("Processing...");


    for (let y = Y, dy = 0; y < (Y + totalSize); y+=(step)) {
      let dx = 0
      for (let x = X; x < (X + totalSize); x+=(step)) {
        let src = prefix_url+'\/'+x+','+y+','+step+','+step+'\/'+step+',/0/default.jpg';
        let l_img = await addImageProcess(src);
        fullResCvs.height = l_img.height;
        fullResCvs.width = l_img.width;
        fullResCvs.getContext('2d').drawImage(l_img, 0, 0);

        // dummy.getContext('2d').drawImage(img, dx, dy);
        let imgData = fullResCvs.getContext('2d').getImageData(0,0,fullResCvs.width,fullResCvs.height);
        let val;
        tf.tidy(()=>{
        const img = tf.browser.fromPixels(imgData).toFloat();
        let img2;
        if (input_channels == 1) {
          img2 = tf.image.resizeBilinear(img, [image_size, image_size]).mean(2);
        } else {
          img2 = tf.image.resizeBilinear(img, [image_size, image_size]);
        }
        let scaleMethod = $UI.filter? $UI.filter.status: 'norm';
        console.log(scaleMethod);

        let normalized;
        if (scaleMethod == 'norm') {
          // Pixel Normalization: scale pixel values to the range 0-1.

          let scale = tf.scalar(255);
          normalized = img2.div(scale);

        } else if (scaleMethod == 'center') {
          // Pixel Centering: scale pixel values to have a zero mean.

          let mean = img2.mean();
          normalized = img2.sub(mean);
          // normalized.mean().print(true); // Uncomment to check mean value.
          // let min = img2.min();
          // let max = img2.max();
          // let normalized = img2.sub(min).div(max.sub(min));
        } else {
          // Pixel Standardization: scale pixel values to have a zero mean and unit variance.
         
          let mean = img2.mean();
          let std = (img2.squaredDifference(mean).sum()).div(img2.flatten().shape).sqrt();
          normalized = img2.sub(mean).div(std);
        }      


        let batched = normalized.reshape([1, image_size, image_size, input_channels]);
        let values = model.predict(batched).dataSync();
        values = Array.from(values);
        //scale values
        values = values.map(x => x * 255)
        val = new Array();
        while (values.length > 0) val.push(values.splice(0, image_size));
        });
        await tf.browser.toPixels(val, temp);
        finalRes.getContext('2d').drawImage(temp, dx, dy);    
        
        dx += step;
      }
      dy += step;
    }


    self.hideProgress();
    fitCvs(finalRes);
    finalRes.style.opacity = 0.6;
    self.__opacity.value = 0.6;
    self.__oplabel.innerHTML = '0.6';

    model.dispose();
  } // on success

}



/**
 * Segment! :)
 * @param box
 */
function segmentROI(box) {

  // But first, some setup...
  let self = $UI.segmentPanel;
  // let div = document.createElement('div');
  // document.body.appendChild(div);

  // var mybr = document.createElement('br');

  // // TRACKBAR WEIGHT VALUE
  // let weightValue = document.createElement("label");
  // weightValue.id = 'weightValue';
  // div.appendChild(weightValue);
  // div.appendChild(mybr);

  // // TRACKBAR
  // let trackbar = document.createElement('input');
  // trackbar.setAttribute('type', 'range');
  // trackbar.id = 'trackbar';
  // trackbar.setAttribute('value', '.7');
  // trackbar.setAttribute('min', '0');
  // trackbar.setAttribute('max', '1');
  // trackbar.setAttribute('step', '.1');
  // div.appendChild(trackbar);
  // div.appendChild(mybr);

  // weightValue.innerText = trackbar.value;
  // weightValue.addEventListener('input', () => {
  //   weightValue.innerText = trackbar.value;
  // });

  // trackbar.addEventListener('input', () => {
  //   let alpha = trackbar.value / trackbar.max;
  //   watershed('canvasInput', 'canvasOutput', alpha);
  // });

  // // TRIGGER
  // let trigger = document.getElementById('trigger');
  // trigger.addEventListener("click", function () {
  //   watershed('canvasInput', 'canvasOutput', .07);
  // }, false);

  // SEGMENTATION CANVAS
  self.showProgress();
  console.log($UI.toolbar._sub_tools)
  console.log($UI.toolbar._sub_tools.value)

  let fullResCvs = self.__fullsrc;
  // const prefix_url = ImgloaderMode == 'iip'?`${window.location.origin}/img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;
  const prefix_url = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;

  self.__img.src = prefix_url+'\/'+self.__spImgX+','+self.__spImgY+','+self.__spImgWidth+','+self.__spImgHeight+'\/'+self.__spImgWidth+',/0/default.jpg';
  self.__img.onload = function() {
    let image = cv.imread(self.__img);
    cv.imshow(fullResCvs, image);
    image.delete();
    let imgData = fullResCvs.getContext('2d').getImageData(0,0,fullResCvs.width,fullResCvs.height);

    // loadImageToCanvas(imgData, $UI.segmentPanel.__out);
    loadImageToCanvas(imgData, self.__src);

    const alpha = +self.__threshold.value;
    self.__tlabel.innerHTML = alpha;
    watershed(self.__src, self.__out, null, alpha);
    self.hideProgress();
  };

  // let camicanv = $CAMIC.viewer.drawer.canvas; //Original Canvas
  // let imgData = (camicanv.getContext('2d')).getImageData(box.xCoord, box.yCoord, box.width, box.height);
  // console.log('X: ' + box.xCoord);
  // console.log('Y: ' + box.yCoord);
  
  // loadImageToCanvas(imgData, self.__out);
  // loadImageToCanvas(imgData, self.__src);

  // TRIGGER SEGMENTATION
  // const alpha = +self.__threshold.value;
  // self.__tlabel.innerHTML = alpha;
  // watershed(self.__src,self.__out,alpha);

  /*
  let dataURL = loadImageToCanvas(imgData, 'canvasInput', false);
  var img = document.createElement("img");
  img.src = dataURL;
  document.body.appendChild(img);
  */

  /*
  let blob = dataURItoBlob(dataURL);
  let filename = 'testing';
  let f = new File([blob], filename, {type: blob.type});
  console.log(f);
  */

}

/**
 * WATERSHED SEGMENTATION
 *
 * @param inn
 * @param out
 * @param thresh
 */
function watershed(inn, out, save=null, thresh) {


  // Read image
  const self = $UI.segmentPanel;
  let src = cv.imread(inn);
  let i2s = cv.imread(inn);
  let dc = null;
  if (save) dc = cv.imread(save);
  let height = src.rows;
  let width = src.cols;
  // Matrices
  let dst = new cv.Mat();
  let gray = new cv.Mat();
  let hemo = new Uint8ClampedArray(height*width*4);
  let opening = new cv.Mat();
  let imageBg = new cv.Mat();
  let imageFg = new cv.Mat();
  let distTrans = new cv.Mat();
  let unknown = new cv.Mat();
  let markers = new cv.Mat();
  self.__hemo.width = width;
  self.__hemo.height = height;

  // console.log([src.rows,src.cols]);
  // console.log([width,height]);
  // console.log('Src: ',src);
  // console.log('hemo: ',hemo);

  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);

  hemo = colorDeconvolution(src,true);
  let hctx = self.__hemo.getContext('2d');
  hctx.clearRect(0, 0, self.__hemo.width, self.__hemo.height);
  let imageData = new ImageData(hemo,width,height);

  // Draw image data to the canvas
  hctx.putImageData(imageData, 0, 0);

  if (!save) src = cv.imread(self.__hemo);
  else console.log('check in');

  cv.cvtColor(i2s, i2s, cv.COLOR_RGBA2RGB, 0);
  // if (save) cv.cvtColor(dc, dc, cv.COLOR_RGBA2RGB, 0);
  // console.log(src);
  // console.log(i2s);

  // Store canvas to save combined image
  // $UI.segmentPanel.__c2s = cv.imread(inn);

  // Gray and threshold image
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // console.log(gray);

  // Find an approximate estimate of the objects
  cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

  // Get background
  let M = cv.Mat.ones(3, 3, cv.CV_8U);

  // Remove the stuff that's not an object
  cv.erode(gray, gray, M);

  // Find the stuff that IS an object
  cv.dilate(gray, opening, M); //remove any small white noises in the image
  cv.dilate(opening, imageBg, M, new cv.Point(-1, -1), 3); //remove any small holes in the object

  // Distance transform - for the stuff we're not sure about
  cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
  cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);

  // Get foreground - make the objects stand out
  // cv.threshold (src, dst, thresh, maxval, type)
  cv.threshold(distTrans, imageFg, thresh, 1, cv.THRESH_BINARY_INV);

  // Mark (label) the regions starting with 1 (color output)
  imageFg.convertTo(imageFg, cv.CV_8U, 1, 0);
  cv.subtract(imageBg, imageFg, unknown);

  // Get connected components markers
  let x = cv.connectedComponents(imageFg, markers);

  // Get Polygons
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  let color = new cv.Scalar(255, 255, 0);
  cv.findContours(imageFg,contours,hierarchy,cv.RETR_CCOMP,cv.CHAIN_APPROX_SIMPLE);
  $UI.segmentPanel.__contours = contours;
  console.log("Getting contours.");

  for (let i = 0; i < markers.rows; i++) {
    for (let j = 0; j < markers.cols; j++) {
      markers.intPtr(i, j)[0] = markers.ucharPtr(i, j)[0] + 1;
      if (unknown.ucharPtr(i, j)[0] === 255) {
        markers.intPtr(i, j)[0] = 0;
      }
    }
  }
  cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB, 0);
  cv.watershed(dst, markers);
  const cloneSrc = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
  const listContours = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
  console.log(cv.COLOR_RGBA2RGB);
  // Draw barriers
  //console.log(markers.rows,markers.cols);
  // for (let i = 0; i < markers.rows; i++) {
  //   for (let j = 0; j < markers.cols; j++) {
  //     if (markers.intPtr(i, j)[0] === -1) {
  //       dst.ucharPtr(i, j)[0] = 255; // R
  //       dst.ucharPtr(i, j)[1] = 255; // G
  //       dst.ucharPtr(i, j)[2] = 0; // B
  //       cloneSrc.ucharPtr(i, j)[0] = 255; // R
  //       cloneSrc.ucharPtr(i, j)[1] = 255; // G
  //       cloneSrc.ucharPtr(i, j)[2] = 0; // B

  //       //console.log(dst.ucharPtr(i, j));
  //     }else{
  //       cloneSrc.ucharPtr(i, j)[3] = 0;
  //     }
  //   }
  // }

  let segcount = 0;
  let tmp = new cv.Mat();

  console.log("Drawing Contours");
  // console.log($UI.segmentPanel.__minarea.value);
  // console.log($UI.segmentPanel.__maxarea.value);
  for (let i = 1; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    // console.log(contours[i]);
    let area = cv.contourArea(cnt,false);
    if(area < $UI.segmentPanel.__maxarea.value && area > $UI.segmentPanel.__minarea.value) {
      // console.log(cnt);
      ++segcount;
      cv.approxPolyDP(cnt, tmp, 1, true);
      // console.log(tmp.data32S);
      cv.drawContours(cloneSrc, contours, i, color, lineWidth, cv.FILLED, hierarchy,1);
      cv.drawContours(i2s , contours, i, color, lineWidth, cv.FILLED, hierarchy,1);
      if (save) cv.drawContours(dc , contours, i, color, lineWidth, cv.FILLED, hierarchy,1);
    }
  }
  console.log(segcount);
  console.log("Done Drawing Contours");
  window.segcnt = segcount  // Will be used later in downloadCSV function 

  // Update the count
  let clabel = document.getElementById('segcount');
  clabel.innerHTML=segcount;
  // console.log("Labels: " + segcount);
  // console.log(cloneSrc.cols);
  // console.log(cloneSrc.rows);

  // Draw barriers
  // console.log(cloneSrc.rows,cloneSrc.cols);
  for (let i = 0; i < cloneSrc.rows; i++) {
    for (let j = 0; j < cloneSrc.cols; j++) {
      if (cloneSrc.ucharPtr(i, j)[0] === 0 && cloneSrc.ucharPtr(i, j)[1] === 0 && cloneSrc.ucharPtr(i, j)[2] === 0) {
        cloneSrc.ucharPtr(i, j)[3] = 0;
      } else {
        cloneSrc.ucharPtr(i, j)[3] = 255;
      }
    }
  }


  // Display it
  //cv.imshow(out, dst);
  //console.log(document.getElementById('test1'));
  cv.imshow(out, cloneSrc);
  if (save) cv.imshow($UI.segmentPanel.__c2s, dc);
  else cv.imshow($UI.segmentPanel.__c2s, i2s);
  //cv.imshow($UI.segmentPanel.__out, cloneSrc);

  // Free up memory
  src.delete();
  dst.delete();
  gray.delete();
  opening.delete();
  imageBg.delete();
  imageFg.delete();
  distTrans.delete();
  unknown.delete();
  markers.delete();
  M.delete();
}
async function deleteModel(name) {
  if (confirm("Are you sure you want to delete this model?")) {
      let res = await tf.io.removeModel(IDB_URL + name);
      console.log(res);
      let tx = db.transaction("models_store", 'readwrite');
      let store = tx.objectStore("models_store");
      let status = false
      try {
          store.delete(name);
          status = true;
      }
      catch (err) {
          alert(err);
      }
      finally {
          if (status) {
              alert("Deleted", name);
              showInfo();
          }
      }
  }
  else {
      return;
  }
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

      if (name.slice(0, 3) == "seg") {
        store.get(name).onsuccess = function (e) {
          input_shape = e.target.result.input_shape.slice(1, 3).join("x");
          td = row.insertCell();
          td.innerHTML = name.split('_').splice(1).join('_').slice(0, -3);
          td = row.insertCell();
          td.innerHTML = input_shape;
          td = row.insertCell();
          td.innerHTML = +size.toFixed(2);
          td = row.insertCell();
          td.innerHTML = date;
          td = row.insertCell();
          td.innerHTML = '<button class="btn btn-primary btn-xs my-xs-btn" id="removeModel" type="button">Remove Model</button>';
          document.getElementById("removeModel").addEventListener('click', () => {
            deleteModel(name);
          });
        }
      }
    }
    callback;
  })($UI.infoModal.open())


}

// Util Functions


/**
 * Return size of the element
 * @param  {Object} element HTML element
 * @return {Array} [width, height] of the element
 */
function _size(element) {

  var bounds = element.getBoundingClientRect()
  var styles = getComputedStyle(element)
  var height = (bounds.height|0)
    + (parseFloat(styles.getPropertyValue('margin-top')) || 0)
    + (parseFloat(styles.getPropertyValue('margin-bottom')) || 0)
  var width  = (bounds.width|0)
    + (parseFloat(styles.getPropertyValue('margin-left')) || 0)
    + (parseFloat(styles.getPropertyValue('margin-right')) || 0)

  return [width, height]
}

/**
 * Fit a canvas to its parent element
 * @param  {Object} canvas The canvas to be resized
 * @param  {Object} parent Parent according to which canvas is resized. Defaults to immediate parent.
 * @param  {Object} scale Scale to which it has to be resized. Defaults to 1 (Same size)
 * @return {Object}
 */
function fitCvs(canvas, parent, scale) {

  canvas.style.position = canvas.style.position || 'absolute'
  canvas.style.top = 0
  canvas.style.left = 0

  resize.scale  = parseFloat(scale || 1)
  resize.parent = parent

  return resize()

  function resize() {
    var p = resize.parent || canvas.parentNode
    // console.log(resize.parent , canvas.parentNode)
    var psize  = _size(p)
    var width  = psize[0]|0
    var height = psize[1]|0

    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    return resize
  }
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
  if(segcnt === 0)
  {
    alert("Nothing to download");
    return;
  }
  let data = '';
  let tmp = new cv.Mat();
  const self = $UI.segmentPanel;
  const nl = '\n';
  const vpx = self.__top_left[0];
  const vpy = self.__top_left[1];
  const spx = self.__x;
  const spy = self.__y;

  console.log('In Download and Save CSV');
  data += 'AreaInPixels,PerimeterInPixels,Polygon\n';

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
  const self = $UI.segmentPanel;

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

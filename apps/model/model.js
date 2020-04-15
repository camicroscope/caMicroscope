const PDR = OpenSeadragon.pixelDensityRatio;
const IDB_URL = 'indexeddb://';
var csvContent;

// INITIALIZE DB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// id(autoinc), name, location(name+id), classes
var request; var db;
var modelName;

// tensorflowjs creates its own IndexedDB on saving a model.
(async function(callback) {
  const model = tf.sequential();
  await model.save('indexeddb://dummy');
  await tf.io.removeModel('indexeddb://dummy');
  console.log('DB initialised');
  callback();
})(dbInit);

// Opening the db created by tensorflowjs
function dbInit() {
  request = window.indexedDB.open('tensorflowjs', 1);

  request.onupgradeneeded = function(e) {
    console.log('nasty!');
  };
  request.onerror = function(e) {
    console.log('ERROR', e);
  };
  request.onsuccess = function(e) {
    db = request.result;
    console.log('tfjs db opened and ready');
  };
}


let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: '../table.html',
    table: '../table.html',
  },
  params: null,
};
// const objAreaMin = 400;
// const objAreaMax = 4500;
// const lineWidth = 2;
// const timeOutMs = 10;


function initialize() {
  var checkPackageIsReady = setInterval(function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      initUIcomponents();
      initCore();
    }
  }, 100);
}

async function initUIcomponents() {
  /* create UI components */

  // Create uploadModal for model uploads.
  $UI.uploadModal = new ModalBox({
    id: 'upload_panel',
    hasHeader: true,
    headerText: 'Upload Model',
    hasFooter: false,
    provideContent: true,
    content: `
      <form action="#" class='form-style'>
      <ul>
          <li>
            <label align="left"> Name:  </label>
            <input name="name" id="name" type="text" required />
            <span> Name of the model </span>
          </li>
          <li>
            <label align="left"> Classes: </label>
            <input name="classes" id="classes" type="text" required />
            <span> Enter the classes model classifies into separated by comma. </span>
          </li>
          <li>
            <label align="left"> Input patch size: </label>
            <input name="imageSize" id="imageSize" type="number" required />
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
        <button id="submit">Upload</button> <span id="status"></span> <br>
      </form>
      <button id="refresh" class='material-icons'>cached</button>
    `,
  });

  // Create infoModal to show information about models uploaded.
  $UI.infoModal = new ModalBox({
    id: 'model_info',
    hasHeader: true,
    headerText: 'Available Models',
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
            <th>Remove Model</th>
            <th>Edit Class List</th>
          </tr>
          <tbody id="mdata">
          </tbody>
        </thead>
      </table>
    `,
  });

  // Create infoModal to show information about models uploaded.
  $UI.helpModal = new ModalBox({
    id: 'help',
    hasHeader: true,
    headerText: 'Help',
    hasFooter: false,
  });
  // Create Modal to take input from user of new class list
  $UI.chngClassLst = new ModalBox({
    id: 'chngClass',
    hasHeader: true,
    headerText: 'Help',
    hasFooter: false,
  });

  // create the message queue
  $UI.message = new MessageQueue();
  const dropDownList = [];
  modelName = [];
  Object.keys(await tf.io.listModels()).forEach(function(element) {
    const dict = {};
    const value = element.split('/').pop();
    if (value.slice(0, 4) == 'pred') {
      const title = element.split('/').pop().split('_').splice(2).join('_').slice(0, -3);
      dict.icon = 'flip_to_back';
      dict.title = title;
      dict.value = value;
      dict.checked = false;
      // Saving to previously defined model names
      modelName.push(dict['title']);
      dropDownList.push(dict);
    }
  });

  const filterList = [
    {
      icon: 'filter_1',
      title: 'Normalization',
      value: 'norm',
      checked: true,
    }, {
      icon: 'filter_2',
      title: 'Centering',
      value: 'center',
      checked: false,
    }, {
      icon: 'filter_3',
      title: 'Standardization',
      value: 'std',
      checked: false,
    },
  ];

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
        title: 'Predict',
        callback: drawRectangle,
      }, {
        icon: 'keyboard_arrow_down',
        type: 'dropdown',
        value: 'rect',
        dropdownList: dropDownList,
        title: 'Select Model',
        callback: setValue,
      }, {
        icon: 'photo_filter',
        type: 'dropdown',
        dropdownList: filterList,
        title: 'Pixel Scaling',
        callback: setFilter,
      }, {
        icon: 'insert_photo',
        type: 'btn',
        value: 'viewer',
        title: 'Viewer',
        callback: function() {
          if (window.location.search.length > 0) {
            window.location.href = '../viewer/viewer.html' + window.location.search;
          } else {
            window.location.href = '../viewer/viewer.html';
          }
        },
      }, {
        icon: 'add',
        type: 'btn',
        value: 'Upload model',
        title: 'Add model',
        callback: uploadModel,
      }, {
        icon: 'info',
        type: 'btn',
        value: 'Model info',
        title: 'Model info',
        callback: showInfo,
      }, {
        icon: 'help',
        type: 'btn',
        value: 'Help',
        title: 'Help',
        callback: openHelp,
      }, {
        icon: 'bug_report',
        title: 'Bug Report',
        value: 'bugs',
        type: 'btn',
        callback: () => {
          window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53', '_blank').focus();
        },
      },
      {
        icon: 'subject',
        title: 'Model Summary',
        value: 'summary',
        type: 'btn',
        callback: () => {
          tfvis.visor().toggle();
        }},
    ],
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
    hasMeasurementTool: true,
  };

  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }

  try {
    const slideQuery = {};
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    $CAMIC = new CaMic('main_viewer', slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e) {
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message);
    } else {
      $D.params.data = e;
    }
  });

  $CAMIC.viewer.addOnceHandler('open', function(e) {
    const viewer = $CAMIC.viewer;
    // add stop draw function
    viewer.canvasDrawInstance.addHandler('stop-drawing', camicStopDraw);

    // UI to select the part of image
    $UI.modelPanel = new ModelPanel(viewer);

    $UI.modelPanel.__btn_save.addEventListener('click', function(e) {
      const fname = $D.params.slideId + '_roi.png';

      download($UI.modelPanel.__fullsrc, fname);
    });

    // TO-DO -Save class probabilities
    $UI.modelPanel.__btn_savecsv.addEventListener('click', function(e) {
      const fname = $D.params.slideId + '_roi.csv';
      downloadCSV(fname);
    });
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
  const canvas = $CAMIC.viewer.drawer.canvas; // Original Canvas
  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const args = $UI.args;
  canvasDraw.drawMode = 'stepSquare';
  // Save size in an arg list
  if (args) canvasDraw.size = args.status.split('_')[1].split('-')[0];
  else canvasDraw.size = 1;
  canvasDraw.style.color = '#FFFF00';
  canvasDraw.style.isFill = false;

  if (e.checked) {
    // Warn about zoom level
    const currentZoom = Math.round($CAMIC.viewer.imagingHelper._zoomFactor * 40);
    requiredZoom = $UI.args? parseInt($UI.args.status.split('_')[1].split('-')[1]):currentZoom;
    if (currentZoom != requiredZoom) {
      alert(`You are testing the model for a different zoom level (recommended: ${requiredZoom}). Performance might be affected.`);
    }
    document.querySelector('.drop_down').classList.add('disabled');
    canvasDraw.drawOn();
  } else {
    canvasDraw.drawOff();
    document.querySelector('.drop_down').classList.remove('disabled');
  }
}

/**
 * This is basically onmouseup after drawing rectangle.
 * @param e
 */
function camicStopDraw(e) {
  const viewer = $CAMIC.viewer;
  const canvasDraw = viewer.canvasDrawInstance;

  const imgColl = canvasDraw.getImageFeatureCollection();
  if (imgColl.features.length > 0) {
    // Check size first
    const box = checkSize(imgColl, viewer.imagingHelper);

    if (Object.keys(box).length === 0 && box.constructor === Object) {
      console.error('SOMETHING WICKED THIS WAY COMES.');
    } else {
      const args = $UI.args;
      if (args) {
        runPredict(args.status);
      }
      $UI.modelPanel.setPosition(box.rect.x, box.rect.y, box.rect.width, box.rect.height);
      if ($UI.modelPanel.__spImgWidth != 0) {
        $UI.modelPanel.open(args);
      }

      canvasDraw.clear();
      csvContent = '';
    }
  } else {
    console.error('Could not get feature collection.');
  }
}

function checkSize(imgColl, imagingHelper) {
  // 5x2 array
  const bound = imgColl.features[0].bound;
  // slide images svsslide images svs
  // get position on viewer

  const topLeft = imgColl.features[0].bound[0];
  const bottomRight = imgColl.features[0].bound[2];
  const min = imagingHelper._viewer.viewport.imageToViewportCoordinates(topLeft[0], topLeft[1]);
  const max = imagingHelper._viewer.viewport.imageToViewportCoordinates(bottomRight[0], bottomRight[1]);
  const rect = new OpenSeadragon.Rect(min.x, min.y, max.x-min.x, max.y-min.y);
  const self = $UI.modelPanel;

  self.__top_left = topLeft;
  self.__spImgX = topLeft[0];
  self.__spImgY = topLeft[1];
  self.__spImgWidth = bottomRight[0]-topLeft[0];
  self.__spImgHeight = bottomRight[1]-topLeft[1];

  // Convert to screen coordinates
  const foo = convertCoordinates(imagingHelper, bound);

  // retina screen
  const newArray = foo.map(function(a) {
    const x = a.slice();
    x[0] *= PDR;
    x[1] *= PDR;
    return x;
  });

  const xCoord = Math.round(newArray[0][0]);
  const yCoord = Math.round(newArray[0][1]);
  const width = Math.round(newArray[2][0] - xCoord);
  const height = Math.round(newArray[2][1] - yCoord);

  self.__x = xCoord;
  self.__y = yCoord;
  self.__width = xCoord;
  self.__height = yCoord;

  // check that image size is ok
  if (width * height > 8000000) {
    alert('Selected ROI too large, current version is limited to 4 megapixels');
    // Clear the rectangle  canvas-draw-overlay.clear()
    $CAMIC.viewer.canvasDrawInstance.clear();
    return {}; // throw('image too large')
  } else {
    return {'rect': rect, 'xCoord': xCoord, 'yCoord': yCoord, 'width': width, 'height': height};
  }
}

/**
 * Run model
 * @param key
 */
function runPredict(key) {
  // But first, some setup...
  const self = $UI.modelPanel;
  const X = self.__spImgX;
  const Y = self.__spImgY;
  const totalSize = self.__spImgWidth;
  const step = parseInt(key.split('_')[1].split('-')[0]);

  self.showResults(' --Result-- ');
  if (totalSize > 0) {
    const prefixUrl = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;
    self.showProgress('Predicting...');

    const fullResCvs = self.__fullsrc;

    // Starting the transaction and opening the model store
    const tx = db.transaction('models_store', 'readonly');
    const store = tx.objectStore('models_store');
    store.get(key).onsuccess = async function(e) {
      // Keras sorts the labels by alphabetical order.
      const classes = e.target.result.classes.sort();

      const inputShape = e.target.result.input_shape;
      // let inputChannels = parseInt(inputShape[3]);
      const inputChannels = 3;
      const imageSize = inputShape[1];

      model = await tf.loadLayersModel(IDB_URL + key);
      self.showProgress('Model loaded...');
      tfvis.show.modelSummary({name: 'Model Summary', tab: 'Model Inspection'}, model);

      // Warmup the model before using real data.
      tf.tidy(()=>{
        model.predict(tf.zeros([1, imageSize, imageSize, inputChannels]));
        console.log('Model ready');
      });

      const memory = tf.memory();
      console.log('Model Memory Usage');
      console.log('GPU : ' + memory.numBytesInGPU + ' bytes');
      console.log('Total : ' + memory.numBytes + ' bytes');

      const temp = document.querySelector('#dummy');
      temp.height = step;
      temp.width = step;

      function addImageProcess(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      }

      const results = [];
      csvContent = 'data:text/csv;charset=utf-8,';
      classes.forEach((e) => {
        csvContent += e + ',';
      });
      csvContent += 'x,y\n\r';
      self.showProgress('Predicting...');

      for (let y = Y, dy = 0; y < (Y + totalSize); y+=(step)) {
        let dx = 0;
        for (let x = X; x < (X + totalSize); x+=(step)) {
          const src = prefixUrl+'\/'+x+','+y+','+step+','+step+'\/'+step+',/0/default.jpg';

          const lImg = await addImageProcess(src);
          fullResCvs.height = lImg.height;
          fullResCvs.width = lImg.width;
          fullResCvs.getContext('2d').drawImage(lImg, 0, 0);

          const imgData = fullResCvs.getContext('2d').getImageData(0, 0, fullResCvs.width, fullResCvs.height);
          tf.tidy(()=>{
            const img = tf.browser.fromPixels(imgData).toFloat();
            let img2;
            if (inputChannels == 1) {
              img2 = tf.image.resizeBilinear(img, [imageSize, imageSize]).mean(2);
            } else {
              img2 = tf.image.resizeBilinear(img, [imageSize, imageSize]);
            }
            const scaleMethod = $UI.filter? $UI.filter.status: 'norm';
            console.log(scaleMethod);

            let normalized;
            if (scaleMethod == 'norm') {
            // Pixel Normalization: scale pixel values to the range 0-1.

              const scale = tf.scalar(255);
              normalized = img2.div(scale);
            } else if (scaleMethod == 'center') {
            // Pixel Centering: scale pixel values to have a zero mean.

              const mean = img2.mean();
              normalized = img2.sub(mean);
            // normalized.mean().print(true); // Uncomment to check mean value.
            // let min = img2.min();
            // let max = img2.max();
            // let normalized = img2.sub(min).div(max.sub(min));
            } else {
            // Pixel Standardization: scale pixel values to have a zero mean and unit variance.

              const mean = img2.mean();
              const std = (img2.squaredDifference(mean).sum()).div(img2.flatten().shape).sqrt();
              normalized = img2.sub(mean).div(std);
            }
            const batched = normalized.reshape([1, imageSize, imageSize, inputChannels]);
            const values =model.predict(batched).dataSync();

            values.forEach((e) => {
              csvContent += e.toString() + ',';
            });
            csvContent += '' + dx + ',' + dy + '\n\r';

            results.push(values);
            // Retrieving the top class

            dx += step;
          });
        }
        dy += step;
      }

      const len = results.length;
      const final = new Array(results[0].length).fill(0);
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results[0].length; j++) {
          final[j] += results[i][j];
        }
      }
      for (let i = 0; i < final.length; i++) {
        final[i] /= len;
      }

      iMax = Object.keys(final).reduce((a, b) => final[a] > final[b] ? a : b);
      const i = parseInt(iMax) + 1;
      self.showResults('' + i + ': ' + classes[iMax] + ' - ' + final[iMax].toFixed(3));
      self.hideProgress();
      model.dispose();
    };
  } else {
    alert('Selected section too small. Please select a larger section.');
  }
}

// TO-DO: Allow uploading and using tensorflow graph models. Can't save graph models. Need to use right away.
function uploadModel() {
  var _name = document.querySelector('#name');
  var _classes = document.querySelector('#classes');
  var mag = document.querySelector('#magnification');
  var _imageSize = document.querySelector('#imageSize');
  var topology = document.querySelector('#modelupload');
  var weights = document.querySelector('#weightsupload');
  var status = document.querySelector('#status');
  var toggle = document.querySelector('#togBtn');
  var url = document.querySelector('#url');
  var refresh = document.querySelector('#refresh');
  var submit = document.querySelector('#submit');

  // Reset previous input
  _name.value = _classes.value = topology.value = weights.value = status.innerHTML = _imageSize.value = url.value = '';

  $UI.uploadModal.open();

  toggle.addEventListener('change', function(e) {
    if (this.checked) {
      document.querySelector('.checktrue').style.display = 'block';
      document.querySelector('.checkfalse').style.display = 'none';
    } else {
      document.querySelector('.checktrue').style.display = 'none';
      document.querySelector('.checkfalse').style.display = 'block';
    }
  });

  refresh.addEventListener('click', () => {
    initUIcomponents();
  });

  submit.addEventListener('click', async function(e) {
    e.preventDefault();

    if ( _name.value && _classes.value && _imageSize.value &&
      ((!toggle.checked && topology.files[0].name.split('.').pop() == 'json') || (toggle.checked && url))) {
      status.innerHTML = 'Uploading';
      status.classList.remove('error');
      status.classList.add('blink');

      const _channels = parseInt(document.querySelector('input[name="channels"]:checked').value);
      // Adding some extra digits in the end to maintain uniqueness
      const name = 'pred_' + _imageSize.value.toString() + '-' + mag.value.toString() +
      '_' + _name.value + (new Date().getTime().toString()).slice(-4, -1);
      // Create an array from comma separated values of classes
      const classes = _classes.value.split(/\s*,\s*/);

      if (toggle.checked) {
        var modelInput = url.value;
      } else {
        var modelInput = tf.io.browserFiles([topology.files[0], ...weights.files]);
      }

      // Check if model with same name is previously defined
      try {
        if (modelName.indexOf(_name.value)!=-1) {
          throw new Error('Model name repeated');
        }
      } catch (e) {
        status.innerHTML = 'Model with the same name already exists. Please choose a new name';
        status.classList.remove('blink');
        console.log(e);
        document.getElementById('name').style = 'border:2px; border-style: solid; border-color: red;';
        return;
      }

      try {
        // This also ensures that valid model is uploaded.
        const model = await tf.loadLayersModel(modelInput);
        try {
          const result = model.predict(
              tf.ones([1, parseInt(_imageSize.value), parseInt(_imageSize.value), parseInt(_channels)]));
          result.dispose();
        } catch (e) {
          status.innerHTML = 'Model failed on the given values of patch size.' +
          'Please input values on which the model was trained.';
          console.log(e);
          status.classList.remove('blink');
          document.getElementById('imageSize').style = 'border:2px; border-style: solid; border-color: red;';
          return;
        }

        await model.save(IDB_URL + name);

        // Update the model store db entry to have the classes array
        tx = db.transaction('models_store', 'readwrite');
        store = tx.objectStore('models_store');

        store.get(name).onsuccess = function(e) {
          const data = e.target.result;
          data['classes'] = classes;
          data['input_shape'] = [1, parseInt(_imageSize.value), parseInt(_imageSize.value), parseInt(_channels)];

          const req = store.put(data);
          req.onsuccess = function(e) {
            console.log('SUCCESS, ID:', e.target.result);
            status.innerHTML = 'Done! Click refresh below.';
            status.classList.remove('blink');
            modelName.push(_name.value);
          };
          req.onerror = function(e) {
            status.innerHTML = 'Some error this way!';
            console.log(e);
            status.classList.remove('blink');
          };
        };
      } catch (e) {
        status.classList.add('error');
        status.classList.remove('blink');
        if (toggle.checked) status.innerHTML = 'Please enter a valid URL.';
        else {
          status.innerHTML = 'Please enter a valid model.' +
        'Input model.json in first input and all weight binaries in second one without renaming.';
        }
        console.error(e);
      }
    } else {
      status.innerHTML = 'Please fill out all the fields with valid values.';
      status.classList.add('error');
      console.error(e);
    }
  });
}

async function deleteModel(name) {
  if (confirm('Are you sure you want to delete this model?')) {
    const res = await tf.io.removeModel(IDB_URL + name);
    console.log(res);
    const tx = db.transaction('models_store', 'readwrite');
    const store = tx.objectStore('models_store');
    let status = false;
    try {
      store.delete(name);
      status = true;
    } catch (err) {
      alert(err);
    } finally {
      if (status) {
        alert('Deleted', name);
        showInfo();
        modelName.splice(modelName.indexOf(name.split('/').pop().split('_').splice(2).join('_').slice(0, -3)), 1);
      }
    }
  } else {
    return;
  }
}

// Shows the uploaded models' details
async function showInfo() {
  var data = await tf.io.listModels();
  var table = document.querySelector('#mdata');
  var tx = db.transaction('models_store', 'readonly');
  var store = tx.objectStore('models_store');
  var modelCount=0;
  empty(table);
  // Update table data
  (function(callback) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const name = key.split('/').pop();
        const date = data[key].dateSaved.toString().slice(0, 15);
        const size = (data[key].modelTopologyBytes +
          data[key].weightDataBytes +
          data[key].weightSpecsBytes) / (1024*1024);
        const row = table.insertRow();
        let classes; let inputShape; let td;

        if (name.slice(0, 4) == 'pred') {
          store.get(name).onsuccess = function(e) {
            classes = (e.target.result.classes.join(', '));
            inputShape = e.target.result.input_shape.slice(1, 3).join('x');
            td = row.insertCell();
            td.innerHTML = name.split('/').pop().split('_').splice(2).join('_').slice(0, -3);
            td = row.insertCell();
            td.innerHTML = classes;
            td = row.insertCell();
            td.innerHTML = inputShape;
            td = row.insertCell();
            td.innerHTML = +size.toFixed(2);
            td = row.insertCell();
            td.innerHTML = date;
            td = row.insertCell();
            td.innerHTML = '<button class="btn-del" '+
            'id=removeModel'+ modelCount+' type="button"><i class="material-icons"'+
            'style="font-size:16px;">delete_forever</i>Remove Model</button>';
            td = row.insertCell();
            td.innerHTML = '<button class="btn-change" '+
            'id=chngClassListBtn'+ modelCount+' type="button"><i class="material-icons"' +
            'style="font-size:16px;">edit</i>  Edit Classes</button>';
            document.getElementById('removeModel'+modelCount).addEventListener('click', () => {
              deleteModel(name);
            });
            document.getElementById('chngClassListBtn'+modelCount).addEventListener('click', () => {
              showNewClassInput(name);
            });
            modelCount+=1;
          };
        }
      }
    }
    callback;
  })($UI.infoModal.open());
}


function showNewClassInput(name) {
  const self = $UI.chngClassLst;
  self.body.innerHTML = `
    <input id ="new_classList" type="text"/>
    <button class="btn btn-primary btn-xs my-xs-btn" id="chngbtn" type="button">Change Class List</button>
    `;
  $UI.chngClassLst.open(); // Open the box to take input from user
  document.getElementById('chngbtn').addEventListener('click', () => {
    // $UI.chngClassLst.close();
    var newList = document.querySelector('#new_classList').value; // Get the list inputed by user
    $UI.infoModal.close();
    $UI.chngClassLst.close();
    changeClassList(newList, name); // Call to a function to change class list
  });
}

async function changeClassList(newList, name) {
  var data = await tf.io.listModels();
  var tx = db.transaction('models_store', 'readwrite');
  var store = tx.objectStore('models_store');
  for (const key in data) {
    if (name === key.split('/').pop()) {
      store.get(name).onsuccess = function(e) {
        const d = e.target.result;
        const classList = newList.split(/\s*,\s*/);
        d['classes'] = classList;
        const req = store.put(d);
      };
    }
  }
  alert('Classes Changed');
}

function openHelp() {
  const self = $UI.helpModal;
  self.body.innerHTML = `
    <em>Features</em> <br>
    This part of caMicroscope allows to predict using a trained model on a selected patch. Some of the sample
    models are hosted <a target="_blank" href="https://github.com/camicroscope/tfjs-models">here</a>. <br>
    <i class="material-icons">aspect_ratio</i>: On activation, this button enables drawing on the viewer. After the image is loaded for further processing, a UI will
    appear for model selection. The Whole-slide images are high resolution images containing the entire sampled tissue so make sure
    you zoom in and then select a patch. Selecting a large region while being totally zoomed out may slow down the further processing
    due to fairly large image size. <br>
    <i class="material-icons">insert_photo</i>: This will redirect back to main Viewer. <br>
    <i class="material-icons">add</i>: This will open a dialogue box to upload the model. Make sure to fill in all the fields. The image size field expects a
    single integer. <br>
    <i class="material-icons">info</i>: This will display the details of previously uploaded models. <br>
    <i class="material-icons">bug_report</i>: Bug report. <br>
    <i class="material-icons">subject</i>: This will display the summary of the current selected model.
  `;
  $UI.helpModal.open();
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
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = unescape(dataURI.split(',')[1]);
  }

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
}

/**
 * Convert image coordinates
 */
function convertCoordinates(imagingHelper, bound) {
  const newArray = bound.map(function(arr) {
    return arr.slice(); // copy
  });

  // 'image coordinate' to 'screen coordinate'
  for (let i = 0; i < newArray.length; i++) {
    const boundElement = newArray[i];
    for (let j = 0; j < boundElement.length; j++) {
      newArray[i][j] = j === 0 ? imagingHelper.dataToPhysicalX(boundElement[j]) :
        imagingHelper.dataToPhysicalY(boundElement[j]);
    }
  }

  return newArray;
}

// Save the canvas to filename.  Uses local save dialog.
function download(canvas, filename) {
  // / create an "off-screen" anchor tag
  var lnk = document.createElement('a');
  var e;

  // / the key here is to set the download attribute of the a tag
  lnk.download = filename;

  // / convert canvas content to data-uri for link. When download
  // / attribute is set the content pointed to by link will be
  // / pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL();

  // / create a "fake" click-event to trigger the download
  if (document.createEvent) {
    e = document.createEvent('MouseEvents');
    e.initMouseEvent('click', true, true, window,
        0, 0, 0, 0, 0, false, false, false,
        false, 0, null);

    lnk.dispatchEvent(e);
  } else if (lnk.fireEvent) {
    lnk.fireEvent('onclick');
  }
}


// Save the polygons to csv with filename.  Uses local save dialog.
function downloadCSV(filename) {
  const self = $UI.modelPanel;
  if (csvContent) {
    filename = filename || 'export.csv';
    const data = encodeURI(csvContent);

    var lnk = document.createElement('a');
    var e;
    lnk.href = data;
    lnk.download = filename;
    // / create a "fake" click-event to trigger the download
    if (document.createEvent) {
      e = document.createEvent('MouseEvents');
      e.initMouseEvent('click', true, true, window,
          0, 0, 0, 0, 0, false, false, false,
          false, 0, null);

      lnk.dispatchEvent(e);
    } else if (lnk.fireEvent) {
      lnk.fireEvent('onclick');
    }
  } else {
    self.showResults('Please select a model first');
  }
}

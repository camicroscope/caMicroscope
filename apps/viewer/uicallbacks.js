/*
UI and Core callback and hook
all functions help the UI and Core part together that makes workflows.
*/

// UI callback functions list

/**
 * Toggles side-by-side viewer
 * @param {Object} opt
 */
function toggleViewerMode(opt) {
  if (opt.checked) {
    // turn off preset label
    toolsOff();

    // turn off magnifier
    // magnifierOff();
    // turn off measurement
    // measurementOff();

    // open layers menu
    $UI.toolbar._mainTools[1].querySelector(
        'input[type=checkbox]',
    ).checked = true;
    $UI.layersSideMenu.open();

    // close apps menu
    $UI.toolbar._mainTools[0].querySelector(
        'input[type=checkbox]',
    ).checked = false;
    $UI.appsSideMenu.close();

    openMinorControlPanel();
    openSecondaryViewer();
  } else {
    $UI.appsSideMenu.close();
    $UI.layersSideMenu.close();
    closeMinorControlPanel();
    closeSecondaryViewer();
  }
}

/**
 * Finds the slide for minor-viewer in side-by-side viewer
 * @param {Object} size object with height and width
 */
function multSelectorAction(size) {
  // hidden main viewer's bottom right control and get navigator
  $CAMIC.viewer.controls.bottomright.style.display = 'none';
  $UI.lockerPanel.style.display = '';
  $UI.lockerPanel.querySelector('input[type=checkbox]').checked = true;
  isLock = true;
  // open new instance camic
  try {
    const slideQuery = {};
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    $minorCAMIC = new CaMic('minor_viewer', slideQuery, {
      // osd options
      // mouseNavEnabled:false,
      // panVertical:false,
      // panHorizontal:false,
      // showNavigator:false,
      // customized options
      // hasZoomControl:false,
      hasDrawLayer: false,
      addRulerCallback: onAddRuler,
      deleteRulerCallback: onDeleteRuler,
      // hasLayerManager:false,
      // hasScalebar:false,
      // states options
      navigatorHeight: size.height,
      navigatorWidth: size.width,
      states: {
        x: $CAMIC.viewer.viewport.getCenter().x,
        y:
          $CAMIC.viewer.viewport.getCenter().y *
          $CAMIC.viewer.imagingHelper.imgAspectRatio,
        z: $CAMIC.viewer.viewport.getZoom(),
      },
    });

    // synchornic zoom and move
    // coordinated Viewer - zoom
    $CAMIC.viewer.addHandler('zoom', synchornicView1, {type: 'zoom'});

    // coordinated Viewer - pan
    $CAMIC.viewer.addHandler('pan', synchornicView1, {type: 'pan'});

    // loading image
    $minorCAMIC.loadImg(function(e) {
      // image loaded
      if (e.hasError) {
        $UI.message.addError(e.message);
      }
    });
    $minorCAMIC.viewer.addOnceHandler('tile-drawing', function() {
      $minorCAMIC.viewer.addHandler('zoom', synchornicView2, {type: 'zoom'});
      $minorCAMIC.viewer.addHandler('pan', synchornicView2, {type: 'pan'});
      // create segment display
      $minorCAMIC.viewer.createSegment({
        store: $minorCAMIC.store,
        slide: $D.params.data.name,
        data: [],
      });
    });
  } catch (error) {
    Loading.close();
    console.error(error);
    $UI.message.addError('Core Initialization Failed');
    return;
  }
}

var active1 = false;
var active2 = false;
var isLock = true;
function synchornicView1(data) {
  if (active2) return;
  active1 = true;
  switch (data.userData.type) {
    case 'zoom':
      if (isLock) {
        $minorCAMIC.viewer.viewport.zoomTo(data.zoom, data.refPoint);
      } else {
        $minorCAMIC.viewer.viewport.panTo(
            $CAMIC.viewer.viewport.getCenter(true),
        );
      }
      break;
    case 'pan':
      $minorCAMIC.viewer.viewport.panTo(data.center);
      break;
    default:
      $minorCAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.getZoom());
      $minorCAMIC.viewer.viewport.panTo($CAMIC.viewer.viewport.getCenter());
      break;
  }
  active1 = false;
}

function synchornicView2(data) {
  if (active1) return;
  active2 = true;
  switch (data.userData.type) {
    case 'zoom':
      if (isLock) {
        $CAMIC.viewer.viewport.zoomTo(data.zoom, data.refPoint);
      } else {
        $CAMIC.viewer.viewport.panTo(
            $minorCAMIC.viewer.viewport.getCenter(true),
        );
      }
      break;
    case 'pan':
      $CAMIC.viewer.viewport.panTo(data.center);
      break;
    default:
      $CAMIC.viewer.viewport.zoomTo($minorCAMIC.viewer.viewport.getZoom());
      $CAMIC.viewer.viewport.panTo($minorCAMIC.viewer.viewport.getCenter());
      break;
  }

  active2 = false;
}

/**
 * Opens the side-by-side secondary viewer
 */
function openSecondaryViewer() {
  // ui changed
  const main = document.getElementById('main_viewer');
  const minor = document.getElementById('minor_viewer');
  main.classList.remove('main');
  main.classList.add('left');

  minor.classList.remove('none');
  // minor.classList.add('display');
  minor.classList.add('right');

  const navSize = {
    height: $CAMIC.viewer.controls.bottomright.querySelector('.navigator').style
        .height,
    width: $CAMIC.viewer.controls.bottomright.querySelector('.navigator').style
        .width,
  };
  setTimeout(function() {
    multSelectorAction(navSize);
  }, 100);
}

/**
 * Closes the side-by-side secondary viewer
 */
function closeSecondaryViewer() {
  // ui changed
  const main = document.getElementById('main_viewer');
  const minor = document.getElementById('minor_viewer');
  main.classList.add('main');
  main.classList.remove('left');
  minor.classList.add('none');
  minor.classList.remove('right');
  $CAMIC.viewer.controls.bottomright.style.display = '';
  $UI.lockerPanel.style.display = 'none';

  const li = $UI.toolbar.getSubTool('sbsviewer');
  li.querySelector('input[type="checkbox"]').checked = false;
  Loading.close();

  // destory
  if ($minorCAMIC) {
    // remove handler
    $CAMIC.viewer.removeHandler('zoom', synchornicView1);
    $CAMIC.viewer.removeHandler('pan', synchornicView1);

    // destroy object
    $minorCAMIC.destroy();
    $minorCAMIC = null;
  }

  // hide on layersViewer TODO
  $UI.layersViewerMinor.toggleAllItems();
  $UI.layersViewerMinor.setting.data.forEach((d) => delete d.layer);
}

/**
 * side menu toggle callback, called from layerManager and annotation side menu
 * @param {Object} opt
 */
function toggleSideMenu(opt) {
  if (!opt.isOpen) {
    const id = opt.target.id.split('_')[1];
    $UI.toolbar.changeMainToolStatus(id, false);
  }
}

/**
 * side menu toggle callback, called from layerManager and annotation side menu
 * @param {Object} opt
 */

/**
 * Home callback for redirecting to table page
 * @param {Object} data
 */
function goHome(data) {
  redirect($D.pages.home, `GO Home Page`, 0);
}

// --- Annotation Tool ---//
// pen draw callback
const label = document.createElement('div');
label.style.transformOrigin = 'center';
label.style.height = 0;
label.style.width = 0;

function draw(e) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }
  const state = +e.state;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const target = this.srcElement || this.target || this.eventSource.canvas;
  if (state) {
    // on

    // off magnifier
    // magnifierOff();
    // off measurement
    // measurementOff();

    // turn off annotaiton
    if (state==1) {
      // show pop-up message to user
      $UI.message.add('<i class="small material-icons">info</i>For More Options, Right Click Anywhere On The Image', 4000);
    }
    if ($CAMIC.status == 'normal') {
      annotationOn.call(this, state, target);
      return;
    }
    toolsOff();
    var checkAllToolsOff = setInterval(
        function() {
          if ($CAMIC && $CAMIC.status == null) {
          // all tool has turn off
            clearInterval(checkAllToolsOff);
            annotationOn.call(this, state, target);
          }
        }.bind(this),
        100,
    );
  } else {
    // off
    annotationOff();
  }
}

/**
 * utility function for switching off given tool
 */
function toolsOff() {
  switch ($CAMIC.status) {
    case 'magnifier':
      magnifierOff();
      break;
    case 'measure':
      measurementOff();
      break;
    case 'normal':
      annotationOff();
      break;
    case 'label':
      presetLabelOff();
      break;
    case 'download_selection':
      downloadSelectionOff();
      break;
  }
}

function annotationOn(state, target) {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const li = $UI.toolbar.getSubTool('annotation');
  const {style, model} = $CAMIC.drawContextmenu.getStyle();

  canvasDraw.drawMode = model;
  canvasDraw.style.color = style.color;

  li.appendChild(label);
  switch (state) {
    case 1:
      spen.menu(65, 0.2);
      spen.undo.onclick=()=>canvasDraw.__align_undo();
      // open menu
      $UI.annotOptPanel._action_.style.display = '';
      label.style.transform = 'translateY(-12px) translateX(18px)';
      label.textContent = '1';
      label.style.color = '';
      break;
    case 2:
      $UI.annotOptPanel._action_.style.display = '';
      label.style.transform =
        ' rotate(-90deg) translateX(2px) translateY(13px)';
      label.textContent = '8';
      label.style.color = 'white';
      break;
    default:
      // statements_def
      break;
  }

  canvasDraw.drawOn();
  $CAMIC.drawContextmenu.on();
  $CAMIC.drawContextmenu.open({
    x: this.clientX,
    y: this.clientY,
    target: target,
  });
  $CAMIC.status = 'normal';
  // close layers menu
  $UI.layersSideMenu.close();
  // open annotation menu
  $UI.appsSideMenu.open();
  // -- START QUIP550 -- //
  // $UI.appsList.triggerContent('annotation','open');
  // -- END QUIP550 -- //
  const input = $UI.annotOptPanel._form_.querySelector('#name');
  input.focus();
  input.select();
}

function annotationOff() {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;

  if (
    canvasDraw._draws_data_.length &&
    confirm(`Do You Want To Save Annotation Before You Leave?`)
  ) {
    saveAnnotation();
  } else {
    spen.close();
    // close menu
    canvasDraw.clear();
    canvasDraw.drawOff();
    $CAMIC.drawContextmenu.off();
    $UI.appsSideMenu.close();
    toggleOffDrawBtns();
    $CAMIC.status = null;
  }
}

function toggleOffDrawBtns() {
  const li = $UI.toolbar.getSubTool('annotation');
  const lab = li.querySelector('label');
  const state = +lab.dataset.state;
  lab.classList.remove(`s${state}`);
  lab.dataset.state = 0;
  lab.classList.add(`s0`);
  if (label.parentNode) li.removeChild(label);
}


function brushOn(d) {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  const bctrl = document.getElementById('bctrl');
  bctrl.style.display = 'block';

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = d.mode;
  canvasDraw.size = [parseInt(d.size), parseInt(d.size)];
  canvasDraw.style.color = d.color;
  canvasDraw.brushType = d.type;
  canvasDraw.drawOn();
  $CAMIC.status = 'brush';

  $UI.toolbar.getSubTool('brush').querySelector('label').style.color = d.color;
  //   //close layers menu
  //   $UI.layersSideMenu.close();
}


// --- Measurement Tool ---//
/**
 * Callback measurement tool to toggle measurement tool
 * @param {Object} data
 */
function toggleMeasurement(data) {
  if (!$CAMIC.viewer.measureInstance) {
    console.warn('No Measurement Tool');
    return;
  }
  // $UI.message.add(`Measument Tool ${data.checked?'ON':'OFF'}`);
  if (data.checked) {
    // trun off the main menu
    $UI.layersSideMenu.close();
    if ($CAMIC.status == 'measure') {
      $CAMIC.viewer.measureInstance.mode = data.status;
      measurementOn();
      return;
    }
    // turn off annotation
    toolsOff();
    var checkAllToolsOff = setInterval(function() {
      if ($CAMIC && $CAMIC.status == null) {
        // all tool has turn off
        clearInterval(checkAllToolsOff);
        $CAMIC.viewer.measureInstance.mode = data.status;
        measurementOn();
      }
    }, 100);
    // turn off magnifier
    // magnifierOff();
  } else {
    measurementOff();
  }
}

/**
 * switches download Selection tool on, called from toggleMeasurement
 */
function downloadSelectionOn() {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  $CAMIC.viewer.canvasDrawInstance.drawOn();
  getDrawOption();
  $CAMIC.viewer.canvasDrawInstance.drawMode = 'rect';
  $CAMIC.viewer.canvasDrawInstance.style.color = '#000';
  const li = $UI.toolbar.getSubTool('download_selection');
  li.querySelector('input[type=checkbox]').checked = true;
  $CAMIC.status = 'download_selection';
}

/**
 * switches downloadSelection tool off, called from toggleMeasurement
 */
function downloadSelectionOff() {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  $CAMIC.viewer.canvasDrawInstance.drawOff();
  $CAMIC.viewer.canvasDrawInstance.clear();
  setDrawOption();
  const li = $UI.toolbar.getSubTool('download_selection');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
}

/**
 * switches measuring tool on, called from toggleMeasurement
 */
function measurementOn() {
  if (!$CAMIC.viewer.measureInstance) return;
  $CAMIC.viewer.measureInstance.on();
  const li = $UI.toolbar.getSubTool('measurement');
  li.querySelector('input[type=checkbox]').checked = true;
  const value = li.querySelector('.drop_down input[type=radio]:checked').value;
  if (value=='straight') {
    li.querySelector('label').textContent = 'straighten';
  } else if (value=='coordinate') {
    li.querySelector('label').textContent = 'square_foot';
  }
  $CAMIC.status = 'measure';
}

/**
 * switches measuring tool off, called from toggleMeasurement
 */
function measurementOff() {
  if (!$CAMIC.viewer.measureInstance) return;
  $CAMIC.viewer.measureInstance.off();
  const li = $UI.toolbar.getSubTool('measurement');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
}

// --- Magnifier tool ---//
/**
 * Callback magnifier tool to toggle measurement tool
 * @param {Object} data
 */
function toggleMagnifier(data) {
  if (data.checked) {
    if ($CAMIC.status == 'magnifier') {
      // all tool has turn off
      clearInterval(checkAllToolsOff);
      magnifierOn(+data.status, this.clientX, this.clientY);
      // turn off the main menu
      $UI.layersSideMenu.close();
      $UI.appsSideMenu.close();
      return;
    }
    // annotation off
    toolsOff();
    var checkAllToolsOff = setInterval(
        function() {
          if ($CAMIC && $CAMIC.status == null) {
          // all tool has turn off
            clearInterval(checkAllToolsOff);
            magnifierOn(+data.status, this.clientX, this.clientY);
            // trun off the main menu
            $UI.layersSideMenu.close();
            $UI.appsSideMenu.close();
          }
        }.bind(this),
        100,
    );
    // measurement off
    // measurementOff();
  } else {
    magnifierOff();
  }
}

/**
 * switches magnifier tool on, called from toggleMagnifier
 */
function magnifierOn(factor = 1, x = 0, y = 0) {
  if (!$UI.spyglass) return;
  $UI.spyglass.factor = factor;
  $UI.spyglass.open(x, y);
  const li = $UI.toolbar.getSubTool('magnifier');
  li.querySelector('input[type=checkbox]').checked = true;
  $CAMIC.status = 'magnifier';
}

/**
 * switches magnifier tool off, called from toggleMagnifier
 */
function magnifierOff() {
  if (!$UI.spyglass) return;
  $UI.spyglass.close();
  const li = $UI.toolbar.getSubTool('magnifier');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
}

// image download
function imageDownload() {
  var downloadURL = '../../loader/getSlide/';
  var store = new Store('../../data/');
  var id=$D.params.slideId;
  var fileName = '';
  store
      .getSlide(id)
      .then((response) => {
        if (response[0]) {
          return response[0]['location'];
        } else {
          throw new Error('Slide not found');
        }
      })
      .then((location) => {
        fileName = location.substring(
            location.lastIndexOf('/') + 1,
            location.length,
        );
        return fileName;
      })
      .then((fileName) => {
        fetch(downloadURL + fileName, {
          credentials: 'same-origin',
          method: 'GET',
        })
            .then((response) => {
              if (response.status == 404) {
                throw response;
              } else {
                return response.blob();
              }
            })
            .then((blob) => {
              var url = window.URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              a.remove(); // afterwards we remove the element again
              window.URL.revokeObjectURL(blob);
            })
            .catch((error) => {
              console.log(error);
              alert('Error! Can\'t download file.');
            });
      })
      .catch((error) => {
        console.log(error);
      });
}

/**
 * share url callback
 * @param {Object} data
 */
function shareURL(data) {
  const URL = StatesHelper.getCurrentStatesURL(true);
  window.prompt('Share this link', URL);
}

/**
 * main menu changed callback, toggles Layer Manager side app
 * @param {Object} data
 */
function mainMenuChange(data) {
  if (data.apps) {
    $UI.appsSideMenu.open();
  } else {
    $UI.appsSideMenu.close();
  }

  if (data.layers) {
    $UI.layersSideMenu.open();
  } else {
    $UI.layersSideMenu.close();
  }

  if (data.labels) {
    $UI.labelsSideMenu.open();
  } else {
    presetLabelOff();
  }
}

function convertHumanAnnotationToPopupBody(notes) {
  const rs = {type: 'map', data: []};
  for (let field in notes) {
    if (notes.hasOwnProperty(field)) {
      const val = notes[field];
      field = field
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      rs.data.push({key: field, value: val});
    }
  }
  return rs;
}

/**
 * Deletes the annotation with given data
 * called from removeCallback
 * @param {Object} data
 */
function annoDelete(data, parentType) {
  if (!data.id) return;


  const annotationData = $D.humanlayers.find(
      (d) => d.data && d.data._id.$oid == data.oid,
  );
  let message;
  if (annotationData.data.geometries) {
    message = `Are You Sure You Want To Delete This Annotation {ID:${data.id}} With ${annotationData.data.geometries.features.length} Mark(s)?`;
  } else {
    message = `Are You Sure You Want To Delete This Markup {ID:${data.id}}?`;
  }
  $UI.annotPopup.close();
  if (!confirm(message)) return;
  $CAMIC.store
      .deleteMark(data.oid, $D.params.data.slide)
      .then((datas) => {
      // server error
        if (datas.error) {
          const errorMessage = `${datas.text}: ${datas.url}`;
          $UI.message.addError(errorMessage, 4000);
          // close
          return;
        }

        // no data found
        if (!datas.deletedCount || datas.deletedCount < 1) {
          $UI.message.addWarning(`Delete Annotations Failed.`, 4000);
          return;
        }

        const index = $D.humanlayers.findIndex((layer) => layer.id == data.id);

        if (index == -1) return;

        data.index = index;
        const layer = $D.humanlayers[data.index];
        // update UI
        if (Array.isArray(layer.data)) deleteCallbackOld(data, parentType);
        else deleteCallback(data, parentType);
      })
      .catch((e) => {
        $UI.message.addError(e);
        console.error(e);
      })
      .finally(() => {
        console.log('delete end');
      });
}

/**
 * Callback for deleting annotation
 * @param {Object} data
 */
function deleteCallback(data, parentType) {
  // remove overlay
  $D.humanlayers.splice(data.index, 1);
  // update layer manager
  $UI.layersViewer.removeItemById(data.id, 'human', parentType);
  $UI.layersViewerMinor.removeItemById(data.id, 'human', parentType);

  $CAMIC.viewer.omanager.removeOverlay(data.id);
  if ($minorCAMIC && $minorCAMIC.viewer) {
    $minorCAMIC.viewer.omanager.removeOverlay(data.id);
  }
  // update layers Viewer
  // $UI.layersViewer.update();
  // close popup panel
  $UI.annotPopup.close();
}

// for support QUIP2.0 Data model - delete callback
function deleteCallbackOld(data, parentType) {
  const layer = $D.humanlayers[data.index];
  // for support QUIP2.0
  const idx = layer.data.findIndex((d) => d._id.$oid === data.oid);
  if (idx == -1) return;
  layer.data.splice(idx, 1);

  // update layer manager
  $UI.layersViewer.removeItemById(data.id, 'human', parentType);
  $UI.layersViewerMinor.removeItemById(data.id, 'human', parentType);

  // delete entire layer if there is no data.
  if (layer.data.length == 0) {
    $D.humanlayers.splice(data.index, 1);
    $CAMIC.viewer.omanager.removeOverlay(data.id);
    if ($minorCAMIC && $minorCAMIC.viewer) {
      $minorCAMIC.viewer.omanager.removeOverlay(data.id);
    }
  }

  $CAMIC.viewer.omanager.updateView();
  // update layers Viewer
  // $UI.layersViewer.update();
  // close popup panel
  $UI.annotPopup.close();
}

function sortChange(sort) {
  $CAMIC.layersManager.sort(sort);
}

function resetCallback(data) {
  if ($CAMIC.viewer.canvasDrawInstance._path_index === 0) return;
  if (confirm(`Do You Want To Clear Markups?`)) {
    $CAMIC.viewer.canvasDrawInstance.clear();
  }
}

function convertToNormalized(points, size, viewer) {
  const height = Math.round(viewer.imagingHelper.imgHeight);
  const width = Math.round(viewer.imagingHelper.imgWidth);
  // convert
  const normalizedPoints = points.map((p) => [p[0] / width, p[1] / height]);
  const normalizedSize = [size[0] / width, size[0] / height];

  return {
    points: normalizedPoints,
    bound: getBounds(normalizedPoints),
    size: normalizedSize,
  };
}

function convertGeometries(features, data) {
  const {points, bound, size} = convertToNormalized(
      features,
      data.size,
      $CAMIC.viewer,
  );

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          style: {
            color: data.color,
            lineJoin: 'round',
            lineCap: 'round',
            isFill: true,
          },
          size: size,
        },
        geometry: {
          type: 'LineString',
          coordinates: [points],
        },
        bound: {
          type: 'Polygon',
          coordinates: [bound],
        },
      },
    ],
  };
}

/**
 * Callback for saving annotations
 * called from saveAnnotation
 * @param {Object} data
 */
function annoCallback(data) {
  spen.close();
  // is form ok?
  const noteData = $UI.annotOptPanel._form_.value;
  if ($UI.annotOptPanel._action_.disabled || noteData.name == '') {
    // close layer silde
    $UI.toolbar._mainTools[1].querySelector('[type=checkbox]').checked = false;
    $UI.layersSideMenu.close();

    // open app silde
    $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = true;
    $UI.appsSideMenu.open();

    // open annotation list
    // -- START QUIP550 -- //
    // $UI.appsList.triggerContent('annotation','open');
    // -- END QUIP550 -- //
    return;
  }
  // has Path?

  if ($CAMIC.viewer.canvasDrawInstance._path_index === 0) {
    // toast
    $UI.message.addWarning('<i class="small material-icons">info</i> No Markup On Annotation. Try Holding And Dragging.');
    return;
  }

  // Add new lines to notes to prevent overflow

  let str = noteData.notes || '';
  var resultString = '';
  while (typeof str==='string' && str.length > 0) {
    resultString += str.substring(0, 36) + '\n';
    str = str.substring(36);
  }
  noteData.notes = resultString;

  // save
  // provenance
  Loading.open($UI.annotOptPanel.elt, 'Saving Annotation...');
  const execId = randomId();

  const annotJson = {
    creator: getUserId(),
    created_date: new Date(),
    provenance: {
      image: {
        slide: $D.params.slideId,
      },
      analysis: {
        source: 'human',
        execution_id: execId,
        name: noteData.name,
      },
    },
    properties: {
      annotations: noteData,
    },
    geometries: ImageFeaturesToVieweportFeatures(
        $CAMIC.viewer,
        $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection(),
    ),
  };

  // save annotation
  $CAMIC.store
      .addMark(annotJson)
      .then((data) => {
      // server error
        if (data.error) {
          $UI.message.addError(`${data.text}:${data.url}`);
          Loading.close();
          return;
        }

        // no data added
        if (data.count < 1) {
          Loading.close();
          $UI.message.addWarning(`Annotation Save Failed`);
          return;
        }
        // create layer data
        const newItem = {
          id: execId,
          name: noteData.name,
          typeId: 'human',
          typeName: 'human',
          creator: getUserId(),
          shape: annotJson.geometries.features[0].geometry.type,
          data: null,
        };
        $D.humanlayers.push(newItem);
        $UI.layersViewer.addHumanItem(newItem, 'human', 'other');
        $UI.layersViewerMinor.addHumanItem(
            newItem,
            'human',
            'other',
            $minorCAMIC && $minorCAMIC.viewer ? true : false,
        );

        // data for UI
        // return;
        loadAnnotationById(
            $CAMIC,
            $UI.layersViewer.getDataItemById(execId, 'human', 'other'),
            'other',
            saveAnnotCallback,
        );
        if ($minorCAMIC && $minorCAMIC.viewer) {
          loadAnnotationById(
              $minorCAMIC,
              $UI.layersViewerMinor.getDataItemById(execId, 'human', 'other'),
              'other',
              null,
          );
        }
      })
      .catch((e) => {
        Loading.close();
        console.log('save failed', e);
      })
      .finally(() => {});
}

function saveAnnotCallback() {
  /* reset as default */
  // clear draw data and UI
  $CAMIC.viewer.canvasDrawInstance.drawOff();
  $CAMIC.drawContextmenu.off();
  toggleOffDrawBtns();
  $CAMIC.viewer.canvasDrawInstance.clear();
  // uncheck pen draw icon and checkbox
  // $UI.toolbar._subTools[1].querySelector('[type=checkbox]').checked = false;
  // clear form
  $UI.annotOptPanel.clear();

  // close app side
  $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = false;
  $UI.appsSideMenu.close();
  // -- START QUIP550 -- //
  // $UI.appsList.triggerContent('annotation','close');
  // -- END QUIP550 -- //
  // open layer side
  $UI.toolbar._mainTools[1].querySelector('[type=checkbox]').checked = true;
  $UI.layersSideMenu.open();
  // $UI.layersViewer.update();
  $CAMIC.status = null;
}
function algoCallback(data) {
  console.log(data);
}

/**
 * overlayer manager callback function for show or hide
 * @param {Object} data
 */
const heatmapDefaultColor = '#1034a6';

const drawOptionRecord = {};
function getDrawOption() {
  drawOptionRecord.drawMode = $CAMIC.viewer.canvasDrawInstance.drawMode;
  drawOptionRecord.color = $CAMIC.viewer.canvasDrawInstance.style.color;
}
function setDrawOption() {
  $CAMIC.viewer.canvasDrawInstance.drawMode = drawOptionRecord.drawMode || 'free';
  $CAMIC.viewer.canvasDrawInstance.style.color = drawOptionRecord.color || '#7cfc00';
}

function toggleDownloadSelection(data) {
  // const canvasDraw = $CAMIC.viewer.canvasDrawInstance;

  // if(e.checked) {
  //   downloadSelectionOn();
  // } else {
  //   downloadSelectionOff();
  // }
  if (!$CAMIC.viewer.canvasDrawInstance) {
    console.warn('No Draw Tool');
    return;
  }
  if (data.checked) {
    // trun off the main menu
    $UI.layersSideMenu.close();
    if ($CAMIC.status == 'download_selection') {
      downloadSelectionOn();
      return;
    }
    // turn off download SelectionOn
    toolsOff();
    var checkAllToolsOff = setInterval(function() {
      if ($CAMIC && $CAMIC.status == null) {
        // all tool has turn off
        clearInterval(checkAllToolsOff);
        downloadSelectionOn();
      }
    }, 100);
    // turn off magnifier
    // magnifierOff();
  } else {
    downloadSelectionOff();
  }
}


async function callback(data) {
  const viewerName = this.toString();
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      break;
  }

  // return;
  data.forEach(function(d) {
    const item = d.item;
    if (item.typeName == 'ruler') {
      if (!item.data) {
        loadRulerById(camic, d, null);
      } else {
        if (!d.layer) {
          const [xmin, ymin] = item.data.geometries.features[0].geometry.coordinates[0][0];
          const [xmax, ymax] = item.data.geometries.features[0].geometry.coordinates[0][2];
          // create lay and update view
          d.layer = camic.viewer.measureInstance.addRuler({
            id: item.id,
            mode: item.data.properties.mode,
            rect: {
              x: xmin,
              y: ymin,
              width: xmax-xmin,
              height: ymax-ymin,
            },
            innerHTML: item.data.properties.innerHTML,
            isShow: d.isShow,
          });
        }
        if (d.isShow) d.layer.element.style.display ='';
        else d.layer.element.style.display ='none';
      }

      return;
    }

    if (item.typeName == 'segmentation') {
      if (d.isShow) {
        // add
        camic.viewer.segment.addSegmentId(item.id);
      } else {
        // remove
        camic.viewer.segment.removeSegmentId(item.id);
      }
      return;
    }
    if (item.typeName == 'heatmap') {
      if (
        $D.heatMapData &&
        $D.heatMapData.provenance.analysis.execution_id == item.id &&
        camic.viewer.heatmap
      ) {
        // show or hide heatmap
        if (d.isShow) {
          camic.viewer.heatmap.on();
        } else {
          camic.viewer.heatmap.off();
        }
      } else if (
        $D.heatMapData &&
        $D.heatMapData.provenance.analysis.execution_id == item.id
      ) {
        const opt = {
          opacity: 0.65, // inputs[2].value,
          coverOpacity: 0.001,
          data: $D.heatMapData.data,
          // editedData:$D.editedDataClusters,
          mode: 'binal',
          size: $D.heatMapData.provenance.analysis.size,
          fields: $D.heatMapData.provenance.analysis.fields,
          color: heatmapDefaultColor, // inputs[3].value
        };

        if ($D.heatMapData.provenance.analysis.setting) {
          opt.mode = $D.heatMapData.provenance.analysis.setting.mode;
          if ($D.heatMapData.provenance.analysis.setting.field) {
            opt.currentFieldName =
              $D.heatMapData.provenance.analysis.setting.field;
          }
        }
        camic.viewer.createHeatmap(opt);
        if ($D.heatMapData.provenance.analysis.setting &&
          $D.heatMapData.provenance.analysis.setting.mode=='binal') {
          camic.viewer.heatmap.setColor($D.heatMapData.provenance.analysis.setting.colors[0]);
        }
        if ($D.heatMapData.provenance.analysis.setting &&
          $D.heatMapData.provenance.analysis.setting.mode=='gradient') {
          camic.viewer.heatmap.setColors($D.heatMapData.provenance.analysis.setting.colors);
        }
      } else {
        Loading.open(document.body, 'Loading Heatmap Data...');
        // load heatmap
        camic.store
            .getHeatmap($D.params.slideId, item.id)
            .then(function(data) {
              if (Array.isArray(data) && data.length > 0) {
                $D.heatMapData = data[0];
                const opt = {
                  opacity: 0.65, // inputs[2].value,
                  coverOpacity: 0.001,
                  data: $D.heatMapData.data,
                  mode: 'binal',
                  // editedData:$D.editedDataClusters,
                  size: $D.heatMapData.provenance.analysis.size,
                  fields: $D.heatMapData.provenance.analysis.fields,
                  color: heatmapDefaultColor, // inputs[3].value
                };

                if ($D.heatMapData.provenance.analysis.setting) {
                  opt.mode = $D.heatMapData.provenance.analysis.setting.mode;
                  if ($D.heatMapData.provenance.analysis.setting.field) {
                    opt.currentFieldName =
                    $D.heatMapData.provenance.analysis.setting.field;
                  }
                }
                camic.viewer.createHeatmap(opt);
                if ($D.heatMapData.provenance.analysis.setting &&
                  $D.heatMapData.provenance.analysis.setting.mode=='binal') {
                  camic.viewer.heatmap.setColor($D.heatMapData.provenance.analysis.setting.colors[0]);
                }
                if ($D.heatMapData.provenance.analysis.setting &&
                  $D.heatMapData.provenance.analysis.setting.mode=='gradient') {
                  camic.viewer.heatmap.setColors($D.heatMapData.provenance.analysis.setting.colors);
                }
              }
            })
            .catch(function(error) {
            // heatmap schema
              console.error(error);
            })
            .finally(function() {
              Loading.close();
              if (!$D.heatMapData) {
                $UI.message.addError('Loading Heatmap Data Is Error');
              }
            });
      }

      // rest other check box
      const cates =
        viewerName == 'main' ?
          $UI.layersViewer.setting.categoricalData :
          $UI.layersViewerMinor.setting.categoricalData;
      if (d.isShow) {
        for (const key in cates) {
          if (cates.hasOwnProperty(key)) {
            cate = cates[key];
            if (cate.item.name == 'heatmap') {
              cate.items.forEach((i) => {
                if (d !== i && i.isShow) {
                  i.elt.querySelector('input[type=checkbox]').checked = false;
                  i.isShow = false;
                }
              });
            }
          }
        }
      }
      return;
    }

    if (!item.data) {
      // load annotation layer data
      loadAnnotationById(camic, d, null);
    } else {
      if (!d.layer) d.layer = camic.viewer.omanager.addOverlay(item);
      // remove popup if segment is hidden
      if ($UI.annotPopup.data && !d.isShow && $UI.annotPopup.data.id===d.item.id) $UI.annotPopup.close();
      d.layer.isShow = d.isShow;
      camic.viewer.omanager.updateView();
    }
  });
}
function minorCallback(data) {
  console.log(data);
}

function openMinorControlPanel() {
  $UI.layersList.displayContent('left', true, 'head');
  $UI.layersList.triggerContent('left', 'close');
  $UI.layersList.displayContent('right', true);
  $UI.layersList.triggerContent('right', 'open');
}

function closeMinorControlPanel() {
  $UI.layersList.displayContent('left', false, 'head');
  $UI.layersList.triggerContent('left', 'open');
  $UI.layersList.displayContent('right', false);
  $UI.layersList.triggerContent('right', 'close');
}

function loadRulerById(camic, rulerData, callback) {
  const {item, elt} = rulerData;
  $CAMIC.store
      .getMarkByIds([item.id], $D.params.slideId, null, item.typeId)
      .then((data) => {
        // response error
        if (data.error) {
          const errorMessage = `${data.text}: ${data.url}`;
          console.error(errorMessage);
          $UI.message.addError(errorMessage, 4000);
          // delete item form layview
          removeElement($D.rulerlayers, item.id);
          $UI.layersViewer.removeItemById(item.id, 'ruler');
          $UI.layersViewerMinor.removeItemById(item.id, 'ruler');
          return;
        }

        // no data found
        // if(data.length < 1){
        if (!data[0]) {
          console.warn(`Ruler: ${item.name}(${item.id}) doesn't exist.`);
          $UI.message.addWarning(
              `Ruler: ${item.name}(${item.id}) doesn't exist.`,
              4000,
          );
          // delete item form layview
          removeElement($D.rulerlayers, item.id);
          $UI.layersViewer.removeItemById(item.id, 'ruler');
          $UI.layersViewerMinor.removeItemById(item.id, 'ruler');
          return;
        }

        item.data = data[0];
        if (data[0].provenance&&
          data[0].provenance.analysis&&
          data[0].provenance.analysis.coordinate&&
          data[0].provenance.analysis.coordinate == 'image') {
          data[0].geometries = ImageFeaturesToVieweportFeatures(
              camic.viewer,
              data[0].geometries,
          );
        }

        item.data.properties.innerHTML = item.data.properties.innerHTML.split('&lt;').join('<');
        item.data.properties.innerHTML = item.data.properties.innerHTML.split('&gt;').join('>');
        item.data.properties.innerHTML = item.data.properties.innerHTML.split('&nbsp;').join(' ');
        let [xmin, ymin] = item.data.geometries.features[0].geometry.coordinates[0][0];
        let [xmax, ymax] = item.data.geometries.features[0].geometry.coordinates[0][2];

        // create lay and update view
        rulerData.layer = camic.viewer.measureInstance.addRuler({
          id: item.id,
          mode: item.data.properties.mode,
          rect: {
            x: xmin,
            y: ymin,
            width: xmax-xmin,
            height: ymax-ymin,
          },
          innerHTML: item.data.properties.innerHTML,
          isShow: rulerData.isShow,
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        Loading.close();
      });
}
function loadAnnotationById(camic, layerData, parentType, callback) {
  layerData.item.loading = true;
  const item = layerData.item;

  Loading.open(document.body, 'Loading Layers...');

  $CAMIC.store
      .getMarkByIds([item.id], $D.params.slideId, null, item.typeId)
      .then((data) => {
        delete item.loading;

        // response error
        if (data.error) {
          const errorMessage = `${data.text}: ${data.url}`;
          console.error(errorMessage);
          $UI.message.addError(errorMessage, 4000);
          // delete item form layview
          removeElement($D.humanlayers, item.id);
          $UI.layersViewer.removeItemById(item.id, 'human', parentType);
          $UI.layersViewerMinor.removeItemById(item.id, 'human', parentType);
          return;
        }

        // no data found
        // if(data.length < 1){
        if (!data[0]) {
          console.warn(`Annotation: ${item.name}(${item.id}) doesn't exist.`);
          $UI.message.addWarning(
              `Annotation: ${item.name}(${item.id}) doesn't exist.`,
              4000,
          );
          // delete item form layview
          removeElement($D.humanlayers, item.id);
          $UI.layersViewer.removeItemById(item.id, 'human', parentType);
          $UI.layersViewerMinor.removeItemById(item.id, 'human', parentType);
          return;
        }
        // for support quip 2.0 data model
        if (data[0].geometry) {
        // twist them
          var image = camic.viewer.world.getItemAt(0);
          var imgWidth = image.source.dimensions.x;
          var imgHeight = image.source.dimensions.y;
          item.data = data.map((d) => {
            d.geometry.coordinates[0] = d.geometry.coordinates[0].map((point) => {
              return [
                Math.round(point[0] * imgWidth),
                Math.round(point[1] * imgHeight),
              ];
            });
            d.properties = {};
            d.properties.style = {
              color: '#000080',
              lineCap: 'round',
              lineJoin: 'round',
              isFill: false,
            };
            return {
              _id: d._id,
              provenance: d.provenance,
              properties: d.properties,
              geometry: d.geometry,
            };
          });
          // if(item) data[0].isShow = item.isShow;
          item.render = oldAnnoRender;
          item.clickable = false;
          item.hoverable = false;
        } else {
          if (data[0].provenance &&
            data[0].provenance.analysis&&
            (data[0].provenance.analysis.coordinate == undefined||
              data[0].provenance.analysis.coordinate == 'normalized')) {
            data[0].geometries = VieweportFeaturesToImageFeatures(
                camic.viewer,
                data[0].geometries,
            );
          }

          if (data[0].provenance.analysis.isGrid) {
            const width = $CAMIC.viewer.imagingHelper.imgWidth;
            const height = $CAMIC.viewer.imagingHelper.imgHeight;

            const feature = data[0].geometries.features[0];
            const size = feature.properties.size;
            // const points = feature.geometry.coordinates[0];
            // const bounds = feature.bound.coordinates[0];
            feature.properties.size = [
              Math.round(size[0] * width),
              Math.round(size[1] * height),
            ];
          // feature.geometry.coordinates[0] = points.map(p => [
          //   Math.round(p[0] * width),
          //   Math.round(p[1] * height)
          // ]);
          // feature.bound.coordinates[0] = bounds.map(p => [
          //   Math.round(p[0] * width),
          //   Math.round(p[1] * height)
          // ]);
          // item.data = data[0];
          // item.render = annoBrushRender;
          } else {
          // data[0].geometries = VieweportFeaturesToImageFeatures(
          //   camic.viewer,
          //   data[0].geometries
          // );
          // item.data = data[0];
          // item.render = annoRender;
          }

          item.data = data[0];
          item.render = annoRender;
        }

        // create lay and update view
        if (layerData.isShow) {
          layerData.layer = camic.viewer.omanager.addOverlay(item);
          camic.viewer.omanager.updateView();
        }

        if (callback) callback.call(layerData);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        Loading.close();
      });
}

/**
 * Deletes annotation from layer manager view
 * @param {Object} layerData
 */
function removeCallback(layerData, parentType) {
  item = layerData.item;
  if (item.typeName == 'ruler') {
    deleteRulerHandler(item.id);
    return;
  }
  if (item.typeName !== 'human') return;
  if (!item.data) {
    // load layer data
    loadAnnotationById($CAMIC, layerData, parentType, function() {
      annoDelete({
        id: layerData.item.id,
        oid: layerData.item.data._id.$oid,
        annotation: layerData.item.data.properties.annotation,
      }, parentType);
    });
  } else {
    annoDelete({
      id: layerData.item.id,
      oid: layerData.item.data._id.$oid,
      annotation: layerData.item.data.properties.annotation,
    }, parentType);
  }
}

/**
 * Callback for locating annotation on image
 * @param {Object} layerData
 */
function locationCallback(layerData) {
  let isImageViewer = true;
  const item = layerData.item;
  if ((item.typeName !== 'human'&&item.typeName !== 'ruler') || item.data == null) return;
  if (item.typeName == 'ruler') isImageViewer = false;

  // loaction annotation 2.0
  if (Array.isArray(item.data)) {
    let maxx = 0;
    let maxy = 0;
    let minx = Number.POSITIVE_INFINITY;
    let miny = Number.POSITIVE_INFINITY;
    item.data.forEach((d)=>{
      d.geometry.coordinates[0].forEach(([x, y])=>{
        maxx = Math.max(maxx, x);
        maxy = Math.max(maxy, y);
        minx = Math.min(minx, x);
        miny = Math.min(miny, y);
      });
    });
    const bound = [
      [minx, miny],
      [maxx, miny],
      [maxx, maxy],
      [minx, maxy],
      [minx, miny],
    ];
    locateAnnotation(bound, isImageViewer);
    return;
  }
  //  locate annotation 3.0
  if (item.data.geometries.features[0].geometry.type == 'Point') {
    const bound = item.data.geometries.features[0].bound.coordinates;
    const center = $CAMIC.viewer.viewport.imageToViewportCoordinates(
        bound[0],
        bound[1],
    );
    $CAMIC.viewer.viewport.panTo(center);
  } else {
    const bound = [...item.data.geometries.features[0].bound.coordinates[0]];
    if (item.data.provenance&&item.data.provenance.analysis&&item.data.provenance.analysis.isGrid) {
      bound[2] = [bound[2][0] +
        item.data.geometries.features[0].properties.size[0], bound[2][1] +
        item.data.geometries.features[0].properties.size[1]];
    }
    locateAnnotation(bound, isImageViewer);
  }
}

/**
 * Locates annotation on the image
 * called from locationCallback
 * @param {Object} bound
 */
function locateAnnotation(bound, isImageViewer) {
  // if(){

  // }
  const [minx, miny] = bound[0];
  const [maxx, maxy] = bound[2];
  const rectangle = isImageViewer?
  $CAMIC.viewer.viewport.imageToViewportRectangle(
      minx,
      miny,
      maxx - minx,
      maxy - miny,
  ):new OpenSeadragon.Rect(
      minx,
      miny,
      maxx - minx,
      maxy - miny,
  );
  const center = rectangle.getCenter();
  $CAMIC.viewer.viewport.fitBounds(rectangle);

  setTimeout(() => {
    const max = $CAMIC.viewer.cazoomctrlInstance.getMaxImageZoom($CAMIC.viewer);
    const current = $CAMIC.viewer.viewport.viewportToImageZoom(
        $CAMIC.viewer.viewport.getZoom(),
    );
    if (current > max) {
      $CAMIC.viewer.viewport.zoomTo(
          $CAMIC.viewer.viewport.imageToViewportZoom(max),
          center,
      );
    }
  }, 50);
}

/*
    collapsible list
    1. Annotation
    2. Analytics
*/
function getCurrentItem(data) {
  console.log(data);
}
// some fake events callback for demo

function annotationSave() {
  $UI.message.add('Annotation Saved');
}
function algoRun() {
  $UI.message.add('Algo is running...');
}

/**
 * Saves annotation after drawing is stopped
 */
function saveAnnotation() {
  annoCallback.call(null, {
    id:
      $UI.annotOptPanel.setting.formSchemas[$UI.annotOptPanel._select_.value]
          .id,
    data: $UI.annotOptPanel._form_.value,
  });
}

function saveAnalytics() {
  console.log('saveAnalytics');
}
function startDrawing(e) {
  //
  if (
    $UI.toolbar.getSubTool('download_selection') &&
    $UI.toolbar.getSubTool('download_selection').querySelector('input[type=checkbox]')
        .checked
  ) {
    console.log('start download_selection');
    return;
  }

  if (
    $UI.toolbar.getSubTool('preset_label') &&
    $UI.toolbar.getSubTool('preset_label').querySelector('input[type=checkbox]')
        .checked
  ) {
    //     ||
    //   $UI.toolbar.getSubTool("brush").querySelector("input[type=checkbox]")
    //     .checked
    // )
    $CAMIC.viewer.canvasDrawInstance.stop = false;
  } else {
    $CAMIC.viewer.canvasDrawInstance.stop = !$UI.annotOptPanel._form_.isValid();
  }
  //   $CAMIC.viewer.canvasDrawInstance.stop = $UI.toolbar
  //     .getSubTool("preset_label")
  //     .querySelector("input[type=checkbox]").checked
  //     ? false
  //     : !$UI.annotOptPanel._form_.isValid();
  return;
}
function downloadSelection() {
  const chks = $UI.downloadSelectionModal.body.querySelectorAll('input[type=checkbox][name=downloadSelection]:checked');
  if (!chks.length) {
    alert('Please Check Annotation to Download.');
    return;
  }
  //
  const execIds = [];
  chks.forEach((chk)=>execIds.push(chk.dataset.id));
  // get annotation by
  const bbox = $CAMIC.viewer.canvasDrawInstance._draws_data_[0].bound.coordinates[0];
  const height = $CAMIC.viewer.imagingHelper.imgHeight;
  const width = $CAMIC.viewer.imagingHelper.imgWidth;
  const x0 = bbox[0][0]/width;
  const y0 = bbox[0][1]/height;
  const x1 = bbox[2][0]/width;
  const y1 = bbox[2][1]/height;
  //
  $CAMIC.store.getMarkByIds(execIds, $D.params.slideId, null, 'computer', null, x0, x1, y0, y1).then((data)=>{
    const element = document.createElement('a');
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const uri = URL.createObjectURL(blob);
    element.setAttribute('href', uri);
    element.setAttribute('download', `${$D.params.data.name}_${new Date().toISOString()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    hideDownloadSelection();
  });
}

function showDownloadSelection() {
  // get selection area
  const height = $CAMIC.viewer.imagingHelper.imgHeight;
  const width = $CAMIC.viewer.imagingHelper.imgWidth;
  // get annotation by
  const bbox = $CAMIC.viewer.canvasDrawInstance._draws_data_[0].bound.coordinates[0];
  const x0 = bbox[0][0]/width;
  const y0 = bbox[0][1]/height;
  const x1 = bbox[2][0]/width;
  const y1 = bbox[2][1]/height;
  // show up loading
  $UI.downloadSelectionModal.body.innerHTML = 'Loading ...';
  $CAMIC.store.markSegmentationCount($D.params.slideId, x0, x1, y0, y1).then((data)=>{
    if (data&&Array.isArray(data)&&data.length) {
      createSegmentTable(data);
    } else {
      $UI.downloadSelectionModal.body.innerHTML = 'No Data loaded ...';
    }
  });
  $UI.downloadSelectionModal.open();
}
function createSegmentTable(data) {
  $UI.downloadSelectionModal.body.innerHTML = '';
  $UI.downloadSelectionModal.body.innerHTML = `<table style="width:100%;color:#154081;">
<thead>
  <tr>
    <th>Name</th>
    <th>Count</th>
    <th>Download</th>
  </tr>
</thead>
<tbody>
  ${data.sort((a, b)=> b._id - a._id).map((d)=>`<tr>
    <td style="text-align:center;">Segmentation / ${d._id}</td>
    <td style="text-align:center;">${d.count}</td>
    <td style="text-align:center;"><input data-id=${d._id} name='downloadSelection' type='checkbox' checked></td>
  </tr>`).join('')}
</tbody>
</table>`;
}
function hideDownloadSelection() {
  downloadSelectionOff();
  $UI.downloadSelectionModal.close();
}

function stopDrawing(e) {
  if (
    $UI.toolbar.getSubTool('download_selection') &&
    $UI.toolbar.getSubTool('download_selection').querySelector('input[type=checkbox]')
        .checked
  ) {
    //
    showDownloadSelection();
    return;
  }

  // preset label annotation
  if (
    $UI.toolbar.getSubTool('preset_label') &&
    $UI.toolbar.getSubTool('preset_label').querySelector('input[type=checkbox]').checked
  ) {
    // save preset label
    savePresetLabel();
  } else {
    // annotation
    const li = $UI.toolbar.getSubTool('annotation');
    const state = +li.querySelector('label').dataset.state;
    if (
      state === 1 &&
      $CAMIC.viewer.canvasDrawInstance._draws_data_.length > 0
    ) {
      $CAMIC.viewer.canvasDrawInstance.isOn = false;
    }
  }
}

function openHeatmap() {
  switch (ImgloaderMode) {
    case 'iip':
      // hosted
      hostedHeatmap();
      break;
    case 'imgbox':
      // nano borb
      imgboxHeatmap();
      break;
    default:
      // statements_def
      break;
  }
}
function hostedHeatmap() {
  const slide = $D.params.slideId;
  const slideName = $D.params.data.name;
  $CAMIC.store
      .findHeatmapType(slide)
  //
      .then(function(list) {
        if (typeof list === 'undefined') {
          list = [];
        }
        // get heatmap data
        if (!list.length) {
          // No heatmap data
          $UI.message.addWarning(`<i class="small material-icons">info</i> ${slideName} Has No Heatmap Data.`);
          return;
        }
        createHeatMapList(list);
      })
  //
      .catch(function(error) {
        console.error(error);
      })
  //
      .finally(function() {
        if ($D.templates) {
        // load UI
        } else {
        // set message
          $UI.message.addError('HeatmapList');
        }
      });
}

function imgboxHeatmap() {
  let slide = $D.params.id;
  slide = decodeURIComponent(slide);
  // create file input
  var element = document.createElement('input');
  element.setAttribute('type', 'file');
  element.style.display = 'none';
  document.body.appendChild(element);

  element.onchange = function(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
      var text = reader.result;
      try {
        const data = JSON.parse(text);

        var valid = $VALIDATION.heatmap(data);
        if (!valid) {
          alert($VALIDATION.heatmap.errors);
          return;
        }

        $CAMIC.store.clearHeatmaps();

        data.provenance.image.slide = slide;
        const execId = data.provenance.analysis.execution_id;
        Loading.open(document.body, 'Loading Heatmap...');
        $CAMIC.store
            .addHeatmap(data)
            .then((rs) => {
              window.location.href = `../heatmap/heatmap.html${window.location.search}&execId=${execId}`;
            })
            .catch((e) => {
              $UI.message.addError(e);
              console.error(e);
            })
            .finally(() => {
              Loading.close();
            });
      } catch (e) {
        console.error(e);
        Loading.close();
      }
    };
    reader.readAsText(input.files[0]);
  };
  element.click();
  document.body.removeChild(element);
}

function createHeatMapList(list) {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('HeatMap List');
  list.forEach((data) => {
    const execId = data.provenance.analysis.execution_id;
    const a = document.createElement('a');
    const params = getUrlVars();
    a.href = params.mode ?
      `../heatmap/heatmap.html?slideId=${$D.params.slideId}&execId=${execId}&mode=pathdb` :
      `../heatmap/heatmap.html?slideId=${$D.params.slideId}&execId=${execId}`;
    a.textContent = execId;
    $UI.modalbox.body.appendChild(a);
    $UI.modalbox.body.appendChild(document.createElement('br'));
  });
  $UI.modalbox.open();
}


async function addPresetLabelsHandler(label) {
  const rs = await $CAMIC.store.addPresetLabels(label).then((d)=>d.result);

  if (rs.ok&&rs.nModified > 0) {
    $UI.labelsViewer.addLabel(label);
    $UI.message.add(`Label "${label.type}" Has been Added`);
  } else {
    $UI.message.addError('Creating The New Label Has Failed');
  }
  $UI.labelsViewer.__switch('view');
}

async function editPresetLabelsHandler(oldElt, newLabel) {
  Loading.open($UI.labelsViewer.elt, 'Saving Label ...');

  const rs = await $CAMIC.store.updatePresetLabels(oldElt.dataset.id, newLabel).then((d)=>d.result);

  if (rs.ok) {
    // update
    const rs1 = await $CAMIC.store.updateMarksLabel(newLabel.id, newLabel.type).then((d)=>d.result);
    if (rs1.ok) {
      // update UI
      updateMarksLabel(newLabel.id, newLabel.type, $UI.layersViewer);
      updateMarksLabel(newLabel.id, newLabel.type, $UI.layersViewerMinor);

      //
      $UI.labelsViewer.setLabels(oldElt, newLabel);
      $UI.message.add(`Label "${newLabel.type}" Has been Updated`);
      if (oldElt.classList.contains('selected')) drawLabel({value: 'prelabels', checked: true});
    } else {
      $UI.message.addError(`Updating The Marks' Label Has Failed`);
    }
  } else {
    $UI.message.addError('Updating The Label Has Failed');
  }
  Loading.close();
  $UI.labelsViewer.__switch('view');
}
function updateMarksLabel(id, name, layersViewer) {
  const cate = layersViewer.setting.categoricalData.human.items[id];
  if (cate) {
    cate.item.name = name;
    cate.elt.querySelector('label > div').textContent = name;
    cate.elt.querySelector('input[type=checkbox]').dataset.name = name;
    cate.items.forEach((e)=>{
      e.item.name = name;
      e.item.label.name = name;
      const newName = `${name}${e.elt.dataset.id}`;
      e.elt.dataset.title = newName;
      e.elt.querySelector('label > div').textContent = newName;

      if (e.item.data) {
        e.item.data.provenance.analysis.name = name;
        e.item.data.properties.annotations.name = name;
        e.item.data.properties.annotations.notes = name;
      }
    });
  }
}
async function removePresetLabelsHandler(elt, label) {
  const rs = await $CAMIC.store.removePresetLabels(label.id).then((d)=>d.result);
  if (rs.ok&&rs.nModified > 0) {
    $UI.message.add(`Label "${label.type}" Has been removed`);
    $UI.labelsViewer.removeLabel(label.id);
  } else {
    $UI.message.addError(`Deleting The '${label.type}' Label Has Failed`);
  }
}

function selectedPresetLabelsHandler(label) {
  drawLabel({value: 'prelabels', checked: true});
}

function drawLabel(e) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }
  const labels = $UI.labelsViewer.getSelectedLabels();
  if (e.checked) {
    if ($CAMIC.status == 'label') {
      presetLabelOn.call(this, labels);
      return;
    }
    // turn off annotation
    toolsOff();

    var checkAllToolsOff = setInterval(
        function() {
          if ($CAMIC && $CAMIC.status == null) {
          // all tool has turn off
            clearInterval(checkAllToolsOff);
            presetLabelOn.call(this, labels);
          }
        }.bind(this),
        100,
    );
  } else {
    // off preset label
    presetLabelOff();
  }
}

function presetLabelOn(label) {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  // open labels viewer
  mainMenuChange({apps: false, layers: false, labels: true});
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  if (!label) {
    $UI.message.addWarning('No Label Exist. Please Add A Label');
    $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color = '';
    canvasDraw.clear();
    canvasDraw.drawOff();
    return;
  }

  spen.menu(65, 0.2);
  // open menu
  canvasDraw.drawMode = label.mode;
  if (label.mode == 'grid') {
    canvasDraw.size = [parseInt(label.size), parseInt(label.size)];
  }
  canvasDraw.style.color = label.color;
  canvasDraw.drawOn();
  $CAMIC.status = 'label';
  $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color =
    label.color;
}

function presetLabelOff() {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  spen.close();
  // close spen
  if (
    canvasDraw._draws_data_.length &&
    confirm(`Do You Want To Save Annotation Label Before You Leave?`)
  ) {
    savePresetLabel();
  } else {
    canvasDraw.clear();
    canvasDraw.drawOff();
    $UI.appsSideMenu.close();
    $UI.toolbar
        .getSubTool('preset_label')
        .querySelector('input[type=checkbox]').checked = false;
    $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color =
      '';
    $UI.labelsSideMenu.close();
    $CAMIC.status = null;
  }
}

function savePresetLabel() {
  if ($CAMIC.viewer.canvasDrawInstance._path_index === 0) {
    // toast
    $UI.message.addWarning('<i class="small material-icons">info</i>'+
      'No Markup On Annotation. Try Holding And Dragging.', 4000);
    return;
  }
  const data = $UI.labelsViewer.getSelectedLabels();
  if (!data) {
    $UI.message.addWarning('No Label Selected. Please select One.', 4000);
    return;
  }
  const execId = randomId();
  const labelId = data.id;
  const labelName = data.type;
  // const parent = data.type;
  const noteData = {
    id: execId,
    labelId: labelId,
    name: labelName,
    notes: data.type,
  };
  const feature = $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
      .features[0];
  let annotJson;
  if (feature.properties.size) {
    // brush
    const values = getGrids(
        feature.geometry.coordinates[0],
        feature.properties.size,
    );
    const set = new Set();
    values.map((i) => i.toString()).forEach((v) => set.add(v));
    const points = Array.from(set).map((d) => d.split(','));
    annotJson = {
      creator: getUserId(),
      created_date: new Date(),
      provenance: {
        image: {
          slide: $D.params.slideId,
        },
        analysis: {
          source: 'human',
          execution_id: execId, // randomId
          name: labelName, // labelName
          labelId: labelId,
          type: 'label',
          isGrid: true,
        },
      },
      properties: {
        annotations: noteData,
      },
      geometries: convertGeometries(points, {
        note: data.type,
        size: feature.properties.size,
        color: feature.properties.style.color,
      }),
    };
  } else {
    // point / polygon / stringLine
    annotJson = {
      creator: getUserId(),
      created_date: new Date(),
      provenance: {
        image: {
          slide: $D.params.slideId,
        },
        analysis: {
          source: 'human',
          execution_id: execId, // randomId
          name: labelName, // labelName
          labelId: labelId,
          type: 'label',
        },
      },
      properties: {
        annotations: noteData,
      },
      geometries: ImageFeaturesToVieweportFeatures(
          $CAMIC.viewer,
          $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection(),
      ),
    };
  }

  $CAMIC.store
      .addMark(annotJson)
      .then((data) => {
      // server error
        if (data.error) {
          $UI.message.addError(`${data.text}:${data.url}`);
          Loading.close();
          return;
        }

        // no data added
        if (data.count < 1) {
          Loading.close();
          $UI.message.addWarning(`Annotation Save Failed`);
          return;
        }
        const __data = data.ops[0];
        // create layer data
        const newItem = {
          id: execId,
          name: noteData.name,
          typeId: 'human',
          typeName: 'human',
          creator: getUserId(),
          shape: annotJson.geometries.features[0].geometry.type,
          isGrid: annotJson.provenance.analysis.isGrid? true: false,
          label: {
            id: annotJson.provenance.analysis.labelId,
            name: annotJson.provenance.analysis.name,
          },
          data: null,
        };
        $D.humanlayers.push(newItem);
        $UI.layersViewer.addHumanItem(newItem, 'human', labelId);
        $UI.layersViewerMinor.addHumanItem(
            newItem,
            'human',
            labelId,
            $minorCAMIC && $minorCAMIC.viewer ? true : false,
        );

        __data._id = {$oid: __data._id};
        addAnnotation(
            execId,
            __data,
            'human',
            labelId,
        );
      })
      .catch((e) => {
        Loading.close();
        console.log('save failed', e);
      })
      .finally(() => {
        $UI.message.addSmall(`Added The '${noteData.name}' Annotation.`);
      });
}

function addAnnotation(id, data, type, parent) {
  const layerData = $UI.layersViewer.getDataItemById(id, type, parent);
  const layerDataMinor = $UI.layersViewerMinor.getDataItemById(id, type, parent);
  const item = layerData.item;
  data.geometries = VieweportFeaturesToImageFeatures(
      $CAMIC.viewer,
      data.geometries,
  );
  if (data.provenance.analysis.isGrid) {
    const width = $CAMIC.viewer.imagingHelper.imgWidth;
    const height = $CAMIC.viewer.imagingHelper.imgHeight;

    const feature = data.geometries.features[0];
    const size = feature.properties.size;
    feature.properties.size = [
      Math.round(size[0] * width),
      Math.round(size[1] * height),
    ];
  }
  item.data = data;
  item.render = annoRender;
  // create lay and update view
  if (layerData.isShow) {
    layerData.layer = $CAMIC.viewer.omanager.addOverlay(item);
    $CAMIC.viewer.omanager.updateView();
  }
  if ($minorCAMIC && $minorCAMIC.viewer && layerDataMinor.isShow) {
    layerDataMinor.layer = $minorCAMIC.viewer.omanager.addOverlay(item);
    $minorCAMIC.viewer.omanager.updateView();
  }

  $CAMIC.drawContextmenu.off();
  $CAMIC.viewer.canvasDrawInstance.clear();
  // close app side
  $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = false;
  $UI.appsSideMenu.close();
  // $UI.layersViewer.update();
  // $UI.layersViewerMinor.update();
}

function onDeleteRuler(ruler) {
  const id = ruler.element.dataset.id;
  deleteRulerHandler(id);
}

function deleteRulerHandler(execId) {
  if (!confirm(message = `Are You Sure You Want To Delete This Ruler {ID:${execId}}?`)) return;
  $CAMIC.store
      .deleteMarkByExecId(execId, $D.params.data.slide)
      .then((datas) => {
        // server error
        if (datas.error) {
          const errorMessage = `${datas.text}: ${datas.url}`;
          $UI.message.addError(errorMessage, 4000);
          // close
          return;
        }

        // no data found
        if (!datas.deletedCount || datas.deletedCount < 1) {
          $UI.message.addWarning(`Delete Ruler Failed.`, 4000);
          return;
        }
        // update UI
        removeElement($D.rulerlayers, execId);
        $UI.layersViewer.removeItemById(execId, 'ruler');
        $UI.layersViewerMinor.removeItemById(execId, 'ruler');
        $CAMIC.viewer.measureInstance.removeRulerById(execId);
        if ($minorCAMIC &&
          $minorCAMIC.viewer &&
          $minorCAMIC.viewer.measureInstance) {
          $minorCAMIC.viewer.measureInstance.removeRulerById(execId);
        }
        $UI.message.addSmall(`Deleted The '${execId}' Ruler.`);
      })
      .catch((e) => {
        $UI.message.addError(e);
        console.error(e);
      })
      .finally(() => {
        // console.log('delete end');
      });
}


function onAddRuler(ruler) {
  const {x, y, width, height} = ruler.getBounds($CAMIC.viewer.viewport);
  const execId = 'ruler' + randomId();
  ruler.element.dataset.id = execId;
  let innerHTML = ruler.element.innerHTML;
  innerHTML = innerHTML.split('<').join('&lt;');
  innerHTML = innerHTML.split('>').join('&gt;');
  innerHTML = innerHTML.split(' ').join('&nbsp;');
  let rulerJson = {
    creator: getUserId(),
    created_date: new Date(),
    provenance: {
      image: {
        slide: $D.params.slideId,
      },
      analysis: {
        source: 'ruler',
        execution_id: execId,
        name: execId,
        type: 'ruler',
      },
    },
    properties: {
      annotations: {
        name: execId,
        notes: 'ruler',
      },
      mode: ruler.element.dataset.mode,
      innerHTML: innerHTML,
    },
    geometries: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [
                  x,
                  y,
                ],
                [
                  x + width,
                  y,
                ],
                [
                  x + width,
                  y + height,
                ],
                [
                  x,
                  y + height,
                ],
                [
                  x,
                  y,
                ],
              ],
            ],
          },
          bound: {
            type: 'Polygon',
            coordinates: [
              [
                [
                  x,
                  y,
                ],
                [
                  x + width,
                  y,
                ],
                [
                  x + width,
                  y + height,
                ],
                [
                  x,
                  y + height,
                ],
                [
                  x,
                  y,
                ],
              ],
            ],
          },
        },
      ],
    },

  };

  $CAMIC.store
      .addMark(rulerJson)
      .then((data) => {
      // server error
        if (data.error) {
          $UI.message.addError(`${data.text}:${data.url}`);
          return;
        }

        // no data added
        if (data.result && data.result.ok && data.result.n < 1) {
          Loading.close();
          $UI.message.addWarning(`Ruler Save Failed`);
          return;
        }

        const __data = data.ops[0];
        // create layer data
        const newItem = {
          id: execId,
          name: execId,
          typeId: 'ruler',
          typeName: 'ruler',
          data: data.ops[0],
          creator: getUserId(),
        };
        newItem.data.properties.innerHTML = newItem.data.properties.innerHTML.split('&lt;').join('<');
        newItem.data.properties.innerHTML = newItem.data.properties.innerHTML.split('&gt;').join('>');
        newItem.data.properties.innerHTML = newItem.data.properties.innerHTML.split('&nbsp;').join(' ');
        newItem.data._id = {$oid: newItem.data._id};
        $D.rulerlayers.push(newItem);
        $UI.layersViewer.addItem(newItem, 'ruler');
        $UI.layersViewerMinor.addItem(
            newItem,
            'ruler',
            $minorCAMIC && $minorCAMIC.viewer ? true : false,
        );

        const rulerData = $UI.layersViewer.getDataItemById(execId, 'ruler');
        rulerData.layer = $CAMIC.viewer.getOverlayById(ruler.element);

        const rulerDataMinor = $UI.layersViewerMinor.getDataItemById(execId, 'ruler');
        // create lay and update view
        if ($minorCAMIC && $minorCAMIC.viewer && rulerDataMinor.isShow) {
          const [xmin, ymin] = newItem.data.geometries.features[0].geometry.coordinates[0][0];
          const [xmax, ymax] = newItem.data.geometries.features[0].geometry.coordinates[0][2];
          rulerDataMinor.layer = $minorCAMIC.viewer.measureInstance.addRuler({
            id: newItem.id,
            mode: newItem.data.properties.mode,
            rect: {
              x: xmin,
              y: ymin,
              width: xmax-xmin,
              height: ymax-ymin,
            },
            innerHTML: newItem.data.properties.innerHTML,
            isShow: rulerDataMinor.isShow,
          });
        }

        // close app side
        // $UI.layersViewer.update();
        // $UI.layersViewerMinor.update();

        $UI.message.addSmall(`Added The '${execId}' Ruler.`);
      })
      .catch((e) => {
        Loading.close();
        console.log('Ruler Save Failed');
      });
}

async function rootCallback({root, parent, parentName, items}) {
  // start a message
  openLoadStatus(`${root==parent?root:`${root} - ${parentName}`}`);
  //
  const viewerName = this.toString();
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      break;
  }

  parent = parent=='other'?null:parent;
  // human other
  var data;
  // const ids = items.filter(d => d.item.id);
  const ids = items.reduce(function(rs, d) {
    if (!d.item.data) rs.push(d.item.id);
    return rs;
  }, []);
  // loading
  if (ids.length) {
    // mult rulers
    try {
      data = await $CAMIC.store.getMarkByIds(ids, $D.params.slideId, (root=='human'&&parent!==null)?parentName:parent, root);

      if (data.error) { // error
        closeLoadStatus();
        const errorMessage = `${data.text}: ${data.url}`;
        console.error(errorMessage);
        $UI.message.addError(errorMessage, 4000);
        return;
      }
      // covert the ruler data
      if (root == 'ruler') {
        data.forEach((d) => {
          if (d.provenance&&
            d.provenance.analysis&&
            d.provenance.analysis.coordinate&&
            d.provenance.analysis.coordinate == 'image') {
            d.geometries = ImageFeaturesToVieweportFeatures(camic.viewer, d.geometries);
          }

          d.properties.innerHTML = d.properties.innerHTML.split('&lt;').join('<');
          d.properties.innerHTML = d.properties.innerHTML.split('&gt;').join('>');
          d.properties.innerHTML = d.properties.innerHTML.split('&nbsp;').join(' ');
        });
      } else {
        // covert the human data
        data.forEach((d)=>{
          // for support quip 2.0 data model
          if (d.geometry) {
            var image = camic.viewer.world.getItemAt(0);
            var imgWidth = image.source.dimensions.x;
            var imgHeight = image.source.dimensions.y;

            // convert coordinates
            d.geometry.coordinates[0] = d.geometry.coordinates[0].map((point) => {
              return [
                Math.round(point[0] * imgWidth),
                Math.round(point[1] * imgHeight),
              ];
            });
            // set default color
            d.properties = {};
            d.properties.style = {
              color: '#000080',
              lineCap: 'round',
              lineJoin: 'round',
              isFill: false,
            };
          } else {
            // conver coordinate if is `normalized`
            if (d.provenance &&
              d.provenance.analysis&&
              (d.provenance.analysis.coordinate == undefined||
                d.provenance.analysis.coordinate == 'normalized')) {
              d.geometries = VieweportFeaturesToImageFeatures( camic.viewer, d.geometries );
            }
            // if annotaion is brush then covert the size's coordinates
            if (d.provenance.analysis.isGrid) {
              const width = camic.viewer.imagingHelper.imgWidth;
              const height = camic.viewer.imagingHelper.imgHeight;

              const feature = d.geometries.features[0];
              const size = feature.properties.size;
              feature.properties.size = [
                Math.round(size[0] * width),
                Math.round(size[1] * height),
              ];
            }
          }
        });
      }

      // add to layer
    } catch (error) {
      closeLoadStatus();
      // finish loaded
      console.error('loading human annotations error', error);
      $UI.message.addError('loading human annotations error', 4000);
      return;
    }
  }

  if (root == 'ruler') {
    items.forEach((rulerData) => {
      const item = rulerData.item;
      // if no data then find and add to layer
      if (!item.data) {
      // TODO change to things else
        const d = data.find( (d) => d.provenance.analysis.execution_id==item.id);
        item.data = d;
        let [xmin, ymin] = d.geometries.features[0].geometry.coordinates[0][0];
        let [xmax, ymax] = d.geometries.features[0].geometry.coordinates[0][2];
        // create lay and update view
        rulerData.layer = camic.viewer.measureInstance.addRuler({
          id: item.id,
          mode: d.properties.mode,
          rect: {
            x: xmin,
            y: ymin,
            width: xmax-xmin,
            height: ymax-ymin,
          },
          innerHTML: item.data.properties.innerHTML,
          isShow: rulerData.isShow,
        });
      }
      if (rulerData.isShow) rulerData.layer.element.style.display ='';
      else rulerData.layer.element.style.display ='none';
    });
  }

  if (root == 'human') {
    items.forEach((HumanData) => {
      const item = HumanData.item;

      if (!item.data) {
        const d = data.filter( (d) => d.provenance.analysis.execution_id==item.id);
        item.data = d[0].geometry?d:d[0];
        if (Array.isArray(item.data)&&item.data[0].geometry) { // 2.0
          item.render = oldAnnoRender;
          item.clickable = false;
          item.hoverable = false;
        } else {
          item.render = annoRender;
        }
        // HumanData.layer = camic.viewer.omanager.addOverlay(item);
      }
      if (!HumanData.layer) HumanData.layer = camic.viewer.omanager.addOverlay(item);
      HumanData.layer.isShow = HumanData.isShow;
    });

    camic.viewer.omanager.updateView();
  }
  closeLoadStatus();
}

/* Enhance Tool */
function enhance(e) {
  document.querySelector('[title="Enhance"]').previousSibling.checked = true;
  if (!setEnhance) {
    // $UI.message.add('<i class="small material-icons">info</i>On Movement, enhance would be undone', 2000);
    $CAMIC.viewer.addHandler('zoom', unenhance);
    $CAMIC.viewer.addHandler('pan', unenhance);
    setEnhance = true;
  }
  // Canvas information
  const canvas = $CAMIC.viewer.canvas.firstChild;
  const context = canvas.getContext('2d');
  let width = canvas.width; let height = canvas.height;
  var img = context.getImageData(0, 0, width, height);
  var data = img.data;

  if (e.status == 'Histogram Eq') {
    context.putImageData(clahe(img, 64, 0.015), 0, 0);
  } else if (e.status == 'Edge') {
    context.putImageData(edgedetect_sobel(img, 80), 0, 0);
  } else if (e.status == 'Sharpen') {
    var filter = [[-1, -1, -1], [-1, 14, -1], [-1, -1, -1]];
    context.putImageData(applyfilter(img, filter), 0, 0);
  } else if (e.status == 'Custom') {
    var input = prompt('Enter the 2D Kernel: Eg : [[1, 0], [0, 1]]'); var f=0;
    // JSON Parse test
    try {
      var filter = JSON.parse(input); var sz = filter[0].length;
    } catch (e) {
      alert('Invalid Kernel : ' + input);
      return;
    }
    // 2D array check
    for (var r=0; r<filter.length; r++) {
      if (!Array.isArray(filter[r]) || filter[r].length!=sz || sz==0) f=1;
      else {
        for (var c = 0; c<filter[r].length; c++) {
          if (Array.isArray(filter[r][c]))f=1;
        }
      }
    }
    if (f) {
      alert('Invalid Kernel : ' + input);
      return;
    }
    // Apply
    context.putImageData(applyfilter(img, filter), 0, 0);
  }
}
var setEnhance = false;
function unenhance() {
  setEnhance = false;
  $CAMIC.viewer.removeHandler('zoom', unenhance);
  $CAMIC.viewer.removeHandler('pan', unenhance);
  document.querySelector('[title="Enhance"]').previousSibling.checked = false;
}

/* Slide Capture Tool */

async function captureSlide() {
  const canvas = await captureScreen($CAMIC);
  // save as jpeg
  downloadSlideCapture(canvas);
  toolsOff();
  $UI.layersSideMenu.close();
}

function downloadSlideCapture(combiningCanvas) {
  const imageData = combiningCanvas.toDataURL('image/jpeg');
  const downloadLink = document.createElement('a');
  var imgFileName = prompt('Enter filename', 'slideCaptureShot');
  if (imgFileName == null) {
    ;
  } else {
    if (imgFileName === '') {
      imgFileName = 'slideCapture';
    }
    imgFileName += '.jpeg';
    downloadLink.download = imgFileName;
    downloadLink.href = imageData;
    downloadLink.click();
  }
}

/* call back list END */
/* --  -- */
/* -- for render anno_data to canavs -- */
function annoRender(ctx, data) {
  DrawHelper.draw(ctx, data.geometries.features);
}
function oldAnnoRender(ctx, data) {
  DrawHelper.draw(ctx, data);
}
/* --  -- */

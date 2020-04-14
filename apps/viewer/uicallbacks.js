// UI and Core callback and hook
// all functions help the UI and Core part together that makes workflows.

/* UI callback functions list */
function toggleViewerMode(opt) {
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
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

// mainfest
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

  // hide on layersViewer
  $UI.layersViewerMinor.toggleAllItems();
  $UI.layersViewerMinor.setting.data.forEach((d) => delete d.layer);
}

// side menu close callback
function toggleSideMenu(opt) {
  if (!opt.isOpen) {
    const id = opt.target.id.split('_')[1];
    $UI.toolbar.changeMainToolStatus(id, false);
  }
}

// go home callback
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
      let popups = document.getElementById('popup-container');
      if (popups.childElementCount < 2) {
        let popupBox = document.createElement('div');
        popupBox.classList.add('popup-msg', 'slide-in');
        popupBox.innerHTML = `<i class="small material-icons">info</i>
    For more options, right click anywhere on the image`;
        // Add popup box to parent
        popups.insertBefore(popupBox, popups.childNodes[0]);
        setTimeout(function() {
          // popups.lastChild.classList.add('slideOut');
          popups.removeChild(popups.lastChild);
        }, 3000);
      }
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

function drawLabel(e) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }

  if (e.status) {
    if ($CAMIC.status == 'label') {
      presetLabelOn.call(this, {...e.data});
      return;
    }
    // turn off annotation
    toolsOff();

    var checkAllToolsOff = setInterval(
        function() {
          if ($CAMIC && $CAMIC.status == null) {
          // all tool has turn off
            clearInterval(checkAllToolsOff);
            presetLabelOn.call(this, {...e.data});
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
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = label.mode;
  if (label.mode == 'grid') {
    canvasDraw.size = [parseInt(label.size), parseInt(label.size)];
  }
  canvasDraw.style.color = label.color;
  canvasDraw.drawOn();
  $CAMIC.status = 'label';
  $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color =
    label.color;
  // close layers menu
  $UI.layersSideMenu.close();
  rotationOff();
}

function presetLabelOff() {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;

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
    $CAMIC.status = null;
  }
  rotationOn();
}

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

    case 'brush':
      brushOff();
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
      $UI.annotOptPanel._action_.style.display = 'none';
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
  rotationOff();
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
    canvasDraw.clear();
    canvasDraw.drawOff();
    $CAMIC.drawContextmenu.off();
    $UI.appsSideMenu.close();
    toggleOffDrawBtns();
    $CAMIC.status = null;
  }
  rotationOn();
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
// --- Brush Tool ---//
function toggleBrush(d) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }

  //   return;
  if (d.status) {
    // turn on brush label
    // off magnifier
    // magnifierOff();
    // off measurement
    // measurementOff();
    if ($CAMIC.status == 'brush') {
      brushOn.call(this, {...d.data});
      return;
    }
    // turn off annotation
    toolsOff();
    // turn off preset label
    // presetLabelOff();
    var checkAllToolsOff = setInterval(
        function() {
          if ($CAMIC && $CAMIC.status == null) {
          // all tool has turn off
            clearInterval(checkAllToolsOff);
            brushOn.call(this, {...d.data});
          }
        }.bind(this),
        100,
    );
  } else {
    // off preset label
    brushOff();
  }
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

function brushOff() {
  if (!$CAMIC.viewer.canvasDrawInstance) return;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;

  if (
    canvasDraw._draws_data_.length &&
    confirm(`Do You Want To Save Annotation Label Before You Leave?`)
  ) {
    saveBrushLabel(true);
  } else {
    canvasDraw.clear();
    canvasDraw.drawOff();
    $UI.appsSideMenu.close();
    $UI.toolbar
        .getSubTool('brush')
        .querySelector('input[type=checkbox]').checked = false;
    $UI.toolbar.getSubTool('brush').querySelector('label').style.color = '';

    const bctrl = document.getElementById('bctrl');
    bctrl.style.display = 'none';

    $CAMIC.status = null;
  }
}

// --- Measurement Tool ---//
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
      measurementOn();
      return;
    }
    // turn off annotation
    toolsOff();
    var checkAllToolsOff = setInterval(function() {
      if ($CAMIC && $CAMIC.status == null) {
        // all tool has turn off
        clearInterval(checkAllToolsOff);
        measurementOn();
      }
    }, 100);
    // turn off magnifier
    // magnifierOff();
  } else {
    measurementOff();
  }
}

function measurementOn() {
  if (!$CAMIC.viewer.measureInstance) return;
  $CAMIC.viewer.measureInstance.on();
  const li = $UI.toolbar.getSubTool('measurement');
  li.querySelector('input[type=checkbox]').checked = true;
  $CAMIC.status = 'measure';
  rotationOff();
}

function measurementOff() {
  if (!$CAMIC.viewer.measureInstance) return;
  $CAMIC.viewer.measureInstance.off();
  const li = $UI.toolbar.getSubTool('measurement');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
  rotationOn();
}

function rotationOff() {
  const sup = $CAMIC.viewer.rotateBar.txtR.childNodes[1];
  $CAMIC.viewer.rotateBar.txtR.innerHTML = '0';
  $CAMIC.viewer.rotateBar.txtR.appendChild(sup);
  $CAMIC.viewer.rotateBar.range.value = '0';
  $CAMIC.viewer.rotateBar.range.disabled = true;
  $CAMIC.viewer.viewport.setRotation(0);
  $CAMIC.viewer.rotateBar.divElt.style.opacity = 0.5;
}

function rotationOn() {
  $CAMIC.viewer.rotateBar.range.disabled = false;
  $CAMIC.viewer.rotateBar.divElt.style.opacity = 1;
}

// --- toggle magnifier callback ---//
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

function magnifierOn(factor = 1, x = 0, y = 0) {
  if (!$UI.spyglass) return;
  $UI.spyglass.factor = factor;
  $UI.spyglass.open(x, y);
  const li = $UI.toolbar.getSubTool('magnifier');
  li.querySelector('input[type=checkbox]').checked = true;
  $CAMIC.status = 'magnifier';
}

function magnifierOff() {
  if (!$UI.spyglass) return;
  $UI.spyglass.close();
  const li = $UI.toolbar.getSubTool('magnifier');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
}

// image download
function imageDownload(data) {
  // TODO functionality
  alert('Download Image');
  console.log(data);
}

// share url
function shareURL(data) {
  const URL = StatesHelper.getCurrentStatesURL(true);
  window.prompt('Share this link', URL);
}
// main menu changed
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

function annoDelete(data) {
  if (!data.id) return;
  const annotationData = $D.overlayers.find(
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
          $UI.message.addError(errorMessage, 5000);
          // close
          return;
        }

        // no data found
        if (!datas.deletedCount || datas.deletedCount < 1) {
          $UI.message.addWarning(`Delete Annotations Failed.`, 5000);
          return;
        }

        const index = $D.overlayers.findIndex((layer) => layer.id == data.id);

        if (index == -1) return;

        data.index = index;
        const layer = $D.overlayers[data.index];
        // update UI
        if (Array.isArray(layer.data)) deleteCallbackOld(data);
        else deleteCallback(data);
      })
      .catch((e) => {
        $UI.message.addError(e);
        console.error(e);
      })
      .finally(() => {
      // console.log('delete end');
      });
}
function deleteCallback(data) {
  // remove overlay
  $D.overlayers.splice(data.index, 1);
  // update layer manager
  $UI.layersViewer.removeItemById(data.id);
  $UI.layersViewerMinor.removeItemById(data.id);

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
function deleteCallbackOld(data) {
  const layer = $D.overlayers[data.index];
  // for support QUIP2.0
  const idx = layer.data.findIndex((d) => d._id.$oid === data.oid);
  if (idx == -1) return;
  layer.data.splice(idx, 1);

  // delete entire layer if there is no data.
  if (layer.data.length == 0) {
    $D.overlayers.splice(data.index, 1);
    $CAMIC.viewer.omanager.removeOverlay(data.id);
  }

  $CAMIC.viewer.omanager.updateView();
  // update layers Viewer
  $UI.layersViewer.update();
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

function saveBrushLabel(isOff) {
  if ($CAMIC.viewer.canvasDrawInstance._path_index === 0) {
    alert('No Brushed Markup On Annotation.');
    return;
  }
  // get all data
  const features = $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
      .features;

  // merge and reduce duplicated points
  const map = features.reduce(function(map, f) {
    const key = `${f.properties.notes}|${f.properties.size.toString()}|${
      f.properties.style.color
    }`;
    if (!map.has(key)) map.set(key, new Set());
    const set = map.get(key);
    const values = getGrids(f.geometry.coordinates[0], f.properties.size);
    values.map((i) => i.toString()).forEach((v) => set.add(v));
    return map;
  }, new Map());

  // recreate annotation in the required json form
  const annotJsons = [];
  for (var [key, value] of map.entries()) {
    const [note, size, color] = key.split('|');
    const points = Array.from(value).map((d) => d.split(','));

    const execId = note + randomId();
    const noteData = {
      name: execId,
      notes: note,
    };

    annotJsons.push({
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
          type: 'label',
          isGrid: true,
        },
      },
      properties: {
        annotations: noteData,
      },
      geometries: convertGeometries(points, {
        note: note,
        size: size.split(',').map((p) => +p),
        color: color,
      }),
    });
  }

  annotJsons.forEach((annotJson) => {
    $CAMIC.store
        .addMark(annotJson)
        .then((data) => {
        // server error
          if (data.error) {
            $UI.message.addWarning(`${data.text}:${data.url}`);
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
          const execId = annotJson.provenance.analysis.execution_id;
          const newItem = {
            id: execId,
            name: annotJson.provenance.analysis.name,
            typeId: typeIds['human'],
            typeName: 'human',
            data: null,
          };
          $D.overlayers.push(newItem);
          $UI.layersViewer.addItem(newItem);
          $UI.layersViewerMinor.addItem(
              newItem,
          $minorCAMIC && $minorCAMIC.viewer ? true : false,
          );

          // console.log($D.overlayers);
          // data for UI
          // return;
          loadAnnotationById(
              $CAMIC,
              $UI.layersViewer.getDataItemById(execId),
              saveBrushAnnotCallback.bind(isOff),
          );
          if ($minorCAMIC && $minorCAMIC.viewer) {
            loadAnnotationById(
                $minorCAMIC,
                $UI.layersViewerMinor.getDataItemById(execId),
                null,
            );
          }
        })
        .catch((e) => {
          Loading.close();
          console.log('save failed');
        })
        .finally(() => {});
  });
}

function savePresetLabel() {
  if ($CAMIC.viewer.canvasDrawInstance._path_index === 0) {
    alert('No Markup On Annotation. Try holding and dragging.');
    return;
  }
  // save
  const data = $UI.toolbar
      .getSubTool('preset_label')
      .querySelector('li.leaf.checked').dataset;
  const execId = data.type + randomId();
  const noteData = {
    name: execId,
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
          execution_id: execId,
          name: noteData.name,
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
          execution_id: execId,
          name: noteData.name,
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
          $UI.message.addWarning(`${data.text}:${data.url}`);
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
          typeId: typeIds['human'],
          typeName: 'human',
          data: null,
        };
        $D.overlayers.push(newItem);
        $UI.layersViewer.addItem(newItem);
        $UI.layersViewerMinor.addItem(
            newItem,
        $minorCAMIC && $minorCAMIC.viewer ? true : false,
        );

        // data for UI
        // return;
        loadAnnotationById(
            $CAMIC,
            $UI.layersViewer.getDataItemById(execId),
            saveLabelAnnotCallback,
        );
        if ($minorCAMIC && $minorCAMIC.viewer) {
          loadAnnotationById(
              $minorCAMIC,
              $UI.layersViewerMinor.getDataItemById(execId),
              null,
          );
        }
      })
      .catch((e) => {
        Loading.close();
        console.log('save failed');
      })
      .finally(() => {});
}

function saveBrushAnnotCallback() {
  /* reset as default */
  // clear draw data and UI
  // $CAMIC.viewer.canvasDrawInstance.drawOff();
  $CAMIC.drawContextmenu.off();
  $CAMIC.viewer.canvasDrawInstance.clear();
  // close app side
  $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = false;
  $UI.appsSideMenu.close();
  // $UI.toolbar._mainTools[1].querySelector('[type=checkbox]').checked = true;
  // $UI.layersSideMenu.open();
  $UI.layersViewer.update();

  if (this == true) {
    // isOff
    $UI.toolbar
        .getSubTool('brush')
        .querySelector('input[type=checkbox]').checked = false;
    $UI.toolbar.getSubTool('brush').querySelector('label').style.color = '';

    const bctrl = document.getElementById('bctrl');
    bctrl.style.display = 'none';
    $CAMIC.status = null;
  }
}

function saveLabelAnnotCallback() {
  /* reset as default */
  // clear draw data and UI
  // $CAMIC.viewer.canvasDrawInstance.drawOff();
  $CAMIC.drawContextmenu.off();
  $CAMIC.viewer.canvasDrawInstance.clear();
  // close app side
  $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = false;
  $UI.appsSideMenu.close();
  // $UI.toolbar._mainTools[1].querySelector('[type=checkbox]').checked = true;
  // $UI.layersSideMenu.open();
  $UI.layersViewer.update();
  // $CAMIC.status = null;
}

function annoCallback(data) {
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
    alert('No Markup On Annotation. Try holding and dragging.');
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
          $UI.message.addWarning(`${data.text}:${data.url}`);
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
          typeId: typeIds['human'],
          typeName: 'human',
          data: null,
        };
        $D.overlayers.push(newItem);
        $UI.layersViewer.addItem(newItem);
        $UI.layersViewerMinor.addItem(
            newItem,
        $minorCAMIC && $minorCAMIC.viewer ? true : false,
        );

        // data for UI
        // return;
        loadAnnotationById(
            $CAMIC,
            $UI.layersViewer.getDataItemById(execId),
            saveAnnotCallback,
        );
        if ($minorCAMIC && $minorCAMIC.viewer) {
          loadAnnotationById(
              $minorCAMIC,
              $UI.layersViewerMinor.getDataItemById(execId),
              null,
          );
        }
      })
      .catch((e) => {
        Loading.close();
        console.log('save failed');
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
  $UI.layersViewer.update();
  $CAMIC.status = null;
}
function algoCallback(data) {
  console.log(data);
}

// overlayer manager callback function for show or hide
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

  data.forEach(function(d) {
    const item = d.item;
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
          color: '#1034A6', // inputs[3].value
        };

        if ($D.heatMapData.provenance.analysis.setting) {
          opt.mode = $D.heatMapData.provenance.analysis.setting.mode;
          if ($D.heatMapData.provenance.analysis.setting.field) {
            opt.currentFieldName =
              $D.heatMapData.provenance.analysis.setting.field;
          }
        }
        camic.viewer.createHeatmap(opt);
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
                  color: '#1034A6', // inputs[3].value
                };

                if ($D.heatMapData.provenance.analysis.setting) {
                  opt.mode = $D.heatMapData.provenance.analysis.setting.mode;
                  if ($D.heatMapData.provenance.analysis.setting.field) {
                    opt.currentFieldName =
                    $D.heatMapData.provenance.analysis.setting.field;
                  }
                }
                camic.viewer.createHeatmap(opt);
              }
            })
            .catch(function(error) {
            // heatmap schema
              console.error(error);
            })
            .finally(function() {
              Loading.close();
              if ($D.overlayers) {
              } else {
              // set message
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
      // load layer data
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

function loadAnnotationById(camic, layerData, callback) {
  layerData.item.loading = true;
  const item = layerData.item;

  Loading.open(document.body, 'Loading Layers...');

  $CAMIC.store
      .getMarkByIds([item.id], $D.params.slideId)
      .then((data) => {
        delete item.loading;

        // response error
        if (data.error) {
          const errorMessage = `${data.text}: ${data.url}`;
          console.error(errorMessage);
          $UI.message.addError(errorMessage, 5000);
          // delete item form layview
          removeElement($D.overlayers, item.id);
          $UI.layersViewer.removeItemById(item.id);
          $UI.layersViewerMinor.removeItemById(item.id);
          return;
        }

        // no data found
        // if(data.length < 1){
        if (!data[0]) {
          console.warn(`Annotation: ${item.name}(${item.id}) doesn't exist.`);
          $UI.message.addWarning(
              `Annotation: ${item.name}(${item.id}) doesn't exist.`,
              5000,
          );
          // delete item form layview
          removeElement($D.overlayers, item.id);
          $UI.layersViewer.removeItemById(item.id);
          $UI.layersViewerMinor.removeItemById(item.id);
          return;
        }
        // for support quip 2.0 data model
        if (data[0].geometry) {
        // twist them
          var image = camic.viewer.world.getItemAt(0);
          this.imgWidth = image.source.dimensions.x;
          this.imgHeight = image.source.dimensions.y;
          item.data = data.map((d) => {
            d.geometry.coordinates[0] = d.geometry.coordinates[0].map((point) => {
              return [
                Math.round(point[0] * imgWidth),
                Math.round(point[1] * imgHeight),
              ];
            });
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
          data[0].geometries = VieweportFeaturesToImageFeatures(
              camic.viewer,
              data[0].geometries,
          );
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

// delete annotation from layer manager view
function removeCallback(layerData) {
  item = layerData.item;
  if (item.typeName !== 'human') return;
  if (!item.data) {
    // load layer data
    loadAnnotationById($CAMIC, layerData, function() {
      annoDelete({
        id: layerData.item.id,
        oid: layerData.item.data._id.$oid,
        annotation: layerData.item.data.properties.annotation,
      });
    });
  } else {
    annoDelete({
      id: layerData.item.id,
      oid: layerData.item.data._id.$oid,
      annotation: layerData.item.data.properties.annotation,
    });
  }
}

function locationCallback(layerData) {
  item = layerData.item;
  if (item.typeName !== 'human' || item.data == null) return;
  if (item.data.geometries.features[0].geometry.type == 'Point') {
    const bound = item.data.geometries.features[0].bound.coordinates;
    const center = $CAMIC.viewer.viewport.imageToViewportCoordinates(
        bound[0],
        bound[1],
    );
    $CAMIC.viewer.viewport.panTo(center);
  } else {
    const bound = item.data.geometries.features[0].bound.coordinates[0];
    locateAnnotation(bound);
  }
}

function locateAnnotation(bound) {
  // if(){

  // }
  const [minx, miny] = bound[0];
  const [maxx, maxy] = bound[2];
  const rectangle = $CAMIC.viewer.viewport.imageToViewportRectangle(
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
function stopDrawing(e) {
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
      saveAnnotation();
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
          alert(`${slideName} Has No Heatmap Data.`);
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
/* call back list END */
/* --  -- */
/* -- for render anno_data to canavs -- */
function annoRender(ctx, data) {
  const imagingHelper = this.viewer.imagingHelper;
  ctx._lw =
    (imagingHelper.physicalToDataX(1) - imagingHelper.physicalToDataX(0)) >> 0;
  ctx.radius =
    (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >> 0;
  DrawHelper.draw(ctx, data.geometries.features);
}
function oldAnnoRender(ctx, data) {
  const lineWidth =
    (imagingHelper.physicalToDataX(1) - imagingHelper.physicalToDataX(0)) >> 0;
  ctx.lineWidth = lineWidth;
  DrawHelper.draw(ctx, data);
}
function annoBrushRender(ctx, data) {
  caDrawHelper.prototype.drawBrushGrids(ctx, data.geometries.features[0]);
}
/* --  -- */

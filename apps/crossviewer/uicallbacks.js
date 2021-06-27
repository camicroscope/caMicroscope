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
 * Deletes annotation from layer manager view
 * @param {Object} layerData
 * @param {Object} parentType
 * @param {String} viewerName
 */

function removeCallback(layerData, parentType, viewerName) {
  item = layerData.item;
  if (item.typeName == 'ruler') {
    deleteRulerHandler(item.id, viewerName);
    console.log(`Ruler Delete from ${viewerName} Layers Manager Callback`);
    return;
  }
  if (item.typeName !== 'human') return;
  if (!item.data) {
    // load layer data
    switch (viewerName) {
      case 'main':
        loadAnnotationById($CAMIC, layerData, parentType, function() {
          annoDelete({
            id: layerData.item.id,
            oid: layerData.item.data._id.$oid,
            annotation: layerData.item.data.properties.annotation,
          }, parentType, 'main');
        }, $D.params.main, 'main');
        break;
      case 'minor':
        loadAnnotationById($minorCAMIC, layerData, parentType, function() {
          annoDelete({
            id: layerData.item.id,
            oid: layerData.item.data._id.$oid,
            annotation: layerData.item.data.properties.annotation,
          }, parentType, 'minor');
        }, $D.params.minor, 'minor');
        break;
      default:
        console.error('Viewer Name not specified in removeCallBack function');
    }
  } else {
    switch (viewerName) {
      case 'main':
        annoDelete({
          id: layerData.item.id,
          oid: layerData.item.data._id.$oid,
          annotation: layerData.item.data.properties.annotation,
        }, parentType, 'main');
        break;
      case 'minor':
        annoDelete({
          id: layerData.item.id,
          oid: layerData.item.data._id.$oid,
          annotation: layerData.item.data.properties.annotation,
        }, parentType, 'minor');
        break;
      default:
        console.error('Viewer Name not specified in removeCallBack funciton');
    }
  }
}

/**
 * Callback for locating annotation on image
 * @param {Object} layerData
 */

function locationCallback(layerData, viewerName) {
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name is not specified while calling the function locationCallBack');
      break;
  }
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
    locateAnnotation(bound, isImageViewer, camic);
    return;
  }
  //  locate annotation 3.0
  if (item.data.geometries.features[0].geometry.type == 'Point') {
    const bound = item.data.geometries.features[0].bound.coordinates;
    const center = camic.viewer.viewport.imageToViewportCoordinates(
        bound[0],
        bound[1],
    );
    camic.viewer.viewport.panTo(center);
  } else {
    const bound = [...item.data.geometries.features[0].bound.coordinates[0]];
    if (item.data.provenance&&item.data.provenance.analysis&&item.data.provenance.analysis.isGrid) {
      bound[2] = [bound[2][0] +
          item.data.geometries.features[0].properties.size[0], bound[2][1] +
          item.data.geometries.features[0].properties.size[1]];
    }
    locateAnnotation(bound, isImageViewer, camic);
  }
}

/**
 * Locates annotation on the image
 * called from locationCallback{Main/Minor}
 * @param {Object} bound
 */
function locateAnnotation(bound, isImageViewer, camic) {
  // if(){

  // }
  const [minx, miny] = bound[0];
  const [maxx, maxy] = bound[2];
  const rectangle = isImageViewer?
    camic.viewer.viewport.imageToViewportRectangle(
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
  camic.viewer.viewport.fitBounds(rectangle);

  setTimeout(() => {
    const max = camic.viewer.cazoomctrlInstance.getMaxImageZoom(camic.viewer);
    const current = camic.viewer.viewport.viewportToImageZoom(
        camic.viewer.viewport.getZoom(),
    );
    if (current > max) {
      camic.viewer.viewport.zoomTo(
          camic.viewer.viewport.imageToViewportZoom(max),
          center,
      );
    }
  }, 50);
}

/**
 * overlayer manager callback function for show or hide
 * @param {Object} data
*/
const heatmapDefaultColor = '#1034a6';
async function callback(data) {
  const viewerName = this.toString();
  let slideId = null;
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      slideId = $D.params.main;
      break;
    case 'minor':
      camic = $minorCAMIC;
      slideId = $D.params.minor;
      break;
    default:
      break;
  }
  // console.log(data)

  // return;
  data.forEach(function(d) {
    const item = d.item;
    if (item.typeName == 'ruler') {
      if (!item.data) {
        loadRulerById(camic, d, null, slideId);
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
      if ( $D.heatMapData &&
         (($D.heatMapData.main &&
         $D.heatMapData.main.provenance.analysis.execution_id == item.id) ||
         ($D.heatMapData.minor &&
            $D.heatMapData.minor.provenance.analysis.execution_id == item.id)) &&
         camic.viewer.heatmap
      ) {
        // show or hide heatmap
        if (d.isShow) {
          camic.viewer.heatmap.on();
        } else {
          camic.viewer.heatmap.off();
        }
      } else if ($D.heatMapData &&
         (($D.heatMapData.main &&
         $D.heatMapData.main.provenance.analysis.execution_id == item.id) ||
         ($D.heatMapData.minor &&
           $D.heatMapData.minor.provenance.analysis.execution_id == item.id))
      ) {
        let tempHeatMapData = null;
        switch (viewerName) {
          case 'main':
            tempHeatMapData = $D.heatMapData.main;
            break;
          case 'minor':
            tempHeatMapData = $D.heatMapData.minor;
            break;
          default:
            break;
        }
        const opt = {
          opacity: 0.65, // inputs[2].value,
          coverOpacity: 0.001,
          data: tempHeatMapData.data,
          // editedData:$D.editedDataClusters,
          mode: 'binal',
          size: tempHeatMapData.provenance.analysis.size,
          fields: tempHeatMapData.provenance.analysis.fields,
          color: heatmapDefaultColor, // inputs[3].value
        };

        if (tempHeatMapData.provenance.analysis.setting) {
          opt.mode = tempHeatMapData.provenance.analysis.setting.mode;
          if (tempHeatMapData.provenance.analysis.setting.field) {
            opt.currentFieldName =
             tempHeatMapData.provenance.analysis.setting.field;
          }
        }
        camic.viewer.createHeatmap(opt);
        if (tempHeatMapData.provenance.analysis.setting &&
            tempHeatMapData.provenance.analysis.setting.mode=='binal') {
          camic.viewer.heatmap.setColor(tempHeatMapData.provenance.analysis.setting.colors[0]);
        }
        if (tempHeatMapData.provenance.analysis.setting &&
            tempHeatMapData.provenance.analysis.setting.mode=='gradient') {
          camic.viewer.heatmap.setColors(tempHeatMapData.provenance.analysis.setting.colors);
        }
      } else {
        Loading.open(document.body, 'Loading Heatmap Data...');
        // load heatmap
        let PromiseHeatMapData = null;
        switch (viewerName) {
          case 'main':
            PromiseHeatMapData = camic.store.getHeatmap($D.params.main, item.id);
            break;
          case 'minor':
            PromiseHeatMapData = camic.store.getHeatmap($D.params.minor, item.id);
            break;
          default:
            break;
        }
        PromiseHeatMapData.then(function(data) {
          if (Array.isArray(data) && data.length > 0) {
            let tempHeatMapData = null;
            $D.heatMapData = {};
            switch (viewerName) {
              case 'main':
                $D.heatMapData.main = data[0];
                tempHeatMapData = data[0];
                break;
              case 'minor':
                $D.heatMapData.minor = data[0];
                tempHeatMapData = data[0];
                break;
              default:
                break;
            }
            const opt = {
              opacity: 0.65, // inputs[2].value,
              coverOpacity: 0.001,
              data: tempHeatMapData.data,
              mode: 'binal',
              // editedData:$D.editedDataClusters,
              size: tempHeatMapData.provenance.analysis.size,
              fields: tempHeatMapData.provenance.analysis.fields,
              color: heatmapDefaultColor, // inputs[3].value
            };

            if (tempHeatMapData.provenance.analysis.setting) {
              opt.mode = tempHeatMapData.provenance.analysis.setting.mode;
              if (tempHeatMapData.provenance.analysis.setting.field) {
                opt.currentFieldName =
                     tempHeatMapData.provenance.analysis.setting.field;
              }
            }
            camic.viewer.createHeatmap(opt);
            if (tempHeatMapData.provenance.analysis.setting &&
                    tempHeatMapData.provenance.analysis.setting.mode=='binal') {
              camic.viewer.heatmap.setColor(tempHeatMapData.provenance.analysis.setting.colors[0]);
            }
            if (tempHeatMapData.provenance.analysis.setting &&
                    tempHeatMapData.provenance.analysis.setting.mode=='gradient') {
              camic.viewer.heatmap.setColors(tempHeatMapData.provenance.analysis.setting.colors);
            }
          }
        })
            .catch(function(error) {
              // heatmap schema
              console.error(error);
            })
            .finally(function() {
              Loading.close();
              switch (viewerName) {
                case 'main':
                  if (!$D.heatMapData.main) {
                    $UI.message.addError('Loading Heatmap Data Is Error');
                  }
                  break;
                case 'minor':
                  if (!$D.heatMapData.minor) {
                    $UI.message.addError('Loading Heatmap Data Is Error');
                  }
                  break;
                default:
                  break;
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
      loadAnnotationById(camic, d, null, null, slideId, viewerName);
    } else {
      if (!d.layer) d.layer = camic.viewer.omanager.addOverlay(item);
      // remove popup if segment is hidden
      if (viewerName === 'main' && $UI.annotPopupMain.data && !d.isShow && $UI.annotPopupMain.data.id===d.item.id) {
        $UI.annotPopupMain.close();
      }
      if (viewerName === 'minor' && $UI.annotPopupMinor.data && !d.isShow && $UI.annotPopupMinor.data.id===d.item.id) {
        $UI.annotPopupMinor.close();
      }
      d.layer.isShow = d.isShow;
      camic.viewer.omanager.updateView();
    }
  });
}

async function rootCallback({root, parent, items}) {
  // start a message
  openLoadStatus(`${root==parent?root:`${root} - ${parent}`}`);
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
      switch (viewerName) {
        case 'main':
          data = await $CAMIC.store.getMarkByIds(ids, $D.params.main, parent, root);
          break;
        case 'minor':
          data = await $CAMIC.store.getMarkByIds(ids, $D.params.minor, parent, root);
          break;
        default:
          break;
      }

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
    console.log(items);
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

/* call back list END */
/* --  -- */
/* -- for render anno_data to canavs -- */
function annoRender(ctx, data) {
  DrawHelper.draw(ctx, data.geometries.features);
}

function oldAnnoRender(ctx, data) {
  DrawHelper.draw(ctx, data);
}

function loadRulerById(camic, rulerData, callback, slideId) {
  const {item, elt} = rulerData;
  camic.store
      .getMarkByIds([item.id], slideId, null, item.typeId)
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

/**
 * Saves annotation after drawing is stopped. Separate callbacks for main and minor viewer
 */

function saveAnnotation(viewerName) {
  switch (viewerName) {
    case 'main':
      annoCallback.call(null, {
        id:
          $UI.annotOptPanel.setting.formSchemas[$UI.annotOptPanel._select_.value]
              .id,
        data: $UI.annotOptPanel._form_.value,
      }, 'main');
      break;
    case 'minor':
      annoCallback.call(null, {
        id:
          $UI.annotOptPanel.setting.formSchemas[$UI.annotOptPanel._select_.value]
              .id,
        data: $UI.annotOptPanel._form_.value,
      }, 'minor');
      break;
    default:
      console.error('Viewer Name not specified while calling the funciton saveAnnotation');
      break;
  }
}

// function saveAnnotationMain() {

// }
// function saveAnnotationMinor() {

// }

/**
 * Callback for saving annotations
 * called from saveAnnotation
 * @param {Object} data
 * @param {String} viewerName
 */
function annoCallback(data, viewerName) {
  if (viewerName === 'check') {
    if ($CAMIC.status == 'normal') {
      viewerName = 'main';
    } else if ($minorCAMIC.status == 'normal') {
      viewerName = 'minor';
    }
  }

  let noteData = null;
  switch (viewerName) {
    case 'main':
      noteData = $UI.annotOptPanel._form_.value;
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
      break;
    case 'minor':
      noteData = $UI.annotOptPanel._form_.value;
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
      break;
    default:
      console.error('Viewer Name not specified while calling annoCallBack funciton');
      return;
  }
  // is form ok?

  // has Path?

  if (viewerName === 'main' && $CAMIC.viewer.canvasDrawInstance._path_index === 0) {
    // toast
    $UI.message.addWarning('<i class="small material-icons">info</i> No Markup On Annotation. Try Holding And Dragging.');
    return;
  }
  if (viewerName === 'minor' && $minorCAMIC.viewer.canvasDrawInstance._path_index === 0) {
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

  const execId = randomId();

  let camic = null;
  let slideId = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      slideId = $D.params.main;
      Loading.open($UI.annotOptPanel.elt, 'Saving Annotation...');
      break;
    case 'minor':
      camic = $minorCAMIC;
      slideId = $D.params.minor;
      Loading.open($UI.annotOptPanel.elt, 'Saving Annotation...');
      break;
    default:
      console.error('Viewer Name not specified while calling the funciton annoCallBack');
      break;
  }

  const annotJson = {
    creator: getUserId(),
    created_date: new Date(),
    provenance: {
      image: {
        slide: slideId,
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
        camic.viewer,
        camic.viewer.canvasDrawInstance.getImageFeatureCollection(),
    ),
  };

  // save annotation
  camic.store
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

        switch (viewerName) {
          case 'main':
            $D.humanlayers.main.push(newItem);
            $UI.layersViewer.addHumanItem(newItem, 'human', 'other');
            loadAnnotationById(
                $CAMIC,
                $UI.layersViewer.getDataItemById(execId, 'human', 'other'),
                'other',
                function() {
                  saveAnnotCallback('main');
                },
                slideId,
                viewerName,
            );
            break;
          case 'minor':
            $D.humanlayers.minor.push(newItem);
            $UI.layersViewerMinor.addHumanItem(newItem, 'human', 'other');
            loadAnnotationById(
                $minorCAMIC,
                $UI.layersViewerMinor.getDataItemById(execId, 'human', 'other'),
                'other',
                function() {
                  saveAnnotCallback('minor');
                },
                slideId,
                viewerName,
            );
            break;
        }

        //   $D.humanlayers.push(newItem);
        //   $UI.layersViewer.addHumanItem(newItem, 'human', 'other');
        //   $UI.layersViewerMinor.addHumanItem(
        //       newItem,
        //       'human',
        //       'other',
        //       $minorCAMIC && $minorCAMIC.viewer ? true : false,
        //   );

        // data for UI
        // return;
        //   loadAnnotationById(
        //       $CAMIC,
        //       $UI.layersViewer.getDataItemById(execId, 'human', 'other'),
        //       'other',
        //       saveAnnotCallback,
        //   );
        //   if ($minorCAMIC && $minorCAMIC.viewer) {
        //     loadAnnotationById(
        //         $minorCAMIC,
        //         $UI.layersViewerMinor.getDataItemById(execId, 'human', 'other'),
        //         'other',
        //         null,
        //     );
        //   }
      })
      .catch((e) => {
        Loading.close();
        console.log('save failed', e);
      })
      .finally(() => {});
}

function loadAnnotationById(camic, layerData, parentType, callback, slideId, viewerName) {
  layerData.item.loading = true;
  const item = layerData.item;

  Loading.open(document.body, 'Loading Layers...');

  camic.store
      .getMarkByIds([item.id], slideId, null, item.typeId)
      .then((data) => {
        delete item.loading;

        // response error
        if (data.error) {
          const errorMessage = `${data.text}: ${data.url}`;
          console.error(errorMessage);
          $UI.message.addError(errorMessage, 4000);
          // delete item form layview
          switch (viewerName) {
            case 'main':
              removeElement($D.humanlayers.main, item.id);
              $UI.layersViewer.removeItemById(item.id, 'human', parentType);
              break;
            case 'minor':
              removeElement($D.humanlayers.minor, item.id);
              $UI.layersViewerMinor.removeItemById(item.id, 'human', parentType);
          }
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
          switch (viewerName) {
            case 'main':
              removeElement($D.humanlayers.main, item.id);
              $UI.layersViewer.removeItemById(item.id, 'human', parentType);
              break;
            case 'minor':
              removeElement($D.humanlayers.minor, item.id);
              $UI.layersViewerMinor.removeItemById(item.id, 'human', parentType);
          }
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
            const width = camic.viewer.imagingHelper.imgWidth;
            const height = camic.viewer.imagingHelper.imgHeight;

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
 * Deletes the annotation with given data
 * called from removeCallback
 * @param {Object} data
 */

function annoDelete(data, parentType, viewerName) {
  if (!data.id) return;

  let annotationData = null;
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      annotationData = $D.humanlayers.main.find(
          (d) => d.data && d.data._id.$oid == data.oid,
      );
      break;
    case 'minor':
      camic = $minorCAMIC;
      annotationData = $D.humanlayers.minor.find(
          (d) => d.data && d.data._id.$oid == data.oid,
      );
      break;
    default:
      console.error('Viewer Name not specified while calling annoDelete function');
      break;
  }
  let message;
  if (annotationData.data.geometries) {
    message = `Are You Sure You Want To Delete This Annotation {ID:${data.id}} With ${annotationData.data.geometries.features.length} Mark(s)?`;
  } else {
    message = `Are You Sure You Want To Delete This Markup {ID:${data.id}}?`;
  }
  switch (viewerName) {
    case 'main':
      $UI.annotPopupMain.close();
      break;
    case 'minor':
      $UI.annotPopupMinor.close();
      break;
  }
  if (!confirm(message)) return;
  switch (viewerName) {
    case 'main':
      camic.store
          .deleteMark(data.oid, $D.params.mainData.slide)
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

            const index = $D.humanlayers.main.findIndex((layer) => layer.id == data.id);

            if (index == -1) return;

            data.index = index;
            const layer = $D.humanlayers.main[data.index];
            // update UI
            if (Array.isArray(layer.data)) deleteCallbackOld(data, parentType, 'main');
            else deleteCallback(data, parentType, 'main');
          })
          .catch((e) => {
            $UI.message.addError(e);
            console.error(e);
          })
          .finally(() => {
            console.log('delete end');
          });
      break;
    case 'minor':
      camic.store
          .deleteMark(data.oid, $D.params.minorData.slide)
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

            const index = $D.humanlayers.minor.findIndex((layer) => layer.id == data.id);

            if (index == -1) return;

            data.index = index;
            const layer = $D.humanlayers.minor[data.index];
            // update UI
            if (Array.isArray(layer.data)) deleteCallbackOld(data, parentType, 'minor');
            else deleteCallback(data, parentType, 'minor');
          })
          .catch((e) => {
            $UI.message.addError(e);
            console.error(e);
          })
          .finally(() => {
            console.log('delete end');
          });
      break;
  }
}

/**
 * Callback for deleting annotation
 * @param {Object} data
 */
function deleteCallback(data, parentType, viewerName) {
  switch (viewerName) {
    case 'main':
      // remove overlay
      $D.humanlayers.main.splice(data.index, 1);
      // update layer manager
      $UI.layersViewer.removeItemById(data.id, 'human', parentType);
      $CAMIC.viewer.omanager.removeOverlay(data.id);
      $UI.annotPopupMain.close();
      break;
    case 'minor':
      // remove overlay
      $D.humanlayers.minor.splice(data.index, 1);
      // update layer manager
      $UI.layersViewerMinor.removeItemById(data.id, 'human', parentType);
      $minorCAMIC.viewer.omanager.removeOverlay(data.id);
      $UI.annotPopupMinor.close();
      break;
  }
}

// for support QUIP2.0 Data model - delete callback
function deleteCallbackOld(data, parentType, viewerName) {
  switch (viewerName) {
    case 'main':
      const layer = $D.humanlayers.main[data.index];
      // for support QUIP2.0
      const idx = layer.data.findIndex((d) => d._id.$oid === data.oid);
      if (idx == -1) return;
      layer.data.splice(idx, 1);

      // update layer manager
      $UI.layersViewer.removeItemById(data.id, 'human', parentType);

      // delete entire layer if there is no data.
      if (layer.data.length == 0) {
        $D.humanlayers.main.splice(data.index, 1);
        $CAMIC.viewer.omanager.removeOverlay(data.id);
      }

      $CAMIC.viewer.omanager.updateView();
      // update layers Viewer
      // $UI.layersViewer.update();
      // close popup panel
      $UI.annotPopupMain.close();
      break;
    case 'minor':
      const layerMinor = $D.humanlayers.minor[data.index];
      // for support QUIP2.0
      const idxMinor = layerMinor.data.findIndex((d) => d._id.$oid === data.oid);
      if (idxMinor == -1) return;
      layerMinor.data.splice(idxMinor, 1);

      // update layer manager
      $UI.layersViewerMinor.removeItemById(data.id, 'human', parentType);

      // delete entire layer if there is no data.
      if (layerMinor.data.length == 0) {
        $D.humanlayers.minor.splice(data.index, 1);
        $minorCAMIC.viewer.omanager.removeOverlay(data.id);
      }

      $minorCAMIC.viewer.omanager.updateView();
      // update layers Viewer
      // $UI.layersViewer.update();
      // close popup panel
      $UI.annotPopupMinor.close();
      break;
  }
}

function saveAnnotCallback(viewerName) {
  switch (viewerName) {
    case 'main':
      /* reset as default */
      // clear draw data and UI
      $CAMIC.viewer.canvasDrawInstance.drawOff();
      $CAMIC.drawContextmenu.off();
      toggleOffDrawBtns('main');
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
      // $minorCAMIC.status = null;
      break;
    case 'minor':
      /* reset as default */
      // clear draw data and UI
      $minorCAMIC.viewer.canvasDrawInstance.drawOff();
      $minorCAMIC.drawContextmenu.off();
      toggleOffDrawBtns('minor');
      $minorCAMIC.viewer.canvasDrawInstance.clear();
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
      // $CAMIC.status = null;
      $minorCAMIC.status = null;
      break;
    default:
      console.error('Viewer Name not specified while calling saveAnnotCallBack');
  }
}


function saveAnalytics() {
  console.log('saveAnalytics');
}

function onAddRuler(ruler, viewerName) {
  console.log(`Ruler Adding in ${viewerName}`);
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name not specified while calling the funciton onAddRuler');
      break;
  }
  if (viewerName === 'main') {
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
          slide: $D.params.main,
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
          $D.rulerlayers.main.push(newItem);
          $UI.layersViewer.addItem(newItem, 'ruler');

          //   TODO Add code to synchronously add rulers to both main and minor viewers
          //   $UI.layersViewerMinor.addItem(
          //       newItem,
          //       'ruler',
          //       $minorCAMIC && $minorCAMIC.viewer ? true : false,
          //   );

          const rulerData = $UI.layersViewer.getDataItemById(execId, 'ruler');
          rulerData.layer = $CAMIC.viewer.getOverlayById(ruler.element);

          //   const rulerDataMinor = $UI.layersViewerMinor.getDataItemById(execId, 'ruler');
          //   // create lay and update view
          //   if ($minorCAMIC && $minorCAMIC.viewer && rulerDataMinor.isShow) {
          //     const [xmin, ymin] = newItem.data.geometries.features[0].geometry.coordinates[0][0];
          //     const [xmax, ymax] = newItem.data.geometries.features[0].geometry.coordinates[0][2];
          //     rulerDataMinor.layer = $minorCAMIC.viewer.measureInstance.addRuler({
          //       id: newItem.id,
          //       mode: newItem.data.properties.mode,
          //       rect: {
          //         x: xmin,
          //         y: ymin,
          //         width: xmax-xmin,
          //         height: ymax-ymin,
          //       },
          //       innerHTML: newItem.data.properties.innerHTML,
          //       isShow: rulerDataMinor.isShow,
          //     });
          //   }

          // close app side
          // $UI.layersViewer.update();
          // $UI.layersViewerMinor.update();

          $UI.message.addSmall(`Added The '${execId}' Ruler.`);
        })
        .catch((e) => {
          Loading.close();
          console.error(e);
          console.log('Ruler Save Failed');
        });
  } else if (viewerName === 'minor') {
    const {x, y, width, height} = ruler.getBounds($minorCAMIC.viewer.viewport);
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
          slide: $D.params.minor,
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

    $minorCAMIC.store
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
          $D.rulerlayers.minor.push(newItem);
          $UI.layersViewerMinor.addItem(newItem, 'ruler');
          //   $UI.layersViewerMinor.addItem(
          //       newItem,
          //       'ruler',
          //       $minorCAMIC && $minorCAMIC.viewer ? true : false,
          //   );

          const rulerData = $UI.layersViewerMinor.getDataItemById(execId, 'ruler');
          rulerData.layer = $minorCAMIC.viewer.getOverlayById(ruler.element);

          //   const rulerDataMinor = $UI.layersViewerMinor.getDataItemById(execId, 'ruler');
          //   // create lay and update view
          //   if ($minorCAMIC && $minorCAMIC.viewer && rulerDataMinor.isShow) {
          //     const [xmin, ymin] = newItem.data.geometries.features[0].geometry.coordinates[0][0];
          //     const [xmax, ymax] = newItem.data.geometries.features[0].geometry.coordinates[0][2];
          //     rulerDataMinor.layer = $minorCAMIC.viewer.measureInstance.addRuler({
          //       id: newItem.id,
          //       mode: newItem.data.properties.mode,
          //       rect: {
          //         x: xmin,
          //         y: ymin,
          //         width: xmax-xmin,
          //         height: ymax-ymin,
          //       },
          //       innerHTML: newItem.data.properties.innerHTML,
          //       isShow: rulerDataMinor.isShow,
          //     });
          //   }

          // close app side
          // $UI.layersViewer.update();
          // $UI.layersViewerMinor.update();

          $UI.message.addSmall(`Added The '${execId}' Ruler.`);
        })
        .catch((e) => {
          Loading.close();
          console.error(e);
          console.log('Ruler Save Failed');
        });
  }
}

function onDeleteRuler(ruler, viewerName) {
  const id = ruler.element.dataset.id;
  deleteRulerHandler(id, viewerName);
}

// function onDeleteRulerMain(ruler) {
//     const id = ruler.element.dataset.id;
//     deleteRulerHandler(id, 'main');
// }

// function onDeleteRulerMinor(ruler) {
//     const id = ruler.element.dataset.id;
//     deleteRulerHandler(id, 'minor');
// }

/**
 * Callback for deleting rulers
 * Called from onDeleteRuler{Main/Minor}
 * @param {String} execId
 * @param {String} viewerName
 * @returns
 */
function deleteRulerHandler(execId, viewerName) {
  if (!confirm(message = `Are You Sure You Want To Delete This Ruler {ID:${execId}}?`)) return;

  switch (viewerName) {
    case 'main':
      $CAMIC.store
          .deleteMarkByExecId(execId, $D.params.mainData.slide)
          .then((datas) => {
            console.log(datas);
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
            removeElement($D.rulerlayers.main, execId);
            $UI.layersViewer.removeItemById(execId, 'ruler');
            //   $UI.layersViewerMinor.removeItemById(execId, 'ruler');
            $CAMIC.viewer.measureInstance.removeRulerById(execId);
            //   if ($minorCAMIC &&
            //     $minorCAMIC.viewer &&
            //     $minorCAMIC.viewer.measureInstance) {
            //     $minorCAMIC.viewer.measureInstance.removeRulerById(execId);
            //   }
            $UI.message.addSmall(`Deleted The '${execId}' Ruler.`);
          })
          .catch((e) => {
            $UI.message.addError(e);
            console.error(e);
          })
          .finally(() => {
            // console.log('delete end');
          });
      break;
    case 'minor':
      $minorCAMIC.store
          .deleteMarkByExecId(execId, $D.params.minorData.slide)
          .then((datas) => {
            console.log(datas);
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
            removeElement($D.rulerlayers.minor, execId);
            //   $UI.layersViewer.removeItemById(execId, 'ruler');
            $UI.layersViewerMinor.removeItemById(execId, 'ruler');
            $minorCAMIC.viewer.measureInstance.removeRulerById(execId);
            //   if ($minorCAMIC &&
            //     $minorCAMIC.viewer &&
            //     $minorCAMIC.viewer.measureInstance) {
            //     $minorCAMIC.viewer.measureInstance.removeRulerById(execId);
            //   }
            $UI.message.addSmall(`Deleted The '${execId}' Ruler.`);
          })
          .catch((e) => {
            $UI.message.addError(e);
            console.error(e);
          })
          .finally(() => {
            // console.log('delete end');
          });
      break;
    default:
      break;
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
      annotationOff('main');
      break;
    case 'label':
      presetLabelOff();
      break;
    default:
      break;
  }
  switch ($minorCAMIC.status) {
    case 'normal':
      annotationOff('minor');
      break;
  }
}

function presetLabelOff() {
  if (!$CAMIC.viewer.canvasDrawInstance && !$minorCAMIC.viewer.canvasDrawInstance) return;
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  if ( canvasDraw &&
      canvasDraw._draws_data_.length &&
      confirm(`Do You Want To Save Annotation Label Before You Leave?`)
  ) {
    savePresetLabel('main');
  } else {
    try {
      canvasDraw.clear();
      canvasDraw.drawOff();
    } catch (e) {
      console.error(e);
    }

    $UI.appsSideMenu.close();
    $UI.toolbar
        .getSubTool('preset_label')
        .querySelector('input[type=checkbox]').checked = false;
    $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color =
            '';
    $UI.labelsSideMenu.close();
    if ($CAMIC.status === 'label') {
      $CAMIC.status = null;
      $minorCAMIC.status = null;
    }
  }
  const canvasDrawMinor = $minorCAMIC.viewer.canvasDrawInstance;
  if ( canvasDrawMinor &&
      canvasDrawMinor._draws_data_.length &&
      confirm(`Do You Want To Save Annotation Label Before You Leave?`)
  ) {
    savePresetLabel('minor');
  } else {
    try {
      canvasDrawMinor.clear();
      canvasDrawMinor.drawOff();
    } catch (e) {
      console.error(e);
    }

    $UI.appsSideMenu.close();
    $UI.toolbar
        .getSubTool('preset_label')
        .querySelector('input[type=checkbox]').checked = false;
    $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color =
            '';
    $UI.labelsSideMenu.close();
    if ($minorCAMIC.status === 'label') {
      $CAMIC.status = null;
      $minorCAMIC.status = null;
    }
  }
}

function savePresetLabel(viewerName) {
  let camic = null;
  let slideId = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      slideId = $D.params.main;
      break;
    case 'minor':
      camic = $minorCAMIC;
      slideId = $D.params.minor;
      break;
    default:
      break;
  }
  if (camic.viewer.canvasDrawInstance._path_index === 0) {
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

  const execId = data.type + randomId();
  const parent = data.type;
  const noteData = {
    name: execId,
    notes: data.type,
  };
  const feature = camic.viewer.canvasDrawInstance.getImageFeatureCollection()
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
          slide: slideId,
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
      }, viewerName),
    };
  } else {
    // point / polygon / stringLine
    annotJson = {
      creator: getUserId(),
      created_date: new Date(),
      provenance: {
        image: {
          slide: slideId,
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
          camic.viewer,
          camic.viewer.canvasDrawInstance.getImageFeatureCollection(),
      ),
    };
  }

  camic.store
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
          data: null,
        };
        switch (viewerName) {
          case 'main':
            $D.humanlayers.main.push(newItem);
            $UI.layersViewer.addHumanItem(newItem, 'human', parent);
            __data._id = {$oid: __data._id};
            addAnnotation(
                execId,
                __data,
                'human',
                parent,
                viewerName,
            );
            break;
          case 'minor':
            $D.humanlayers.minor.push(newItem);
            $UI.layersViewerMinor.addHumanItem(newItem, 'human', parent);
            __data._id = {$oid: __data._id};
            addAnnotation(
                execId,
                __data,
                'human',
                parent,
                viewerName,
            );
            break;
        }
      })
      .catch((e) => {
        Loading.close();
        console.log('save failed', e);
      })
      .finally(() => {
        $UI.message.addSmall(`Added The '${noteData.name}' Annotation.`);
      });
}

function convertGeometries(features, data, viewerName) {
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
  }
  const {points, bound, size} = convertToNormalized(
      features,
      data.size,
      camic.viewer,
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
  const rs = await $CAMIC.store.updatePresetLabels(oldElt.dataset.id, newLabel).then((d)=>d.result);
  if (rs.ok&&rs.nModified > 0) {
    $UI.labelsViewer.setLabels(oldElt, newLabel);
    $UI.message.add(`Label "${newLabel.type}" Has been Updated`);
    if (oldElt.classList.contains('selected')) drawLabel({value: 'prelabels', checked: true});
  } else {
    $UI.message.addError('Updating The Label Has Failed');
  }
  $UI.labelsViewer.__switch('view');
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
  if (!$CAMIC.viewer.canvasDrawInstance && !$minorCAMIC.viewer.canvasDrawInstance) {
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
          if ($CAMIC && $minorCAMIC && $CAMIC.status == null) {
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
  if (!$CAMIC.viewer.canvasDrawInstance && !$minorCAMIC.viewer.canvasDrawInstance) return;
  // open labels viewer
  mainMenuChange({apps: false, layers: false, labels: true});
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const canvasDrawMinor = $minorCAMIC.viewer.canvasDrawInstance;
  if (!label) {
    $UI.message.addWarning('No Label Exist. Please Add A Label');
    $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color = '';
    try {
      canvasDraw.clear();
      canvasDraw.drawOff();
    } catch (e) {
      console.error(e);
    }
    try {
      canvasDrawMinor.clear();
      canvasDrawMinor.drawOff();
    } catch (e) {
      console.error(e);
    }
    return;
  }
  try {
    canvasDraw.drawMode = label.mode;
    if (label.mode == 'grid') {
      canvasDraw.size = [parseInt(label.size), parseInt(label.size)];
    }
    canvasDraw.style.color = label.color;
    canvasDraw.drawOn();
    $CAMIC.status = 'label';
    $minorCAMIC.status = 'label';
  } catch (e) {
    console.error(e);
  }
  try {
    canvasDrawMinor.drawMode = label.mode;
    if (label.mode == 'grid') {
      canvasDrawMinor.size = [parseInt(label.size), parseInt(label.size)];
    }
    canvasDrawMinor.style.color = label.color;
    canvasDrawMinor.drawOn();
    $CAMIC.status = 'label';
    $minorCAMIC.status = 'label';
  } catch (e) {
    console.error(e);
  }
  $UI.toolbar.getSubTool('preset_label').querySelector('label').style.color =
      label.color;
}

function startDrawing(e, viewerName) {
  if (
    $UI.toolbar.getSubTool('preset_label') &&
      $UI.toolbar.getSubTool('preset_label').querySelector('input[type=checkbox]')
          .checked
  ) {
    //     ||
    //   $UI.toolbar.getSubTool("brush").querySelector("input[type=checkbox]")
    //     .checked
    // )
    switch (viewerName) {
      case 'main':
        $CAMIC.viewer.canvasDrawInstance.stop = false;
        break;
      case 'minor':
        $minorCAMIC.viewer.canvasDrawInstance.stop = false;
        break;
      default:
        console.error('Viewer Name not specified while calling startDrawing when adding Preset Labels');
        break;
    }
  } else {
    switch (viewerName) {
      case 'main':
        $CAMIC.viewer.canvasDrawInstance.stop = !$UI.annotOptPanel._form_.isValid();
        break;
      case 'minor':
        $minorCAMIC.viewer.canvasDrawInstance.stop = !$UI.annotOptPanel._form_.isValid();
        break;
      default:
        console.error('Viewer Name not specified while calling startDrawing when adding annotations');
        break;
    }
  }
  //   $CAMIC.viewer.canvasDrawInstance.stop = $UI.toolbar
  //     .getSubTool("preset_label")
  //     .querySelector("input[type=checkbox]").checked
  //     ? false
  //     : !$UI.annotOptPanel._form_.isValid();
  return;
}

function stopDrawing(e, viewerName) {
// preset label annotation
  if (
    $UI.toolbar.getSubTool('preset_label') &&
        $UI.toolbar.getSubTool('preset_label').querySelector('input[type=checkbox]').checked
  ) {
    // save preset label
    switch (viewerName) {
      case 'main':
        savePresetLabel('main');
        break;
      case 'minor':
        savePresetLabel('minor');
        break;
      default:
        console.error('Viewer Name not specified while calling stopDrawing when adding preset labels');
        break;
    }
  } else {
    // annotation
    let li = null;
    let state = null;
    switch (viewerName) {
      case 'main':
        li = $UI.toolbar.getSubTool('annotation');
        state = +li.querySelector('.drop_down').querySelectorAll('li')[0].querySelector('label').dataset.state;
        if ( $CAMIC.viewer.canvasDrawInstance &&
            state === 1 &&
            $CAMIC.viewer.canvasDrawInstance._draws_data_.length > 0
        ) {
          saveAnnotation('main');
        }
        break;
      case 'minor':
        li = $UI.toolbar.getSubTool('annotation');
        state = +li.querySelector('.drop_down').querySelectorAll('li')[1].querySelector('label').dataset.state;
        if ( $minorCAMIC.viewer.canvasDrawInstance &&
            state === 1 &&
            $minorCAMIC.viewer.canvasDrawInstance._draws_data_.length > 0
        ) {
          saveAnnotation('minor');
        }
        break;
      default:
        console.error('Viewer Name not specified while calling stopDrawing when adding annotations');
        break;
    }
  }
}

function addAnnotation(id, data, type, parent, viewerName) {
  console.log(id, data, type, viewerName);
  switch (viewerName) {
    case 'main':
      const layerData = $UI.layersViewer.getDataItemById(id, type, parent);
      // const layerDataMinor = $UI.layersViewerMinor.getDataItemById(id, type, parent);
      let item = layerData.item;
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
      // if ($minorCAMIC && $minorCAMIC.viewer && layerDataMinor.isShow) {
      //     layerDataMinor.layer = $minorCAMIC.viewer.omanager.addOverlay(item);
      //     $minorCAMIC.viewer.omanager.updateView();
      // }
      $CAMIC.drawContextmenu.off();
      $CAMIC.viewer.canvasDrawInstance.clear();
      // close app side
      $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = false;
      $UI.appsSideMenu.close();
      // $UI.layersViewer.update();
      // $UI.layersViewerMinor.update();
      break;
    case 'minor':
      // const layerData = $UI.layersViewer.getDataItemById(id, type, parent);
      const layerDataMinor = $UI.layersViewerMinor.getDataItemById(id, type, parent);
      let itemMinor = layerDataMinor.item;
      data.geometries = VieweportFeaturesToImageFeatures(
          $minorCAMIC.viewer,
          data.geometries,
      );
      if (data.provenance.analysis.isGrid) {
        const width = $minorCAMIC.viewer.imagingHelper.imgWidth;
        const height = $minorCAMIC.viewer.imagingHelper.imgHeight;

        const feature = data.geometries.features[0];
        const size = feature.properties.size;
        feature.properties.size = [
          Math.round(size[0] * width),
          Math.round(size[1] * height),
        ];
      }
      itemMinor.data = data;
      itemMinor.render = annoRender;
      // create lay and update view
      if (layerDataMinor.isShow) {
        layerDataMinor.layer = $minorCAMIC.viewer.omanager.addOverlay(itemMinor);
        $minorCAMIC.viewer.omanager.updateView();
      }
      // if ($minorCAMIC && $minorCAMIC.viewer && layerDataMinor.isShow) {
      //     layerDataMinor.layer = $minorCAMIC.viewer.omanager.addOverlay(item);
      //     $minorCAMIC.viewer.omanager.updateView();
      // }
      $minorCAMIC.drawContextmenu.off();
      $minorCAMIC.viewer.canvasDrawInstance.clear();
      // close app side
      $UI.toolbar._mainTools[0].querySelector('[type=checkbox]').checked = false;
      $UI.appsSideMenu.close();
      // $UI.layersViewer.update();
      // $UI.layersViewerMinor.update();
      break;
  }
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
      // $UI.appsSideMenuMinor.close();
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
            // $UI.appsSideMenuMinor.close();
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
  if (!$UI.spyglassMain && !$UI.spyglassMinor) return;
  try {
    $UI.spyglassMain.factor = factor;
    $UI.spyglassMain.open(x, y);
    const li = $UI.toolbar.getSubTool('magnifier');
    li.querySelector('input[type=checkbox]').checked = true;
    $CAMIC.status = 'magnifier';
    $minorCAMIC.status = 'magnifier';
  } catch (e) {
    console.error(e);
  }
  try {
    $UI.spyglassMinor.factor = factor;
    $UI.spyglassMinor.open(x, y);
    const li = $UI.toolbar.getSubTool('magnifier');
    li.querySelector('input[type=checkbox]').checked = true;
    $CAMIC.status = 'magnifier';
    $minorCAMIC.status = 'magnifier';
  } catch (e) {
    console.error(e);
  }
}

/**
   * switches magnifier tool off, called from toggleMagnifier
   */
function magnifierOff() {
  if (!$UI.spyglassMain && !$UI.spyglassMinor) return;
  try {
    $UI.spyglassMain.close();
  } catch (e) {
    console.error(e);
  }
  try {
    $UI.spyglassMinor.close();
  } catch (e) {
    console.error(e);
  }
  const li = $UI.toolbar.getSubTool('magnifier');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
  $minorCAMIC.status = null;
}

// --- Measurement Tool ---//
/**
 * Callback measurement tool to toggle measurement tool
 * @param {Object} data
 */
function toggleMeasurement(data) {
  if (!$CAMIC.viewer.measureInstance && !$minorCAMIC.viewer.measureInstance) {
    console.warn('No Measurement Tool');
    return;
  }
  // $UI.message.add(`Measument Tool ${data.checked?'ON':'OFF'}`);
  if (data.checked) {
    // trun off the main menu
    $UI.layersSideMenu.close();
    if ($CAMIC.status == 'measure') {
      try {
        $CAMIC.viewer.measureInstance.mode = data.status;
      } catch (e) {
        console.error(e);
      }
      try {
        $minorCAMIC.viewer.measureInstance.mode = data.status;
      } catch (e) {
        console.error(e);
      }
      measurementOn();
      return;
    }
    // turn off annotation
    toolsOff();
    var checkAllToolsOff = setInterval(function() {
      if ($CAMIC && $CAMIC.status == null && $minorCAMIC && $minorCAMIC.status == null) {
        // all tool has turn off
        clearInterval(checkAllToolsOff);
        try {
          $CAMIC.viewer.measureInstance.mode = data.status;
        } catch (e) {
          console.error(e);
        }
        try {
          $minorCAMIC.viewer.measureInstance.mode = data.status;
        } catch (e) {
          console.error(e);
        }
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
   * switches measuring tool on, called from toggleMeasurement
   */
function measurementOn() {
  if (!$CAMIC.viewer.measureInstance && !$minorCAMIC.viewer.measureInstance) return;
  try {
    $CAMIC.viewer.measureInstance.on();
  } catch (e) {
    console.error(e);
  }
  try {
    $minorCAMIC.viewer.measureInstance.on();
  } catch (e) {
    console.error(e);
  }
  const li = $UI.toolbar.getSubTool('measurement');
  li.querySelector('input[type=checkbox]').checked = true;
  const value = li.querySelector('.drop_down input[type=radio]:checked').value;
  if (value=='straight') {
    li.querySelector('label').textContent = 'straighten';
  } else if (value=='coordinate') {
    li.querySelector('label').textContent = 'square_foot';
  }
  $CAMIC.status = 'measure';
  $minorCAMIC.status = 'measure';
}

/**
   * switches measuring tool off, called from toggleMeasurement
   */
function measurementOff() {
  if (!$CAMIC.viewer.measureInstance && !$minorCAMIC.viewer.measureInstance) return;
  try {
    $CAMIC.viewer.measureInstance.off();
  } catch (e) {
    console.error(e);
  }
  try {
    $minorCAMIC.viewer.measureInstance.off();
  } catch (e) {
    console.error(e);
  }
  const li = $UI.toolbar.getSubTool('measurement');
  li.querySelector('input[type=checkbox]').checked = false;
  $CAMIC.status = null;
  $minorCAMIC.status = null;
}

function resetCallback(data, viewerName) {
  let camic = null;
  if (viewerName === 'check') {
    if ($CAMIC.status == 'normal') {
      viewerName = 'main';
    } else if ($minorCAMIC.status == 'normal') {
      viewerName = 'minor';
    }
  }
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name is not specified while calling the function resetCallBack');
      break;
  }
  if (camic.viewer.canvasDrawInstance._path_index === 0) return;
  if (confirm(`Do You Want To Clear Markups?`)) {
    camic.viewer.canvasDrawInstance.clear();
  }
}

// --- Annotation Tool ---//
// pen draw callback
const label = document.createElement('div');
label.style.transformOrigin = 'center';
label.style.height = 0;
label.style.width = 0;

function draw(e, viewerName) {
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name not specified while calling Draw');
      break;
  }
  if (!camic.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }
  const state = +e.state;
  const canvasDraw = camic.viewer.canvasDrawInstance;
  const target = this.srcElement || this.target || this.eventSource.canvas;
  if (state) {
    // on

    // off magnifier
    // magnifierOff();
    // off measurement
    // measurementOff();
    // turn off annotaiton
    if (state == 1) {
      // show pop-up message to user
      $UI.message.add('<i class="small material-icons">info</i>For More Options, Right Click Anywhere On The Image', 4000);
      toolsOff();
    }
    if (camic.status == 'normal') {
      switch (viewerName) {
        case 'main':
          annotationOn.call(this, state, target, 'main');
          break;
        case 'minor':
          annotationOn.call(this, state, target, 'minor');
          break;
        default:
          console.error('Viewer name not specified while calling Draw');
          break;
      }
      return;
    }
    if (state != 1) toolsOff();

    var checkAllToolsOff = setInterval(
        function() {
          if (camic && camic.status == null) {
          // all tool has turn off
            clearInterval(checkAllToolsOff);
            switch (viewerName) {
              case 'main':
                annotationOn.call(this, state, target, 'main');
                break;
              case 'minor':
                annotationOn.call(this, state, target, 'minor');
                break;
              default:
                console.error('Viewer name not specified while calling Draw');
            }
          }
        }.bind(this),
        100,
    );
  } else {
    // off
    switch (viewerName) {
      case 'main':
        annotationOff('main');
        break;
      case 'minor':
        annotationOff('minor');
        break;
      default:
        console.error('Viewer name not specified while calling Draw');
    }
  }
}

function annotationOn(state, target, viewerName) {
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name not Specified while calling annotation on funciton');
      break;
  }
  if (!camic.viewer.canvasDrawInstance) return;

  const canvasDraw = camic.viewer.canvasDrawInstance;

  const li = $UI.toolbar.getSubTool('annotation').querySelector('.drop_down').children[viewerName == 'main' ? 0 : 1];
  const {style, model} = camic.drawContextmenu.getStyle();
  canvasDraw.drawMode = model;
  canvasDraw.style.color = style.color;

  // li.appendChild(label);
  // switch (state) {
  //   case 1:
  //     switch(viewerName){
  //       case 'main':
  //         $UI.annotOptPanelMain._action_.style.display = 'none';
  //         break;
  //       case 'minor':
  //         $UI.annotOptPanelMain._action_.style.display = 'none';
  //         break;
  //     }
  //     label.style.transform = 'translateY(-12px) translateX(18px)';
  //     label.textContent = '1';
  //     label.style.color = '';
  //     break;
  //   case 2:
  //     switch(viewerName){
  //       case 'main':
  //         $UI.annotOptPanelMain._action_.style.display = '';
  //         break;
  //       case 'minor':
  //         $UI.annotOptPanelMain._action_.style.display = '';
  //         break;
  //     }
  //     label.style.transform =
  //       ' rotate(-90deg) translateX(2px) translateY(13px)';
  //     label.textContent = '8';
  //     label.style.color = 'white';
  //     break;
  //   default:
  //     // statements_def
  //     break;
  // }
  canvasDraw.drawOn();
  camic.drawContextmenu.on();
  // camic.drawContextmenu.open({
  //     x: this.clientX,
  //     y: this.clientY,
  //     target: target,
  // });
  camic.status = 'normal';
  // $minorCAMIC.status = 'normal';

  // close layers menu
  $UI.layersSideMenu.close();
  // open annotation menu
  switch (viewerName) {
    case 'main':
      $UI.appsSideMenu.open();
      const input = $UI.annotOptPanel._form_.querySelector('#name');
      input.focus();
      input.select();
      break;
    case 'minor':
      $UI.appsSideMenu.open();
      const inputMinor = $UI.annotOptPanel._form_.querySelector('#name');
      inputMinor.focus();
      inputMinor.select();
      break;
  }
  // -- START QUIP550 -- //
  // $UI.appsList.triggerContent('annotation','open');
  // -- END QUIP550 -- //
}

function annotationOff(viewerName) {
  let camic = null;
  switch (viewerName) {
    case 'main':
      camic = $CAMIC;
      break;
    case 'minor':
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name not Specified while calling annotation off funciton');
      break;
  }
  if (!camic.viewer.canvasDrawInstance) return;
  const canvasDraw = camic.viewer.canvasDrawInstance;
  if (
    canvasDraw._draws_data_.length &&
      confirm(`Do You Want To Save Annotation Before You Leave?`)
  ) {
    switch (viewerName) {
      case 'main':
        saveAnnotation('main');
        break;
      case 'minor':
        saveAnnotation('minor');
        break;
    }
  } else {
    canvasDraw.clear();
    canvasDraw.drawOff();
    camic.drawContextmenu.off();
    switch (viewerName) {
      case 'main':
        $UI.appsSideMenu.close();
        toggleOffDrawBtns('main');
        break;
      case 'minor':
        $UI.appsSideMenu.close();
        toggleOffDrawBtns('minor');
        break;
    }

    camic.status = null;
  }
}

function toggleOffDrawBtns(viewerName) {
  let li = null;
  switch (viewerName) {
    case 'main':
      li = $UI.toolbar.getSubTool('annotation').querySelector('.drop_down').children[0];
      break;
    case 'minor':
      li = $UI.toolbar.getSubTool('annotation').querySelector('.drop_down').children[1];
      break;
    default:
      console.error('Viewer Name not specified while calling toggleOffDrawBtns function');
      break;
  }
  const lab = li.querySelector('label');
  const state = +lab.dataset.state;
  lab.classList.remove(`s${state}`);
  lab.dataset.state = 0;
  lab.classList.add(`s0`);
  $UI.toolbar.getSubTool('annotation').click();
  // if (label.parentNode) $UI.toolbar.getSubTool('annotation').removeChild(label);
}

async function captureSlide() {
  const canvas = await captureScreen($CAMIC, {hasRuler: true});
  const canvasMinor = await captureScreen($minorCAMIC, {hasRuler: true});
  const resultCanvas = await combineCanvas(canvas, canvasMinor);
  // save as jpeg
  downloadSlideCapture(resultCanvas);
  toolsOff();
  $UI.layersSideMenu.close();
}

async function combineCanvas(canvas, canvasMinor) {
  const resultCanvas = document.createElement('CANVAS');
  const ctx = resultCanvas.getContext('2d');
  // set canvas's height and width
  resultCanvas.height = Math.max(canvas.height, canvasMinor.height);
  resultCanvas.width = canvas.width + canvasMinor.width;

  ctx.drawImage(canvas, 0, 0);
  ctx.drawImage(canvasMinor, canvas.width, 0);

  return resultCanvas;
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

/*
function setZoomControlLayer(viewerName){
  document.querySelector(`.${viewerName}.zoom_panel.crossview_layer`).innerHTML = '';

  const div = document.createElement('div');
  const minus = document.createElement('span');
  minus.classList.add('material-icons');
  minus.style.margin = 'auto';
  minus.innerText = 'remove';
  const add = document.createElement('span');
  add.classList.add('material-icons');
  add.style.margin = 'auto';
  add.innerText = 'add';
  const input = document.createElement('input');
  input.type = 'range';
  let camic = null;
  switch(viewerName){
    case 'main':
      input.min = 0;
      input.max = $CAMIC.viewer.cazoomctrlInstance.imageZoomLevels.length - 1;
      input.step = 1;
      input.value = input.max;
      camic = $CAMIC;
      break;
    case 'minor':
      input.min = 0;
      input.max = $minorCAMIC.viewer.cazoomctrlInstance.imageZoomLevels.length - 1;
      input.step = 1;
      input.value = input.max;
      camic = $minorCAMIC;
      break;
    default:
      console.error('Viewer Name not specified while calling setZoomControlLayer funciton');
  }
  div.appendChild(add);
  div.appendChild(input);
  div.appendChild(minus);


  const label = document.createElement('label');
  label.innerHTML = `<span>Zoom</span>`;
  const idx = document.createElement('div');
  const txt = document.createElement('div');
  const ip = document.createElement('input');
  txt.classList.add('txt', 'show');
  ip.classList.add('ip', 'hide');
  ip.type = 'text';
  idx.appendChild(txt);
  idx.appendChild(ip);
  label.appendChild(idx);
  let zoomIndex = camic.viewer.cazoomctrlInstance.imageZoomIndex;
  txt.innerText = `${(camic.viewer.cazoomctrlInstance.imageZoomLevels[zoomIndex]
    * camic.viewer.cazoomctrlInstance.base).toFixed(3)}x`
  txt.addEventListener('click', ()=>{
    txt.classList.remove('show');
    txt.classList.add('hide');
    ip.classList.remove('hide');
    ip.classList.add('show');
    ip.value = `${Number((camic.viewer.viewport.viewportToImageZoom(camic.viewer.viewport.getZoom(true))
      *camic.viewer.cazoomctrlInstance.base).toFixed(3))}`;
  });

  ip.addEventListener('keyup', (e) =>{
    if(e.code === 'Enter'){
      ip.classList.remove('show');
      ip.classList.add('hide');
      txt.classList.remove('hide');
      txt.classList.add('show');
      let max = camic.viewer.cazoomctrlInstance.imageZoomLevels[0] * camic.viewer.cazoomctrlInstance.base;
      let min = camic.viewer.cazoomctrlInstance.imageZoomLevels[camic.viewer.cazoomctrlInstance.imageZoomLevels.length - 1]
      * camic.viewer.cazoomctrlInstance.base;
      if(isNaN(+ip.value)) {
        return;
      } else if(min.toFixed(3) > (+ip.value)||max < (+ip.value)) {
        return;
      } else {
        camic.viewer.viewport.zoomTo(camic.viewer.viewport.imageToViewportZoom(
          +ip.value/camic.viewer.cazoomctrlInstance.base),
        camic.viewer.viewport.getCenter(),true);
      }
    }
  });


  document.querySelector(`.${viewerName}.zoom_panel.crossview_layer`).appendChild(label);
  document.querySelector(`.${viewerName}.zoom_panel.crossview_layer`).appendChild(div);

  add.addEventListener('click', (e) => {
    const index = camic.viewer.cazoomctrlInstance.imageZoomIndex;
    if(index != 0){
      const imageZoom = camic.viewer.cazoomctrlInstance.imageZoomLevels[index - 1];
      input.value = (index - 1);
      camic.viewer.viewport.zoomTo(camic.viewer.viewport.imageToViewportZoom(imageZoom));
    }
  });

  minus.addEventListener('click', (e)=> {
    const index = camic.viewer.cazoomctrlInstance.imageZoomIndex;
    if(index != camic.viewer.cazoomctrlInstance.imageZoomLevels.length - 1){
      const imageZoom = camic.viewer.cazoomctrlInstance.imageZoomLevels[index + 1];
      input.value = (index + 1);
      camic.viewer.viewport.zoomTo(camic.viewer.viewport.imageToViewportZoom(imageZoom));
    }
  });

  input.addEventListener('change', (e) =>{
    const index = +e.target.value;
    if(index == camic.viewer.cazoomctrlInstance.imageZoomIndex) return;
    camic.viewer.cazoomctrlInstance.imageZoomIndex = index;
    const imageZoom = camic.viewer.cazoomctrlInstance.imageZoomLevels[index];
    camic.viewer.viewport.zoomTo(camic.viewer.viewport.imageToViewportZoom(imageZoom));
  });

  input.addEventListener('mousemove', (e) =>{
    const index = +e.target.value;
    if(index == camic.viewer.cazoomctrlInstance.imageZoomIndex) return;
    camic.viewer.cazoomctrlInstance.imageZoomIndex = index;
    const imageZoom = camic.viewer.cazoomctrlInstance.imageZoomLevels[index];
    camic.viewer.viewport.zoomTo(camic.viewer.viewport.imageToViewportZoom(imageZoom));
  });

  camic.viewer.addHandler('zoom', (e) => {
    const index = getImageZoomIndex(
      camic.viewer.cazoomctrlInstance.imageZoomRanges,
      camic.viewer.viewport.viewportToImageZoom(e.zoom)
    );
    if(index!=null) input.value = index;
    txt.innerText = `${Number((camic.viewer.viewport.viewportToImageZoom(e.zoom)
      *camic.viewer.cazoomctrlInstance.base).toFixed(3))}x`;

    function getImageZoomIndex(range, zoom){
      for(let i = 0; i < range.length - 1; i++){
          if(range[i] >= zoom && zoom > range[i+1]) return i;
      }
      return null;
    }
  });

  camic.viewer.addHandler('resize', (e) =>{
    const max = camic.viewer.cazoomctrlInstance.getMaxImageZoom();
    const min = camic.viewer.cazoomctrlInstance.getMinImageZoom();
    const samples = [1, 0.5, 0.25];
    let divisor = 1;
    //const zoomNums = 3 - (Math.log2(min) >> 0);
    let zooms = [];
    do {
        zooms = [...zooms,...samples.map(e=>e/divisor)]
        divisor *= 10;
    } while(zooms[zooms.length-1] > min);

    while( zooms[zooms.length-1] < min ){
        zooms.pop();
    }
    zooms.push(min);
    input.min = 0;
    input.max = zooms.length-1;
    input.step = 1;
    camic.viewer.viewport.zoomTo(camic.viewer.viewport.getZoom(true));
  });


}
*/
/* TODO : Rotation Bar
  function setRotationControlLayer(viewerName){
    let camic = null;
    switch(viewerName){
      case 'main':
        camic = $CAMIC;
        break;
      case 'minor':
        camic =$minorCAMIC;
        break;
      default:
        console.error('Viewer Name not specified while calling setRotationControlLayer function');
    }
    document.querySelector(`.${viewerName}.rotation_panel.crossview_layer`).innerHTML = '';

    const div = document.createElement('div');
    const minus = document.createElement('span');
    minus.classList.add('material-icons');
    minus.style.margin = 'auto';
    minus.innerText = 'remove';
    const add = document.createElement('span');
    add.classList.add('material-icons');
    add.style.margin = 'auto';
    add.innerText = 'add';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = 0;
    input.max = 360;
    input.step = 1;
    input.value = camic.viewer.viewport.getRotation();

    div.appendChild(minus);
    div.appendChild(input);
    div.appendChild(add);

    const label = document.createElement('label');
    label.innerHTML = `<span>Rotation</span>`;
    const idx = document.createElement('div');
    const txt = document.createElement('div');
    const ip = document.createElement('input');
    txt.classList.add('txt', 'show');
    ip.classList.add('ip', 'hide');
    ip.type = 'text';
    idx.appendChild(txt);
    idx.appendChild(ip);
    label.appendChild(idx);
    txt.innerHTML = `${(camic.viewer.viewport.getRotation())}<sup>o</sup>`;

    document.querySelector(`.${viewerName}.rotation_panel.crossview_layer`).appendChild(label);
    document.querySelector(`.${viewerName}.rotation_panel.crossview_layer`).appendChild(div);


    add.addEventListener('click', () => {
      const angle = +input.value;
      if(angle < 360) {
        camic.viewer.viewport.setRotation(angle + 1);
        input.value = angle + 1;
        txt.innerHTML = `${(camic.viewer.viewport.getRotation())}<sup>o</sup>`
      }
    });

    minus.addEventListener('click', () => {
      const angle = +input.value;
      if(angle > 0) {
        camic.viewer.viewport.setRotation(angle - 1);
        input.value = angle - 1;
        txt.innerHTML = `${(camic.viewer.viewport.getRotation())}<sup>o</sup>`
      }
    });

    input.addEventListener('change', (e) => {
      camic.viewer.viewport.setRotation(+e.target.value);
      txt.innerHTML = `${(+e.target.value)}<sup>o</sup>`
    });

    input.addEventListener('mousemove', (e) => {
      if(+e.target.value == Math.floor(camic.viewer.viewport.getRotation())) return;
      if(+e.target.value == Math.ceil(camic.viewer.viewport.getRotation())) return;
      camic.viewer.viewport.setRotation(+e.target.value);
      txt.innerHTML = `${(+e.target.value)}<sup>o</sup>`
    });

    txt.addEventListener('click', ()=>{
      txt.classList.remove('show');
      txt.classList.add('hide');
      ip.classList.remove('hide');
      ip.classList.add('show');
      ip.value = `${camic.viewer.viewport.getRotation()}`;
    });

    ip.addEventListener('keyup', (e) =>{
      if(e.code === 'Enter'){
        ip.classList.remove('show');
        ip.classList.add('hide');
        txt.classList.remove('hide');
        txt.classList.add('show');
        if(isNaN(+ip.value)) {
          return;
        } else if(0 > (+ip.value)||180 < (+ip.value)) {
          return;
        } else {
          camic.viewer.viewport.setRotation(+ip.value);
          input.value = +ip.value;
          txt.innerHTML = `${(camic.viewer.viewport.getRotation())}<sup>o</sup>`
        }
      }
    });
  }
*/
/*
function setOriginControlLayer(viewerName){
  const loc = document.querySelector(`.${viewerName}.origin_choice.crossview_layer > .material-icons`);
  loc.dataset.state = 0;
  loc.addEventListener('click', () => {
    toggleOriginChoice(viewerName, loc);
  });
  $CAMIC.syncSettings = {
    center : $CAMIC.viewer.viewport.getCenter(),
    zoom : $CAMIC.viewer.viewport.getZoom()
  };
  $minorCAMIC.syncSettings = {
    center : $minorCAMIC.viewer.viewport.getCenter(),
    zoom : $minorCAMIC.viewer.viewport.getZoom()
  };
}
function toggleOriginChoice(viewerName, elem){
  if(+elem.dataset.state === 1){
    originChoiceOff(viewerName);
  } else {
    toolsOff(viewerName);
    let camic = viewerName === 'main' ? $CAMIC : $minorCAMIC;
    var checkAllToolsOff = setInterval(function () {
      if(camic && camic.status == null){
        clearInterval(checkAllToolsOff);
        originChoiceOn(viewerName);
      }
    }, 100)
  }
}

let originPointer = null;

function originChoiceOn(viewerName){
  const loc = document.querySelector(`.${viewerName}.origin_choice.crossview_layer > .material-icons`);
  loc.dataset.state = 1;
  let camic = viewerName === 'main' ? $CAMIC : $minorCAMIC;
  camic.status = 'origin';
  originPointer = document.createElement('div');
  let span = document.createElement('span');
  span.style.color = 'black';
  span.style.fontSize = '30px';
  span.style.position = 'absolute';
  span.style.top = '-27px';
  span.style.left = '-15px';
  span.classList.add('material-icons');
  span.innerHTML = 'location_on';
  originPointer.appendChild(span);
  camic.viewer.addOverlay(originPointer, camic.viewer.viewport.getCenter());
  camic.viewer.addHandler('canvas-click', placePointer)
}

function originChoiceOff(viewerName){
  const loc = document.querySelector(`.${viewerName}.origin_choice.crossview_layer > .material-icons`);
  loc.dataset.state = 0;
  let camic = viewerName === 'main' ? $CAMIC : $minorCAMIC;
  camic.status = null;
  if(originPointer){
    camic.viewer.removeOverlay(originPointer);
    camic.viewer.removeHandler('canvas-click', placePointer);
    originPointer = null;
  }
}

function placePointer(point){
  if(originPointer){
    let camic = null;
    switch(point.eventSource.id){
      case 'minor_viewer':
        camic = $minorCAMIC;
        break;
      case 'main_viewer':
        camic = $CAMIC;
        break;
    }
    camic.viewer.removeOverlay(originPointer);
    camic.viewer.addOverlay(originPointer, camic.viewer.viewport.viewerElementToViewportCoordinates(point.position));
    if(camic.syncSettings) {
      camic.syncSettings.center = camic.viewer.viewport.viewerElementToViewportCoordinates(point.position);
    } else {
      camic.syncSettings = {
        center : camic.viewer.viewport.viewerElementToViewportCoordinates(point.position)
      };
    }
  }
}
*/

function addSynchronizationHandlers() {
  $CAMIC.syncSettings = {
    center: $CAMIC.viewer.viewport.getCenter(),
    zoom: $CAMIC.viewer.viewport.getZoom(),
    panSource: true,
    zoomSource: true,
  };
  $minorCAMIC.syncSettings = {
    center: $minorCAMIC.viewer.viewport.getCenter(),
    zoom: $minorCAMIC.viewer.viewport.getZoom(),
    panSource: true,
    zoomSource: true,
  };
  $CAMIC.viewer.addHandler('pan', panSync);
  $minorCAMIC.viewer.addHandler('pan', panSync);
  $CAMIC.viewer.addHandler('zoom', zoomSync);
  $minorCAMIC.viewer.addHandler('zoom', zoomSync);
}

function removeSynchronizationHandlers() {
  $CAMIC.viewer.removeHandler('pan', panSync);
  $minorCAMIC.viewer.removeHandler('pan', panSync);
  $CAMIC.viewer.removeHandler('zoom', zoomSync);
  $minorCAMIC.viewer.removeHandler('zoom', zoomSync);
}

function panSync(event) {
  let camic = null;
  let oppCamic = null;
  switch (event.eventSource.id) {
    case 'main_viewer':
      camic = $CAMIC;
      oppCamic = $minorCAMIC;
      break;
    case 'minor_viewer':
      camic = $minorCAMIC;
      oppCamic = $CAMIC;
      break;
    default:
      console.error('Viewer Name not specified');
      break;
  }
  if (!camic.syncSettings.panSource) return;
  let currCenter = camic.viewer.viewport.getCenter();
  let scale = {
    width: oppCamic.viewer.viewport.getBounds().width / camic.viewer.viewport.getBounds().width,
    height: oppCamic.viewer.viewport.getBounds().height / camic.viewer.viewport.getBounds().height,
  };
  let delta = new OpenSeadragon.Point(
      scale.width * (currCenter.x - camic.syncSettings.center.x),
      scale.height * (currCenter.y - camic.syncSettings.center.y),
  );
  let newCenter = new OpenSeadragon.Point(
      oppCamic.syncSettings.center.x + delta.x,
      oppCamic.syncSettings.center.y + delta.y,
  );
  oppCamic.syncSettings.panSource = false;
  oppCamic.viewer.viewport.panTo(newCenter);
  oppCamic.syncSettings.panSource = true;
}

function zoomSync(event) {
  let camic = null;
  let oppCamic = null;
  switch (event.eventSource.id) {
    case 'main_viewer':
      camic = $CAMIC;
      oppCamic = $minorCAMIC;
      break;
    case 'minor_viewer':
      camic = $minorCAMIC;
      oppCamic = $CAMIC;
      break;
    default:
      console.error('Viewer Name not specified');
      break;
  }
  if (!camic.syncSettings.zoomSource) return;
  let currZoom = camic.viewer.viewport.getZoom();
  let scale = oppCamic.syncSettings.zoom / camic.syncSettings.zoom;
  let newZoom = scale * currZoom;
  if (newZoom > oppCamic.viewer.viewport.getMaxZoom()) {
    newZoom = oppCamic.viewer.viewport.getMaxZoom();
    camic.syncSettings.zoomSource = false;
    camic.viewer.viewport.zoomTo(newZoom / scale);
    camic.syncSettings.zoomSource = true;
  } else if (newZoom < oppCamic.viewer.viewport.getMinZoom()) {
    newZoom = oppCamic.viewer.viewport.getMinZoom();
    camic.syncSettings.zoomSource = false;
    camic.viewer.viewport.zoomTo(newZoom / scale);
    camic.syncSettings.zoomSource = true;
  }
  oppCamic.syncSettings.zoomSource = false;
  oppCamic.viewer.viewport.zoomTo(newZoom);
  oppCamic.syncSettings.zoomSource = true;
  camic.viewer.viewport.panTo(camic.viewer.viewport.getCenter());
}

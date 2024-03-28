// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
let tracker;
let $minorCAMIC = null;
// for all instances of UI components
const $UI = new Map();

// INITIALIZE DB
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// id(autoinc), name, location(name+id), classes
var request; var db;
var modelName;
var flag = -1;
var choices1;

// tensorflowjs creates its own IndexedDB on saving a model.
async function dbInit() {
  const model = tf.sequential();
  await model.save('indexeddb://dummy');
  await tf.io.removeModel('indexeddb://dummy');
  console.log('DB initialised');
}

// Opening the db created by tensorflowjs
function dbOpen() {
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

const $D = {
  pages: {
    home: '../table.html',
    table: '../table.html',
  },
  params: null, // parameter from url - slide Id and status in it (object).
  overlayers: null, // array for each layers
  templates: null, // json schema for prue-form
  segments: [],
};

window.addEventListener('keydown', (e) => {
  if (!$CAMIC || !$CAMIC.viewer) return;
  const key = e.key;
  // escape key to close all operations
  if ('escape' == key.toLocaleLowerCase()) {
    magnifierOff();
    measurementOff();
    annotationOff();
    presetLabelOff();
    mlAsisstantOff();
  }

  // open annotation (ctrl + a)
  if (e.ctrlKey && 'a' == key.toLocaleLowerCase() && $CAMIC.viewer.canvasDrawInstance) {
    const li = $UI.toolbar.getSubTool('annotation');
    eventFire(li, 'click');
    return;
  }
  // open magnifier (ctrl + m)
  if (e.ctrlKey && 'm' == key.toLocaleLowerCase() && $UI.spyglass) {
    const li = $UI.toolbar.getSubTool('magnifier');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'change');
    return;
  }
  // open measurement (ctrl + r)
  if (e.ctrlKey && 'r' == key.toLocaleLowerCase() && $CAMIC.viewer.measureInstance) {
    e.preventDefault();
    const li = $UI.toolbar.getSubTool('measurement');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'change');
    return;
  }
  // open side-by-side (ctrl + s)
  if (e.ctrlKey && 's' == key.toLocaleLowerCase()) {
    e.preventDefault();
    const li = $UI.toolbar.getSubTool('sbsviewer');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }
  // open side-by-side (ctrl + l)
  if (e.ctrlKey && 'l' == key.toLocaleLowerCase()) {
    e.preventDefault();
    const li = $UI.toolbar.getSubTool('preset_label');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }

  // shortcuts for preset labels
  if ($D.labels &&
    $D.labels.configuration &&
    Array.isArray($D.labels.configuration) &&
    $D.labels.configuration.length > 0 &&
    e.ctrlKey) {
    e.key;
    const elt = $UI.labelsViewer.allLabels.find((l)=>l.dataset.key&&l.dataset.key.toLowerCase()==e.key.toLowerCase());
    if (elt) {
      $UI.toolbar
          .getSubTool('preset_label')
          .querySelector('input[type=checkbox]').checked = true;
      $UI.labelsViewer.selectLabel(elt);
    }
  }
});

// initialize viewer page
function initialize() {
  var checkPackageIsReady = setInterval(async function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // create a viewer and set up
      await dbInit().then((e) => dbOpen());
      initCore();

      // loading the form template data
      FormTempaltesLoader();

      // loading the overlayers data
      layersLoader();
    }
  }, 100);
}

// setting core functionalities
function initCore() {
  // start initial

  // create the message queue
  $UI.message = new MessageQueue({position: 'bottom-left'});

  // zoom info and mmp
  const opt = {
    draw: {
      // extend context menu btn group
      btns: [
        {
          // annotation
          type: 'btn',
          title: 'Annotation',
          class: 'material-icons',
          text: 'description',
          callback: saveAnnotation,
        },
        {
          // analytics
          type: 'btn',
          title: 'Analytics',
          class: 'material-icons',
          text: 'settings_backup_restore',
          callback: saveAnalytics,
        },
      ],
    },
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }
  // pathdb home directly
  if ($D.params.mode == 'pathdb') {
    $D.pages.home = '../../../';
    $D.pages.table = '../../../';
  }

  try {
    const slideQuery = {};
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    opt.addRulerCallback = onAddRuler;
    opt.deleteRulerCallback = onDeleteRuler;
    $CAMIC = new CaMic('main_viewer', slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e) {
    $CAMIC.viewer.addHandler('open-failed', function(e) {
      console.error(e.message, e);
      redirect($D.pages.table, e.message, 5);
    });
    // image loaded
    if (e.hasError) {
      // if this is a retry, assume normal behavior (one retry per slide)
      if ($D.params.retry) {
        $UI.message.addError(e.message);
        // can't reach Slide and return to home page
        if (e.isServiceError) redirect($D.pages.table, e.message, 1);
      } else {
        // If this is our first attempt, try one more time.
        let params = new URLSearchParams(window.location.search);
        params.set('retry', '1');
        window.location.search = params.toString();
      }
    } else {
      $D.params.data = e;
      // popup panel
      $CAMIC.viewer.addHandler('canvas-lay-click', function(e) {
        if (!e.data) {
          $UI.annotPopup.close();
          return;
        }
        // for support QUIP 2.0
        const data = Array.isArray(e.data) ? e.data[e.data.selected] : e.data;

        const type = data.provenance.analysis.source;
        let body;
        let attributes;
        let warning = null;
        switch (type) {
          case 'human':
            let area;
            let circumference;
            if (data.geometries) {
              if (
                (data.selected != null || data.selected != undefined) &&
                data.geometries.features[data.selected] &&
                data.geometries.features[data.selected].properties.area
              ) {
                area = `${Math.round(
                    data.geometries.features[data.selected].properties.area,
                )} μm²`;
              }
              if (
                (data.selected != null || data.selected != undefined) &&
                data.geometries.features[data.selected] &&
                data.geometries.features[data.selected].properties.circumference
              ) {
                circumference = `${Math.round(
                    data.geometries.features[data.selected].properties
                        .circumference,
                )} μm`;
              }
            } // othereise, don't try to calculate area and circumference
            // human

            attributes = data.properties.annotations;
            if (area) attributes.area = area;
            if (circumference) attributes.circumference = circumference;

            const states = StatesHelper.getCurrentStates(isImageCoordinate = true);
            if (!states) return;
            attributes.X = states.x;
            attributes.Y = states.y;
            attributes.zoom = states.z;

            body = convertHumanAnnotationToPopupBody(attributes);
            if (
              data.geometries &&
              data.geometries.features[data.selected].properties.isIntersect
            ) {
              warning = `<div style='color:red;text-align: center;font-size:12px;'>Inaccurate Area and Circumference</div>`;
            }
            if (
              data.geometries &&
              data.geometries.features[data.selected].properties.nommp
            ) {
              warning = `<div style='color:red;text-align: center;font-size:12px;'>This slide has no mpp</div>`;
            }

            $UI.annotPopup.showFooter();
            break;
          case 'computer':
            // handle data.provenance.analysis.computation = `segmentation`
            attributes = data.properties.scalar_features[0].nv;
            body = {type: 'map', data: attributes};
            $UI.annotPopup.hideFooter();
            break;
          default:
            return;
            // statements_def
            break;
        }

        $UI.annotPopup.data = {
          id: data.provenance.analysis.execution_id,
          oid: data._id.$oid,
          annotation: attributes,
          selected: e.data.selected,
        };
        const getCateName = () => {
          const items = $UI.layersViewer.setting.categoricalData.human.items;
          var dataType = null;
          for (const key in items) {
            if ({}.hasOwnProperty.call(items, key)) {
              dataType = key;
              if (items.hasOwnProperty(key)&&
                  Array.isArray(items[key].items)&&
                  items[key].items.some((i)=>i.item.id == $UI.annotPopup.data.id)) break;
            }
          }
          return dataType;
        };


        $UI.annotPopup.dataType = null;
        $UI.annotPopup.dataType = data.provenance && data.provenance.analysis &&
                                  data.provenance.analysis.source && data.provenance.analysis.source=='human'?
        getCateName($UI.annotPopup.data.id):null;

        $UI.annotPopup.setTitle(`id:${data.provenance.analysis.execution_id}`);
        $UI.annotPopup.setBody(body);
        if (warning) $UI.annotPopup.body.innerHTML += warning;

        $UI.annotPopup.open(e.position);
      });

      $CAMIC.viewer.addHandler('annot-edit-save', function(e) {
        if (!e.data) {
          return;
        }
        const {id, slide, data} = e;
        const dataCopy = deepCopy(data);
        delete dataCopy.selected;
        delete dataCopy._id;
        if (dataCopy.geometries.features[0].properties.size) {
          const dataPoints = dataCopy.geometries.features[0].geometry.coordinates[0];
          const dataSize = dataCopy.geometries.features[0].properties.size;
          const {points, bound, size} = convertToNormalized(dataPoints, dataSize, $CAMIC.viewer);
          dataCopy.geometries.features[0].properties.size = size;
          dataCopy.geometries.features[0].geometry.coordinates = [points];
          dataCopy.geometries.features[0].bound.coordinates = [bound];
        } else {
          dataCopy.geometries = ImageFeaturesToVieweportFeatures(
              $CAMIC.viewer,
              dataCopy.geometries,
          );
        }
        editAnnoCallback(id, slide, dataCopy);
      });

      // create the message bar TODO for reading slide Info TODO
      $UI.slideInfos = new CaMessage({
        /* opts that need to think of*/
        id: 'cames',
        defaultText: `Slide: ${$D.params.data.name}`,
      });

      // spyglass
      $UI.spyglass = new Spyglass({
        targetViewer: $CAMIC.viewer,
        imgsrc: $D.params.data.url,
      });
    }
  });

  $CAMIC.viewer.addHandler('open', function() {
    $CAMIC.viewer.canvasDrawInstance.addHandler('start-drawing', startDrawing);
    $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', stopDrawing);
    // init UI -- some of them need to wait data loader to load data
    // because UI components need data to initialize
    initUIcomponents();
    // action tracker start
    tracker = new Tracker($CAMIC, $D.params.data._id.$oid, getUserId());
    tracker.start();
  });
}

function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const copy = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }

  return copy;
}

// initialize all UI components
async function initUIcomponents() {
  /* create UI components */
  $UI.downloadSelectionModal = new ModalBox({
    id: 'downloadSelectionModal',
    hasHeader: true,
    headerText: 'Download Selection',
    hasFooter: true,
  });
  const header = $UI.downloadSelectionModal.elt.querySelector('.modalbox-header');
  header.querySelector('span.close').style.display = 'None';
  const footer = $UI.downloadSelectionModal.elt.querySelector('.modalbox-footer');
  const cancelBtn = document.createElement('button');
  cancelBtn.classList.add('btn');
  cancelBtn.classList.add('btn-sm');
  cancelBtn.classList.add('btn-secondary');
  cancelBtn.textContent = 'Cancel';
  const downloadBtn = document.createElement('button');
  downloadBtn.classList.add('btn');
  downloadBtn.classList.add('btn-sm');
  downloadBtn.classList.add('btn-info');
  downloadBtn.textContent = 'Download';
  footer.innerHTML = '';
  footer.classList.add('footer');
  footer.appendChild(cancelBtn);
  footer.appendChild(downloadBtn);

  cancelBtn.addEventListener('click', hideDownloadSelection);
  downloadBtn.addEventListener('click', downloadSelection);


  $UI.modalbox = new ModalBox({
    id: 'modalbox',
    hasHeader: true,
    headerText: 'HeatMap List',
    hasFooter: false,
  });

  const subToolsOpt = [];
  // home
  if (ImgloaderMode == 'iip') {
    subToolsOpt.push({
      name: 'home',
      icon: 'home', // material icons' name
      title: 'Home',
      type: 'btn', // btn/check/dropdown
      value: 'home',
      callback: goHome,
    });
  }
  // pen
  subToolsOpt.push({
    name: 'annotation',
    icon: 'create', // material icons' name
    title: 'Draw',
    type: 'multistates',
    callback: draw,
  });

  subToolsOpt.push({
    name: 'preset_label',
    icon: 'colorize', // material icons' name
    title: 'Preset Labels',
    type: 'check',
    value: 'prelabels',
    callback: drawLabel,
  });

  // magnifier
  subToolsOpt.push({
    name: 'magnifier',
    icon: 'search',
    title: 'Magnifier',
    type: 'dropdown',
    value: 'magn',
    dropdownList: [
      {
        value: 0.5,
        title: '0.5',
        checked: true,
      },
      {
        value: 1,
        title: '1.0',
      },
      {
        value: 2,
        title: '2.0',
      },
    ],
    callback: toggleMagnifier,
  });
  // measurement tool
  if ($CAMIC.viewer.measureInstance) {
    subToolsOpt.push({
      name: 'measurement',
      icon: 'straighten',
      title: 'Measurement',
      type: 'dropdown',
      value: 'measure',
      dropdownList: [
        {
          value: 'straight',
          title: 'straight',
          icon: 'straighten',
          checked: true,
        },
        {
          value: 'coordinate',
          title: 'coordinate',
          icon: 'square_foot',
        },
      ],
      callback: toggleMeasurement,
    });
  }
  // donwload selection
  subToolsOpt.push({
    name: 'download_selection',
    icon: 'get_app', // material icons' name
    title: 'Download Selection',
    type: 'check',
    value: 'download',
    callback: toggleDownloadSelection,
  });
  // enhance
  subToolsOpt.push({
    name: 'Enhance',
    icon: 'invert_colors',
    title: 'Enhance',
    type: 'dropdown',
    value: 'Enhance',
    dropdownList: [
      {
        value: 'Histogram Eq',
        title: 'Histogram Equalization',
        icon: 'leaderboard',
        checked: true,
      },
      {
        value: 'Edge',
        title: 'Edge',
        icon: 'show_chart',
      },
      {
        value: 'Sharpen',
        title: 'Sharpen',
        icon: 'change_history',
      },
      {
        value: 'Custom',
        title: 'Custom',
        icon: 'api',
      },
    ],
    callback: enhance,
  });
  // share
  if (ImgloaderMode == 'iip') {
    subToolsOpt.push({
      name: 'share',
      icon: 'share',
      title: 'Share View',
      type: 'btn',
      value: 'share',
      callback: shareURL,
    });
  }
  // side-by-side
  subToolsOpt.push({
    name: 'sbsviewer',
    icon: 'view_carousel',
    title: 'Side By Side Viewer',
    value: 'dbviewers',
    type: 'check',
    callback: toggleViewerMode,
  });
  // heatmap
  subToolsOpt.push({
    name: 'heatmap',
    icon: 'satellite',
    title: 'Heat Map',
    value: 'heatmap',
    type: 'btn',
    callback: openHeatmap,
  });
  subToolsOpt.push({
    name: 'labeling',
    icon: 'label',
    title: 'Labeling',
    value: 'labeling',
    type: 'btn',
    callback: function() {
      window.location.href = `../labeling/labeling.html${window.location.search}`;
    },
  });
  subToolsOpt.push({
    name: 'segment',
    icon: 'timeline',
    type: 'btn',
    value: 'rect',
    title: 'Segment',
    callback: function() {
      if (window.location.search.length > 0) {
        window.location.href =
          '../segment/segment.html' + window.location.search;
      } else {
        window.location.href = '../segment/segment.html';
      }
    },
  });
  subToolsOpt.push({
    name: 'model',
    icon: 'aspect_ratio',
    type: 'btn',
    value: 'rect',
    title: 'Predict',
    callback: function() {
      if (window.location.search.length > 0) {
        window.location.href = '../model/model.html' + window.location.search;
      } else {
        window.location.href = '../model/model.html';
      }
    },
  });

  // -- For Nano borb Start -- //
  if (ImgloaderMode == 'imgbox') {
    // download
    subToolsOpt.push({
      name: 'downloadmarks',
      icon: 'cloud_download',
      title: 'Download Marks',
      type: 'btn',
      value: 'download',
      callback: Store.prototype.DownloadMarksToFile,
    });
    subToolsOpt.push({
      name: 'uploadmarks',
      icon: 'cloud_upload',
      title: 'Load Marks',
      type: 'btn',
      value: 'upload',
      callback: Store.prototype.LoadMarksFromFile,
    });
  }
  // -- For Nano borb End -- //

  // -- view btn START -- //
  if (!($D.params.data.hasOwnProperty('review') && $D.params.data['review']=='true')) {
    subToolsOpt.push({
      name: 'review',
      icon: 'playlist_add_check',
      title: 'has reviewed',
      type: 'btn',
      value: 'review',
      callback: updateSlideView,
    });
  }
  // screenshot
  subToolsOpt.push({
    name: 'slideCapture',
    icon: 'camera_enhance',
    title: 'Slide Capture',
    type: 'btn',
    value: 'slCap',
    callback: captureSlide,
  });
  subToolsOpt.push({
    name: 'tutorial',
    icon: 'help',
    title: 'Tutorial',
    value: 'tutorial',
    type: 'btn',
    callback: function() {
      tour.init();
      tour.start(true);
    },
  });

  // Additional Links handler
  function additionalLinksHandler(url, openInNewTab, appendSlide) {
    if (appendSlide === true) {
      url = url + '?slide=' + $D.params.slideId;
      url = url + '&state=' + StatesHelper.encodeStates(StatesHelper.getCurrentStates());
    }
    if (openInNewTab === true) {
      window.open(url, '_blank').focus();
    } else {
      window.location.href = url;
    }
  }
  var additionalLinksConfig = await $CAMIC.store.getConfigByName('additional_links')
      .then((list)=>list.length==0?null:list[0]);
  if (additionalLinksConfig&&additionalLinksConfig.configuration&&Array.isArray(additionalLinksConfig.configuration)) {
    additionalLinksConfig.configuration.forEach((link)=>{
      var openInNewTab = link.openInNewTab === false ? false : true;
      var appendSlide = link.appendSlide === true ? true : false;
      var url = link.url;
      subToolsOpt.push({
        name: link.displayName,
        icon: link.icon ? link.icon : 'link',
        title: link.displayName,
        value: link.displayName,
        type: 'btn',
        callback: function() {
          additionalLinksHandler(url, openInNewTab, appendSlide);
        },
      });
    });
  }

  // create the tool bar
  $UI.toolbar = new CaToolbar({
    /* opts that need to think of*/
    id: 'ca_tools',
    zIndex: 601,
    mainToolsCallback: mainMenuChange,
    subTools: subToolsOpt,
  });

  // create two side menus for tools
  $UI.appsSideMenu = new SideMenu({
    id: 'side_apps',
    width: 300,
    // , isOpen:true
    callback: toggleSideMenu,
  });

  $UI.layersSideMenu = new SideMenu({
    id: 'side_layers',
    width: 250,
    contentPadding: 5,
    // , isOpen:true
    callback: toggleSideMenu,
  });

  const loading = `<div class="cover" style="z-index: 500;"><div class="block"><span>loading layers...</span><div class="bar"></div></div></div>`;
  $UI.layersSideMenu.addContent(loading);
  // TODO add layer viewer


  /* annotation popup */
  $UI.annotPopup = new PopupPanel({
    footer: [
      // { // edit
      //   title:'Edit',
      //   class:'material-icons',
      //   text:'notes',
      //   callback:annoEdit
      // },
      {
        // delete
        title: 'Delete',
        class: 'material-icons',
        text: 'delete_forever',
        callback: annoDelete,
      },
    ],
  });

  initModelModals();

  // TODO -- labels //
  $UI.labelsSideMenu = new SideMenu({
    id: 'labels_layers',
    width: 180,
    contentPadding: 5,
  });
  var labelsTitle = document.createElement('div');
  labelsTitle.classList.add('item_head');
  labelsTitle.textContent = 'Label Manager';

  $UI.labelsSideMenu.addContent(labelsTitle);

  $D.labels = await $CAMIC.store.getConfigByName('preset_label').then((list)=>list.length==0?null:list[0]);


  // onAdd()
  // onRemove(labels)
  // onUpdate(labels)
  // onSelected()
  $UI.labelsViewer = new LabelsViewer({
    id: 'labelmanager',
    data: $D.labels?$D.labels.configuration:[],
    onAdd: addPresetLabelsHandler,
    onEdit: editPresetLabelsHandler,
    onRemove: removePresetLabelsHandler,
    onSelected: selectedPresetLabelsHandler,
  },
  );
  $UI.labelsViewer.elt.parentNode.removeChild($UI.labelsViewer.elt);
  $UI.labelsSideMenu.addContent($UI.labelsViewer.elt);

  // == end -- //

  /* --- machine learning Assistant --- */
  $UI.AssistantSideMenu = new SideMenu({
    id: 'ml_assistant_layers',
    width: 'unset',
    contentPadding: 5,
    position: 'right',
    height: 'unset',
    top: '40px',
    borderRadius: '10px',
  });

  var AssistantTitle = document.createElement('div');
  AssistantTitle.classList.add('item_head');
  AssistantTitle.style.margin = 0;
  AssistantTitle.textContent = 'Annotation Assistant';
  $UI.AssistantSideMenu.addContent(AssistantTitle);

  // == end == //

  var checkOverlaysDataReady = setInterval(function() {
    if (
      $D.params.data &&
      $CAMIC &&
      $CAMIC.viewer &&
      $CAMIC.viewer.omanager
    ) {
      clearInterval(checkOverlaysDataReady);
      // for segmentation
      $CAMIC.viewer.createSegment({
        store: $CAMIC.store,
        slide: $D.params.data.slide,
        data: [],
      });

      // create control

      // TODO move to add layers
      // create main layer viewer items with states
      // const mainViewerData = $D.overlayers.map((d) => {
      //   const isShow =
      //     $D.params.states &&
      //     $D.params.states.l &&
      //     $D.params.states.l.includes(d.id) ?
      //       true :
      //       false;
      //   return {item: d, isShow: isShow};
      // });


      // TODO move to add layers
      // create monir layer viewer items
      // const minorViewerData = $D.overlayers.map((d) => {
      //   return {item: d, isShow: false};
      // });

      $UI.AssistantViewer = new Assistant({
        id: 'ml_assistant',
        viewer: $CAMIC.viewer,
      });
      $UI.AssistantViewer.elt.parentNode.removeChild($UI.AssistantViewer.elt);
      $UI.AssistantSideMenu.addContent($UI.AssistantViewer.elt);
      $UI.AssistantViewer.elt.style.display = 'none';
      AssistantTitle.addEventListener('click', () => {
        if ($UI.AssistantViewer.elt.style.display === 'none') {
          $UI.AssistantViewer.elt.style.display = '';
        } else {
          // $UI.AssistantViewer.enableBtn.checked = false;
          $UI.AssistantViewer.elt.style.display = 'none';
        }
      });

      // create UI and set data
      $UI.layersViewer = createLayerViewer(
          'overlayers',
          null,
          callback.bind('main'),
          rootCallback.bind('main'),
      );
      // create UI and set data - minor
      $UI.layersViewerMinor = createLayerViewer(
          'overlayersMinor',
          null,
          callback.bind('minor'),
          rootCallback.bind('minor'),
      );

      // TODO move to add layers
      // if ($D.params.states && $D.params.states.l) {
      //   $D.params.states.l.forEach((id) =>
      //     loadAnnotationById($CAMIC, $UI.layersViewer.getDataItemById(id), null),
      //   );
      // }

      $UI.layersList = new CollapsibleList({
        id: 'layerslist',
        list: [
          {
            id: 'left',
            title: 'Left Viewer',
            content: 'No Template Loaded', // $UI.annotOptPanel.elt
            // isExpand:true
          },
          {
            id: 'right',
            title: 'Right Viewer',
            content: 'No Template Loaded', // $UI.algOptPanel.elt,
          },
        ],
        changeCallBack: function(e) {
          // console.log(e);
        },
      });
      $UI.layersSideMenu.clearContent();
      // add to layers side menu
      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Layers Manager';

      $UI.layersSideMenu.addContent(title);

      // loading status
      $UI.loadStatus = document.createElement('div');
      $UI.loadStatus.style.display = 'none';
      $UI.loadStatus.classList.add('load-status');
      $UI.loadStatus.innerHTML = `<div class="material-icons loading">cached</div><div class="text">Loading</div>`;
      $UI.layersSideMenu.addContent($UI.loadStatus);

      // zoom locker control
      $UI.lockerPanel = document.createElement('div');
      $UI.lockerPanel.classList.add('lock_panel');
      $UI.lockerPanel.style.display = 'none';
      $UI.lockerPanel.innerHTML = `<label>Zoom Lock<input type="checkbox" checked></label>`;
      $UI.lockerPanel
          .querySelector('input[type=checkbox]')
          .addEventListener('change', (e) => {
            isLock = !isLock;
            if (isLock) {
              $minorCAMIC.viewer.viewport.zoomTo(
                  $CAMIC.viewer.viewport.getZoom(true),
                  $CAMIC.viewer.viewport.getCenter(true),
                  true,
              );
              $CAMIC.viewer.controls.bottomright.style.display = 'none';
            } else {
              $CAMIC.viewer.controls.bottomright.style.display = '';
            }
          });

      $UI.layersSideMenu.addContent($UI.lockerPanel);

      $UI.layersList.clearContent('left');
      $UI.layersList.addContent('left', $UI.layersViewer.elt);
      $UI.layersList.clearContent('right');
      $UI.layersList.addContent('right', $UI.layersViewerMinor.elt);

      $UI.layersList.elt.parentNode.removeChild($UI.layersList.elt);
      closeMinorControlPanel();
      $UI.layersSideMenu.addContent($UI.layersList.elt);
    }
  }, 300);

  var checkTemplateSchemasDataReady = setInterval(function() {
    if ($D.templates) {
      clearInterval(checkTemplateSchemasDataReady);
      const annotRegex = new RegExp('annotation', 'gi');
      const annotSchemas = $D.templates.filter((item) =>
        item.id.match(annotRegex),
      );
      /* annotation control */
      $UI.annotOptPanel = new OperationPanel({
        // id:
        // element:
        formSchemas: annotSchemas,
        resetCallback: resetCallback,
        action: {
          title: 'Save',
          callback: annoCallback,
        },
      });

      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Annotation';
      $UI.appsSideMenu.addContent(title);
      $UI.annotOptPanel.elt.classList.add('item_body');
      $UI.appsSideMenu.addContent($UI.annotOptPanel.elt);
    }
  }, 300);

  // Handle event
  $CAMIC.viewer.addHandler('open-add-model', () => {
    uploadModel();
  });

  $CAMIC.viewer.addHandler('open-model-info', () => {
    showInfo();
  });

  $CAMIC.viewer.addHandler('ml-draw-setting-change', () => {
    if (!$CAMIC.viewer.canvasDrawInstance) return;
    const canvasDraw = $CAMIC.viewer.canvasDrawInstance;

    if (canvasDraw._draws_data_.length) {
      canvasDraw.__endNewFeature(true);
    }
  });
}

function initModelModals() {
  // Create uploadModal for model uploads.
  $UI.uploadModal = new ModalBox({
    id: 'upload_panel',
    hasHeader: true,
    headerText: 'Upload Segmentation Model',
    hasFooter: false,
    provideContent: true,
    content: `
      <span>Add a segmentation model in
        <a target="_blank" href="https://www.tensorflow.org/js/tutorials/conversion/import_keras">TFJS format</a>.
         Some examples can be found <a target="_blank" href="https://github.com/camicroscope/tfjs-models/tree/master/Segmentation%20Sample%20Models">here</a>.
      </span>
      <br><hr>
      <form class="form-style" action="#">
        <ul>
          <li>
            <label align="left"> Name:  </label>
            <input name="name" id="name" type="text" required />
            <span> Name of the model </span>
          </li>
          <li>
            <label align="left"> Input patch size: </label>
            <input name="imageSize" id="imageSize" type="number" required />
            <span> The image size on which the model is trained (y x y)</span>
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
          <input name="filesupload" id="modelupload" type="file" required/><br><br>
          <input name="filesupload" id="weightsupload" type="file" multiple="" required/> <br> <br> </div>
          <div class="checktrue" > URL to the ModelAndWeightsConfig JSON describing the model. <br> <br>
          <label align-"left"> Enter the URL: </label> <input type="url" name="url" id="url" required> <br><br></div>
          <button id="submit">Upload</button> <span id="status"></span>
        </ul>

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
            <th>Input Size</th>
            <th>Size (MB)</th>
            <th>Date Saved</th>
            <th>Remove Model</th>
          </tr>
          <tbody id="mdata">
          </tbody>
        </thead>
      </table>
    `,
  });
}

// Shows the uploaded models' details
async function showInfo() {
  var data = await tf.io.listModels();
  var table = document.querySelector('#mdata');
  var tx = db.transaction('models_store', 'readonly');
  var store = tx.objectStore('models_store');
  var modelCount = 0;
  empty(table);
  // Update table data
  (function(callback) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const name = key.split('/').pop();
        const date = data[key].dateSaved.toString().slice(0, 15);
        const size = (data[key].modelTopologyBytes + data[key].weightDataBytes +
          data[key].weightSpecsBytes) / (1024*1024);
        const row = table.insertRow();
        let classes; let inputShape; let td;

        if (name.slice(0, 3) == 'seg') {
          store.get(name).onsuccess = function(e) {
            try {
              inputShape = e.target.result.input_shape.slice(1, 3).join('x');
            } catch (error) {}
            td = row.insertCell();
            td.innerText = name.split('_').splice(1).join('_').slice(0, -3);
            td = row.insertCell();
            td.innerText = inputShape;
            td = row.insertCell();
            td.innerText = +size.toFixed(2);
            td = row.insertCell();
            td.innerText = date;
            td = row.insertCell();
            td.innerHTML = '<button class="btn-del" '+
            'id=removeModel'+modelCount+' type="button"><i class="material-icons"'+
            'style="font-size:16px;">delete_forever</i>Remove Model</button>';
            document.getElementById('removeModel'+modelCount).addEventListener('click', () => {
              deleteModel(name);
            });
            modelCount += 1;
          };
        }
      }
    }
    callback;
  })($UI.infoModal.open());
}


async function deleteModel(name) {
  deletedmodelName = name.split('/').pop().split('_').splice(2).join('_').slice(0, -3);
  if (confirm('Are you sure you want to delete ' + deletedmodelName + ' model?')) {
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
        let popups = document.getElementById('popup-container');
        if (popups.childElementCount < 2) {
          let popupBox = document.createElement('div');
          popupBox.classList.add('popup-msg', 'slide-in');
          popupBox.innerHTML = `<i class="small material-icons">info</i>` + deletedmodelName + ` model deleted successfully`;
          popups.insertBefore(popupBox, popups.childNodes[0]);
          setTimeout(function() {
            popups.removeChild(popups.lastChild);
          }, 3000);
        }
        $UI.infoModal.close();
        initModelModals();
      }
    }
  } else {
    return;
  }
}

async function uploadModel() {
  modelName = [];
  Object.keys(await tf.io.listModels()).forEach(function(element) {
    const value = element.split('/').pop();
    if (value.slice(0, 3) == 'seg') {
      const title = element.split('/').pop().split('_')[1].slice(0, -3);
      console.log();
      modelName.push(title);
    }
  });
  var _name = document.querySelector('#name');
  var _imageSize = document.querySelector('#imageSize');
  var mag = document.querySelector('#magnification');
  var topology = document.querySelector('#modelupload');
  var weights = document.querySelector('#weightsupload');
  var status = document.querySelector('#status');
  var toggle = document.querySelector('#togBtn');
  var url = document.querySelector('#url');
  var refresh = document.querySelector('#refresh');
  var submit = document.querySelector('#submit');

  // Reset previous input
  _name.value = topology.value = weights.value = status.innerText = _imageSize.value = url.value = '';

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
    initModelModals();
  });

  submit.addEventListener('click', async function(e) {
    e.preventDefault();

    if ( _name.value && _imageSize.value &&
      ((!toggle.checked && topology.files[0].name.split('.').pop() == 'json') || (toggle.checked && url))) {
      status.innerText = 'Uploading';
      status.classList.remove('error');
      status.classList.add('blink');

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
        status.innerText = 'Model with the same name already exists. Please choose a new name';
        status.classList.remove('blink');
        console.log(e);
        return;
      }

      try {
        // This also ensures that valid model is uploaded.
        // Adding some extra digits in the end to maintain uniqueness
        const _channels = parseInt(document.querySelector('input[name="channels"]:checked').value);
        const size = parseInt(_imageSize.value);
        const name = 'seg-' + size.toString() +
        '-' + mag.value.toString() +
        '_' + _name.value +
        (new Date().getTime().toString()).slice(-4, -1);
        const model = await tf.loadLayersModel(modelInput);
        const result = model.predict(tf.ones([1, size, size, _channels]));
        const shape = result.shape;
        result.dispose();
        if (shape[1] != size || shape[2] != size) {
          console.info('Shape:', shape[1], shape[2]);
          throw new Error('The application only supports 1:1 image Masks. Import a valid model.');
        }

        await model.save(IDB_URL + name);

        // Update the model store db entry to have the classes array
        tx = db.transaction('models_store', 'readwrite');
        store = tx.objectStore('models_store');

        store.get(name).onsuccess = function(e) {
          const data = e.target.result;
          data['input_shape'] = [1, size, size, _channels];

          const req = store.put(data);
          req.onsuccess = function(e) {
            console.log('SUCCESS, ID:', e.target.result);
            modelName.push(_name.value);
            let popups = document.getElementById('popup-container');
            if (popups.childElementCount < 2) {
              let popupBox = document.createElement('div');
              popupBox.classList.add('popup-msg', 'slide-in');
              popupBox.innerHTML = `<i class="small material-icons">info</i>` + _name.value + ` model uploaded sucessfully`;
              popups.insertBefore(popupBox, popups.childNodes[0]);
              setTimeout(function() {
                popups.removeChild(popups.lastChild);
              }, 3000);
            }
            $UI.uploadModal.close();
            initModelModals();
          };
          req.onerror = function(e) {
            status.innerText = 'Some error this way!';
            console.log(e);
            status.classList.remove('blink');
          };
        };
      } catch (e) {
        status.classList.add('error');
        status.classList.remove('blink');
        if (toggle.checked) {
          status.innerText = 'Please enter a valid URL.';
        } else {
          status.innerText = 'Please enter a valid model. ' +
         'Input model.json in first input and all weight binaries in second one without renaming.';
        }
        console.error(e);
      }
    } else {
      status.innerText = 'Please fill out all the fields with valid values.';
      status.classList.add('error');
      console.error(e);
    }
  });
}

function createLayerViewer(id, viewerData, callback, rootCallback) {
  const layersViewer = new LayersViewer({
    id: id,
    data: viewerData,
    removeCallback: removeCallback,
    locationCallback: locationCallback,
    callback: callback,
    rootCallback: rootCallback,

  });
  layersViewer.elt.parentNode.removeChild(layersViewer.elt);
  return layersViewer;
}

// create lay panel for side-by-side control
function createLayPanelControl() {
  $UI.layCtrlbar = document.createElement('div');
  $UI.layCtrlbar.style = `
  display:none;
  margin: .2rem;
  background-color: #365f9c;
  cursor: default;
  padding: .5rem;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 1.2rem;`;

  createRadios();
  $UI.layersSideMenu.addContent($UI.layCtrlbar);
  // control
  const radios = $UI.layCtrlbar.querySelectorAll('input[name=ctrlPane]');
  radios.forEach((r) => {
    r.addEventListener('change', function(e) {
      const val = e.target.value;
      switch (val) {
        case 'main':
          $UI.layersViewer.elt.style.display = 'flex';
          $UI.layersViewerMinor.elt.style.display = 'none';
          break;
        case 'minor':
          $UI.layersViewer.elt.style.display = 'none';
          $UI.layersViewerMinor.elt.style.display = 'flex';
          break;
        default:
          // statements_def
          break;
      }
    });
  });
}

function createRadios() {
  const temp = `
  <input id="_3ojv6szi7" name="ctrlPane" type="radio" value="main" checked>
  <label for="_3ojv6szi7">Main(left)</label>
  <input id="_3ojv6szi8" name="ctrlPane" type="radio" value="minor">
  <label for="_3ojv6szi8">Minor(right)</label>
  `;
  $UI.layCtrlbar.innerHTML = temp;
}

function redirect(url, text = '', sec = 5) {
  let timer = sec;
  if (!timer) {
    window.location.href = url;
  }
  setInterval(function() {
    if (!timer) {
      window.location.href = url;
    }
    if (Loading.instance && Loading.instance.parentNode) {
      Loading.text.textContent = `${text} ${timer}s.`;
    } else {
      Loading.open(document.body, `${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;
  }, 1000);
}

function updateSlideView() {
  if (!confirm(`Do you want to mark this slide as reviewed?`)) return;
  Loading.open(document.body, 'changing review status ...');
  $CAMIC.store.updateSlideReview($D.params.slideId, 'true').then(function(e) {
    if (e.status==200) {
      $UI.toolbar.getSubTool('review').style.display = 'none';
    }
  }).finally(function() {
    Loading.close();
  });
}


function addHumanLayerItems() {
  const mainViewerItems = {
    'other': {
      item: {
        id: 'other',
        name: 'other',
      },
      items: [],
    },
  };

  $D.humanlayers.reduce((items, d)=> {
    const isShow =
      $D.params.states &&
      $D.params.states.l &&
      $D.params.states.l.includes(d.id) ?
        true:
        false;
    if (d.label&&d.label.id&&d.label.name) { // preset  label
      const {id, name} = d.label;
      if (!items[id]) {
        items[id] = {
          item: {
            id: id,
            name: name,
          },
          items: [],
        };
      }
      items[id].items.push({item: d, isShow});
    } else { // other
      items['other'].items.push({item: d, isShow});
    }
    return items;
  }, mainViewerItems);

  $UI.layersViewer.addHumanItems(mainViewerItems);

  // minor viewer minorViewer
  const minorViewerItems = {
    'other': {
      item: {
        id: 'other',
        name: 'other',
      },
      items: [],
    },
  };
  $D.humanlayers.reduce((items, d)=> {
    const isShow =
      $D.params.states &&
      $D.params.states.l &&
      $D.params.states.l.includes(d.id) ?
        true:
        false;
    if (d.label&&d.label.id&&d.label.name) {

    }
    if (d.label&&d.label.id&&d.label.name) { // preset  label
      const {id, name} = d.label;
      if (!items[id]) {
        items[id] = {
          item: {
            id: id,
            name: name,
          },
          items: [],
        };
      }
      items[id].items.push({item: d, isShow});
    } else { // other
      items['other'].items.push({item: d, isShow});
    }
    return items;
  }, minorViewerItems);

  $UI.layersViewerMinor.addHumanItems(minorViewerItems);
}
function openLoadStatus(text) {
  const txt = $UI.loadStatus.querySelector('.text');
  txt.textContent = `Loading ${text}`;
  $UI.loadStatus.style.display = null;
}
function closeLoadStatus() {
  $UI.loadStatus.style.display = 'none';
}
function addRulerLayerItems(data) {
  const mainViewerData = $D.rulerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  // create monir layer viewer items
  const minorViewerData = $D.rulerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  $UI.layersViewer.addItems(mainViewerData, 'ruler');
  $UI.layersViewerMinor.addItems(minorViewerData, 'ruler');
}

function addComputerLayerItems(data) {
  const mainViewerData = $D.computerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  // create monir layer viewer items
  const minorViewerData = $D.computerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  $UI.layersViewer.addItems(mainViewerData, 'segmentation');
  $UI.layersViewerMinor.addItems(minorViewerData, 'segmentation');
}

function addHeatmapLayerItems(data) {
  const mainViewerData = $D.heatmaplayers.map((d) => {
    return {item: d, isShow: false};
  });
  // create monir layer viewer items
  const minorViewerData = $D.heatmaplayers.map((d) => {
    return {item: d, isShow: false};
  });
  $UI.layersViewer.addItems(mainViewerData, 'heatmap');
  $UI.layersViewerMinor.addItems(minorViewerData, 'heatmap');
}

// const mainViewerData = $D.overlayers.map((d) => {
//   const isShow =
//     $D.params.states &&
//     $D.params.states.l &&
//     $D.params.states.l.includes(d.id) ?
//       true :
//       false;
//   return {item: d, isShow: isShow};
// });


// TODO move to add layers
// create monir layer viewer items
// const minorViewerData = $D.overlayers.map((d) => {
//   return {item: d, isShow: false};
// });

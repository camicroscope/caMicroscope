// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
let tracker;
let $minorCAMIC = null;
// for all instances of UI components
const $UI = new Map();

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
  if ('Escape' == key.toLocaleLowerCase()) {
    magnifierOff();
    measurementOff();
    annotationOff();
    presetLabelOff();
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
  var checkPackageIsReady = setInterval(function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // create a viewer and set up
      initCore();

      // loading the form template data
      FormTempaltesLoader();

      // loading the overlayers data
      HumanlayersLoader();

      // loading the overlayers data
      ComputerlayersLoader();

      // loading the heatmap overlayers data
      HeatmaplayersLoader();
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
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message);
      // can't reach Slide and return to home page
      if (e.isServiceError) redirect($D.pages.table, e.message, 0);
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
        $UI.annotPopup.setTitle(`id:${data.provenance.analysis.execution_id}`);
        $UI.annotPopup.setBody(body);
        if (warning) $UI.annotPopup.body.innerHTML += warning;

        $UI.annotPopup.open(e.position);
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

// initialize all UI components
async function initUIcomponents() {
  /* create UI components */

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

  // example for dropdownlist has icon in each item
  // subToolsOpt.push({
  //   name: "test",
  //   icon: "vpn_key", // material icons' name
  //   title: "test",
  //   type: "dropdown",
  //   value: "test",
  //   callback: function(e) {
  //     console.log(e);
  //   },
  //   dropdownList: [
  //     {
  //       name: "add",
  //       icon: "add",
  //       value:"add",
  //       title: "add"
  //     },
  //     {
  //       name: "add_box",
  //       icon: "add_box",
  //       value:"add_box",
  //       title: "add_box"
  //     },      {
  //       name: "add_circle",
  //       icon: "add_circle",
  //       value:"add_circle",
  //       title: "add_circle"
  //     },      {
  //       name: "block",
  //       icon: "block",
  //       value:"block",
  //       title: "block"
  //     }
  //   ]
  // });

  // brush

  // subToolsOpt.push({
  //   name: "brush",
  //   icon: "brush", // material icons' name
  //   title: "Brush Labels",
  //   type: "multi-dropdown",
  //   value: "brush",
  //   callback: toggleBrush,
  //   dropdownList: BRUSH_CONFIG
  // });

  // $D.preset_list = null;
  // $D.preset_list = await $CAMIC.store.getConfigByName('preset_label').then((list)=>list.length==0?null:list[0]);
  // if ($D.preset_list) {
  //   subToolsOpt.push({
  //     name: 'preset_label',
  //     icon: 'colorize', // material icons' name
  //     title: 'Preset Labels',
  //     type: 'multi-dropdown',
  //     value: 'prelabels',
  //     callback: drawLabel,
  //     dropdownList: $D.preset_list.configuration,
  //   });
  // }

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

  // bug report
  subToolsOpt.push({
    name: 'bugs',
    icon: 'bug_report',
    title: 'Bug Report',
    value: 'bugs',
    type: 'btn',
    callback: () => {
      window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53', '_blank').focus();
    },
  });
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


  var checkOverlaysDataReady = setInterval(function() {
    if (
      $D.params.data &&
      _l &&
      _c &&
      _h &&
      $D.overlayers &&
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

      // create main layer viewer items with states
      const mainViewerData = $D.overlayers.map((d) => {
        const isShow =
          $D.params.states &&
          $D.params.states.l &&
          $D.params.states.l.includes(d.id) ?
            true :
            false;
        return {item: d, isShow: isShow};
      });

      // create monir layer viewer items
      const minorViewerData = $D.overlayers.map((d) => {
        return {item: d, isShow: false};
      });

      // create UI and set data
      $UI.layersViewer = createLayerViewer(
          'overlayers',
          mainViewerData,
          callback.bind('main'),
      );
      // create UI and set data - minor
      $UI.layersViewerMinor = createLayerViewer(
          'overlayersMinor',
          minorViewerData,
          callback.bind('minor'),
      );

      //
      if ($D.params.states && $D.params.states.l) {
        $D.params.states.l.forEach((id) =>
          loadAnnotationById($CAMIC, $UI.layersViewer.getDataItemById(id), null),
        );
      }

      $UI.layersList = new CollapsibleList({
        id: 'layerslist',
        list: [
          {
            id: 'left',
            title: 'Left Viewer',
            // icon:'border_color',
            content: 'No Template Loaded', // $UI.annotOptPanel.elt
            // isExpand:true
          },
          {
            id: 'right',
            // icon:'find_replace',
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
      // START QUIP550 TEMPORARILY REMOVE Algorithm Panel //
      // add to layers side menu
      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Annotation';
      $UI.appsSideMenu.addContent(title);
      $UI.annotOptPanel.elt.classList.add('item_body');
      $UI.appsSideMenu.addContent($UI.annotOptPanel.elt);

      // $UI.appsList.clearContent('annotation');
      // $UI.appsList.addContent('annotation',$UI.annotOptPanel.elt);
      /* algorithm control */
      // const algoRegex = new RegExp('algo', 'gi');
      // const algoSchemas = $D.templates.filter(item => item.id.match(algoRegex));
      // $UI.algOptPanel = new OperationPanel({
      //   //id:
      //   //element:
      //   title:'Algorithm:',
      //   formSchemas:algoSchemas,
      //   action:{
      //     title:'Run',
      //     callback:algo_callback
      //   }
      // });
      // $UI.appsList.clearContent('analytics');
      // $UI.appsList.addContent('analytics',$UI.algOptPanel.elt);
      // $UI.appsList.addContent('analytics', AnalyticsPanelContent);
      // END QUIP550 TEMPORARILY REMOVE Algorithm Panel //
    }
  }, 300);

  // START QUIP550 //
  //   // collapsible list
  // $UI.appsList = new CollapsibleList({
  //   id:'collapsiblelist',
  //   list:[
  //     {
  //       id:'annotation',
  //       title:'Annotation',
  //       icon:'border_color',
  //       content: "No Template Loaded" //$UI.annotOptPanel.elt
  //       // isExpand:true

  //     }
  //     ,{
  //       id:'analytics',
  //       icon:'find_replace',
  //       title:'Analytics',
  //       content:"No Template Loaded" //$UI.algOptPanel.elt,
  //     }
  //   ],
  //   changeCallBack:getCurrentItem
  // });

  // // detach collapsible_list
  // $UI.appsList.elt.parentNode.removeChild($UI.appsList.elt);
  // $UI.appsSideMenu.addContent($UI.appsList.elt);
  // END QUIP550 //
  // $UI.multSelector = new MultSelector({id:'mult_selector'});
  // $UI.multSelector.addHandler('cancel',multSelector_cancel);
  // $UI.multSelector.addHandler('action',multSelectorAction);

  // add eventlistenter for two btns
  // const brushClearBtn = document.querySelector("#bctrl button.reset");
  // brushClearBtn.addEventListener("click", resetCallback);
  // const brushSaveBtn = document.querySelector("#bctrl button.action");
  // brushSaveBtn.addEventListener("click", function(e) {
  //   saveBrushLabel(false);
  // });
}
function createLayerViewer(id, viewerData, callback) {
  const layersViewer = new LayersViewer({
    id: id,
    data: viewerData,
    removeCallback: removeCallback,
    locationCallback: locationCallback,
    callback: callback,
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

// CAMIC is an instance of camicroscope core


// $CAMIC in there
let $CAMIC = null;
let $minorCAMIC = null;
let tracker;
let trackerMinor;
// for all instances of UI components
const $UI = new Map();

const $D = {
  pages: {
    home: '../table.html',
    table: '../table.html',
  },
  params: null, // parameter from url - slide Ids for both viewers.
  overlayers: null, // array for each layers
  templates: null, // json schema for prue-form
  segments: [],
};

window.addEventListener('keydown', (e) => {
  if ((!$CAMIC || !$CAMIC.viewer) && (!$minorCAMIC || !$minorCAMIC.viewer)) return;
  const key = e.key;
  // escape key to close all operations
  if ('escape' == key.toLocaleLowerCase()) {
    magnifierOff();
    measurementOff();
    //   annotationOff();
    presetLabelOff();
  }
});

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

// initialize cross viewer page
function initialize() {
  var checkPackageIsReady = setInterval(function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // create a viewer and set up
      initCore();

      // loading the form template data
      FormTempaltesLoader();

      // loading the overlayers data
      layersLoader();
    }
  }, 100);
}

function initCore() {
  // create the message queue
  $UI.message = new MessageQueue({position: 'bottom-left'});

  // zoom info and mmp
  const optMain = {
    navigatorSizeRatio: 0.3,
    draw: {
      // extend context menu btn group
      btns: [
        {
          // annotation
          type: 'btn',
          title: 'Annotation',
          class: 'material-icons',
          text: 'description',
          callback: function() {
            saveAnnotation('main');
          },
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
  const optMinor = {
    navigatorSizeRatio: 0.3,
    draw: {
      // extend context menu btn group
      btns: [
        {
          // annotation
          type: 'btn',
          title: 'Annotation',
          class: 'material-icons',
          text: 'description',
          callback: function() {
            saveAnnotation('minor');
          },
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
  try {
    const slideQueryMain = {};
    const slideQueryMinor = {};
    slideQueryMain.id = $D.params.main;
    slideQueryMinor.id = $D.params.minor;
    optMain.addRulerCallback = function(ruler) {
      onAddRuler(ruler, 'main');
    };
    optMain.deleteRulerCallback = function(ruler) {
      onDeleteRuler(ruler, 'main');
    };
    optMinor.addRulerCallback = function(ruler) {
      onAddRuler(ruler, 'minor');
    };
    optMinor.deleteRulerCallback = function(ruler) {
      onDeleteRuler(ruler, 'minor');
    }; ;
    $CAMIC = new CaMic('main_viewer', slideQueryMain, optMain);
    $minorCAMIC = new CaMic('minor_viewer', slideQueryMinor, optMinor);
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
      $D.params.mainData = e;
      // popup panel
      $CAMIC.viewer.addHandler('canvas-lay-click', function(e) {
        if (!e.data) {
          $UI.annotPopupMain.close();
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

            $UI.annotPopupMain.showFooter();
            break;
          case 'computer':
            // handle data.provenance.analysis.computation = `segmentation`
            attributes = data.properties.scalar_features[0].nv;
            body = {type: 'map', data: attributes};
            $UI.annotPopupMain.hideFooter();
            break;
          default:
            return;
            // statements_def
            break;
        }

        $UI.annotPopupMain.data = {
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
                            items[key].items.some((i)=>i.item.id == $UI.annotPopupMain.data.id)) break;
            }
          }
          return dataType;
        };


        $UI.annotPopupMain.dataType = null;
        $UI.annotPopupMain.dataType = data.provenance && data.provenance.analysis &&
                                        data.provenance.analysis.source && data.provenance.analysis.source=='human'?
                getCateName($UI.annotPopupMain.data.id):null;

        $UI.annotPopupMain.setTitle(`id:${data.provenance.analysis.execution_id}`);
        $UI.annotPopupMain.setBody(body);
        if (warning) $UI.annotPopupMain.body.innerHTML += warning;

        $UI.annotPopupMain.open(e.position);
      });
      // spyglass
      $UI.spyglassMain = new Spyglass({
        targetViewer: $CAMIC.viewer,
        imgsrc: $D.params.mainData.url,
      });
    }
  });
  $minorCAMIC.loadImg(function(e) {
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message);
      // can't reach Slide and return to home page
      if (e.isServiceError) redirect($D.pages.table, e.message, 0);
    } else {
      $D.params.minorData = e;
      // popup panel
      $minorCAMIC.viewer.addHandler('canvas-lay-click', function(e) {
        if (!e.data) {
          $UI.annotPopupMinor.close();
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

            $UI.annotPopupMinor.showFooter();
            break;
          case 'computer':
            // handle data.provenance.analysis.computation = `segmentation`
            attributes = data.properties.scalar_features[0].nv;
            body = {type: 'map', data: attributes};
            $UI.annotPopupMinor.hideFooter();
            break;
          default:
            return;
            // statements_def
            break;
        }

        $UI.annotPopupMinor.data = {
          id: data.provenance.analysis.execution_id,
          oid: data._id.$oid,
          annotation: attributes,
          selected: e.data.selected,
        };
        const getCateName = () => {
          const items = $UI.layersViewerMinor.setting.categoricalData.human.items;
          var dataType = null;
          for (const key in items) {
            if ({}.hasOwnProperty.call(items, key)) {
              dataType = key;
              if (items.hasOwnProperty(key)&&
                            Array.isArray(items[key].items)&&
                            items[key].items.some((i)=>i.item.id == $UI.annotPopupMinor.data.id)) break;
            }
          }
          return dataType;
        };


        $UI.annotPopupMinor.dataType = null;
        $UI.annotPopupMinor.dataType = data.provenance && data.provenance.analysis &&
                                        data.provenance.analysis.source && data.provenance.analysis.source=='human'?
                getCateName($UI.annotPopupMinor.data.id):null;

        $UI.annotPopupMinor.setTitle(`id:${data.provenance.analysis.execution_id}`);
        $UI.annotPopupMinor.setBody(body);
        if (warning) $UI.annotPopupMinor.body.innerHTML += warning;

        $UI.annotPopupMinor.open(e.position);
      });
      // spyglass
      $UI.spyglassMinor = new Spyglass({
        targetViewer: $minorCAMIC.viewer,
        imgsrc: $D.params.minorData.url,
      });
    }
  });

  let mainOpenTag = false;
  let minorOpenTag = false;

  $CAMIC.viewer.addHandler('open', function() {
    $CAMIC.viewer.canvasDrawInstance.addHandler('start-drawing', (e) => {
      startDrawing(e, 'main');
    });
    $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', (e) => {
      stopDrawing(e, 'main');
    });
    mainOpenTag = true;
  });
  $minorCAMIC.viewer.addHandler('open', function() {
    $minorCAMIC.viewer.canvasDrawInstance.addHandler('start-drawing', (e) => {
      startDrawing(e, 'minor');
    });
    $minorCAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', (e) => {
      stopDrawing(e, 'minor');
    });
    minorOpenTag = true;
  });
  var checkViewersOpen = setInterval(function() {
    if (mainOpenTag && minorOpenTag) {
      clearInterval(checkViewersOpen);
      // create the message bar TODO for reading slide Info TODO
      $UI.slideInfosMain = new CaMessage({
        /* opts that need to think of*/
        id: 'cames_main',
        defaultText: `Slide: ${$D.params.mainData.name}`,
      });
      $UI.slideInfosMinor = new CaMessage({
        /* opts that need to think of*/
        id: 'cames_minor',
        defaultText: `Slide: ${$D.params.minorData.name}`,
      });
      initUIcomponents();
      // action tracker start
      tracker = new Tracker($CAMIC, $D.params.mainData._id.$oid, getUserId());
      tracker.start();
      trackerMinor = new Tracker($minorCAMIC, $D.params.minorData._id.$oid, getUserId());
      trackerMinor.start();
    }
  }, 100);
}
async function initUIcomponents() {
  const subToolsOpt = [];
  // back to viewer
  subToolsOpt.push({
    icon: 'insert_photo',
    type: 'btn',
    value: 'viewer',
    title: 'Viewer',
    callback: function() {
      if ($D.params.main) {
        window.location.href = '../viewer/viewer.html?slideId=' + $D.params.main;
      } else {
        window.location.href = '../viewer/viewer.html';
      }
    },
  });
  // annotations
  subToolsOpt.push({
    name: 'annotation',
    icon: 'create',
    title: 'Draw',
    type: 'multistates-dropdown',
    value: 'annoDraw',
    dropdownList: [
      {
        name: 'Left Viewer Annotations',
        icon: 'arrow_left', // material icons' name
        title: 'Left Viewer',
        type: 'multistates',
        callback: function(e) {
          draw.call(this, e, 'main');
        },
      },
      {
        name: 'Right Viewer Annotations',
        icon: 'arrow_right', // material icons' name
        title: 'Right Viewer',
        type: 'multistates',
        callback: function(e) {
          draw.call(this, e, 'minor');
        },
      },
    ],
    callback: function(data) {
      console.log(data);
    },
  });

  // preset labels
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
  // measure
  if ($CAMIC.viewer.measureInstance || $minorCAMIC.viewer.measureInstance) {
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
  // screenshot
  subToolsOpt.push({
    name: 'slideCapture',
    icon: 'camera_enhance',
    title: 'Slide Capture',
    type: 'btn',
    value: 'slCap',
    callback: captureSlide,
  });

  // create toolbar
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
  // create layers manager
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
  $UI.annotPopupMain = new PopupPanel({
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
        callback: function(data, parentType) {
          annoDelete(data, parentType, 'main');
        },
      },
    ],
  });
  $UI.annotPopupMinor = new PopupPanel({
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
        callback: function(data, parentType) {
          annoDelete(data, parentType, 'minor');
        },
      },
    ],
  });

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

  var checkOverlaysDataReady = setInterval(function() {
    if (
      $D.params.mainData &&
          $CAMIC &&
          $CAMIC.viewer &&
          $CAMIC.viewer.omanager &&
          $D.params.minorData &&
          $minorCAMIC &&
          $minorCAMIC.viewer &&
          $minorCAMIC.viewer.omanager
    ) {
      clearInterval(checkOverlaysDataReady);
      // for segmentation
      $CAMIC.viewer.createSegment({
        store: $CAMIC.store,
        slide: $D.params.mainData.slide,
        data: [],
      });
      $minorCAMIC.viewer.createSegment({
        store: $minorCAMIC.store,
        slide: $D.params.minorData.slide,
        data: [],
      });

      // create UI and set data
      $UI.layersViewer = createLayerViewer(
          'overlayers',
          null,
          callback.bind('main'),
          rootCallback.bind('main'),
          function(layerData, parentType) {
            removeCallback(layerData, parentType, 'main');
          },
          function(layerData) {
            locationCallback(layerData, 'main');
          },
          'main',
      );
      // create UI and set data - minor
      $UI.layersViewerMinor = createLayerViewer(
          'overlayersMinor',
          null,
          callback.bind('minor'),
          rootCallback.bind('minor'),
          function(layerData, parentType) {
            removeCallback(layerData, parentType, 'minor');
          },
          function(layerData) {
            locationCallback(layerData, 'minor');
          },
          'minor',
      );

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
      // $UI.lockerPanel.style.display = 'none';
      $UI.lockerPanel.innerHTML = `<label>Slide Sync<input type="checkbox"></label>`;

      $UI.layersSideMenu.addContent($UI.lockerPanel);

      $UI.layersList.clearContent('left');
      $UI.layersList.addContent('left', $UI.layersViewer.elt);
      $UI.layersList.clearContent('right');
      $UI.layersList.addContent('right', $UI.layersViewerMinor.elt);

      $UI.layersList.elt.parentNode.removeChild($UI.layersList.elt);
      $UI.layersList.displayContent('left', true, 'head');
      $UI.layersList.triggerContent('left', 'close');
      $UI.layersList.displayContent('right', true);
      $UI.layersList.triggerContent('right', 'open');
      $UI.layersSideMenu.addContent($UI.layersList.elt);

      $UI.lockerPanel.querySelector('label input[type=\'checkbox\']').addEventListener('input', (opt) => {
        if (opt.target.checked) {
          //   for (let index = 0; index < document.getElementsByClassName('crossview_layer').length; index++) {
          //     document.getElementsByClassName('crossview_layer')[index].style.display = 'none';
          //   }
          addSynchronizationHandlers();
        } else {
          // for (let index = 0; index < document.getElementsByClassName('crossview_layer').length; index++) {
          //     document.getElementsByClassName('crossview_layer')[index].style.display = '';
          //   }
          removeSynchronizationHandlers();
        }
      });
      /* TODO : Manual Configuration for Sync
          setZoomControlLayer('main');
          setZoomControlLayer('minor');
          // TODO : Rotation Bar
           // setRotationControlLayer('main');
           // setRotationControlLayer('minor');

          setOriginControlLayer('main');
          setOriginControlLayer('minor');
          */
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
        resetCallback: function(data) {
          resetCallback(data, 'check');
        },
        action: {
          title: 'Save',
          callback: function(data) {
            annoCallback(data, 'check');
          },
        },
      });

      // $UI.annotOptPanelMinor = new OperationPanel({
      //     // id:
      //     // element:
      //     formSchemas: annotSchemasMinor,
      //     resetCallback: function(data){
      //         resetCallback(data, 'minor');
      //     },
      //     action: {
      //     title: 'Save',
      //     callback: function(data){
      //         annoCallback(data, 'minor');
      //     },
      //     },
      // });

      // START QUIP550 TEMPORARILY REMOVE Algorithm Panel //
      // add to layers side menu
      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Annotation';
      $UI.appsSideMenu.addContent(title);
      $UI.annotOptPanel.elt.classList.add('item_body');
      $UI.appsSideMenu.addContent($UI.annotOptPanel.elt);

      // const titleMinor = document.createElement('div');
      // titleMinor.classList.add('item_head');
      // titleMinor.textContent = 'Annotation for Right Viewer';
      // $UI.appsSideMenuMinor.addContent(title);
      // $UI.annotOptPanelMinor.elt.classList.add('item_body');
      // $UI.appsSideMenuMinor.addContent($UI.annotOptPanelMinor.elt);

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
}

function createLayerViewer(id, viewerData, callback, rootCallback, removeCallback, locationCallback, viewerName) {
  const layersViewer = new LayersViewer({
    id: id,
    data: viewerData,
    removeCallback: removeCallback,
    locationCallback: locationCallback,
    callback: callback,
    rootCallback: rootCallback,
    crossview: true,
    viewerName: viewerName,
  });
  layersViewer.elt.parentNode.removeChild(layersViewer.elt);
  return layersViewer;
}

function addHumanLayerItems(viewer) {
  // main viewer
  if (viewer === 'main') {
    // TODO Add Preset Labels Data
    const mainViewerItems = $D.labels.configuration.reduce((rs, label)=>{
      rs[label.type] = {
        item: {
          id: label.type,
          name: label.type,
        },
        items: [],
      };
      return rs;
    }, {});

    mainViewerItems['other'] = {
      item: {
        id: 'other',
        name: 'other',
      },
      items: [],
    };

    $D.humanlayers.main.reduce((items, d)=> {
      const isShow =
                $D.params.states &&
                $D.params.states.l &&
                $D.params.states.l.includes(d.id) ?
                true:
                false;
      var isFind = false;
      for (const key in items) {
        if (d.id.includes(`${key}_`)) {
          isFind = true;
          items[key].items.push({item: d, isShow});
        }
      }
      if (!isFind) items['other'].items.push({item: d, isShow});
      return items;
    }, mainViewerItems);

    $UI.layersViewer.addHumanItems(mainViewerItems);
  } else {
    // minor viewer
    const minorViewerItems = $D.labels.configuration.reduce((rs, label)=>{
      rs[label.type] = {
        item: {
          id: label.type,
          name: label.type,
        },
        items: [],
      };
      return rs;
    }, {});

    // const minorViewerItems = {};

    minorViewerItems['other'] = {
      item: {
        id: 'other',
        name: 'other',
      },
      items: [],
    };

    $D.humanlayers.minor.reduce((items, d)=> {
      const isShow =
                $D.params.states &&
                $D.params.states.l &&
                $D.params.states.l.includes(d.id) ?
                true:
                false;
      var isFind = false;
      for (const key in items) {
        if (d.id.includes(`${key}_`)) {
          isFind = true;
          items[key].items.push({item: d, isShow});
        }
      }
      if (!isFind) items['other'].items.push({item: d, isShow: true});
      return items;
    }, minorViewerItems);
    $UI.layersViewerMinor.addHumanItems(minorViewerItems);
  }
  return;
}

function addRulerLayerItems(viewer) {
  if (viewer === 'main') {
    const mainViewerData = $D.rulerlayers.main.map((d) => {
      return {item: d, isShow: false};
    });
    $UI.layersViewer.addItems(mainViewerData, 'ruler');
  } else {
    // create minor layer viewer items
    const minorViewerData = $D.rulerlayers.minor.map((d) => {
      return {item: d, isShow: false};
    });
    $UI.layersViewerMinor.addItems(minorViewerData, 'ruler');
  }
}

function addComputerLayerItems(viewer) {
  if (viewer === 'main') {
    const mainViewerData = $D.computerlayers.main.map((d) => {
      return {item: d, isShow: false};
    });
    $UI.layersViewer.addItems(mainViewerData, 'segmentation');
  } else {
    // create minor layer viewer items
    const minorViewerData = $D.computerlayers.minor.map((d) => {
      return {item: d, isShow: false};
    });
    $UI.layersViewerMinor.addItems(minorViewerData, 'segmentation');
  }
}

function addHeatmapLayerItems(viewer) {
  if (viewer === 'main') {
    const mainViewerData = $D.heatmaplayers.main.map((d) => {
      return {item: d, isShow: false};
    });
    $UI.layersViewer.addItems(mainViewerData, 'heatmap');
  } else {
    // create minor layer viewer items
    const minorViewerData = $D.heatmaplayers.minor.map((d) => {
      return {item: d, isShow: false};
    });
    $UI.layersViewerMinor.addItems(minorViewerData, 'heatmap');
  }
}

function openLoadStatus(text) {
  const txt = $UI.loadStatus.querySelector('.text');
  txt.textContent = `Loading ${text}`;
  $UI.loadStatus.style.display = null;
}

function closeLoadStatus() {
  $UI.loadStatus.style.display = 'none';
}

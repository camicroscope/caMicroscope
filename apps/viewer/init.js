// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
let tracker;
let $minorCAMIC = {};
// for all instances of UI components
const $UI = new Map();

// preset pens
// const PEN_CONFIG = [
//   {
//     title: "Lymph",
//     value: "Lymph",
//     children: [
//       {
//         title: "Positive",
//         value: "Positive",
//         children: [
//           {
//             title: 100,
//             value: 100,
//             color: "#ff6296",
//             checked: true,
//             data: {
//               color: "#ff6296",
//               mode: "grid",
//               type: "Lymph-Positive",
//               size: 100
//             }
//           },
//           {
//             title: "Point",
//             value: "Point",
//             color: "#ff6296",
//             data: { color: "#ff6296", mode: "point", type: "Lymph-Positive" }
//           }
//         ]
//       },
//       {
//         title: "Negative",
//         value: "Negative",
//         children: [
//           {
//             title: 100,
//             value: 100,
//             color: "#62ffcb",
//             data: {
//               color: "#62ffcb",
//               mode: "grid",
//               type: "Lymph-Negative",
//               size: 100
//             }
//           },
//           {
//             title: "Point",
//             value: "Point",
//             color: "#62ffcb",
//             data: {
//               color: "#62ffcb",
//               mode: "point",
//               type: "Lymph-Negative"
//             }
//           }
//         ]
//       }
//     ]
//   },
//   {
//     title: "Neutrophil",
//     value: "Neutrophil",
//     children: [
//       {
//         title: "Positive",
//         value: "Positive",
//         color: "#ffcb62",
//         data: {
//           color: "#ffcb62",
//           mode: "grid",
//           type: "Neutrophil-Positive",
//           size: 50
//         }
//       },
//       {
//         title: "Negative",
//         value: "Negative",
//         color: "#6296ff",
//         data: {
//           color: "#6296ff",
//           mode: "grid",
//           type: "Neutrophil-Negative",
//           size: 50
//         }
//       }
//     ]
//   },
//   {
//     title: "Necrosis",
//     value: "Necrosis",
//     children: [
//       {
//         title: "Positive",
//         value: "Positive",
//         children: [
//           {
//             title: 100,
//             value: 100,
//             color: "#ff00d9",
//             data: {
//               color: "#ff00d9",
//               mode: "grid",
//               type: "Necrosis-Positive",
//               size: 100
//             }
//           },
//           {
//             title: 500,
//             value: 500,
//             color: "#ff00d9",
//             data: {
//               color: "#ff00d9",
//               mode: "grid",
//               type: "Necrosis-Positive",
//               size: 500
//             }
//           }
//         ]
//       },
//       {
//         title: "Negative",
//         value: "Negative",
//         children: [
//           {
//             title: 100,
//             value: 100,
//             color: "#00ff26",
//             data: {
//               color: "#00ff26",
//               mode: "grid",
//               type: "Necrosis-Negative",
//               size: 100
//             }
//           },
//           {
//             title: 500,
//             value: 500,
//             color: "#00ff26",
//             data: {
//               color: "#00ff26",
//               mode: "grid",
//               type: "Necrosis-Negative",
//               size: 500
//             }
//           }
//         ]
//       }
//     ]
//   },
//   {
//     title: "Tumor",
//     value: "Tumor",
//     children: [
//       {
//         title: "Positive",
//         value: "Positive",
//         children: [
//           {
//             title: 100,
//             value: 100,
//             color: "#790cff",
//             data: {
//               color: "#790cff",
//               mode: "grid",
//               type: "Tumor-Positive",
//               size: 100
//             }
//           },
//           {
//             title: 300,
//             value: 300,
//             color: "#790cff",
//             data: {
//               color: "#790cff",
//               mode: "grid",
//               type: "Tumor-Positive",
//               size: 300
//             }
//           },
//           {
//             title: 1000,
//             value: 1000,
//             color: "#790cff",
//             data: {
//               color: "#790cff",
//               mode: "grid",
//               type: "Tumor-Positive",
//               size: 1000
//             }
//           },
//           {
//             title: 2000,
//             value: 2000,
//             color: "#790cff",
//             data: {
//               color: "#790cff",
//               mode: "grid",
//               type: "Tumor-Positive",
//               size: 2000
//             }
//           }
//         ]
//       },
//       {
//         title: "Negative",
//         value: "Negative",
//         children: [
//           {
//             title: 100,
//             value: 100,
//             color: "#92ff0c",
//             data: {
//               color: "#92ff0c",
//               mode: "grid",
//               type: "Tumor-Negative",
//               size: 100
//             }
//           },
//           {
//             title: 300,
//             value: 300,
//             color: "#92ff0c",
//             data: {
//               color: "#92ff0c",
//               mode: "grid",
//               type: "Tumor-Negative",
//               size: 300
//             }
//           },
//           {
//             title: 1000,
//             value: 1000,
//             color: "#92ff0c",
//             data: {
//               color: "#92ff0c",
//               mode: "grid",
//               type: "Tumor-Negative",
//               size: 1000
//             }
//           },
//           {
//             title: 2000,
//             value: 2000,
//             color: "#92ff0c",
//             data: {
//               color: "#92ff0c",
//               mode: "grid",
//               type: "Tumor-Negative",
//               size: 2000
//             }
//           }
//         ]
//       }
//     ]
//   },
//   {
//     title: "Prostate",
//     value: "Prostate",
//     children: [
//       {
//         title: "Benign",
//         value: "Benign",
//         color: "#8dd3c7",
//         checked: true,
//         data: { color: "#8dd3c7", mode: "free", type: "Prostate-Benign" }
//       },
//       {
//         title: "Gleason 3",
//         value: "Gleason 3",
//         color: "#ffffb3",
//         data: { color: "#ffffb3", mode: "free", type: "Prostate-Gleason 3" }
//       },
//       {
//         title: "Gleason 4",
//         value: "Gleason 4",
//         color: "#bebada",
//         data: { color: "#bebada", mode: "free", type: "Prostate-Gleason 4" }
//       },
//       {
//         title: "Gleason 5",
//         value: "Gleason 5",
//         color: "#fb8072",
//         data: { color: "#fb8072", mode: "free", type: "Prostate-Gleason 5" }
//       },
//       {
//         title: "Cancer NOS",
//         value: "Cancer NOS",
//         color: "#80b1d3",
//         data: { color: "#80b1d3", mode: "free", type: "Prostate-Cancer NOS" }
//       }
//     ]
//   },
//   {
//     title: "NSCLC",
//     value: "NSCLC",
//     children: [
//       {
//         title: "Benign",
//         value: "Benign",
//         color: "#fdb462",
//         data: { color: "#fdb462", mode: "free", type: "NSCLC-Benign" }
//       },
//       {
//         title: "Squamous CA",
//         value: "Squamous CA",
//         color: "#b3de69",
//         data: { color: "#b3de69", mode: "free", type: "NSCLC-Squamous CA" }
//       },
//       {
//         title: "Adeno CA (all)",
//         value: "Adeno CA (all)",
//         color: "#fccde5",
//         data: { color: "#fccde5", mode: "free", type: "NSCLC-Adeno CA (all)" }
//       },
//       {
//         title: "Acinar",
//         value: "Acinar",
//         color: "#d9d9d9",
//         data: { color: "#d9d9d9", mode: "free", type: "NSCLC-Acinar" }
//       },
//       {
//         title: "Lapidic",
//         value: "Lapidic",
//         color: "#bc80bd",
//         data: { color: "#bc80bd", mode: "free", type: "NSCLC-Lapidic" }
//       },
//       {
//         title: "Solid",
//         value: "Solid",
//         color: "#ccebc5",
//         data: { color: "#ccebc5", mode: "free", type: "NSCLC-Solid" }
//       },
//       {
//         title: "Papillary",
//         value: "Papillary",
//         color: "#ffed6f",
//         data: { color: "#ffed6f", mode: "free", type: "NSCLC-Papillary" }
//       },
//       {
//         title: "Micropapillary",
//         value: "Micropapillary",
//         color: "#6a3d9a",
//         data: { color: "#6a3d9a", mode: "free", type: "NSCLC-Micropapillary" }
//       }
//     ]
//   }
// ];

const $D = {
  pages: {
    home: "../table.html",
    table: "../table.html"
  },
  params: null, // parameter from url - slide Id and status in it (object).
  overlayers: null, // array for each layers
  templates: null, // json schema for prue-form
  segments: []
};

window.addEventListener("keydown", e => {
  if (!$CAMIC || !$CAMIC.viewer) return;
  const keyCode = e.keyCode;
  // escape key to close all operations
  if (keyCode == 27) {
    magnifierOff();
    measurementOff();
    annotationOff();
  }

  // open annotation (ctrl + a)
  if (e.ctrlKey && keyCode == 65 && $CAMIC.viewer.canvasDrawInstance) {
    const li = $UI.toolbar.getSubTool("annotation");
    eventFire(li, "click");
    return;
  }
  // open magnifier (ctrl + m)
  if (e.ctrlKey && keyCode == 77 && $UI.spyglass) {
    const li = $UI.toolbar.getSubTool("magnifier");
    const chk = li.querySelector("input[type=checkbox]");
    chk.checked = !chk.checked;
    eventFire(chk, "change");
    return;
  }
  // open measurement (ctrl + r)
  if (e.ctrlKey && keyCode == 82 && $CAMIC.viewer.measureInstance) {
    const li = $UI.toolbar.getSubTool("measurement");
    const chk = li.querySelector("input[type=checkbox]");
    chk.checked = !chk.checked;
    eventFire(chk, "click");
    return;
  }
  // open side-by-side (ctrl + s)
  if (e.ctrlKey && keyCode == 83) {
    const li = $UI.toolbar.getSubTool("sbsviewer");
    const chk = li.querySelector("input[type=checkbox]");
    chk.checked = !chk.checked;
    eventFire(chk, "click");
    return;
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
      OverlayersLoader();

      // loading the heatmap overlayers data
      HeatmaplayersLoader();
    }
  }, 100);
}

// setting core functionalities
function initCore() {
  // start initial

  // create the message queue
  $UI.message = new MessageQueue();

  // zoom info and mmp
  const opt = {
    draw: {
      // extend context menu btn group
      btns: [
        {
          // annotation
          type: "btn",
          title: "Annotation",
          class: "material-icons",
          text: "description",
          callback: saveAnnotation
        },
        {
          // analytics
          type: "btn",
          title: "Analytics",
          class: "material-icons",
          text: "settings_backup_restore",
          callback: saveAnalytics
        }
      ]
    }
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }
  // pathdb home directly
  if ($D.params.mode == "pathdb") {
    $D.pages.home = "../../../";
    $D.pages.table = "../../../";
  }

  try {
    let slideQuery = {};
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    $CAMIC = new CaMic("main_viewer", slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError("Core Initialization Failed");
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
      $CAMIC.viewer.addHandler("canvas-lay-click", function(e) {
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
          case "human":
            let area;
            let circumference;
            if (data.geometries) {
              if (
                (data.selected != null || data.selected != undefined) &&
                data.geometries.features[data.selected] &&
                data.geometries.features[data.selected].properties.area
              )
                area = `${Math.round(
                  data.geometries.features[data.selected].properties.area
                )}μm^2`;
              if (
                (data.selected != null || data.selected != undefined) &&
                data.geometries.features[data.selected] &&
                data.geometries.features[data.selected].properties.circumference
              )
                circumference = `${Math.round(
                  data.geometries.features[data.selected].properties
                    .circumference
                )}μm`;
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
          case "computer":
            // handle data.provenance.analysis.computation = `segmentation`
            attributes = data.properties.scalar_features[0].nv;
            body = { type: "map", data: attributes };
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
          selected: e.data.selected
        };
        $UI.annotPopup.setTitle(`id:${data.provenance.analysis.execution_id}`);
        $UI.annotPopup.setBody(body);
        if (warning) $UI.annotPopup.body.innerHTML += warning;

        $UI.annotPopup.open(e.position);
      });

      // create the message bar TODO for reading slide Info TODO
      $UI.slideInfos = new CaMessage({
        /* opts that need to think of*/
        id: "cames",
        defaultText: `Slide: ${$D.params.data.name}`
      });

      // spyglass
      $UI.spyglass = new Spyglass({
        targetViewer: $CAMIC.viewer,
        imgsrc: $D.params.data.url
      });
    }
  });

  $CAMIC.viewer.addHandler("open", function() {
    $CAMIC.viewer.canvasDrawInstance.addHandler("start-drawing", startDrawing);
    $CAMIC.viewer.canvasDrawInstance.addHandler("stop-drawing", stopDrawing);
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
    id: "modalbox",
    hasHeader: true,
    headerText: "HeatMap List",
    hasFooter: false
  });

  const subToolsOpt = [];
  // home
  if (ImgloaderMode == "iip")
    subToolsOpt.push({
      name: "home",
      icon: "home", // material icons' name
      title: "Home",
      type: "btn", // btn/check/dropdown
      value: "home",
      callback: goHome
    });
  // pen
  subToolsOpt.push({
    name: "annotation",
    icon: "create", // material icons' name
    title: "Draw",
    type: "multistates",
    callback: draw
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

  $D.preset_list = null;
  $D.preset_list = await $CAMIC.store.getConfigByName('preset_label').then(list=>list.length==0?null:list[0]);
  if($D.preset_list){
  subToolsOpt.push({
    name: "preset_label",
    icon: "colorize", // material icons' name
    title: "Preset Labels",
    type: "multi-dropdown",
    value: "prelabels",
    callback: drawLabel,
    dropdownList: $D.preset_list.configuration
  });
}

  // magnifier
  subToolsOpt.push({
    name: "magnifier",
    icon: "search",
    title: "Magnifier",
    type: "dropdown",
    value: "magn",
    dropdownList: [
      {
        value: 0.5,
        title: "0.5",
        checked: true
      },
      {
        value: 1,
        title: "1.0"
      },
      {
        value: 2,
        title: "2.0"
      }
    ],
    callback: toggleMagnifier
  });
  // measurement tool
  if ($CAMIC.viewer.measureInstance)
    subToolsOpt.push({
      name: "measurement",
      icon: "space_bar",
      title: "Measurement",
      type: "check",
      value: "measure",
      callback: toggleMeasurement
    });
  // share
  if (ImgloaderMode == "iip")
    subToolsOpt.push({
      name: "share",
      icon: "share",
      title: "Share View",
      type: "btn",
      value: "share",
      callback: shareURL
    });
  // side-by-side
  subToolsOpt.push({
    name: "sbsviewer",
    icon: "view_carousel",
    title: "Side By Side Viewer",
    value: "dbviewers",
    type: "check",
    callback: toggleViewerMode
  });
  // heatmap
  subToolsOpt.push({
    name: "heatmap",
    icon: "satellite",
    title: "Heat Map",
    value: "heatmap",
    type: "btn",
    callback: openHeatmap
  });
  subToolsOpt.push({
    name: "labeling",
    icon: "label",
    title: "Labeling",
    value: "labeling",
    type: "btn",
    callback: function() {
      window.location.href = `../labeling/labeling.html${window.location.search}`;
    }
  });
  subToolsOpt.push({
    name: "segment",
    icon: "timeline",
    type: "btn",
    value: "rect",
    title: "Segment",
    callback: function() {
      if (window.location.search.length > 0) {
        window.location.href =
          "../segment/segment.html" + window.location.search;
      } else {
        window.location.href = "../segment/segment.html";
      }
    }
  });
  subToolsOpt.push({
    name: "model",
    icon: "aspect_ratio",
    type: "btn",
    value: "rect",
    title: "Predict",
    callback: function() {
      if (window.location.search.length > 0) {
        window.location.href = "../model/model.html" + window.location.search;
      } else {
        window.location.href = "../model/model.html";
      }
    }
  });

  // -- For Nano borb Start -- //
  if (ImgloaderMode == "imgbox") {
    // download
    subToolsOpt.push({
      name: "downloadmarks",
      icon: "cloud_download",
      title: "Download Marks",
      type: "btn",
      value: "download",
      callback: Store.prototype.DownloadMarksToFile
    });
    subToolsOpt.push({
      name: "uploadmarks",
      icon: "cloud_upload",
      title: "Load Marks",
      type: "btn",
      value: "upload",
      callback: Store.prototype.LoadMarksFromFile
    });
  }
  // -- For Nano borb End -- //

  // bug report
  subToolsOpt.push({
    name: "bugs",
    icon: "bug_report",
    title: "Bug Report",
    value: "bugs",
    type: "btn",
    callback: () => {
      window.open("https://goo.gl/forms/mgyhx4ADH0UuEQJ53", "_blank").focus();
    }
  });

  // create the tool bar
  $UI.toolbar = new CaToolbar({
    /* opts that need to think of*/
    id: "ca_tools",
    zIndex: 601,
    mainToolsCallback: mainMenuChange,
    subTools: subToolsOpt
  });

  // create two side menus for tools
  $UI.appsSideMenu = new SideMenu({
    id: "side_apps",
    width: 300,
    //, isOpen:true
    callback: toggleSideMenu
  });

  $UI.layersSideMenu = new SideMenu({
    id: "side_layers",
    width: 300,
    contentPadding: 5,
    //, isOpen:true
    callback: toggleSideMenu
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
      //   callback:anno_edit
      // },
      {
        // delete
        title: "Delete",
        class: "material-icons",
        text: "delete_forever",
        callback: anno_delete
      }
    ]
  });

  var checkOverlaysDataReady = setInterval(function() {
    if (
      $D.params.data &&
      _l &&
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
        data: []
      });

      // create control

      // create main layer viewer items with states
      const mainViewerData = $D.overlayers.map(d => {
        const isShow =
          $D.params.states &&
          $D.params.states.l &&
          $D.params.states.l.includes(d.id)
            ? true
            : false;
        return { item: d, isShow: isShow };
      });

      // create monir layer viewer items
      const minorViewerData = $D.overlayers.map(d => {
        return { item: d, isShow: false };
      });

      // create UI and set data
      $UI.layersViewer = createLayerViewer(
        "overlayers",
        mainViewerData,
        callback.bind("main")
      );
      // create UI and set data - minor
      $UI.layersViewerMinor = createLayerViewer(
        "overlayersMinor",
        minorViewerData,
        callback.bind("minor")
      );

      //
      if ($D.params.states && $D.params.states.l) {
        $D.params.states.l.forEach(id =>
          loadAnnotationById($CAMIC, $UI.layersViewer.getDataItemById(id), null)
        );
      }

      $UI.layersList = new CollapsibleList({
        id: "layerslist",
        list: [
          {
            id: "left",
            title: "Left Viewer",
            // icon:'border_color',
            content: "No Template Loaded" //$UI.annotOptPanel.elt
            // isExpand:true
          },
          {
            id: "right",
            // icon:'find_replace',
            title: "Right Viewer",
            content: "No Template Loaded" //$UI.algOptPanel.elt,
          }
        ],
        changeCallBack: function(e) {
          // console.log(e);
        }
      });
      $UI.layersSideMenu.clearContent();
      // add to layers side menu
      const title = document.createElement("div");
      title.classList.add("item_head");
      title.textContent = "Layers Manager";

      $UI.layersSideMenu.addContent(title);
      // zoom locker control
      $UI.lockerPanel = document.createElement("div");
      $UI.lockerPanel.classList.add("lock_panel");
      $UI.lockerPanel.style.display = "none";
      $UI.lockerPanel.innerHTML = `<label>Zoom Lock<input type="checkbox" checked></label>`;
      $UI.lockerPanel
        .querySelector("input[type=checkbox]")
        .addEventListener("change", e => {
          isLock = !isLock;
          if (isLock) {
            $minorCAMIC.viewer.viewport.zoomTo(
              $CAMIC.viewer.viewport.getZoom(true),
              $CAMIC.viewer.viewport.getCenter(true),
              true
            );
            $CAMIC.viewer.controls.bottomright.style.display = "none";
          } else {
            $CAMIC.viewer.controls.bottomright.style.display = "";
          }
        });
      $UI.layersSideMenu.addContent($UI.lockerPanel);

      $UI.layersList.clearContent("left");
      $UI.layersList.addContent("left", $UI.layersViewer.elt);
      $UI.layersList.clearContent("right");
      $UI.layersList.addContent("right", $UI.layersViewerMinor.elt);

      $UI.layersList.elt.parentNode.removeChild($UI.layersList.elt);
      closeMinorControlPanel();
      $UI.layersSideMenu.addContent($UI.layersList.elt);
    }
  }, 300);

  var checkTemplateSchemasDataReady = setInterval(function() {
    if ($D.templates) {
      clearInterval(checkTemplateSchemasDataReady);
      const annotRegex = new RegExp("annotation", "gi");
      const annotSchemas = $D.templates.filter(item =>
        item.id.match(annotRegex)
      );
      /* annotation control */
      $UI.annotOptPanel = new OperationPanel({
        //id:
        //element:
        formSchemas: annotSchemas,
        resetCallback: reset_callback,
        action: {
          title: "Save",
          callback: anno_callback
        }
      });
      // START QUIP550 TEMPORARILY REMOVE Algorithm Panel //
      // add to layers side menu
      const title = document.createElement("div");
      title.classList.add("item_head");
      title.textContent = "Annotation";
      $UI.appsSideMenu.addContent(title);
      $UI.annotOptPanel.elt.classList.add("item_body");
      $UI.appsSideMenu.addContent($UI.annotOptPanel.elt);

      //$UI.appsList.clearContent('annotation');
      //$UI.appsList.addContent('annotation',$UI.annotOptPanel.elt);
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
  // $UI.multSelector.addHandler('action',multSelector_action);

  // add eventlistenter for two btns
  // const brushClearBtn = document.querySelector("#bctrl button.reset");
  // brushClearBtn.addEventListener("click", reset_callback);
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
    callback: callback
  });
  layersViewer.elt.parentNode.removeChild(layersViewer.elt);
  return layersViewer;
}
// create lay panel for side-by-side control
function createLayPanelControl() {
  $UI.layCtrlbar = document.createElement("div");
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
  const radios = $UI.layCtrlbar.querySelectorAll("input[name=ctrlPane]");
  radios.forEach(r => {
    r.addEventListener("change", function(e) {
      const val = e.target.value;
      switch (val) {
        case "main":
          $UI.layersViewer.elt.style.display = "flex";
          $UI.layersViewerMinor.elt.style.display = "none";
          break;
        case "minor":
          $UI.layersViewer.elt.style.display = "none";
          $UI.layersViewerMinor.elt.style.display = "flex";
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

function redirect(url, text = "", sec = 5) {
  let timer = sec;
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

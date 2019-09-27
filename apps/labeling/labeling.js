const selection = [
  {
    text: "Intra-Tumoral Stroma",
    color: "#00FF00", // green
    size: 1024,
    count: 3,
    num: 0
  },
  {
    text: "Tumor with No Intervening Stroma", //text:'Tumor-Stroma Transition',
    color: "#FF0000", // red
    size: 1024,
    count: 2,
    num: 0
  },
  {
    text: "Invasive Margin",
    color: "#FF00FF", // Magenta
    size: 1024,
    count: 2,
    num: 0
  },
  {
    text: "Other Regions", //text:'Tumor Associated Stroma With Mild Hyalinization',
    color: "#0000FF", // Blue
    size: 1024,
    count: 4,
    num: 0
  }
  // ,{
  //   text: "Tumor-Associated Stroma", // text:'Intra-tumoral Stroma with TILs'
  //   color: "#0000FF",
  //   size: 1024,
  //   count: 3,
  //   num: 0
  // },
  // {
  //   text: "Miscellaneous Regions",
  //   color: "#00FF00",
  //   size: 1024,
  //   count: 3,
  //   num: 0
  // }
  // ,
  // {
  //   text:'sROI',
  //   color:'#FFFF00',
  //   size:256,
  //   count:0,
  //   num:0
  // }
];

// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  pages: {
    home: "../table.html",
    table: "../table.html"
  },
  params: null // parameter from url - slide Id and status in it (object).
};

const beforeunloadHandler = e => {
  //Cancel the event
  e.preventDefault();
  //Chrome requires returnValue to be set
  e.returnValue = "leave";
};

// initialize viewer page
function initialize() {
  window.addEventListener("beforeunload", beforeunloadHandler);

  var checkPackageIsReady = setInterval(function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // init UI -- some of them need to wait data loader to load data
      // because UI components need data to initialize
      //initUIcomponents();
      $UI.message = new MessageQueue();

      $UI.modalbox = new ModalBox({
        id: "modalbox",
        hasHeader: true,
        headerText: "Labels Summary",
        hasFooter: true
      });
      // create a viewer and set up
      initCore();
    }
  }, 100);
}

// setting core functionalities
function initCore() {
  // start inital
  // TODO zoom info and mmp
  const opt = {
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: true,
    hasPatchManager: true
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
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
    if (e.hasError) {
      $UI.message.addError(e.message);
      // can't reach Slide and return to home page
      if (e.isServiceError) redirect($D.pages.table, e.message, 0);
    } else {
      $D.params.data = e;

      $UI.slideInfos = new CaMessage({
        /* opts that need to think of*/
        id: "cames",
        defaultText: `Slide: ${$D.params.data.name}`
      });
    }
  });

  $CAMIC.viewer.addHandler("open", function() {
    if ($CAMIC.viewer.pmanager) $CAMIC.viewer.pmanager.on();

    $CAMIC.viewer.viewport.zoomTo(
      $CAMIC.viewer.viewport.imageToViewportZoom(0.25),
      $CAMIC.viewer.viewport.getCenter(),
      true
    );
    $CAMIC.viewer.pmanager.selection = selection;
    if (!$CAMIC.viewer.measureInstance)
      $UI.toolbar.getSubTool("measure").style.display = "none";
  });

  // ui init
  $UI.toolbar = new CaToolbar({
    /* opts that need to think of*/
    id: "ca_tools",
    zIndex: 601,
    hasMainTools: false,
    //mainToolsCallback:mainMenuChange,
    subTools: [
      {
        icon: "home",
        type: "btn",
        value: "home",
        title: "Home",
        callback: function() {
          if (window.location.search.length > 0) {
            window.location.href =
              "../landing/landing.html" + window.location.search;
          } else {
            window.location.href = "../landing/landing.html";
          }
        }
      },
      {
        name: "annotation",
        icon: "create",
        title: "Annotation",
        type: "dropdown",
        value: "annot",
        dropdownList: [
          {
            value: "#FF0000",
            title: "RED",
            checked: true
          },
          {
            value: "#0000FF",
            title: "BLUE"
          },
          {
            value: "#00FF00",
            title: "GREEN"
          },
          {
            value: "#FFFF00",
            title: "YELLOW"
          }
        ],
        callback: toggleAnntation
      },
      // rectangle
      {
        id: "labeling_mode",
        icon: "crop_landscape", // material icons' name
        title: "Rectangle",
        type: "radio", // btn/check/dropdown
        checked: true,
        value: "rect",
        name: "rect",
        callback: toggleMode
      },
      // point
      {
        id: "labeling_mode",
        icon: "fiber_manual_record", // material icons' name
        title: "Point",
        type: "radio", // btn/check/dropdown
        value: "point",
        name: "point",
        callback: toggleMode
      },
      {
        icon: "save", // material icons' name
        title: "Save",
        type: "btn", // btn/check/dropdown
        value: "save",
        callback: savePatches
      },
      // measurment tool
      {
        id: "labeling_mode",
        icon: "space_bar",
        title: "Measurement",
        type: "radio",
        value: "measure",
        name: "measure",
        callback: toggleMode
      }
      // {
      //   icon:'get_app',// material icons' name
      //   title:'Download Labeling',
      //   type:'btn',// btn/check/dropdown
      //   value:'download',
      //   callback:downloadLabel
      // },

      // bug report
      // {
      //   icon: 'bug_report',
      //   title: 'Bug Report',
      //   value: 'bugs',
      //   type: 'btn',
      //   callback: ()=>{window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53','_blank').focus()}
      // }
    ]
  });

  $UI.toolbar.getSubTool("annotation").style.display = "none";
  $UI.toolbar.getSubTool("point").style.display = "none";
}

function savePatches() {
  if (!$CAMIC.viewer.pmanager.hasPatches()) {
    alert("No Label to Save");
    return;
  }

  countungLabelNums();
  createLabelList();
}
function countungLabelNums() {
  selection.forEach(elt => (elt.num = 0));
  $CAMIC.viewer.pmanager.patches.forEach(label => {
    const item = selection.find(sel => label.data === sel.text);
    if (item) item.num++;
  });
}

function downloadLabel() {
  if (!$CAMIC.viewer.pmanager.hasPatches()) {
    alert("There Is No Patches");
    return;
  }

  // create josn object
  const data = {
    slideId: $D.params.data["_id"]["$oid"],
    name: $D.params.data["name"],
    location: $D.params.data["location"]
  };

  data.patches = $CAMIC.viewer.pmanager.exportPatchesAsJSON("image");
  getPatchsZip(data);
  // let text =`{"slideId":"${$D.params.data['_id']['$oid']}","name":"${$D.params.data['name']}","patches":${JSON.stringify($CAMIC.viewer.pmanager.exportPatchesAsJSON())}}`;
  // var element = document.createElement('a');
  // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  // element.setAttribute('download', `${$D.params.data['name']}-Patches-${new Date().toISOString()}.json`);
  // element.style.display = 'none';
  // document.body.appendChild(element);
  // element.click();
  // document.body.removeChild(element);
}
// patch.status
// 0 - loading image
// 1 - loaded
// 2 - error
function getPatchsZip(data) {
  const zip = new JSZip();
  const imgFolder = zip.folder("images");
  empty($UI.modalbox.body);
  createPatchList(data.patches);
  $UI.modalbox.open();
  // return;
  data.patches.forEach((p, index) => {
    // create somthing

    // get image from iip
    if (!p.isPoint)
      getImage(
        {
          zip: zip,
          images: imgFolder,
          data: data,
          patch: p
        },
        getImageCallback
      );
  });

  function check(patches) {
    const p = patches
      .filter(p => {
        return !p.isPoint;
      })
      .find(p => {
        return !p.error && !p.location;
      });
    if (p) return false;
    return true;
  }

  var checkImageIsReady = setInterval(function() {
    if (check(data.patches)) {
      clearInterval(checkImageIsReady);
      $UI.modalbox.body.innerHTML += `<div style='color:#365f9c;font-size:20px'> Compressing...</div>`;
      data.patches.forEach(p => {
        delete p.label;
        delete p.widthInClient;
      });
      const meta_content = [["name", "location"], [data.name, data.location]];
      const patch_cols = [
        "id",
        "color",
        "note",
        "isPoint",
        "x",
        "y",
        "width",
        "height",
        "loaction"
      ];
      const patches_content = [patch_cols];

      data.patches.forEach((p, idx) => {
        patches_content.push([
          idx,
          p["color"],
          p["note"],
          p["isPoint"],
          p["size"]["x"],
          p["size"]["y"],
          p["size"]["width"],
          p["size"]["height"],
          p["location"]
        ]);
      });

      zip.file(`metadata.csv`, meta_content.map(r => r.join(",")).join("\n"));
      zip.file(`patches.csv`, patches_content.map(r => r.join(",")).join("\n"));

      zip.generateAsync({ type: "blob" }).then(function(content) {
        // see FileSaver.js
        saveAs(content, `${data.name}-Patches-${new Date().toISOString()}.zip`);
        $UI.modalbox.close();
      });
    }
  }, 500);
}

function toggleMode(data) {
  const mode = data.value;
  // dis
  const chk = $UI.toolbar
    .getSubTool("annotation")
    .querySelector("input[type=checkbox]");
  chk.checked = false;
  eventFire(chk, "change");
  switch (mode) {
    case "point":
      $CAMIC.viewer.measureInstance.off();
      $CAMIC.viewer.pmanager.isPoint = true;
      $CAMIC.viewer.pmanager.on();
      break;
    // statements_1
    case "rect":
      $CAMIC.viewer.measureInstance.off();
      $CAMIC.viewer.pmanager.isPoint = false;
      $CAMIC.viewer.pmanager.on();
      break;
    default:
      $CAMIC.viewer.pmanager.off();
      $CAMIC.viewer.measureInstance.on();
      // statements_def
      break;
  }
}

function redirect(url, text = "", sec = 5) {
  let timer = sec;
  setInterval(function() {
    if (!timer) {
      window.location.href = url;
    }

    if (Loading.instance.parentNode) {
      Loading.text.textContent = `${text} ${timer}s.`;
    } else {
      Loading.open(document.body, `${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;
  }, 1000);
}

function getImage(result, callback) {
  const data = result.data;
  const size = result.patch.size;
  const widthInClient =
    result.patch.widthInClient * OpenSeadragon.pixelDensityRatio;
  // const url = ImgloaderMode == 'iip'?`${window.location.origin}/img/IIP/raw/?IIIF=${data.location}/${size.x},${size.y},${size.width},${size.height}/${widthInClient},/0/default.jpg` : `${data.location}/${size.x},
  const url =
    ImgloaderMode == "iip"
      ? `../../img/IIP/raw/?IIIF=${data.location}/${size.x},${size.y},${size.width},${size.height}/${widthInClient},/0/default.jpg`
      : `${data.location}/${size.x},${size.y},${size.width},${size.height}/${widthInClient},/0/default.jpg`;
  fetch(url)
    .then(function(response) {
      if (response.ok) {
        return response.blob();
      }
      // error
      const errorTxt = "Detch Network response was not ok.";
      result.patch.label.textContent = errorTxt;
      result.patch.error = errorTxt;
      console.error(errorTxt, error.message);

      throw new Error("Detch Network response was not ok.");
    })
    .then(function(blob) {
      if (callback) callback(result, blob);
    })
    .catch(function(error) {
      const errorTxt = "There has been a problem with your fetch slide";
      result.patch.label.textContent = errorTxt;
      result.patch.error = errorTxt;
      console.error(errorTxt, error.message);
    });
}

function getImageCallback(result, blob) {
  const index = result.data.patches.findIndex(p => {
    return p == result.patch;
  });
  result.images.file(`${index}.jpg`, blob);
  result.patch.location = `./images/${index}.jpg`;
  result.patch.label.textContent = "Finished";
}
function createPatchList(patches) {
  const list = document.createElement("div");

  patches.forEach((p, i) => {
    const label = p.isPoint ? "Finished" : "Loading...";
    const type = p.isPoint ? "(Point)" : "(Rectangle)";
    const pdiv = document.createElement("div");
    pdiv.style.display = "flex";
    pdiv.style.padding = "1px";
    pdiv.innerHTML = `<div style="background-color:${p.color};width:22px;height:22px;border:2px #365f9c solid;"></div>
    <div style="padding:5px;background-color:#365f9c;font-size:14px;">Patch #${i}${type}</div>
    <div style="padding:5px;background-color:#365f9c;font-size:14px;">${label}</div>`;
    p.label = pdiv.querySelectorAll("div")[2];
    list.appendChild(pdiv);
  });

  $UI.modalbox.body.appendChild(list);
}
function toggleAnntation(e) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert("Draw Doesn't Initialize");
    return;
  }
  //console.log(e);
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const target = this.srcElement || this.target || this.eventSource.canvas;
  if (e.checked) {
    // on
    annotOn(e);

    //annotationOn.call(this,state,target);
  } else {
    // off
    annotOff(e);
  }
}

function annotOn(e) {
  console.log(e);
  const color = e.status;

  $CAMIC.viewer.measureInstance.off();
  $CAMIC.viewer.pmanager.off();

  // deselect radio which is one of point/retangle/measure
  if (
    $UI.toolbar.elt.querySelector(
      `input[type=radio][name=labeling_mode]:checked`
    )
  )
    $UI.toolbar.elt.querySelector(
      `input[type=radio][name=labeling_mode]:checked`
    ).checked = false;

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.style.color = color;
  //$UI.toolbar.getSubTool('annotation').querySelector('label').style.backgroundColor = color;
  $UI.toolbar
    .getSubTool("annotation")
    .querySelector("label").style.color = color;
  canvasDraw.style.isFill = false;

  canvasDraw.drawOn();
  //
}

function annotOff() {
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawOff();
  canvasDraw.clear();

  //$UI.toolbar.getSubTool('annotation').querySelector('label').style.backgroundColor = '';
  $UI.toolbar.getSubTool("annotation").querySelector("label").style.color = "";
}

function createLabelList() {
  empty($UI.modalbox.body);
  const header = `
  <div style='display:table-row; font-weight:bold;'>
      <div style='text-align: initial; display: table-cell; padding: 5px;'>Label Type</div>
      <div style='display: table-cell; padding: 5px;'>Suggested Label#</div>
      <div style='display: table-cell; padding: 5px;'>Current Label#</div> 
      <div style='display: table-cell; padding: 5px;'></div>    
  </div>`;
  const rows = selection
    .map(
      elt => `
    <div style='display:table-row;'>
      <div style='font-weight:bold; text-align: initial; display: table-cell;padding: 5px; color: ${
        elt.color
      };'>${elt.text} ROI</div>
      <div style='display: table-cell;padding: 5px;'>${elt.count}</div>
      <div style='display: table-cell;padding: 5px; color:${
        elt.count == elt.num ? "green" : "red"
      };'>${elt.num}</div>
      <div id='${elt.color}' style='display: table-cell; padding: 5px;'></div>
    </div>`
    )
    .join("");

  const table = `<div style='display: table;width: 100%; color: #365F9C; text-align: center;'>${header}${rows}</div>`;
  $UI.modalbox.body.innerHTML = table;

  const isPassed = true; // checkSelection();
  const footer = $UI.modalbox.elt.querySelector(".modalbox-footer");
  footer.innerHTML = `
  <div style='display:flex;wdith:100%;justify-content: flex-end;'>
    <div style='font-size: 1.5rem; padding: 5px; margin: 5px;font-weight:bold;color:#FF0000;'>
    ${isPassed ? "" : "Please Match The Required Number For Each Label Type!"}
    </div>
    <button ${isPassed ? "" : "disabled"} class="continue" style="margin-left:10px;">Continue</button>
    <button ${isPassed ? "" : "disabled"} class="save" style="margin-left:10px;">Save&Exit</button>
  </div>`;
  $UI.modalbox.open();
  const continue_btn = $UI.modalbox.elt.querySelector(".modalbox-footer button.continue");
  const save_btn = $UI.modalbox.elt.querySelector(".modalbox-footer button.save");
  continue_btn.addEventListener("click", ()=>{$UI.modalbox.close()});
  save_btn.addEventListener("click", saveLabelings);
}

function checkSelection() {
  for (var i = selection.length - 1; i >= 0; i--) {
    if (selection[i].num != selection[i].count) {
      return false;
    }
  }
  return true;
}

function getCoordinates(patch) {
  // image coordinate
  const viewer = patch.viewer;
  const overlay = patch.overlay;
  const { x, y, width, height } = viewer.viewport.viewportToImageRectangle(
    overlay.getBounds(viewer.viewport)
  );

  const left = Math.round(x);
  const right = Math.round(x + width);
  const top = Math.round(y);
  const bottom = Math.round(y + height);

  return [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
    [left, top]
  ];
}

async function saveLabelings(e) {
  // remove listener
  window.removeEventListener("beforeunload", beforeunloadHandler);
  // start saving preduce
  Loading.open(document.body, "Labels Saving...");
  const ROIS = $CAMIC.viewer.pmanager.patches;
  // get all labels
  await asyncForEach(ROIS, async roi => {
    const { ROI, subROIs } = generateROIandSubROI(roi);
    await saves(ROI, subROIs);
  });
  Loading.close();
  console.log("finished");
  $UI.modalbox.close();

  // return to home
  redirect($D.pages.table, "Redirecting To Table....", 0);
}

async function saves(ROI, subROIs) {
  // start saving
  try {
    const subroi_list = [];
    // insert ROI and get ROI id
    await $CAMIC.store.addLabel(ROI).then(d => d.count);

    // insert subROI
    await asyncForEach(subROIs, async subROI => {
      await $CAMIC.store.addLabel(subROI).then(d => d.count);
    });
    // update subPOI
  } catch (e) {
    // statements
    console.log(e);
  }
  console.log("done");
}

function generateROIandSubROI(patch) {
  // slide Info
  const slideId = $D.params.slideId;
  const slideName = $D.params.data.name;

  // user info and create date
  const creator = sessionStorage.getItem("userName") || getUserId();
  const dateTime = new Date();

  const subROIs = [];

  // get ROI
  const exec_id = randomId();
  const roi_id = new ObjectId();
  const coordinates = getCoordinates(patch);
  const ROI = {
    _id: roi_id.toString(),
    creator: creator,
    create_date_time: dateTime,
    provenance: {
      image: {
        slide: slideId,
        name: slideName
      },
      analysis: {
        source: "human",
        execution_id: exec_id,
        computation: "label",
        name: exec_id
      }
    },
    properties: {
      type: patch.data, // for label, there are 6 types
      til_density: patch.getTilDensity()
    },
    annotations: [],
    subrois: [],
    parent: null,
    geometries: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            style: {
              color: patch.color
            }
          },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates]
          },
          bound: {
            type: "Polygon",
            coordinates: [coordinates]
          }
        }
      ]
    }
  };

  // get subROI
  const subROI_ids = [];
  patch.subROIs.forEach(sROI => {
    const subExec = randomId();
    const _id = new ObjectId();
    ROI.subrois.push(_id.toString());
    const subCoordinates = getCoordinates(sROI);
    const subROI = {
      _id: _id.toString(),
      creator: creator,
      create_date_time: dateTime,
      provenance: {
        image: {
          slide: slideId,
          name: slideName
        },
        analysis: {
          source: "human",
          execution_id: subExec,
          computation: "sub",
          name: subExec
        }
      },
      properties: {
        type: "subROI"
      },
      parent: roi_id.toString(),
      geometries: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              style: {
                color: "#FFFF00",
                lineCap: "round",
                lineJoin: "round",
                lineWidth: 3
              }
            },
            geometry: {
              type: "Polygon",
              coordinates: [subCoordinates]
            },
            bound: {
              type: "Polygon",
              coordinates: [subCoordinates]
            }
          }
        ]
      }
    };
    subROIs.push(subROI);
  });
  return { ROI, subROIs };
}

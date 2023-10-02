// db.labeling.aggregate([{ $match : { parent:null} },{$sample:{size:1}},{$project:{provenance:1}}]);

// test slideId = 5c8802db36d1a00006d33711
// labelId = 5d1ca58ff2a6893c5688e95b
// mutli subroi labelId = 5d1ca58cf2a6893c5688e94e
// CAMIC is an instance of camicroscope core
// $CAMIC in there
//
const annotationType = {
  '#FF0000': 'tumor',
  '#FFFF00': 'necrosis',
  '#000000': 'other',
  '#0000FF': 'lymphocytes',
  '#00FFFF': 'plasma',
};
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  annotations: [],
  // pages:{
  //   home:'../table.html',
  //   table:'../table.html'
  // },
  params: null, // parameter from url - slide Id and status in it (object).
};

// window.onbeforeunload = function (e) {
//     e = e || window.event;

//     // For IE and Firefox prior to version 4
//     if (e) {
//         e.returnValue = 'Sure?';
//     }

//     // For Safari
//     return 'Sure?';
// };

window.addEventListener('keydown', (e) => {
  if (!$CAMIC || !$CAMIC.viewer) return;
  const keyCode = e.keyCode;

  // escape key to close all operations
  if (keyCode==27) {
    // close slide menu
    const slideLi = $UI.toolbar.getSubTool('list');
    const slideChk = slideLi.querySelector('input[type=checkbox]');
    slideChk.checked = false;
    eventFire(slideChk, 'click');

    // close measument tool
    const mLi = $UI.toolbar.getSubTool('measure');
    const mChk = mLi.querySelector('input[type=checkbox]');
    mChk.checked = false;
    eventFire(mChk, 'click');

    // close annotation pen
    // const a_li = $UI.toolbar.getSubTool('annotation');
    // const a_chk = a_li.querySelector('input[type=checkbox]');
    // $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = '';
    // a_chk.checked = false;
    // eventFire(a_chk,'click');
    //
  }

  // open Tumor Pen (ctrl + t)
  // if(e.ctrlKey && keyCode == 84 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=tumor]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }
  // open Necrosis Pen (ctrl + n)
  // if(e.ctrlKey && keyCode == 78 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=necrosis]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }
  // open Other Pen (ctrl + o)
  // if(e.ctrlKey && keyCode == 79 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=other]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }
  // open Lymphocytes Pen (ctrl + l)
  // if(e.ctrlKey && keyCode == 76 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=lymphocytes]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }

  // open Plasma Pen (ctrl + p)
  // if(e.ctrlKey && keyCode == 80 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=plasma]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }

  // open Measurement Tool (ctrl + m)
  if (e.ctrlKey && keyCode == 77 && $CAMIC.viewer.measureInstance) {
    const li = $UI.toolbar.getSubTool('measure');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }

  // open annotations list
  if (e.ctrlKey && keyCode == 65 && $UI.annotationsSideMenu) {
    const li = $UI.toolbar.getSubTool('list');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }
});
// initialize viewer page
async function initialize() {
  var checkPackageIsReady = await setInterval(async function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // init UI -- some of them need to wait data loader to load data
      // because UI components need data to initialize


      $UI.message = new MessageQueue();

      $UI.modalbox = new ModalBox({
        id: 'modalbox',
        hasHeader: true,
        headerText: 'Annotations Summary',
        hasFooter: true,
      });


      // create a viewer and set up
      initCore();
      // get user id;
      // $USER = await $CAMIC.store.getCurrentUserId();
      $USER = getUserInfo().sub;
      // loading label and sub label
      try {
        Loading.open(document.body, 'Loading Data...');
        const ROIdata = await loadingData();
        $D.ROIs = ROIdata.ROIs;
        $D.subROIs = ROIdata.subROIs;
      } catch (e) {
        // statements
        // redirect($D.pages.table, e, 0);
        Loading.close();
      } finally {
        // Loading.close();
      }

      // direct user away if they don't have access
      if (getUserInfo().userType == 'Participant') {
        alert('Error: Your user account type, \'Participant\', does not have permission to contribute to ROI selection. If you were assigned an ROI selection task and need to change your account type, please contact Brandon.Gallas@fda.hhs.gov.');
        window.location = '../collection/viewer.html';
      }

      // if (!$D.ROI) redirect($D.pages.table, 'There Is No Label Data, Return Home Page.', 0);
      Loading.open(document.body, 'Loading Data...');
      var checkCoreAndDataIsReady = setInterval(function() {
        if ($CAMIC&&$CAMIC.viewer&&$CAMIC.viewer.omanager) {
          clearInterval(checkCoreAndDataIsReady);
          Loading.close();
          showLabelData();
          // force make roi first
          document.querySelectorAll('input[name="roi_type"]').forEach((input)=>{
            input.disabled = true;
          });
          // add dbl click handler
          // TODO -- change to new method for adding to left panel
          $CAMIC.viewer.addHandler('canvas-double-click', getLabelInfo);
        }
      }, 500);
    }
  }, 100);
}


// setting core functionalities
function initCore() {
  // start inital
  // TODO zoom info and mmp
  const opt = {
    hasPatchManager: false,
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: false,
    // minImageZoom:0.25
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
    $CAMIC = new CaMic('right_viewer', slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e) {
    if (e.hasError) {
      $UI.message.addError(e.message);
      // can't reach Slide and return to home page
      // if (e.isServiceError) redirect($D.pages.table, e.message, 0);
    } else {
      $D.params.data = e;

      $UI.slideInfos = new CaMessage({
      /* opts that need to think of*/
        id: 'cames',
        defaultText: `Slide: ${$D.params.data.name}`,
      });
    }
  });

  $CAMIC.viewer.addHandler('open', function() {
    if (!$CAMIC.viewer.measureInstance) $UI.toolbar.getSubTool('measure').style.display = 'none';
  });

  $UI.annotationsSideMenu = new SideMenu({
    id: 'side_annotation',
    width: 200,
    // , isOpen:true
    callback: (data)=>{
      if (!data.isOpen) $UI.toolbar.getSubTool('list').querySelector('input[type=checkbox]').checked = false;
    },
  });

  const title = document.createElement('div');
  title.classList.add('item_head');
  title.textContent = 'Annotations';

  $UI.annotationsSideMenu.addContent(title);

  // create edited data list
  $UI.labelAnnotationsPanel = new LabelAnnotationsPanel({
    // data:$D.heatMapData.editedClusters,
    data: $D.annotations,
    // editedDate:$D.
    onDBClick: locatedAnnotation,
    onDelete: onDeleteAnnotation,
  });

  $UI.annotationsSideMenu.addContent($UI.labelAnnotationsPanel.elt);

  // ui init
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    // mainToolsCallback:mainMenuChange,
    subTools: [{
      icon: 'home',
      type: 'btn',
      value: 'home',
      title: 'Home',
      callback: function() {
        if (window.location.search.length > 0) {
          window.location.href = $D.pages.home + window.location.search;
        } else {
          window.location.href = $D.pages.home;
        }
      },
    },
    // {
    //   icon: 'view_list',
    //   type: 'check',
    //   value: 'list',
    //   title:'Annotations',
    //   name:'list',
    //   callback: toggleAnnotList
    // },
    // {
    //   name:'annotation',
    //   icon:'create',
    //   title:'Annotate',
    //   type:'dropdown',
    //   value:'annotation',
    //   dropdownList:[
    //     {
    //       value:'tumor', // red
    //       title:'Tumor',
    //       checked:true
    //     },
    //     {
    //       value:'necrosis', // yellow
    //       title:'Necrosis'
    //     },
    //     {
    //       value:'other', // black
    //       title:'Other'
    //     },
    //     {
    //       value:'lymphocytes', // blue
    //       title:'Lymphocytes'
    //     },
    //     {
    //       value:'plasma', // cyan
    //       title:'Plasma'
    //     }
    //   ],
    //   callback:toggleAnntation
    // },
    // {
    //   icon:'save',// material icons' name
    //   title:'Save',
    //   type:'btn',// btn/check/dropdown
    //   value:'save',
    //   callback:clickSavebtnHandler
    // },
    // measurment tool
    {
      id: 'labeling_mode',
      icon: 'space_bar',
      title: 'Measurement',
      type: 'check',
      value: 'measure',
      name: 'measure',
      callback: toggleMeasurement,
    },
    // skip this roi
    // {
    //   id:'next',
    //   icon:'skip_next',
    //   title:'Next ROI Annotation',
    //   type:'btn',
    //   value:'next',
    //   name:'next',
    //   callback:async()=> {
    //     Loading.open(document.body,'Loading Next...');

    //     // randomly pick
    //     const labels = await $CAMIC.store.findAllLabelsWithoutAnnotations().then(d=>d);
    //     const index = getRandomIntInclusive(0,labels.length-1);
    //     const nextLabelId = labels[index]._id;
    //     const nextSlideId = labels[index].provenance.image.slide;
    //     window.removeEventListener('beforeunload', beforeUnloadHandler);

    //     window.location.href = `./labelingSimpleAnnotation.html?labelId=${nextLabelId}&slideId=${nextSlideId}`;

    //     Loading.close();
    //   }
    // },
    {
      id: 'til_sample',
      icon: 'assessment',
      title: 'TIL Sample',
      type: 'btn',
      value: 'til_sample',
      callback: ()=>{
        createTILSample();
      },
    },
      // {
      //   id: 'slide_download',
      //   icon: 'file_download',
      //   title: 'Download Slide',
      //   type: 'btn',
      //   value: 'slide_download',
      //   callback: downloadSlide,
      //  },

      // bug report
      // {
      //   icon: 'bug_report',
      //   title: 'Bug Report',
      //   value: 'bugs',
      //   type: 'btn',
      //   callback: ()=>{window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53','_blank').focus()}
      // }
    ],
  });
  // create TIL and annotaiton types
}


function toggleMeasurement(data) {
  if (data.checked) {
    // annotOff();
    $CAMIC.viewer.measureInstance.on();
  } else {
    $CAMIC.viewer.measureInstance.off();
  }
}


function toggleAnntation(e) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }
  // console.log(e);
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const target = this.srcElement || this.target || this.eventSource.canvas;
  if (e.checked) { // on
    $CAMIC.viewer.measureInstance.off();
    $UI.toolbar.getSubTool('measure').querySelector('input[type=checkbox]').checked = false;
    annotOn(e);

    // annotationOn.call(this,state,target);
  } else { // off
    annotOff(e);
  }
}

const pencil = {
  'tumor': {
    color: '#FF0000', // red
    type: 'Tumor',
    mode: 'free',
    num: 0,
  },
  'necrosis': {
    color: '#FFFF00', // yellow
    type: 'Necrosis',
    mode: 'free',
    num: 0,
  },
  'other': {
    color: '#000000', // black
    type: 'Other',
    mode: 'free',
    num: 0,
  },
  'lymphocytes': {
    color: '#0000FF', // blue
    type: 'Lymphocytes',
    mode: 'point',
    num: 0,
  },
  'plasma': {
    color: '#00FFFF', // cyan
    type: 'Plasma',
    mode: 'point',
    num: 0,
  },
};

function annotOn(e) {
  const color = pencil[e.status].color;
  const mode = pencil[e.status].mode;


  $CAMIC.viewer.measureInstance.off();


  // deselect radio which is one of point/retangle/measure
  if ($UI.toolbar.elt.querySelector(`input[type=radio][name=labeling_mode]:checked`)) {
    $UI.toolbar.elt.querySelector(`input[type=radio][name=labeling_mode]:checked`).checked = false;
  };


  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = mode;
  canvasDraw.style.color = color;
  // $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]').checked = true;
  // $UI.toolbar.getSubTool('annotation').querySelector('labe<hl').style.color = color;
  canvasDraw.style.isFill = true;
  canvasDraw.isSimplify = false;


  canvasDraw.drawOn();
  //
}

function annotOff() {
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawOff();
  canvasDraw.clear();

  $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]').checked = false;
  $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = '';
}


async function loadingData() {
  const slideId = $D.params.slideId;
  //
  const labelData = await $CAMIC.store.findLabeling({'provenance.image.slide': slideId});


  let sublabels = null;
  if (labelData.subrois&&Array.isArray(labelData.subrois)) {
    sublabels =[]; // await $CAMIC.store.findLabelByIds(labelData.subrois).then((d)=>d);
  }

  return {ROIs: labelData, subROIs: sublabels};
}


function showLabelData() {
  // draw labels
  const labels = [...$D.ROIs];
  labels.forEach((label)=>{
    const item = {};
    item.id = label._id;
    item.data = label;
    item.render = labelRender;
    item.clickable = true;
    item.hoverable = true;
    $CAMIC.viewer.omanager.addOverlay(item);
  });

  $CAMIC.viewer.omanager.updateView();
}

function annotationRender(ctx, data) {
  const imagingHelper = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const type = polygon.geometry.type;
  const color = polygon.properties.style.color;

  ctx.lineWidth = lineWidth<3?3:lineWidth;
  // console.log(lineWidth);
  ctx.strokeStyle = color;
  switch (type) {
    case 'Polygon':
      // polygon
      const points = polygon.geometry.coordinates[0];
      ctx.fillStyle = hexToRgbA(color, 0.2);
      const path = new Path();

      // starting draw drawPolygon
      path.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length-1; i++) {
        path.lineTo(points[i][0], points[i][1]);
      }

      // close path and set style
      path.closePath();
      path.fill(ctx);
      path.stroke(ctx);
      break;
    case 'Point':
      // point
      const point = polygon.geometry.coordinates;
      ctx.lineWidth = lineWidth<6?6:lineWidth;
      ctx.fillStyle = color;
      const path1 = new Path();
      path1.arc(point[0], point[1], lineWidth>2?lineWidth:2, 0, 2 * Math.PI);
      path1.closePath();
      path1.fill(ctx);
      path1.stroke(ctx);
      break;
    default:
      console.log('No type in annotation');
      break;
  }
}

function labelRender(ctx, data) {
  // set style
  const imagingHelper = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(5) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const points = polygon.geometry.coordinates[0];
  ctx.lineWidth = lineWidth<2?2:lineWidth;

  ctx.isFill = false;
  ctx.strokeStyle = '#00ff00'; // default
  if (polygon && polygon.properties && polygon.properties.style && polygon.properties.style.color) {
    ctx.strokeStyle = polygon.properties.style.color;
  }
  polygon.geometry.path = DrawHelper.drawPolygon(ctx, points);
}

function createAnnotationsList() {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('Annotations Summary');
  // get data;
  const header = `
  <div style='display:table-row; font-weight:bold;'>
      <div style='text-align: initial; display: table-cell; padding: 5px;'>Annotation Type</div>
      <div style='display: table-cell; padding: 5px;'>Total</div>
  </div>`;
  const rows = Object.keys(pencil).map((type)=>`
    <div style='display:table-row;'>
      <div style='font-weight:bold; text-align: initial; display: table-cell;padding: 5px; color: ${pencil[type].color};'>${pencil[type].type}</div>
      <div style='display: table-cell; padding: 5px;'>${pencil[type].num}</div>
    </div>`).join('');

  const table = `<div style='display: table;width: 100%; color: #365F9C; text-align: center;'>${header}${rows}</div>`;
  $UI.modalbox.body.innerHTML = table;

  const footer = $UI.modalbox.elt.querySelector('.modalbox-footer');
  footer.innerHTML = `
  <div style='display:flex;wdith:100%;justify-content: space-between;'>
    <div style='font-size: 1.5rem; padding: 5px; margin: 5px;font-weight:bold;color:#FF0000;'>
    </div>
    <button>Save&Next</button>
  </div>`;
  $UI.modalbox.open();
  const btn = $UI.modalbox.elt.querySelector('.modalbox-footer button');
  btn.addEventListener('click', saveLabels);
}

function locatedAnnotation(data) {
  const annotation = data.item;
  if (!annotation) return;
  const geometry = annotation.geometries.features[0].geometry;
  const bound = annotation.geometries.features[0].bound;
  var x = null; var y = null;
  if (geometry.type=='Point') {
    x = bound[0];
    y = bound[1];
  } else if (geometry.type=='Polygon') {
    const [x0, y0] = bound[0];
    const [x1, y1] = bound[2];
    x = ((x1 - x0)/2) + x0;
    y = ((y1 - y0)/2) + y0;
  }

  const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(x, y);
  // $CAMIC.viewer.viewport.panTo(refPoint, true);
  $CAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.imageToViewportZoom(.25), refPoint, true);
}

function onDeleteAnnotation(data) {
  const annotation = data.item;
  if (!confirm(`Do You Want To Delete { ${annotation.properties.type} - Index:${data.index}}?`)) return;

  const idx = $D.annotations.findIndex((annotation)=>annotation._id==data.id);
  if (idx < 0) return;
  const type = $D.annotations[idx].properties.type;
  pencil[type].num--;
  $D.annotations.splice(idx, 1);
  $UI.labelAnnotationsPanel.__refresh();
  $CAMIC.viewer.omanager.removeOverlay(data.id);
  $CAMIC.viewer.omanager.updateView();
}

function createTILSample() {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('The Example Of TIL Densities');
  $UI.modalbox.elt.style.paddingTop='0';
  $UI.modalbox.body.style.padding = 0;
  $UI.modalbox.body.style.display = 'block';
  $UI.modalbox.body.style.textAlign = 'center';
  $UI.modalbox.body.innerHTML = `<img src="til_tutorial.png" alt="Tutorial" width="550px">`;
  $UI.modalbox.elt.querySelector('.modalbox-footer').innerHTML = '';
  $UI.modalbox.open();
}


function downloadSlide(e) {
  const location = $D.params.data.location;
  var fileName =``;
  var len = 0;
  var cur = 0;
  $CAMIC.store.downloadSlide(location).then((response) => {
    if (response.status == 200) {
      const headers = response.headers;
      const disposition = headers.get('content-disposition');
      len = headers.get('content-length');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      setDownloadModalTitle(fileName);
      setDownloadModalProgress(0);
      showDownloadModal();
      return response.body;
    } else {
      throw response;
    }
  })
      .then((body) => {
        const reader = body.getReader();

        return new ReadableStream({
          start(controller) {
            return pump();

            function pump() {
              return reader.read().then(({done, value}) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                cur+=value.length;
                setDownloadModalProgress(Math.round(cur/len *100));
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob)=>{
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove(); // afterwards we remove the element again

        hideDownloadModal();
        window.URL.revokeObjectURL(blob);
      })
      .catch((err) => console.error(err));
}

function showDownloadModal() {
  $('#downloadModal').modal('show');
}
function hideDownloadModal() {
  $('#downloadModal').modal('hide');
}
function setDownloadModalTitle(title) {
  $('#downloadModal').find('.modal-title').text(title);
}
function setDownloadModalProgress(num) {
  $('#downloadModal').find('.progress-bar').css('width', `${num}%`).attr('aria-valuenow', num).text(`${num}%`);
}

function labelInfoToHtml(label) {
  let text = "<div class='labelHtml'>";
  // top level fields

  if (false && label.alias) {
    text += '<b>Alias:</b> ';
    text += label.alias;
    text += '<br/>';
  } else if (label.provenance.image.name) {
    // if no alias, we need at least slide name
    text += '<b>Slide:</b> ';
    text += label.provenance.image.name;
    text += '<br/>';
  }
  // NOTE -- I've specifically avoided rendering creator email for now, as we usually care about email privacy to some degree, right?
  if (false && label.creator) {
    text += '<b>Creator:</b> ';
    text += label.creator;
    text += '<br/>';
  }
  if (label.create_date) {
    text += '<b>Create Date/Time:</b> ';
    text += label.create_date;
    text += '<br/>';
  }
  if (label.task) {
    text += '<b>Task:</b> ';
    text += label.task;
    text += '<br/>';
  }
  let skip_props = ['style']
  // now go through properties
  for (let propkey in label.properties) {
    if (skip_props.indexOf(propkey) == -1) {
      text += '<b>' + propkey.replaceAll('_', ' ') + ':</b> ';
      let propdata = label.properties[propkey];
      if (Array.isArray(propdata)) {
        text += propdata.join(', ');
      } else if (typeof(propdata) == 'object') {
        text += 'An object with:';
        text +=JSON.stringify(propdata).replaceAll('{', '').replaceAll('}', '');
      } else {
        text += propdata;
      }
      text += '<br/>';
    }
  }
  text += "</div>"
  return text;
}

function labelAnnotToHtml(annot){
  let text = "<div class='annotHtml'>";
  // top level fields

  if (annot.create_date) {
    text += '<b>Create Date/Time:</b> ';
    text += annot.create_date;
    text += '<br/>';
  }
  let skip_props = ['style']
  // now go through properties
  for (let propkey in annot.properties) {
    if (skip_props.indexOf(propkey) == -1) {
      text += '<b>' + propkey.replaceAll('_', ' ') + ':</b> ';
      let propdata = annot.properties[propkey];
      if (Array.isArray(propdata)) {
        text += propdata.join(', ');
      } else if (typeof(propdata) == 'object') {
        text += 'An object with:';
        text +=JSON.stringify(propdata).replaceAll('{', '').replaceAll('}', '');
      } else {
        text += propdata;
      }
      text += '<br/>';
    }
  }
  text += "</div>"
  return text;
}

// only works for square labels
function getLabelInfo(e) {
  const img_point = $CAMIC.viewer.viewport.viewportToImageCoordinates($CAMIC.viewer.viewport.pointFromPixel(e.position, true));
  let matched_labels = $D.ROIs.filter((label)=>{
    if (label.properties.x < img_point.x && label.properties.y < img_point.y) {
      if (label.properties.x + label.properties.width > img_point.x && label.properties.y + label.properties.width > img_point.y) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  });
  let texts = matched_labels.map(labelInfoToHtml);
  document.getElementById('label_review').innerHTML = texts.join('<br/><hr/><br/>');
  // render relevant annotations
  let annots = [];
  for (let label of matched_labels){
    $CAMIC.store.findLabeling({'creator': $USER, 'parent': label._id.$oid}).then(x=>{
      document.getElementById('annot_review').innerHTML += x.join('<br/><hr/><br/>');
    });
  }
}

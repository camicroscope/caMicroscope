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
const beforeUnloadHandler = (e) =>{
  e.preventDefault();
  e.returnValue = 'leave';
};
window.addEventListener('beforeunload', beforeUnloadHandler);

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
        Loading.open(document.body, 'Loading Labels Data...');
        const ROIdata = await loadingData();
        $D.ROI = ROIdata.ROI;
        $D.subROIs = ROIdata.subROIs || [];
      } catch (e) {
        // statements
        // redirect($D.pages.table, e, 0);
        Loading.close();
      } finally {
        // Loading.close();
      }

      // if (!$D.ROI) redirect($D.pages.table, 'There Is No Label Data, Return Home Page.', 0);
      Loading.open(document.body, 'Loading Labels Data...');
      var checkCoreAndDataIsReady = setInterval(function() {
        if ($D.ROI&&$CAMIC&&$CAMIC.viewer&&$CAMIC.viewer.omanager) {
          clearInterval(checkCoreAndDataIsReady);
          // show ROI and subROIs
          showLabelData();
          Loading.close();
          camicOverrides();
        }
      }, 500);
    }
  }, 100);
}


// setting core functionalities
function initCore() {
  addROIFormEvent();
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
    // TODO
    $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', addAnnotaiton);
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
      id: 'locate',
      icon: 'my_location',
      title: 'ROI Location',
      type: 'btn',
      value: 'roi_location',
      callback: ()=>{
        const {x, y, width, height} = $D.ROI.properties;
        const cx = x + width/2;
        const cy = y + height/2;
        const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(cx, cy);
        $CAMIC.viewer.viewport.panTo(refPoint, true);
      },
    },
    {
      id: 'label_lymph',
      icon: 'grain',
      title: 'Lymph',
      type: 'btn',
      value: 'label_lymph',
      callback: ()=>{
        labelLymph();
      },
    },
    {
      id: 'label_tumor',
      icon: 'flag',
      title: 'Tumor',
      type: 'btn',
      value: 'label_Tumor',
      callback: ()=>{
        labelTumor();
      },
    },

    {
      id: 'label_stroma',
      icon: 'edit',
      title: 'Stroma',
      type: 'btn',
      value: 'label_stroma',
      callback: ()=>{
        labelStroma();
      },
    },
    {
      id: 'stop',
      icon: 'stop',
      title: 'Stop',
      type: 'btn',
      value: 'stop',
      callback: ()=>{
        stopLabeling();
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

function clickSavebtnHandler() {
  if ($D.annotations.length < 1) {
    alert('There Is No Annotaiton. Please Add Some Annotations...');
    return;
  }

  // open modal as annotations summary
  createAnnotationsList();
}

async function saveAnnotation(annotation) {
  Loading.open(document.body, 'Saving Annotations...');
  // user and date time
  // const creator = getUserId();
  const creator = $USER;
  try {
    annotation.collectionId= $CAMIC.slideData.collections[0];
    annotation.collectionName = (await $CAMIC.store.getCollection($CAMIC.slideData.collections[0]))[0].name;
  } catch (err) {
    console.error(err);
  }


  // add annotations
  annotation.creator = creator;
  const {x, y} = $CAMIC.viewer.viewport.getContainerSize();
  annotation.viewer_size = {width: x, height: y};
  annotation.viewer_mag = $CAMIC.viewer.viewport.viewportToImageZoom($CAMIC.viewer.viewport.getZoom());
  let nowTime = new Date;
  annotation.create_date = nowTime.toISOString();
  $CAMIC.viewer.cazoomctrlInstance.base;
  const rs = await $CAMIC.store.addLabelingAnnotation(annotation).then( (d) => d );
  if (rs.insertedCount >= 1) {
    // update parent

    // const count = await $CAMIC.store.pushAnnotationFromLabeling( $D.params.labelId, rs.insertedIds[0])
    //    .then((d)=>d);
    // remove listener
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    window.location.href = `./roi_pick.html?slideId=${$D.params.slideId}&collectionId=${$D.params.collectionId}`;
    Loading.close();
  } else {
    alert(JSON.stringify(rs));
  }
}

function setFeedbackForm(feedback) {
  // set feedback list
  if (feedback&&feedback.annotations) {
    const table = document.getElementById('feedbackList').querySelector('tbody');
    feedback.annotations.forEach((d)=>{
      console.log(d);
      const row = document.createElement('tr');
      row.innerHTML = `<td>${d.roiType}</td><td>${d.percentStroma}</td><td>${d.densitysTILs}</td>`;
      table.append(row);
    });
  }
  // set percent Stroma Avg
  const txtPercentStromaAvg = document.getElementById('percentStromaAvg');
  if (feedback&&feedback.percentStromaAvg) txtPercentStromaAvg.innerHTML =`<strong>Mean Percent Stroma: </strong>${feedback.percentStromaAvg}`;

  // set densityTILs
  const txtDensityTILsAvg = document.getElementById('densityTILsAvg');
  if (feedback&&feedback.densitysTILsAvg) txtDensityTILsAvg.innerHTML =`<strong>Mean sTILs Density: </strong>${feedback.densitysTILsAvg}`;

  // set comments
  const txtComments = document.getElementById('comments');
  if (feedback&&feedback.comment) txtComments.innerHTML =`<strong>Comments: </strong>${feedback.comment}`;

  // set pitfalls
  const txtPitfalls = document.getElementById('pitfalls');
  if (feedback&&feedback.pitfalls) txtPitfalls.innerHTML =`<strong>Pitfalls: </strong>${feedback.pitfalls}`;
}
function disableROIForm() {
  const btnSave = document.getElementById('save');
  btnSave.style.display = 'none';
  const inputList = document.getElementById('roi_form').querySelectorAll('input');
  inputList.forEach((input)=>{
    input.disabled = true;
  });
}
function enableFeedbackForm() {
  const feedback = document.getElementById('feedback');
  const next = document.getElementById('next');
  next.addEventListener('click', ()=>{
    window.location.href = `./roi_pick.html?slideId=${$D.params.slideId}&collectionId=${$D.params.collectionId}`;
  });
  feedback.style.display = 'block';
  next.style.display = 'block';
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
  // $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = color;
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
  const labelId = $D.params.labelId;
  const slideId = $D.params.slideId;

  // redir user out if they've already done this
  $CAMIC.store.findLabelingAnnotation({"parent": labelId, "provenance.image.slide":slideId, "creator": getUserId() } ).then(x=>{
    console.log(x)
    if (x.length>0){
      alert("You've already done this label.")
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.location.href = `./roi_pick.html?slideId=${$D.params.slideId}&collectionId=${$D.params.collectionId}`;
    } 
  });
  //
  const labelData = await $CAMIC.store.findLabeling({_id: labelId}).then((d)=>d[0]);


  let sublabels = [];
  if (labelData.subrois&&Array.isArray(labelData.subrois)) {
    sublabels =[]; // await $CAMIC.store.findLabelByIds(labelData.subrois).then((d)=>d);
  }

  return {ROI: labelData, subROIs: sublabels};
}


function showLabelData() {
  // set zoom and ref point
  const {x, y, width, height} = $D.ROI.properties;
  const cx = x + width/2;
  const cy = y + height/2;

  const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(cx, cy);
  $CAMIC.viewer.viewport.panTo(refPoint, true);
  $CAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.imageToViewportZoom(.25), refPoint, true);

  // draw label
  const labels = [...$D.subROIs, $D.ROI];
  labels.forEach((label)=>{
    const item = {};
    item.id = label._id;
    item.data = label;
    item.render = labelRender;
    item.clickable = false;
    item.hoverable = false;
    $CAMIC.viewer.omanager.addOverlay(item);
  });

  $CAMIC.viewer.omanager.updateView();
}

function addAnnotaiton(e) {
  if ($CAMIC.viewer.canvasDrawInstance._draws_data_.length <= 0) return;
  // get current data from osd drawer
  const annotation = getAnnotationDataFrom($CAMIC.viewer.canvasDrawInstance._draws_data_[0]);
  const type = annotation.properties.type;
  // console.log(annotation);
  // clear drawer data;
  $CAMIC.viewer.canvasDrawInstance.clear();

  // add to data
  $D.annotations.push(annotation);
  pencil[type].num++;
  // add to overlay
  const item = {};
  item.id = annotation._id;
  item.data = annotation;
  item.render = annotationRender;
  item.clickable = false;
  item.hoverable = false;
  $CAMIC.viewer.omanager.addOverlay(item);
  $CAMIC.viewer.omanager.updateView();

  $UI.labelAnnotationsPanel.__refresh();
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
  ctx.strokeStyle = '#00ff00'; // polygon.properties.style.color;
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
  btn.addEventListener('click', saveAnnotations);
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


function createTutorial() {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('Tutorial');
  $UI.modalbox.elt.style.paddingTop='60px';
  $UI.modalbox.body.style.padding = 0;
  $UI.modalbox.body.style.display = 'block';
  $UI.modalbox.body.innerHTML = `<embed src="./TutorialWebsite.pdf" width="100%" height="550" />`;
  $UI.modalbox.open();
}

function getAnnotationDataFrom(data) {
  const color = data.properties.style.color;
  const type = annotationType[color];
  const id = new ObjectId();
  const slide = $D.params.slideId;
  const slideName = $D.params.data.name;
  const parent = $D.params.labelId;
  const execId = randomId();

  if (data.geometry.path) delete data.geometry.path;

  const geometry = Object.assign({}, data.geometry);
  const bound = [...data.bound];

  const annotation = {
    '_id': id.toString(),
    'provenance': {
      'image': {
        'slide': slide,
        'name': slideName,
      },
      'analysis': {
        'source': 'human',
        'execution_id': execId,
        'computation': 'annotation',
        'name': execId,
      },
    },
    'properties': {
      'type': type, // there are 5 types -> tumor, necrosis, other, lymphocytes, plasma
    },
    'parent': parent,
    // "geometries": {
    //     "type": "FeatureCollection",
    //     "features": [
    //         {
    //           "type": "Feature",
    //           "properties": {
    //               "style": {
    //                   "color": color,
    //                   "lineCap": "round",
    //                   "lineJoin": "round",
    //                   "lineWidth": 3
    //               }
    //           },
    //           "geometry": geometry,
    //           "bound": bound
    //         }
    //     ]
    // }
  };
  return annotation;
}


function addROIFormEvent() {

  const actionBtn = document.querySelector('#left_menu .foot .action');

  actionBtn.addEventListener('click', (e) => {
    const id = new ObjectId();
    const slide = $D.params.slideId;
    const slideName = $D.params.data.name;

    const parent = $D.params.labelId;
    const execId = randomId();

    const {x, y, width, height} = $D.ROI.properties;

    const location = $D.params.data.location.split('/');
    const fileName1 = location[location.length-1];
    const alias = `${fileName1}_x${x}.${width}_y${y}.${height}`;

    const annotation = {
      '_id': id.toString(),
      'task': 'doVTA_caMicro_v1.4',
      'alias': alias,
      'provenance': {
        'image': {
          'slide': slide,
          'name': slideName,
        },
        'analysis': {
          'source': 'human',
          'execution_id': execId,
          'computation': 'annotation',
          'type': 'simple',
          'name': execId,
        },
      },
      'properties': {
        'comments': document.getElementById("comments").value
      },
      'parent': parent,
    };
    saveAnnotation(annotation);
  });
}



// override labeling code

// holding place for annotations
let labelsToSave = [];

// deps
function convertToNormalized(points, size, viewer) {
    //const height = Math.round(viewer.imagingHelper.imgHeight);
    //const width = Math.round(viewer.imagingHelper.imgWidth);
    let width = 0.001;
    let height = 0.001;
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

async function storePresetLabel(labelData) {
  const execId = randomId();
  const labelId = labelData.id;
  const labelName = labelData.type;
  // const parent = labelData.type;
  const noteData = {
    id: execId,
    labelId: labelId,
    name: labelName,
    notes: labelData.type,
  };

  for (let i=0; i< $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
    .features.length; i++){
    let feature = $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
        .features[i];
    let collectionName = (await $CAMIC.store.getCollection($CAMIC.slideData.collections[0]))[0].name
    let annotJson = {
        creator: getUserId(),
        created_date: new Date(),
        collectionId: $CAMIC.slideData['collections'][0],
        collectionName: collectionName,
        parent: $D.params.labelId,
        provenance: {
            image: {
                slide: $D.params.slideId,
                name: $CAMIC.slideData['name'],
            },
            analysis: {
                coordinates: 'image',
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
        };
    if (labelData.mode == "grid") {
        // brush
        const values = getGrids(
            feature.geometry.coordinates[0],
            feature.properties.size,
        );
        const set = new Set();
        values.map((i) => i.toString()).forEach((v) => set.add(v));
        const points = Array.from(set).map((d) => d.split(','));
        annotJson.geometries = convertGeometries(points, {
            note: labelData.type,
            size: feature.properties.size,
            color: feature.properties.style.color,
        })
        annotJson.isGrid = true;
    } else {
        // point / polygon / stringLine
        annotJson.geometries = $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
    }
    labelsToSave.push(annotJson)
    annotJson._id = Date() + randomId();
    showAnnotation(annotJson)
    }
}

let camicOverrides = ()=>{
  // bypass spen and mttool, otherwise in ../../common/smartpen/autoalign.js
  $CAMIC.viewer.canvasDrawInstance.removeHandler('stop-drawing', addAnnotaiton);
  let spen = {}
  spen.initcanvas = console.log
  spen.alignR = x=>x
  let mtool = {}
  mtool.hash = x=>x
  mtool.populate = x=>x
  mtool.distance = x=>x
  let prevLabel = false

  function startLabeling(l) { 
    // each time switching label, store prev if applicable.
    if (prevLabel){
      switchLabel(prevLabel)
    }
    prevLabel = l
    $CAMIC.viewer.canvasDrawInstance.stop = false; // important!
    const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
    if (!l) {
      l = {
          "id": "999",
          "type":"Meowing",
          "mode": "grid",
          "size": "200",
          "color": "#0000FF"
        }
    }
    //$UI.labelsViewer.setting.onSelected(l)
    // open menu
    //toolsOff();  // Turn off all tools
    //mlAsisstantOn(false);  // Deactivate the assistant 
    canvasDraw.drawMode = l.mode;
    if (l.mode == 'grid') {
      canvasDraw.size = [parseInt(l.size), parseInt(l.size)];
    }
    canvasDraw.style.color = l.color;
    canvasDraw.drawOn();
    $CAMIC.status = 'label';
  }


  function stopLabeling(){
      if (prevLabel){
          switchLabel(prevLabel)
          $CAMIC.viewer.canvasDrawInstance.drawOff();
          $CAMIC.status = null;
          prevLabel = null;
      }
  }

  let meowlabel = {
      "id": "999",
      "type":"Meowing",
      "mode": "free",
      "size": "200",
      "color": "#0000FF"
    }


  let lymphLabel =  {
      "id": "903",
      "type":"Lymphocyte",
      "mode": "point",
      "color": "#67a9cf"
    }

  let stromaLabel =  {
      "id": "902",
      "type":"Stroma",
      "mode": "free",
      "color": "#f1a340"
    }

    let tumorLabel =  {
      "id": "901",
      "type":"Tumor_Cluster",
      "mode": "free",
      "color": "#FF0000"
    }

  function labelTumor(){
    startLabeling(tumorLabel)
  }

  function labelStroma(){
    startLabeling(stromaLabel)
  }

  function labelLymph(){
    startLabeling(lymphLabel)
  }

  // at any point, data is in 


  function switchLabel(prevLabelData){
      if ($CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
      .features.length > 0){
          storePresetLabel(prevLabelData).then(()=>{
              $CAMIC.viewer.canvasDrawInstance.clearStatus();
          })
      }
      saveLabels();
      
  }


  async function saveLabels() {
    while (labelsToSave.length > 0) {
      const toAdd = labelsToSave.pop();  // Get the last label
      await $CAMIC.store.addMark(toAdd); // Assuming addMark is async
    }
    console.log('All labels have been saved!');
  }


  function clearLabels(){
      // clear labelsToSave
      labelsToSave = []
      // refresh this page
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.location = window.location;
  }

  function multiAnnotationRender(ctx, data) {
      const imagingHelper = this.viewer.imagingHelper;
      const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
      for (let index=0; index<data.geometries.features.length; index++){
          let polygon =  data.geometries.features[index];
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
    }

  function showAnnotation(annotation) {
      const type = annotation.properties.type;
      // add to data
      $D.annotations.push(annotation);
      // add to overlay
      const item = {};
      item.id = annotation._id;
      item.data = annotation;
      item.render = multiAnnotationRender;
      item.clickable = false;
      item.hoverable = false;
      $CAMIC.viewer.omanager.addOverlay(item);
      $CAMIC.viewer.omanager.updateView();
    
      $UI.labelAnnotationsPanel.__refresh();
    }


  async function renderPrevAnnots(){
      let data = await $CAMIC.store.findMark($D.params.slideId);
      for (let d in data){
          // check if creator is the same, only show if so.
          if (getUserId() == d.creator){
              showAnnotation(d)
          }
      }
  }

}
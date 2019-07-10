// db.labeling.aggregate([{ $match : { parent:null} },{$sample:{size:1}},{$project:{provenance:1}}]);

// test slideId = 5c8802db36d1a00006d33711
// labelId = 5d1ca58ff2a6893c5688e95b
// mutli subroi labelId = 5d1ca58cf2a6893c5688e94e
// CAMIC is an instance of camicroscope core
// $CAMIC in there
// 
const annotationType = {
  '#FF0000':'tumor',
  '#FFFF00':'necrosis',
  '#000000':'other',
  '#0000FF':'lymphocyte',
  '#00FFFF':'plasma'
}
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  annotations:[],
  pages:{
    home:'../table.html',
    table:'../table.html'
  },
  params:null // parameter from url - slide Id and status in it (object).
};
window.addEventListener('keydown', (e) => {
  if(!$CAMIC || !$CAMIC.viewer) return;
  const keyCode = e.keyCode;
  
  // escape key to close all operations
  if(keyCode==27){
    // close slide menu
    const slide_li = $UI.toolbar.getSubTool('list');
    const slide_chk = slide_li.querySelector('input[type=checkbox]');
    slide_chk.checked = false;
    eventFire(slide_chk,'click');

    // close measument tool
    const m_li = $UI.toolbar.getSubTool('measure');
    const m_chk = m_li.querySelector('input[type=checkbox]');
    m_chk.checked = false;
    eventFire(m_chk,'click');
    
    // close annotation pen
    const a_li = $UI.toolbar.getSubTool('annotation');
    const a_chk = a_li.querySelector('input[type=checkbox]');
    $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = '';
    a_chk.checked = false;
    eventFire(a_chk,'click');
    //   
  }

  //open Tumor Pen (ctrl + t)
  if(e.ctrlKey && keyCode == 84 && $CAMIC.viewer.canvasDrawInstance){
    const li = $UI.toolbar.getSubTool('annotation');
    li.querySelectorAll('.drop_down input[type=radio][value=tumor]')[0].checked = true;
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = true;
    eventFire(chk,'click');
    return;
  }
  // open Necrosis Pen (ctrl + n)
  if(e.ctrlKey && keyCode == 78 && $CAMIC.viewer.canvasDrawInstance){
    const li = $UI.toolbar.getSubTool('annotation');
    li.querySelectorAll('.drop_down input[type=radio][value=necrosis]')[0].checked = true;
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = true;
    eventFire(chk,'click');
    return;
  }
  // open Other Pen (ctrl + o)
  if(e.ctrlKey && keyCode == 79 && $CAMIC.viewer.canvasDrawInstance){
    const li = $UI.toolbar.getSubTool('annotation');
    li.querySelectorAll('.drop_down input[type=radio][value=other]')[0].checked = true;
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = true;
    eventFire(chk,'click');
    return;
  }
  // open Lymphocytes Pen (ctrl + l)
  if(e.ctrlKey && keyCode == 76 && $CAMIC.viewer.canvasDrawInstance){
    const li = $UI.toolbar.getSubTool('annotation');
    li.querySelectorAll('.drop_down input[type=radio][value=lymphocytes]')[0].checked = true;
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = true;
    eventFire(chk,'click');
    return;
  }

  // open Plasma Pen (ctrl + p)
  if(e.ctrlKey && keyCode == 80 && $CAMIC.viewer.canvasDrawInstance){
    const li = $UI.toolbar.getSubTool('annotation');
    li.querySelectorAll('.drop_down input[type=radio][value=plasma]')[0].checked = true;
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = true;
    eventFire(chk,'click');
    return;
  }

  // open Measurement Tool (ctrl + m)
  if(e.ctrlKey && keyCode == 77 && $CAMIC.viewer.measureInstance){
    const li = $UI.toolbar.getSubTool('measure');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk,'click');
    return;
  }

  // open annotations list
  if(e.ctrlKey && keyCode == 65 && $UI.annotationsSideMenu){
    const li = $UI.toolbar.getSubTool('list');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk,'click');
    return;
  }

});
// initialize viewer page
async function initialize(){
  var checkPackageIsReady = await setInterval(async function () {
    if(IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // init UI -- some of them need to wait data loader to load data
      // because UI components need data to initialize
      



      $UI.message = new MessageQueue();
      
      $UI.modalbox = new ModalBox({
        id:'modalbox',
        hasHeader:true,
        headerText:'Patch List',
        hasFooter:false
      });
      // create a viewer and set up
      initCore();

      // loading label and sub label
      try {
        Loading.open(document.body, 'Loading Labels Data...');
        const ROIdata = await loadingData();
        $D.ROI = ROIdata.ROI;
        $D.subROIs = ROIdata.subROIs;

      } catch(e) {
        // statements
        redirect($D.pages.table,e, 0);
        Loading.close();
      } finally {
        //Loading.close();
      }
      
      if(!$D.ROI) redirect($D.pages.table,'There Is No Label Data, Return Home Page.', 0);
      Loading.open(document.body, 'Loading Labels Data...');
      var checkCoreAndDataIsReady = setInterval(function () {
          if($D.ROI&&$CAMIC&&$CAMIC.viewer&&$CAMIC.viewer.omanager) {
            clearInterval(checkCoreAndDataIsReady);
            //show ROI and subROIs
            showLabelData();
            Loading.close();
          }
        }, 500);
    }
  }, 100);

}


// setting core functionalities
function initCore(){
  // start inital
  // TODO zoom info and mmp
  const opt = {
      hasPatchManager:false,
      hasZoomControl:true,
      hasDrawLayer:true,
      hasLayerManager:true,
      hasScalebar:true,
      hasMeasurementTool:true,
      minImageZoom:0.5
  }
  // set states if exist
  if($D.params.states){
    opt.states = $D.params.states;
  }

  try{
    let slideQuery = {}
    slideQuery.id = $D.params.slideId
    slideQuery.name = $D.params.slide
    slideQuery.location = $D.params.location
    $CAMIC = new CaMic("main_viewer",slideQuery, opt);

  }catch(error){
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e){
    if(e.hasError){
      $UI.message.addError(e.message)
      // can't reach Slide and return to home page
      if(e.isServiceError) redirect($D.pages.table,e.message, 0);
    }else{
      $D.params.data = e;

      $UI.slideInfos = new CaMessage({
      /* opts that need to think of*/
        id:'cames',
        defaultText:`Slide: ${$D.params.data.name}`
      });
    }
  });

  $CAMIC.viewer.addHandler('open',function(){

    if(!$CAMIC.viewer.measureInstance) $UI.toolbar.getSubTool('measure').style.display = 'none'
      // TODO
      $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing',addAnnotaiton);
  });
  

  $UI.modalbox = new ModalBox({
    id:'modalbox',
    hasHeader:true,
    headerText:'Labeling List',
    hasFooter:true
  });

  $UI.annotationsSideMenu = new SideMenu({
    id:'side_annotation',
    width: 200,
    //, isOpen:true
    callback:(data)=>{
      if(!data.isOpen) $UI.toolbar.getSubTool('list').querySelector('input[type=checkbox]').checked = false;
    }
  });
  
  const title = document.createElement('div');
  title.classList.add('item_head');
  title.textContent = 'Annotations';

  $UI.annotationsSideMenu.addContent(title);

  // create edited data list
  $UI.labelAnnotationsPanel = new LabelAnnotationsPanel({
    // data:$D.heatMapData.editedClusters,
    data:$D.annotations,
    // editedDate:$D.
    onDBClick: locatedAnnotation,
    onDelete: onDeleteAnnotation
  });

  $UI.annotationsSideMenu.addContent($UI.labelAnnotationsPanel.elt);
  
  // ui init
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id:'ca_tools',
    zIndex:601,
    hasMainTools:false,
    //mainToolsCallback:mainMenuChange,
    subTools:[{
        icon: 'insert_photo',
        type: 'btn',
        value: 'viewer',
        title: 'Viewer',
        callback: function () {
          if (window.location.search.length > 0) {
            window.location.href = '../viewer/viewer.html' + window.location.search;
          } else {
            window.location.href = '../viewer/viewer.html';
          }
        }
      },
      {
        icon: 'view_list',
        type: 'check',
        value: 'list',
        title:'Annotations',
        name:'list',
        callback: toggleAnnotList
      },
      {
        name:'annotation',
        icon:'create',
        title:'Annotate',
        type:'dropdown',
        value:'annotation',
        dropdownList:[
          {
            value:'tumor', // red
            title:'Tumor',
            checked:true
          },
          {
            value:'necrosis', // yellow
            title:'Necrosis'
          },
          {
            value:'other', // black
            title:'Other'
          },
          { 
            value:'lymphocytes', // blue
            title:'Lymphocytes'
          },
          {
            value:'plasma', // cyan
            title:'Plasma'
          }
        ],
        callback:toggleAnntation
      },
      // measurment tool
      {
        id:'labeling_mode',
        icon:'space_bar',
        title:'Measurement',
        type:'check',
        value:'measure',
        name:'measure',
        callback:toggleMeasurement
      },     
      {
        icon:'save',// material icons' name
        title:'Save',
        type:'btn',// btn/check/dropdown
        value:'save',
        callback:saveAnnotations
      },
      // bug report
      {
        icon: 'bug_report',
        title: 'Bug Report',
        value: 'bugs',
        type: 'btn',
        callback: ()=>{window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53','_blank').focus()}
      }
    ]
  });

}

async function saveAnnotations(){
  if($D.annotations.length < 1) {
    alert('There Is No Annotaiton. Please Add Some Annotations...');
    return;
  }
  Loading.open(document.body, 'Saving Annotations...');
  // user and date time
  const creator = getUserId();
  const dateTime = new Date();
  // add annotations 
    await asyncForEach($D.annotations,async (annotation)=>{
      annotation.creator = creator;
      annotation.create_date_time = dateTime;
      await $CAMIC.store.addLabel(annotation).then( d => d.count );
      
    });
  // update parent
  const label = $D.params.labelId;
  const slide = $D.params.slideId;
  const annotationIds = $D.annotations.map(elt=>elt._id);
  
  await $CAMIC.store.addLabelsAnnotation(slide,label,annotationIds).then(d=>d);
  Loading.close();
  redirect($D.pages.table, 'Redirecting To Home....', 0);
}
function toggleMeasurement(data){
  
  if(data.checked){
    annotOff();
    $CAMIC.viewer.measureInstance.on();
  }else{
    $CAMIC.viewer.measureInstance.off();
  }

}


function toggleAnntation(e){
  if(!$CAMIC.viewer.canvasDrawInstance){
    alert('Draw Doesn\'t Initialize');
    return;
  }
  //console.log(e);
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const target = this.srcElement || this.target || this.eventSource.canvas;
  if(e.checked){ // on
    $CAMIC.viewer.measureInstance.off();
    $UI.toolbar.getSubTool('measure').querySelector('input[type=checkbox]').checked = false;
    annotOn(e);
    

    //annotationOn.call(this,state,target);
  }else{ // off
    annotOff(e);
  }
}

const pencil = {  
  'tumor':{
    color:'#FF0000', // red
    type:'Tumor',
    mode: 'free'
  },
  'necrosis':{
    color:'#FFFF00', // yellow
    type:'Necrosis',
    mode: 'free'
  },
  'other':{
    color:'#000000', // black
    type:'Other',
    mode: 'free'
  },
  'lymphocytes':{ 
    color:'#0000FF', // blue
    type:'Lymphocytes',
    mode: 'point',
  },
  'plasma':{
    color:'#00FFFF', // cyan
    type: 'Plasma',
    mode: 'point'
  }
}

function annotOn(e){
  
  const color = pencil[e.status].color;
  const mode = pencil[e.status].mode;
  

  $CAMIC.viewer.measureInstance.off();
  

  // deselect radio which is one of point/retangle/measure
  if($UI.toolbar.elt.querySelector(`input[type=radio][name=labeling_mode]:checked`))
    $UI.toolbar.elt.querySelector(`input[type=radio][name=labeling_mode]:checked`).checked = false


  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = mode;
  canvasDraw.style.color = color;
  $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]').checked = true;
  $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = color;
  canvasDraw.style.isFill = true;
  canvasDraw.isSimplify = false;
  

  canvasDraw.drawOn();
  // 

}

function annotOff(){
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawOff();
  canvasDraw.clear();

  $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]').checked = false;
  $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = '';

}



async function loadingData() {
  const labelId = $D.params.labelId;
  const slideId = $D.params.slideId;
  //
  const labelData = await $CAMIC.store.getLabel(labelId).then(d=>d[0]);
  

  let sublabels = null;
  if(labelData.subrois&&Array.isArray(labelData.subrois))
   sublabels = await $CAMIC.store.findLabelByIds(labelData.subrois).then(d=>d);
  
  return {ROI:labelData,subROIs:sublabels};
}



function showLabelData(){
  // set zoom and ref point
  const points = $D.ROI.geometries.features[0].geometry.coordinates[0];
  const x = points[0][0] + (points[2][0] - points[0][0])/2;
  const y = points[0][1] + (points[2][1] - points[0][1])/2;
  const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(x,y);
  $CAMIC.viewer.viewport.panTo(refPoint,true);
  
  // draw label
  const labels = [...$D.subROIs,$D.ROI];
  labels.forEach(label=>{
    const item = {};
    item.id = label._id;
    item.data = label;
    item.render = label_render;
    item.clickable = false;
    item.hoverable = false;
    $CAMIC.viewer.omanager.addOverlay(item);    
  });

  $CAMIC.viewer.omanager.updateView();
}

function addAnnotaiton(e){
  if($CAMIC.viewer.canvasDrawInstance._draws_data_.length <= 0) return;
  // get current data from osd drawer
  const annotation = getAnnotationDataFrom($CAMIC.viewer.canvasDrawInstance._draws_data_[0]);
  // console.log(annotation);
  // clear drawer data;
  $CAMIC.viewer.canvasDrawInstance.clear();

  // add to data
  $D.annotations.push(annotation);
  
  // add to overlay
  const item = {};
  item.id = annotation._id;
  item.data = annotation;
  item.render = annotation_render;
  item.clickable = false;
  item.hoverable = false;
  $CAMIC.viewer.omanager.addOverlay(item);
  $CAMIC.viewer.omanager.updateView();

  $UI.labelAnnotationsPanel.__refresh();
  
}

function removeAnnotation(e){

  $UI.labelAnnotationsPanel.__refresh();
  console.log('remove Annotaiton');
  console.log(e);

}

function annotation_render(ctx,data){
  const imagingHelper  = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const type = polygon.geometry.type;
  const color = polygon.properties.style.color;

  ctx.lineWidth = lineWidth<3?3:lineWidth;
  //console.log(lineWidth);
  ctx.strokeStyle = color;
  switch (type) {
    case 'Polygon':
      // polygon
      const points = polygon.geometry.coordinates[0];
      ctx.fillStyle = hexToRgbA(color,0.2);
      const path = new Path();

      // starting draw drawPolygon
      path.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length-1; i++) {
          path.lineTo(points[i][0],points[i][1]);
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

function toggleAnnotList(e) {
  if(e.checked){
    $UI.annotationsSideMenu.open();
  }else{
    $UI.annotationsSideMenu.close();
  }
}

function label_render(ctx,data){
  // set style
  const imagingHelper  = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const points = polygon.geometry.coordinates[0];
  ctx.lineWidth = lineWidth<3?3:lineWidth;
  ctx.isFill = false;
  ctx.strokeStyle = polygon.properties.style.color;
  polygon.geometry.path = DrawHelper.drawPolygon(ctx, points);
}

function locatedAnnotation(data){
  const annotation = data.item
  if(!annotation) return;
  const geometry = annotation.geometries.features[0].geometry;
  const bound = annotation.geometries.features[0].bound;
  var x = null, y = null;
  if(geometry.type=='Point'){
    x = bound[0];
    y = bound[1];
  }else if(geometry.type=='Polygon'){
    const [x0,y0] = bound[0];
    const [x1,y1] = bound[2];
    x = ((x1 - x0)/2) + x0;
    y = ((y1 - y0)/2) + y0;
  }

  const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(x,y);
  $CAMIC.viewer.viewport.panTo(refPoint, true);

}

function onDeleteAnnotation(data){
  const annotation = data.item;
  if(!confirm(`Do You Want To Delete { ${annotation.properties.type} - Index:${data.index}}?`)) return;
  
  const idx = $D.annotations.findIndex(annotation=>annotation._id==data.id);
  if(idx < 0) return;
  $D.annotations.splice(idx, 1);
  $UI.labelAnnotationsPanel.__refresh();
  $CAMIC.viewer.omanager.removeOverlay(data.id);
  $CAMIC.viewer.omanager.updateView();
}

function getAnnotationDataFrom(data){
  
  const color = data.properties.style.color;
  const type = annotationType[color];
  const id = new ObjectId();
  const slide = $D.params.slideId;
  const slideName = $D.params.data.name;
  const parent = $D.params.labelId;
  const exec_id = randomId();

  if(data.geometry.path) delete data.geometry.path;
  
  const geometry = Object.assign({}, data.geometry);
  const bound = [...data.bound];
  
  const annotation = {
        "_id":id.toString(),
        "provenance": {
            "image": {
                "slide": slide,
                "name": slideName
            },
            "analysis": {
                "source": "human",
                "execution_id": exec_id,
                "computation":"annotation",
                "name": exec_id
            }
        },
        "properties": {
            "type": type // there are 5 types -> tumor, necrosis, other, lymphocytes, plasma
        },
        "parent": parent,
        "geometries": {
            "type": "FeatureCollection",
            "features": [
                {
                  "type": "Feature",
                  "properties": {
                      "style": {
                          "color": color,
                          "lineCap": "round",
                          "lineJoin": "round",
                          "lineWidth": 3
                      }
                  },
                  "geometry": geometry,
                  "bound": bound
                }
            ]
        }
    };
  return annotation;
}

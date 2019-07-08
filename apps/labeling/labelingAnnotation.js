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
      hasMeasurementTool:true
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
        name:'annotation',
        icon:'create',
        title:'Annotation',
        type:'dropdown',
        value:'annot',
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
      // undo
      {
        id:'undo',
        icon:'undo',
        title:'Undo',
        type:'btn',
        value:'undo',
        name:'undo',
        callback:undoAnnotation

      },
      // measurment tool
      {
        id:'labeling_mode',
        icon:'space_bar',
        title:'Measurement',
        type:'check',
        value:'measure',
        name:'measure',
        callback:toggleMode
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

  //$UI.toolbar.getSubTool('annotation').style.display = 'none';
  //$UI.toolbar.getSubTool('point').style.display = 'none';
}
async function saveAnnotations(){
  if($D.annotations.length < 1) {
    alert('There Is No Annotaiton. Please Add Some Annotations...');
    return;
  }
  Loading.open(document.body, 'Saving Annotations...');
  // add annotations 
    await asyncForEach($D.annotations,async (annotation)=>{
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
function toggleMode(data){
  const mode = data.value;
  // dis
  const chk = $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]');
  chk.checked = false;
  eventFire(chk,'change');
  switch (mode) {
    case 'point':
      $CAMIC.viewer.measureInstance.off();
      
      
      break;
      // statements_1
    case 'rect':
      $CAMIC.viewer.measureInstance.off();
      
      
      break;
    default:
      
      $CAMIC.viewer.measureInstance.on();
      // statements_def
      break;
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
  //$UI.toolbar.getSubTool('annotation').querySelector('label').style.backgroundColor = color;
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

  //$UI.toolbar.getSubTool('annotation').querySelector('label').style.backgroundColor = '';
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
  $CAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.imageToViewportZoom(0.5),refPoint,true)

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

  
}

function removeAnnotation(e){
  console.log('remove Annotaiton');
  console.log(e);

}

function annotation_render(ctx,data){
  const imagingHelper  = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const type = polygon.geometry.type;
  const color = polygon.properties.style.color;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  switch (type) {
    case 'Polygon':
      // polygon
      const points = polygon.geometry.coordinates[0];
      ctx.fillStyle = hexToRgbA(color,0.1);
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
      const path1 = new Path();
      path1.arc(point[0], point[1], lineWidth>2?lineWidth:2, 0, 2 * Math.PI);
      path1.closePath();
      path1.stroke(ctx);
      break;
    default:
      console.log('No type in annotation');
      break;
  }
  
}
function label_render(ctx,data){
  // set style
  const imagingHelper  = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const points = polygon.geometry.coordinates[0];
  ctx.lineWidth = lineWidth;
  ctx.isFill = false;
  ctx.strokeStyle = polygon.properties.style.color;
  polygon.geometry.path = DrawHelper.drawPolygon(ctx, points);
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
                  "bound": geometry
                }
            ]
        }
    };
  return annotation;
}

function undoAnnotation(){
  if($D.annotations.length < 1 ) return;
  const item = $D.annotations.pop();
  $CAMIC.viewer.omanager.removeOverlay(item._id);
  $CAMIC.viewer.omanager.updateView();
}


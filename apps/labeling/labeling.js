// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  pages:{
    home:'../table.html',
    table:'../table.html'
  },
  params:null // parameter from url - slide Id and status in it (object).
};
// initialize viewer page
function initialize(){
  // init UI -- some of them need to wait data loader to load data
  // because UI components need data to initialize
  //initUIcomponents();

  // create a viewer and set up
  initCore();
}


// setting core functionalities
function initCore(){
  // start inital
  // TODO zoom info and mmp
  const opt = {
      hasZoomControl:true,
      hasDrawLayer:false,
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
    if($CAMIC.viewer.pmanager)$CAMIC.viewer.pmanager.on();
    if(!$CAMIC.viewer.measureInstance) $UI.toolbar._sub_tools[2].style.display = 'none';
  });
  
  // ui init
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id:'ca_tools',
    zIndex:601,
    hasMainTools:false,
    //mainToolsCallback:mainMenuChange,
    subTools:[

      // rectangle
      {
        id:'labeling_mode',
        icon:'crop_landscape',// material icons' name
        title:'Rectangle',
        type:'radio',// btn/check/dropdown
        checked:true,
        value:'rect',
        callback:toggleMode
      },
      // point
      {
        id:'labeling_mode',
        icon:'fiber_manual_record',// material icons' name
        title:'Point',
        type:'radio',// btn/check/dropdown
        value:'point',
        callback:toggleMode
      },
      // measurment tool
      {
        id:'labeling_mode',
        icon:'space_bar',
        title:'Measurement',
        type:'radio',
        value:'measure',
        callback:toggleMode
      },
      {
        icon:'get_app',// material icons' name
        title:'Download Labeling',
        type:'btn',// btn/check/dropdown
        value:'download',
        callback:downloadLabel
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
function downloadLabel(){
  let text =`{"slideId":${$D.params.data['_id']['$oid']},"name":${$D.params.data['name']},"patches":${JSON.stringify($CAMIC.viewer.pmanager.exportPatchesAsJSON())}}`;
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', `${$D.params.data['name']}-Patches-${new Date().toISOString()}.json`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

}
function toggleMode(data){
  const mode = data.value;
  switch (mode) {
    case 'point':
      $CAMIC.viewer.measureInstance.off();
      $CAMIC.viewer.pmanager.isPoint = true;
      $CAMIC.viewer.pmanager.on();
      break;
      // statements_1
    case 'rect':
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

function redirect(url ,text = '', sec = 5){
  let timer = sec;
  setInterval(function(){
    if(!timer) {
      window.location.href = url;
    }

    if(Loading.instance.parentNode){
      Loading.text.textContent = `${text} ${timer}s.`;
    }else{
      Loading.open(document.body,`${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;

  }, 1000);
}
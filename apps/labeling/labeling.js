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
    $CAMIC = new CaMic("main_viewer",{id:$D.params.slideId}, opt);
  }catch(error){
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e){
    //  image loaded
    if(e.hasError){
      $UI.message.addError(e.message)
    }
  });

  $CAMIC.viewer.addHandler('open',function(){
    if($CAMIC.viewer.pmanager)$CAMIC.viewer.pmanager.on();
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
      }
      // ,
      // {
      //   icon:'share',
      //   title:'Share View',
      //   type:'btn',
      //   value:'share',
      //   callback:shareURL
      // },
      // {
      //   icon:'view_carousel',
      //   title:'Side By Side Viewer',
      //   value:'dbviewers',
      //   type:'check',
      //   callback:toggleViewerMode
      // }

    ]
  });




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

      console.log('rect');
      break;
    default:
      $CAMIC.viewer.pmanager.off();
      $CAMIC.viewer.measureInstance.on();
      // statements_def
      console.log('de');
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
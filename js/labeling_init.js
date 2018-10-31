const data1 = {
  center:{x:200,y:200},
  size:200,
  color:'pink',
  lineWeight:20

}; // image coodinate
const data2 = [[0.4,0.4],[0.4,0.5],[0.5,0.5],[0.5,0.4], [0.4,0.4]]; // viewport coodinate

// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  pages:{
    home:'./table.html',
    table:'./table.html'
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
    $CAMIC = new CaMic("main_viewer",$D.params.slideId, opt);
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

  // draw something
  $CAMIC.viewer.addOnceHandler('open',function(e){
    // ready to draw
    $CAMIC.vewer.omanage.addOverlay

  });
  // ui init
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id:'ca_tools',
    zIndex:601,
    hasMainTools:false,
    //mainToolsCallback:mainMenuChange,
    subTools:[
      // home
      {
        icon:'home',// material icons' name
        title:'Home',
        type:'btn',// btn/check/dropdown
        value:'home',
        callback:goHome
      },
      // measurment tool
      {
        icon:'space_bar',
        title:'Measurement',
        type:'check',
        value:'measure',
        callback:toggleMeasurement
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
function shareURL(data){

}
// go home callback
function goHome(data){
  redirect($D.pages.home,`GO Home Page`, 0);
}

function toggleMeasurement(data){
  //$UI.message.add(`Measument Tool ${data.checked?'ON':'OFF'}`);
  if(data.checked){
    $CAMIC.viewer.measureInstance.on();
    // turn off draw
    $UI.toolbar._sub_tools[1].querySelector('input[type=checkbox]').checked = false;
    $CAMIC.viewer.canvasDrawInstance.drawOff();
    $CAMIC.drawContextmenu.close();
    // turn off magnifier
    $UI.toolbar._sub_tools[2].querySelector('input[type=checkbox]').checked = false;
    $UI.spyglass.close();
  }else{
    $CAMIC.viewer.measureInstance.off();
  }
}
function renderOne(ctx,data){
  console.log('renderOne');
  console.log(ctx,data);
}
function renderTwo(ctx,data){
  console.log('renderTwo');
  console.log(ctx,data);
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
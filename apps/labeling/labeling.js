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
  var checkPackageIsReady = setInterval(function () {
    if(IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // init UI -- some of them need to wait data loader to load data
      // because UI components need data to initialize
      //initUIcomponents();
      $UI.message = new MessageQueue();
      
      $UI.modalbox = new ModalBox({
        id:'modalbox',
        hasHeader:true,
        headerText:'Patch List',
        hasFooter:false
      });
      // create a viewer and set up
      initCore();
    }
  }, 100);

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
  if(!$CAMIC.viewer.pmanager.hasPatches()){
    alert('There is no patches');
    return;
  }

  // create josn object
  const data = {
    slideId:$D.params.data['_id']['$oid'],
    name:$D.params.data['name'],
    location:$D.params.data['location']
  };

  data.patches = $CAMIC.viewer.pmanager.exportPatchesAsJSON('image');
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
function getPatchsZip(data){
  const zip = new JSZip();
  const imgFolder = zip.folder("images");
  empty($UI.modalbox.body);
  createPatchList(data.patches);
  $UI.modalbox.open();
  // return;
  data.patches.forEach((p,index)=>{
    // create somthing
    
    // get image from iip
    if(!p.isPoint) getImage({
      zip:zip,
      images:imgFolder,
      data:data,
      patch:p
    }, getImageCallback);
  })

  function check(patches){
    const p = patches.filter(p=>{return !p.isPoint}).find(p=>{return (!p.error)&&(!p.location)});
    if(p) return false;
    return true;
  }

  var checkImageIsReady = setInterval(function () {
   if(check(data.patches)) {
    clearInterval(checkImageIsReady);
    $UI.modalbox.body.innerHTML+=`<div style='color:#365f9c;font-size:20px'> Compressing...</div>`
    data.patches.forEach(p=> {
      delete p.label;
      delete p.widthInClient;
    })
    const meta_content = [['name','location'],[data.name,data.location]];
    const patch_cols = ['id','color','note','isPoint','x','y','width','height','loaction'];
    const patches_content = [patch_cols];

    data.patches.forEach((p,idx)=>{
      patches_content.push([idx,p['color'],p['note'],p['isPoint'],p['size']['x'],p['size']['y'],p['size']['width'],p['size']['height'],p['location']]);
    });
    
    zip.file(`metadata.csv`, meta_content.map(r=>r.join(",")).join("\n"));
    zip.file(`patches.csv`, patches_content.map(r=>r.join(",")).join("\n"));
    
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveAs(content, `${data.name}-Patches-${new Date().toISOString()}.zip`);
        $UI.modalbox.close();
    });
   }
  }, 500);
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


function getImage(result, callback){
  const data = result.data;
  const size = result.patch.size;
  const widthInClient = result.patch.widthInClient*OpenSeadragon.pixelDensityRatio;
  // const url = ImgloaderMode == 'iip'?`${window.location.origin}/img/IIP/raw/?IIIF=${data.location}/${size.x},${size.y},${size.width},${size.height}/${widthInClient},/0/default.jpg` : `${data.location}/${size.x},
  const url = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${data.location}/${size.x},${size.y},${size.width},${size.height}/${widthInClient},/0/default.jpg` : `${data.location}/${size.x},${size.y},${size.width},${size.height}/${widthInClient},/0/default.jpg`;
  fetch(url).then(function(response) {
    if(response.ok) {
      return response.blob();
    }
    // error
    const errorTxt = 'Detch Network response was not ok.';
    result.patch.label.textContent = errorTxt;
    result.patch.error = errorTxt;
    console.error(errorTxt, error.message);    

    throw new Error('Detch Network response was not ok.');
  }).then(function(blob) {
    if(callback) callback(result, blob);
  }).catch(function(error) {
    const errorTxt = 'There has been a problem with your fetch slide';
    result.patch.label.textContent = errorTxt;
    result.patch.error = errorTxt;
    console.error(errorTxt, error.message);
  });
}

function getImageCallback(result, blob){
  const index = result.data.patches.findIndex(p=>{return p==result.patch});
  result.images.file(`${index}.jpg`,blob);
  result.patch.location = `./images/${index}.jpg`;
  result.patch.label.textContent = 'Finished';
}
function createPatchList(patches){
  const list = document.createElement('div');

  patches.forEach((p,i)=>{
    const label = p.isPoint?'Finished':'Loading...';
    const type = p.isPoint?'(Point)':'(Rectangle)';
    const pdiv = document.createElement('div');
    pdiv.style.display='flex';
    pdiv.style.padding='1px';
    pdiv.innerHTML =`<div style="background-color:${p.color};width:22px;height:22px;border:2px #365f9c solid;"></div>
    <div style="padding:5px;background-color:#365f9c;font-size:14px;">Patch #${i}${type}</div>
    <div style="padding:5px;background-color:#365f9c;font-size:14px;">${label}</div>`;
    p.label = pdiv.querySelectorAll('div')[2];
    list.appendChild(pdiv);
  })
  $UI.modalbox.body.appendChild(list);

}
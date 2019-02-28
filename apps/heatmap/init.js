// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
let $minorCAMIC = null;
// for all instances of UI components
const $UI = new Map();

const $D = {
  pages:{
    home:'../table.html',
    table:'../table.html'
  },
  params:null, // parameter from url - slide Id and status in it (object).
  overlayers:null, // array for each layers
  templates:null // json schema for prue-form
};


// initialize viewer page
function initialize(){

  // init UI -- some of them need to wait data loader to load data
  // because UI components need data to initialize
  initUIcomponents();

  // create a viewer and set up
  initCore();

  // loading the form template data
  //FormTempaltesLoader();

  // loading the overlayers data
  //OverlayersLoader();


}

function loadData(){

}

// setting core functionalities
function initCore(){
  // start initial
  // TODO zoom info and mmp
  const opt = {
    draw:{
      // extend context menu btn group
      btns:[
        { // annotation
          type:'btn',
          title:'Annotation',
          class:'material-icons',
          text:'description',
          callback:saveAnnotation
        },
        { // analytics
          type:'btn',
          title:'Analytics',
          class:'material-icons',
          text:'settings_backup_restore',
          callback:saveAnalytics
        }
      ]
    }
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
    $CAMIC = new CaMic("main_viewer", slideQuery, opt);
  }catch(error){
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(async function(e){
    Loading.open(document.body, `Loading Data ...`);
    // image loaded
    if(e.hasError){
      $UI.message.addError(e.message)
      Loading.close();
    }else{
      $D.params.data = e;
      // loading heatmap data
      $D.heatMapData = await $CAMIC.store.getHeatmap($D.params.data.name,$D.params.execId).then(d=> d[0]);
      
      if(!$D.heatMapData){
        redirect($D.pages.table,`No Heatmap's data Found. Redirecting to Table.`);
      }

      // popup panel
      // $CAMIC.viewer.addHandler('canvas-lay-click',function(e){
      //   if(!e.data) {
      //     $UI.annotPopup.close();
      //     return;
      //   }
      //   // for support QUIP 2.0
      //   const data = Array.isArray(e.data)? e.data[e.data.selected]: e.data;

      //   const type = data.provenance.analysis.source;
      //   let body;
      //   let attributes;
      //   switch (type) {
      //     case "human":
      //       // human
      //       attributes = data.properties.annotations;
      //       body = convertHumanAnnotationToPopupBody(attributes);
      //       $UI.annotPopup.showFooter();
      //       break;
      //     case "computer":
      //       // handle data.provenance.analysis.computation = `segmentation`
      //       attributes = data.properties.scalar_features[0].nv;
      //       body = {type:'map',data:attributes};
      //       $UI.annotPopup.hideFooter();
      //       break;
      //     default:
      //       return;
      //       // statements_def
      //       break;
      //   }
      //   $UI.annotPopup.data = {
      //     id:data.provenance.analysis.execution_id,
      //     oid:data._id.$oid,
      //     annotation:attributes
      //   };
      //   $UI.annotPopup.setTitle(`id:${data.provenance.analysis.execution_id}`);
      //   $UI.annotPopup.setBody(body);
      //   $UI.annotPopup.open(e.position);
      // });

      // create the message bar TODO for reading slide Info TODO
      $UI.slideInfos = new CaMessage({
      /* opts that need to think of*/
        id:'cames',
        defaultText:`Slide: ${$D.params.data.name}`
      });

      // spyglass
      $UI.spyglass = new Spyglass({
        targetViewer:$CAMIC.viewer,
        imgsrc:$D.params.data.url
      });
    }
  });

  $CAMIC.viewer.addHandler('open',function(){
    Loading.open(document.body, `Loading Data ...`);
    // load the heatmap data
    //$D. = await $CAMIC.store.getHeatmap($D.case_id,'lym_v1-high_res').then(d=> d[0]);

    var checkImagingHelperIsReady = setInterval(function () {
      if($CAMIC.viewer.imagingHelper._haveImage && $D.heatMapData) {
        clearInterval(checkImagingHelperIsReady);

        // load data
        // console.time('fetch');
        // $D.heatData['lym_v1-high_res'] = await $CAMIC.store.getHeatmap($D.case_id,'lym_v1-high_res').then(d=> d[0]);
        // $D.heatData['lym_v1-low_res'] = await $CAMIC.store.getHeatmap($D.case_id,'lym_v1-low_res').then(d=> d[0]);
        // console.timeEnd('fetch');
        // console.log($D.heatData);
        // const exec_id = document.querySelector('.ctrl select').value;
        // const inputs = document.querySelectorAll('.ctrl input');
        // $D.heatData[exec_id].provenance.analysis.fields[0].threshold = inputs[0].value/100;
        // $D.heatData[exec_id].provenance.analysis.fields[1].threshold = inputs[1].value/100;
        // console.log(exec_id);
        // 
        // set thresholds for fields
        $D.heatMapData.provenance.analysis.fields.forEach(f=>{
          f.thresholds = [0.05,1];
        });

        $CAMIC.viewer.createHeatmap({
          opacity:.9, //inputs[2].value,
          coverOpacity:.3,
          data:$D.heatMapData.data,
          size:$D.heatMapData.provenance.analysis.size,
          fields:$D.heatMapData.provenance.analysis.fields,
          color:"#253494"//inputs[3].value
        });

        // create heatmap control
        $UI.heatmapcontrol = new HeatmapControl({
          mode:'binal',
          fields:$D.heatMapData.provenance.analysis.fields,
          opacities:[{
            name:'heat',
            value:0.9
          },{
            name:'cover',
            value:0.3
          }],
          onChange:heatmapSettingChanged,
          onOpacityChange:heatmapOpacityChanaged
        });

        $UI.settingsSideMenu.addContent($UI.heatmapcontrol.elt);

        Loading.close();
      }
    }, 500);
  });
}


// initialize all UI components
function initUIcomponents(){
  /* create UI components */


  // create the message queue
  $UI.message = new MessageQueue();

  // create the tool bar
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id:'ca_tools',
    zIndex:601,
    hasMainTools: false,
    //mainToolsCallback:mainMenuChange,
    subTools:[
      // setting
      {
        icon:'settings',// material icons' name
        title:'Settings',
        type:'check',// btn/check/dropdown
        value:'settings',
        callback:toggleHeatMapSettings
      },
      // home
      // {
      //   icon:'home',// material icons' name
      //   title:'Home',
      //   type:'btn',// btn/check/dropdown
      //   value:'home',
      //   callback:goHome
      // },
      //
      // pen
      // {
      //   icon:'create',// material icons' name
      //   title:'Draw',
      //   type:'multistates',
      //   callback:draw
      // },
      // magnifier
      {
        icon:'search',
        title:'Magnifier',
        type:'dropdown',
        value:'magn',
        dropdownList:[
          // free draw
          {
            //icon:'linear_scale',
            value:10,
            title:'10x',
            checked:true
          },
          // rectangle fraw
          {
            //icon:'timeline',
            value:20,
            title:'20x'
          },
          {
            //icon:'timeline',
            value:40,
            title:'40x'
          }
        ],
        callback:toggleMagnifier
      },
      // measurement tool
      {
        icon:'space_bar',
        title:'Measurement',
        type:'check',
        value:'measure',
        // dropdownList:[
        //   // free draw
        //   {
        //     icon:'linear_scale',
        //     value:'straight',
        //     title:'Line',
        //     checked:true
        //   },
        //   // rectangle draw
        //   {
        //     icon:'timeline',
        //     value:'coordinate',
        //     title:'Coordinate'
        //   }
        // ],
        callback:toggleMeasurement
      },
      // download TODO
      // {
      //   icon:'file_download',
      //   title:'Download Image',
      //   type:'btn',
      //   value:'download',
      //   callback:imageDownload
      // },
      // share
      // {
      //   icon:'share',
      //   title:'Share View',
      //   type:'btn',
      //   value:'share',
      //   callback:shareURL
      // },
      {
        icon:'view_carousel',
        title:'Side By Side Viewer',
        value:'dbviewers',
        type:'check',
        callback:toggleViewerMode
      }

    ]
  });

  // create two side menus for tools
  $UI.settingsSideMenu = new SideMenu({
    id:'settings_menu',
    width: 300,
    //, isOpen:true
    callback:toggleHeatMapSettings
  });
  const title = document.createElement('div');
  title.classList.add('item_head');
  title.textContent = 'Heatmap Settings';
  $UI.settingsSideMenu.addContent(title);


  // $UI.layersSideMenu = new SideMenu({
  //   id:'side_layers',
  //   width: 300,
  //   contentPadding:5,
  //   //, isOpen:true
  //   callback:toggleSideMenu
  // });

  // /* annotation popup */
  // $UI.annotPopup = new PopupPanel({
  //   footer:[
  //     // { // edit
  //     //   title:'Edit',
  //     //   class:'material-icons',
  //     //   text:'notes',
  //     //   callback:anno_edit
  //     // },
  //     { // delete
  //       title:'Delete',
  //       class:'material-icons',
  //       text:'delete_forever',
  //       callback:anno_delete
  //     }
  //   ]
  // });

  // var checkOverlaysDataReady = setInterval(function () {
  //   if($D.overlayers) {
  //     clearInterval(checkOverlaysDataReady);

  //     // create UI and set data
  //     $UI.layersViewer = new LayersViewer({id:'overlayers',data:$D.overlayers,sortChange:sort_change,callback:callback });

  //     callback($D.overlayers.filter(lay => lay.isShow));

  //     $UI.layersViewer.elt.parentNode.removeChild($UI.layersViewer.elt);

  //     // add to layers side menu
  //     const title = document.createElement('div');
  //     title.classList.add('item_head');
  //     title.textContent = 'Layers Manager';
  //     $UI.layersSideMenu.addContent(title);
  //     $UI.layersSideMenu.addContent($UI.layersViewer.elt);
  //   }
  // }, 500);



  // detach collapsible_list
  // $UI.appsList.elt.parentNode.removeChild($UI.appsList.elt);
  // $UI.appsSideMenu.addContent($UI.appsList.elt);

  // $UI.multSelector = new MultSelector({id:'mult_selector'});
  // $UI.multSelector.addHandler('cancel',multSelector_cancel);
  // $UI.multSelector.addHandler('action',multSelector_action);
}

function redirect(url ,text = '', sec = 5){
  let timer = sec;
  setInterval(function(){
    if(!timer) {
      window.location.href = url;
    }

    if(Loading.instance&&Loading.instance.parentNode){
      Loading.text.textContent = `${text} ${timer}s.`;
    }else{
      Loading.open(document.body,`${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;

  }, 1000);
}

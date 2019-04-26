const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicmFpbnZlbnRpb25zQGdtYWlsLmNvbSIsImF0dHJzIjpbImFkbWluIiwid3JpdGUiXSwiaWF0IjoxNTU2MjEwNTU3LCJleHAiOjE1NTYyMTQxNTd9.ojZA04vh7vhzPlGMP9piem3Z0nKaRpbYb1vae64ERas9dn-eSVdDSHwQAu34QtO6tmcpgTsArI16xRK4JOw982Minzq3Q2gfPH5lyn6-Ld7aO-DzyL6me_e4bURF96bbacWuZL-X2YtI7hx7KrhmlgJfsCuZyk4kjgzQsUdJtzdOS0inAwBB1AVRjBD9TJy3MT8A8KW5q6Ctmwqzw5iFqbuTDdfScBxyiPAemtS_9EdwK-5RNQiOkASLDJcUOGLUbL7KmdBy0EZx91zHmthREWtlsdQjBqF281-E2wev-VenARdrE67OjExeMF1-vz76WGKgKgfiM7kAWmwrX96zVg";
// ----------------- test ---------- //
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
  var checkPackageIsReady = setInterval(function () {
    if(IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // init UI -- some of them need to wait data loader to load data
      // because UI components need data to initialize
      initUIcomponents();
      // create a viewer and set up
      initCore();
    }
  }, 100);
  // loading the form template data
  //FormTempaltesLoader();

  // loading the overlayers data
  //OverlayersLoader();


}

// setting core functionalities
function initCore(){
  // start initial
  // TODO zoom info and mmp
  const opt = {};
  // set states if exist
  if($D.params.states){
    opt.states = $D.params.states;
  }
    // create the message queue
  $UI.message = new MessageQueue();
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
      const subject = $D.heatMapData.provenance.image.subject_id;
      const caseid = $D.heatMapData.provenance.image.case_id;
      const exec = $D.heatMapData.provenance.analysis.execution_id;
  
      // TODO for nano borb
      if(true){
        // query from DB
        const editData = await $CAMIC.store.findHeatmapEdit(getUserId(token), subject, caseid, exec).then(d=>d[0]);
        //const editData = await $CAMIC.store.findHeatmapEdit('test', subject, caseid, exec).then(d=>d[0]);
        $D.editedDataClusters = new EditDataCluster();
        if(editData&&Array.isArray(editData.data)&&editData.data.length > 0){
          setEditedDataClusters(editData.data);
        }
      }else{
        $D.editedDataClusters = new EditDataCluster();
      }
      


      if(!$D.heatMapData){
        redirect($D.pages.table,`No Heatmap's data Found. Redirecting to Table.`);
      }

      
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
   
    var checkImagingHelperIsReady = setInterval(function () {
      if($CAMIC.viewer.imagingHelper&& $CAMIC.viewer.imagingHelper._haveImage && $D.heatMapData && $D.editedDataClusters) {
        clearInterval(checkImagingHelperIsReady);
        
        
        //$D.editedDataClusters = createTestData(features);
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
        // $D.heatMapData.provenance.analysis.fields.forEach(f=>{
        //   f.threshold = [0.05,1];
        // });

        $CAMIC.viewer.createHeatmap({
          opacity:.65, //inputs[2].value,
          coverOpacity:.3,
          data:$D.heatMapData.data,
          editedData:$D.editedDataClusters,
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
            value:0.65
          },{
            name:'cover',
            value:0.3
          }],
          onChange:heatmapSettingChanged,
          onOpacityChange:heatmapOpacityChanaged
        });

        $UI.settingsSideMenu.addContent($UI.heatmapcontrol.elt);

        // create save botton if user is admin
        if(true){
          const btnDiv = createThreshold();
          $UI.settingsSideMenu.addContent(btnDiv);
        }  
        // create heatmap editor
        
        
        
        // $UI.heatmapcontrol = new HeatmapControl({
        //   mode:'binal',
        //   fields:$D.heatMapData.provenance.analysis.fields,
        //   opacities:[{
        //     name:'heat',
        //     value:0.65
        //   },{
        //     name:'cover',
        //     value:0.3
        //   }],
        //   onChange:heatmapSettingChanged,
        //   onOpacityChange:heatmapOpacityChanaged
        // });
        
        $UI.heatmapEditorPanel = new HeatmapEditorPanel({
          fields:$D.heatMapData.provenance.analysis.fields,
          // editedDate:$D. 
          onFieldChange: editorPenChange, 
          onReset: function(){
            if(confirm('Do you want to clear edited data?')){
              $CAMIC.viewer.canvasDrawInstance.clear();  
            }
          }, // clearEditData
          onSave: saveEditData
        });
        $UI.editorSideMenu.addContent($UI.heatmapEditorPanel.elt);

        // create edited data list 
        $UI.heatmapEditedDataPanel = new HeatmapEditedDataPanel({
          // data:$D.heatMapData.editedClusters,
          data:$D.editedDataClusters,
          // editedDate:$D. 
          onDBClick: locateEditData,
          onDelete: onDeleteEditData
        });

        $UI.editedListSideMenu.addContent($UI.heatmapEditedDataPanel.elt);

        Loading.close();

      }
    }, 500);
  });
}


// initialize all UI components
function initUIcomponents(){
  /* create UI components */




  // create the tool bar
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id:'ca_tools',
    zIndex:601,
    hasMainTools: false,
    //mainToolsCallback:mainMenuChange,
    subTools:[
      {
        name:'editeddate',
        icon:'view_list',// material icons' name
        title:'Edited Data List',
        type:'check',// btn/check/dropdown
        value:'editeddate',
        callback:toggleHeatMapDataList
      },
      // setting
      {
        name:'settings',
        icon:'settings',// material icons' name
        title:'Settings',
        type:'check',// btn/check/dropdown
        value:'settings',
        callback:toggleHeatMapSettings
      },{
        name:'editor',
        icon:'create',// material icons' name
        title:'editor',
        type:'check',// btn/check/dropdown
        value:'editor',
        callback:toggleHeatMapEditor     
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
        name:'magnifier',
        icon:'search',
        title:'Magnifier',
        type:'dropdown',
        value:'magn',
        dropdownList:[
          // free draw
          {
            //icon:'linear_scale',
            value:0.5,
            title:'0.5',
            checked:true
          },
          // rectangle fraw
          {
            //icon:'timeline',
            value:1,
            title:'1.0'
          },
          {
            //icon:'timeline',
            value:2,
            title:'2.0'
          }
        ],
        callback:toggleMagnifier
      },
      // measurement tool
      {
        name:'measurement',
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
        name:'sbsviewer',
        icon:'view_carousel',
        title:'Side By Side Viewer',
        value:'dbviewers',
        type:'check',
        callback:toggleViewerMode
      },{
        name:'viewer',
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
      },{
        name:'bugs',
        icon: 'bug_report',
        title: 'Bug Report',
        value: 'bugs',
        type: 'btn',
        callback: ()=>{window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53','_blank').focus()}
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


    var checkIsReady = setInterval(function () {
      if($CAMIC&& $CAMIC.viewer && $CAMIC.viewer.imagingHelper && $CAMIC.viewer.imagingHelper._haveImage && $D.heatMapData && $D.editedDataClusters) {
        clearInterval(checkIsReady);
        // create editor side menu
        $UI.editorSideMenu = new SideMenu({
          id:'editor_menu',
          width: 300,
          //, isOpen:true
          callback:toggleHeatMapEditor
        });
        const title = document.createElement('div');
        title.classList.add('item_head');
        title.textContent = 'Heatmap Editor';
        $UI.editorSideMenu.addContent(title);

        // create edited data list side menu
        $UI.editedListSideMenu = new SideMenu({
          id:'edit_list_menu',
          width: 300,
          //, isOpen:true
          callback:toggleHeatMapEditor
        });
        const title1 = document.createElement('div');
        title1.classList.add('item_head');
        title1.textContent = 'Edited Data List';
        $UI.editedListSideMenu.addContent(title1);


        $CAMIC.viewer.canvasDrawInstance.drawMode = 'grid';
        function getGridSizeInImage(size){
          const correctValue = 0.1;
          let [w,h] = size;
          w = w*$CAMIC.viewer.imagingHelper.imgWidth;
          h = h*$CAMIC.viewer.imagingHelper.imgHeight;
          if(w > 400) return [w, h];
          return [w - correctValue, h - correctValue];
        }
        $CAMIC.viewer.canvasDrawInstance.size = getGridSizeInImage($D.heatMapData.provenance.analysis.size);
      }
    });

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

function setEditedDataClusters(editData){
  editData.forEach(d=>{
    const cluster = new EditDataCollection(d.index, d.name, d.value, d.color, d.data);
    $D.editedDataClusters.addCluster(cluster);
  });
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
function createThreshold(){
  const div = document.createElement('div');
  div.classList.add('hmep-container');
  div.style.border = 'none';
  const div1 = document.createElement('div');
  div1.classList.add('btn-panel');

  
  const btn = document.createElement('button');
  btn.classList.add('action');
  btn.style.float = 'right';
  btn.textContent = 'Save Threshold';
  div.appendChild(div1);
  div1.appendChild(btn);
  btn.addEventListener('click', onUpdateHeatmapFields);
  return div;
}
function getUserId(token){
  const token_data = parseJwt(token);
  return token_data.name;
}

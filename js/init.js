// CAMIC is an instance of camicroscope core 
// $CAMIC in there
let $CAMIC = null;
// for all instances of UI components
const $UI = new Map();

const $D = {
  pages:{
    home:'/table.html',
    table:'/table.html'
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
  FormTempaltesLoader();

  // loading the overlayers data
  OverlayersLoader();
  

}

function loadData(){

}

// setting core functionalities
function initCore(){
  // start inital
  // TODO zoom info and mmp
  try{
    $CAMIC = new CaMic("main_viewer",$D.params.slideId, {
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
    });
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
    }else{
      $D.params.data = e;
      // popup panel
      $UI.message.add('Core is loaded');
      $CAMIC.viewer.addHandler('canvas-lay-click',function(e){
        if(!e.data) {
          $UI.annotPopup.close();
          return;
        } 
        const body = convertToPopupBody(e.data.properties.annotations);
        $UI.annotPopup.data = {
          id:e.data.provenance.analysis.execution_id,
          oid:e.data._id.$oid,
          annotation:e.data.properties.annotations
        };
        $UI.annotPopup.setTitle(`id:${e.data.provenance.analysis.execution_id}`);
        $UI.annotPopup.setBody(body);
        $UI.annotPopup.open(e.position);
      });

      // spyglass
      $UI.spyglass = new Spyglass({
        targetViewer:$CAMIC.viewer,
        imgsrc:$D.params.data.location
      });
      
      
    }
  });
}


// initialize all UI components
function initUIcomponents(){
  /* create UI components */
  

  // create the message queue
  $UI.message = new MessageQueue();

  $UI.message.add('start loading UI components');


  // create the tool bar
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id:'ca_tools',
    zIndex:601,
    mainToolsCallback:mainMenuChange,
    subTools:[  
      // home
      {
        icon:'home',// material icons' name
        title:'Go Home Page',
        type:'btn',// btn/check/dropdown
        value:'home',
        callback:goHome
      }, //
      // pen
      {
        icon:'create',// material icons' name
        title:'Draw',
        type:'check',
        callback:draw
      },
      // magnifier
      {
        icon:'image_search',
        title:'Magnifier',
        type:'check',
        value:'magn',
        checked:true,
        callback:toggleMagnifier
      },
      // download
      {
        icon:'file_download',
        title:'Download Image',
        type:'btn',
        value:'download',
        callback:imageDownload
      },
      // share
      {
        icon:'share',
        title:'Share URL',
        type:'btn',
        value:'share',
        callback:shareURL
      }

    ]
  });

  $UI.message.add('Toolbar loaded');

  // create two side menus for tools
  $UI.appsSideMenu = new SideMenu({
    id:'side_apps',
    width: 300,
    //, isOpen:true
    callback:toggleSideMenu
  });
  $UI.message.add('Apps Side Menu loaded');
    
  $UI.layersSideMenu = new SideMenu({
    id:'side_layers',
    width: 300,
    contentPadding:5,
    //, isOpen:true
    callback:toggleSideMenu
  });
  $UI.message.add('Layers Side Menu loaded');



  /* annotation popup */
  $UI.annotPopup = new PopupPanel({
    footer:[      
      // { // edit   
      //   title:'Edit',
      //   class:'material-icons',
      //   text:'notes',
      //   callback:anno_edit
      // },
      { // delete
        title:'Delete',
        class:'material-icons',
        text:'delete_forever',
        callback:anno_delete
      }
    ]
  });
  $UI.message.add('Annotation Popup Panel loaded');


  // create the message bar TODO for reading slide Info TODO
  $UI.slideInfos = new CaMessage({
  /* opts that need to think of*/
    id:'cames',
    defaultText:`Slide Id: ${$D.params.slideId}`
  });
  $UI.message.add('Slide Info loaded');
  



  var checkOverlaysDataReady = setInterval(function () {
    if($D.overlayers) {
      clearInterval(checkOverlaysDataReady);

      // create UI and set data
      $UI.layersViewer = new LayersViewer({id:'overlayers',data:$D.overlayers,sortChange:sort_change,callback:callback });

      $UI.layersViewer.elt.parentNode.removeChild($UI.layersViewer.elt);

      // add to layers side menu
      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Layers Manager';
      $UI.layersSideMenu.addContent(title);
      $UI.layersSideMenu.addContent($UI.layersViewer.elt);

      $UI.message.add('Overlayers Viewer loaded');
    }
  }, 500);





  
  var checkTemplateSchemasDataReady = setInterval(function () {
    if($D.templates) {
      clearInterval(checkTemplateSchemasDataReady);
      const annotRegex = new RegExp('annotation', 'gi'); 
      const annotSchemas = $D.templates.filter(item=> item.id.match(annotRegex));
      /* annotation control */
      $UI.annotOptPanel = new OperationPanel({
        //id:
        //element:
        formSchemas:annotSchemas,
        action:{
          title:'Save',
          callback:anno_callback
        }
      });
      $UI.appsList.clearContent('annotation');
      $UI.appsList.addContent('annotation',$UI.annotOptPanel.elt);
      
      $UI.message.add('Annotation Operation Panel loaded');
      
      /* algorithm control */
      const algoRegex = new RegExp('algo', 'gi'); 
      const algoSchemas = $D.templates.filter(item => item.id.match(algoRegex));
      $UI.algOptPanel = new OperationPanel({
        //id:
        //element:
        title:'Algorithm:',
        formSchemas:algoSchemas,
        action:{
          title:'Run',
          callback:algo_callback
        }
      });
      $UI.appsList.clearContent('analytics');
      $UI.appsList.addContent('analytics',$UI.algOptPanel.elt);
      $UI.appsList.addContent('analytics', AnalyticsPanelContent);
      
      $UI.message.add('Analytics Operation Panel loaded');

    }
  }, 500);



    // collapsible list 
  $UI.appsList = new CollapsibleList({
    id:'collapsiblelist',
    list:[
      {
        id:'annotation',
        title:'Annotation',
        icon:'border_color',
        content: "No Template Loaded" //$UI.annotOptPanel.elt
        // isExpand:true

      },{
        id:'analytics',
        icon:'find_replace',
        title:'Analytics',
        content:"No Template Loaded" //$UI.algOptPanel.elt,
      }
    ],
    changeCallBack:getCurrentItem
  });
    

  // detach collapsible_list 
  $UI.appsList.elt.parentNode.removeChild($UI.appsList.elt);
  $UI.appsSideMenu.addContent($UI.appsList.elt);
  $UI.message.add('Apps Panel loaded');
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







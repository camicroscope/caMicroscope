//
// somehing for scale bar
const MPP = {'mpp-x': 0.499, 'mpp-y': 0.499};

let camic;
let viewer;
let tools;
let camessage;
let zctrl;
let side_apps;
let side_layers;
let layer_manager;
let collapsible_list;



// dummy zoom setting
let zoomSetting = {
	maxZoomLevel:4,
	minZoomLevel:.4
}
// layers data
let isLoad = false;
let layersData;


// get layers data
async function getLayers(){
  // give 
  var mts = await camic.store.getMarktypes()
  var hms = await camic.store.getHeatmaps()
  var retData = []
  mts.forEach(async function(mt){
    // create a layer
    let layer = camic.layers.getLayer(mt.name)
    // get marks
    let marks = await camic.store.getMarks(mt.name)
    let ld = {"id": mt.name, "name": mt.name, "typeId":1, "typeName": "Human Annotation"}
    retData.push(ld);
    // put marks on layer
    marks.forEach(mark => {
      renderFeature(mt.name, mark, layer);
    })
    // add to layersData
    console.log('init.getLayers mts');
    isLoad = true;

  })
  hms.forEach(function(hm){
    // create layer
    let layer = camic.layers.getLayer(hm.name)
    // render the heatmap
    let dl = camic.layers.delayers[hm.name]
    var size = viewer.world.getItemAt(0).getContentSize();
    let heat = simpleheat(dl, hm.height, hm.width, size.x, size.y)
    heat.data(hm.values).radius(10).max(500000).draw()
    let ld = {id: hm.name, name: hm.name, typeId:2, typeName: "Heatmap"}
    retData.push(ld)

  }.bind(this))
  // ensure all disabled
  camic.layers.visibleLayers = new Set([]);
  return retData;
}


// setting core functionalities
function settingCore(){
	function getUrlVars() {
	    console.log('init.getUrlVars')
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    return vars;
	}
	camic = new CaMic("main_viewer",getUrlVars().slide, {
		maxZoomLevel:zoomSetting.maxZoomLevel,
		minZoomLevel:zoomSetting.minZoomLevel
	});
	camic.loadImg();
	viewer = camic.viewer;
}

// loading data from server
function loadData(){
	getLayers().then(x=>{
		function isDataLoaded(){
			console.log('getLayers.....'+ isLoad);
			if(isLoad) {
				layersData=x;
				console.log(layersData)
				clearInterval(checkData);
				
				//layer_manager = new LayersViewer({id:'overlayers',data:layersData,callback:callback });


				initUIcomponents();
			}
		}
		let checkData = setInterval(isDataLoaded, 30);
	});
}


// initalize all UI components
function initUIcomponents(){
	/* create UI components */
	
	// create two side menus for tools
	side_apps = new SideMenu({
		id:'side_apps',

		//, isOpen:true
		callback:toggleSideMenu
	});
	side_layers = new SideMenu({
		id:'side_layers',
		contentPadding:5,
		//, isOpen:true
		callback:toggleSideMenu
	});


	// create the tool bar
	tools = new CaToolbar({
	/* opts that need to think of*/
		id:'ca_tools',

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
				type:'dropdown',// btn/check/dropdown
				value:'draw',
				//checked:true,
				dropdownList:[
					// free draw
					{
						icon:'gesture',
						value:'free',
						title:'Free Draw',
						checked:true
					},
					// rectangle fraw
					{
						icon:'crop_square',
						value:'rect',
						title:'Rectangle'
					}
				],
				callback:penDraw
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

	// create the message bar
	camessage = new CaMessage({
	/* opts that need to think of*/
		id:'cames',
		defaultText:'ID: 110-asdda-4345-na'
	});
	
	// zoom control
	zctrl = new CaZoomControl({
		'id':'zctrl',
		'viewer':viewer,
		'zoom':{
			'max':zoomSetting.maxZoomLevel,
			'min':zoomSetting.minZoomLevel,
			'cur':1,
			'step':0.01
		}
	});



    // overlayer manager
    layer_manager = new LayersViewer({id:'overlayers',data:layersData,callback:callback });

    // detach overlayer manager
    layer_manager.elt.parentNode.removeChild(layer_manager.elt);
	
    // add to layers side menu
    const title = document.createElement('h2');
    title.textContent = 'Layers Manager';
    side_layers.addContent(title);
    side_layers.addContent(layer_manager.elt);

    // collapsible list	
	collapsible_list = new CollapsibleList({
		id:'collapsiblelist',
		list:[
			{
				id:'annotation',
				title:'Annotation',
				icon:'border_color',
				content: AnnotationsPanelContent
				// isExpand:true

			},{
				id:'analytics',
				icon:'find_replace',
				title:'Analytics',
				content:AnalyticsPanelContent,
			}
			// ,{
			// 	id:'testpanel',
			// 	icon:'face',
			// 	title:'This Title For Test',
			// 	content:'test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test'

			// }
		],
		changeCallBack:getCurrentItem
	});

	// detach collapsible_list 
	collapsible_list.elt.parentNode.removeChild(collapsible_list.elt);
	side_apps.addContent(collapsible_list.elt);
}


/* UI callback functions list */
// side menu close callback
function toggleSideMenu(opt){
	if(!opt.isOpen){
		const id = opt.target.id.split('_')[1];
		tools.changeMainToolStatus(id,false);
	}
}

// go home callback
function goHome(data){
	alert('Go Home....');
	console.log(data);
}

// pen draw callback
function penDraw(data){
	camessage.sendMessage(`Pen: ${data.checked?'ON':'OFF'} | Mode: ${data.status} `, {size:'15px',color:'white', bgColor:'MediumPurple'}, 3);
	console.log(data);
}

// toggle magnifier callback
function toggleMagnifier(data){
	camessage.sendMessage(`Magnifier ${data.checked?'ON':'OFF'}`, {size:'15px',color:'white', bgColor:'blue'}, 3);
	console.log(data);
}


// image download
function imageDownload(data){
	alert('Download Image');
	console.log(data);
}

// share url
function shareURL(data){
	window.prompt('Share this link', 'http://localhost/camicroscope/osdCamicroscope.php?tissueId=TEST&state=eyJwb3NpdGlvbiI6eyJ4IjowLjUsInkiOjAuNTk2OTIxNzMzMTEwMDQyNywieiI6MC41NzcxMDk2MjYwOTczNDM0fSwiYWxnIjpbImh1bWFubWFyayJdfQ%3D%3D');
	console.log(data);
}
// main menu changed
function mainMenuChange(data){

	if(data.apps){
		side_apps.open();
	}else{
		side_apps.close();
	}

	if(data.layers){
		side_layers.open();
	}else{
		side_layers.close();
	}
}

// overlayer manager callback function
function callback(data,isDisplay){
	if (isDisplay){
		data.forEach((x)=>camic.layers.visibleLayers.add(x.name))
	} else {
		data.forEach((x)=>camic.layers.visibleLayers.delete(x.name))
	}
	// refresh viewer
	camic.viewer.forceRedraw();
}
/* 
	collapsible list
	1. Annotation
	2. Analytics
*/
function getCurrentItem(data){
	console.log(data);
}
// some fake events callback for demo


function annotationSave(){
	camessage.sendMessage('Annotation Saved', {size:'20px',color:'white', bgColor:'lightblue'}, 3);

};
function algoRun(){
	camessage.sendMessage('Algo is running...', {size:'20px',color:'white', bgColor:'lightpink'}, 3);

}

/* call back list END */

// initialize viewer page
function initialize(){
	console.log('start...');
	// create a viewer and set up
	settingCore();

	// loading the data
	camic.viewer.addHandler('open', loadData);
	
	// initalize
	//initUIcomponents();
	




}


document.addEventListener('DOMContentLoaded', initialize);



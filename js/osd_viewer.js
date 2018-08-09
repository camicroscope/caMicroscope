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

let annotation_control;
let algorithm_control;


let annotations = [];
// dummy zoom setting
let zoomSetting = {
	maxZoomLevel:4,
	minZoomLevel:.4
}
// layers data
let isLoad = false;
let layersData = [];


// get layers data
// async function getLayers(){
//   // give 
//   var mts = await camic.store.getMarktypes()
//   var hms = await camic.store.getHeatmaps()
//   var retData = []
//   mts.forEach(async function(mt){
//     // // create a layer
//     // let layer = camic.layers.getLayer(mt.name)
//     // // get marks
//     // let marks = await camic.store.getMarks(mt.name)
//     // let ld = {"id": mt.name, "name": mt.name, "typeId":1, "typeName": "Human Annotation"}
//     // retData.push(ld);
//     // // put marks on layer
//     // marks.forEach(mark => {
//     //   renderFeature(mt.name, mark, layer);
//     // })
//     // add to layersData
//     console.log('init.getLayers mts');
//     isLoad = true;

//   })
//   hms.forEach(function(hm){
//     // create layer
//     let layer = camic.layers.getLayer(hm.name)
//     // render the heatmap
//     let dl = camic.layers.delayers[hm.name]
//     var size = viewer.world.getItemAt(0).getContentSize();
//     let heat = simpleheat(dl, hm.height, hm.width, size.x, size.y)
//     heat.data(hm.values).radius(10).max(500000).draw()
//     let ld = {id: hm.name, name: hm.name, typeId:2, typeName: "Heatmap"}
//     retData.push(ld)

//   }.bind(this))
//   // ensure all disabled
//   camic.layers.visibleLayers = new Set([]);
//   return retData;
// }


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
		minZoomLevel:zoomSetting.minZoomLevel,
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
	camic.loadImg();
	viewer = camic.viewer;
}

// loading data from server
// function loadData(){
// 	getLayers().then(x=>{
// 		function isDataLoaded(){
// 			console.log('getLayers.....'+ isLoad);
// 			if(isLoad) {
// 				layersData=x;
// 				console.log(layersData)
// 				clearInterval(checkData);
				
// 				//layer_manager = new LayersViewer({id:'overlayers',data:layersData,callback:callback });


// 				initUIcomponents();
// 			}
// 		}
// 		let checkData = setInterval(isDataLoaded, 30);
// 	});
// }

/*  */
/*  */

// initialize all UI components
function initUIcomponents(){
	/* create UI components */
	
	// create two side menus for tools
	side_apps = new SideMenu({
		id:'side_apps',
		width: 300,
		//, isOpen:true
		callback:toggleSideMenu
	});
	side_layers = new SideMenu({
		id:'side_layers',
		width: 300,
		contentPadding:5,
		//, isOpen:true
		callback:toggleSideMenu
	});


	// create the tool bar
	tools = new CaToolbar({
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
				// type:'dropdown',// btn/check/dropdown
				// value:'draw',
				// //checked:true,
				// dropdownList:[
				// 	// free draw
				// 	{
				// 		icon:'gesture',
				// 		value:'free',
				// 		title:'Free Draw',
				// 		checked:true
				// 	},
				// 	// rectangle fraw
				// 	{
				// 		icon:'crop_square',
				// 		value:'rect',
				// 		title:'Rectangle'
				// 	}
				// ],
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
    layer_manager = new LayersViewer({id:'overlayers',data:annotations,callback:callback });

    // detach overlayer manager
    layer_manager.elt.parentNode.removeChild(layer_manager.elt);
	
    // add to layers side menu
    const title = document.createElement('h2');
    title.textContent = 'Layers Manager';
    side_layers.addContent(title);
    side_layers.addContent(layer_manager.elt);



	
    
    /* annotation control */
    annotation_control = new OperationPanel({
    	//id:
    	//element:
    	formSchemas:[annotation_schema],
    	action:{
    		title:'Save',
    		callback:anno_callback
    	}
    });
        /* algorthm control */
    algorithm_control = new OperationPanel({
    	//id:
    	//element:
    	title:'Algorithm:',
    	formSchemas:[algorithm_1_schema, algorithm_2_schema],
    	action:{
    		title:'Run',
    		callback:algo_callback
    	}
    });
	
	
    // collapsible list	
	collapsible_list = new CollapsibleList({
		id:'collapsiblelist',
		list:[
			{
				id:'annotation',
				title:'Annotation',
				icon:'border_color',
				content: annotation_control.elt
				// isExpand:true

			},{
				id:'analytics',
				icon:'find_replace',
				title:'Analytics',
				content:algorithm_control.elt,
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

	collapsible_list.addContent('analytics', AnalyticsPanelContent);

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
	camessage.sendMessage(`Pen: ${data.checked?'ON':'OFF'} | Mode: ${camic.draw.drawMode} `, {size:'15px',color:'white', bgColor:'MediumPurple'}, 3);
	if(!camic.draw){
		alert('draw doesn\'t initialize');
		return;
	}
	if(data.checked){ // draw on
		camic.draw.drawOn();
	}else{ // draw off
		camic.draw.drawOff();
	}
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

function anno_callback(data){
	// is form ok?
	const noteData = annotation_control._form_.value;
	if(annotation_control._action_.disabled || noteData.name == ''){
		
		// close layer silde
		tools._main_tools[1].querySelector('[type=checkbox]').checked = false;
		side_layers.close();
		
		// open app silde
		tools._main_tools[0].querySelector('[type=checkbox]').checked = true;
		side_apps.open();
		// open annotaion list
		collapsible_list.triggerContent('annotation','open');
		return;
		
	}
	// has Path?
	
	if(!camic.draw._draws_data_ || camic.draw._draws_data_.length ==0){
		alert('No Markup on Annotation.');
		return;
	}
	const canvasData = camic.draw.getPaths();
	console.log('save...');

	// save
	const id = randomId();
	const anno = {
		id:id,
		name:noteData.name,
		typeId:1,
		typeName:'Human Annotation',
		note:noteData,
		canvasData:canvasData
	};
	
	// create overlayer
	anno.layer = camic.layersManager.addOverlayer(
		{
			id:id,
			data:anno,
			render:anno_render,
			clickable:true,
			isHighlight:true
		},false);
	// save layer data
	// "typeId":1, "typeName": "Human Annotation"
	annotations.push(anno);
	console.log(annotations);
	layer_manager.update();


	/* reset as default */
	// clear draw data and UI
	camic.draw.drawOff();
	camic.draw.clear();
	// uncheck pen draw icon and checkbox
	tools._sub_tools[1].querySelector('[type=checkbox]').checked = false;
	// clear form
	annotation_control.clear();

		
	// close app side
	tools._main_tools[0].querySelector('[type=checkbox]').checked = false;
	side_apps.close();
	collapsible_list.triggerContent('annotation','close');

	// open layer side
	tools._main_tools[1].querySelector('[type=checkbox]').checked = true;
	side_layers.open();

	

}

function algo_callback(data){
	console.log(data);

}

// overlayer manager callback function
function callback(data,isDisplay){
	if (isDisplay){
		data.forEach((x)=>x.layer.show())
	} else {
		data.forEach((x)=>x.layer.hide())
	}
	// refresh viewer
	//camic.viewer.forceRedraw();
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
	//camic.viewer.addHandler('open', loadData);
	
	// initialize
	initUIcomponents();
	
}
/* --  -- */
function saveAnnotation(){
	console.log('saveAnnotation');
	
	anno_callback.call(null,{id:annotation_control.setting.formSchemas[annotation_control._select_.value].id, data:annotation_control._form_.value});
}
function saveAnalytics(){
	console.log('saveAnalytics');
}
/* --  -- */
/* -- for render anno_data to canavs -- */
function anno_render(){
	console.log('anno_render');
	DrawHelper.draw(this._canvas_ctx, this.data.canvasData);
}
/* --  -- */
document.addEventListener('DOMContentLoaded', initialize);



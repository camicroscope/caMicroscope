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
	 
	
	setStyle();
	const chked = document.getElementById('drawChked');
	chked.checked = data.checked;
	if(data.checked){ // draw on
		camic.draw.drawOn();
		
		
		//contextMenuOn();
		//ctrl.style.display = '';

	}else{ // draw off
		camic.draw.drawOff();
		
		//contextMenuOff();
		//ctrl.style.display = 'none';
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
	const pathData = camic.draw.getPaths();
	if(!camic.draw._draws_data_ || camic.draw._draws_data_.length ==0){
		alert('No Markup on Annotation.');
		return;
	}

	console.log('save...');

	// save
	
	const id = randomId();
	// create overlayer
	overlayer = camic.layersManager.addOverlayer(id,pathData,anno_render,false);
	// save layer data
	// "typeId":1, "typeName": "Human Annotation"
	annotations.push({
		id:id,
		name:noteData.name,
		typeId:1,
		typeName:'Human Annotation',
		note:noteData,
		path:pathData,
		layer:overlayer
	});
	console.log(annotations);
	layer_manager.update();


	/* reset as default */
	// clear draw data and UI
	camic.draw.clear();
	// uncheck pen draw icon and checkbox
	document.getElementById('drawChked').checked = false;
	tools._sub_tools[1].querySelector('[type=checkbox]').checked = false;
	//document.getElementById('drawChked').checked = false;
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


let color;
let weight;
function setStyle(){
	camic.draw.style =  {
		color:color.value,
		lineJoin:document.querySelector('input[name=lineJoin]:checked').value,
		lineCap:document.querySelector('input[name=lineCap]:checked').value,
		lineWidth:weight.value
	};
	camic.draw.drawMode = document.querySelector('input[name=style]:checked').value;
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
	
	// -- tem-- //
	weight = document.getElementById('weight');
	const weightLabel = document.getElementById('weightLabel');
	color = document.getElementById('color');
	const colorLabel = document.getElementById('colorLabel');
	
	// color
	color.addEventListener('change', e=>{
		colorLabel.textContent = color.value;
		colorLabel.style.color = color.value;
		setStyle();
	})

	// weight
	weight.addEventListener('change', e=>{
		weightLabel.textContent = weight.value;
		setStyle();
	})

	//
	//document.querySelector('input[name=style]:checked')
	// lineCap
	const styleRadio = document.querySelectorAll('input[name=style]');
	styleRadio.forEach(radio => radio.addEventListener('click',setStyle));
	const capRadio = document.querySelectorAll('input[name=lineCap]');
	capRadio.forEach(radio => radio.addEventListener('click',setStyle));
	const joinRadio = document.querySelectorAll('input[name=lineJoin]');
	capRadio.forEach(radio => radio.addEventListener('click',setStyle));

	//multiple_layer();
	// test for multiple
	//viewer
	//
	const context_btn = document.getElementById('save_anno');
	context_btn.addEventListener('click', saveAnnotation);

	contextMenuOn();
	//context_btn.addEventListener('click', saveAnnotation);
	const chked = document.getElementById('drawChked');
	chked.addEventListener('change', drawChecked);
}
function drawChecked(e){
	const chked = document.getElementById('drawChked');
	tools._sub_tools[1].querySelector('[type=checkbox]').checked = chked.checked;
	penDraw({checked:chked.checked});

}
/* -- context menu start -- */
function closeStyleMenu(e){

	var clickeElIsLink = clickInsideElement( e, 'draw_context' );
    if ( clickeElIsLink ) {
      //e.preventDefault();

      return;
    //   menuItemListener( clickeElIsLink );
    // } else {
    //   var button = e.which || e.button;
    //   if ( button === 1 ) {
    //     toggleMenuOff();
    //   }
    }
	console.log('close ...... style');
	const ctrl = document.getElementById('drawCtrl');
	ctrl.style.display = 'none';
}
function openStyleMenu(e){
	console.log('open ...... style');
	const ctrl = document.getElementById('drawCtrl');
	
	if( window.innerWidth > e.clientX + 250){
		ctrl.style.left = e.clientX+'px';
	}else{
		ctrl.style.left = (e.clientX- 250)+'px';
	}

	if(window.innerHeight > e.clientY + 150){
		ctrl.style.top = e.clientY+'px';
	}else{
		ctrl.style.top = (e.clientY - 150)+'px';
	}	
	
	//ctrl.style.top = e.clientY+'px';
	ctrl.style.display = '';
	e.preventDefault();
	//e.stopPropagation();
}

function contextMenuOn(){
	console.log('contextMenuOn');
	window.addEventListener('contextmenu', openStyleMenu);
	window.addEventListener('mousedown', closeStyleMenu);
	camic.viewer.addHandler('canvas-click',closeStyleMenu);
}

function contextMenuOff(){
	console.log('contextMenuOff');
	const ctrl = document.getElementById('drawCtrl');
	ctrl.style.display = 'none';
	window.removeEventListener('contextmenu', openStyleMenu);
	window.removeEventListener('mousedown', closeStyleMenu);	
}

function clickInsideElement( e, className ) {
  var el = e.srcElement || e.target || e.eventSource.canvas;

  if ( el.classList.contains(className) ) {
    return el;
  } else {
    while ( el = el.parentNode ) {
      if ( el.classList && el.classList.contains(className) ) {
        return el;
      }
    }
  }

  return false;
}

/* -- context menu end -- */
/* --  -- */
function saveAnnotation(){
	console.log('saveAnnotation');
	
	anno_callback.call(null,{id:annotation_control.setting.formSchemas[annotation_control._select_.value].id, data:annotation_control._form_.value});
}
/* --  -- */
/* --  -- */
function anno_render(){
	const data = camic.draw._draws_data_;
	DrawHelper.draw(this._canvas_ctx, data);
}
/* --  -- */
document.addEventListener('DOMContentLoaded', initialize);



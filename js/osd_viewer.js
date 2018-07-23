//
// somehing for scale bar
const MPP = {'mpp-x': 0.499, 'mpp-y': 0.499};

let viewer;
let tools;
let camessage;
let zctrl;
let side_apps;
let side_layers;

function initialize(){
	console.log('start...');
	// create a viewer and set up

	// create two side menus for tools
	side_apps = new SideMenu({'id':'side_apps'});
	side_layers = new SideMenu({'id':'side_layers'});


	tools = new CaToolbar({
	/* opts that need to think of*/
		'id':'ca_tools',
		'menus':{
			'side_apps':side_apps,
			'side_layers':side_layers
		},
		'btns':{
			'share':shared,
			'download':download
		}
	});
	camessage = new CaMessage({
	/* opts that need to think of*/
		'id':'cames',
		'default_txt':'ID: 110-asdda-4345-na'
	});

	viewer = camic.viewer
	// clear control dock
	//viewer.clearControls();

    // const zmax = Math.ceil(viewer.viewport.getMaxZoom());
    // const zmin = Math.ceil(viewer.viewport.getMinZoom());
    // const cur =  Math.ceil((zmax-zmin)/2);
    // const step =  Math.ceil((zmax-zmin+1)/20);

	// zoom control
	zctrl = new CaZoomControl({
		'id':'zctrl',
		'viewer':viewer,
		'zoom':{
			'max':4,
			'min':0.4,
			'cur':1,
			'step':1.5
		}
	});


    // view callback function
    function callback(data,isDisplay){
    	console.log(data);
    	console.log(isDisplay);
			// ger names
			// add or remove from
			if (isDisplay){
				data.forEach((x)=>camic.layers.visibleLayers.add(x.name))
			} else {
				data.forEach((x)=>camic.layers.visibleLayers.delete(x.name))
			}

    }

    // overlayer manager

	console.log('end');

	// simulate saving annotation
	document.getElementById('ann_save').addEventListener('click',annotationSave);
	// simulate runing algorithm
	document.getElementById('alg_run').addEventListener('click',algoRun);

}

// some fake events callback for demo
function shared(){
	window.prompt('Share this link', 'http://localhost/camicroscope/osdCamicroscope.php?tissueId=TEST&state=eyJwb3NpdGlvbiI6eyJ4IjowLjUsInkiOjAuNTk2OTIxNzMzMTEwMDQyNywieiI6MC41NzcxMDk2MjYwOTczNDM0fSwiYWxnIjpbImh1bWFubWFyayJdfQ%3D%3D');
}

function download(){
	alert('download image');
}

function annotationSave(){
	camessage.sendMessage('Annotation Saved', {size:'20px',color:'white', bg_color:'lightblue'}, 3);

};
function algoRun(){
camessage.sendMessage('Algo is running...', {size:'20px',color:'white', bg_color:'lightpink'}, 3);

}


document.addEventListener('DOMContentLoaded', initialize);

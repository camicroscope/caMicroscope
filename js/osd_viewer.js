//
// somehing for scale bar
// const MPP = {'mpp-x': 0.499, 'mpp-y': 0.499};

// let camic;
// let viewer;
// let tools;
// let message;
// let camessage;
// let zctrl;
// let side_apps;
// let side_layers;
// let layer_manager;
// let collapsible_list;

// let annotation_control;
// let algorithm_control;

// let anno_popup;

// let annotations = [];
// // dummy zoom setting
// let zoomSetting = {
// 	maxZoomLevel:4,
// 	minZoomLevel:.4
// }
// // layers data
// let isLoad = false;
// let layersData = [];

// const UI = {};


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







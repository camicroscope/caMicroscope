//UI and Core callback and hook
// all functions help the UI and Core part together that makes workflows.

/* UI callback functions list */
function toggleViewerMode(opt){
	const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
	if(opt.checked){
		// turn off drawing
		annotationOff();
		// turn off magnifier
		magnifierOff();
		// turn off measurement
		measurementOff();
		//open layers menu
		$UI.layersSideMenu.open();
		//close apps menu
		$UI.appsSideMenu.close();

		openMinorControlPanel();
		openSecondaryViewer();
	}else{
		$UI.appsSideMenu.close();
		$UI.layersSideMenu.close();
		closeMinorControlPanel();
		closeSecondaryViewer();

	}
}

//mainfest
function multSelector_action(size){
	// hidden main viewer's bottom right control and get navigator
	$CAMIC.viewer.controls.bottomright.style.display = 'none';
	// if(event.data.length == 0){
	// 	alert('No Layer selected');
	// 	return;
	// }

	// hide the window
	// $UI.multSelector.elt.classList.add('none');

	// show the minor part
	//const minor = document.getElementById('minor_viewer');
	//minor.classList.remove('none');
	//minor.classList.add('display');

	// open new instance camic
	try{
		let slideQuery = {}
		slideQuery.id = $D.params.slideId
		slideQuery.name = $D.params.slide
		slideQuery.location = $D.params.location
		$minorCAMIC = new CaMic("minor_viewer",slideQuery, {
			// osd options
			// mouseNavEnabled:false,
			// panVertical:false,
			// panHorizontal:false,
			// showNavigator:false,
			// customized options
			// hasZoomControl:false,
			hasDrawLayer:false,
			//hasLayerManager:false,
			//hasScalebar:false,
			// states options
			navigatorHeight: size.height,
			navigatorWidth: size.width,
			states:{
				x:$CAMIC.viewer.viewport.getCenter().x,
				y:$CAMIC.viewer.viewport.getCenter().y*$CAMIC.viewer.imagingHelper.imgAspectRatio,
				z:$CAMIC.viewer.viewport.getZoom(),
			}
		});

		// synchornic zoom and move
		// coordinated Viewer - zoom
		$CAMIC.viewer.addHandler('zoom',synchornicView1);

		// coordinated Viewer - pan
		$CAMIC.viewer.addHandler('pan',synchornicView1);

		// loading image
		$minorCAMIC.loadImg(function(e){
			// image loaded
			if(e.hasError){
				$UI.message.addError(e.message);
			}
		});
		$minorCAMIC.viewer.addOnceHandler('tile-drawing',function(){
			$minorCAMIC.viewer.addHandler('zoom',synchornicView2);
			$minorCAMIC.viewer.addHandler('pan',synchornicView2);
		});



	}catch(error){
		Loading.close();
		$UI.message.addError('Core Initialization Failed');
		console.error(error);
		return;
	}

	// find unloaded data
	// event.data = event.data.map(lay=>lay[0]);
	// const unloaded = event.data.filter(id =>{
	// 	const layer = $D.overlayers.find(layer=> layer.id == id);
	// 	return layer && !layer.data
	// });
	// if all data loaded then add selected layer to minor viewer

	// if(unloaded.length == 0){
	// 	// add overlays to
	// 	// wait util omanager create
	// 	var checkOmanager = setInterval(function () {
	// 		if($minorCAMIC.viewer.omanager) {
	// 			clearInterval(checkOmanager);
	// 			// add overlays to
	// 			event.data.forEach(id =>{
	// 				// find data
	// 				const layer = $D.overlayers.find(layer=> layer.id == id);
	// 				// add to the minor viewer
	// 				$minorCAMIC.viewer.omanager.addOverlay({id:id,data:layer.data,render:anno_render,isShow:true});
	// 			});
	// 			$minorCAMIC.viewer.omanager.updateView();
	// 		}
	// 	}, 500);
	// 	return;
	// }

	// load data from service side
	// $CAMIC.store.getMarkByIds(unloaded,$D.params.data.name)
	// .then(function(datas){
	// 	// response error
	// 	if(datas.error){
	// 		const errorMessage = `${datas.text}: ${datas.url}`;
	// 		$UI.message.addError(errorMessage, 5000);
	// 		// close
	// 		return;
	// 	}

	// 	// no data found
	// 	if(datas.length == 0){
	// 		$UI.message.addError(`Selected annotations do not exist.`,5000);
	// 		return;
	// 	}

	// 	// add overlays
	// 	if(Array.isArray(datas)) datas = datas.map(d=>{
	// 		d.geometries = VieweportFeaturesToImageFeatures($CAMIC.viewer, d.geometries);
	// 		const id = d.provenance.analysis.execution_id;
	// 		const item = $D.overlayers.find(l=>l.id==id);
	// 		item.data = d;
	// 		item.render = anno_render;
	// 		item.layer = $CAMIC.viewer.omanager.addOverlay(item);
	// 	});

	// 	// wait util omanager create
	// 	var checkOmanager = setInterval(function () {
	// 		if($minorCAMIC.viewer.omanager) {
	// 			clearInterval(checkOmanager);
	// 			// add overlays to
	// 			event.data.forEach(id =>{
	// 				// find data
	// 				const layer = $D.overlayers.find(layer=> layer.id == id);
	// 				// add to the minor viewer
	// 				$minorCAMIC.viewer.omanager.addOverlay({id:id,data:layer.data,render:anno_render,isShow:true});
	// 			});
	// 			$minorCAMIC.viewer.omanager.updateView();
	// 		}
	// 	}, 500);

	// })
	// .catch(function(e){
	// 	console.error(e);
	// }).finally(function(){

	// });

}

var active1 = false;
var active2 = false;
function synchornicView1(data){
	if (active2) {
	return;
	}

	active1 = true;
	$minorCAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.getZoom());
	$minorCAMIC.viewer.viewport.panTo($CAMIC.viewer.viewport.getCenter());
	active1 = false;
}

function synchornicView2(data){
  if (active1) {
    return;
  }
  active2 = true;
  $CAMIC.viewer.viewport.zoomTo($minorCAMIC.viewer.viewport.getZoom());
  $CAMIC.viewer.viewport.panTo($minorCAMIC.viewer.viewport.getCenter());
  active2 = false;
}

function openSecondaryViewer(){
	// ui changed
	const main = document.getElementById('main_viewer');
	const minor = document.getElementById('minor_viewer');
	main.classList.remove('main');
	main.classList.add('left');

	minor.classList.remove('none');
	// minor.classList.add('display');
	minor.classList.add('right');

	const nav_size = {
		'height':$CAMIC.viewer.controls.bottomright.querySelector('.navigator').style.height,
		'width':$CAMIC.viewer.controls.bottomright.querySelector('.navigator').style.width
	}
	setTimeout(function() { multSelector_action(nav_size); }, 100);
}

function closeSecondaryViewer(){
	// ui changed
	const main = document.getElementById('main_viewer');
	const minor = document.getElementById('minor_viewer');
	main.classList.add('main');
	main.classList.remove('left');
	minor.classList.add('none');
	minor.classList.remove('right');
	$CAMIC.viewer.controls.bottomright.style.display = '';

	const li = $UI.toolbar.getSubTool('sbsviewer');
	li.querySelector('input[type="checkbox"]').checked = false;
	Loading.close();

	//destory
	if($minorCAMIC) {
		// remove handler
		$CAMIC.viewer.removeHandler('zoom',synchornicView1);
		$CAMIC.viewer.removeHandler('pan',synchornicView1);

		// destroy object
		$minorCAMIC.destroy();
		$minorCAMIC = null;
	}

	// hide on layersViewer
	$UI.layersViewerMinor.toggleAllItems();
	$UI.layersViewerMinor.setting.data.forEach(d =>delete d.layer);
}

// side menu close callback
function toggleSideMenu(opt){
	if(!opt.isOpen){
		const id = opt.target.id.split('_')[1];
		$UI.toolbar.changeMainToolStatus(id,false);
	}
}

// go home callback
function goHome(data){
	redirect($D.pages.home,`GO Home Page`, 0);
}


//--- Annotation Tool ---//
// pen draw callback
const label = document.createElement('div');
label.style.transformOrigin = 'center';
label.style.height = 0;
label.style.width = 0;

function draw(e){
	if(!$CAMIC.viewer.canvasDrawInstance){
		alert('draw doesn\'t initialize');
		return;
	}
	const state = +e.state;
	const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
	const target = this.srcElement || this.target || this.eventSource.canvas;
	if(state){ // on

		// off magnifier
		magnifierOff();
		// off measurement
		measurementOff();

		annotationOn.call(this,state,target);
	}else{ // off
		annotationOff();




	}
}


function annotationOn(state,target){
	if(!$CAMIC.viewer.canvasDrawInstance) return;
	const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
	const li = $UI.toolbar.getSubTool('annotation');
	li.appendChild(label);
	switch (state) {
		case 1:
			$UI.annotOptPanel._action_.style.display = 'none';
			label.style.transform = 'translateY(-12px) translateX(18px)';
			label.textContent = '1';
			label.style.color = '';
			break;
		case 2:
			$UI.annotOptPanel._action_.style.display = '';
			label.style.transform = ' rotate(-90deg) translateX(2px) translateY(13px)';
			label.textContent = '8';
			label.style.color = 'white';
			break;
		default:
			// statements_def
			break;
	}
	canvasDraw.drawOn();
	$CAMIC.drawContextmenu.on();
	$CAMIC.drawContextmenu.open({x:this.clientX,y:this.clientY,target:target});
	//close layers menu
	$UI.layersSideMenu.close();
	// open annotation menu
	$UI.appsSideMenu.open();
	// -- START QUIP550 -- //
	//$UI.appsList.triggerContent('annotation','open');
	// -- END QUIP550 -- //
	const input = $UI.annotOptPanel._form_.querySelector('#name');
	input.focus();
	input.select();
}

function annotationOff(){
	if(!$CAMIC.viewer.canvasDrawInstance) return;
	const canvasDraw = $CAMIC.viewer.canvasDrawInstance;

	if(canvasDraw._draws_data_.length && confirm(`Do you want to save annotation before you leave?`)){
		saveAnnotation();
	}else{
		canvasDraw.clear();
		canvasDraw.drawOff();
		$CAMIC.drawContextmenu.off();
		$UI.appsSideMenu.close();
		toggleOffDrawBtns();
	}
}

function toggleOffDrawBtns(){
	const li = $UI.toolbar.getSubTool('annotation');
	const lab = li.querySelector('label');
	const state = +lab.dataset.state;
	lab.classList.remove(`s${state}`);
	lab.dataset.state = 0;
	lab.classList.add(`s0`);
	if(label.parentNode) li.removeChild(label);


}

//--- Measurement Tool ---//
function toggleMeasurement(data){
	if(!$CAMIC.viewer.measureInstance) {
		console.warn('No Measurement Tool');
		return;
	}
	//$UI.message.add(`Measument Tool ${data.checked?'ON':'OFF'}`);
	if(data.checked){

		// trun off the main menu
		$UI.layersSideMenu.close();
		// turn off annotation
		annotationOff();
		// turn off magnifier
		magnifierOff();

		measurementOn();
	}else{
		measurementOff();
	}
}

function measurementOn(){
	if(!$CAMIC.viewer.measureInstance)return;
	$CAMIC.viewer.measureInstance.on();
	const li = $UI.toolbar.getSubTool('measurement');
	li.querySelector('input[type=checkbox]').checked = true;
}

function measurementOff(){
	if(!$CAMIC.viewer.measureInstance)return;
	$CAMIC.viewer.measureInstance.off();
	const li = $UI.toolbar.getSubTool('measurement');
	li.querySelector('input[type=checkbox]').checked = false;
}



//--- toggle magnifier callback ---//
function toggleMagnifier(data){
	if(data.checked){
		magnifierOn(+data.status,this.clientX,this.clientY);
		// trun off the main menu
		$UI.layersSideMenu.close();
		$UI.appsSideMenu.close();
		// annotation off
		annotationOff();
		// measurement off
		measurementOff();
	}else{
		magnifierOff();
	}
}

function magnifierOn(factor = 1,x=0,y=0){
	if(!$UI.spyglass)return;
	$UI.spyglass.factor = factor;
	$UI.spyglass.open(x,y);
	const li = $UI.toolbar.getSubTool('magnifier');
	li.querySelector('input[type=checkbox]').checked = true;
}

function magnifierOff(){
	if(!$UI.spyglass)return;
	$UI.spyglass.close();
	const li = $UI.toolbar.getSubTool('magnifier');
	li.querySelector('input[type=checkbox]').checked = false;
}

// image download
function imageDownload(data){
	// TODO functionality
	alert('Download Image');
	console.log(data);
}

// share url
function shareURL(data){
	const URL = StatesHelper.getCurrentStatesURL(true);
	window.prompt('Share this link', URL);
}
// main menu changed
function mainMenuChange(data){

	if(data.apps){
		$UI.appsSideMenu.open();
	}else{
		$UI.appsSideMenu.close();
	}

	if(data.layers){
		$UI.layersSideMenu.open();
	}else{
		$UI.layersSideMenu.close();
	}
}

function convertHumanAnnotationToPopupBody(notes){

	const rs = {type:'map',data:[]};
	for(let field in notes){
		const val = notes[field];
		field = field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
		rs.data.push({key:field,value:val});
	}
	return rs;

}

function anno_delete(data){
	if(!data.id) return;
	const annotationData = $D.overlayers.find(d=>d.data && d.data._id.$oid == data.oid);
	let message;
	if(annotationData.data.geometries){
		message = `Are you sure you want to delete this Annotation {ID:${data.id}} with ${annotationData.data.geometries.features.length} mark(s)?`;
	}else{
		message = `Are you sure you want to delete this markup {ID:${data.id}}?`;
	}
	$UI.annotPopup.close();
	if(!confirm(message)) return;
	$CAMIC.store.deleteMark(data.oid,$D.params.data.name)
	.then(datas =>{
		// server error
		if(datas.error){
			const errorMessage = `${datas.text}: ${datas.url}`;
			$UI.message.addError(errorMessage, 5000);
			// close
			return;
		}

		// no data found
		if(!datas.rowsAffected || datas.rowsAffected < 1){
			$UI.message.addWarning(`Delete Annotations Failed.`,5000);
			return;
		}

		const index = $D.overlayers.findIndex(layer => layer.id == data.id);

    	if(index==-1) return;

    	data.index = index;
		const layer = $D.overlayers[data.index];
		// update UI
		if(Array.isArray(layer.data)) deleteCallback_old(data)
		else deleteCallback(data)
	})
	.catch(e=>{
		$UI.message.addError(e);
		console.error(e);
	})
	.finally(()=>{
		//console.log('delete end');
	});

}
function deleteCallback(data){
	// remove overlay
    $D.overlayers.splice(data.index, 1);
    // update layer manager
    $UI.layersViewer.removeItemById(data.id);
    $UI.layersViewerMinor.removeItemById(data.id);

    $CAMIC.viewer.omanager.removeOverlay(data.id);
    if($minorCAMIC&&$minorCAMIC.viewer)$minorCAMIC.viewer.omanager.removeOverlay(data.id);
    // update layers Viewer
    //$UI.layersViewer.update();
	// close popup panel
    $UI.annotPopup.close();

}

// for support QUIP2.0 Data model - delete callback
function deleteCallback_old(data){
    const layer = $D.overlayers[data.index];
	// for support QUIP2.0
	const idx = layer.data.findIndex(d=> d._id.$oid === data.oid );
	if(idx ==-1) return;
	layer.data.splice(idx, 1);

	// delete entire layer if there is no data.
	if(layer.data.length == 0){
			$D.overlayers.splice(data.index, 1);
			$CAMIC.viewer.omanager.removeOverlay(data.id);
	}


	$CAMIC.viewer.omanager.updateView();
    // update layers Viewer
    $UI.layersViewer.update();
	// close popup panel
    $UI.annotPopup.close();
}
function sort_change(sort){
	$CAMIC.layersManager.sort(sort);

}

function reset_callback(data){
	$CAMIC.viewer.canvasDrawInstance.clear();
}

function anno_callback(data){
	// is form ok?
	const noteData = $UI.annotOptPanel._form_.value;
	if($UI.annotOptPanel._action_.disabled || noteData.name == ''){

		// close layer silde
		$UI.toolbar._main_tools[1].querySelector('[type=checkbox]').checked = false;
		$UI.layersSideMenu.close();

		// open app silde
		$UI.toolbar._main_tools[0].querySelector('[type=checkbox]').checked = true;
		$UI.appsSideMenu.open();

		// open annotation list
		// -- START QUIP550 -- //
		// $UI.appsList.triggerContent('annotation','open');
		// -- END QUIP550 -- //
		return;

	}
	// has Path?

	if($CAMIC.viewer.canvasDrawInstance._path_index===0){
		alert('No Markup on Annotation.');
		return;
	}
	// save
	// provenance
	Loading.open($UI.annotOptPanel.elt,'Saving Annotation...');
	const exec_id = randomId();

	const annotJson = {
		provenance:{
			image:{
				slide:$D.params.data.name,
				specimen:$D.params.data.specimen,
				study:$D.params.data.study
			},
			analysis:{
				source:'human',
				execution_id:exec_id,
				name:noteData.name
			}
		},
		properties:{
			annotations:noteData
		},
		geometries:ImageFeaturesToVieweportFeatures($CAMIC.viewer, $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection())
	}

	//return;
	$CAMIC.store.addMark(annotJson)
	.then(data=>{

		// server error
		if(data.error){
			$UI.message.addWarning(`${data.text}:${data.url}`);
			Loading.close();
			return;
		}

		// no data added
		if(data.count < 1){
			Loading.close();
			$UI.message.addWarning(`Annotation Save Failed`);
			return;
		}
		// create layer data
		const new_item = {id: exec_id, name: noteData.name, typeId: typeIds['human'], typeName: 'human', data: null};
		$D.overlayers.push(new_item);
		$UI.layersViewer.addItem(new_item);
		$UI.layersViewerMinor.addItem(new_item,($minorCAMIC&&$minorCAMIC.viewer)?true:false);

		//console.log($D.overlayers);
		// data for UI
		//return;
		loadAnnotationById($CAMIC,$UI.layersViewer.getDataItemById(exec_id),saveAnnotCallback);
		if($minorCAMIC&&$minorCAMIC.viewer) loadAnnotationById($minorCAMIC, $UI.layersViewerMinor.getDataItemById(exec_id),null);
	})
	.catch(e=>{
		Loading.close();
		console.log('save failed');
		console.log(e);
	})
	.finally(()=>{

	});
}

function saveAnnotCallback(){
	/* reset as default */
	// clear draw data and UI
	$CAMIC.viewer.canvasDrawInstance.drawOff();
	$CAMIC.drawContextmenu.off();
	toggleOffDrawBtns();
	$CAMIC.viewer.canvasDrawInstance.clear();
	// uncheck pen draw icon and checkbox
	//$UI.toolbar._sub_tools[1].querySelector('[type=checkbox]').checked = false;
	// clear form
	$UI.annotOptPanel.clear();

	// close app side
	$UI.toolbar._main_tools[0].querySelector('[type=checkbox]').checked = false;
	$UI.appsSideMenu.close();
	// -- START QUIP550 -- //
	//$UI.appsList.triggerContent('annotation','close');
	// -- END QUIP550 -- //
	// open layer side
	$UI.toolbar._main_tools[1].querySelector('[type=checkbox]').checked = true;
	$UI.layersSideMenu.open();
	$UI.layersViewer.update();

}
function algo_callback(data){
	console.log(data);

}

// overlayer manager callback function for show or hide
function callback(data){
	const viewerName = this.toString();
	let camic = null;
	switch (viewerName) {
		case 'main':
			camic = $CAMIC
			break;
		case 'minor':
			camic = $minorCAMIC
			break;
		default:
			break;
	}
	// const ids = data.filter(d=> d.item.data==null).map(d=>d.item.id);
	// if(ids&&ids.length > 0){
	// 	// load annotation data
	// 	loadAnnotationByIds(this,ids,null);
	// }
	data.forEach(d => {
		const item = d.item;
		if(!item.data){
			// load layer data
			loadAnnotationById(camic, d, null);
		}else{
			if(!d.layer) d.layer = camic.viewer.omanager.addOverlay(item);
			d.layer.isShow = d.isShow;
			camic.viewer.omanager.updateView();
		}
	});
}
function minor_callback(data){
	console.log(data);
}

function openMinorControlPanel(){
	$UI.layersList.displayContent('left',true,'head');
	$UI.layersList.triggerContent('left','close');
	$UI.layersList.displayContent('right',true);
	$UI.layersList.triggerContent('right','open');
}

function closeMinorControlPanel(){
	$UI.layersList.displayContent('left',false,'head');
	$UI.layersList.triggerContent('left','open');
	$UI.layersList.displayContent('right',false);
	$UI.layersList.triggerContent('right','close');
}

function loadAnnotationById(camic, layerData ,callback){

			layerData.item.loading = true;
			const item = layerData.item;

			Loading.open(document.body,'loading layers...');

			$CAMIC.store.getMarkByIds([item.id],$D.params.data.name)
			.then(data =>{
				delete item.loading;

				// response error
				if(data.error){
					const errorMessage = `${data.text}: ${data.url}`;
					console.error(errorMessage);
					$UI.message.addError(errorMessage, 5000);
					// delete item form layview
					removeElement($D.overlayers,item.id);
					$UI.layersViewer.removeItemById(item.id);
					$UI.layersViewerMinor.removeItemById(item.id);
					return;
				}

				// no data found
				if(!data[0]){
					console.warn(`Annotation: ${item.name}(${item.id}) doesn't exist.`);
					$UI.message.addWarning(`Annotation: ${item.name}(${item.id}) doesn't exist.`,5000);
					// delete item form layview
					removeElement($D.overlayers,item.id);
					$UI.layersViewer.removeItemById(item.id);
					$UI.layersViewerMinor.removeItemById(item.id);
					return;
				}

				// for support quip 2.0 data model
				if(data[0].geometry){
					// twist them
					var image = camic.viewer.world.getItemAt(0);
					this.imgWidth = image.source.dimensions.x;
					this.imgHeight = image.source.dimensions.y;
					item.data = data.map(d => {
						d.geometry.coordinates[0] = d.geometry.coordinates[0].map(point => {
							return [Math.round(point[0]*imgWidth),Math.round(point[1]*imgHeight)];
						});
						d.properties.style = {
									color: "#7CFC00",
									lineCap: "round",
									lineJoin: "round"
						};
						return {
							_id:d._id,
							provenance:d.provenance,
							properties:d.properties,
							geometry:d.geometry
						}
					});
					// if(item) data[0].isShow = item.isShow;
					item.render = old_anno_render;
				}else{
					data[0].geometries = VieweportFeaturesToImageFeatures(camic.viewer, data[0].geometries);
					item.data = data[0];
					item.render = anno_render;
				}

				// create lay and update view
				layerData.layer = camic.viewer.omanager.addOverlay(item);
				camic.viewer.omanager.updateView();

				if(callback) callback.call(layerData);

			})
			.catch(e=>{
				console.error(e);
			})
			.finally(()=>{
				Loading.close();
			});
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
	$UI.message.add('Annotation Saved');

};
function algoRun(){
	$UI.message.add('Algo is running...');

}

function saveAnnotation(){

	anno_callback.call(null,{id:$UI.annotOptPanel.setting.formSchemas[$UI.annotOptPanel._select_.value].id, data:$UI.annotOptPanel._form_.value});
}

function saveAnalytics(){
	console.log('saveAnalytics');
}
function startDrawing(e){
	$CAMIC.viewer.canvasDrawInstance.stop = !$UI.annotOptPanel._form_.isValid();
	return;
}
function stopDrawing(e){
	const li = $UI.toolbar.getSubTool('annotation');
	const state = +li.querySelector('label').dataset.state;
	if(state===1&&$CAMIC.viewer.canvasDrawInstance._draws_data_.length > 0){
		saveAnnotation();
	}
}



function openHeatmap(){

	switch (ImgloaderMode) {
		case 'iip':
			// hosted
			hostedHeatmap();
			break;
		case 'imgbox':
			// nano borb
			imgboxHeatmap();
			break;
		default:
			// statements_def
			break;
	}

}
function hostedHeatmap(){
	const slide = $D.params.data.name;
	$CAMIC.store.findHeatmapType(slide)
	//
	.then(function(list){
		if (typeof list === "undefined") { list = [] }
		// get heatmap data
		if(!list.length){
			alert(`${slide} has No heatmap data.`);
			return;
		}
		createHeatMapList(list);

	})
	//
	.catch(function(error){

		console.error(error);
	})
	//
	.finally(function(){
		if($D.templates){
			// load UI
		}else{
			// set message
			$UI.message.addError('HeatmapList');

		}
	});
}

function imgboxHeatmap(){
    let slide = $D.params.id
    slide = decodeURIComponent(slide)
    // create file input
    var element = document.createElement('input');
    element.setAttribute('type', "file")
    element.style.display = 'none';
    document.body.appendChild(element);


    element.onchange = function(event) {
      var input = event.target;
      var reader = new FileReader();
      reader.onload = function() {
        var text = reader.result;
        try {

			let data = JSON.parse(text);

			var valid = $VALIDATION.heatmap(data);
			if (!valid) {
				alert($VALIDATION.heatmap.errors)
				return;
			};

			$CAMIC.store.clearHeatmaps();


			data.provenance.image.slide = slide
			const execId = data.provenance.analysis.execution_id;
			Loading.open(document.body,'loading Heatmap...');
			$CAMIC.store.addHeatmap(data).then(rs=>{
				window.location.href = `../heatmap/heatmap.html${window.location.search}&execId=${execId}`;
			}).catch(e=>{
				$UI.message.addError(e);
				console.error(e);
			})
			.finally(()=>{
				Loading.close();
			});
        } catch (e) {
          console.error(e)
          Loading.close();
        }
      };
      reader.readAsText(input.files[0]);
    }
    element.click();
    document.body.removeChild(element);
}

function createHeatMapList(list){
	empty($UI.modalbox.body);
	list.forEach(data=>{
		const exec_id = data.provenance.analysis.execution_id;
		const a = document.createElement('a');
		const params = getUrlVars();
		a.href = params.mode?`../heatmap/heatmap.html?slideId=${$D.params.slideId}&execId=${exec_id}&mode=pathdb`:
		`../heatmap/heatmap.html?slideId=${$D.params.slideId}&execId=${exec_id}`;
		a.textContent = exec_id;
		$UI.modalbox.body.appendChild(a);
		$UI.modalbox.body.appendChild(document.createElement('br'));
	});
	$UI.modalbox.open();
}
/* call back list END */
/* --  -- */
/* -- for render anno_data to canavs -- */
function anno_render(ctx,data){
	DrawHelper.draw(ctx, data.geometries.features);
	//DrawHelper.draw(this._canvas_ctx, this.data.canvasData);
}
function old_anno_render(ctx,data){
	DrawHelper.draw(ctx, data);

}
/* --  -- */

//UI and Core callback and hook
// all functions help the UI and Core part together that makes workflows.

/* UI callback functions list */
$minorCAMIC = null;
function toggleViewerMode(opt){
	if(opt.checked){
		// openSecondaryViewer();
		openSecondaryViewer();
	}else{
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

}


function coordinatedViewZoom(data){

	$minorCAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.getZoom(),$CAMIC.viewer.viewport.getCenter());
	$minorCAMIC.viewer.viewport.panTo($CAMIC.viewer.viewport.getCenter());

}

function coordinatedViewPan(data){
	$minorCAMIC.viewer.viewport.panTo($CAMIC.viewer.viewport.getCenter());
}
var active1 = false;
var active2 = false;
function synchornicView1(data){
	if(!$minorCAMIC || !$CAMIC) return;
	if (active2) {
	return;
	}

	active1 = true;
	$minorCAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.getZoom());
	$minorCAMIC.viewer.viewport.panTo($CAMIC.viewer.viewport.getCenter());
	active1 = false;
}
function synchornicView2(data){
  if(!$minorCAMIC || !$CAMIC) return;
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
		$CAMIC.viewer.removeHandler('zoom',coordinatedViewZoom);
		$CAMIC.viewer.removeHandler('pan',coordinatedViewPan);

		// destroy object
		$minorCAMIC.destroy();
		$minorCAMIC = null;
	}
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

// pen draw callback
function draw(e){
	if(!$CAMIC.viewer.canvasDrawInstance){
		alert('draw doesn\'t initialize');
		return;
	}
	const state = +e.state;
	const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
	//$UI.message.add(`Draw: ${state?'ON':'OFF'}`);

	const target = this.srcElement || this.target || this.eventSource.canvas;
	switch (state) {
		case 0: // off
			canvasDraw.clear();
			canvasDraw.drawOff();
			$CAMIC.drawContextmenu.off();
			$UI.appsSideMenu.close();
			break;
		case 1: // once
			// statements_1
		case 2: // stick
			canvasDraw.drawOn();
			$CAMIC.drawContextmenu.on();
			$CAMIC.drawContextmenu.open({x:this.clientX,y:this.clientY,target:target});
			// turn off magnifier
			$UI.toolbar._sub_tools[2].querySelector('input[type=checkbox]').checked = false;
			$UI.spyglass.close();
			// turn off measurement
			$UI.toolbar._sub_tools[3].querySelector('input[type=checkbox]').checked = false;
			$CAMIC.viewer.measureInstance.off();

			//close layers menu
			$UI.layersSideMenu.close();

			// open annotation menu
			$UI.appsSideMenu.open();
			$UI.appsList.triggerContent('annotation','open');
			const input = $UI.annotOptPanel._form_.querySelector('#name');
			input.focus();
			input.select();
			break;
		default:
			// statements_def
			break;
	}
}

function toggleOffDrawBtns(){
	const label = $UI.toolbar._sub_tools[1].querySelector('label');
	const state = +label.dataset.state;
	label.classList.remove(`s${state}`);

	label.dataset.state = 0;
	label.classList.add(`s0`);

}
function heatmapSettingChanged(data){
	switch (data.mode) {
		case 'binal':
				data.fields.forEach( f=> {
					$CAMIC.viewer.heatmap.setThresholdsByName(f.name,f.range[0],f.range[1],false);
				});
			break;
		case 'gradient':
			$CAMIC.viewer.heatmap.setThresholdsByName(data.field.name,data.field.range[0],data.field.range[1],false);
			$CAMIC.viewer.heatmap.setCurrentField(data.field.name,false);
			break;
		default:
			// statements_def
			break;
	}
	if($CAMIC.viewer.heatmap.mode == data.mode){
		$CAMIC.viewer.heatmap.drawOnCanvas();
	}else{
		$CAMIC.viewer.heatmap.changeMode(data.mode);
	}
	
}
function heatmapOpacityChanaged(data){
	$CAMIC.viewer.heatmap.setOpacity(data['heat']);
	$CAMIC.viewer.heatmap.setCoverOpacity(data['cover']);
}
function toggleMeasurement(data){
	if(!$CAMIC.viewer.measureInstance) {
		console.warn('No Measurement Tool');
		return;
	}
	//$UI.message.add(`Measument Tool ${data.checked?'ON':'OFF'}`);
	if(data.checked){
		// turn off magnifier
		magnifierOff();
		measurementOn();
		$UI.settingsSideMenu.close();
		heatmapEditorOff();
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
// toggle magnifier callback
function toggleMagnifier(data){
	if(data.checked){
		magnifierOn(+data.status,this.clientX,this.clientY);
		// trun off the main menu
		$UI.settingsSideMenu.close();
		heatMapEditorOff();
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
function toggleHeatMapSettings(e){

	switch (e.checked) {
		case true:
			$UI.settingsSideMenu.open();
			heatmapEditorOff();
			setTimeout(function(){
				$UI.heatmapcontrol.resize();
			},500)
			break;
		case false:
			$UI.settingsSideMenu.close();
			break;
		default:
			// statements_def
			break;
	}

	switch (e.isOpen) {
		case false:
			// statements_1
			$UI.toolbar._sub_tools[0].querySelector('input[type="checkbox"]').checked = false;
			break;
		default:
			// statements_def
			break;
	}
}

function toggleHeatMapEditor(e){
	switch (e.checked) {
		case true:
			heatMapEditorOn();
			break;
		case false:
			heatmapEditorOff();
			break;
		// default:
		// 	console.warn('Editor error');
		// break;	
	}
}
function heatMapEditorOn(){
	$UI.editorSideMenu.open();
	$UI.settingsSideMenu.close();
	measurementOff();
	magnifierOff();
	if(!$CAMIC.viewer.canvasDrawInstance) return;
	
	const data = $UI.heatmapEditorPanel.getCurrentOperation();
	if(data){
		$CAMIC.viewer.canvasDrawInstance.style.color = data[3];
	}
	$CAMIC.viewer.canvasDrawInstance.drawOn();
}
function heatmapEditorOff(){
	$UI.editorSideMenu.close();
	const li = $UI.toolbar.getSubTool('editor');
	li.querySelector('input[type=checkbox]').checked = false;
	$CAMIC.viewer.canvasDrawInstance.drawOff();
	
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
	if(!confirm(`Are you sure you want to delete this markup {ID:${data.id}}?`)) return;
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
    $CAMIC.viewer.omanager.removeOverlay(data.id);
    // update layers Viewer
    $UI.layersViewer.update();
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
	console.log('sort_change');
	$CAMIC.layersManager.sort(sort);

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
		// open annotaion list
		$UI.appsList.triggerContent('annotation','open');
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
		loadAnnotationById(null,exec_id);
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
	$UI.appsList.triggerContent('annotation','close');

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
	data.forEach(item => {
		if(!item.layer){
			// load layer data
			loadAnnotationById(item,item.id);

		}else{
			item.layer.isShow = item.isShow;
			$CAMIC.viewer.omanager.updateView();
		}
	});
}

function loadAnnotationById(item,id){
			Loading.open(document.body,'loading layers...');
			$CAMIC.store.getMarkByIds([id],$D.params.data.name)
			.then(data =>{
				// response error
				if(data.error){
					const errorMessage = `${data.text}: ${data.url}`;
					$UI.message.addError(errorMessage, 5000);
					const layer = $D.overlayers.find(layer => layer.id==id);
					if(layer){
						layer.isShow = false;
						$UI.layersViewer.update();
					}
					return;
				}

				// no data found
				if(!data[0]){
					console.log(`Annotation:${id} doesn't exist.`);
					$UI.message.addError(`Annotation:${id} doesn't exist.`,5000);
					// delete item form layview
					if(item) removeElement($D.overlayers,id);
					$UI.layersViewer.update();
					return;
				}




				if(!item){
					console.log(data[0]);
					item = covertToLayViewer(data[0].provenance);
					item.isShow = true;
					// update lay viewer UI
					$D.overlayers.push(item);
					$UI.layersViewer.update();
					saveAnnotCallback();
				}else{
					data[0].isShow = item.isShow;
				}

				// for support quip 2.0 data model
				if(data[0].geometry){

					// twist them
					var image = $CAMIC.viewer.world.getItemAt(0);
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
					if(item) data[0].isShow = item.isShow;
					item.render = old_anno_render;
				}else{
					data[0].geometries = VieweportFeaturesToImageFeatures($CAMIC.viewer, data[0].geometries);
					item.data = data[0];
					item.render = anno_render;
				}

				// create lay and update view
				item.layer = $CAMIC.viewer.omanager.addOverlay(item);
				$CAMIC.viewer.omanager.updateView();
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
	console.log('saveAnnotation');

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
	let state = +$UI.toolbar._sub_tools[1].querySelector('label').dataset.state;
	if(state===1){
		saveAnnotation();
	}
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
function editorPenChange(data){
	
	$CAMIC.viewer.canvasDrawInstance.style.color = data[3];
}
function saveEditData(){
	console.log('saveEditData');
	if(!$CAMIC.viewer.canvasDrawInstance._draws_data_.length){
		alert('No data edited!');
		return;
	}
	// get draw lines info
	const editedData = $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
	// get category of pens
	const cates = $UI.heatmapEditorPanel.getAllOperations();
	// merging draw lines info and category together. The result will be used by heatmap to draw the edited data.
	//const newEditedData = mergingEditedData(editedData, pensInfo);
	editedData.features.forEach(feature => {
		const color =  feature.properties.style.color;
		const points = getGrids(feature.geometry.coordinates[0],$CAMIC.viewer.canvasDrawInstance.size);
		points.forEach(p=>{
			p[0] = $CAMIC.viewer.imagingHelper.dataToLogicalX(p[0]);
			p[1] = $CAMIC.viewer.imagingHelper.dataToLogicalY(p[1]);
		});
		const cate = findPenInfoByColor(color,cates);
		$D.editedDataClusters.data.addEditDateForCluster(...cate, points);
	})
	// update heatmap view
	$CAMIC.viewer.heatmap.updateView();

	// TODO if success then close
	$CAMIC.viewer.canvasDrawInstance.clear();


	console.log('saved');
}
function mergingEditedData(editedData, cates){
	const clusters = new EditDataCluster();
	editedData.features.forEach(feature => {
		const color =  feature.properties.style.color;
		const points = getGrids(feature.geometry.coordinates[0],$CAMIC.viewer.canvasDrawInstance.size);
		
		const cate = findPenInfoByColor(color,cates);
		clusters.addEditDateForCluster(...cate, points);
	})
	return clusters;
}
function findPenInfoByColor(color,info){
	return info.find(i=>i[3]==color);
}


/* --  -- */
// const fieldsColors = ['#576971','#0A1316','#DFB9C1','#2F1218','#C0A7A3','#271A18','#D07DBE', '#2F0526'];
// function createEeditorPanel(fields,changeFuc,saveFuc){

// 	const container = document.createElement('div');
// 	container.classList.add('hmc-container');
// 	const name = randomId();
// 	let radiosTemplatec ='';
// 	fields.forEach((field,idx)=>{
// 		radiosTemplatec+= `&nbsp;&nbsp;<label><input type="radio" name="${name}" value="${idx}|${field.name}|1|${fieldsColors[idx*2]}">${field.name} - positive</label><br>`;
// 		radiosTemplatec+= `&nbsp;&nbsp;<label><input type="radio" name="${name}" value="${idx}|${field.name}|0|${fieldsColors[idx*2+1]}">${field.name} - negative</label><br>`;
// 	})



// 	container.innerHTML = radiosTemplatec;
// 	//container.querySelector
// 	const radios = container.querySelectorAll(`input[type=radio][name=${name}]`);
// 	radios[0].checked = true;
// 	radios.forEach(radio=>{
// 		radio.addEventListener('change',function(e){
// 			const target = e.srcElement || e.target;
// 			if(isFunction(changeFuc))
// 				changeFuc.call(null,target.value.split('|'));
// 		});
// 	})
// 	const saveBtn = document.createElement('button');
// 	saveBtn.appendChild(document.createTextNode("SAVE"));
// 	saveBtn.addEventListener('click',function(){
// 		if(isFunction(saveFuc))saveFuc();
// 	});
// 	container.appendChild(saveBtn);
// 	return container;
// }
// function getEditor(){
// 	const radio = $UI.heatmapEditorPanel.querySelector('input[type=radio]:checked');
// 	return 	radio?radio.value.split('|'):null;
// }

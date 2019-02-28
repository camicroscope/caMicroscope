//UI and Core callback and hook
// all functions help the UI and Core part together that makes workflows.

/* UI callback functions list */
$minorCAMIC = null;
function toggleViewerMode(opt){
	const main = document.getElementById('main_viewer');
	const secondary = document.getElementById('secondary');
	if(opt.checked){
		// openSecondaryViewer();
		multSelector_action();
	}else{
		closeSecondaryViewer();
	}
}

//mainfest
function multSelector_action(event){
	// ui changed
	const main = document.getElementById('main_viewer');
	const secondary = document.getElementById('secondary');
	main.classList.remove('main');
	main.classList.add('left');
	secondary.classList.remove('none');
	secondary.classList.add('right');
	// show the minor part
	const minor = document.getElementById('minor_viewer');
	minor.classList.remove('none');
	minor.classList.add('display');

	// open new instance camic
	// TODO  delay for wait
	
	try{
		let slideQuery = {}
		slideQuery.id = $D.params.slideId
		slideQuery.name = $D.params.slide
		slideQuery.location = $D.params.location
		$minorCAMIC = new CaMic("minor_viewer", slideQuery, {
			// osd options
			mouseNavEnabled:false,
			panVertical:false,
			panHorizontal:false,
			showNavigator:false,
			// customized options
			hasZoomControl:false,
			hasDrawLayer:false,
			//hasLayerManager:false,
			//hasScalebar:false,
			// states options
			// states:{
			// 	x:$CAMIC.viewer.viewport.getCenter().x,
			// 	y:$CAMIC.viewer.viewport.getCenter().y,
			// 	z:$CAMIC.viewer.viewport.getZoom(),
			// }
		});



		// loading image
		$minorCAMIC.loadImg(function(e){
			// image loaded
			if(e.hasError){
				$UI.message.addError(e.message);
			}
		});
		$minorCAMIC.viewer.addOnceHandler('open',function(){
			setTimeout(coordinatedViewZoom, 2000);
		});


		// synchornic zoom and move
		// coordinated Viewer - zoom
		$CAMIC.viewer.addHandler('zoom',coordinatedViewZoom);

		// coordinated Viewer - pan
		$CAMIC.viewer.addHandler('pan',coordinatedViewPan);		
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

function multSelector_cancel(){
	closeSecondaryViewer();
}

function openSecondaryViewer(){

	//Loading.open(main,'Waiting for Operation.',600);
	//$UI.multSelector.elt.classList.remove('none');
	//$UI.multSelector.setData($D.overlayers.map(l=>[l.id,l.name]));
}

function closeSecondaryViewer(){
	// ui changed
	const main = document.getElementById('main_viewer');
	const secondary = document.getElementById('secondary');
	main.classList.add('main');
	main.classList.remove('left');
	secondary.classList.add('none');
	secondary.classList.remove('right');
	//$UI.multSelector.elt.classList.add('none');
	//$UI.toolbar._sub_tools[5].querySelector('input[type="checkbox"]').checked = false;
	//Loading.close();

	//destory
	if($minorCAMIC) {
		// remove handler
		$CAMIC.viewer.removeHandler('zoom',coordinatedViewZoom);
		$CAMIC.viewer.removeHandler('pan',coordinatedViewPan);

		// destroy object
		$minorCAMIC.destroy();
		$minorCAMIC = null;
	}
	const minor = document.getElementById('minor_viewer');
	minor.classList.remove('display');
	minor.classList.add('none');

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
	//$UI.message.add(`Measument Tool ${data.checked?'ON':'OFF'}`);
	if(data.checked){
		$CAMIC.viewer.measureInstance.on();
		// turn off draw
		//$CAMIC.viewer.canvasDrawInstance.drawOff();
		//$CAMIC.drawContextmenu.off();
		//toggleOffDrawBtns();
		// turn off magnifier
		$UI.toolbar._sub_tools[1].querySelector('input[type=checkbox]').checked = false;
		$UI.spyglass.close();
	}else{
		$CAMIC.viewer.measureInstance.off();
	}
}

// toggle magnifier callback
function toggleMagnifier(data){
	//camessage.sendMessage(`Magnifier ${data.checked?'ON':'OFF'}`, {size:'15px',color:'white', bgColor:'blue'}, 3);
	$UI.message.add(`Magnifier ${data.checked?'ON':'OFF'}`);
	if(data.checked){
		$UI.spyglass.factor = +data.status;
		$UI.spyglass.open(this.clientX,this.clientY);
		// turn off draw
		//$UI.toolbar._sub_tools[1].querySelector('input[type=checkbox]').checked = false;
		//$CAMIC.viewer.canvasDrawInstance.drawOff();
		//$CAMIC.drawContextmenu.off();
		//toggleOffDrawBtns();
		// turn off measurement
		$UI.toolbar._sub_tools[2].querySelector('input[type=checkbox]').checked = false;
		$CAMIC.viewer.measureInstance.off();
	}else{
		$UI.spyglass.close();
	}
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
/* --  -- */

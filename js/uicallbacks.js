//UI and Core callback and hook
// all functions help the UI and Core part together that makes workflows.

/* UI callback functions list */
// side menu close callback
function toggleSideMenu(opt){
	if(!opt.isOpen){
		const id = opt.target.id.split('_')[1];
		$UI.toolbar.changeMainToolStatus(id,false);
	}
}

// go home callback
function goHome(data){
	redirect($D.pages.home,`GO Home Page`, 3);
}

// pen draw callback
function draw(e){
	let draw = e.draw || e.checked;
	if(!$CAMIC.viewer.canvasDrawInstance){
		alert('draw doesn\'t initialize');
		return;
	}
	const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
	$UI.message.add(`Pen: ${draw?'ON':'OFF'}  Mode: ${canvasDraw.drawMode}`);
	if(draw){
		canvasDraw.drawOn();
	}else{
		canvasDraw.drawOff();
	}
	//
	if(draw && this.clientX && this.clientY){
		$CAMIC.drawContextmenu.open({x:this.clientX,y:this.clientY});
	}else{
		$CAMIC.drawContextmenu.close();
	}
	//

	$CAMIC.drawContextmenu.ctrl[0].checked = draw;
	$UI.toolbar._sub_tools[1].querySelector('input[type=checkbox]').checked = draw;
}

// toggle magnifier callback
function toggleMagnifier(data){
	//camessage.sendMessage(`Magnifier ${data.checked?'ON':'OFF'}`, {size:'15px',color:'white', bgColor:'blue'}, 3);
	$UI.message.add(`Magnifier ${data.checked?'ON':'OFF'}`);
	if(data.checked){
		$UI.spyglass.open(this.clientX,this.clientY);
	}else{
		$UI.spyglass.close();
	}
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

function convertToPopupBody(notes){

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
	console.log('delete');
	$CAMIC.store.deleteMark(data.oid,$D.params.slideId)
	.then(text=>{
		const json = JSON.parse(text.replace(/'/g, '"'));
		console.log(json);
		deleteCallback(data);
	})
	.catch(e=>{
		console.error(e);
	})
	.finally(()=>{
		console.log('delete end');
	});

}
function deleteCallback(data){
	console.log(data);
	// remove overlay
	const index = $D.overlayers.findIndex(layer => layer.id == data.id);
    if(index==-1) return;
    $D.overlayers.splice(index, 1);
    
    // update layers Viewer
    $UI.layersViewer.update();
    // update layer manager
    $CAMIC.viewer.omanager.removeOverlay(data.id);
	// close popup panel 
    $UI.annotPopup.close();
   	
}

// function anno_edit(data){
// 	console.log('anno_edit');
// 	console.log(arguments);
// }
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
				slide:$D.params.slideId
			},
			analysis:{
				source:'human',
				execution_id:exec_id
			}
		},
		properties:{
			annotations:noteData
		},
		geometries:ImageFeaturesToVieweportFeatures($CAMIC.viewer, $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection())
	}
	
	$CAMIC.store.addMark(annotJson)
	.then(data=>{
		console.log(data);
		loadAnnotationById(null,exec_id);
	})
	.catch(e=>{
		console.log('save failed');
		console.log(e)
	})
	.finally(()=>{
		
	});
	

	
	return;
	// create overlayer
	anno.layer = $CAMIC.layersManager.addOverlayer(
		{
			id:id,
			data:anno,
			render:anno_render,
			clickable:true,
			isHighlight:true,
			clickCallback:anno_click
		},true);
	// save layer data
	// "typeId":1, "typeName": "Human Annotation"
	annotations.unshift(anno);
	console.log(annotations);
	$UI.layersViewer.update();
}
function saveAnnotCallback(){
	/* reset as default */
	// clear draw data and UI
	$CAMIC.viewer.canvasDrawInstance.drawOff();
	draw({checked:false});
	$CAMIC.drawContextmenu.close();
	$CAMIC.viewer.canvasDrawInstance.clear();
	// uncheck pen draw icon and checkbox
	$UI.toolbar._sub_tools[1].querySelector('[type=checkbox]').checked = false;
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
			$CAMIC.store.getMark(id)
			.then(data =>{
				if(!data[0]){
					console.log(`Annotation:${id} doesn't exist.`);
				}
				data[0].geometries = VieweportFeaturesToImageFeatures($CAMIC.viewer, data[0].geometries);
				if(!item){
					item = covertToLayViewer(data[0]);
					item.isShow = true;
					// update lay viewer UI
					console.log(item);
					
					$D.overlayers.push(item);
					$UI.layersViewer.update();
					saveAnnotCallback();
				}
				item.data = data[0];
				item.render = anno_render;
				// create lay and update view
				item.layer = $CAMIC.viewer.omanager.addOverlay(item);
				$CAMIC.viewer.omanager.updateView();

				
				
			})
			.catch(e=>{
				console.error(e);
			})
			.finally(()=>{
				console.log('clear');
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

/* call back list END */
/* --  -- */
/* -- for render anno_data to canavs -- */
function anno_render(ctx,data){
	DrawHelper.draw(ctx, data.geometries.features);
	//DrawHelper.draw(this._canvas_ctx, this.data.canvasData);
}
/* --  -- */
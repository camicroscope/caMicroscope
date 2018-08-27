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
	alert('Go Home....');
	console.log(data);
}

// pen draw callback
function penDraw(data){
	//camessage.sendMessage(`Pen: ${data.checked?'ON':'OFF'} | Mode: ${camic.draw.drawMode} `, {size:'15px',color:'white', bgColor:'MediumPurple'}, 3);
	$UI.message.add(`Pen: ${data.checked?'ON':'OFF'}  Mode: ${$CAMIC.draw.drawMode}`);
	if(!$CAMIC.draw){
		alert('draw doesn\'t initialize');
		return;
	}
	if(data.checked){ // draw on
		$CAMIC.draw.drawOn();
	}else{ // draw off
		$CAMIC.draw.drawOff();
	}
}

// toggle magnifier callback
function toggleMagnifier(data){
	//camessage.sendMessage(`Magnifier ${data.checked?'ON':'OFF'}`, {size:'15px',color:'white', bgColor:'blue'}, 3);
	$UI.message.add(`Magnifier ${data.checked?'ON':'OFF'}`);
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
function anno_click(point, data){
	
	// data
	console.log('anno_click');

	const body = convertToPopupBody(data.note);
	console.log(data.note);
	console.log(body);
	$UI.annotPopup.setTitle(`id:${data.id}`);
	$UI.annotPopup.setBody(body);
	$UI.annotPopup.open(point);
}
function anno_delete(data){
	console.log('anno_delete');
	console.log(arguments);
}

function anno_edit(data){
	console.log('anno_edit');
	console.log(arguments);
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
	
	if(!$CAMIC.draw._draws_data_ || $CAMIC.draw._draws_data_.length ==0){
		alert('No Markup on Annotation.');
		return;
	}
	const canvasData = $CAMIC.draw.getPaths();
	console.log('save...');

	// save
	const id = randomId();
	const anno = {
		id:id,
		name:noteData.name,
		typeId:1,
		typeName:'Human Annotation',
		isShow:true,
		note:noteData,
		canvasData:canvasData
	};
	
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


	/* reset as default */
	// clear draw data and UI
	$CAMIC.draw.drawOff(true);
	$CAMIC.draw.clear();
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

}

function algo_callback(data){
	console.log(data);

}

// overlayer manager callback function for show or hide
function callback(data){
	data.forEach(item => {
		item.isShow?item.layer.show():item.layer.hide();
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
function anno_render(){
	console.log('anno_render');
	DrawHelper.draw(this._canvas_ctx, this.data.canvasData);
}
/* --  -- */
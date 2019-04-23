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
		heatmapEditorOff();
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

// main menu changed
function toggleHeatMapSettings(e){

	switch (e.checked) {
		case true:
			$UI.settingsSideMenu.open();
			heatmapEditorOff();
			heatMapEditedListOff();
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
			const li = $UI.toolbar.getSubTool('settings')
			li.querySelector('input[type=checkbox]').checked = false;
			break;
		case true:
			const li2 = $UI.toolbar.getSubTool('settings')
			li2.querySelector('input[type=checkbox]').checked = true;
		default:
			// statements_def
			break;
	}
}

function toggleHeatMapDataList(e){
	switch (e.checked) {
		case true:
			heatMapEditedListOn();
			break;
		case false:
			heatMapEditedListOff();
			break;
		// default:
		// 	console.warn('Editor error');
		// break;	
	}
}

function heatMapEditedListOn(){
	$UI.editedListSideMenu.open();
	const li = $UI.toolbar.getSubTool('editeddate')
	li.querySelector('input[type=checkbox]').checked = true;
	toggleHeatMapSettings({checked:false,isOpen:false});	
	heatmapEditorOff();
	measurementOff();
	magnifierOff();
}

function heatMapEditedListOff(){
	$UI.editedListSideMenu.close();
	const li = $UI.toolbar.getSubTool('editeddate')
	li.querySelector('input[type=checkbox]').checked = false;	

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

	//$UI.editedListSideMenu.close();
	heatMapEditedListOff();
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

/*
	collapsible list
	1. Annotation
	2. Analytics
*/
function getCurrentItem(data){
	console.log(data);
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
	$UI.heatmapEditedDataPanel.__refresh();
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

function locateEditData(data){
	const cluster = data.cluster;
	const index = data.index;
	
	const rect = getViewRect(
			data.cluster.editDataArray[index],
			$D.heatMapData.provenance.analysis.size, 
			$CAMIC.viewer
		);

	$CAMIC.viewer.viewport.fitBounds(rect);
}

function onDeleteEditData(data){
	const cluster = data.cluster;
	const idx = data.index;
	$D.editedDataClusters.data.removeEditDataForCluster(cluster.index, cluster.name, cluster.value, cluster.color, idx);
	
	// refresh UI
	$UI.heatmapEditedDataPanel.__refresh();
	$CAMIC.viewer.heatmap.updateView();
	if($D.editedDataClusters.data.isEmpty())
		alert('NO');

}

function findPenInfoByColor(color,info){
	return info.find(i=>i[3]==color);
}
function getViewRect(points , size, viewer){ // points in normalized, size in normalized, viewer
	const point = getBounds(points);
	const viewport = viewer.viewport;
	const imagingHelper = viewer.imagingHelper;
	let min = [point.min[0] - size[0], point.min[1] - size[1]];
	let max = [point.max[0] + size[0]+size[0],point.max[1] +size[1]+size[1]];
	min  = [imagingHelper.logicalToDataX(min[0]), imagingHelper.logicalToDataY(min[1])];
	max  = [imagingHelper.logicalToDataX(max[0]), imagingHelper.logicalToDataY(max[1])];


	return viewport.imageToViewportRectangle(min[0],min[1],max[0]-min[0], max[1]-min[1]);
	
}

function getBounds(points){ // return x,y,w,h
    let max,min;
    points.forEach(point => {
        if (!min && !max) {
            min = [point[0], point[1]];
            max = [point[0], point[1]];
        } else {
            min[0] = Math.min(point[0], min[0]);
            max[0] = Math.max(point[0], max[0]);
            min[1] = Math.min(point[1], min[1]);
            max[1] = Math.max(point[1], max[1]);
        }
    });
    return {
    	min:min,
    	max:max
    };
}


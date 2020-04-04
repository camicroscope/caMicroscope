// dataloaders.js
//

// function SlideDataLoader(){
// 	function loadingSlideInfo(){

// 	}
// 	var checkCoreIsReady = setInterval(function () {
// 		if($CAMIC) {
// 			clearInterval(checkCoreIsReady);
// 			//load data
// 			loadingSlideInfo();
// 		}
// 	}, 1000);
// }

function FormTempaltesLoader(){

	function loadingFormTemplates(){

		$CAMIC.store.findTemplate()
		//
		.then(function(temps){
			// get templates data
			$D.templates = temps;
		})
		//
		.catch(function(error){
			// templates schema

			console.error(error);
		})
		//
		.finally(function(){
			if($D.templates){
				// load UI
			}else{
				// set message
				$UI.message.addError('Loading Templates is Error');

			}
		});
	}

	var checkCoreIsReady = setInterval(function () {
		if($CAMIC) {
			clearInterval(checkCoreIsReady);
			//load data
			loadingFormTemplates();
		}
	}, 500);
}
let _l = false;
function OverlayersLoader(){
	function loadingOverlayers(){
		$CAMIC.store.findMarkTypes($D.params.slideId)
		//
		.then(function(layers){
			typeIds = {};
			if(!$D.overlayers) $D.overlayers = [];
			// convert part not nesscary
			for(let i = 0 ;i < layers.length;i++){
				$D.overlayers.push(covertToLayViewer(layers[i]));
			}
			_l = true;

		})
		//
		.catch(function(error){
			// overlayers schema

			console.error(error);
		})
		//
		.finally(function(){
			if($D.overlayers){

			}else{
				// set message
				$UI.message.addError('Loading Overlayers is Error');

			}
		});
	}

	var checkCoreIsReady = setInterval(function () {
		if($CAMIC && $D.params.data) {
			clearInterval(checkCoreIsReady);
			//load data
			loadingOverlayers();
		}
	}, 500);
}
let _h = false; // loading heatmap
function HeatmaplayersLoader(){
	function loadingHeatmapOverlayers(){
		$CAMIC.store.findHeatmapType($D.params.slideId)
		//
		.then(function(layers){
			if(!$D.overlayers)$D.overlayers = [];
			// convert and load heatmap layer
			const TypeId = randomId();
			for(let i = 0 ;i < layers.length;i++){
				const item = layers[i].provenance.analysis;
				$D.overlayers.push({id:item.execution_id,name:item.execution_id,typeId:TypeId,typeName:item.computation});
			}
			_h = true;
		})
		.catch(function(error){
			// overlayers schema

			console.error(error);
		})
		//
		.finally(function(){
			if($D.overlayers){
			}else{
				// set message
				$UI.message.addError('Loading heatmap Overlayers is Error');

			}
		});
	}

	var checkCoreIsReady = setInterval(function () {
		if($CAMIC && $D.params.data) {
			clearInterval(checkCoreIsReady);
			//load data
			loadingHeatmapOverlayers();
		}
	}, 500);
}

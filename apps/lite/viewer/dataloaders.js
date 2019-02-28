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

function OverlayersLoader(){
	function loadingOverlayers(){
		$CAMIC.store.findMarkTypes($D.params.data.name)
		//
		.then(function(layers){
			typeIds = {};
			$D.overlayers = [];
			// convert part not nesscary
			for(let i = 0 ;i < layers.length;i++){
				$D.overlayers.push(covertToLayViewer(layers[i],($D.params.states)?$D.params.states.l:null));
			}
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

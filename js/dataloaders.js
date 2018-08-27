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
		
		$UI.message.add('Start loading Templates');
		$CAMIC.store.findTemplate()
		//
		.then(function(temps){
			// get templates data
			$D.templates = temps;
			console.log($D.templates);
		})
		//
		.catch(function(error){
			// templates schema
			
			console.error(error);
		})
		//
		.finally(function(){
			if($D.templates){
				// set successful message
				$UI.message.add('Templates loaded');
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

		$UI.message.add('Start loading Overlayers');
		$CAMIC.store.findMarkTypes(null,$D.params.slideId)
		//
		.then(function(layers){
			typeIds = {};
			// convert part not nesscary
			layers = layers.map(item => {
				if(!typeIds[item.type]) typeIds[item.type] = randomId(); 
				return {id:randomId(),name:item.name,typeId:typeIds[item.type],typeName:item.type};
			})
			// get overlayers data
			$D.overlayers = layers;
			console.log($D.overlayers);
		})
		//
		.catch(function(error){
			// overlayers schema
			
			console.error(error);
		})
		//
		.finally(function(){
			if($D.overlayers){
				// set successful message
				$UI.message.add('Overlayers loaded');
				// load UI
			}else{
				// set message
				$UI.message.addError('Loading Overlayers is Error');
				
			}
		});
	}

	var checkCoreIsReady = setInterval(function () {
		if($CAMIC) {
			clearInterval(checkCoreIsReady);
			//load data
			loadingOverlayers();
		}
	}, 500);
}

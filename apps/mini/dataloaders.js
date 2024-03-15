

function FormTempaltesLoader() {
  function loadingFormTemplates() {
    $CAMIC.store.findTemplate()
    //
        .then(function(temps) {
          // get templates data
          $D.templates = temps;
        })
    //
        .catch(function(error) {
          // templates schema

          console.error(error);
        })
    //
        .finally(function() {
          if ($D.templates) {
            // load UI
          } else {
            // set message
            $UI.message.addError('Loading Templates is Error');
          }
        });
  }

  var checkCoreIsReady = setInterval(function() {
    if ($CAMIC) {
      clearInterval(checkCoreIsReady);
      // load data
      loadingFormTemplates();
    }
  }, 500);
}

function layersLoader() {
  // human
  function loadingHumanOverlayers() {
    $CAMIC.store.findMarkTypes($D.params.slideId, 'human').then(function(layers) {
      // convert part not nesscary
      $D.humanlayers = [...layers.map(covertToHumanLayer)];

      // add data and create ui item
      addHumanLayerItems();
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading Human Layers is Error');
      console.error(error);
    });
  }
  // ruler
  function loadingRulerOverlayers() {
    $CAMIC.store.findMarkTypes($D.params.slideId, 'ruler').then(function(layers) {
      // convert part not nesscary
      $D.rulerlayers = [...layers.map(covertToRulerLayer)];

      // add data and create ui item
      addRulerLayerItems();
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading Ruler Layers is Error');
      console.error(error);
    });
  }
  // heatmap
  function loadingHeatmapOverlayers() {
    $CAMIC.store.findHeatmapType($D.params.slideId).then(function(layers) {
      $D.heatmaplayers = [];
      // convert and load heatmap layer
      for (let i = 0; i < layers.length; i++) {
        const item = layers[i].provenance.analysis;
        $D.heatmaplayers.push({id: item.execution_id,
          name: item.execution_id,
          typeId: 'heatmap',
          typeName: 'heatmap',
        });
      }
      // add data and create ui item
      addHeatmapLayerItems();
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading heatmap Overlayers is Error');
      console.error(error);
    });
  }

  // segmentation
  function loadingComputerOverlayers() {
    $CAMIC.store.findMarkTypes($D.params.slideId, 'computer').then(function(layers) {
      // convert part not nesscary
      $D.computerlayers=[...layers.map(covertToCumputerLayer)];
      // add data and create ui item
      addComputerLayerItems();
    }).catch(function(error) {
      $UI.message.addError('Loading Computer Layers is Error');
      console.error(error);
    });
  }
  var checkCoreIsReady = setInterval(function() {
    if ($UI.layersViewer && $UI.layersViewerMinor) {
      clearInterval(checkCoreIsReady);
      loadingHumanOverlayers();
      loadingRulerOverlayers();
      loadingHeatmapOverlayers();
      loadingComputerOverlayers();
    }
  }, 500);
}



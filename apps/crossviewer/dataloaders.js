function layersLoader() {
  // human
  function loadingHumanOverlayers() {
    $D.humanlayers = {};

    $CAMIC.store.findMarkTypes($D.params.main, 'human').then(function(layers) {
      // convert part not nesscary
      $D.humanlayers.main = [...layers.map(covertToHumanLayer)];
      // add data and create ui item
      addHumanLayerItems('main');
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading Human Layers in Left Viewer is Error');
      console.error(error);
    });

    $minorCAMIC.store.findMarkTypes($D.params.minor, 'human').then(function(layers) {
      // convert part not nesscary
      $D.humanlayers.minor = [...layers.map(covertToHumanLayer)];
      // add data and create ui item
      addHumanLayerItems('minor');
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading Human Layers in Right Viewer is Error');
      console.error(error);
    });
  }
  // ruler
  function loadingRulerOverlayers() {
    $D.rulerlayers = {};

    $CAMIC.store.findMarkTypes($D.params.main, 'ruler').then(function(layers) {
      // convert part not nesscary
      $D.rulerlayers.main = [...layers.map(covertToRulerLayer)];

      // add data and create ui item
      addRulerLayerItems('main');
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading Ruler Layers in Left Viewer is Error');
      console.error(error);
    });

    $minorCAMIC.store.findMarkTypes($D.params.minor, 'ruler').then(function(layers) {
      // convert part not nesscary
      $D.rulerlayers.minor = [...layers.map(covertToRulerLayer)];

      // add data and create ui item
      addRulerLayerItems('minor');
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading Ruler Layers in Right Viewer is Error');
      console.error(error);
    });
  }
  // heatmap
  function loadingHeatmapOverlayers() {
    $D.heatmaplayers = {};

    $CAMIC.store.findHeatmapType($D.params.main).then(function(layers) {
      $D.heatmaplayers.main = [];
      // convert and load heatmap layer
      for (let i = 0; i < layers.length; i++) {
        const item = layers[i].provenance.analysis;
        $D.heatmaplayers.main.push({id: item.execution_id,
          name: item.execution_id,
          typeId: 'heatmap',
          typeName: 'heatmap',
        });
      }
      // add data and create ui item
      addHeatmapLayerItems('main');
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading heatmap Overlayers in Left Viewer is Error');
      console.error(error);
    });

    $minorCAMIC.store.findHeatmapType($D.params.minor).then(function(layers) {
      $D.heatmaplayers.minor = [];
      // convert and load heatmap layer
      for (let i = 0; i < layers.length; i++) {
        const item = layers[i].provenance.analysis;
        $D.heatmaplayers.minor.push({id: item.execution_id,
          name: item.execution_id,
          typeId: 'heatmap',
          typeName: 'heatmap',
        });
      }
      // add data and create ui item
      addHeatmapLayerItems('minor');
    }).catch(function(error) {
      // overlayers schema
      $UI.message.addError('Loading heatmap Overlayers in Right Viewer is Error');
      console.error(error);
    });
  }

  // segmentation
  function loadingComputerOverlayers() {
    $D.computerlayers = {};

    $CAMIC.store.findMarkTypes($D.params.main, 'computer').then(function(layers) {
      // convert part not nesscary
      $D.computerlayers.main=[...layers.map(covertToCumputerLayer)];
      // add data and create ui item
      addComputerLayerItems('main');
    }).catch(function(error) {
      $UI.message.addError('Loading Computer Layers in Left Viewer is Error');
      console.error(error);
    });

    $minorCAMIC.store.findMarkTypes($D.params.minor, 'computer').then(function(layers) {
      // convert part not nesscary
      $D.computerlayers.minor=[...layers.map(covertToCumputerLayer)];
      // add data and create ui item
      addComputerLayerItems('minor');
    }).catch(function(error) {
      $UI.message.addError('Loading Computer Layers in Right Viewer is Error');
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
    if ($CAMIC && $minorCAMIC) {
      clearInterval(checkCoreIsReady);
      // load data
      loadingFormTemplates();
    }
  }, 500);
}

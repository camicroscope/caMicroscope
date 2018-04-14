var annots;

function show_minidraw(){
  // calibrate our canvas
  var c1 = delayer({});
  var c1_c = ViewportCalibratedCanvas(c1, rhs_viewer);
  var rhs_imagingHelper = new OpenSeadragonImaging.ImagingHelper({
        viewer: rhs_viewer
      });
  // handle algorithm selection
  annots = new annotations(tissueId, rhs_viewer, c1_c, rhs_imagingHelper, {});

  // get new data each pass
  rhs_viewer.addHandler("zoom", function(){
    c1.__queue = [];
    annots.draw();
  })

  rhs_viewer.addHandler("pan", function(){
    c1.__queue = [];
    annots.draw();
  });

  // by default, for demo, select all algorithms
  annots.store.getAlgList(function(data){
    data.forEach((x)=>annots.select(x.title));
  });

  console.log(annots.selection);

  // redraw all active annotations each redraw
  // clearing and re-fetching is inefficient, c1 can be used as a cache
  var overlay = rhs_viewer.canvasOverlay({
      clearBeforeRedraw:true,
      onRedraw:function() {
        var lw = 50 / (viewer.viewport.getZoom(true));
        overlay.context2d().lineWidth = lw
        c1.__apply_all(overlay.context2d());
      }
  });
  // // dummy response
  //  d = [{ "_id" : { "$oid" : "5ad11630e4b0dd37ccda6ee3"} , "geometry" : { "type" : "Polygon" , "coordinates" : [ [ [ 0 , 0] , [ 0.37133497911441 , 0.55870962366762] , [ 0 , 1] , [ 0.36813129206405 , 0.57044250168238] , [ 0.36813129206405 , 0.55870962366762]]]} , "footprint" : 69980.14639099 , "provenance" : { "analysis" : { "execution_id" : "tammy.diprima_Tumor_Region" , "source" : "human"} , "image" : { "case_id" : "TEST"}}},{ "_id" : { "$oid" : "5ad11630e4b0dd37ccda6ee5"} , "geometry" : { "type" : "Polygon" , "coordinates" : [ [ [ 0.36813129206405 , 0.55870962366762] , [ 0.37133497911441 , 0.55870962366762] , [ 0.37133497911441 , 0.57044250168238] , [ 0.36813129206405 , 0.57044250168238] , [ 0.36813129206405 , 0.55870962366762]]]} , "footprint" : 69980.14639099 , "provenance" : { "analysis" : { "execution_id" : "tammy.diprima_Tumor_Region" , "source" : "human"} , "image" : { "case_id" : "TEST"}}}];
  // //
  // drawFromList(d, c1_c)
}


document.addEventListener("sidesplit", function(e){
  if (document.getElementById("right_sidebyside").style.display == "block"){
    hide_sbs();
  } else {
    //var demoimg = {"CMU1jp2k": "http://localhost:8081/fcgi-bin/iipsrv.fcgi?DeepZoom=/data/images/CMU-1-JP2K-33005-274ju.svs", "CMU1jp2k": "http://localhost:8081/fcgi-bin/iipsrv.fcgi?DeepZoom=/data/images/CMU-1-JP2K-33005-274ju.svs.dzi"};
    show_sbs();
    // need viewers to be up to draw
    show_minidraw();
    rhs_viewer.open(_viewer_source); // for now
  }
});

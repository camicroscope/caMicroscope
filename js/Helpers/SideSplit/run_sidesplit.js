var annots;

var _sbs_source = _viewer_source;
var _sbs_id = tissueId;

// call this function before minidraw to open a different image
function change_image(id, url){
  _sbs_source = url;
  _sbs_id = id;
}

// create a div for the algorithm selector
var algsel = document.createElement("div");
algsel.style.zIndex = "99";
algsel.style.position = "absolute";
algsel.style.height = "10%";
algsel.style.width = "10%";
algsel.style.top = "10%";
algsel.style.left = "10%";
algsel.style.display = "none";


algsel.id = "algsel_sbs";
document.body.appendChild(algsel)

function show_minidraw(){
  // calibrate our canvas
  var c1 = delayer({});
  var c1_c = ViewportCalibratedCanvas(c1, rhs_viewer);
  var rhs_imagingHelper = new OpenSeadragonImaging.ImagingHelper({
        viewer: rhs_viewer
      });
  // handle algorithm selection
  annots = new annotations(_sbs_id, rhs_viewer, c1_c, rhs_imagingHelper, {});

  // get new data each pass
  rhs_viewer.addHandler("zoom", function(){
    annots.draw();
  })

  rhs_viewer.addHandler("pan", function(){
    annots.draw();
  });

  // algorithm selector
  annots.store.getAlgList(function(data){
    let algsel = document.getElementById("algsel_sbs")
    algsel.style.display = "";
    let title = document.createElement("div");
    title.innerHTML = "Select algorithms: <br/>"
    algsel.appendChild(title);
    // add title
    data.forEach(function(xt){
      let x = xt.target;
      let select_item = document.createElement("div");
      select_item.innerHTML = x.title;
      select_item.onclick = function(y){
        let x = y.target;
        x.style.display="none";
        annots.select(x.innerHTML);
      }.bind(this);
      // TODO add a little color indicator
      algsel.appendChild(select_item);
    });
    let done = document.createElement("div");
    done.innerHTML = "DONE"
    done.onclick = function(){
      document.getElementById("algsel_sbs").style.display="none";
    }
    algsel.appendChild("done")
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



// functions to change

document.addEventListener("sidesplit", function(e){
  if (document.getElementById("right_sidebyside").style.display == "block"){
    hide_sbs();
  } else {
    //var demoimg = {"CMU1jp2k": "http://localhost:8081/fcgi-bin/iipsrv.fcgi?DeepZoom=/data/images/CMU-1-JP2K-33005-274ju.svs", "CMU1jp2k": "http://localhost:8081/fcgi-bin/iipsrv.fcgi?DeepZoom=/data/images/CMU-1-JP2K-33005-274ju.svs.dzi"};
    show_sbs();
    // need viewers to be up to draw
    show_minidraw();
    rhs_viewer.open(_sbs_source); // for now
  }
});

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
algsel.style.padding = "10px;"
algsel.style.position = "absolute";
algsel.style.height = "auto";
algsel.style.maxHeight = "80%";
algsel.style.maxWidth = "30%";
algsel.style.overflow = "scroll";
algsel.style.width = "auto";
algsel.style.top = "10%";
algsel.style.left = "60%";
algsel.style.display = "none";
algsel.style.borderRadius= "5px";
algsel.style.background= "#73AD21";


algsel.id = "algsel_sbs";
document.body.appendChild(algsel);

var firstInit = true;

function show_minidraw(){
  if (firstInit){
    firstInit = false;
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
  }
  // reset each time
  annots.selection = [];
  // algorithm selector
  annots.store.getAlgList(function(data){
    let algsel = document.getElementById("algsel_sbs");
    algsel.innerHTML = "";
    algsel.style.display = "inline-block";
    let title = document.createElement("div");
    title.innerHTML = "<b>Select algorithms:</b> <br/>"
    algsel.appendChild(title);
    data.forEach(function(x){
      let select_item = document.createElement("div");
      select_item.innerHTML = x.title;
      select_item.onclick = function(y){
        y = y.target;
        y.style.display="none";
        annots.select(y.innerHTML);
        // force a redraw
        annots.forceDraw();
      }.bind(this);
      // TODO add a little color indicator
      algsel.appendChild(select_item);
    });
    let done = document.createElement("div");
    done.innerHTML = "<b>DONE</b>"
    done.onclick = function(){
      document.getElementById("algsel_sbs").style.display="none";
    }
    algsel.appendChild(done);
  });
}



// functions to change

document.addEventListener("sidesplit", function(e){
  if (document.getElementById("right_sidebyside").style.display == "block"){
    hide_sbs();
  } else {
    // need viewers to be up to draw
    show_sbs();
    show_minidraw();
    rhs_viewer.open(_sbs_source);
  }
});

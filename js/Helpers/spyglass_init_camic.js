
// this initalizes spyglass for caMicroscope
// OSD and Spyglass.js need to be included before this.

// due to some problems with toolbar, this expects an invisible icon in the toolbar with id "spyglass_toolbar_button"
function toggle_spyglass_visible(){
  is_invisible = document.getElementById('spyglass').offsetParent === null
  is_invisible ? document.getElementById('spyglass').style.display = "" :  document.getElementById('spyglass').style.display = "none";
}

function spyglass_init(imgsrc){
  // create the div

  var spyglass_div = document.createElement("div");
  spyglass_div.id = "spyglass"
  // style it
  spyglass_div.style['z-index'] = "1";
  spyglass_div.style['width'] = "20%";
  spyglass_div.style['height'] = "20%";
  spyglass_div.style['border'] = "5px solid black";
  spyglass_div.style['border-radius'] = "5px";
  spyglass_div.style['z-index'] = "1";
  spyglass_div.style['display'] = "none";
  document.body.appendChild(spyglass_div);
  // init OSD
  var spyglass_viewer = new OpenSeadragon.Viewer({
        id: "spyglass",
        prefixUrl: "images/",
        showNavigationControl : false
      });
  // open image
  spyglass_viewer.open(imgsrc);
  //add to toolbar

  // call the spyglass
  window.setTimeout(Spyglass(viewer, spyglass_viewer),250);

  // make the button not hidden

  // things we need to wait on to resolve
  window.setTimeout(function(){
    document.getElementById('spyglass_toolbar_button').style = "";
    document.getElementById('spyglass_toolbar_button').onclick = toggle_spyglass_visible;
    // TODO remove this and handle custom zoom
    document.getElementById('spyglass')['zoomlevel'] = viewer.viewport.getMaxZoom();
  }, 500);
}

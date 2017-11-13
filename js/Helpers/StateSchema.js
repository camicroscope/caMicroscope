// this code helps us define our schema for state mangment
// schema : {position:{x:x,y:y,z:z}, algs:[algname1,algname2]}
var camic_state = new StateManager('state');

function setPosition(position){
  var pt = new OpenSeadragon.Point(position.x, position.y);
  viewer.viewport.zoomTo(position.z, pt);
  viewer.viewport.panTo(pt, true);
}

// TODO test if this method always works
function setAlgs(algList){
  SELECTED_ALGORITHM_LIST = algList;
}

// initalize after 500 seconds
setTimeout(function(){
  camic_state.add_key('position', setPosition);
  camic_state.add_key('alg', setAlgs);
  // before touching the url, get what we already have
  camic_state.initialize(camic_state.decode(camic_state.get_url_state()));
  // remove state url when done
  setTimeout(function(){
    camic_state.clear_url();
  }, 500);
}, 500);


algHandler = function() {
  camic_state.vals['alg']=SELECTED_ALGORITHM_LIST;
  //camic_state.set_url();
};

moveHandler = function() {
  var pos = viewer.viewport.getCenter(true);
  var zoom = viewer.viewport.getZoom(true);
  camic_state.vals['position']={'x':pos.x, 'y':pos.y, 'z':zoom};
  //camic_state.set_url();
};

// TODO make this actually trigger usefully
// update url when requested only (this should be share)
function LinkRequest(){
  moveHandler();
  algHandler();
  console.log("{state : " + camic_state.encode(camic_state.vals)+ "}");
}

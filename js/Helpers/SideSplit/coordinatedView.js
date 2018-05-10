function coordinatedView(viewer1, viewer2) {
      /** Returns a callback which starts bidirectional view coordination
       * run with window.setTimeout((this).initalize(viewer1, viewer2),500);
       */

      function initalize(){
          function transmit(from_viewer, to_viewer, reverse){
            return function(){
              var calib = document.getElementById('sbs_calibration').value.split(",").map((x)=>(parseFloat(x)))
              var calib_point = new OpenSeadragon.Point(calib[0], calib[1]);
              var active = document.getElementById('sbs_activation').value == "active"
              if (active){
                var from_point = from_viewer.viewport.getCenter();
                var dest_point = new OpenSeadragon.Point(from_point.x, from_point.y).plus(calib_point);
                if (reverse){
                  var dest_point = new OpenSeadragon.Point(from_point.x, from_point.y).minus(calib_point);
                }
                to_viewer.viewport.zoomTo(from_viewer.viewport.getZoom(), dest_point, false);
                to_viewer.viewport.panTo(dest_point, false);
              }
            }
          }
          var events=["click", "mouseover", "mousemove", "wheel", "keypress", "zoom", "pan"];
          events.forEach(function(ev){
            viewer1.container.addEventListener(ev ,transmit(viewer1,viewer2));
            viewer2.container.addEventListener(ev ,transmit(viewer2,viewer1, true));
          })

      }
      return initalize;
}

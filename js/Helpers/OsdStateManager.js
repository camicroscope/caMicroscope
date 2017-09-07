class OsdStateManager {
    constructor(viewer, options) {
        this.animateWaitTime = options.animateWaitTime || 300
        // global object reference used when the "this" object is referring to the window
        window.annotationHandler = this
    }

    getState() {
        var pt = viewer.viewport.getCenter(true);
        var xi = pt.x;
        var yi = pt.y;
        var zi = viewer.viewport.getZoom(true);
        var l = encodeURIComponent(btoa(JSON.stringify({
            "x": xi,
            "y": yi,
            "z": zi
        })));
        var tid = /tissueId=([^&#=]*)/.exec(window.location.search);
        tid = tid || [];
        if (tid.length >= 2){
          window.history.pushState("hi", "Encoded", "?tissueId="+tid[1]+"&state=" + l);
      }

    setState() {
        //TODO some error handling
        // handle improper encoding gracefully
        // handle missing field in json gracefully
        var matches = /state=([^&#=]*)/.exec(window.location.search);
        matches = matches || [];
        if (matches.length >= 2) {
            var xi = matches[1];
            var l = atob(decodeURIComponent(xi));
            var ll = JSON.parse(l);
            if ("x" in ll && "y" in ll) {
                var pt = new OpenSeadragon.Point(ll.x, ll.y);
                viewer.viewport.zoomTo(ll.z, pt);
                viewer.viewport.panTo(pt, true);
            }
        }
    }
    register(){
      var self = this;
      function addGetState(){
        viewer.addHandler("zoom", self.getState);
        viewer.addHandler("pan", self.getState);
      }
      setTimeout(self.setState, 100);
      setTimeout(addGetState, 500);
    }
}

var url = "http://localhost:3000/osdCamicroscope.php?tissueId=PC_052_0_1";
casper.test.begin('Camic Frontend', 7, function suite(test) {
    casper.start(url).then(function() {
      // Image display
      test.assertEval(function(){
        require('utils').dump(document.getElementsByTagName("canvas")[0].getContext('2d').getImageData(10, 10, 10, 10).data.reduce(function(a,b) {return a+b}))
        return document.getElementsByTagName("canvas")[0].getContext('2d').getImageData(10, 10, 10, 10).data.reduce(function(a,b) {return a+b}) > 0;
      });

      // Toolbar ok
      test.assertEval(function(){
        return document.getElementById('tool').style.height == "48px"
      });
      // ~!!
      // State link
      test.assertEval(function(){
        var pt = new OpenSeadragon.Point(0.1, 0.2);
        viewer.viewport.panTo(pt, true);
        viewer.viewport.zoomTo(3);
        camic_state.set_url();
        var state = camic_state.decode(camic_state.get_url_state());
        // compare set values to state
        // TODO these numbers are wrong!!!
        return (state.positon.x===0.1)&
          (state.position.y===0.2)&
          (state.position.z===4)
      });

      // Algorithm button
      test.assertEval(function(){
        document.getElementsByClassName("toolButton")[3].click();
        // Menu comes up
        // NOTE: offsetParent returns null iff element is invisible
        return !(document.getElementById('panel').offsetParent === null)
      });
      // TODO Shows whatever I seed it with
      test.assertEval(function(){
        document.getElementsByClassName("toolButton")[3].click();
        return (document.getElementById('panel').offsetParent === null)
      });

      // TODO Check case ID

      // magnifier is invisible initially
      test.assertEval(function(){
        (document.getElementById('spyglass').offsetParent === null)
      });
      // magnifier toggles on button press
      test.assertEval(function(){
        document.getElementsByClassName("toolButton")[3].click();
        return !(document.getElementById('spyglass').offsetParent === null)
      });
      // magnifier seems to follow mouse
      this.mouse.move(400, 300);
      var pos1 = document.getElementById('spyglass').getBoundingClientRect();
      this.mouse.move(100, 100);
      var pos2 = document.getElementById('spyglass').getBoundingClientRect();
      test.assert(pos1.bottom !== pos2.bottom);
    });
    casper.run(function() {
        test.done();
    });
});

var url = "localhost/osdCamicroscope.php?tissueId=PC_052_0_1";
casper.test.begin('Camic Frontend', 8, function suite(test) {
    casper.start(url, function() {
      // Image display
      test.assert(canvas.getImageData(10, 10, 10, 10).data.reduce(function(a,b) {return a+b}));
      // Toolbar ok
      test.assertEquals(document.getElementById('tool').style.height, "48px");
      // OSD basic test
      // State link looks OK
      var pt = new OpenSeadragon.Point(0.1, 0.2);
      viewer.viewport.panTo(pt, true);
      viewer.viewport.zoomTo(3);
      camic_state.set_url();
      var state = camic_state.decode(camic_state.get_url_state());
      // compare set values to state
      // TODO these numbers are wrong!!!
      test.assert((state.positon.x===0.1)&
        (state.position.y===0.2)&
        (state.position.z===4));
      // Algorithm button
      document.getElementsByClassName("toolButton")[3].click();
      // Menu comes up
      // NOTE: offsetParent returns null iff element is invisible
      test.assert(!(document.getElementById('panel').offsetParent === null));
      // Shows whatever I seed it with
      // TODO
      // Menu goes away
      document.getElementsByClassName("toolButton")[3].click();
      test.assert((document.getElementById('panel').offsetParent === null));
      // Check case ID
      // TODO

      // magnifier is invisible initially
      test.assert((document.getElementById('spyglass').offsetParent === null));
      // magnifier toggles on button press
      document.getElementsByClassName("toolButton")[3].click();
      // magnifier displays ok
      test.assert(!(document.getElementById('spyglass').offsetParent === null));
      // magnifier seems to follow mouse
      this.mouse.move(400, 300);
      var pos1 = document.getElementById('spyglass').getBoundingClientRect();
      this.mouse.move(100, 100);
      var pos2 = document.getElementById('spyglass').getBoundingClientRect();
      test.assert(pos1.bottom !== pos2.bottom);

      test.done();
    });
});

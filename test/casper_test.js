casper.test.begin('CAMICROSCOPE repo test', 1, function suite(test) {
    casper.start("http://localhost:3000/osdCamicroscope.php?tissueId=TESTING", function() {
        test.assertExists('#tool', "toolbar present");
      });
    // casper.wait(2000, function(){
    //     this.evaluateOrDie(function() {
    //       viewer.viewport.zoomTo(5);
    //       return viewer.viewport.getZoom() == 5
    //     }, "Viewer load fail")
    // });

    casper.run(function() {
        test.done();
    });
});

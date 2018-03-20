casper.test.begin('Image loads okay', 5, function suite(test) {
    casper.start("http://localhost:3000/osdCamicroscope.php?tissueId=TESTING", function() {
        test.assertExists('#tool', "toolbar present");
        test.assertExists('img[title="Filter Markups"]', "Markups btn present");
        test.click('img[title="Filter Markups"]');
    });

    casper.then(function() {
        // select some algorithms
        test.assertExists(".algorithmCheckbox[value=0]", "At least one alg checkbox present");
        test.click(".algorithmCheckbox[value=0]");
    });

    casper.then(function() {
        // check SELECTED_ALGORITHM_LIST
        test.evaluateOrDie(function() {
          return SELECTED_ALGORITHM_LIST.indexOf("wsi:r0.6:w0.8:l3:u200:k20:j0") >= 0
        }, "algorithim selection failed")
    });

    casper.run(function() {
        test.done();
    });
});

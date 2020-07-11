
var canvas; var ctx; var saveButton;
var pos = {x: 0, y: 0};
var rawImage;
var model;


function getModel(Layers, Params) {
  try {
    model = tf.sequential({
      layers: Layers,
    });

    if (advancedMode) {
      model.compile({
        optimizer: Params.optimizer,
        loss: Params.modelCompileLoss,
        metrics: Params.modelCompileMetrics,
      });
    } else {
      model.compile({
        optimizer: Params.optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });
    }
  } catch (error) {}

  return model;
}


async function train(model, data, Params) {
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {name: 'Model Training', styles: {height: '640px'}};
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

  // const BATCH_SIZE = 512;
  let TRAIN_DATA_SIZE = Params.trainDataSize;
  let TEST_DATA_SIZE = Params.testDataSize;
  let WIDTH = Params.width;
  let HEIGHT = Params.height;

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
    return [d.xs.reshape([TRAIN_DATA_SIZE, HEIGHT, WIDTH, NUM_CHANNELS]), d.labels];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE);
    return [d.xs.reshape([TEST_DATA_SIZE, HEIGHT, WIDTH, NUM_CHANNELS]), d.labels];
  });

  return model.fit(trainXs, trainYs, {
    batchSize: Number(Params.batchSize),
    validationData: [testXs, testYs],
    epochs: Number(Params.epochs),
    shuffle: Params.shuffle,
    callbacks: fitCallbacks,
  });
}


// function save(rawImage1) {
//   try {
//     var raw = tf.browser.fromPixels(rawImage1, 1);
//     var resized = tf.image.resizeBilinear(raw, [HEIGHT, WIDTH]);
//     var tensor = resized.expandDims(0);
//     var prediction = model.predict(tensor);
//     var pIndex = tf.argMax(prediction, 1).dataSync();

//     alert(pIndex);
//   } catch (error) {
//     // alert(error);
//   }
// }


async function run(Layers, Params) {
  // console.log(Params);
  try {
    const data = new Data();
    localforage.getItem('labels').then(async function(content) {
      let urlCreator = window.URL || window.webkitURL;
      let labelsURL = urlCreator.createObjectURL(content);
      LABELS_PATH = labelsURL;
      try {
        await data.load();
        const model = getModel(Layers, Params);
        tfvis.show.modelSummary({name: 'Model Architecture'}, model);
        await train(model, data, Params);
        // alert('Training is done');
        // await model.save('indexeddb://my-model');
        $('#trainedMessage').modal('show');
        $('#nextStepButton').show(200);
        $('#modelDownloadButton').click(async function() {
          await model.save('downloads://' + Params.modelName);
        });
      } catch (error) {
        alert(error);
        console.log(error);
      };
    });
  } catch (error) {
    alert(error);
    console.log(error);
  }
}


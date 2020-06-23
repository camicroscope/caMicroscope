
var canvas; var ctx; var saveButton;
var pos = {x: 0, y: 0};
var rawImage;
var model;

function getModel(Layers, Params) {
  // console.log(1);
  try {
    model = tf.sequential({
      layers: Layers,
    });
  } catch (error) {
    alert(error);
    $('#loading').css('display', 'none');
  }

  try {
    model.compile({
      optimizer: Params.optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  } catch (error) {}

  return model;
}

async function train(model, Params) {
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {name: 'Model Training', styles: {height: '640px'}};
  const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

  // const BATCH_SIZE = 512;
  let TRAIN_DATA_SIZE = Params.trainDataSize;
  let TEST_DATA_SIZE = Params.testDataSize;
  let WIDTH = Params.width;
  let HEIGHT = Params.height;

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = Data.nextTrainBatch(TRAIN_DATA_SIZE);
    return [d.xs.reshape([TRAIN_DATA_SIZE, WIDTH, HEIGHT, 1]), d.labels];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = Data.nextTestBatch(TEST_DATA_SIZE);
    return [d.xs.reshape([TEST_DATA_SIZE, WIDTH, HEIGHT, 1]), d.labels];
  });

  return model.fit(trainXs, trainYs, {
    batchSize: Number(Params.batchSize),
    validationData: [testXs, testYs],
    epochs: Number(Params.epochs),
    shuffle: Params.shuffle,
    callbacks: fitCallbacks,
  });
}

// function setPosition(e) {
//   var element = document.getElementById('canvas');
//   var clientRect = element.getBoundingClientRect();

//   pos.x = e.clientX - clientRect.left;
//   pos.y = e.clientY - clientRect.top;
// }

// function draw(e) {
//   if (e.buttons != 1) return;
//   ctx.beginPath();
//   ctx.lineWidth = 24;
//   ctx.lineCap = 'round';
//   ctx.strokeStyle = 'white';
//   ctx.moveTo(pos.x, pos.y);
//   setPosition(e);
//   ctx.lineTo(pos.x, pos.y);
//   ctx.stroke();
//   rawImage.src = canvas.toDataURL('image/png');
// }

function save(rawImage1) {
  try {
    var raw = tf.browser.fromPixels(rawImage1, 1);
    var resized = tf.image.resizeBilinear(raw, [WIDTH, HEIGHT]);
    var tensor = resized.expandDims(0);
    var prediction = model.predict(tensor);
    var pIndex = tf.argMax(prediction, 1).dataSync();

    alert(pIndex);
  } catch (error) {
    // alert(error);
  }
}

// function init() {
//   canvas = document.getElementById('canvas');
//   rawImage = document.getElementById('canvasimg');
//   ctx = canvas.getContext('2d');
//   ctx.fillStyle = 'black';
//   ctx.fillRect(0, 0, 280, 280);
//   canvas.addEventListener('mousemove', draw);
//   canvas.addEventListener('mousedown', setPosition);
//   canvas.addEventListener('mouseenter', setPosition);
//   saveButton = document.getElementById('sb');
//   // saveButton.addEventListener("click", save);
// }

async function run(Layers, Params) {
  try {
    const data = new MnistData();
    await data.load();
    // $('#loadText').text('Training model...');
    const model = getModel(Layers, Params);
    tfvis.show.modelSummary({name: 'Model Architecture'}, model);
    await train(model, data, Params);
    init();
    alert('Training is done');
    // $('.drawing').css('display', 'block');
    // $('#loading').css('display', 'none');
  } catch (error) {
    alert(error);
    // $('#loading').css('display', 'none');
  }
}

// document.addEventListener("DOMContentLoaded", run1);

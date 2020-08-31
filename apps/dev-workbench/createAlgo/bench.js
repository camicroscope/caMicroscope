let Params = {};
let classes = [];
let Layers = [];

$('body').on('click', 'label', function() {
  $(this).prev('input').focus();
});


$(document).ready(function() {
  if (localStorage.getItem('advancedMode') == 'true') {
    advancedMode = true;
    $('.advancedInitialSettings').show();
    $('#advancedModeIcon').show();
    $('#advancedToggle').prop('checked', true);
    showToast('alert-info', 'Advanced Mode is on !');
    console.log('Mode: Advanced');
  }
  if (localStorage.getItem('serverSide') == 'true') {
    serverSide = true;
    $('#serverModeIcon').show();
    $('#serverSideToggle').prop('checked', true);
    console.log('Server side: ON');
  }
  $('#headContent').show(400);
  $('#headbar').animate({height: 95}, 500, function() {
    $('#headbar').css('height', '100%');
    getZipFile();
  });
  $('#RGBorGrayscale').change(function() {
    if ($(this).prop('checked')) {
      $('#RGBorGrayscaleLabel').text('RGB');
    } else {
      $('#RGBorGrayscaleLabel').text('Grayscale');
    }
  });
  $('#exportOption').hide();
  checkForServerPermission();
});

$('#advancedToggle').change(function() {
  if ($(this).prop('checked')) {
    localStorage.setItem('advancedMode', 'true');
    location.reload();
  } else {
    localStorage.setItem('advancedMode', 'false');
    location.reload();
  }
});

$('#serverSideToggle').change(function() {
  if ($(this).prop('checked')) {
    localStorage.setItem('serverSide', 'true');
    serverSide = true;
    $('#serverModeIcon').show(150);
    showToast('alert-info', 'Turned on Server-side training !');
  } else {
    localStorage.setItem('serverSide', 'false');
    $('#serverModeIcon').hide(150);
    serverSide = false;
  }
});

// changes to be triggered if advanced mode is enabled
function advancedModeChanges() {
  if (advancedMode) {
    $('.advancedLayersSettings').show();
    $('#inputLayerActivation').val($('#inputActivation').val());
    $('#inputLayerPadding').val($('#inputPadding').val());
    $('#inputLayerStrides').val(Number($('#inputStride').val()));
    $('#inputLayerKernelInitializer').val($('#inputKernelInitializer').val());
    $('#outputLayerKernelInitializer').val($('#outputKernelInitializer').val());
    $('#outputLayerActivation').val($('#outputActivation').val());
  }
}

$('#goBack').click(function() {
  window.history.back();
});

// getting dataset zip file from browser storage and validating it
function getZipFile() {
  localforage.getItem('zipFile').then(function(zipFile) {
    JSZip.loadAsync(zipFile).then(function(zip) {
      zip.file('data.jpg').async('blob').then(
          function success(content) {
            let img = new Image();
            img.onload = function() {
              // alert(this.width + 'x' + this.height);
              // console.log('Num_data: ' + this.height);
              $('#numImages').text(this.height);
              let trainDataSize = Math.floor(
                  this.height * $('#testTrainRatio').val(),
              );
              $('#trainDataSize').val(trainDataSize);
              $('#testDataSize').val(this.height - trainDataSize);
              $('#loading').hide();
              $('#initialSettings').show(300).css('display', 'flex');
            };
            let urlCreator = window.URL || window.webkitURL;
            let imageUrl = urlCreator.createObjectURL(content);
            img.src = imageUrl;
            // spriteImageURL = imageUrl;
            localforage.setItem('sprite', content);
          },
          function error(e) {
            console.log(e);
          },
      ).then(()=>{
        zip.file('labels.bin').async('blob').then(
            function success(content) {
              localforage.setItem('labels', content);
            },
            function error(e) {
              console.log(e);
            },
        );
      }).then(()=>{
        zip.file('labelnames.csv').async('string').then(
            function success(content) {
              $('#classNames').val(content.trim());
              if (localStorage.getItem('import') == 'true') {
                setLayersFromImport();
              }
            },
            function error(e) {
              console.log(e);
            },
        );
      });
    });
  });
}


$('#testTrainRatio').on('input', function() {
  let trainDataSize = Math.floor(
      Number($('#numImages').text()) * $(this).val(),
  );
  $('#trainDataSize').val(trainDataSize);
  $('#testDataSize').val(Number($('#numImages').text()) - trainDataSize);
});

$('#trainDataSize').on('input', function() {
  $('#testDataSize').val(Number($('#numImages').text()) - $(this).val());
  $('#testTrainRatio').val(($(this).val() / Number($('#numImages').text())).toFixed(2));
});

$('#testDataSize').on('input', function() {
  $('#trainDataSize').val(Number($('#numImages').text()) - $(this).val());
  $('#testTrainRatio').val(1 - ($(this).val() / Number($('#numImages').text())).toFixed(2));
});


$('#initSettingsSubmit').submit(function() {
  classes = $('#classNames').val().trim().split(',');
  console.log(classes);
  let trainTestRatio = $('#testTrainRatio').val();
  NUM_DATASET_ELEMENTS = Number($('#numImages').text());
  NUM_CLASSES = classes.length;
  IMAGE_SIZE = $('#datasetNormalWidth').val() * $('#datasetNormalHeight').val();
  NUM_TRAIN_ELEMENTS = Math.floor(trainTestRatio * NUM_DATASET_ELEMENTS);
  NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;
  if ($('#RGBorGrayscale').prop('checked')) {
    NUM_CHANNELS = 4;
  } else {
    NUM_CHANNELS = 1;
  }
  Params.trainDataSize = Number($('#trainDataSize').val());
  Params.testDataSize = Number($('#testDataSize').val());
  Params.height = Number($('#datasetNormalHeight').val());
  Params.width = Number($('#datasetNormalWidth').val());
  Params.modelName = $('#modelName').val();
  if (serverSide) {
    Params.numClasses = classes.length;
    Params.advancedMode = advancedMode;
    Params.numChannels = NUM_CHANNELS;
  }
  $('#inputShape').val('['+$('#datasetNormalWidth').val()+','+$('#datasetNormalHeight').val()+','+NUM_CHANNELS+']');
  $('#kernelSize1').val($('#kernelSize').val());
  $('#filters1').val($('#filters').val());
  $('#outputLayer').find('#units').first().val(classes.length);
  $('#initialSettings').hide(200);
  $('#layersEditor').show(200).css('display', 'flex');
  $('#userTrain, #exportOption').show(200);
  $('#headContent').hide(200)
      .text('Customize the layers for ' + '"' + $('#modelName').val() + '"').show(300);
  advancedModeChanges();
  $('#goBack').unbind('click').click(function() {
    $('#initialSettings').show(200);
    $('#layersEditor, #userTrain, #headContent').hide(200);
    $('#headContent').text('Design your own ML training algorithm here').show(300);
    $('#goBack').unbind('click').click(function() {
      window.history.back();
    });
  });
});

let layerNumber = 1;
// to be triggered on first layer addition
$('body').on('click', '#add' + 1, function() {
  // $("#add" + 1).click(function() {
  let newLayerCard = `<div class='card LayerCard' id='Layer${layerNumber}'><!-- Card header --><div class='card-header' role='tab' id='headingOne${
    layerNumber + 1
  }'><a class='collapsed'  data-toggle='collapse'  data-parent='#accordionEx' href='#collapseOne${
    layerNumber + 1
  }'    aria-expanded='false'  aria-controls='collapseOne${
    layerNumber + 1
  }'  >  <h5 id='layerNumberID' class='mb-0'> Layer #${layerNumber}<i class='fas fa-angle-down rotate-icon'        style='position: absolute; right:0.8em'      ></i>    </h5>  </a></div><!-- Card body --><div  id='collapseOne${
    layerNumber + 1
  }'  class='collapse'  role='tabpanel'  aria-labelledby='headingOne${
    layerNumber + 1
  }'  data-parent='#accordionEx'> <div class='card-body'> <div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <select id="heyClass" class="browser-default custom-select modelClassSelect" style="width: 9em; margin: 0 auto; margin-bottom: 2em;" ><option value="1" selected="">Dense</option ><option value="2">Conv2D</option ><option value="3">Flatten</option ><option value="4">Dropout</option ><option value="5">MaxPooling2D</option ><option value="6">batchNormalization</option ><option class="advancedLayersSettings" style="display: none;" value="7" >activation</option ><option class="advancedLayersSettings" style="display: none;" value="8" >conv2dTranspose</option ><option class="advancedLayersSettings" style="display: none;" value="9" >averagePooling2d</option ><option class="advancedLayersSettings" style="display: none;" value="10" >globalAveragePooling2d</option ><option class="advancedLayersSettings" style="display: none;" value="11" >globalMaxPooling2d</option > </select >&nbsp;&nbsp; &nbsp;&nbsp;<div class="md-form" style="margin: 0 auto; width: 7em; display: none;" > <input type="number" id="kernelSize" class="form-control" /> <label for="kernelSize">kernelSize:</label></div><div class="md-form" style="margin: 0 auto; width: 5em; display: none;" > <input type="number" id="filters" class="form-control" /> <label for="filters">filters:</label></div><div class="md-form" style="margin: 0 auto; width: 8em;"> <input type="text" id="activation" class="form-control" /> <label for="activation">activation:</label></div><div class="md-form" style="margin: 0 auto; width: 6em;"> <input type="number" id="units" class="form-control" /> <label for="units">units:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" id="pool_size" class="form-control" /> <label for="pool_size">pool_size:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="text" id="padding" class="form-control" /> <label for="padding">padding:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" id="strides" class="form-control" /> <label for="strides">strides:</label></div><div class="md-form advancedLayersSettings" style="margin: 0 auto; width: 10em; display: none;" > <input type="text" id="kernelInitializer" class="form-control" /> <label for="kernelInitializer">kernelInitializer:</label></div><div class="md-form" style="margin: 0 auto; width: 7em; display: none;" > <input type="text" id="dataFormat" value="channelsLast" class="form-control" title="channelsFirst | channelsLast" /> <label class="active" for="dataFormat">dataFormat:</label></div><div class="md-form" style="margin: 0 auto; width: 5em; display: none;" > <input type="number" id="axis" class="form-control" /> <label for="axis">axis:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" id="momentum" class="form-control" /> <label for="momentum">momentum:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" max="1" min="0" step="0.01" id="rate" class="form-control" /> <label for="rate">rate:</label></div></div><br /><div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <button title="Delete Layer" class="btn btn-danger"id=deleteLayer style="padding:.4em .7em .4em .7em;font-size:1em;border-radius:5px;margin:0 auto;position:absolute;right:1em;bottom:1em;"><i class="fa-trash fas text-white"></i></button></div></div></div></div><div class='card add' id='add${
    layerNumber + 1
  }' style='width: 25em; height: 0.6em' title='Add layer'><h4></h4></div>`;

  $('#add' + 1).after(newLayerCard);
  $('#headingOne' + (layerNumber + 1)).css('height', '0');
  $('#headingOne' + (layerNumber + 1)).after().animate({height: '3em'}, 400);
  layerNumber++;
  let j = 1;
  $('.layersClass')
      .children('.card')
      .each(function() {
        if ($(this).attr('id') != 'inputLayer' && $(this).attr('id') != 'outputLayer') {
          $(this).find('#layerNumberID')
              .each(function() {
                $(this).html( 'Layer #' + j +
                '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                );
                j++;
              });
        }
      });
  addFuncLayers();

  addCardLayer();
});

// responsible for triggering the addition of any layer after 1st layer is added
function addCardLayer() {
  let i = layerNumber;
  $('body').on('click', '#add' + layerNumber, function() {
    let newLayerCard = `<div class='card LayerCard' id='Layer${layerNumber}'><!-- Card header --><div class='card-header' role='tab' id='headingOne${
      layerNumber + 1
    }'><a  data-toggle='collapse' data-parent='#accordionEx' href='#collapseOne${
      layerNumber + 1
    }'  aria-expanded='false'  aria-controls='collapseOne${
      layerNumber + 1
    }'  >    <h5 id='layerNumberID' class='mb-0'> Layer #${layerNumber}<i class='fas fa-angle-down rotate-icon'  style='position: absolute; right:0.8em' ></i> </h5> </a></div><!-- Card body --><div id='collapseOne${
      layerNumber + 1
    }'  class='collapse'  role='tabpanel'  aria-labelledby='headingOne${
      layerNumber + 1
    }'  data-parent='#accordionEx'> <div class='card-body'> <div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'><select id="heyClass" class="browser-default custom-select modelClassSelect" style="width: 9em; margin: 0 auto; margin-bottom: 2em;" ><option value="1" selected="">Dense</option ><option value="2">Conv2D</option ><option value="3">Flatten</option ><option value="4">Dropout</option ><option value="5">MaxPooling2D</option ><option value="6">batchNormalization</option ><option class="advancedLayersSettings" style="display: none;" value="7" >activation</option ><option class="advancedLayersSettings" style="display: none;" value="8" >conv2dTranspose</option ><option class="advancedLayersSettings" style="display: none;" value="9" >averagePooling2d</option ><option class="advancedLayersSettings" style="display: none;" value="10" >globalAveragePooling2d</option ><option class="advancedLayersSettings" style="display: none;" value="11" >globalMaxPooling2d</option > </select >&nbsp;&nbsp; &nbsp;&nbsp;<div class="md-form" style="margin: 0 auto; width: 7em; display: none;" > <input type="number" id="kernelSize" class="form-control" /> <label for="kernelSize">kernelSize:</label></div><div class="md-form" style="margin: 0 auto; width: 5em; display: none;" > <input type="number" id="filters" class="form-control" /> <label for="filters">filters:</label></div><div class="md-form" style="margin: 0 auto; width: 8em;"> <input type="text" id="activation" class="form-control" /> <label for="activation">activation:</label></div><div class="md-form" style="margin: 0 auto; width: 6em;"> <input type="number" id="units" class="form-control" /> <label for="units">units:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" id="pool_size" class="form-control" /> <label for="pool_size">pool_size:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="text" id="padding" class="form-control" /> <label for="padding">padding:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" id="strides" class="form-control" /> <label for="strides">strides:</label></div><div class="md-form advancedLayersSettings" style="margin: 0 auto; width: 10em; display: none;" > <input type="text" id="kernelInitializer" class="form-control" /> <label for="kernelInitializer">kernelInitializer:</label></div><div class="md-form" style="margin: 0 auto; width: 7em; display: none;" > <input type="text" id="dataFormat" value="channelsLast" class="form-control" title="channelsFirst | channelsLast" /> <label class="active" for="dataFormat">dataFormat:</label></div><div class="md-form" style="margin: 0 auto; width: 5em; display: none;" > <input type="number" id="axis" class="form-control" /> <label for="axis">axis:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" id="momentum" class="form-control" /> <label for="momentum">momentum:</label></div><div class="md-form" style="margin: 0 auto; width: 6em; display: none;" > <input type="number" max="1" min="0" step="0.01" id="rate" class="form-control" /> <label for="rate">rate:</label></div></div><br /><div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'> <button title="Delete Layer" class="btn btn-danger"id=deleteLayer style="padding:.4em .7em .4em .7em;font-size:1em;border-radius:5px;margin:0 auto;position:absolute;right:1em;bottom:1em;"><i class="fa-trash fas text-white"></i></button>  </div></div></div></div><div class='card add' id='add${
      layerNumber + 1
    }' style='width: 25em; height: 0.6em' title='Add layer'><h4></h4></div>`;

    $('#add' + i).after(newLayerCard);
    $('#headingOne' + (layerNumber + 1)).css('height', '0');
    $('#headingOne' + (layerNumber + 1)).after().animate({height: '3em'}, 400);
    layerNumber++;
    renameCorrectLayers();
    addCardLayer();
  });
}

// renaming the layer numbers correctly every time in case of addition/deletion etc.
function renameCorrectLayers() {
  let j = 1;
  $('.layersClass').children('.card').each(function() {
    if (
      $(this).attr('id') != 'inputLayer' &&
        $(this).attr('id') != 'outputLayer'
    ) {
      $(this).find('#layerNumberID').each(function() {
        $(this).html('Layer #' + j +
                '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
        );
        j++;
      });
    }
  });
  addFuncLayers();
}

// to add all visual functions to every new layer added like displaying parameters according to layer function etc.
function addFuncLayers() {
  $('.LayerCard').each(function() {
    let id = $(this).attr('id');
    // console.log(id);
    $('#' + id).find('.modelClassSelect').first()
        .change(function() {
        // console.log(1);
          if (advancedMode) {
            if ($(this).val() == 1) {
              $('#' + id)
                  .find('#inputShape, #kernelSize, #filters, #pool_size, #rate, #padding,'+
                  ' #strides, #dataFormat, #axis, #momentum')
                  .parent().css('display', 'none');
              $('#' + id)
                  .find('#activation, #units, #kernelInitializer')
                  .parent().css('display', 'block');
            } else if ($(this).val() == 2 || $(this).val() == 8) {
              $('#' + id)
                  .find('#inputShape, #units, #pool_size, #rate, #axis, #momentum')
                  .parent().css('display', 'none');
              $('#' + id)
                  .find('#kernelSize, #filters, #activation, #padding, #strides, #kernelInitializer,'+
                  ' #dataFormat').parent().css('display', 'block');
            } else if ($(this).val() == 3 || $(this).val() == 10 || $(this).val() == 11) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation, '+
                      '#kernelInitializer, #padding, #strides, #axis, #momentum',
                  ).parent().css('display', 'none');
              $('#' + id).find('#dataFormat').parent().css('display', 'block');
            } else if ($(this).val() == 4) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #pool_size, #kernelSize, #filters, #activation,'+
                      ' #kernelInitializer, #padding, #strides, #dataFormat, #axis, #momentum',
                  ).parent().css('display', 'none');
              $('#' + id).find('#rate').parent().css('display', 'block');
            } else if ($(this).val() == 5 || $(this).val() == 9) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #rate, #kernelSize, #filters, #activation,'+
                      ' #kernelInitializer, #axis, #momentum',
                  ).parent().css('display', 'none');
              $('#' + id)
                  .find('#pool_size, #padding, #strides, #dataFormat')
                  .parent().css('display', 'block');
            } else if ($(this).val() == 6) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation,'+
                      ' #kernelInitializer, #padding, #strides, #dataFormat',
                  ).parent().css('display', 'none');
              $('#' + id)
                  .find('#axis, #momentum').parent().css('display', 'block');
            } else if ($(this).val() == 7) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #pool_size, #rate, #axis, #momentum, #kernelSize,'+
                      ' #filters, #kernelInitializer, #padding, #strides, #dataFormat',
                  ).parent().css('display', 'none');
              $('#' + id).find('#activation').parent().css('display', 'block');
            }
          } else {
            if ($(this).val() == 1) {
              $('#' + id)
                  .find('#inputShape, #kernelSize, #filters, #pool_size, #rate')
                  .parent().css('display', 'none');
              $('#' + id)
                  .find('#activation, #units').parent().css('display', 'block');
            } else if ($(this).val() == 2) {
              $('#' + id).find('#inputShape, #units, #pool_size, #rate')
                  .parent().css('display', 'none');
              $('#' + id).find('#kernelSize, #filters, #activation')
                  .parent().css('display', 'block');
            } else if ($(this).val() == 3) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation',
                  ).parent().css('display', 'none');
            } else if ($(this).val() == 4) {
              $('#' + id)
                  .find(
                      '#inputShape, #units, #pool_size, #kernelSize, #filters, #activation',
                  ).parent().css('display', 'none');
              $('#' + id).find('#rate').parent().css('display', 'block');
            } else if ($(this).val() == 5) {
              $('#' + id).find(
                  '#inputShape, #units, #rate, #kernelSize, #filters, #activation',
              ).parent().css('display', 'none');
              $('#' + id).find('#pool_size').parent().css('display', 'block');
            } else {
              $('#' + id).find(
                  '#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation',
              ).parent().css('display', 'none');
            }
          }
        });
    $('#' + id).find('#deleteLayer').first()
        .click(function() {
          $('#' + id).next().remove();
          $('#' + id).remove();
          let j = 1;
          $('.layersClass').children('.card').each(function() {
            if (
              $(this).attr('id') != 'inputLayer' &&
              $(this).attr('id') != 'outputLayer'
            ) {
              $(this).find('#layerNumberID').each(function() {
                $(this).html('Layer #' + j +
                      '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                );
                j++;
              });
            }
          });
        });
  });
  $('.add').mouseenter(function() {
    $(this).find('h4').text('+');
    $(this).animate({height: '2em'}, 1);
  }).mouseleave(function() {
    $(this).animate({height: '0.6em'}, 1);
    $(this).find('h4').text('');
  });
  advancedModeChanges();
}

// Scans all the layers iteratively and creates model properties according to user customization
function saveLayers() {
  if (advancedMode) {
    if (serverSide) {
      Layers = [
        {
          layer: 'conv2d',
          inputShape: [
            Number($('#datasetNormalWidth').val()),
            Number($('#datasetNormalHeight').val()),
            NUM_CHANNELS,
          ],
          kernelSize: Number($('#kernelSize').val()),
          filters: Number($('#filters').val()),
          activation: $('#inputActivation').val(),
          strides: Number($('#inputStride').val()),
          kernelInitializer: $('#inputKernelInitializer').val(),
          padding: $('#inputLayerPadding').val(),
        },
        {
          layer: 'dense',
          units: classes.length,
          activation: $('#outputActivation').val(),
          kernelInitializer: $('#outputKernelInitializer').val(),
        },
      ];
    } else {
      Layers = [
        tf.layers.conv2d({
          inputShape: [
            Number($('#datasetNormalWidth').val()),
            Number($('#datasetNormalHeight').val()),
            NUM_CHANNELS,
          ],
          kernelSize: Number($('#kernelSize').val()),
          filters: Number($('#filters').val()),
          activation: $('#inputActivation').val(),
          strides: Number($('#inputStride').val()),
          kernelInitializer: $('#inputKernelInitializer').val(),
          padding: $('#inputLayerPadding').val(),
        }),
        tf.layers.dense({
          units: classes.length,
          activation: $('#outputActivation').val(),
          kernelInitializer: $('#outputKernelInitializer').val(),
        }),
      ];
    }
  } else {
    if (serverSide) {
      Layers = [
        {
          layer: 'conv2d',
          inputShape: [
            Number($('#datasetNormalWidth').val()),
            Number($('#datasetNormalHeight').val()),
            NUM_CHANNELS,
          ],
          kernelSize: Number($('#kernelSize').val()),
          filters: Number($('#filters').val()),
          activation: $('#inputActivation').val(),
        },
        {
          layer: 'dense',
          units: classes.length,
          activation: $('#outputActivation').val(),
        },
      ];
    } else {
      Layers = [
        tf.layers.conv2d({
          inputShape: [
            Number($('#datasetNormalWidth').val()),
            Number($('#datasetNormalHeight').val()),
            NUM_CHANNELS,
          ],
          kernelSize: Number($('#kernelSize').val()),
          filters: Number($('#filters').val()),
          activation: 'relu',
        }),
        tf.layers.dense({units: classes.length, activation: 'softmax'}),
      ];
    }
  }

  $('.LayerCard').each(function() {
    let id = $(this).attr('id');
    let select = $('#' + id).find('select option:selected').first().text();
    // console.log(select);
    try {
      if (id != 'inputLayer' && id != 'outputLayer') {
        if (select == 'Dense') {
          let activation = $('#' + id).find('#activation').first().val();
          let units = $('#' + id).find('#units').first().val();
          if (advancedMode) {
            let kernelInitializer = $('#' + id).find('#kernelInitializer').first().val();
            if (serverSide) {
              Layers.splice(Layers.length - 1, 0, {
                layer: 'dense',
                units: Number(units),
                activation: activation,
                kernelInitializer: kernelInitializer,
              });
            } else {
              Layers.splice(
                  Layers.length - 1, 0,
                  tf.layers.dense({units: Number(units), activation: activation, kernelInitializer: kernelInitializer}),
              );
            }
          } else {
            if (serverSide) {
              Layers.splice(Layers.length - 1, 0, {
                layer: 'dense',
                units: Number(units),
                activation: activation,
              });
            } else {
              Layers.splice(
                  Layers.length - 1, 0,
                  tf.layers.dense({units: Number(units), activation: activation}),
              );
            }
          }
        } else if (select == 'Conv2D') {
          let activation = $('#' + id).find('#activation').first().val();
          let kernelSize = Number(
              $('#' + id).find('#kernelSize').first().val(),
          );
          let filters = Number(
              $('#' + id).find('#filters').first().val(),
          );
          if (advancedMode) {
            let kernelInitializer = $('#' + id).find('#kernelInitializer').first().val();
            let strides = $('#' + id).find('#strides').first().val();
            let padding = $('#' + id).find('#padding').first().val();
            let dataFormat = $('#' + id).find('#dataFormat').first().val();
            if (serverSide) {
              Layers.splice(
                  Layers.length - 1, 0,
                  {
                    layer: 'conv2d',
                    kernelSize: kernelSize,
                    filters: filters,
                    activation: activation,
                    padding: padding,
                    strides: Number(strides),
                    kernelInitializer: kernelInitializer,
                    dataFormat: dataFormat,
                  },
              );
            } else {
              Layers.splice(
                  Layers.length - 1, 0,
                  tf.layers.conv2d({
                    kernelSize: kernelSize,
                    filters: filters,
                    activation: activation,
                    padding: padding,
                    strides: Number(strides),
                    kernelInitializer: kernelInitializer,
                    dataFormat: dataFormat,
                  }),
              );
            }
          } else {
            if (serverSide) {
              Layers.splice(
                  Layers.length - 1, 0,
                  {
                    layer: 'conv2d',
                    kernelSize: kernelSize,
                    filters: filters,
                    activation: activation,
                  },
              );
            } else {
              Layers.splice(
                  Layers.length - 1, 0,
                  tf.layers.conv2d({
                    kernelSize: kernelSize,
                    filters: filters,
                    activation: activation,
                  }),
              );
            }
          }
        } else if (select == 'Flatten') {
          if (advancedMode) {
            let dataFormat = $('#' + id).find('#dataFormat').first().val();
            if (serverSide) {
              Layers.splice(Layers.length - 1, 0, {
                layer: 'flatten',
                dataFormat: dataFormat,
              });
            } else {
              Layers.splice(Layers.length - 1, 0, tf.layers.flatten({dataFormat: dataFormat}));
            }
          } else {
            if (serverSide) {
              Layers.splice(Layers.length - 1, 0, {
                layer: 'flatten',
              });
            } else {
              Layers.splice(Layers.length - 1, 0, tf.layers.flatten());
            }
          }
        } else if (select == 'batchNormalization') {
          if (advancedMode) {
            let axis = $('#' + id).find('#axis').first().val();
            let momentum = $('#' + id).find('#momentum').first().val();
            if (serverSide) {
              Layers.splice(Layers.length - 1, 0, {
                layers: 'batchNormalization',
                axis: Number(axis),
                momentum: Number(momentum),
              });
            } else {
              Layers.splice(Layers.length - 1, 0,
                  tf.layers.batchNormalization({axis: Number(axis), momentum: Number(momentum)}));
            }
          } else {
            if (serverSide) {
              Layers.splice(Layers.length - 1, 0, {
                layers: 'batchNormalization',
              });
            } else {
              Layers.splice(Layers.length - 1, 0, tf.layers.batchNormalization());
            }
          }
        } else if (select == 'Dropout') {
          let rate = parseFloat(
              $('#' + id).find('#rate').first().val(),
          );
          if (serverSide) {
            Layers.splice(
                Layers.length - 1, 0, {
                  layer: 'dropout',
                  rate: rate,
                },
            );
          } else {
            Layers.splice(
                Layers.length - 1, 0,
                tf.layers.dropout({
                  rate: rate,
                }),
            );
          }
        } else if (select == 'MaxPooling2D') {
          let poolSize = Number(
              $('#' + id).find('#pool_size').first().val(),
          );
          if (advancedMode) {
            let dataFormat = $('#' + id).find('#dataFormat').first().val();
            let strides = $('#' + id).find('#strides').first().val();
            let padding = $('#' + id).find('#padding').first().val();
            if (serverSide) {
              Layers.splice(
                  Layers.length - 1, 0, {
                    layer: 'maxpooling2d',
                    poolSize: [poolSize, poolSize],
                    dataFormat: dataFormat,
                    strides: Number(strides),
                    padding: padding,
                  },
              );
            } else {
              Layers.splice(
                  Layers.length - 1, 0,
                  tf.layers.maxPooling2d({
                    poolSize: [poolSize, poolSize],
                    dataFormat: dataFormat,
                    strides: Number(strides),
                    padding: padding,
                  }),
              );
            }
          } else {
            if (serverSide) {
              Layers.splice(
                  Layers.length - 1, 0, {
                    layer: 'maxpooling2d',
                    poolSize: [poolSize, poolSize],
                  },
              );
            } else {
              Layers.splice(
                  Layers.length - 1, 0,
                  tf.layers.maxPooling2d({
                    poolSize: [poolSize, poolSize],
                  }),
              );
            }
          }
        } else if (select == 'activation') {
          let activation = $('#' + id).find('#activation').first().val();
          if (serverSide) {
            Layers.splice(
                Layers.length - 1, 0, {
                  layer: 'activation',
                  activation: activation,
                },
            );
          } else {
            Layers.splice(
                Layers.length - 1, 0,
                tf.layers.activation({
                  activation: activation,
                }),
            );
          }
        } else if (select == 'conv2dTranspose') {
          let activation = $('#' + id).find('#activation').first().val();
          let kernelSize = Number(
              $('#' + id).find('#kernelSize').first().val(),
          );
          let filters = Number(
              $('#' + id).find('#filters').first().val(),
          );
          let kernelInitializer = $('#' + id).find('#kernelInitializer').first().val();
          let strides = $('#' + id).find('#strides').first().val();
          let padding = $('#' + id).find('#padding').first().val();
          let dataFormat = $('#' + id).find('#dataFormat').first().val();
          if (serverSide) {
            Layers.splice(
                Layers.length - 1, 0, {
                  layer: 'conv2dTranspose',
                  kernelSize: kernelSize,
                  filters: filters,
                  activation: activation,
                  padding: padding,
                  strides: Number(strides),
                  kernelInitializer: kernelInitializer,
                  dataFormat: dataFormat,
                },
            );
          } else {
            Layers.splice(
                Layers.length - 1, 0,
                tf.layers.conv2dTranspose({
                  kernelSize: kernelSize,
                  filters: filters,
                  activation: activation,
                  padding: padding,
                  strides: Number(strides),
                  kernelInitializer: kernelInitializer,
                  dataFormat: dataFormat,
                }),
            );
          }
        } else if (select == 'averagePooling2d') {
          let poolSize = Number(
              $('#' + id).find('#pool_size').first().val(),
          );
          let dataFormat = $('#' + id).find('#dataFormat').first().val();
          let strides = $('#' + id).find('#strides').first().val();
          let padding = $('#' + id).find('#padding').first().val();
          if (serverSide) {
            Layers.splice(
                Layers.length - 1, 0, {
                  layer: 'averagePooling2d',
                  poolSize: [poolSize, poolSize],
                  dataFormat: dataFormat,
                  strides: Number(strides),
                  padding: padding,
                },
            );
          } else {
            Layers.splice(
                Layers.length - 1, 0,
                tf.layers.averagePooling2d({
                  poolSize: [poolSize, poolSize],
                  dataFormat: dataFormat,
                  strides: Number(strides),
                  padding: padding,
                }),
            );
          }
        } else if (select == 'globalAveragePooling2d') {
          let dataFormat = $('#' + id).find('#dataFormat').first().val();
          if (serverSide) {
            Layers.splice(Layers.length - 1, 0, {
              layer: 'globalAveragePooling2d',
              dataFormat: dataFormat,
            });
          } else {
            Layers.splice(Layers.length - 1, 0, tf.layers.globalAveragePooling2d({dataFormat: dataFormat}));
          }
        } else if (select == 'globalMaxPooling2d') {
          let dataFormat = $('#' + id).find('#dataFormat').first().val();
          if (serverSide) {
            Layers.splice(Layers.length - 1, 0, {
              layer: 'globalMaxPooling2d',
              dataFormat: dataFormat,
            });
          } else {
            Layers.splice(Layers.length - 1, 0, tf.layers.globalMaxPooling2d({dataFormat: dataFormat}));
          }
        }
      }
    } catch (e) {
      console.log(e);
      showToast('alert-danger', e);
    }
  });
  // console.log(Layers);
}


Params.shuffle = true;
$('.shuffle').change(function() {
  if ($(this).is(':checked')) {
    Params.shuffle = true;
  } else {
    Params.shuffle = false;
  }
});


$('#userTrain').click(function() {
  $('#nextStepButton').hide(200);
  saveLayers();
  Params.epochs = $('#epochs').val();
  Params.batchSize = $('#batchSize').val();
  Params.optimizer = $('#optimizer option:selected').text();
  if (advancedMode) {
    Params.modelCompileLoss = $('#modelCompileLoss').val();
    Params.modelCompileMetrics = $('#modelCompileMetrics').val().trim().split(',');
  }
  try {
    if (serverSide) {
      $('#trainButtonText').hide(150);
      $('#trainingLoading').show(150);
      sendDatasetToServer();
    } else {
      run(Layers, Params);
    }
  } catch (error) {
    $('#loading').css('display', 'none');
    showToast('alert-danger', error);
  }
});

// (in case of server-side training) Send dataset to server
function sendDatasetToServer() {
  localforage.getItem('zipFile').then((zip)=>{
    let reader = new FileReader();
    reader.readAsDataURL(zip);
    reader.onload = function() {
      let result = reader.result;
      result = {file: result.substring(result.indexOf(',') + 1, result.length)};
      $.ajax({
        type: 'POST',
        url: '../../../workbench/uploadDataset',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(result),
        timeout: 600000,
        success: function(recData) {
          if (recData.status == 'DONE') {
            sendAndTrain(recData.userFolder);
          }
        },
        error: function(e) {
          console.log('ERROR : ', e.responseJSON.message);
          // alert(e.responseJSON.message);
          showToast('alert-danger', e.responseJSON.message, false);
          $('#trainButtonText').show(150);
          $('#trainingLoading').hide(150);
        },
      });
    };
  });
}

// (in case of server-side training) sending user customized model customization to server and training accordingly
function sendAndTrain(userFolder) {
  let Model = {};
  Model.Params = Params;
  Model.Layers = Layers;
  Model.userFolder = userFolder;
  $.ajax({
    type: 'POST',
    url: '../../../workbench/trainModel',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(Model),
    timeout: 600000,
    success: function(recData) {
      console.log(recData);
      $('#trainButtonText').show(150);
      $('#trainingLoading').hide(150);
      $('#trainedMessage').modal('show');
      // $('#nextStepButton').show(200);
      $('#modelDownloadButton').unbind('click').click(async function() {
        downloadModelFromServer(Model);
      });
      $('.trainedModelClose, .exitWorkbench').unbind('click').click(function() {
        deleteDataFromServer(userFolder);
      });
    },
    error: function(e) {
      console.log('ERROR : ', e.responseJSON.message);
      // alert(e.responseJSON.message);
      showToast('alert-danger', e.responseJSON.message, false);
      deleteDataFromServer(userFolder);
      $('#trainButtonText').show(150);
      $('#trainingLoading').hide(150);
    },
  });
}

// (in case of server-side training) getting the trained model files from server and saving them to user disk
function downloadModelFromServer(Model) {
  delete Model.Layers;
  $.ajax({
    type: 'POST',
    url: '../../../workbench/modelDownload',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(Model),
    timeout: 600000,
    success: function(recData) {
      console.log(recData);
      // window.open('../../..' + recData.url);
      fetch(recData.url).then((res) => res.blob()).then((blob) => {
        JSZip.loadAsync(blob).then(function(zip) {
          zip.file('model.json').async('blob').then((modelJSON) => {
            saveAs(modelJSON, Params.modelName + '.json');
          });
          zip.file('weights.bin').async('blob').then((weights) => {
            saveAs(weights, 'weights.bin');
          });
        });
      });
    },
    error: function(e) {
      alert(e);
      showToast('alert-danger', 'Error! ' + e);
    },
  });
}

// (in case of server-side training) deleting data (user folder) from server after training complete
function deleteDataFromServer(userFolder) {
  let data = {userFolder: userFolder};
  $.ajax({
    type: 'POST',
    url: '../../../workbench/deleteUserData',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    timeout: 600000,
    success: function(recData) {
      console.log(recData);
    },
    error: function(e) {
      console.log('ERROR : ', e);
      // alert(e);
    },
  });
}

// to check if user is allowed to perform server-side training
function checkForServerPermission() {
  let userType=getUserType();
  const store = new Store('../../../data/');
  store.getUserPermissions(userType).then((response) => response.text())
      .then((data) => {
        return data ? JSON.parse(data) : null;
      })
      .then((permissions) => {
        if (permissions === null) {
          return;
        }
        if (permissions.slide.post == false) { // because 'slide.post' is an editor+ level permission
          $('#serverSideToggle').prop('disabled', true);
          $('#serverSideToggle').prop('checked', false);
          $('#serverSideToggle').parent().prop('title', 'Permission not allowed');
          serverSide = false;
        }
      });
}


$('#exportOption').unbind('click').click(function() {
  exportWork();
});

function exportWork() {
  localforage.getItem('zipFile').then(function(datasetZip) {
    let prop = {step: 2};
    let serverSide1 = serverSide;
    serverSide = true;
    saveLayers();
    prop.Params = Params;
    prop.Layers = Layers;
    prop.Params.classes = $('#classNames').val();
    serverSide = serverSide1;
    prop.advancedMode = advancedMode;
    prop.serverSide = serverSide;
    Params.optimizer = $('#optimizer option:selected').text();
    prop.Params.epochs = $('#epochs').val();
    prop.Params.batchSize = $('#batchSize').val();
    if ($('#RGBorGrayscale').is(':checked')) {
      Params.rgb = true;
    } else {
      Params.rgb = false;
    }
    if (advancedMode) {
      Params.modelCompileLoss = $('#modelCompileLoss').val();
      Params.modelCompileMetrics = $('#modelCompileMetrics').val().trim().split(',');
    }
    let zip = new JSZip();
    console.log(prop);
    zip.file('dataset.zip', datasetZip);
    zip.file('prop.json', JSON.stringify(prop));
    zip.generateAsync({type: 'blob'}).then(function(blob) {
      saveAs(blob, 'userExport-Step2.zip');
    });
  });
}


$('#importOption').click(function() {
  importWork();
});

function importWork() {
  $('#importFile').click().unbind('change').change(function(evt) {
    let zipContents = [];
    JSZip.loadAsync(evt.target.files[0]).then(function(file) {
      file.forEach(function(relativePath, zipEntry) {
        zipContents.push(zipEntry.name);
      });
      return file;
    }).then(function(zip) {
      if (
        !zipContents.includes('dataset.zip') ||
        !zipContents.includes('prop.json') ||
        zipContents.length != 2
      ) {
        showToast('alert-danger', 'Invalid import zip file!', false);
      } else {
        zip.file('prop.json').async('string').then((prop) => {
          if (JSON.parse(prop).step == 2) {
            zip.file('dataset.zip').async('blob').then((dataset) => {
              dataset = new Blob([dataset], {type: 'application/zip'});
              localforage.setItem('zipFile', dataset).then(() => {
                localStorage.setItem('import', 'true');
                localforage.setItem('importProp', JSON.parse(prop));
                if (JSON.parse(prop).advancedMode) {
                  localStorage.setItem('advancedMode', 'true');
                } else {
                  localStorage.setItem('advancedMode', 'false');
                }
                if (JSON.parse(prop).serverSide) {
                  localStorage.setItem('serverSide', 'true');
                } else {
                  localStorage.setItem('serverSide', 'false');
                }
                location.reload();
              });
            });
          } else {
            showToast('alert-danger', 'Please select a file exported from STEP 2 only !');
          }
        });
      }
    }).catch(function(e) {
      console.log(e);
      showToast('alert-danger', 'Please Select a valid zip file');
    });
  });
}

// set user customized layer into the UI from imported file
function setLayersFromImport() {
  localforage.getItem('importProp').then(function(prop) {
    console.log(prop);
    $('#datasetNormalWidth').val(prop.Params.width);
    $('#datasetNormalHeight').val(prop.Params.height);
    $('#modelName').val(prop.Params.modelName);
    $('#classNames').val(prop.Params.classes);
    $('#trainDataSize').val(prop.Params.trainDataSize);
    $('#testDataSize').val(prop.Params.testDataSize);
    $('#testTrainRatio').val(($('#trainDataSize').val() / Number($('#numImages').text())).toFixed(2));
    $('#optimizer option').filter(function() {
      return ($(this).text() == prop.Params.optimizer);
    }).prop('selected', true);
    $('#kernelSize').val(prop.Layers[0].kernelSize);
    $('#batchSize').val(Number(prop.Params.batchSize));
    $('#epochs').val(Number(prop.Params.epochs));

    if (prop.Params.rgb) {
      $('#RGBorGrayscale').prop('checked', true);
    } else {
      $('#RGBorGrayscale').prop('checked', false);
    }
    if (prop.Params.shuffle) {
      $('.shuffle').prop('checked', true).change();
    } else {
      $('.shuffle').prop('checked', false).change();
    }
    $('#filters').val(prop.Layers[0].filters);
    if (advancedMode) {
      $('#inputPadding').val(prop.Layers[0].padding);
      $('#inputStride').val(prop.Layers[0].strides);
      $('#inputActivation').val(prop.Layers[0].activation);
      $('#inputKernelInitializer').val(prop.Layers[0].kernelInitializer);
      $('#outputActivation').val(prop.Layers[prop.Layers.length - 1].activation);
      $('#outputKernelInitializer').val(prop.Layers[prop.Layers.length - 1].kernelInitializer);
      $('#modelCompileLoss').val(prop.Params.modelCompileLoss);
      $('#modelCompileMetrics').val(prop.Params.modelCompileMetrics.join());
    }

    for (let i = 1; i < prop.Layers.length - 1; i++) {
      $('#add' + i).click();
    }
    $('#add1').mouseleave();

    $('#initSettingsSubmit').submit(function() {
      let i = 1;
      $('.LayerCard').each(function() {
        let id = $(this).attr('id');
        if (id != 'inputLayer' && id != 'outputLayer') {
          if (prop.Layers[i].layer == 'dense') {
            $('#' + id + ' .modelClassSelect').val(1).change();
          } else if (prop.Layers[i].layer == 'conv2d') {
            $('#' + id + ' .modelClassSelect').val(2).change();
          } else if (prop.Layers[i].layer == 'flatten') {
            $('#' + id + ' .modelClassSelect').val(3).change();
          } else if (prop.Layers[i].layer == 'batchNormalization') {
            $('#' + id + ' .modelClassSelect').val(6).change();
          } else if (prop.Layers[i].layer == 'dropout') {
            $('#' + id + ' .modelClassSelect').val(4).change();
          } else if (prop.Layers[i].layer == 'maxpooling2d') {
            $('#' + id + ' .modelClassSelect').val(5).change();
          } else if (prop.Layers[i].layer == 'activation') {
            $('#' + id + ' .modelClassSelect').val(7).change();
          } else if (prop.Layers[i].layer == 'conv2dTranspose') {
            $('#' + id + ' .modelClassSelect').val(8).change();
          } else if (prop.Layers[i].layer == 'averagePooling2d') {
            $('#' + id + ' .modelClassSelect').val(9).change();
          } else if (prop.Layers[i].layer == 'globalAveragePooling2d') {
            $('#' + id + ' .modelClassSelect').val(10).change();
          } else if (prop.Layers[i].layer == 'globalMaxPooling2d') {
            $('#' + id + ' .modelClassSelect').val(11).change();
          }
          delete prop.Layers[i].layer;
          for (let param in prop.Layers[i]) {
            if (prop.Layers[i].hasOwnProperty(param)) {
              $('#' + id + ' #' + param).val(prop.Layers[i][param]);
              $('#' + id + ' #' + param).next('label').addClass('active');
            }
          }
          i++;
        }
      });
    });
  });
  localStorage.removeItem('import');
  showToast('alert-info', 'Import Successful !');
}

$('.exitWorkbench').click(function() {
  localforage.clear();
  window.open('../../table.html', '_self');
});

// getting markdown from readme.md and parsing/displaying it as user-guide
$('.helpButton').click(function() {
  fetch('../readme.md').then((res) => res.blob()).then((blob) => {
    let f = new FileReader();
    f.onload = function(e) {
      $('#helpModal .modal-body').html(marked(e.target.result));
      $('#helpModal .modal-body td, #helpModal .modal-body th')
          .css('border', '2px solid #dddddd').css('padding', '5px');
    };
    f.readAsText(blob);
  });
});

function resetLayers() {
  $('.add').each(function() {
    if ($(this).next().attr('id') != 'outputLayer') {
      $(this).next().remove();
    }
  });
  $('.add').each(function() {
    if ($(this).attr('id') != 'add1') {
      $(this).remove();
    }
  });
}

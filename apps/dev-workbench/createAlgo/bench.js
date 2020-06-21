$(document).ready(function() {
  getZipFile();
  $('#headContent').show(400);
  $('#headbar').animate({height: 95}, 500, function() {
    $('#headbar').css('height', '100%');
  });
});

$('#goBack').click(function() {
  // window.open('../table.html', '_self');
  window.history.back();
});

function getZipFile() {
  let zip = sessionStorage.getItem('zipFile');
  let blob = b64toBlob(zip, 'application/zip');
  JSZip.loadAsync(blob).then(function(zip) {
    zip.forEach(function(relativePath, zipEntry) {
      console.log(zipEntry.name);
    });
  });
}

function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


let layerNumber = 1;

$('body').on('click', '#add' + 1, function() {
  // $("#add" + 1).click(function() {
  let newLayerCard =
    ` <div class='card LayerCard' id='Layer${layerNumber}'><!-- Card header --><div class='card-header' role='tab' id='headingOne${layerNumber + 1}'><a  class='collapsed'  data-toggle='collapse'    data-parent='#accordionEx'    href='#collapseOne${layerNumber + 1}'    aria-expanded='false'    aria-controls='collapseOne${layerNumber + 1}'  >    <h5 class='mb-0'> Layer #${layerNumber}<i        class='fas fa-angle-down rotate-icon'        style='position: absolute; right:0.8em'      ></i>    </h5>  </a></div><!-- Card body --><div  id='collapseOne${layerNumber + 1}'  class='collapse'  role='tabpanel'  aria-labelledby='headingOne${layerNumber + 1}'  data-parent='#accordionEx'>  <div class='card-body'> <div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <select    class='browser-default custom-select modelClassSelect'       style='width: 9em; margin:0 auto; margin-bottom: 2em '  >    <option value='1' selected>Dense</option>    <option value='2'>Conv2D </option>    <option value='3'>Flatten</option>    <option value='4'>Dropout</option>    <option value='5'>MaxPooling2D</option> </select  >&nbsp;&nbsp; &nbsp;&nbsp;  <div    class='md-form'    style='margin: 0 auto; width: 9em; display:none'  >    <input      type='text'      id='inputShape'      class='form-control'      disabled          />    <label for='inputShape'>inputShape:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 7em; display:none'  >    <input      type='number'      id='kernelSize'      class='form-control'         />    <label for='kernelSize'>kernelSize:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 5em; display:none'  >    <input      type='number'      id='filters'      class='form-control'          />    <label for='filters'>filters:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 8em; '>    <input      type='text'      id='activation'      class='form-control'          />    <label for='activation'>activation:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 6em;'>    <input      type='number'      id='units'      class='form-control'         />    <label for='units'>units:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      id='pool_size'      class='form-control'          />    <label for='pool_size'>pool_size:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      max='1'      min='0'      step='0.01'      id='rate'      class='form-control'    />    <label for='rate'>rate:</label>  </div></div><br /><div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <button    type='button'    class='btn btn-danger '    style='margin: 0 auto; ' id='deleteLayer' >    Delete  </button>  </div></div></div></div><div class='card add' id='add${layerNumber + 1}' style='width: 25em; height: 2em' title='Add layer'><h4>+</h4></div>`;

  $('#add' + 1).after(newLayerCard);
  $('#headingOne' + (layerNumber + 1)).css('height', '0');
  $('#headingOne' + (layerNumber + 1))
      .after()
      .animate({height: '3em'}, 400);
  layerNumber++;
  let j = 1;
  $('.layersClass')
      .children('.card')
      .each(function() {
      // console.log($(this).html());
        if (
          $(this).attr('id') != 'inputLayer' &&
        $(this).attr('id') != 'outputLayer'
        ) {
          $(this)
              .first()
              .children()
              .first()
              .children()
              .first()
              .children()
              .first()
              .each(function() {
                $(this).html(
                    'Layer #' +
                j +
                '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                );
                j++;
                // console.log($(this).html());
              });
        }
      });
  addFuncLayers();

  addCardLayer();
});
function addCardLayer() {
  let i = layerNumber;
  $('body').on('click', '#add' + layerNumber, function() {
    let newLayerCard =
      ` <div class='card LayerCard' id='Layer${layerNumber}'><!-- Card header --><div class='card-header' role='tab' id='headingOne${layerNumber + 1}'><a    data-toggle='collapse'    data-parent='#accordionEx'    href='#collapseOne${layerNumber + 1}'    aria-expanded='false'    aria-controls='collapseOne${layerNumber + 1}'  >    <h5 class='mb-0'> Layer #${layerNumber}<i        class='fas fa-angle-down rotate-icon'        style='position: absolute; right:0.8em'      ></i>    </h5>  </a></div><!-- Card body --><div  id='collapseOne${layerNumber + 1}'  class='collapse'  role='tabpanel'  aria-labelledby='headingOne${layerNumber + 1}'  data-parent='#accordionEx'>  <div class='card-body'> <div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <select    class='browser-default custom-select modelClassSelect'       style='width: 9em; margin:0 auto; margin-bottom: 2em '  >    <option value='1' selected>Dense</option>    <option value='2'>Conv2D </option>    <option value='3'>Flatten</option>    <option value='4'>Dropout</option>    <option value='5'>MaxPooling2D</option> </select  >&nbsp;&nbsp; &nbsp;&nbsp;  <div    class='md-form'    style='margin: 0 auto; width: 9em; display:none'  >    <input      type='text'      id='inputShape'      class='form-control'      disabled          />    <label for='inputShape'>inputShape:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 7em; display:none'  >    <input      type='number'      id='kernelSize'      class='form-control'         />    <label for='kernelSize'>kernelSize:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 5em; display:none'  >    <input      type='number'      id='filters'      class='form-control'          />    <label for='filters'>filters:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 8em; '>    <input      type='text'      id='activation'      class='form-control'          />    <label for='activation'>activation:</label>  </div>  <div class='md-form' style='margin: 0 auto; width: 6em;'>    <input      type='number'      id='units'      class='form-control'         />    <label for='units'>units:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      id='pool_size'      class='form-control'          />    <label for='pool_size'>pool_size:</label>  </div>  <div    class='md-form'    style='margin: 0 auto; width: 6em; display:none'  >    <input      type='number'      max='1'      min='0'      step='0.01'      id='rate'      class='form-control'    />    <label for='rate'>rate:</label>  </div></div><br /><div  style='display: flex; flex-wrap:wrap; align-content:center; max-width: 21em'>  <button    type='button'    class='btn btn-danger '    style='margin: 0 auto; ' id='deleteLayer' >    Delete  </button>  </div></div></div></div><div class='card add' id='add${layerNumber + 1}' style='width: 25em; height: 2em' title='Add layer'><h4>+</h4></div>`;

    $('#add' + i).after(newLayerCard);
    $('#headingOne' + (layerNumber + 1)).css('height', '0');
    $('#headingOne' + (layerNumber + 1))
        .after()
        .animate({height: '3em'}, 400);
    layerNumber++;
    renameCorrectLayers();
    addCardLayer();
  });
}
function renameCorrectLayers() {
  let j = 1;
  $('.layersClass')
      .children('.card')
      .each(function() {
      // console.log($(this).html());
        if (
          $(this).attr('id') != 'inputLayer' &&
        $(this).attr('id') != 'outputLayer'
        ) {
          $(this)
              .first()
              .children()
              .first()
              .children()
              .first()
              .children()
              .first()
              .each(function() {
                $(this).html(
                    'Layer #' +
                j +
                '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                );
                j++;
                // console.log($(this).html());
              });
        }
      });
  addFuncLayers();
}

function addFuncLayers() {
  $('.LayerCard').each(function() {
    let id = $(this).attr('id');
    // console.log(id);
    $('#' + id)
        .find('.modelClassSelect')
        .first()
        .change(function() {
        // console.log(1);
          if ($(this).val() == 1) {
            $('#' + id)
                .find('#inputShape, #kernelSize, #filters, #pool_size, #rate')
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#activation, #units')
                .parent()
                .css('display', 'block');
          } else if ($(this).val() == 2) {
            $('#' + id)
                .find('#inputShape, #units, #pool_size, #rate')
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#kernelSize, #filters, #activation')
                .parent()
                .css('display', 'block');
          } else if ($(this).val() == 3) {
            $('#' + id)
                .find('#inputShape, #units, #pool_size, #rate, #kernelSize, #filters, #activation')
                .parent()
                .css('display', 'none');
          } else if ($(this).val() == 4) {
            $('#' + id)
                .find('#inputShape, #units, #pool_size, #kernelSize, #filters, #activation')
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#rate')
                .parent()
                .css('display', 'block');
          } else {
            $('#' + id)
                .find('#inputShape, #units, #rate, #kernelSize, #filters, #activation')
                .parent()
                .css('display', 'none');
            $('#' + id)
                .find('#pool_size')
                .parent()
                .css('display', 'block');
          }
        });
    $('#' + id)
        .find('#deleteLayer')
        .first()
        .click(function() {
          $('#' + id)
              .next()
              .remove();

          $('#' + id).remove();
          let j = 1;
          $('.layersClass')
              .children('.card')
              .each(function() {
                // console.log($(this).html());
                if (
                  $(this).attr('id') != 'inputLayer' &&
              $(this).attr('id') != 'outputLayer'
                ) {
                  $(this)
                      .first()
                      .children()
                      .first()
                      .children()
                      .first()
                      .children()
                      .first()
                      .each(function() {
                        $(this).html(
                            'Layer #' +
                      j +
                      '<i class=\'fas fa-angle-down rotate-icon\' style=\'position: absolute; right:0.8em\'></i>',
                        );
                        j++;
                        // console.log($(this).html());
                      });
                }
              });
        });
  });
}

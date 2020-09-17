$(document).ready(function() {
  $('#headContent').show(180);
  $('#headSub').show(200);
  $('#stepper').show(400);
});

$('#goBack').click(function() {
  window.history.back();
});

// initialize Step 1
function dataSelect() {
  $('.navbar-brand').text(' Workbench - Step 1');
  $('#stepper').hide(300);
  $('#headContent').hide(300).text('Select or create your own dataset').show(180);
  $('#headSub').hide(200);
  $('#headContent').show(180);
  $('#cards').show(200);
  $('#goBack').unbind('click').click(function() {
    location.reload();
  });
}

// validating the uploaded dataset zip
function checkDataset(evt) {
  let zipContents = [];
  let zipFile = evt.target.files;
  // console.log(file);
  return new Promise(function(resolve, reject) {
    JSZip.loadAsync(zipFile[0])
        .then(function(zip) {
          zip.forEach(function(relativePath, zipEntry) {
            zipContents.push(zipEntry.name);
          });
        })
        .then(function() {
        // console.log(zipContents);
          if (
            !zipContents.includes('data.jpg') ||
          !zipContents.includes('labelnames.csv') ||
          !zipContents.includes('labels.bin') ||
          zipContents.length != 3
          ) {
            return false;
          } else {
            return true;
          }
        })
        .then(function(val) {
          resolve(val);
        })
        .catch(function(e) {
          console.log(e);
          // alert('Please select a valid zip file');
          showToast('alert-danger', 'Please Select a valid zip file');
        });
  });
}

$('#spriteInput').change(function(evt) {
  checkDataset(evt).then(function(val) {
    if (val) {
      $('#cards').hide(150);
      $('#stepper').show(200);
      $('#headContent').text('Dataset selected successfully');
      $('#headSub').text('You can proceed to step 2');
      $('#headContent, #headSub').show(400);
      $('.firstStepHead').attr('class', 'firstStepHead done');
      $('.done span.circle').css('background-color', 'green');
      $('.secondStepHead').attr('class', 'secondStepHead active');
      $('#firstStepButton').hide();
      $('#secondStepButton').show();
      $('#exportOption').show().unbind('click').click(function() {
        exportWork();
      });
      $('.navbar-brand').text(' Workbench');
      $('#step1Link').click(function() {
        dataSelect();
      });
      let zipFile = evt.target.files[0];
      localforage.setItem('zipFile', zipFile);
    } else {
      showToast('alert-danger',
          '<b>Invalid zip file !!!</b> Please Select a valid zip file',
      );
      // alert('Invalid zip file!!');
    }
  });
});

$('.labelsInputGroup').change(function(evt) {
  let fileNames = $.map($('#labelsInput').prop('files'), function(val) {
    return val.name;
  });
  if (fileNames.length == 1) $('.labelsInputLabel').text(fileNames[0]);
  else if (fileNames.length > 1) {
    $('.labelsInputLabel').text(fileNames.length + ' files selected');
  }
});

// resetting the dataset creator modal
function resetLabelsModal(custom = false) {
  $('#labelsSubmitButton').prop('disabled', false);
  if (custom) {
    $('#labelSelectModalTitle').text('Select custom dataset file');
    $('#step1Desc')
        .text(`Browse your dataset file (.zip) in which every folder should be 
                          label name and should contain images accordingly inside.`);
    $('#labelsInput').removeAttr('multiple');
  } else {
    $('#labelSelectModalTitle').text('Select caMircoscope labelling files');
    $('#step1Desc').text(
        'Browse your labelling files(.zip) created by the caMicroscope labelling tool.',
    );
    $('#labelsInput').attr('multiple', 'multiple');
  }
  $('#labelsSubmitText').show();
  $('#labelsSubmitLoading').hide();
  $('.labelsInputGroup').show();
  $('#labelsFilterList').text('');
  $('#filterLabels, #labelsDatasetZip, #labelsSubmitFinish').hide();
  $('#labelsUploadForm').unbind('submit').trigger('reset');
  $('#selectResolution').hide();

  $('#labelsUploadForm').on('submit', function() {
    $('#labelsSubmitButton').prop('disabled', true);
    $('#labelsSubmitText').hide(200);
    $('#labelsSubmitLoading').show(200);

    let files = $('#labelsInput').prop('files');
    let fileNames = $.map($('#labelsInput').prop('files'), function(val) {
      return val.name;
    });
    if (custom) {
      customDataToLoader(files[0], fileNames[0]);
    } else {
      sendToLoader(files, fileNames, custom);
    }
  });
}

function displayLabels(data, names, custom = false) {
  $('#labelSelectModalTitle').text('Filter your labels');
  $('.labelsInputGroup').hide(180);
  $('#labelsFilterList').text('');
  for (let i = 0; i < data.labels.length; i++) {
    $('#labelsFilterList').append(
        ` <li class="list-group-item d-flex justify-content-between align-items-center" >
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="labelCheck${i}" checked /> <label class="custom-control-label" for="labelCheck${i}" >
        ${sanitize(data.labels[i].toString())}
        </label>
      </div>
      <span class="badge badge-primary badge-pill">
        ${sanitize(data.counts[i].toString())}
      </span>
    </li>`,
    );
  }
  $('#filterLabels').show(200);
  selectLabels(data.labels, data.userFolder, names, custom);
}

function selectLabels(labels, userFolder, names, custom = false) {
  let selected = [];
  $('#labelsUploadForm').unbind('submit').on('submit', function() {
    $('#labelsSubmitButton').prop('disabled', true);
    $('#labelsSubmitText').hide(200);
    $('#labelsSubmitLoading').show(200);
    selected = [];
    $('#labelsFilterList')
        .find('input')
        .each(function() {
          selected.push($(this).is(':checked'));
        });
    let data = {
      labels: labels,
      included: selected,
      userFolder: userFolder,
      fileNames: names,
      height: 60,
      width: 60,
    };
    $('#labelsSubmitButton').prop('disabled', false);
    $('#labelsSubmitLoading').hide(200);
    $('#filterLabels').hide(150);
    $('#selectResolution, #labelsSubmitText').show(200);
    $('#labelSelectModalTitle').text('Select resolution');
    selectResolution(data, userFolder, custom);
  });
}

function selectResolution(data, userFolder, custom = false) {
  $('#labelsUploadForm').unbind('submit').on('submit', function() {
    $('#labelsSubmitButton').prop('disabled', true);
    $('#labelsSubmitText').hide(200);
    $('#labelsSubmitLoading').show(200);
    data.height = $('#datasetNormalHeight').val();
    data.width = $('#datasetNormalWidth').val();
    getSprite(data, userFolder, custom);
  });
}

// Getting spritesheet/dataset from slideloader
function getSprite(data, userFolder, custom) {
  let url = '../../loader/workbench/generateSprite';
  if (custom) {
    url = '../../loader/workbench/generateCustomSprite';
  }
  console.log(data);
  $.ajax({
    type: 'POST',
    url: url,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(done) {
      console.log(done);
      $('#labelsSubmitButton').prop('disabled', false);
      $('#labelsSubmitFinish').show(200);
      $('#labelsSubmitLoading, #selectResolution').hide(200);
      $('#labelsDatasetZip').show(200);
      $('#labelSelectModalTitle').text('Dataset created successfully');
      $('#datasetDownloadButton').click(function() {
        window.open('../../loader' + done.download);
      });
      cleanBackend(userFolder);
    },
    error: function(e) {
      console.log('ERROR : ', e['responseJSON']['error']);
      // alert(e['responseJSON']['error']);
      showToast('alert-danger', e['responseJSON']['error']);
      $('#labelsSubmitLoading').hide(200);
      $('#labelsSubmitText').show(200);
    },
  });
}

// Clean user folder on backend after dataset creation
function cleanBackend(userFolder) {
  $('#labelsUploadForm').unbind('submit').on('submit', function() {
    $.ajax({
      type: 'POST',
      url: '../../loader/workbench/deleteDataset/' + userFolder,
      success: function() {
        $('#labelsUploadModal').modal('hide');
        resetLabelsModal();
      },
      error: function(e) {
        console.log('ERROR : ', e);
        resetLabelsModal();
        // $('#labelsUploadModal').modal('hide');
        // alert('Error');
      },
    });
  });
}

function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    // eslint-disable-next-line quotes
    "'": '&#x27;',
    // eslint-disable-next-line quotes
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
}

// Sending caM Labels data to slideloader for dataset/spritesheet creation
function sendToLoader(files, names, custom = false) {
  let Promises = [];
  let data = {files: [], fileNames: names};

  // convert a file/blob to base64 string
  function getBase64(file) {
    Promises.push(
        new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function() {
            let result = reader.result;
            result = result.substring(result.indexOf(',') + 1, result.length);
            data.files.push(result);
            resolve('done');
          };
          reader.onerror = function(error) {
            console.log('Error: ', error);
          };
        }),
    );
  }
  for (i = 0; i < files.length; i++) getBase64(files[i]);
  Promise.all(Promises).then(() => {
    console.log(data);
    let url = '../../loader/workbench/getLabelsZips';
    $.ajax({
      type: 'POST',
      url: url,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      timeout: 600000,
      success: function(data) {
        console.log(data);
        $('#labelsSubmitButton').prop('disabled', false);
        $('#labelsSubmitText').show(200);
        $('#labelsSubmitLoading').hide(200);
        displayLabels(data, names, custom);
      },
      error: function(e) {
        console.log('ERROR : ', e['responseJSON']['error']);
        // alert(e['responseJSON']['error']);
        showToast('alert-danger', e['responseJSON']['error']);
        $('#labelsSubmitButton').prop('disabled', false);
        $('#labelsSubmitText').show(200);
        $('#labelsSubmitLoading').hide(200);
      },
    });
  });
}

// Send custom data to slideLoader in chunks for dataset creation
async function customDataToLoader(file, name, chunkSize = 1024 * 1024 * 10) {
  // console.log(file.size);
  let offset = 0;
  function makeUserFolderName(length) { // generate random folder name for user
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  let userFolder = makeUserFolderName(20);
  for (i = 0; i < file.size; i += chunkSize) {
    let end = offset + chunkSize;
    let final = 'false';
    if (end >= file.size) {
      end = file.size;
      final = 'true';
    }
    let splitFile = file.slice(offset, end);
    let data = {fileName: name, offset: offset, final: final, userFolder: userFolder};
    await sendSplitFile(splitFile, data);
    offset += chunkSize;
  }
}

// send splitted files data to slideloader (for custom data)
function sendSplitFile(file, data) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      let result = reader.result;
      result = result.substring(result.indexOf(',') + 1, result.length);
      data.file = result;
      let url = '../../loader/workbench/getCustomData';
      $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        timeout: 600000,
        success: function(recData) {
          resolve();
          if (data.final == 'true') {
            console.log(recData);
            $('#labelsSubmitButton').prop('disabled', false);
            $('#labelsSubmitText').show(200);
            $('#labelsSubmitLoading').hide(200);
            displayLabels(recData, [data.fileName], true);
          }
        },
        error: function(e) {
          resolve();
          console.log('ERROR : ', e['responseJSON']['error']);
          // alert(e['responseJSON']['error']);
          showToast('alert-danger', e['responseJSON']['error']);
          $('#labelsSubmitButton').prop('disabled', false);
          $('#labelsSubmitText').show(200);
          $('#labelsSubmitLoading').hide(200);
        },
      });
    };
    reader.onerror = function(error) {
      console.log('Error: ', error);
    };
  });
}

function showToast(type, message, dismissible = true) {
  $('#toastPlaceholder').css('display', 'flex');
  $('#toastAlert').removeClass('alert-success alert-danger alert-info');
  $('#toastContent').html(message);
  $('#toastAlert').addClass(type + ' show');
  if (dismissible) {
    setTimeout(function() {
      $('#toastAlert').removeClass('show');
      $('#toastPlaceholder').hide();
    }, 5000);
  }
}


function exportWork() {
  localforage.getItem('zipFile').then(function(datasetZip) {
    let prop = JSON.stringify({step: 1});
    let zip = new JSZip();
    zip.file('dataset.zip', datasetZip);
    zip.file('prop.json', prop);
    zip.generateAsync({type: 'blob'}).then(function(blob) {
      saveAs(blob, 'userExport-Step1.zip');
    });
  });
}


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
        zip.file('prop.json').async('string').then((file) => {
          if (JSON.parse(file).step == 1) {
            zip.file('dataset.zip').async('blob').then((dataset) => {
              localforage.setItem('zipFile', dataset);
              $('#headContent').text('Dataset selected successfully');
              $('#headSub').text('You can proceed to step 2');
              $('.firstStepHead').attr('class', 'firstStepHead done');
              $('.done span.circle').css('background-color', 'green');
              $('.secondStepHead').attr('class', 'secondStepHead active');
              $('#firstStepButton').hide();
              $('#secondStepButton').show();
              showToast('alert-info', 'Import Successful !');
              $('#exportOption').show().unbind('click').click(function() {
                exportWork();
              });
              $('.navbar-brand').text(' Workbench');
              $('#step1Link').click(function() {
                dataSelect();
              });
            });
          }
          if (JSON.parse(file).step == 2) {
            zip.file('dataset.zip').async('blob').then((dataset) => {
              localforage.setItem('zipFile', dataset).then(() => {
                localStorage.setItem('import', 'true');
                localforage.setItem('importProp', JSON.parse(file));
                if (JSON.parse(file).advancedMode) {
                  localStorage.setItem('advancedMode', 'true');
                } else {
                  localStorage.setItem('advancedMode', 'false');
                }
                if (JSON.parse(file).serverSide) {
                  localStorage.setItem('serverSide', 'true');
                } else {
                  localStorage.setItem('serverSide', 'false');
                }

                // go to step 2
                window.open('./createAlgo/bench.html', '_self');
              });
            });
          }
        });
      }
    }).catch(function(e) {
      console.log(e);
      showToast('alert-danger', 'Please Select a valid zip file');
    });
  });
}

// getting markdown from readme.md and parsing/displaying it as user-guide
$('.helpButton').click(function() {
  fetch('./readme.md').then((res) => res.blob()).then((blob) => {
    let f = new FileReader();
    f.onload = function(e) {
      $('#helpModal .modal-body').html(marked(e.target.result));
      $('#helpModal .modal-body td, #helpModal .modal-body th')
          .css('border', '2px solid #dddddd').css('padding', '5px');
    };
    f.readAsText(blob);
  });
});

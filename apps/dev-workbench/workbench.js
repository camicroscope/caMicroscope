$(document).ready(function() {
  $('#headContent').show(180);
  $('#headSub').show(200);
  $('#stepper').show(400);
});

$('#goBack').click(function() {
  // window.open('../table.html', '_self');
  window.history.back();
});

function dataSelect() {
  $('.navbar-brand').text(' Workbench - Step 1');
  $('#stepper').hide(300);
  $('#headContent').hide(300);
  $('#headContent').text('Select or create your own dataset');
  $('#headContent').show(180);
  $('#headSub').hide(200);
  // $('#headContent').text('Select or create your dataset');
  $('#headContent').show(180);
  $('#cards').show(200);
  $('#goBack').unbind('click');
  $('#goBack').click(function() {
    location.reload();
  });
}

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
          $('#toastAlert').removeClass('alert-success alert-danger alert-info');
          $('#toastContent').text('Please Select a valid zip file');
          $('#toastAlert').addClass('alert-danger show');
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
      $('#headContent').show(400);
      $('#headSub').show(400);
      $('.firstStepHead').attr('class', 'firstStepHead done');
      $('.done span.circle').css('background-color', 'green');
      $('.secondStepHead').attr('class', 'secondStepHead active');
      $('#firstStepButton').hide();
      $('#secondStepButton').show();
      $('.navbar-brand').text(' Workbench');
      $('#step1Link').click(function() {
        dataSelect();
      });
      let zipFile = evt.target.files[0];
      localforage.setItem('zipFile', zipFile);
    } else {
      $('#toastAlert').removeClass('alert-success alert-danger alert-info');
      $('#toastContent').html('<b>Invalid zip file !!!</b> Please Select a valid zip file');
      $('#toastAlert').addClass('alert-danger show');
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
  $('#filterLabels').hide();
  $('#labelsDatasetZip').hide();
  $('#labelsSubmitFinish').hide();
  $('#labelsUploadForm').unbind('submit');
  $('#labelsUploadForm').trigger('reset');

  $('#labelsUploadForm').on('submit', function() {
    $('#labelsSubmitButton').prop('disabled', true);
    $('#labelsSubmitText').hide(200);
    $('#labelsSubmitLoading').show(200);

    let files = $('#labelsInput').prop('files');
    let fileNames = $.map($('#labelsInput').prop('files'), function(val) {
      return val.name;
    });
    sendToLoader(files, fileNames, custom);
  });
}

function displayLabels(data, names, custom = false) {
  $('#labelSelectModalTitle').text('Filter your labels');
  $('.labelsInputGroup').hide(180);
  $('#labelsFilterList').text('');
  for (let i = 0; i < data.labels.length; i++) {
    $('#labelsFilterList').append(
        ` <li
      class="list-group-item d-flex justify-content-between align-items-center" >
      <div class="custom-control custom-checkbox">
        <input
          type="checkbox"
          class="custom-control-input"
          id="labelCheck` +
        i +
        `" checked /> <label class="custom-control-label" for="labelCheck` +
        i +
        `" >` +
        sanitize(data.labels[i].toString()) +
        `</label>
      </div>
      <span class="badge badge-primary badge-pill">` +
        sanitize(data.counts[i].toString()) +
        `</span>
    </li>`,
    );
  }
  $('#filterLabels').show(200);
  selectLabels(data.labels, data.userFolder, names, custom);
}

function selectLabels(labels, userFolder, names, custom = false) {
  let selected = [];
  $('#labelsUploadForm').unbind('submit');
  $('#labelsUploadForm').on('submit', function() {
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
    $('#selectResolution').show(200);
    $('#labelsSubmitText').show(200);
    $('#labelSelectModalTitle').text('Select resolution');
    selectResolution(data, userFolder, custom);
  });
}

function selectResolution(data, userFolder, custom = false) {
  $('#labelsUploadForm').unbind('submit');
  $('#labelsUploadForm').on('submit', function() {
    $('#labelsSubmitButton').prop('disabled', true);
    $('#labelsSubmitText').hide(200);
    $('#labelsSubmitLoading').show(200);
    data.height = $('#datasetNormalHeight').val();
    data.width = $('#datasetNormalWidth').val();
    getSprite(data, userFolder, custom);
  });
}

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
      $('#labelsSubmitLoading').hide(200);
      $('#selectResolution').hide(200);
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
      $('#toastAlert').removeClass('alert-success alert-danger alert-info');
      $('#toastContent').text(e['responseJSON']['error']);
      $('#toastAlert').addClass('alert-danger show');
      $('#labelsSubmitLoading').hide(200);
      $('#labelsSubmitText').show(200);
    },
  });
}

function cleanBackend(userFolder) {
  $('#labelsUploadForm').unbind('submit');
  $('#labelsUploadForm').on('submit', function() {
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
        alert('Error');
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

function sendToLoader(files, names, custom = false) {
  if (custom) {
    customDataToLoader(files[0], names[0]);
    return;
  }
  let Promises = [];
  let data = {files: [], fileNames: names};
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
        $('#toastAlert').removeClass('alert-success alert-danger alert-info');
        $('#toastContent').text(e['responseJSON']['error']);
        $('#toastAlert').addClass('alert-danger show');
        $('#labelsSubmitButton').prop('disabled', false);
        $('#labelsSubmitText').show(200);
        $('#labelsSubmitLoading').hide(200);
      },
    });
  });
}


async function customDataToLoader(file, name, chunkSize = 1024 * 1024 * 10) {
  // console.log(file.size);
  let offset = 0;
  function makeUserFolderName(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
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
          $('#toastAlert').removeClass('alert-success alert-danger alert-info');
          $('#toastContent').text(e['responseJSON']['error']);
          $('#toastAlert').addClass('alert-danger show');
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

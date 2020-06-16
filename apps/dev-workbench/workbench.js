function dataSelect() {
  $('#stepper').hide(300);
  $('#headContent').hide(300);
  $('#headContent').text('Select or create your own dataset');
  $('#headContent').show(180);
  $('#headSub').hide(200);
  // $('#headContent').text('Select or create your dataset');
  $('#headContent').show(180);
  $('#cards').show(200);
}

$('#spriteInput').change(function() {
  $('#cards').hide(150);
  $('#stepper').show(200);
  $('#headContent').text(' Welcome to <b>Development Workbench</b>');
  $('#headContent').show(400);
  $('#headSub').show(400);
  $('.firstStepHead').attr('class', 'firstStepHead done');
  $('.done span.circle').css('background-color', 'green');
  $('.secondStepHead').attr('class', 'secondStepHead active');
  $('#firstStepButton').hide();
  $('#secondStepButton').show();
});

$('.labelsInputGroup').change(function(evt) {
  let fileNames = $.map($('#labelsInput').prop('files'), function(val) {
    return val.name;
  });
  if (fileNames.length == 1) $('.labelsInputLabel').text('File selected');
  else if (fileNames.length > 1) {
    $('.labelsInputLabel').text(fileNames.length + ' files selected');
  }
  // function handleFile(f) {
  //   let title = f.name;
  //   // console.log(title);
  //   JSZip.loadAsync(f).then(function(zip) {
  //     zip.forEach(function(relativePath, zipEntry) {
  //       // console.log(zipEntry.name);
  //     });
  //   });
  // }
  // let files = evt.target.files;
  // console.log(files);
  // $.ajax({
  //   method: 'POST',
  //   url: '../../workbench/getLabelsZips',
  //   data: files,
  //   dataType: 'zip',
  //   processData: false,
  //   success: function(response) {
  //     console.log(response);
  //   },
  // });
  // for (var i = 0; i < files.length; i++) {
  //   handleFile(files[i]);
  // }
});
function resetLabelsModel() {
  $('#labelsSubmitButton').prop('disabled', false);
  $('#labelSelectModalTitle').text('Select your labels');
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
    sendToLoader(files, fileNames);
  });
}

function displayLabels(data, names) {
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
  selectLabels(data.labels, data.userFolder, names);
}

function selectLabels(labels, userFolder, names) {
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
    };
    $.ajax({
      type: 'POST',
      url: '../../loader/workbench/generateSprite',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(done) {
        console.log(done);
        $('#labelsSubmitButton').prop('disabled', false);
        $('#labelsSubmitFinish').show(200);
        $('#labelsSubmitLoading').hide(200);
        $('#filterLabels').hide(150);
        $('#labelsDatasetZip').show(200);
        $('#labelSelectModalTitle').text('Dataset created successfully');
        window.open('../../loader/' + done.download);
        cleanBackend(userFolder);
      },
      error: function(e) {
        console.log('ERROR : ', e['responseJSON']['error']);
        alert(e['responseJSON']['error']);
        $('#labelsSubmitLoading').hide(200);
        $('#labelsSubmitText').show(200);
      },
    });
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
        resetLabelsModel();
      },
      error: function(e) {
        console.log('ERROR : ', e);
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

function sendToLoader(files, names) {
  let Promises = [];
  let data = {files: [], fileNames: names};
  function getBase64(file) {
    Promises.push(
        new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function() {
            let result = reader.result;
            result = result.substr(28, result.length - 28);
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
    $.ajax({
      type: 'POST',
      url: '../../loader/workbench/getLabelsZips',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      timeout: 600000,
      success: function(data) {
        console.log(data);
        $('#labelsSubmitButton').prop('disabled', false);
        $('#labelsSubmitText').show(200);
        $('#labelsSubmitLoading').hide(200);
        displayLabels(data, names);
      },
      error: function(e) {
        console.log('ERROR : ', e['responseJSON']['error']);
        alert(e['responseJSON']['error']);
        $('#labelsSubmitButton').prop('disabled', false);
        $('#labelsSubmitText').show(200);
        $('#labelsSubmitLoading').hide(200);
      },
    });
  });
}

// let JSZip = require("jszip");
// let zip = new JSZip();
// zip.generateAsync({type: 'blob'})
//     .then(function(blob) {
//       saveAs(blob, 'hello.zip');
//     });
// function saveAs(theBlob, fileName) {
//   // A Blob() is almost a File() - it's just missing the two properties below which we will add
//   theBlob.lastModifiedDate = new Date();
//   theBlob.name = fileName;
//   return theBlob;
// }

// $('#labelsInput').unbind('change');

function dataSelect() {
  $('#stepper').hide(300);
  $('#headContent').hide(300);
  $('#headContent').text('Select or create your own dataset');
  $('#headContent').show(180);
  $('#headSub').hide(200);
  $('#headContent').text('Select or create your dataset');
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
  function handleFile(f) {
    let title = f.name;
    // console.log(title);
    JSZip.loadAsync(f).then(function(zip) {
      zip.forEach(function(relativePath, zipEntry) {
        console.log(zipEntry.name);
      });
    });
  }
  let files = evt.target.files;
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
  for (var i = 0; i < files.length; i++) {
    handleFile(files[i]);
  }
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
    let fileNames = $.map($('#labelsInput').prop('files'), function(val) {
      return val.name;
    });
    var data = new FormData();
    var fileInput = document.getElementById('labelsInput');
    for (i = 0; i < fileNames.length; i++) {
      data.append('zips', fileInput.files[i], fileNames[i]);
    }
    let url = '';
    $.ajax({
      type: 'POST',
      url: '../../workbench/deleteDataset',
      success: function(done1) {
        console.log(done1);
        if (fileNames.length == 1) {
          url = '../../workbench/getLabelsZip';
        } else if (fileNames.length > 1) {
          url = '../../workbench/getLabelsZips';
        } else return;
        $.ajax({
          type: 'POST',
          enctype: 'multipart/form-data',
          url: url,
          data: data,
          processData: false,
          contentType: false,
          cache: false,
          timeout: 600000,
          success: function(data) {
            console.log(data);
            $('#labelsSubmitButton').prop('disabled', false);
            $('#labelsSubmitText').show(200);
            $('#labelsSubmitLoading').hide(200);
            displayLabels(data);
          },
          error: function(e) {
            console.log('ERROR : ', e);
            alert('Error');
            $('#labelsSubmitButton').prop('disabled', false);
            $('#labelsSubmitText').show(200);
            $('#labelsSubmitLoading').hide(200);
          },
        });
      },
    });
  });
}

function displayLabels(data) {
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
  selectLabels(data.labels);
}

function selectLabels(labels) {
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
    // console.log(selected);
    $.ajax({
      type: 'POST',
      url: '../../workbench/deleteUnselected',
      data: {
        labels: labels,
        included: selected,
      },
      success: function(done) {
        console.log(done);
        $.ajax({
          type: 'POST',
          url: '../../workbench/generateSprite',
          data: {
            labels: labels,
            included: selected,
          },
          success: function(done) {
            console.log(done);
            $('#labelsSubmitButton').prop('disabled', false);
            $('#labelsSubmitFinish').show(200);
            $('#labelsSubmitLoading').hide(200);
            $('#filterLabels').hide(150);
            $('#labelsDatasetZip').show(200);
            $('#labelSelectModalTitle').text('Dataset created successfully');
            window.open('../../download/dataset.zip');
            cleanBackend();
          },
        });
      },
    });
  });
}

function cleanBackend() {
  $('#labelsUploadForm').unbind('submit');
  $('#labelsUploadForm').on('submit', function() {
    $.ajax({
      type: 'POST',
      url: '../../workbench/deleteDataset',
      success: function() {
        $('#labelsUploadModal').modal('hide');
        resetLabelsModel();
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
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}

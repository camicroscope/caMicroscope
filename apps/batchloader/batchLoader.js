$(document).ready(function() {
//   console.log('hi');
});

$('#filesInput').change(function() {
  let files = $(this).prop('files');
  let fileNames = $.map(files, function(val) {
    return val.name;
  });
  $('#filesInputLabel').html(fileNames.length + ' files selected');
  if (fileNames.length>0) {
    $('#filesDetails').css('display', 'block');
  } else {
    $('#filesDetails').css('display', 'none');
    $('#table').css('display', 'none');
  }
  $('#start').css('display', 'none');
  $('#finish').css('display', 'none');
  $('#check').css('display', 'none');
  $('#post').css('display', 'none');
  $('#complete').css('display', 'none');
  $('#table').css('display', 'none');
});

$('#fileNameSwitch').change(function() {
  if ($(this).is(':checked')) {
    $('.fileName').css('opacity', '1');
    $('#fileNamesInput').prop('disabled', false);
    $('#fileNamesInput').prop('required', true);
    $('#fswitch').prop('title', 'Toggle to keep original file names');
  } else {
    $('#fileNamesInput').prop('disabled', true);
    $('#fswitch').prop('title', 'Toggle to select a generalised file name');
    $('#fileNamesInput').prop('required', false);
    $('.fileName').css('opacity', '0.4');
  }
});

function addbody(rowData) {
  let table = $('table tbody');
  let markup = '<tr><th scope="row">'+rowData.serial+'</th><td>'+rowData.fileName+
               '</td><td>'+rowData.slideName+'</td><td class="token">'+rowData.token+
               '</td><td class="status text-warning"><i class="fas fa-clock" ></i>'+
               ' <i class="fas fa-clock" ></i> <i class="fas fa-clock" ></i></td></tr>';
  table.append(markup);
}

let files= null;
let fileNames = null;
let slideNames = [];
function startTable() {
  slideNames = [];
  fileNames = [];
  let genSlideName = $('#slideNamesInput').val();
  let genFileName=$('#fileNamesInput').val();
  $('table tbody').html('');
  if (genSlideName!='') {
    files = $('#filesInput').prop('files');
    let slidesNum = files.length;
    if ($('#fileNameSwitch').is(':checked') && genFileName!='') {
      for (i=0; i<slidesNum; i++) {
        let fileName = genFileName.substring(0, genFileName.lastIndexOf('.'))+'_'+(i+1)+
                       '.'+genFileName.substring(genFileName.lastIndexOf('.')+1, genFileName.length);
        fileNames.push(fileName);
      }
    } else {
      fileNames = $.map(files, function(val) {
        return val.name;
      });
    }
    let data = {};
    $('#table').css('display', 'block');
    for (i=0; i<slidesNum; i++) {
      let slideName=genSlideName+'_'+(i+1);
      slideNames.push(slideName);
      let fileName=fileNames[i];
      let token = '--';
      data.serial= i+1;
      data.slideName= slideName;
      data.fileName= fileName;
      data.token= token;
      addbody(data);
    }
    $('#start').css('display', 'inline-block');
    $('#finish').css('display', 'none');
    $('#check').css('display', 'none');
    $('#post').css('display', 'none');
    $('#complete').css('display', 'none');
  } else {
    $('#table').css('display', 'none');
    $('#complete').css('display', 'none');
  }
}

let startUrl = '../../loader/upload/start';
let continueUrl = '../../loader/upload/continue/';
let finishUrl = '../../loader/upload/finish/';
var checkUrl = '../../loader/data/one/';
let chunkSize = 5*1024*1024;
let finishUploadSuccess = false;
let tokens = [];

function startBatch() {
  tokens = [];
  for (i=0; i<files.length; i++) {
    handleUpload(files[i], fileNames[i], i);
  }
  $('#finish').css('display', 'inline-block');
  $('#check').css('display', 'none');
  $('#post').css('display', 'none');
  $('#start').css('display', 'none');
}

function finishBatch() {
  for (i=0; i<fileNames.length; i++) {
    finishUpload(tokens[i], fileNames[i], i);
  }
}

async function handleUpload(selectedFile, filename, i) {
  const token = await startUpload(filename);
  tokens.push(token);
  let j = 0;
  $('.token').each(function() {
    $(this).html(tokens[j++]);
  });
  let status = $('.status:eq('+i+')');
  $('i:nth-child(1)', status).remove();
  $(status).prepend('<i class="fas fa-check-circle text-success" ></i>');

  continueUpload(token);
  readFileChunks(selectedFile, token);
}

async function startUpload(filename) {
  const body = {filename: filename};
  const token = fetch(startUrl, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }}).then((x)=>x.json());
  try {
    const a = await token;
    return a['upload_token'];
  } catch (e) {
    console.log(e);
  }
}

function continueUpload(token) {
  return async function(body) {
    return await fetch(continueUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
      'Content-Type': 'application/json; charset=utf-8',
    }});
  };
}

function finishUpload(token, filename, i) {
//   var reset = true;

  const body = {filename: filename};
  //   changeStatus('UPLOAD', 'Finished Reading File, Posting');
  const regReq = fetch(finishUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }});
  regReq.then((x)=>x.json()).then((a)=>{
    // changeStatus('UPLOAD | Finished', a, reset); reset = false;
    console.log(a);
    if (typeof a === 'object' && a.error) {
      finishUploadSuccess = false;
    //   $('#check_btn').hide();
    //   $('#post_btn').hide();
    } else {
      finishUploadSuccess=true;
      $('#check').css('display', 'inline-block');
      $('#finish').css('display', 'none');

      let status = $('.status:eq('+i+')');
      $('i:nth-child(2)', status).after('<i class="fas fa-check-circle text-success" ></i>');
      $('i:nth-child(2)', status).remove();
    }
  });
  regReq.then((e)=> {
    if (e['ok']===false) {
      finishUploadSuccess = false;
      //   $('#check_btn').hide();
      //   $('#post_btn').hide();
      //   changeStatus('UPLOAD | ERROR;', e);
      //   reset = true;
      console.log(e);
    }
  });
}


async function readFileChunks(file, token) {
  var part = 0;
  var complete = false;
  while (!complete) {
    try {
      const data = await promiseChunkFileReader(file, part);
      const body = {chunkSize: chunkSize, offset: part*chunkSize, data: data};
      const res = await continueUpload(token)(body);
      part++;
      console.log(part);
    } catch (e) {
      console.log(e);
      complete = true;
    }
  }
}

// read a chunk of the file
function promiseChunkFileReader(file, part) {
  return new Promise((resolve, reject)=>{
    var fr = new FileReader();
    fr.onload = (evt)=>{
      if (evt.target.error == null) {
        const d = evt.target.result.split(',')[1];
        if (d) {
          resolve(d);
        } else {
          reject(new Error('Done Reading') );
        }
      } else {
        reject(evt.target.error);
      }
    };
    var blob = file.slice(part*chunkSize, (part+1)*chunkSize);
    fr.readAsDataURL(blob);
  });
}

function checkBatch() {
  for (i=0; i<fileNames.length; i++) {
    handleCheck(fileNames[i], i);
  }
}

function handleCheck(filename, i) {
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(), // if the response is a JSON object
  ).then(
      (success) => {
        $('#post').css('display', 'inline-block');
        let status = $('.status:eq('+i+')');
        $('i:nth-child(3)', status).remove();
        $(status).append('<i class="fas fa-check-circle text-success" ></i>');
        // Add the filename, to be able to fetch the thumbnail.
        success['preview'] = filename;
      }, // Handle the success response object
  ).catch(
      (error) => console.log(error), // Handle the error response object
  );
}

function postBatch() {
  for (i=0; i<fileNames.length; i++) {
    handlePost(fileNames[i], slideNames[i], i);
  }
}

function handlePost(filename, slidename, i) {
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(), // if the response is a JSON object
  ).then(
      (data) => {
        data['upload_date'] = new Date(Date.now()).toLocaleString();
        data.name = slidename;
        data.location = '/images/' + filename;
        data.study = '';
        data.specimen = '';
        data.mpp = parseFloat(data['mpp-x']) || parseFloat(data['mpp-y']) || 0;
        data.mpp_x = parseFloat(data['mpp-x']);
        data.mpp_y = parseFloat(data['mpp-y']);
        var store = new Store('../../data/');
        store.post('Slide', data).then(
            (success) => {
              $('#post').css('display', 'none');
              $('#check').css('display', 'none');
              $('#complete').css('display', 'block');
              $('form').trigger('reset');
              $('#fileNameSwitch').trigger('change');
              $('#filesInputLabel').html('Choose Files');

              let status = $('.status:eq('+i+')');
              $(status).append(' <i class="fas fa-check-circle text-primary" ></i>');
              console.log(success);
            //   initialize();
            //   $('#upload-dialog').modal('hide');
            //   showSuccessPopup('Slide uploaded successfully');
            //   return changeStatus('POST', success.result, reset);
            }, // Handle the success response object
        ).catch(
            (error) => console.log(error), // Handle the error response object
        );
      },
  ).catch(
      (error) => console.log(error), // Handle the error response object
  );
}

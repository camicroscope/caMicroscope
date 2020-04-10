// expects changeStatus to be defined from loader.js

var startUrl = '../loader/upload/start';
var continueUrl = '../loader/upload/continue/';
var finishUrl = '../loader/upload/finish/';
var finishUploadSuccess = false;
var checkSuccess = false;
var chunkSize = 5*1024*1024;
var tokenChange = true;
var filenameChange = true;
var oldToken = '';
var oldFilename='';

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
      changeStatus('UPLOAD', e);
      complete = true;
    }
  }
}


async function handleUpload(selectedFiles) {
  var fnametr = document.getElementById('filenameRow');
  var tokentr = document.getElementById('tokenRow');
  var slidetr = document.getElementById('slidenameRow');
  var filtertr = document.getElementById('filterRow');

  // Clear existing
  document.getElementById('json_table').innerHTML = '';
  var n = tokentr.cells.length;
  for (var i=0; i<n-1; i++) {
    fnametr.deleteCell(1);
    tokentr.deleteCell(1);
    slidetr.deleteCell(1);
    filtertr.deleteCell(1);
  }

  // Add columns
  fnametr.insertCell(-1).innerHTML = `<input type=text class="form-control" name=filename id='filename0'
  onchange=fileNameChange(); value='${selectedFiles[0]['name']}'>`;
  fileNameChange();
  tokentr.insertCell(-1).innerHTML = `<input type=text class="form-control" onchange=hideCheckButton();hidePostButton();
  disabled name=token id='token0'>`;
  slidetr.insertCell(-1).innerHTML = `<input type=text class="form-control" name=slidename id='slidename0'>`;
  filtertr.insertCell(-1).innerHTML = `<input type=text class="form-control" name=filter id='filter0'>`;

  selectedFile = selectedFiles[0];
  const filename = document.getElementById('filename'+0).value;
  const token = await startUpload(filename);
  const callback = continueUpload(token);
  document.getElementById('token'+0).value = token;
  readFileChunks(selectedFile, token);
  // parseFile(selectedFile, callback, 0, x=>(changeStatus("UPLOAD", "Finished Reading File")))

  document.getElementById('fileUploadInput').colSpan = selectedFiles.length;
  document.getElementById('controlButtons').colSpan = selectedFiles.length+1;
}

async function startUpload(filename) {
  const body = {filename: filename};
  const token = fetch(startUrl, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }}).then((x)=>x.json());
  try {
    const a = await token;
    changeStatus('UPLOAD', 'Begun upload - Token:' + a['upload_token']);
    return a['upload_token'];
  } catch (e) {
    changeStatus('UPLOAD | ERROR;', e);
  }
}

function continueUpload(token) {
  return async function(body) {
    changeStatus('UPLOAD', 'Uploading chunk at: '+ body.offset +' of size '+ body.chunkSize);
    return await fetch(continueUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
      'Content-Type': 'application/json; charset=utf-8',
    }});
  };
}
function finishUpload() {
  var reset = true;
  const token = document.getElementById('token'+0).value;
  const filename = document.getElementById('filename'+0).value;
  if (token === oldToken) {
    tokenChange=false;
  } else {
    tokenChange=true;
    oldToken=token;
  }
  if (filename === oldFilename) {
    filenameChange = false;
  } else {
    filenameChange=true;
    oldFilename=filename;
  }
  if (!filenameChange && !tokenChange) {
    if (finishUploadSuccess) {
      changeStatus('UPLOAD', 'You have already uploaded this file just now.');
      if (checkSuccess) {
        $('#check_btn').show();
        $('#post_btn').show();
      }
    }
    return;
  }
  const body = {filename: filename};
  changeStatus('UPLOAD', 'Finished Reading File, Posting');
  const regReq = fetch(finishUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }});
  regReq.then((x)=>x.json()).then((a)=>{
    changeStatus('UPLOAD | Finished', a, reset); reset = false;
    console.log(a);
    if (typeof a === 'object' && a.error) {
      finishUploadSuccess = false;
      $('#check_btn').hide();
      $('#post_btn').hide();
    } else {
      finishUploadSuccess=true;
      if (checkSuccess===true) {
        $('#check_btn').show();
        $('#post_btn').show();
      } else {
        $('#check_btn').show();
        $('#post_btn').hide();
      }
    }
  });
  regReq.then((e)=> {
    if (e['ok']===false) {
      finishUploadSuccess = false;
      $('#check_btn').hide();
      $('#post_btn').hide();
      changeStatus('UPLOAD | ERROR;', e);
      reset = true;
      console.log(e);
    }
  });
}


async function handleUrlUpload(url) {
  $('#uploadLoading').css('display', 'block');
  const token = await startUpload(url);
  await continueUrlUpload(token, url);
}

function afterUrlUpload(token, url) {
  $('#uploadLoading').css('display', 'none');
  var fileName= url.substring(url.lastIndexOf('/')+1, url.length);

  var fnametr = document.getElementById('filenameRow');
  var tokentr = document.getElementById('tokenRow');
  var slidetr = document.getElementById('slidenameRow');
  var filtertr = document.getElementById('filterRow');

  // Clear existing
  document.getElementById('json_table').innerHTML = '';
  var n = tokentr.cells.length;
  for (var i=0; i<n-1; i++) {
    fnametr.deleteCell(1);
    tokentr.deleteCell(1);
    slidetr.deleteCell(1);
    filtertr.deleteCell(1);
  }
  // Add columns
  fnametr.insertCell(-1).innerHTML = `<input type=text class="form-control" name=filename id='filename0'
    onchange=fileNameChange(); value='${fileName}'>`;
  fileNameChange();
  tokentr.insertCell(-1).innerHTML = `<input type=text class="form-control" onchange=hideCheckButton();hidePostButton();
    disabled name=token id='token0'>`;
  slidetr.insertCell(-1).innerHTML = `<input type=text class="form-control" name=slidename id='slidename0'>`;
  filtertr.insertCell(-1).innerHTML = `<input type=text class="form-control" name=filter id='filter0'>`;
  document.getElementById('token'+0).value = token;
}

async function continueUrlUpload(token, url) {
  var enurl = encodeURIComponent(url);
  const body = {'url': enurl};
  changeStatus('UPLOAD', 'Uploading URL content ');
  await $.ajax({
    url: '../loader/urlupload/continue/'+token,
    type: 'POST',
    data: JSON.stringify(body),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  }).then((response)=> {
    // console.log(response);
    if (response['status']=='OK Uploaded') {
      afterUrlUpload(token, url);
    }
  }).catch((error) => {
    if (error.status == 0) {
      var i=0;
      var inter=setInterval(function() {
        i++;
        if (i>=180) { // 180*5000 = 900000 = 15min max time for running this
          clearInterval(inter);
        }
        fetch('../loader/urlupload/check', {
          credentials: 'same-origin',
          method: 'GET',
        }).then((response)=>{
          // console.log(response);
          if (response.status==200) {
            return response.json();
          } else {
            throw new Error('Error in check');
          }
        }).then((response)=>{
          console.log('uploading please wait..');
          if (response['uploaded']== 'True') { // check if upload completed or not
            console.log('upload complete');
            clearInterval(inter);
            afterUrlUpload(token, url);
          }
        }).catch((error) => {
          console.log(error);
          clearInterval(inter);
        });
      }, 5000); // check for url upload status from server in every 5 sec. (for big files or slow connection)
    } else {
      console.log(error);
      $('#uploadLoading').css('display', 'none');
      alert(error['responseJSON']['status']);
    }
  });
}

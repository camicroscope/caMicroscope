var uploadUrl = '../loader/upload/start/';
var checkUrl = '../loader/data/one/';
var thumbUrl = '../loader/data/thumbnail/';
var deleteSlideUrl = '../loader/slide/delete';

var store = new Store('../data/');

function changeStatus(step, text, reset=true) {
  // Reset the status bar
  console.log('Previous: ', document.getElementById('load_status').innerHTML);
  document.getElementById('load_status').innerHTML='';

  // Display JSON as table:
  if (typeof text === 'object') { // If the text arg is a JSON
    var col = []; // List of column headers
    for (var key in text) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }

    var table;
    var responsiveContainer;
    if (reset) {
      responsiveContainer = document.createElement('div');
      responsiveContainer.classList = 'table-responsive';
      table = document.createElement('table');
      table.id = 'statusTable';
      table.classList = 'table';

      // Add table headers:
      var tr = table.insertRow(-1);
      for (var i = 0; i < col.length; i++) {
        var th = document.createElement('th');
        th.innerHTML = col[i];
        tr.appendChild(th);
      }
    } else {
      table=document.getElementById('statusTable');
    }

    if (step == 'POST' && !reset) {
      tr = table.rows[table.rows.length-1];
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.cells[tr.cells.length-1];
        tabCell.innerHTML = Number(Number(tabCell.innerHTML) + 1);
      }
    } else {
      // Add JSON data to the table as rows:
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = text[col[j]];
      }
      if (step == 'CHECK') {
        // During check, thumbnail needs to be fetched & added to the table
        // In this case, text[col[col.length - 1]] is the filename
        fetch(thumbUrl + text[col[col.length - 1]], {credentials: 'same-origin'}).then(
            (response) => response.json(), // if the response is a JSON object
        ).then((x)=>{
          var tabCell = tr.cells[tr.cells.length-1];
          tabCell.innerHTML = '';
          const img = new Image();
          img.src = x.slide;
          tabCell.appendChild(img);
          if (text['location']) {
            // indicating successful check
            checkSuccess = true;
            if (finishUploadSuccess === true) {
              $('#post_btn').show();
            } else {
              $('#post_btn').hide();
            }
          } else {
            checkSuccess = false;
            $('#post_btn').hide();
          }
        });
      }
    }

    var divContainer = document.getElementById('json_table');
    divContainer.innerHTML = '';
    responsiveContainer.appendChild(table);
    divContainer.appendChild(responsiveContainer);
    $('#statusTable').stacktable();
    document.getElementById('load_status').innerHTML=step;
  } else {
    text = JSON.stringify(text);
    text = step + ' | ' + text;
    document.getElementById('load_status').innerHTML=text;
  }
}

function handleUpload(file, filename) {
  var data = new FormData();
  data.append('file', file);
  data.append('filename', filename);
  changeStatus('UPLOAD', 'Begun upload');
  fetch(uploadUrl, {
    credentials: 'same-origin',
    method: 'POST',
    body: data,
  }).then(
      (response) => response.json(), // if the response is a JSON object
  ).then(
      (success) => changeStatus('UPLOAD', success), // Handle the success response object
  ).catch(
      (error) => changeStatus('UPLOAD', error), // Handle the error response object
  );
}

function handleCheck(filename, reset, id) {
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(), // if the response is a JSON object
  ).then(
      (success) => {
        success['ID'] = id;
        // Add the filename, to be able to fetch the thumbnail.
        success['preview'] = filename;
        changeStatus('CHECK', success, reset);
      }, // Handle the success response object
  ).catch(
      (error) => changeStatus('CHECK', error, reset), // Handle the error response object
  );
}

function handlePost(filename, slidename, filter, reset) {
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(), // if the response is a JSON object
  ).then(
      (data) => {
        data['upload_date'] = new Date(Date.now()).toLocaleString();
        data.name = slidename;
        if (filter) {
          data.filter = filter;
        }
        data.location = '/images/' + filename;
        data.study = '';
        data.specimen = '';
        data.mpp = parseFloat(data['mpp-x']) || parseFloat(data['mpp-y']) || 0;
        data.mpp_x = parseFloat(data['mpp-x']);
        data.mpp_y = parseFloat(data['mpp-y']);
        store.post('Slide', data).then(
            (success) => {
              initialize();
              $('#upload-dialog').modal('hide');
              // show pop-up message to user
              let popups = document.getElementById(
                  'popup-container',
              );
              if (popups.childElementCount < 2) {
                let popupBox = document.createElement('div');
                popupBox.classList.add('popup-msg', 'slide-in', 'text-success');
                popupBox.innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i>
                Slide posted sucessfully`;
                // Add popup box to parent
                popups.insertBefore(
                    popupBox,
                    popups.childNodes[0],
                );
                resetUploadForm();
                setTimeout(function() {
                  // popups.lastChild.classList.add('slideOut');
                  popups.removeChild(popups.lastChild);
                }, 2000);
              }
              if (!$('#datatables')[0]) {
                setTimeout(function() {
                  window.location.reload();
                }, 2000);
              }
              return changeStatus('POST', success.result, reset);
            }, // Handle the success response object
        ).catch(
            (error) => changeStatus('POST', error, reset), // Handle the error response object
        );
      },
  ).catch(
      (error) => changeStatus('POST', error, reset), // Handle the error response object
  );
}

// register events for file upload
function UploadBtn() {
  const fileInput = document.getElementById('fileinput');
  var filename = document.getElementById('filename').value;
  handleUpload(fileInput.files[0], filename);
}

function CheckBtn() {
  var filename = document.getElementById('filename'+0).value;
  handleCheck(filename, true, 1);
}

function PostBtn() {
  var filename = document.getElementById('filename'+0).value;
  var slidename = document.getElementById('slidename'+0).value;
  var filter = document.getElementById('filter'+0).value;
  handlePost(filename, slidename, filter, true);
}

function deleteSlideFromSystem(filename) {
  // var data = new FormData();
  // data.append('filename', filename);
  data = {
    "filename": filename
  }
  data = JSON.stringify(data);
  console.log(data);
  fetch(deleteSlideUrl, {
    credentials: 'same-origin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  }).then(
      (response) => response.json(), // if the response is a JSON object
      console.log('Deleted: ' + filename)
  ).catch(
      (error) => {
        console.log('ERROR: ' + error)
      }, // Handle the error response object
  );
}
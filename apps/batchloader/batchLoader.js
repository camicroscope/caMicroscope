let existingFiles = [];
let existingSlides = [];
let tokens = null;
let files= null;
let fileNames = null;
let slideNames = null;
let originalFileNames = null;
let startUrl = '../../loader/upload/start';
let continueUrl = '../../loader/upload/continue/';
let finishUrl = '../../loader/upload/finish/';
let checkUrl = '../../loader/data/one/';
let chunkSize = 5*1024*1024;
let finishUploadSuccess = false;
const allowedExtensions = ['svs', 'tif', 'tiff', 'vms', 'vmu', 'ndpi', 'scn', 'mrxs', 'bif', 'svslide', 'dcm'];

// call on document ready
$(document).ready(function() {
  // fill all current files and slides to existingFiles[] and existingSlides
  $('#files').show(400);
  let store = new Store('../../data/');
  store.findSlide().then((response) => {
    for (i=0; i<response.length; i++) {
      existingSlides.push(response[i].name);
      existingFiles.push((response[i].location).substring((response[i].location).lastIndexOf('/')+1,
          (response[i].location).length));
    }
  }).catch((error) => {
    console.log(error);
  });
  // display file details when called
  $('#filesInput').change(function() {
    let files = $(this).prop('files');
    let fileNames = $.map(files, function(val) {
      return val.name;
    });
    $('#filesInputLabel').html(fileNames.length + ' files selected');
    if (fileNames.length>0) {
      $('#filesDetails').show(500);
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
  // called when filenameswitch checkbox changes
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

  $('.modal').on('shown.bs.modal', function() {
    let input = $(this).find('input:text:visible:first');
    input.focus();
  });

  $('#fileNamesInput').change(function() {
    $(this).val($(this).val().split(' ').join('_'));
  });
});
// fuction to add each row (per slide)
function addbody(rowData) {
  let table = $('table tbody');
  let markup = '<tr><th scope="row">'+rowData.serial+'</th><td><span>'+rowData.fileName+
               '</span>&nbsp;&nbsp;&nbsp;<i id="icon" class="fas fa-pen text-dark fileNameEdit" data-toggle="modal"'+
               ' data-target="#fileNameChangeModal"></i></td><td><span>'+rowData.slideName+
               '</span>&nbsp;&nbsp;&nbsp;<i id="icon" class="fas fa-pen text-dark slideNameEdit" data-toggle="modal"'+
               ' data-target="#slideNameChangeModal"></i>'+
               '</td><td class="token">'+rowData.token+
               '</td><td class="status text-warning"><i class="fas fa-clock" ></i>'+
               ' <i class="fas fa-clock" ></i> <i class="fas fa-clock" ></i></td><td>'+
               '<i class="fas fa-info-circle text-dark slideInfo" title="Info" data-toggle="modal"'+
               ' data-target="#slideInfoModal" style="font-size: larger; margin-left:-1em;"></i>'+
               '<i class="fas fa-minus-circle text-danger slideDelete"'+
               ' style="margin-left:1.2em; font-size: larger" title="Remove slide"></i></td></tr>';

  table.append(markup);
}
// function called on page load
// initializes table, adds rows, monitors change or click events and checks for errors in names
function startTable() {
  slideNames = [];
  fileNames = [];
  originalFileNames = [];
  tokens = [];
  let genSlideName = $('#slideNamesInput').val();
  let genFileName=$('#fileNamesInput').val();
  $('table tbody').html('');
  if (genSlideName!='') {
    files = $('#filesInput').prop('files');
    let slidesNum = files.length;
    originalFileNames = $.map(files, function(val) {
      return val.name;
    });
    if ($('#fileNameSwitch').is(':checked') && genFileName!='') {
      for (i=0; i<slidesNum; i++) {
        let fileName = genFileName+'_'+(i+1)+'.'+originalFileNames[i]
            .substring(originalFileNames[i].lastIndexOf('.')+1, originalFileNames[i].length);
        fileNames.push(fileName);
      }
    } else {
      fileNames = [...originalFileNames];
    }
    let data = {};
    $('#table').show(400);
    for (i=0; i<slidesNum; i++) {
      let slideName=genSlideName+'_'+(i+1);
      slideName = sanitize(slideName);
      slideNames.push(slideName);
      let fileName=fileNames[i];
      let token = '--';
      data.serial= i+1;
      data.slideName= slideName;
      data.fileName= fileName;
      data.token= token;
      addbody(data);
    }
    $('#start').show(400);
    $('#finish').css('display', 'none');
    $('#check').css('display', 'none');
    $('#post').css('display', 'none');
    $('#complete').css('display', 'none');
    $('.slideInfo').css('visibility', 'hidden');
    $('.slideDelete').css('visibility', 'hidden');

    $('.fileNameEdit').css({visibility: 'hidden', fontSize: 'smaller'});
    $('.slideNameEdit').css({visibility: 'hidden', fontSize: 'smaller'});

    $('table').find('tr').each(function() {
      $(this).mouseenter(function() {
        $('.slideInfo, .slideDelete', this).css({opacity: 0.0, visibility: 'visible', cursor: 'pointer'})
            .animate({opacity: 1.0}, 300);
      });
      $(this).mouseleave(function() {
        $('.slideInfo, .slideDelete', this).css({opacity: 0.0, visibility: 'hidden'})
            .animate({opacity: 1.0}, 200);
      });
      $('td:nth-child(2), td:nth-child(3)', this).mouseenter(function() {
        $('i#icon', this).css({opacity: 0.0, visibility: 'visible', cursor: 'pointer'})
            .animate({opacity: 1.0}, 300);
      });
      $('td:nth-child(2), td:nth-child(3)', this).mouseleave(function() {
        $('i#icon', this).css({opacity: 0.0, visibility: 'hidden', cursor: 'pointer'})
            .animate({opacity: 1.0}, 200);
      });
    });
    $('.fileNameEdit').click(function() {
      let oldfileName = $(this).prev().html();
      updateFileName(oldfileName);
    });
    $('.slideNameEdit').click(function() {
      let oldSlideName = $(this).prev().html();
      updateSlideName(oldSlideName);
    });
    $('.slideInfo').click(function() {
      let slideName = $(this).parent().prev().prev().prev().find('span').html();
      let index = slideNames.indexOf(slideName);
      showSlideInfo1(index);
    });
    $('.slideDelete').click(function() {
      let slideName = $(this).parent().prev().prev().prev().find('span').html();
      let index = slideNames.indexOf(slideName);
      $(this).parent().parent().hide(400, function() {
        $(this).remove();
      });
      slideNames.splice(index, 1);
      fileNames.splice(index, 1);
      originalFileNames.splice(index, 1);
      tokens.splice(index, 1);
    });
    checkNames();
  } else {
    $('#table').css('display', 'none');
    $('#complete').css('display', 'none');
  }
}
// checks for erroes in names
function checkNames() {
  let numErrors = 0;
  for (i=0; i<originalFileNames.length; i++) {
    if (existingFiles.includes(fileNames[i])) {
      let errorIcon = `<i id='fileNameError' class="fas fa-exclamation-circle text-danger" title='File name exixts'></i> &nbsp;&nbsp;`;
      if ($('.fileNameEdit:eq('+i+')').prev().prev('#fileNameError').length == 0) {
        $('.fileNameEdit:eq('+i+')').parent().prepend(errorIcon);
      }
      numErrors++;
    } else if (!allowedExtensions.includes(fileNames[i].substring(fileNames[i].lastIndexOf('.')+1,
        fileNames[i].length).toLowerCase())) {
      let errorIcon = `<i id='fileNameError' class="fas fa-exclamation-circle text-danger" title='File extension not allowed'></i> &nbsp;&nbsp;`;
      if ($('.fileNameEdit:eq('+i+')').prev().prev('#fileNameError').length == 0) {
        $('.fileNameEdit:eq('+i+')').parent().prepend(errorIcon);
      }
      numErrors++;
    } else {
      $('.fileNameEdit:eq('+i+')').parent().find('#fileNameError').remove();
    }
    if (existingSlides.includes(slideNames[i])) {
      let errorIcon = `<i id='slideNameError' class="fas fa-exclamation-circle text-danger" title='Slide name exixts'></i> &nbsp;&nbsp;`;
      if ($('.slideNameEdit:eq('+i+')').prev().prev('#slideNameError').length == 0) {
        $('.slideNameEdit:eq('+i+')').parent().prepend(errorIcon);
      }
      numErrors++;
    } else {
      $('.slideNameEdit:eq('+i+')').parent().find('#slideNameError').remove();
    }
  }
  if (numErrors > 0) {
    $('#start').hide();
  } else {
    $('#start').show(300);
  }
}

// showSlideInfoX - shows info of slide based on the slide properties
function showSlideInfo1(index) {
  $('#slideInfoContent').html(`<b>Original Filename:</b> `+originalFileNames[index]+`<br><b>Filename:</b> `+fileNames[index]+
                         `<br><b>Slide name:</b> `+slideNames[index]+`<br><b>Status:</b> Pending Initial Upload`);
}
function showSlideInfo2(index) {
  $('#slideInfoContent').html(`<b>Original Filename:</b> `+originalFileNames[index]+`<br><b>Filename:</b> `+fileNames[index]+
                         `<br><b>Slide name:</b> `+slideNames[index]+`<br><b>Token:</b> `+
                         tokens[index]+`<br><b>Status:</b> Initial Upload done | Token Generated | Final Upload Pending`);
}
function showSlideInfo3(index) {
  $('#slideInfoContent').html(`<b>Original Filename:</b> `+originalFileNames[index]+`<br><b>Filename:</b> `+fileNames[index]+
                         `<br><b>Slide name:</b> `+slideNames[index]+`<br><b>Token:</b> `+
                         tokens[index]+`<br><b>Status:</b> Final Upload Done | Check Pending | Post Pending`);
}
function showSlideInfo4(index) {
  $('#slideInfoContent').html(`<b>Original Filename:</b> `+originalFileNames[index]+`<br><b>Filename:</b> `+fileNames[index]+
                         `<br><b>Slide name:</b> `+slideNames[index]+`<br><b>Token:</b> `+
                         tokens[index]+`<br><b>Status:</b> Check successfull | Post Pending`);
}
function showSlideInfo5(index) {
  $('#slideInfoContent').html(`<b>Original Filename:</b> `+originalFileNames[index]+`<br><b>Filename:</b> `+fileNames[index]+
                         `<br><b>Slide name:</b> `+slideNames[index]+`<br><b>Token:</b> `+
                         tokens[index]+`<br><b>Status:</b> Posted Successfully`);
}
// updates the name of the slide after checking if it's not null or duplicated
function updateSlideName(oldSlideName) {
  $('#confirmUpdateSlideContent').html('Enter the new name for: <br><b>'+oldSlideName+
         '</b><br><br><div class="form-group"><input type="text" id="newSlideName" class="form-control"'+
         ' value="'+oldSlideName+'" aria-label="newSlideName" required></div>');
  let input = document.getElementById('newSlideName');
  input.select();
  $('#confirmUpdateSlide').unbind('click');
  $('#confirmUpdateSlide').click(function() {
    let newSlideName = $('#newSlideName');
    let newName = newSlideName.val();

    if (newName!='') {
      if (slideNames.includes(newName) || existingSlides.includes(newName)) {
        newSlideName.addClass('is-invalid');
        if (newSlideName.parent().children().length === 1) {
          newSlideName.parent().append(`<div class="invalid-feedback">
               Slide with given name already exists. </div>`);
        }
      } else {
        newSlideName.removeClass('is-invalid');
        let index = slideNames.indexOf(oldSlideName);
        slideNames[index] = newName;
        $('tr:eq('+(index+1)+') td:nth-child(3) span').html(newName);
        $('#slideNameChangeModal').modal('hide');
        checkNames();
      }
    }
  });
}
// updates the name of the file if not null, not duplicated and has the correct file extension
function updateFileName(oldfileName) {
  $('#confirmUpdateFileContent').html('Enter the new name for: <br><b>'+oldfileName+
         '</b><br><br><div class="form-group"><input type="text" id="newFileName" class="form-control"'+
         ' value="'+oldfileName+'" aria-label="newFileName" required></div>');
  let input = document.getElementById('newFileName');
  let value = input.value;
  input.setSelectionRange(0, value.lastIndexOf('.'));

  $('#newFileName').change(function() {
    $(this).val($(this).val().split(' ').join('_'));
  });
  $('#confirmUpdateFile').unbind('click');
  $('#confirmUpdateFile').click(function() {
    let newFileName = $('#newFileName');
    let newName = newFileName.val();
    let fileExtension = newName.toLowerCase().split('.').reverse()[0];

    if (newName!='') {
      if (fileNames.includes(newName) || existingFiles.includes(newName)) {
        newFileName.addClass('is-invalid');
        if (newFileName.parent().children().length === 1) {
          newFileName.parent().append(`<div class="invalid-feedback" id="filename-feedback0">
               File with given name already exists </div>`);
        } else {
          $('#filename-feedback0').html(`File with given name already exists`);
        }
      } else if (!allowedExtensions.includes(fileExtension)) {
        newFileName.addClass('is-invalid');
        if (newFileName.parent().children().length === 1) {
          newFileName.parent().append(`<div class="invalid-feedback" id="filename-feedback0"> 
               .${fileExtension} files are not compatible </div>`);
        } else {
          $('#filename-feedback0').html(`.${fileExtension} files are not compatible`);
        }
      } else {
        newFileName.removeClass('is-invalid');
        let index = fileNames.indexOf(oldfileName);
        fileNames[index] = newName;
        $('tr:eq('+(index+1)+') td:nth-child(2) span').html(newName);
        $('#fileNameChangeModal').modal('hide');
        checkNames();
      }
    }
  });
}

// function to start batch upload
function startBatch() {
  tokens = [];
  for (i=0; i<files.length; i++) {
    handleUpload(files[i], fileNames[i], i);
  }
  $('#finish').show();
  $('#check').css('display', 'none');
  $('#post').css('display', 'none');
  $('#start').css('display', 'none');
}

// function to finish batch upload
function finishBatch() {
  for (i=0; i<fileNames.length; i++) {
    finishUpload(tokens[i], fileNames[i], i);
  }
}

async function handleUpload(selectedFile, filename, i) {
  const uploadMetadata = await startUpload(filename);
  const token = uploadMetadata.upload_token;
  tokens.push(token);
  fileNames[i] = uploadMetadata.filename;
  $('tr:eq('+(i+1)+') td:nth-child(2) span')[0].innerText = uploadMetadata.filename;
  let j = 0;
  $('.token').each(function() {
    $(this).html(tokens[j++]);
  });
  let status = $('.status:eq('+i+')');
  $('i:nth-child(1)', status).remove();
  $(status).prepend('<i class="fas fa-check-circle text-success" ></i>');
  $('.slideInfo:eq('+i+')').unbind('click');
  $('.slideInfo:eq('+i+')').click(function() {
    showSlideInfo2(i);
  });

  continueUpload(token);
  readFileChunks(selectedFile, token);
}
// convert to json and POST per file
async function startUpload(filename) {
  const body = {filename: filename};
  const token = fetch(startUrl, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }}).then((x)=>x.json());
  try {
    const a = await token;
    return { upload_token: a['upload_token'], filename: a['filename'] };
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
// called when upload of a file is finished.
function finishUpload(token, filename, i) {
//   let reset = true;

  const body = {filename: filename};
  //   changeStatus('UPLOAD', 'Finished Reading File, Posting');
  const regReq = fetch(finishUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }});
  regReq.then((x)=>x.json()).then((a)=>{
    // changeStatus('UPLOAD | Finished', a, reset); reset = false;
    if (a.filepath) {
      const newName = a.filepath.slice(a.filepath.lastIndexOf('/')+1);
      fileNames[i] = newName;
      $('tr:eq('+(i+1)+') td:nth-child(2) span')[0].innerText = newName;
    }
    if (typeof a === 'object' && a.error) {
      finishUploadSuccess = false;
    //   $('#check_btn').hide();
    //   $('#post_btn').hide();
    } else {
      finishUploadSuccess=true;
      $('#check').show();
      $('#finish').css('display', 'none');

      let status = $('.status:eq('+i+')');
      $('i:nth-child(2)', status).after('<i class="fas fa-check-circle text-success" ></i>');
      $('i:nth-child(2)', status).remove();

      $('table').find('tr').each(function() {
        $('td:nth-child(2)', this).unbind('mouseenter mouseleave');
      });

      $('.slideInfo:eq('+i+')').unbind('click');
      $('.slideInfo:eq('+i+')').click(function() {
        showSlideInfo3(i);
      });
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
  let part = 0;
  let complete = false;
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
    let fr = new FileReader();
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
    let blob = file.slice(part*chunkSize, (part+1)*chunkSize);
    fr.readAsDataURL(blob);
  });
}
// checks for all files
function checkBatch() {
  for (i=0; i<fileNames.length; i++) {
    handleCheck(fileNames[i], i);
  }
}
// checks if each file doesn't have an error
function handleCheck(filename, i) {
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(), // if the response is a JSON object
  ).then(
      (success) => {
        $('#post').show(300);
        let status = $('.status:eq('+i+')');
        $('i:nth-child(3)', status).remove();
        $(status).append('<i class="fas fa-check-circle text-success" ></i>');
        $('.slideInfo:eq('+i+')').unbind('click');
        $('.slideInfo:eq('+i+')').click(function() {
          showSlideInfo4(i);
        });
        // Add the filename, to be able to fetch the thumbnail.
        success['preview'] = filename;
      }, // Handle the success response object
  ).catch(
      (error) => console.log(error), // Handle the error response object
  );
}
// upload all files
function postBatch() {
  for (i=0; i<fileNames.length; i++) {
    handlePost(fileNames[i], slideNames[i], i);
  }
}
// upload each file with timestamp
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
        let store = new Store('../../data/');
        store.post('Slide', data).then(
            (success) => {
              $('#post').css('display', 'none');
              $('#check').css('display', 'none');
              $('#complete').show(400);
              $('form').trigger('reset');
              $('#fileNameSwitch').trigger('change');
              $('#filesInputLabel').html('Choose Files');

              let status = $('.status:eq('+i+')');
              $(status).append(' <i class="fas fa-check-circle text-primary" ></i>');
              console.log(success);

              $('table').find('tr').each(function() {
                $('td:nth-child(3)', this).unbind('mouseenter mouseleave');
              });
              $('.slideInfo:eq('+i+')').unbind('click');
              $('.slideInfo:eq('+i+')').click(function() {
                showSlideInfo5(i);
              });
              $('.slideDelete').css('display', 'none');
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
// replace certain symbols for proper parsing in html
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

// Single-file upload page for multichannel/multispectral (OME-TIFF) slides.
// Reuses apps/loader/chunked_upload.js's upload-trio logic rather than
// reimplementing it a third time (it only ever handles one file, same as
// this page -- unlike apps/batchloader/batchLoader.js, which reimplements
// specifically to loop over many files concurrently). This file supplies
// the same small set of DOM-adjacent functions apps/loader/loader.js
// normally supplies to table.html's modal (changeStatus, handleCheck/
// handlePost, CheckBtn/PostBtn, validateForm, fileNameChange,
// hideCheckButton/hidePostButton, resetUploadForm), adapted for a
// standalone page instead of table.html's specific modal/table.
//
// chunked_upload.js's own hardcoded relative URLs (startUrl/continueUrl/
// finishUrl/startGoogleDriveUrl/continueGoogleDriveUrl) are tuned for
// table.html's nesting depth (apps/table.html, one level under the site
// root's apps/) -- this page lives one level deeper
// (apps/multichannel/multichannel.html), so every one of those needs an
// extra '../', exactly matching the adjustment apps/batchloader/
// batchLoader.js already makes for its own equivalent URLs at the same
// nesting depth. Reassigning here (chunked_upload.js declares them with
// `var`, so this is a plain global reassignment) rather than editing the
// shared file, which table.html still needs at its own depth.
startUrl = '../../loader/upload/start';
continueUrl = '../../loader/upload/continue/';
finishUrl = '../../loader/upload/finish/';
startGoogleDriveUrl = '../../loader/googleDriveUpload/getFile';
continueGoogleDriveUrl = '../../loader/googleDriveUpload/checkStatus';

var checkUrl = '../../loader/data/one/';
var thumbUrl = '../../loader/data/thumbnail/';
var store = new Store('../../data/');

var allowedExtensions = ['tif', 'tiff', 'zip'];

function sanitize(string) {
  string = string || '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match) => (map[match]));
}

function hidePostButton() {
  $('#post_btn').hide();
}

function hideCheckButton() {
  // no dedicated check_btn on this page (matches table.html's own
  // convention -- the check happens automatically inside finishUpload(),
  // there's no separate visible button for it)
}

function resetUploadForm() {
  document.getElementById('upload-form').reset();
  $('#filenameRow, #tokenRow, #slidenameRow, #filterRow').children().slice(1).remove();
  $('#json_table').html('');
  $('#load_status').html('');
  $('#warning_status').html('');
  $('#view_link').html('');
  $('.custom-file-label').html('');
  hidePostButton();
}

function fileNameChange() {
  hidePostButton();
  const fileNameInput = $('#filename0');
  const fileName = fileNameInput.val();
  const newFileName = fileName.split(' ').join('_');
  fileNameInput.val(newFileName);
  const fileExtension = newFileName.toLowerCase().split('.').reverse()[0];
  if (!allowedExtensions.includes(fileExtension)) {
    fileNameInput.addClass('is-invalid');
  } else {
    fileNameInput.removeClass('is-invalid');
  }
}

function validateForm(callback) {
  const slide = document.getElementById('slidename0');
  if (slide === null) {
    finishUploadSuccess = false;
    $('#post_btn').hide();
    changeStatus('UPLOAD', 'Please choose a file first');
    return false;
  }
  if (slide.value === '') {
    finishUploadSuccess = false;
    $('#post_btn').hide();
    changeStatus('UPLOAD', 'Please enter slide name');
    return false;
  }
  slide.value = sanitize(slide.value);

  const filename = document.getElementById('filename0').value;
  const fileExtension = filename.toLowerCase().split('.').reverse()[0];
  if (!allowedExtensions.includes(fileExtension)) {
    finishUploadSuccess = false;
    $('#post_btn').hide();
    changeStatus('UPLOAD', fileExtension + ' files are not compatible');
    return false;
  }
  callback();
}

// Adapted from apps/loader/loader.js's changeStatus, minus the
// stacktable-with-thumbnail rendering (this page doesn't need it) plus the
// new warning/extracted-file handling apps/loader/loader.js doesn't have yet.
function changeStatus(step, text, reset = true) {
  if (text && typeof text === 'object' && text.extracted && text.multi_file) {
    // A multi-file zip's response comes back from the FINISH-upload step
    // (chunked_upload.js's finishUpload(), which calls changeStatus()
    // unconditionally before deciding whether to proceed to the check
    // step) -- not from handleCheck()/the metadata-check step. finishUpload()
    // treats any `error`-bearing response (which this deliberately still
    // carries, for the classic dialog's safe degradation) as a terminal
    // failure and never calls validateForm(CheckBtn), so handleCheck()'s
    // own extracted/multi_file branch is unreachable dead code for this
    // case -- this is the actual, correct interception point.
    renderMultiFileChoice(text.folder, text.recognized_files || text.files);
    return;
  }
  if (typeof text === 'object' && text !== null) {
    const col = Object.keys(text);
    let responsiveContainer;
    let table;
    if (reset) {
      responsiveContainer = document.createElement('div');
      responsiveContainer.classList = 'table-responsive';
      table = document.createElement('table');
      table.id = 'statusTable';
      table.classList = 'table';
      const tr = table.insertRow(-1);
      col.forEach((c) => {
        const th = document.createElement('th');
        th.innerHTML = DOMPurify.sanitize(c);
        tr.appendChild(th);
      });
    } else {
      table = document.getElementById('statusTable');
      responsiveContainer = table ? table.parentElement : document.createElement('div');
    }
    const tr = table.insertRow(-1);
    col.forEach((c) => {
      const cell = tr.insertCell(-1);
      cell.innerHTML = DOMPurify.sanitize(text[c]);
    });
    const divContainer = document.getElementById('json_table');
    divContainer.innerHTML = '';
    responsiveContainer.appendChild(table);
    divContainer.appendChild(responsiveContainer);
    $('#statusTable').stacktable();
  } else {
    document.getElementById('load_status').innerHTML = DOMPurify.sanitize(step + ' | ' + JSON.stringify(text));
  }
}

function convertSlide(filename, destFilename) {
  const convUrl = '../../loader/slide/' + filename + '/pyramid/' + destFilename;
  return fetch(convUrl, {method: 'POST'}).then((response) => response.json());
}

function handleCheck(filename, reset, id, noRetry) {
  $('#warning_status').html('');
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(),
  ).then((success) => {
    if (success.error) {
      console.error(success.error);
      throw success;
    }
    // Note: the extracted/multi_file zip response is handled in
    // changeStatus(), not here -- it comes back from the finish-upload
    // step (chunked_upload.js's finishUpload()), which never reaches this
    // check step at all for that response shape. This checkUrl endpoint
    // (SlideLoader's per-file metadata check) can never itself return
    // extracted/multi_file, only warning (below) or a plain error.
    if (success.warning) {
      // raw unstitched multi-panel acquisition -- see SlideLoader's
      // detect_raw_panels(). Block registration rather than silently
      // registering a wrong single-panel slide.
      $('#warning_status').html(sanitize(success.warning));
      $('#post_btn').hide();
      return;
    }
    changeStatus('CHECK', success, reset);
    $('#finish_btn').fadeOut(300);
    $('#filename0, #slidename0, #filter0').prop('disabled', true);
    $('#post_btn').show();
  }).catch((error) => {
    if (!noRetry) {
      console.log('retrying with conversion');
      const destFilename = filename.replace('.', '_') + '_conv.tif';
      document.getElementById('filename0').value = destFilename;
      convertSlide(filename, destFilename).then(() => handleCheck(destFilename, reset, id, true))
          .catch(() => changeStatus('CHECK', error, reset));
    } else {
      changeStatus('CHECK', error, reset);
    }
  });
}

function handlePost(filename, slidename, filter, reset) {
  fetch(checkUrl + filename, {credentials: 'same-origin'}).then(
      (response) => response.json(),
  ).then((data) => {
    data['upload_date'] = new Date(Date.now()).toLocaleString();
    data.name = slidename;
    if (filter) data.filter = filter;
    data.location = '/images/' + filename;
    data.study = '';
    data.specimen = '';
    data.mpp = parseFloat(data['mpp-x']) || parseFloat(data['mpp-y']) || 0;
    data.mpp_x = parseFloat(data['mpp-x']);
    data.mpp_y = parseFloat(data['mpp-y']);
    store.post('Slide', data).then((result) => {
      // Slide/post is the generic mongoAdd handler (insertMany under the
      // hood, even for a single doc) -- its raw result shape is
      // {insertedIds: {'0': ObjectId}}, not a {result:{insertedId}} shape.
      const slideId = result && result.insertedIds && result.insertedIds['0'];
      showSuccessPopup('Slide uploaded successfully');
      changeStatus('POST', data, reset);
      if (slideId) {
        const viewUrl = `../viewer/viewer.html?slideId=${sanitize(slideId)}&mode=mctile`;
        document.getElementById('view_link').innerHTML =
          `<a class="btn btn-primary" href="${viewUrl}">View this slide</a>`;
      }
      $('#post_btn').hide();
    }).catch((error) => changeStatus('POST', error, reset));
  }).catch((error) => changeStatus('POST', error, reset));
}

// Presents the ambiguous-multi-file choice: a zip with N recognized image
// files could be N independent slides someone zipped together, or N sibling
// files meant to be channels/planes of one logical image (the tubhiswt
// case) -- these need very different handling, and guessing wrong either
// silently drops files or silently registers something misleading. Let the
// user say which one it is.
function renderMultiFileChoice(folder, files) {
  const fileListHtml = files.map(sanitize).map((f) => `<li>${f}</li>`).join('');
  $('#warning_status').html(`
    <div class="text-left">
      <p>This zip contained ${files.length} recognized image files, extracted to
        <code>${sanitize(folder)}</code>:</p>
      <ul>${fileListHtml}</ul>
      <p>How should these be treated?</p>
      <button class="btn btn-primary btn-sm" id="registerIndependentlyBtn">
        These are independent slides -- register each one
      </button>
      <button class="btn btn-secondary btn-sm" id="channelsOfOneImageBtn">
        These are channels of one image
      </button>
    </div>
  `);
  document.getElementById('registerIndependentlyBtn').onclick = () => registerFilesIndependently(folder, files);
  document.getElementById('channelsOfOneImageBtn').onclick = () => {
    $('#warning_status').html(
        'caMicroscope cannot currently combine multiple physical files into one ' +
        'multi-channel image (this needs Bio-Formats-level multi-file stitching support ' +
        'mctile does not have yet). To view this data, combine the channels into a single ' +
        `physical OME-TIFF first (all channels in one file) -- the extracted files remain ` +
        `available at <code>${sanitize(folder)}</code> in the meantime.`,
    );
  };
}

// Registers each file in a multi-file zip as its own independent slide
// (default name = filename without extension), reusing the same
// check-then-post steps handlePost/handleCheck use for a single file.
// Reports per-file success/failure rather than stopping at the first error,
// since one bad file (e.g. a non-slide file that happened to pass the
// extension allow-list) shouldn't block registering the rest.
async function registerFilesIndependently(folder, files) {
  $('#warning_status').html(`Registering ${files.length} slide(s)...`);
  const results = [];
  for (const filename of files) {
    const relpath = folder + '/' + filename;
    try {
      const metaResp = await fetch(checkUrl + relpath, {credentials: 'same-origin'});
      const data = await metaResp.json();
      if (data.error) throw new Error(data.error);
      if (data.warning) {
        // e.g. a raw unstitched multi-panel file (SlideLoader's
        // detect_raw_panels): registering it anyway would silently create a
        // Slide that only shows one arbitrary panel, not the full
        // specimen -- skip it and say why, rather than registering
        // something misleading just because the user said "these are
        // independent slides."
        results.push({filename, ok: false, error: data.warning});
        continue;
      }
      data.upload_date = new Date(Date.now()).toLocaleString();
      data.name = filename.split('.').slice(0, -1).join('.') || filename;
      data.location = '/images/' + relpath;
      data.study = '';
      data.specimen = '';
      data.mpp = parseFloat(data['mpp-x']) || parseFloat(data['mpp-y']) || 0;
      data.mpp_x = parseFloat(data['mpp-x']);
      data.mpp_y = parseFloat(data['mpp-y']);
      const result = await store.post('Slide', data);
      const slideId = result && result.insertedIds && result.insertedIds['0'];
      results.push({filename, ok: !!slideId, slideId});
    } catch (error) {
      results.push({filename, ok: false, error: String(error)});
    }
  }

  const rows = results.map((r) => {
    if (r.ok) {
      const viewUrl = `../viewer/viewer.html?slideId=${sanitize(r.slideId)}&mode=mctile`;
      return `<li>${sanitize(r.filename)} -- registered. <a href="${viewUrl}">View</a></li>`;
    }
    return `<li>${sanitize(r.filename)} -- failed: ${sanitize(r.error || 'unknown error')}</li>`;
  }).join('');
  const succeeded = results.filter((r) => r.ok).length;
  $('#warning_status').html(`<p>Registered ${succeeded} of ${results.length} file(s):</p><ul>${rows}</ul>`);
  if (succeeded > 0) showSuccessPopup(`Registered ${succeeded} slide(s)`);
}

function CheckBtn() {
  const filename = document.getElementById('filename0').value;
  handleCheck(filename, true, 1);
}

function PostBtn() {
  document.getElementById('load_status').innerHTML = '';
  const filename = document.getElementById('filename0').value;
  const slidename = document.getElementById('slidename0').value;
  const filter = document.getElementById('filter0').value;
  handlePost(filename, slidename, filter, true);
}

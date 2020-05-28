function sanitize(string) {
  string = string || ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}
var existingSlideNames = [];
var permissions;
const allowedExtensions = ['svs', 'tif', 'tiff', 'vms', 'vmu', 'ndpi', 'scn', 'mrxs', 'bif', 'svslide'];
function validateForm(callback) {
  let slide = document.getElementById('slidename0');
  // Check if input element is rendered or not
  if (slide===null) {
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    changeStatus('UPLOAD', 'Please chose a file first');
    return false;
  }
  // Check if slide name is empty
  if (slide.value === '') {
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    changeStatus('UPLOAD', 'Please enter slide name');
    return false;
  }
  // Sanitizing input
  slide.value = sanitize(slide.value);
  // Checking if silde with given name already exists
  if (existingSlideNames.includes(slide.value)) {
    changeStatus('UPLOAD', 'Slide with given name already exists');
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    return false;
  }
  // Checking for extension
  let filename = document.getElementById('filename0').value;
  var fileExtension = filename.toLowerCase().split('.').reverse()[0];
  if (!allowedExtensions.includes(fileExtension)) {
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    changeStatus('UPLOAD', fileExtension + ' files are not compatible');
    return false;
  }
  let filterInput = $('#filter0');
  if (filterInput.val()) {
    try {
      let filters = filterInput.val().replace(/'/g, '"');
      filters=JSON.parse(filters);
      if (!Array.isArray(filters)) {
        throw new Error('Filters should be an array.');
      } else {
        filterInput.removeClass('is-invalid');
        if (filterInput.parent().children().length !== 1) {
          $('#filter-feedback0').remove();
        }
      }
    } catch (err) {
      filterInput.addClass('is-invalid');
      if (filterInput.parent().children().length === 1) {
        let filterDiv = document.createElement('div');
        filterDiv.id = 'filter-feedback0';
        filterDiv.addClass('invalid-feedback');
        filterDiv.textContent = 'Filters should be an array.';
        filterInput.parent().append(filterDiv);
      }
      return false;
    }
  }
  callback();
}

// barrier -- REMOVE IF OK
let selectedFilters=[];
const HeadMapping = [{
  title: 'ID',
  field: 'oid',
}, {
  title: 'Name',
  field: 'name',
}, {
  title: 'Study',
  field: 'study',
}, {
  title: 'Specimen',
  field: 'specimen',
}, {
  title: 'MPP',
  field: 'mpp',
}];
var totaltablepages;
var selectedpage;
var allSlides;

if (getUserType() === 'Admin') {
  var slideDeleteRequests = [];
  var userCreateRequests = [];
}

function showTablePage() {
  $('#datatables tbody tr').filter(function() {
    $(this).hide();
  });

  var trs = '#datatables tbody tr';
  $(trs).slice($('#entries').val()*selectedpage, $('#entries').val()*(selectedpage+1)).filter(function() {
    $(this).show();
  });

  $(`.pages.active`).removeClass('active');
  $(`.pages:eq(${selectedpage})`).addClass('active');
}

function resetTable() {
  $('#datatables').stacktable();
  $('.pages').remove();
  $('#previous-page').after(function() {
    if (totaltablepages != 0) {
      return [...Array(totaltablepages).keys()].map((p)=>{
        return `<li class="page-item pages"><a class="page-link">${p+1}</a></li>`;
      }).join('');
    }
  });
  $('.pages').on('click', function() {
    selectedpage = parseInt($(this).text())-1;
    showTablePage();
  });
  selectedpage = 0;
  showTablePage();
}

function resetUploadForm() {
  document.getElementById('upload-form').reset();
  $('#fileIdRow').children().slice(1).remove();
  $('#filenameRow').children().slice(1).remove();
  $('#tokenRow').children().slice(1).remove();
  $('#slidenameRow').children().slice(1).remove();
  $('#filterRow').children().slice(1).remove();
  $('#json_table').html('');
  $('#load_status').html('');
  $('.custom-file-label').html('');
  hideCheckButton();
  hidePostButton();
}

function createCheckbox(val) {
  let div = document.createElement('div');
  div.classList.add('col-6');
  div.classList.add('col-md-3');
  let input = document.createElement('input');
  input.name = 'filter-val';
  input.setAttribute('type', 'checkbox');
  input.classList.add('form-check-input');
  input.onchange = handleFilterChange(input);
  input.name = val;
  input.id = val;
  input.value = val;
  input.checked = true;
  div.appendChild(input);
  let label = document.createElement('label');
  label.htmlFor = val;
  label.textContent = val;
  label.classList.add('form-check-label');
  div.appendChild(label);
  document.getElementById('filters-check').append(div);
}

function initialize() {
  let filters=getUserFilter();
  let isWildcard=false;
  allSlides = [];
  if (filters.length>1||(filters.length===1&&filters[0]!=='Public')) {
    selectedFilters = [];
    $('#filters-heading').html('<div class="col-sm-6 col-md-2"> <h5>Filters</h5> </div >');
    $('#filters-check').html('');
    let val = 'Public';
    createCheckbox(val);
    selectedFilters.push(val);
    for (let i = 0; i < filters.length; i++) {
      let val;
      if (filters[i] == '**') {
        isWildcard = true;
        continue;
      } else {
        val = filters[i];
      }
      selectedFilters.push(val);
      createCheckbox(val);
    }
    if (isWildcard) {
      val = 'Others';
      createCheckbox(val);
      selectedFilters.push(val);
    }
  }
  slideDeleteRequests = [];
  userCreateRequests = [];
  const params = getUrlVars();
  const store = new Store('../data/');
  store.findRequest()
      .then(function(requests) {
      // console.log(requests);
        if (requests && ! requests.error) {
          requests.forEach(function(req) {
            if (req.type === 'addUser') {
              userCreateRequests.push(req);
            } else {
              slideDeleteRequests.push(req);
            }
          });
        }
        store.findSlide()
            .then(function(data) {
              // filter
              if (!(Object.keys(params).length === 0 && params.constructor === Object)) {
                const keys = Object.keys(params);
                const v2 = Object.values(params);
                data = data.filter((d) => {
                  const v1 = getValues(d, keys);
                  return AND.call(this, v1, v2, eq);
                });
              }

              // mapping data
              const keys = HeadMapping.map((d) => d.field);
              if (data.map) {
                return data.map((d, counter) => {
                  // console.log('i:' + counter);
                  const rs = [];
                  if (d['filter']) {
                    rs.filterList= JSON.parse(d['filter'].replace(/'/g, '"'));
                    if (!rs.filterList.some((filter)=>(filters.indexOf(filter) > -1))) {
                      rs.filterList=['Others'];
                    }
                  } else {
                    rs.filterList= ['Public'];
                  }
                  rs.displayed=true;
                  const filename = d.location.split('/')[d.location.split('/').length - 1];
                  keys.forEach((key, i) => {
                    if (i == 0) rs.push(d['_id']['$oid']);
                    else if (!d[key]) rs.push('');
                    else rs.push(d[key]);
                  });
                  if (slideDeleteRequests['counter']) {
                    console.log(slideDeleteRequests[counter]);
                    // console.log(slideDeleteRequests[counter - 1]);
                  }
                  // console.log('Done one iter');

                  const btn = `<div id='open-delete'>
                <button class="btn btn-success" data-id='${sanitize(rs[0])}' onclick='openView(this)'>Open</button>
                <button type='button' class='btn btn-info DownloadButton' id='downloadBtn' data-id='${sanitize(rs[0])}' onclick='downloadSlide(this)' >
                <i class='fas fa-download' ></i>
                </button>
                ${
                  slideDeleteRequests[counter] && slideDeleteRequests[counter].slideDetails &&
                    slideDeleteRequests.find((o) => o.slideDetails.slideId === rs[0]) ?
                  `
                    ${
                      slideDeleteRequests.find((o) => o.requestedBy === sanitize(getUserId())) ?
                      `
                        <button type='button' class='btn btn-danger DelButton' id='deleteBtn' data-id='${sanitize(rs[0])}' data-name='${sanitize(rs[1])}' onclick='deleteSld(this)' data-reqid='${slideDeleteRequests.find((o) => o.slideDetails.slideId === rs[0]) ? slideDeleteRequests.find((o) => o.slideDetails.slideId === rs[0])._id.$oid : '' }' data-filename='${sanitize(filename)}' data-toggle='modal'>
                          Cancel Delete Request <i class='fas fa-trash-alt' ></i>
                        </button>
                      ` :
                      `
                        <button disabled type='button' class='btn btn-danger tooltipCustom' id='deleteBtn'>
                          <span class="tooltiptextCustom p-1">Delete requested by ${slideDeleteRequests.find((o) => o.slideDetails.slideId === rs[0]) ? slideDeleteRequests.find((o) => o.slideDetails.slideId === rs[0]).requestedBy : ''}</span>
                          Delete Requested <i class='fas fa-trash-alt' ></i>
                        </button>
                      `
                    }
                  ` :
                  `
                    <button type='button' class='btn btn-danger DelButton' id='deleteBtn' data-id='${sanitize(rs[0])}' data-name='${sanitize(rs[1])}' onclick='deleteSld(this)' data-filename='${sanitize(filename)}' data-toggle='modal'>
                      ${permissions.slide.delete == true ? '' : 'Request Deletion'} <i class='fas fa-trash-alt' ></i>
                    </button>
                  `
}
              </div>`;
                  rs.push(btn);
                  return rs;
                });
              } else {
                // we have no data to render! Let's add a default button
                const defaultBtn = [];
                keys.forEach((key, i) => {
                  if (i == 0) defaultBtn.push('NO DATA');
                  else defaultBtn.push('');
                });
                const btn = ``;
                defaultBtn.push(btn);
                return [defaultBtn];
              }
            })
            .then(function(data) {
              if (getUserType() === 'Admin') {
                appendNotifications(slideDeleteRequests);
              }
              return data;
            })
            .then(function(data) {
              if (data.length == 0) {
                var div = document.querySelector('.container');
                div.textContent = `No Data Found ... x _ x`;
                div.classList = `container text-center p-4`;
                return;
              }

              // Adding names to later validate for new slide names
              existingSlideNames = data.map((d) => d[1]);

              allSlides=data;

              const thead = HeadMapping.map((d, i) => `<th>${sanitize(d.title)} <span class="sort-btn fa fa-sort" data-order=${1}
              data-index=${i}>  </span> </th>`);

              thead.push('<th></th>');
              tbody = data.map((d) => {
                return '<tr>' + d.map((a) => '<td>' + a + '</td>').reduce((a, b) => a + b) + '</tr>';
              });
              let entriesPerPage;
              if ($('#entries').val()===undefined) {
                entriesPerPage=10;
              } else {
                // default value, when initially no slide
                entriesPerPage= $('#entries').val();
              }
              totaltablepages = Math.ceil(data.length/entriesPerPage);
              selectedpage = 0;
              $('#search-table').val('');

              if ( data.length>0 && $('.container').children().length===0) {
                $('.container').html(`<div>
            <div>
            <h3 class="text-center h3 mb-0">Available Slides</h3>
            <div class="row mt-2" id="filters-heading">
            </div>
            <div class="row mb-2 ml-1" id="filters-check" >
            </div>
            <div class="search-box float-left form-group form-inline">
              <select id='entries' class="select form-control mr-2">
                <option value="10" selected>10 slides/page</option>
                <option value="20">20 slides/page</option>
                <option value="40">40 slides/page</option>
                <option value="50">50 slides/page</option>
                <option value="100">100 slides/page</option>
              </select>
              <div class="form-group has-search">
                <span class="fa fa-search form-control-feedback"></span>
                  <input id="search-table" type="text" class="form-control" placeholder="Search">
                </div>
          </div>
            </div>
            <div class="table-responsive">
              <table id='datatables' class="table table-striped"></table>
            </div>
      </div >
`);
              }
              document.getElementById('datatables').innerHTML = `
        <thead>${thead.reduce((a, b) => a + b)}</thead>
        <tbody>${tbody.reduce((a, b) => a + b)}</tbody>
        <tfoot><tr><td colspan='6'>
          <nav aria-label="Slides Pages" id='tablePages' class="">
            <ul class="pagination justify-content-center">
              <li id="previous-page" class="page-item"><a class="page-link">Previous</a></li>
              ${[...Array(totaltablepages).keys()].map((p)=>{
    return `<li class="page-item pages"><a class="page-link">${p+1}</a></li>`;
  }).join('')}
              <li id="next-page" class="page-item"><a class="page-link">Next</a></li>
            </ul>
          </nav>
        </td></tr></tfoot>
      `;

              showTablePage();

              $('#search-table').on('keyup', filterSlides);

              $('.sort-btn').on('click', function(e) {
                var index = e.currentTarget.dataset.index;
                var order = parseInt(e.currentTarget.dataset.order);
                const sortedSlideRows = allSlides.sort(function(a, b) {
                  let at=a[index];
                  let bt=b[index];
                  if (!isNaN(at)&&!isNaN(bt)) {
                    at=Number(at);
                    bt=Number(bt);
                  } else {
                    at=at.toLowerCase();
                    bt=bt.toLowerCase();
                  }
                  if (order===1) {
                    e.currentTarget.dataset.order = 2;
                    if (at>bt) {
                      return 1;
                    } else if (at<bt) {
                      return -1;
                    } else {
                      return 0;
                    }
                  } else {
                    e.currentTarget.dataset.order = 1;
                    if (at < bt) {
                      return 1;
                    } else if (at > bt) {
                      return -1;
                    } else {
                      return 0;
                    }
                  }
                })
                    .filter((slide) => slide.displayed)
                    .map((slide) => {
                      return '<tr>' + slide.map((a) => '<td>' + a + '</td>').reduce((a, b) => a + b) + '</tr>';
                    })
                    .reduce((a, b) => a + b, '');
                $('#datatables > tbody').html(sortedSlideRows);
                selectedpage = 0;
                showTablePage();
              });

              $('.pages').on('click', function() {
                selectedpage = parseInt($(this).text())-1;
                showTablePage();
              });

              $('#previous-page').on('click', function() {
                if (selectedpage > 0) {
                  selectedpage--;
                  showTablePage();
                }
              });

              $('#next-page').on('click', function() {
                if (selectedpage < totaltablepages-1) {
                  selectedpage++;
                  showTablePage();
                }
              });

              $('#entries').change(function() {
                totaltablepages = Math.ceil($('#datatables tbody tr').length/$('#entries').val());
                resetTable();
                pageIndicatorVisible($('#datatables tbody tr').length);
              });
              pageIndicatorVisible($('#datatables tbody tr').length);
              resetTable();
              $('#datatables').stacktable();
              checkUserPermissions();
            });
      });
}

function AND(p, t, func) {
  return p.reduce((acc, v, i) => {
    return acc && func.call(this, v, t[i]);
  }, true);
}

function eq(v1, v2) {
  return v1 == v2;
}

function getValues(d, keys) {
  const rs = [];
  keys.forEach((key) => {
    rs.push(d[key]);
  });
  return rs;
}

function openView(e) {
  const oid = e.dataset.id;
  if (oid) {
    window.location.href = `./viewer/viewer.html?slideId=${sanitize(oid)}`;
  } else {
    alert('No Data Id');
  }
}

function hidePostButton() {
  $('#post_btn').hide();
}

function hideCheckButton() {
  $('#check_btn').hide();
}

$('[data-dismiss=modal]').on('click', resetUploadForm);

// window.addEventListener('resize', ()=>{$('#datatables').stacktable()});
$(document).ready(function() {
  $('#slideUploadButton').hide();
  checkUserPermissions();
  initialize();
  $('#deleteModal').on('hidden.bs.modal', function(e) {
    initialize();
  });
  $('#input').on('change', function() {
    var fileName = $(this).val().split('\\').pop();
    $(this).next('.custom-file-label').html(fileName);
  });
  // Hide notification nav-link
  if (getUserType() !== 'Admin') {
    $('#notifBell').html('');
  }
});

function checkUserPermissions() {
  let userType=getUserType();
  store.getUserPermissions(userType)
      .then((response) => response.text())
      .then((data) => {
        return (data ? JSON.parse(data) : null);
      })
      .then((data)=> {
        if (data===null) {
          return;
        }
        permissions = data;
        // console.log(data);
        if (permissions.slide.post == true) {
          $('#slideUploadButton').show();
        }
        if (permissions.slide.update == true) {
          $('#datatables').find('tr').each(function() {
            var currentId = $('td:nth-child(1)', this).html();
            $('td:nth-child(2)', this).css('cursor', 'default');
            $('td:nth-child(2)', this).unbind('mouseenter mouseleave');
            $('td:nth-child(2)', this).hover(function() {
              var content = $(this).html();
              $(this).html(content +`<i style='font-size: small; margin-left:1em; cursor: pointer' onclick="changeSlideName('`+content+`', '`+currentId+`')" class="fas fa-pen" data-toggle="modal" data-target="#slideNameChangeModal"></i>`);
            }, function() {
              $( this ).find( 'i' ).last().remove();
            });
          });
        }
      });
}

function changeSlideName(oldname, id) {
  let renameDiv = document.createElement('div');
  renameDiv.classList.add('form-group');
  renameDiv.innerText = 'Enter the new name for the slide having following';
  renameDiv.innerText += 'details \n\nID: ' + id + '\nName: ' + oldname;
  let renameInput = document.createElement('input');
  renameInput.setAttribute('type', 'text');
  renameInput.id = 'newSlideName';
  renameInput.classList.add('form-control');
  renameInput.setAttribute('placeholder', 'Enter new name');
  renameInput.setAttribute('aria-label', 'newSlideName');
  renameInput.required = true;
  renameDiv.append(renameInput);
  document.getElementById('confirmUpdateSlideContent').innerHTML = '';
  document.getElementById('confirmUpdateSlideContent').append(renameDiv);
  const store = new Store('../data/');
  $('#confirmUpdateSlide').unbind('click');
  $('#confirmUpdateSlide').click(function() {
    var newSlideName = $('#newSlideName');
    var newName = newSlideName.val();
    if (newName!='') {
      if (existingSlideNames.includes(newName)) {
        newSlideName.addClass('is-invalid');
        if (newSlideName.parent().children().length === 1) {
          let feedbackDiv = document.createElement('div');
          feedbackDiv.classList.add('invalid-feedback');
          feedbackDiv.textContent = 'Slide with given name already exists.';
          newSlideName.parent().append(feedbackDiv);
        }
      } else {
        newSlideName.removeClass('is-invalid');
        $('#slideNameChangeModal').modal('hide');
        store.updateSlideName(id, newName).then((response)=>{
          return response.json();
        }).then((data)=>{
          if (data['modifiedCount']==1) {
            initialize();
            showSuccessPopup('Slide updated successfully');
          }
        });
      }
    }
  });
}


function pageIndicatorVisible(tableLength) {
  if ($('#entries').val() >= tableLength) {
    $('#tablePages').css('display', 'none');
  } else if ($('#entries').val() < tableLength) {
    $('#tablePages').css('display', 'block');
  }
}

function urlUpload() {
  var url= document.getElementById('urlInput').value;
  handleUrlUpload(url);
}
function downloadSlide(e) {
  const oid = e.dataset.id;
  handleDownload(oid);
}

function deleteSld(e, cancel=false) {
  const userType = getUserType();
  const oid = e.dataset.id;
  const oname = e.dataset.name;
  const filename = e.dataset.filename;
  const reqId = e.dataset.reqid;
  // console.log('reqId ' + reqId);

  const store = new Store('../data/');
  if (oid) {
    $('#confirmDeleteContent').html(`Are you sure you want to ${reqId ? 'decline the ': ''} ${permissions.slide.delete == true ? '' : 'request to ' } delete the slide ${sanitize(oname)} with id ${sanitize(oid)} ?`);
    $('#deleteModal').modal('toggle');
    $('#confirmDelete').unbind( 'click' );
    $('#confirmDelete').click(function() {
      if (permissions.slide.delete == true && !cancel) {
        deleteSlideFromSystem(oid, filename, reqId); // Delete slide
      } else {
        if (reqId) {
          store.cancelRequestToDeleteSlide(requestId=reqId); // Cancel the delete request
        } else {
          store.requestToDeleteSlide(slideId=oid, slideName=oname, fileName=filename); // Add delete request
        }
      }
    });
  } else {
    alert('No Data Id');
  }
  return true;
}

function fileNameChange() {
  hideCheckButton(); hidePostButton();
  const fileNameInput = $('#filename0');
  const fileName = fileNameInput.val();
  let newFileName = fileName.split(' ').join('_');
  fileNameInput.val(newFileName);
  let fileExtension = newFileName.toLowerCase().split('.').reverse()[0];
  if (!allowedExtensions.includes(fileExtension)) {
    fileNameInput.addClass('is-invalid');
    let fDiv = document.createElement('div');
    fDiv.classList.add('invalid-feedback');
    fDiv.id = 'filename-feedback0';
    fDiv.textContent = fileExtension + ' files are not compatible';
    if (fileNameInput.parent().children().length===1) {
      fileNameInput.parent().append(fDiv);
    } else {
      document.getElementById('filename-feedback0').innerHTML = '';
      document.getElementById('filename-feedback0').append(fDiv);
    }
  } else {
    fileNameInput.removeClass('is-invalid');
    if (fileNameInput.parent().children().length !== 1) {
      $('#filename-feedback0').remove();
    }
  }
}
function switchToFile() {
  $('.urlUploadClass').css('display', 'none');
  $('.fileInputClass').css('display', 'block');
  $('#urlswitch').css('display', 'block');
  $('#fileswitch').css('display', 'none');
  $('#uploadLoading').css('display', 'none');
}

function switchToUrl() {
  $('.urlUploadClass').css('display', 'flex');
  $('.fileInputClass').css('display', 'none');
  $('#urlswitch').css('display', 'none');
  $('#fileswitch').css('display', 'block');
}

function isValidHttpUrl(urlstring) {
  try {
    url = new URL(urlstring);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:';
}

function urlInputChange() {
  const urlInput = $('#urlInput');
  const url = urlInput.val();

  if (!isValidHttpUrl(url)) {
    urlInput.addClass('is-invalid');
    if (urlInput.parent().children().length === 2) {
      let fDiv = document.createElement('div');
      fDiv.classList.add('invalid-feedback');
      fDiv.id = 'inputUrl-feedback0';
      fDiv.textContent = 'Enter valid URL';
      urlInput.parent().append(fDiv);
    }
  } else {
    urlInput.removeClass('is-invalid');
    if (urlInput.parent().children().length !== 2) {
      $('#inputUrl-feedback0').remove();
    }
    urlUpload();
  }
}


function handleUserCreationRequests(e, cancel=false) {
  const userType = getUserType();
  const reqId = e.dataset.reqid;

  if (cancel) {
    store.cancelRequestToCreateUser(reqId);
  } else {
    const email = e.dataset.email;
    const userType = e.dataset.usertype;
    const userFilter = JSON.parse(e.dataset.filter.replace(/'/g, '"'));
    store.cancelRequestToCreateUser(reqId, onlyRequestCancel=false).then(() => {
      store.acceptRequestToDeleteSlide(email, userFilter, userType);
    });
  }
}


function appendNotifications(slideDeleteRequests) {
  $('#notification-nav-link').html('');
  $('#delReqTab').html('');
  $('#userReqTab').html('');
  $('#delReqBadge').html('');
  $('#userReqBadge').html('');
  if (slideDeleteRequests.length + userCreateRequests.length > 0) {
    $('#notification-nav-link').html(`<span class="badge badge-pill badge-warning">${slideDeleteRequests.length + userCreateRequests.length}</span>`);
    if (slideDeleteRequests.length > 0) {
      $('#delReqBadge').html(`<span class="badge ml-2 badge-pill badge-warning">${slideDeleteRequests.length}</span>`);
      slideDeleteRequests.forEach((notif, i) => {
        $('#delReqTab').append(
            `
            <div class="row pt-1 pb-2">
              <div class="col-lg-3 col-sm-3 col-3 text-center">
                <span class="fas fa-trash-alt fa-2x pt-4"></span>
                </div>
                <div class="col-lg-8 col-sm-8 col-8">
                  <strong class="text-info">Slide Delete Requested</strong>
                <div class="mb-2">
                  Delete requested by: <br>
                  User: ${sanitize(notif.requestedBy)} <br>
                  Slide Name: ${sanitize(notif.slideDetails.slideName)}
                </div>
                <div class="row">
                  <div class="col-6"><button data-id="${sanitize(notif.slideDetails.slideId)}" data-filename="${sanitize(notif.slideDetails.fileName)}" data-reqid='${sanitize(notif._id.$oid)}' data-name="${sanitize(notif.slideDetails.slideName)}" onclick='deleteSld(this);' class="btn btn-info btn-sm">Accept</button></div>
                  <div class="col-6"><button data-id="${sanitize(notif.slideDetails.slideId)}" onclick='deleteSld(this, cancel=true);' data-reqid='${sanitize(notif._id.$oid)}' class="btn btn-secondary btn-sm">Decline</button></div>
                </div>
              </div>
            </div>
            <hr>
          `,
        );
      });
    } else {
      let drDiv = document.createElement('div');
      drDiv.classList.add('row');
      let drDiv2 = document.createElement('div');
      drDiv2.classList.add('col-12');
      drDiv2.classList.add('text-center ');
      drDiv2.classList.add('text');
      drDiv2.classList.add('text-muted');
      drDiv2.classList.add('p-3');
      drDiv2.innerText = 'No Delete Requests to Show';
      drDiv.appendChild(drDiv2);
      document.getElementById('delReqTab').append(drDiv);
    }
    if (userCreateRequests.length > 0) {
      let notifSpan = document.createElement('span');
      notifSpan.classList.add('badge');
      notifSpan.classList.add('ml-2');
      notifSpan.classList.add('badge-pill');
      notifSpan.classList.add('badge-warning');
      notifSpan.textContent = userCreateRequests.length;
      document.getElementById('userReqBadge').innerHTML = '';
      document.getElementById('userReqBadge').append(notifSpan);
      userCreateRequests.forEach((notif, i) => {
        console.log(notif);
        let d1 = document.createElement('div');
        d1.classList.add('row');
        d1.classList.add('pt-1');
        d1.classList.add('pb-2');
        let d2 = document.createElement('div');
        let s1 = document.createElement('span');
        s1.classList.add('fas');
        s1.classList.add('fa-user');
        s1.classList.add('fa-2x');
        s1.classList.add('pt-5');
        d2.appendChild(s1);
        d1.appendChild(d2);
        let d3 = document.createElement('div');
        d3.classList.add('col-lg-8');
        d3.classList.add('col-sm-8');
        d3.classList.add('col-8');
        let d3b = document.createElement('strong');
        d3b.textContent = 'User Registration Requested';
        d3.appendChild(d3b);
        let d4 = document.createElement('div');
        d4.classList.add('mb-2');
        d4.innerText = 'Requested by: \n' + notif.requestedBy + '\nUser details:\n';
        d4.innerText += 'Email: ' + notif.userDetails.email + '\nFilters: ';
        d4.innerText += JSON.parse(notif.userDetails.userFilter.replace(/'/g, '"')).join(', ');
        d4.innerText += '\nType: ' + notif.userDetails.userType;
        d3.appendChild(d4);
        let d5 = document.createElement('div');
        d5.classList.add('col-lg-8');
        d5.classList.add('col-sm-8');
        d5.classList.add('col-8');
        let d6 = document.createElement('div');
        d6.classList.add('row');
        let d7 = document.createElement('div');
        d7.classList.add('col-6');
        let btn1 = document.createElement('button');
        btn1.setAttribute('data-email', notif.userDetails.email);
        btn1.setAttribute('data-filter', notif.userDetails.userFilter);
        btn1.setAttribute('data-reqid', notif._id.$oid);
        btn1.setAttribute('data-usertype', notif.userDetails.userType);
        btn1.onclick = handleUserCreationRequests(btn1);
        btn1.classList.add('btn');
        btn1.classList.add('btn-info');
        btn1.classList.add('btn-sm');
        btn1.textContent = 'Accept';
        d7.appendChild(btn1);
        d6.appendChild(d7);
        let d8 = document.createElement('div');
        d8.classList.add('col-6');
        let btn2 = document.createElement('button');
        btn2.setAttribute('data-reqid', notif._id.$oid);
        btn2.onclick = handleUserCreationRequests(btn2, cancel=true);
        btn2.classList.add('btn');
        btn2.classList.add('btn-secondary');
        btn2.classList.add('btn-sm');
        btn2.textContent = 'Decline';
        d8.appendChild(btn2);
        d6.appendChild(d8);
        d5.appendChild(d6);
        d3.appendChild(d5);
        d1.appendChild(d3);
        let hr1 = document.createElement('hr');
        d1.appendChild(hr1);
        document.getElementById(userReqTab).appendChild(d1);
      });
    } else {
      $('#userReqTab').append(
          `
        <div class="row">
          <div class="col-12 text-center text text-muted p-3">
            <i>No user registration requests to show</i>
          </div>
        </div>
        `,
      );
    }
  }
}

function handleFilterChange(target) {
  let index= selectedFilters.indexOf(target.value);
  if (target.checked && index < 0) {
    selectedFilters.push(target.value);
    filterSlides();
  } else
  if (!target.checked && index >= 0) {
    selectedFilters.splice(index, 1);
    filterSlides();
  }
}

function filterSlides() {
  let value = String($('#search-table').val()).toLowerCase();
  let filters = getUserFilter();
  let filteredSlides;
  if (filters.length > 1 || (filters.length === 1 && filters[0] !== 'Public')) {
    filteredSlides = allSlides.filter(function(slide) {
      var slideFilters = slide.filterList;
      let found = false;
      for (let i = 0; i < selectedFilters.length; i++) {
        if (slideFilters.indexOf(selectedFilters[i]) > -1) {
          found = true;
          break;
        }
      }
      if (!found) {
        slide.displayed=false;
      }
      return found;
    });
  } else {
    filteredSlides=allSlides;
  }
  const searchedSlides = filteredSlides.filter(function(slide) {
    var ind = slide.slice(0, 5).reduce(function(a, b) {
      return a +' '+ b;
    }, ' ').toLowerCase().indexOf(value);
    if (ind > -1) {
      slide.displayed=true;
      return true;
    } else {
      slide.displayed=false;
      return false;
    }
  });
  const newSlideRows = searchedSlides.map((d) => {
    return '<tr>' + d.map((a) => '<td>' + a + '</td>').reduce((a, b) => a + b) + '</tr>';
  });
  $('#datatables tbody').html(newSlideRows.reduce((a, b) => a + b, ''));
  totaltablepages = Math.ceil(newSlideRows.length / $('#entries').val());
  resetTable();
  pageIndicatorVisible(newSlideRows.length);
}

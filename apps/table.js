function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}
var existingSlideNames = [];
var permissions;
const allowedExtensions = ['svs', 'tif', 'tiff', 'vms', 'vmu', 'ndpi', 'scn', 'mrxs', 'bif', 'svslide'];
function validateForm(callback) {
  let slide = document.getElementById("slidename0");
  // Check if input element is rendered or not
  if(slide===null) {
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    changeStatus("UPLOAD", "Please chose a file first");
    return false;
  }
  //Check if slide name is empty
  if (slide.value === "") {
      finishUploadSuccess = false;
      $('#check_btn').hide();
      $('#post_btn').hide();
      changeStatus("UPLOAD", "Please enter slide name");
      return false;
  }
  //Sanitizing input
  slide.value = sanitize(slide.value);
  //Checking if silde with given name already exists
  if(existingSlideNames.includes(slide.value)) {
    changeStatus("UPLOAD", "Slide with given name already exists");
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    return false;
  }
  //Checking for extension
  let filename = document.getElementById("filename0").value
  var fileExtension = filename.toLowerCase().split('.').reverse()[0];
  if(!allowedExtensions.includes(fileExtension)) {
    finishUploadSuccess = false;
    $('#check_btn').hide();
    $('#post_btn').hide();
    changeStatus("UPLOAD", fileExtension + " files are not compatible");
    return false;
  }
  let filterInput = $("#filter0");
  if(filterInput.val())
  {
    try
    {
    let filters = filterInput.val().replace(/'/g, '"')
    filters=JSON.parse(filters);
    if(!Array.isArray(filters))
      throw new Error("Filters should be an array.")
    else
      {
        filterInput.removeClass('is-invalid');
        if (filterInput.parent().children().length !== 1) {
        $('#filter-feedback0').remove();
      }
      }
    }
    catch(err)
    {
      filterInput.addClass('is-invalid');
      if (filterInput.parent().children().length === 1) {
        filterInput.parent().append(`<div class="invalid-feedback" id="filter-feedback0">
      Filters should be an array.</div>`);
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
  field: 'oid'
}, {
  title: 'Name',
  field: 'name'
}, {
  title: 'Study',
  field: 'study'
}, {
  title: 'Specimen',
  field: 'specimen'
}, {
  title: 'MPP',
  field: 'mpp'
}];
var totaltablepages;
var selectedpage;
var allSlides;

if (getUserType() === "Admin") {
  var slideDeleteRequests = [];
  var userCreateRequests = [];
}

function showTablePage(){
  $("#datatables tbody tr").filter(function(){
    $(this).hide();
  });

  var trs = "#datatables tbody tr";
  $(trs).slice($("#entries").val()*selectedpage, $("#entries").val()*(selectedpage+1)).filter(function(){
    $(this).show();
  });

  $(`.pages.active`).removeClass("active");
  $(`.pages:eq(${selectedpage})`).addClass("active");
}

function resetTable(){
  $('#datatables').stacktable();
  $(".pages").remove();
  $("#previous-page").after(function(){
    if(totaltablepages != 0)
    return [...Array(totaltablepages).keys()].map((p)=>{
          return `<li class="page-item pages"><a class="page-link">${p+1}</a></li>`;
        }).join('');
  });
  $(".pages").on('click', function(){
    selectedpage = parseInt($(this).text())-1;
    showTablePage();
  });
  selectedpage = 0;
  showTablePage();
}

function resetUploadForm()
{
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
    $("#filters-check").append(`<div class="col-6 col-md-3">
    <input name="filter-val" type="checkbox"
      class="form-check-input" onchange="handleFilterChange(this)" name=${val} id=${val} value=${val} checked="true">
  <label for=${val} class="form-check-label">
      ${val}
      </label>
    </div>`);
}

function initialize() {
  let filters=getUserFilter();
  let isWildcard=false;
  allSlides = [];
  if(filters.length>1||(filters.length===1&&filters[0]!=="Public"))
  {
      selectedFilters = [];
      $("#filters-heading").html('<div class="col-sm-6 col-md-2"> <h5>Filters</h5> </div >')
      $("#filters-check").html('');
      let val = "Public";
      createCheckbox(val);
      selectedFilters.push(val);
      for (let i = 0; i < filters.length; i++) {
        let val;
        if (filters[i] == '**') {
          isWildcard = true;
          continue;
        }
        else
          val = filters[i];
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
    .then(function (requests) {
      // console.log(requests);
      if (requests && ! requests.error) {
        requests.forEach(function(req) {
          if(req.type === "addUser") {
            userCreateRequests.push(req);
          } else {
            slideDeleteRequests.push(req);
          }
        })
      }
      store.findSlide()
      .then(function (data) {
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
        const keys = HeadMapping.map(d => d.field);
        if (data.map) {
          return data.map((d, counter) => {
            // console.log('i:' + counter);
            const rs = [];
            if(d['filter'])
              {
              rs.filterList= JSON.parse(d['filter'].replace(/'/g, '"'));
              if(!rs.filterList.some((filter)=>(filters.indexOf(filter) > -1)))
                rs.filterList=['Others'];
              }
            else
              rs.filterList= ["Public"];
            rs.displayed=true;
            const filename = d.location.split('/')[d.location.split('/').length - 1];
            keys.forEach((key, i) => {
              if (i == 0) rs.push(d['_id']['$oid'])
              else if (!d[key]) rs.push('')
              else rs.push(d[key])
            });
            // console.log(d);
            // if (getUserType() === "Admin") {
            // 	if (d.deleteRequest) {
            // 		slideDeleteRequests.push({
            // 			'slideId': d._id.$oid,
            // 			'requestedBy': d.deleteRequest.requestedBy,
            // 			'slideName': d.deleteRequest.slideName,
            // 			'fileName':  filename,
            // 		});
            // 	}
            // }
            // console.log('reqId:' + slideDeleteRequests.find(o => o.slideDetails.slideId === rs[0])._id.$oid );
            // console.log(rs[0]);
            // console.log(typeof(rs[0]));
            // console.log(counter);
            // console.log(slideDeleteRequests);
            if (slideDeleteRequests['counter']) {

            console.log(slideDeleteRequests[counter]);
            // console.log(slideDeleteRequests[counter - 1]);
            }
            // console.log('Done one iter');

            const btn = `<div id='open-delete'>
                <button class="btn btn-success" data-id='${rs[0]}' onclick='openView(this)'>Open</button>
                <button type='button' class='btn btn-info DownloadButton' id='downloadBtn' data-id='${rs[0]}' onclick='downloadSlide(this)' > <i class='fas fa-download' ></i> </button>
                ${
                  slideDeleteRequests[counter] && slideDeleteRequests[counter].slideDetails && slideDeleteRequests.find(o => o.slideDetails.slideId === rs[0]) ?
                  `
                    ${
                      slideDeleteRequests.find(o => o.requestedBy === getUserId()) ?
                      `
                        <button type='button' class='btn btn-danger DelButton' id='deleteBtn' data-id='${rs[0]}' data-name='${rs[1]}' onclick='deleteSld(this)' data-reqid='${slideDeleteRequests.find(o => o.slideDetails.slideId === rs[0]) ? slideDeleteRequests.find(o => o.slideDetails.slideId === rs[0])._id.$oid : "" }' data-filename='${filename}' data-toggle='modal'>
                          Cancel Delete Request <i class='fas fa-trash-alt' ></i>
                        </button>
                      ` :
                      `
                        <button disabled type='button' class='btn btn-danger tooltipCustom' id='deleteBtn'>
                          <span class="tooltiptextCustom p-1">Delete requested by ${slideDeleteRequests.find(o => o.slideDetails.slideId === rs[0]) ? slideDeleteRequests.find(o => o.slideDetails.slideId === rs[0]).requestedBy : ""}</span>
                          Delete Requested <i class='fas fa-trash-alt' ></i>
                        </button>
                      `
                    }
                  ` :
                  `
                    <button type='button' class='btn btn-danger DelButton' id='deleteBtn' data-id='${rs[0]}' data-name='${rs[1]}' onclick='deleteSld(this)' data-filename='${filename}' data-toggle='modal'>
                      ${permissions.slide.delete == true ? "" : "Request Deletion"} <i class='fas fa-trash-alt' ></i>
                    </button>
                  `
                }
              </div>`
            rs.push(btn);
            return rs;
          });
        } else {
          // we have no data to render! Let's add a default button
          const default_btn = [];
          keys.forEach((key, i) => {
            if (i == 0) default_btn.push("NO DATA")
            else default_btn.push('')
          });
          const btn = ``;
          default_btn.push(btn);
          return [default_btn];
        }
      })
      .then(function (data) {
        if(getUserType() === "Admin") {
          appendNotifications(slideDeleteRequests);
        }
        return data;
      })
      .then(function (data) {
        if (data.length == 0) {
          var div = document.querySelector('.container');
          div.textContent = `No Data Found ... x _ x`;
          div.classList = `container text-center p-4`;
          return;
        }

        //Adding names to later validate for new slide names
        existingSlideNames = data.map(d => d[1]);

        allSlides=data;

        const thead = HeadMapping.map((d,i) => `<th>${d.title}	<span class="sort-btn fa fa-sort" data-order=${1}
           data-index=${i}>  </span> </th>`);

        thead.push("<th></th>");
        tbody = data.map((d) => {
          return "<tr>" + d.map((a) => "<td>" + a + "</td>").reduce((a, b) => a + b) + "</tr>";
        });
        let entriesPerPage;
        if($('#entries').val()===undefined)
          entriesPerPage=10; // default value, when initially no slide
        else
          entriesPerPage= $('#entries').val();
        totaltablepages = Math.ceil(data.length/entriesPerPage);
        selectedpage = 0;
        $("#search-table").val("");

        if( data.length>0 && $('.container').children().length===0)
        {
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
        document.getElementById("datatables").innerHTML = `
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

      $("#search-table").on("keyup",filterSlides);

      $(".sort-btn").on("click", function(e) {
        var index = e.currentTarget.dataset.index;
        var order = parseInt(e.currentTarget.dataset.order);
        const sortedSlideRows = allSlides.sort(function(a, b) {
          let at=a[index];
          let bt=b[index];
          if(!isNaN(at)&&!isNaN(bt))
          {
            at=Number(at);
            bt=Number(bt);
          }
          else
          {
            at=at.toLowerCase();
            bt=bt.toLowerCase();
          }
          if(order===1)
          {
            e.currentTarget.dataset.order = 2;
            if(at>bt)
              return 1;
            else if(at<bt)
              return -1;
            else
              return 0;
          }
          else
          {
            e.currentTarget.dataset.order = 1;
            if (at < bt)
              return 1;
            else if (at > bt)
              return -1;
            else
              return 0;
          }
        })
        .filter(slide => slide.displayed)
        .map((slide) => {
            return "<tr>" + slide.map((a) => "<td>" + a + "</td>").reduce((a, b) => a + b) + "</tr>";
          })
        .reduce((a, b) => a + b, "")
        $("#datatables > tbody").html(sortedSlideRows)
        selectedpage = 0;
        showTablePage();
      });

      $(".pages").on('click', function(){
        selectedpage = parseInt($(this).text())-1;
        showTablePage();
      });

      $("#previous-page").on('click', function(){
        if(selectedpage > 0){
          selectedpage--;
          showTablePage();
        }
      });

      $("#next-page").on('click', function(){
        if(selectedpage < totaltablepages-1){
          selectedpage++;
          showTablePage();
        }
      })

      $("#entries").change(function(){
        totaltablepages = Math.ceil($("#datatables tbody tr").length/$("#entries").val());
        resetTable();
        pageIndicatorVisible($("#datatables tbody tr").length);
      });
    pageIndicatorVisible($("#datatables tbody tr").length);
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
  keys.forEach(key => {
    rs.push(d[key]);
  });
  return rs;
}

function openView(e) {
  const oid = e.dataset.id;
  if (oid) {
    window.location.href = `./viewer/viewer.html?slideId=${oid}`;
  } else {
    alert('No Data Id');
  }
}

function hidePostButton()
{
  $('#post_btn').hide();
}

function hideCheckButton()
{
  $('#check_btn').hide();
}

$('[data-dismiss=modal]').on('click', resetUploadForm);

//window.addEventListener('resize', ()=>{$('#datatables').stacktable()});
$(document).ready(function(){
  $("#slideUploadButton").hide();
  checkUserPermissions();
  initialize();
  $('#deleteModal').on('hidden.bs.modal', function (e) {
    initialize();
  });
  $('#input').on('change',function(){
    var fileName = $(this).val().split('\\').pop();
    $(this).next('.custom-file-label').html(fileName);
  });
  // Hide notification nav-link
  if (getUserType() !== "Admin") {
    $('#notifBell').html('');
  }
});

function checkUserPermissions(){
  let userType=getUserType();
  store.getUserPermissions(userType)
  .then(response => response.text())
  .then((data) => {
  return (data ? JSON.parse(data) : null);
  })
  .then((data)=> {
    if(data===null)
      return;
    permissions = data;
    // console.log(data);
    if(permissions.slide.post == true)
      $("#slideUploadButton").show();
    if(permissions.slide.update == true){
      $("#datatables").find("tr").each(function(){
        var currentId = $("td:nth-child(1)", this).html();
        $("td:nth-child(2)", this).css("cursor","default");
        $("td:nth-child(2)", this).unbind('mouseenter mouseleave');
        $("td:nth-child(2)", this).hover(function(){
          var content = $(this).html();
          $(this).html(content +`<i style='font-size: small; margin-left:1em; cursor: pointer' onclick="changeSlideName('`+content+`', '`+currentId+`')" class="fas fa-pen" data-toggle="modal" data-target="#slideNameChangeModal"></i>`)
        }, function(){
          $( this ).find( "i" ).last().remove();
        });
      });
    }
  });
}

function changeSlideName(oldname, id){
  $('#confirmUpdateSlideContent').html('Enter the new name for the slide having following details: <br><br><b>id</b>: '+id+'<br>'+'<b>Name</b>: '+oldname
      + '<br><br><div class="form-group"><input type="text" id="newSlideName" class="form-control" placeholder="Enter new name" aria-label="newSlideName" required></div>');
  const store = new Store('../data/');
  $('#confirmUpdateSlide').unbind('click');
  $('#confirmUpdateSlide').click(function(){
    var newSlideName = $("#newSlideName");
    var newName = newSlideName.val();
    if(newName!=''){
      if(existingSlideNames.includes(newName)) {
        newSlideName.addClass('is-invalid');
      if (newSlideName.parent().children().length === 1) {
          newSlideName.parent().append(`<div class="invalid-feedback">
        Slide with given name already exists. </div>`);
        }
      }
      else {
        newSlideName.removeClass('is-invalid');
        $('#slideNameChangeModal').modal('hide')
        store.updateSlideName(id, newName).then((response)=>{
          return response.json();
        }).then((data)=>{
          if(data['modifiedCount']==1)
            {
              initialize();
              showSuccessPopup('Slide updated successfully');
          }
      });
      }
    }
  });
}


function pageIndicatorVisible(tableLength){
  if($("#entries").val() >= tableLength)
    $("#tablePages").css("display","none");
  else if($("#entries").val() < tableLength)
    $("#tablePages").css("display","block");
}

function urlUpload(){
  var url= document.getElementById("urlInput").value;
  handleUrlUpload(url);
}
function downloadSlide(e){
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
    $('#confirmDeleteContent').html(`Are you sure you want to ${reqId ? 'decline the ': ''} ${permissions.slide.delete == true ? '' : 'request to ' } delete the slide ${oname} with id ${oid} ?`);
    // $('#confirmDeleteContent').html(`Are you sure you want to ${reqId ? 'decline the ': ''} ${getUserType() === "Admin" ? '' : 'request to ' } delete the slide ${oname} with id ${oid} ?`);
    $('#deleteModal').modal('toggle');
    $("#confirmDelete").unbind( "click" );
    $("#confirmDelete").click(function(){
      if (permissions.slide.delete == true && !cancel) {
      // if (getUserType() === "Admin" && !cancel) {
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

function fileNameChange()
{
  hideCheckButton(); hidePostButton();
  const fileNameInput = $('#filename0');
  const fileName = fileNameInput.val();
  let newFileName = fileName.split(" ").join("_");
  fileNameInput.val(newFileName);
  let fileExtension = newFileName.toLowerCase().split('.').reverse()[0];
  if (!allowedExtensions.includes(fileExtension)) {
    fileNameInput.addClass('is-invalid');
    if(fileNameInput.parent().children().length===1)
    {
      fileNameInput.parent().append(`<div class="invalid-feedback" id="filename-feedback0">
        ${fileExtension} files are not compatible  </div>`);
    }
    else
    {
      $('#filename-feedback0').html(`${ fileExtension } files are not compatible`)
    }
  }
  else
  {
    fileNameInput.removeClass('is-invalid');
    if (fileNameInput.parent().children().length !== 1) {
    $('#filename-feedback0').remove();
    }
  }
}
function switchToFile(){
  $(".urlUploadClass").css("display","none");
  $(".fileInputClass").css("display","block");
  $("#urlswitch").css("display","block");
  $("#fileswitch").css("display","none");
  $('#uploadLoading').css('display', 'none');
}

function switchToUrl(){
  $(".urlUploadClass").css("display","flex");
  $(".fileInputClass").css("display","none");
  $("#urlswitch").css("display","none");
  $("#fileswitch").css("display","block");
}

function isValidHttpUrl(urlstring) {
  try {
    url = new URL(urlstring);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:";
  }

function urlInputChange()
{
  const urlInput = $('#urlInput');
  const url = urlInput.val();

  if (!isValidHttpUrl(url)) {
    urlInput.addClass('is-invalid');
    if (urlInput.parent().children().length === 2) {
      urlInput.parent().append(`<div class="invalid-feedback" id="inputUrl-feedback0">
        Enter valid URL </div>`);
    }

  }
  else
  {
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
    })
  }
}


function appendNotifications(slideDeleteRequests) {
  $('#notification-nav-link').html(``);
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
                  User: ${notif.requestedBy} <br>
                  Slide Name: ${notif.slideDetails.slideName}
                </div>
                <div class="row">
                  <div class="col-6"><button data-id="${notif.slideDetails.slideId}" data-filename="${notif.slideDetails.fileName}" data-reqid='${notif._id.$oid}' data-name="${notif.slideDetails.slideName}" onclick='deleteSld(this);' class="btn btn-info btn-sm">Accept</button></div>
                  <div class="col-6"><button data-id="${notif.slideDetails.slideId}" onclick='deleteSld(this, cancel=true);' data-reqid='${notif._id.$oid}' class="btn btn-secondary btn-sm">Decline</button></div>
                </div>
              </div>
            </div>
            <hr>
          `
        );
      });
    } else {
      $('#delReqTab').append(
        `
        <div class="row">
          <div class="col-12 text-center text text-muted p-3">
            <i>No delete requests to show</i>
          </div>
        </div>
        `
      );
    }
    if (userCreateRequests.length > 0) {
      $('#userReqBadge').html(`<span class="badge ml-2 badge-pill badge-warning">${userCreateRequests.length}</span>`);
      userCreateRequests.forEach((notif, i) => {
        console.log(notif);
        $('#userReqTab').append(
          `
            <div class="row pt-1 pb-2">
              <div class="col-lg-3 col-sm-3 col-3 text-center">
                <span class="fas fa-user fa-2x pt-5"></span>
                </div>
                <div class="col-lg-8 col-sm-8 col-8">
                  <strong class="text-info">User Registration Requested</strong>
                <div class="mb-2">
                  Requested by: <br>
                  ${notif.requestedBy} <br>
                  User details: <br>
                  Email: ${notif.userDetails.email} <br>
                  Filters: ${JSON.parse(notif.userDetails.userFilter.replace(/'/g, '"')).join(', ')} <br>
                  Type: ${notif.userDetails.userType}
                </div>
                <div class="row">
                  <div class="col-6"><button data-email="${notif.userDetails.email}" data-filter="${notif.userDetails.userFilter}" data-reqid='${notif._id.$oid}' data-usertype="${notif.userDetails.userType}" onclick='handleUserCreationRequests(this);' class="btn btn-info btn-sm">Accept</button></div>
                  <div class="col-6"><button onclick='handleUserCreationRequests(this, cancel=true);' data-reqid='${notif._id.$oid}' class="btn btn-secondary btn-sm">Decline</button></div>
                </div>
              </div>
            </div>
            <hr>
          `
        );
      });
    } else {
      $('#userReqTab').append(
        `
        <div class="row">
          <div class="col-12 text-center text text-muted p-3">
            <i>No user registration requests to show</i>
          </div>
        </div>
        `
      );
    }
  }
}

function handleFilterChange(target)
{
  let index= selectedFilters.indexOf(target.value);
  if(target.checked &&  index < 0)
    {
      selectedFilters.push(target.value);
      filterSlides();
    }
  else
  if(!target.checked && index >= 0)
    {
      selectedFilters.splice(index,1);
      filterSlides();
    }
}

function filterSlides()
{
let value = String($("#search-table").val()).toLowerCase();
let filters = getUserFilter();
let filteredSlides;
if (filters.length > 1 || (filters.length === 1 && filters[0] !== "Public"))
{
filteredSlides = allSlides.filter(function (slide) {
  var slideFilters = slide.filterList;
  let found = false;
  for (let i = 0; i < selectedFilters.length; i++) {
    if (slideFilters.indexOf(selectedFilters[i]) > -1) {
      found = true;
      break;
    }
  }
  if(!found)
    slide.displayed=false;
  return found;
});
}
else
filteredSlides=allSlides;
const searchedSlides = filteredSlides.filter(function (slide) {
  var ind = slide.slice(0,5).reduce(function (a, b) {
    return a +" "+ b;
  }, " ").toLowerCase().indexOf(value);
  if (ind > -1) {
    slide.displayed=true;
    return true;
  }
  else
    {
      slide.displayed=false;
      return false;
    }
});
const newSlideRows = searchedSlides.map((d) => {
  return "<tr>" + d.map((a) => "<td>" + a + "</td>").reduce((a, b) => a + b) + "</tr>";
});
$("#datatables tbody").html(newSlideRows.reduce((a, b) => a + b,""))
totaltablepages = Math.ceil(newSlideRows.length / $("#entries").val());
resetTable();
pageIndicatorVisible(newSlideRows.length);
}

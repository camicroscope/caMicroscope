$(function() {
  $('#selected-slide, #unselected-slide')
      .sortable({
        connectWith: '.list-group',
        opacity: 0.85,
        activate: (e, ui) => {
          if (ui.item && ui.sender) {
            ui.item.data('status', 'activate');
            ui.item.find('input[type=checkbox]').addClass('d-none');
            if (ui.sender.attr('id') == 'selected-slide') {
              ui.item.find('.fas.fa-times.text-danger').addClass('d-none');
            }
            if (ui.sender.attr('id') == 'unselected-slide') {
              ui.item.find('.fas.fa-plus.text-primary').addClass('d-none');
            }
          }
        },
        deactivate: (e, ui) => {
          if (ui.item.data('status') == 'receive') return;
          if (ui.item && ui.sender) {
            ui.item.find('input[type=checkbox]').removeClass('d-none');
            if (ui.sender.attr('id') == 'selected-slide') {
              ui.item.find('.fas.fa-times.text-danger').removeClass('d-none');
            }
            if (ui.sender.attr('id') == 'unselected-slide') {
              ui.item.find('.fas.fa-plus.text-primary').removeClass('d-none');
            }
          }
        },
        receive: (e, ui) => {
          if (ui.item && ui.sender) {
            ui.item.data('status', 'receive');
            ui.item.find('input[type=checkbox]').removeClass('d-none');
            ui.item.find('input[type=checkbox]').prop('checked', false);
            if (ui.sender.attr('id') == 'selected-slide') {
              ui.item.find('.fas.fa-times.text-danger').addClass('d-none');
              ui.item.find('.fas.fa-plus.text-primary').removeClass('d-none');
            }
            if (ui.sender.attr('id') == 'unselected-slide') {
              ui.item.find('.fas.fa-times.text-danger').removeClass('d-none');
              ui.item.find('.fas.fa-plus.text-primary').addClass('d-none');
            }
          }
        },
      })
      .disableSelection();

  $('[data-toggle="tooltip"]').tooltip({delay: {'show': 1000, 'hide': 1000}});
});

//  $('#del-modal').modal();
// $('#edit-modal').modal('show');
const store = new Store('../../../data/');

store.getAllCollection().then((data) => {
  if (data) {
    data.forEach((d) => {
      const colCard = createColItem(d);
      $('#main-grid').append(colCard);
    });
  } else {
    // error
  }
});

$('#search-table').on('change keyup', (e) => search(e.target.value));
$('#edit-modal input[type=text].search').on('change keyup', (e) => slideSearch(e.target));

function createColItem(data) {
  const html = `
  <div id ='${data._id['$oid']}' class='card col-card bg-light'>
    <div class='card-body'>
      <div class='card-title d-flex align-items-center justify-content-between mb-1'>
        <div class='text-in-line font-weight-bold pr-2'>${data.name}</div>
        <span class='badge badge-primary badge-pill' data-toggle='tooltip' data-placement='bottom' title='# Of Slides'>${data.slides.length}</span>
      </div>
      <p class='card-text text-muted'>${data.description}</p>
      <div class='d-flex align-items-center justify-content-between'>
        <div href='#' class='btn btn-sm btn-primary' data-toggle='tooltip' data-placement='top' title='Edit' onclick='openEditor("${data._id['$oid']}")'><i class='fas fa-cog'></i></div>
        <div href='#' class='btn btn-sm btn-danger' data-toggle='tooltip' data-placement='top' title='Delete' onclick='openDelConfirm("${data._id['$oid']}","${data.name}")'><i class='fas fa-trash-alt'></i></div>
      </div>
    </div>
  </div>`;
  const elt = $.parseHTML(html);
  $(elt).find('[data-toggle="tooltip"]').tooltip({delay: {'show': 1000, 'hide': 1000}});
  return elt;
}

function search(pattern) {
  const regex = new RegExp(pattern, 'gi');

  $('.card.col-card').each((idx, elt) => {
    const text = $(elt).find('.text-in-line').text();
    text.match(regex) ? $(elt).show() : $(elt).hide();
  });
}

function slideSearch(target) {
  const pid = $(target).data('target');
  const pattern = target.value;
  const regex = new RegExp(pattern, 'gi');

  $(`#${pid} li`).each((idx, li) => {
    const text = $(li).find('.text-in-line').text();
    if (text.match(regex)) {
      $(li).show();
      $(li).addClass('d-flex');
    } else {
      $(li).hide();
      $(li).removeClass('d-flex');
    }
  });
}

function openEditor(id) {
  clearEditor();
  const Promises = [];
  if (id) {
    Promises.push(store.getCollection(id));
  } else {
    Promises.push([]);
  }
  Promises.push(store.findSlide());
  Promise.all(Promises).then((rs) => {
    const colData = rs[0];
    const slideData = rs[1];
    setEditor(id ? colData[0] : null, slideData);
    $('#edit-modal').modal('show');
  });

  // store.findSlide().then(data => {
  //   // TODO error check

  // })
}
function openDelConfirm(id, name) {
  $('#del-modal .modal-body span').text(name);

  $('#del-modal .modal-footer .btn.btn-sm.btn-danger').on('click', (elt) => {
    delCollection(id);
    $('#del-modal .modal-footer .btn.btn-sm.btn-danger').off('click');
  });
  $('#del-modal').modal('show');
}

function delCollection(id) {
  // TODO remove from db
  store.deleteCollection(id).then((resp) => {
    console.log('del', resp);
    const name = $(`#${id}`).find('.text-in-line').text();
    if (resp.result && resp.result.ok) {
      showMessage('Collection Delected Successfully!', name, 'success');
      setTimeout(hideMessage, 3000);
      $('#del-modal').modal('hide');
      $(`#${id}`).remove();
    } else {
      showMessage('Collection Failed To Delete!', name, 'danger');
    }
  });
}


/**
 * create editor items
 *
 */

function createSlideItems(d, mode = 'unselected') {
  const html = `
  <li id='${d._id['$oid']}' class='slide list-group-item d-flex justify-content-between align-items-center py-2 px-3'>
    <input type='checkbox' class='' />
    <div class='text-in-line mx-2' data-toggle='tooltip' data-placement='top' title='${d.name}'>${d.name}</div>
    <i class='fas fa-times text-danger ${mode == 'selected' ? '' : 'd-none'}' onclick='moveSlideItem('${d._id['$oid']}','unselected')'></i>
    <i class='fas fa-plus text-primary ${mode == 'unselected' ? '' : 'd-none'}' onclick='moveSlideItem('${d._id['$oid']}','selected')'></i>
  </li>`;
  const elt = $.parseHTML(html);
  $(elt).find('[data-toggle="tooltip"]').tooltip({delay: {'show': 1000, 'hide': 1000}});
  return elt;
}


// getCollection

function updateEditor(data) {
  //
  if (data) {
    $('#edit-modal').data('id', data._id['$oid']);
    $('#edit-modal').find('#col-name').val(data.name);
    $('#edit-modal').find('#col-description').val(data.description);
  } else {
    $('#edit-modal').removeData('id');
    $('#edit-modal').find('#col-name').val(null);
    $('#edit-modal').find('#col-description').val(null);
  }
}


function saveCollection() {
  if (validateEditor()) {
    const data = getDataFromEditor();
    // return;
    if ($('#edit-modal').data('id')) {
      // update collection
      const id = data.id;
      delete data.id;
      store
          .updateCollection(id, data)
          .then((resp) => {
            console.log('update', resp);
            if (resp.status == 200 && resp.ok) {
              // update card
              $(`#${id}`).find('.text-in-line').text(data.name);
              $(`#${id}`).find('.badge.badge-primary.badge-pill').text(data.slides.length);
              $(`#${id}`).find('.card-text.text-muted').text(data.description);
              //
              showMessage('Collection Updated Successfully!', data.name, 'success');
              $('#edit-modal').modal('hide');
              setTimeout(hideMessage, 3000);
            } else {
              showMessage('Collection Failed To Update!', data.name, 'danger');
            }
          });
    } else {
      delete data.id;
      store
          .addCollection(data)
          .then((resp) => {
            console.log('add', resp);
            if (resp.result && resp.result.ok) {
              const opt = resp.ops[0];
              opt._id = {'$oid': opt._id};
              const colCard = createColItem(opt);
              $('#main-grid').append(colCard);
              showMessage('Collection Created Successfully!', data.name, 'success');
              $('#edit-modal').modal('hide');
              setTimeout(hideMessage, 3000);
            } else {
              showMessage('Collection Failed To Create!', data.name, 'danger');
            }
          });
    }
  }
}
function clearEditor() {
  $('#edit-modal').removeData('id');
  $('#edit-modal').find('#col-name').val(null);
  $('#edit-modal').find('#col-description').val(null);
  $('#selected-slide').empty();
  $('#unselected-slide').empty();
}
function setEditor(col, slides) {
  // set up collection basic info
  if (col) {
    $('#edit-modal').data('id', col._id['$oid']);
    $('#edit-modal').find('#col-name').val(col.name);
    $('#edit-modal').find('#col-description').val(col.description);
  }
  // set up selected slides info
  slides.forEach((d) => {
    if (col && col.slides && col.slides.includes(d._id['$oid'])) {
      const selected = createSlideItems(d, 'selected');
      $('#selected-slide').append(selected);
    } else {
      const unselected = createSlideItems(d, 'unselected');
      $('#unselected-slide').append(unselected);
    }
  });
}

function getDataFromEditor() {
  return {
    id: $('#edit-modal').data('id'),
    name: $('#edit-modal').find('#col-name').val(),
    description: $('#edit-modal').find('#col-description').val(),
    slides: [...$('#selected-slide').find('li.slide')].map((li) => li.id),
  };
}
function validateEditor() {
  var isValid = true;
  if (!$('#edit-modal').find('#col-name').val()) {
    $('#edit-modal').find('#col-name').addClass('is-invalid');
    isValid = false;
  } else {
    $('#edit-modal').find('#col-name').removeClass('is-invalid');
  }


  if ($('#selected-slide').find('li.slide').length == 0) {
    $('#selected-slide-error').addClass('is-invalid');
    isValid = false;
  } else {
    $('#selected-slide-error').removeClass('is-invalid');
  }


  return isValid;
}


function moveSlideItem(id, mode = 'unselected') {
  const slideItem = $('#edit-modal').find(`li[id=${id}]`);
  slideItem.detach();
  switch (mode) {
    case 'unselected':
      $('#unselected-slide').append(slideItem);
      slideItem.find('.fas.fa-times.text-danger').addClass('d-none');
      slideItem.find('.fas.fa-plus.text-primary').removeClass('d-none');
      break;
    case 'selected':
      $('#selected-slide').append(slideItem);
      slideItem.find('.fas.fa-times.text-danger').removeClass('d-none');
      slideItem.find('.fas.fa-plus.text-primary').addClass('d-none');
      break;
    default:
      break;
  }
}

function moveSlideItems(panelId, mode = 'unselected') {
  $(`#${panelId} li:visible`).each((idx, li) => {
    const chk = $(li).find('input[type=checkbox]');
    if (chk.prop('checked')) {
      chk.prop('checked', false);
      moveSlideItem(li.id, mode);
    }
  });

  // clear status and show up
  $(`#${panelId} li:hidden`).find('input[type=checkbox]').prop('checked', false);
  $(`#${panelId} li:hidden`).addClass('d-flex');
  $(`#${panelId} li:hidden`).show();
  $(`#edit-modal input[type=text][data-target='${panelId}']`).val('');
  $(`input[type=checkbox].${panelId}`).prop('checked', false);
}


function showMessage(message, title = '', style = 'primary') {
  const html = `<div class='alert alert-${style} alert-dismissible fade show' role='alert'>
  <strong>${title}</strong>&nbsp;&nbsp;${message}
  <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
    <span aria-hidden='true'>&times;</span>
  </button>
  </div>`;
  $(document.body).append($.parseHTML(html));
}
function hideMessage() {
  $('.alert').alert('close');
}

function checkAllSlideItems(chk, panelId) {
  const slideItems = $(`#${panelId}`).find('li.slide');

  slideItems.each((idx, item) => {
    const checked = $(item).css('display') !== 'none' && $(chk).prop('checked');
    $(item).find('input[type=checkbox]').prop('checked', checked);
  });
}



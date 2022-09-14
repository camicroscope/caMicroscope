// dom-checkbox sorting plug-in
$.fn.dataTable.ext.order['dom-checkbox'] = function( settings, col ) {
  return this.api().column( col, {order: 'index'} ).nodes().map( function( td, i ) {
    return $('input', td).prop('checked') ? '1' : '0';
  } );
};


$(function() {
  $('[data-toggle="tooltip"]').tooltip({delay: {'show': 700, 'hide': 1000}});
});
var $SlideDTable;
var $UserDTable;
var $collectionList;
var $collectionTree;
var _selectedNodeId;
var $slideData;
var $D={};


const editModalEl = document.getElementById('edit-modal');
editModalEl.addEventListener('show.bs.modal', function(event) {
  // disable error message
  $('#edit-modal').find('#col-name').removeClass('is-invalid');
});

// create the store
const store = new Store('../../../data/');
store.getCurrentUser().then((resp)=>{
  if (resp.status!=200) {
    window.location.href = '../error/401.html';
  }
  return resp;
}).then((resp)=> resp.json()).then((user)=>{
  if (Array.isArray(user)&&user.length==0) {
    window.location.href = '../error/401.html';
  }
  if (Array.isArray(user)&&user.length > 0) {
    $D.user = user[0];
    if (Array.isArray(user)&&user.length>0&&user[0].userType!=='Admin') {
      window.location.href = '../landing/landing.html';
    }
  }
});


// loading the collections
store.getAllCollection().then((data) => {
  if (Array.isArray(data)) {
    $collectionList = data.map((d)=>{
      d.icon ='./folder.png';
      d.id = d._id.$oid;
      delete d._id;
      return d;
    });
    $collectionTree = listToTree(data);


    $('#main-tree-view').jstree({
      'core': {
        'data': $collectionTree,
        'multiple': false,
        'check_callback': true,
      },
      'types': {
        '#': {'max_children': 1, 'max_depth': 4, 'valid_children': ['default']},
        'default': {
          'valid_children': ['default'],
        },
      },
      'plugins': ['search', 'wholerow'],
    });


    $('#main-tree-view').on('loaded.jstree', () => {
      if (data.length == 0) $('#coll-message').show();
    });

    // bind select node event
    $('#main-tree-view').on('select_node.jstree', function(event, _data) {
      if ( _selectedNodeId === _data.node.id ) {
        // unselected node
        _data.instance.deselect_node(_data.node);
        _selectedNodeId = null;
        //
        selectCollectionHandler(null);
        // hide rename/remove btns
        $('#col-rename').hide();
        $('#col-delete').hide();
      } else {
        // selected node
        _selectedNodeId = _data.node.id;
        // show rename/remove btns

        $('#col-rename').show();
        $('#col-delete').show();
        selectCollectionHandler(_data.node);

        // show up breadcrum
      }
    });
  } else {
    // error message

  }
});

// load slides

store.findSlide().then((data) => data.map((d) => ({
  'id': d._id.$oid,
  'name': d.name,
  'width': d.width,
  'height': d.height,
  'selected': false,
}))).then((data) => {
  $slideData = data;
  createSlideDataTable($slideData);
});

// load users
store.getUsers().then((data) => data.map((d) => ({
  'id': d._id.$oid,
  'email': d.email,
  'key': d.key,
  'user_type': d.userType,
  'senior': d.isSenior,
  'selected': false,
}))).then((data) => {
  $userData = data;
  createUserDataTable($userData);
});

// create user table
function createUserDataTable(data) {
  $UserDTable = $('#users-data-table-view').DataTable({
    'rowId': 'key',
    'order': [[5, 'desc']],
    'data': data,
    'columns': [
      {data: 'id', title: 'Id'},
      {data: 'email', title: 'Email'},
      {data: 'key', title: 'ORNL ID'},
      {data: 'user_type', title: 'User Type'},
      {data: 'senior', title: 'Senior'},
      {
        data: 'selected',
        orderable: true,
        orderDataType: 'dom-checkbox',
        title: `<label onclick='stopEvent(event)'>
                  <input data-id='__all__'  type="checkbox" onchange='toggleAllUsers(event)' onclick='stopEvent(event)' >
                  All
                </label>`,
      },
    ],
    'columnDefs': [{
      'className': 'dt-center',
      'targets': 4,
      'data': null,
      'render': (data, type, row, mate) => {
        return `${data?'<i class="fas fa-check text-success"></i>':'<i class="fas fa-times text-danger"></i>'}`;
      },
    }, {
      'className': 'dt-center',
      'targets': 5,
      'data': null,
      'render': (data, type, row, mate) => {
        // TODO set the checked by data
        return `<input data-id="${row.key}" type="checkbox" onchange='toggleAUser(event)' ${data?'checked':''}>`;
      },
    }],
  });
}
// create slide table
function createSlideDataTable(data) {
  $SlideDTable = $('#slides-data-table-view').DataTable({
    'rowId': 'id',
    'order': [[4, 'desc']],
    'data': data,
    'columns': [
      {data: 'id', title: 'Id'},
      {data: 'name', title: 'Name'},
      {data: 'width', title: 'Width'},
      {data: 'height', title: 'Height'},
      {
        data: 'selected',
        orderable: true,
        orderDataType: 'dom-checkbox',
        title: `<label onclick='stopEvent(event)'>
                  <input data-id='__all__'  type="checkbox" onchange='toggleAllSlides(event)' onclick='stopEvent(event)' >
                  All
                </label>`,
      },
    ],
    'columnDefs': [{
      'className': 'dt-center',
      'targets': 4,
      'data': null,
      'render': (data, type, row, mate) => {
        // TODO set the checked by data
        return `<input data-id="${row.id}" type="checkbox" onchange='toggleASlide(event)' ${data?'checked':''}>`;
      },
    }],
  });
}
function stopEvent(e) {
  e.stopPropagation();
}
function toggleAllUsers(e) {
  const tree = $('#main-tree-view').jstree(true);
  const selectedNodes = tree.get_selected(true)[0];
  const cid = selectedNodes.id;
  const nodes = $UserDTable.rows({search: 'applied'}).nodes().to$();
  //
  const uids = [...nodes].map((d)=>d.id);

  if (e.target.checked) {
    // add user to collection
    store.addUsersToCollection(cid, uids).then((rs)=>{
      nodes.find('input[type=checkbox]').prop('checked', e.target.checked);
      $userData.forEach((d)=>{
        if (uids.includes(d.id)) d.selected = e.target.checked;
      });
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].users&&collData&&collData.users) {
          collData.users = rs[0].users;
        }
      });
    });
  } else {
    // remove slide from collection
    store.removeUsersFromCollection(cid, uids).then((rs)=>{
      nodes.find('input[type=checkbox]').prop('checked', e.target.checked);
      $userData.forEach((d)=>{
        if (uids.includes(d.id)) d.selected = e.target.checked;
      });
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].users&&collData&&collData.users) {
          collData.users = rs[0].users;
        }
      });
    });
  }
  e.stopPropagation();
}
function toggleAllSlides(e) {
  const tree = $('#main-tree-view').jstree(true);
  const selectedNodes = tree.get_selected(true)[0];
  const cid = selectedNodes.id;
  const nodes = $SlideDTable.rows({search: 'applied'}).nodes().to$();
  //
  const sids = [...nodes].map((d)=>d.id);

  if (e.target.checked) {
    // add slide to collection
    store.addSlidesToCollection(cid, sids).then((rs)=>{
      nodes.find('input[type=checkbox]').prop('checked', e.target.checked);
      $slideData.forEach((d)=>{
        if (sids.includes(d.id)) d.selected = e.target.checked;
      });
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].slides&&collData&&collData.slides) {
          collData.slides = rs[0].slides;
        }
      });
    });
  } else {
    // remove slide from collection
    store.removeSlidesFromCollection(cid, sids).then((rs)=>{
      nodes.find('input[type=checkbox]').prop('checked', e.target.checked);
      $slideData.forEach((d)=>{
        if (sids.includes(d.id)) d.selected = e.target.checked;
      });
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].slides&&collData&&collData.slides) {
          collData.slides = rs[0].slides;
        }
      });
    });
  }


  e.stopPropagation();
}
function toggleAUser(e) {
  const uid = e.target.dataset.id;
  const tree = $('#main-tree-view').jstree(true);
  const selectedNodes = tree.get_selected(true)[0];
  const cid = selectedNodes.id;
  if (e.target.checked) {
    // add slide to collection
    store.addUsersToCollection(cid, [uid]).then((rs)=>{
      const sData = $UserDTable.row(`#${uid}`).data();
      sData.selected = !sData.selected;
      $UserDTable.row(`#${uid}`).data(sData);
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].users&&collData&&collData.users) {
          collData.users = rs[0].users;
        }
      });
    });
  } else {
    // remove slide from collection
    store.removeUsersFromCollection(cid, [uid]).then((rs)=>{
      //
      const sData = $UserDTable.row(`#${uid}`).data();
      sData.selected = !sData.selected;
      $UserDTable.row(`#${uid}`).data(sData);
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].users&&collData&&collData.users) {
          collData.users = rs[0].users;
        }
      });
    });
  }
  e.stopPropagation();
}

function toggleASlide(e) {
  const sid = e.target.dataset.id;
  const tree = $('#main-tree-view').jstree(true);
  const selectedNodes = tree.get_selected(true)[0];
  const cid = selectedNodes.id;
  if (e.target.checked) {
    // add slide to collection
    store.addSlidesToCollection(cid, [sid]).then((rs)=>{
      const sData = $SlideDTable.row(`#${sid}`).data();
      sData.selected = !sData.selected;
      $SlideDTable.row(`#${sid}`).data(sData);
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].slides&&collData&&collData.slides) {
          collData.slides = rs[0].slides;
        }
      });
    });
  } else {
    // remove slide from collection
    store.removeSlidesFromCollection(cid, [sid]).then((rs)=>{
      //
      const sData = $SlideDTable.row(`#${sid}`).data();
      sData.selected = !sData.selected;
      $SlideDTable.row(`#${sid}`).data(sData);
      // reload collection info
      store.getCollection({id: cid}).then((rs)=>{
        const collData = $collectionList.find((d)=>d.id==cid);
        if (rs&&Array.isArray(rs)&&rs[0]&&rs[0].slides&&collData&&collData.slides) {
          collData.slides = rs[0].slides;
        }
      });
    });
  }
  e.stopPropagation();
  // e.stop
}

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

async function openEditor(node) {
  clearEditor();
  setEditor(node);
  $('#edit-modal').modal('show');
}

function openDelConfirm(node) {
  // set parent path text
  const parentNames = getParentNames(node);
  const names = [...parentNames.reverse(), node.text];
  $('#del-modal .modal-body span.text-danger').text(`${names.join(' > ')}`);
  // set children text
  $('#del-modal .modal-body span.children-text').html('');
  const childrenNames = getAllChildrenNames(node);
  if (childrenNames.length) $('#del-modal .modal-body span.children-text').html(` ( includes <span class="text-danger">${childrenNames.join(', ')}</span> )`);

  $('#del-modal .modal-footer .btn.btn-sm.btn-danger').on('click', (elt) => {
    delCollection(node);

    $('#del-modal .modal-footer .btn.btn-sm.btn-danger').off('click');
  });
  $('#del-modal').modal('show');
}

function getAllChildrenNames(node) {
  return node.children_d.map((id)=>{
    const cdata = $collectionList.find((d)=>d.id == id);
    return cdata.text;
  });
}

function getParentNames(node) {
  const rs = [];
  node.parents.forEach((id) => {
    if (id!=='#') {
      const cdata = $collectionList.find((d)=>d.id == id);
      rs.push(cdata.text);
    }
  });
  return rs;
}


function delCollection(node) {
  node.children_d.push(node.id);
  // deleteCollection
  store.deleteMultiCollections(node.children_d).then((resp) => {
    const {collectionResponse, slideResponse} = resp;
    if (collectionResponse.ok && slideResponse.ok) {
      const tree = $('#main-tree-view').jstree(true);
      tree.delete_node(node);
      // hide table and show up message
      $('#table-panel').hide();
      $('#table-message').show();

      // hide rename/remove btns
      selectCollectionHandler(null);
      $('#col-rename').hide();
      $('#col-delete').hide();
      showMessage('Collection Delected Successfully!', node.text, 'success');
      setTimeout(hideMessage, 3000);
      $('#del-modal').modal('hide');
    } else {
      showMessage('Collection Failed To Delete!', node.text, 'danger');
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


async function saveCollection() {
  // get the collection text and id
  var {id, text} = getDataFromEditor();
  // name dosen't change
  if ($('#edit-modal').data('name')&&$('#edit-modal').data('name')==text) {
    $('#edit-modal').modal('hide');
    return;
  }
  // show up the error message if colleciton text is empty
  if (!$('#edit-modal').find('#col-name').val()) {
    $('#col-name-invalid-message').text(`Please enter a collection name`);
    $('#edit-modal').find('#col-name').addClass('is-invalid');
    return;
  } else {
    $('#col-name-invalid-message').text('');
    $('#edit-modal').find('#col-name').removeClass('is-invalid');
  }


  // delete collection.id;
  const d = await store.getCollection({text});
  // deal error


  if (Array.isArray(d)) {
    // d.filter(e=>e._id.$oid!==id).length;
    // the text already exsits
    if (d.filter((e)=>e._id.$oid!==id).length > 0) {
      $('#col-name-invalid-message').text(`That collection name already exists`);
      $('#edit-modal').find('#col-name').addClass('is-invalid');
      return;
    } else {
      $('#edit-modal').find('#col-name').removeClass('is-invalid');
    }
  }

  var id = $('#edit-modal').data('id');
  if (id) {
    const cdata = $collectionList.find((d)=>d.id==id);
    const data = {
      text: $('#edit-modal').find('#col-name').val(),
    };

    // update text
    store
        .updateCollection(id, data)
        .then((resp) => {
          if (resp.nModified && resp.n && resp.ok) {
            // update js tree name
            var tree = $('#main-tree-view').jstree(true);
            var selectedNodes = tree.get_selected(true);
            const node = selectedNodes[0];
            tree.rename_node(node, $('#edit-modal').find('#col-name').val());
            // change the name in list
            const cdata = $collectionList.find((d)=>d.id==id);
            cdata.text = data.text;
            // update breadcrumb
            createBreadcrumb(node);
            showMessage('Collection Updated Successfully!', data.text, 'success');
            $('#edit-modal').modal('hide');
            setTimeout(hideMessage, 3000);
          } else {
            showMessage('Collection Failed To Update!', data.text, 'danger');
          }
        });
  } else {
    // insert a new collection
    // get Parent id
    var tree = $('#main-tree-view').jstree(true);
    const selectedNodes = tree.get_selected(true);
    const newNode = {
      'text': $('#edit-modal').find('#col-name').val(),
    };
    var parentNode;
    if (selectedNodes.length) {
      parentNode = selectedNodes[0];
      newNode.pid = parentNode.id;
    }

    const rs = await store.addCollection(newNode).then((resp)=>{
      if (resp.result && resp.result.ok) {
        const opt = resp.ops[0];
        newNode.id = opt._id;
        newNode.icon = './folder.png';
        const currentId = tree.create_node(parentNode?parentNode:'#', newNode, 'first');
        $collectionList.push(newNode);
        if (parentNode) tree.open_node(parentNode);
        tree.deselect_all();
        tree.select_node(currentId);
        showMessage('Collection Created Successfully!', newNode.text, 'success');
        $('#edit-modal').modal('hide');
        setTimeout(hideMessage, 3000);
      } else {
        showMessage('Collection Failed To Create!', newNode.text, 'danger');
      }
    });
  }
}


function clearEditor() {
  $('#edit-modal').removeData('id');
  $('#edit-modal').find('#col-name').val(null);
  // $('#edit-modal').find('#col-description').val(null);
  // $('#selected-slide').empty();
  // $('#unselected-slide').empty();
}
function setEditor(node) {
  const tree = $('#main-tree-view').jstree(true);
  var selectedNodes = tree.get_selected(true)[0];
  $('#edit-modal #col-path').text('');
  if (selectedNodes) {
    var parentNames = getParentNames(selectedNodes);
    var names;
    if (node) {
      var names = [...parentNames.reverse(), ''];
    } else {
      var names = [...parentNames.reverse(), selectedNodes.text, ''];
    }
    $('#edit-modal #col-path').text(`${names.join(' > ')}`);
  }

  // set up collection basic info
  if (node) {
    $('#edit-modal').data('id', node.id);
    $('#edit-modal').data('name', node.text);
    $('#edit-modal').find('#col-name').val(node.text);
    // $('#edit-modal').find('#col-description').val(col.description);
  } else {
    $('#edit-modal').removeData('name');
  }
  // set up selected slides info
  // slides.forEach((d) => {
  //   if (col && col.slides && col.slides.includes(d._id['$oid'])) {
  //     const selected = createSlideItems(d, 'selected');
  //     $('#selected-slide').append(selected);
  //   } else {
  //     const unselected = createSlideItems(d, 'unselected');
  //     $('#unselected-slide').append(unselected);
  //   }
  // });
}

function getDataFromEditor() {
  return {
    id: $('#edit-modal').data('id'),
    text: $('#edit-modal').find('#col-name').val(),
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
  const html = `<div class='message alert alert-${style} alert-dismissible fade show' role='alert'>
  <strong>${title}</strong>&nbsp;&nbsp;${message}
  <button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'>
  </button>
  </div>`;
  $('.table-view').prepend($.parseHTML(html));
}
function hideMessage() {
  $('.table-view .message.alert').alert('close');
}

function checkAllSlideItems(chk, panelId) {
  const slideItems = $(`#${panelId}`).find('li.slide');

  slideItems.each((idx, item) => {
    const checked = $(item).css('display') !== 'none' && $(chk).prop('checked');
    $(item).find('input[type=checkbox]').prop('checked', checked);
  });
}


function createCollection() {
  openEditor();
};
function renameCollection() {
  var tree = $('#main-tree-view').jstree(true);
  var selectedNodes = tree.get_selected(true);
  if (!selectedNodes.length) {
    showMessage('Please select a collection to rename', '', 'warning');
    setTimeout(hideMessage, 3000);
    return;
  }
  const node = selectedNodes[0];
  openEditor(node);
};

function deleteCollection() {
  var tree = $('#main-tree-view').jstree(true);
  var selectedNodes = tree.get_selected(true);
  if (!selectedNodes.length) {
    showMessage('Please select a collection to remove', '', 'warning');
    setTimeout(hideMessage, 3000);
    return;
  }
  const node = selectedNodes[0];
  openDelConfirm(node);
};

function selectCollectionHandler(node) {
  if (node) {
    // UI control
    $('#table-message').hide();
    $('#table-panel').show();

    // create collection path
    createBreadcrumb(node);
    if (node.children.length > 0) {
      // $('#data-table-view_wrapper').hide();
      $('#nav-tabs-panel').hide();
      $('#sub-message').show();
      return;
    }
    $('#sub-message').hide();
    // $('#data-table-view_wrapper').show();
    $('#nav-tabs-panel').show();
    // let slides checked if the slides in the collection
    const collData = $collectionList.find((d)=>d.id==node.id);
    // deselected/selected all slides
    $slideData.forEach((slide)=>{
      if (collData&&collData.slides&&Array.isArray(collData.slides)&&collData.slides.length) {
        slide.selected = collData.slides.some((id)=>id==slide.id);
      } else {
        slide.selected = false;
      }
    });
    $SlideDTable.clear();
    $SlideDTable.rows.add($slideData).search('').draw(true);

    // deselected/selected all users
    $userData.forEach((user)=>{
      if (collData&&collData.users&&Array.isArray(collData.users)&&collData.users.length) {
        user.selected = collData.users.some((u)=>u.user==user.key);
      } else {
        user.selected = false;
      }
    });
    $UserDTable.clear();
    $UserDTable.rows.add($userData).search('').draw(true);
  } else {
    // UI control
    $('#table-message').show();
    $('#table-panel').hide();
  }
  // UI control
}

function createBreadcrumb(node) {
  // clear the old crumb
  $('#table-breadcrumb').empty();
  if (!node) return;
  //
  const parentNames = getParentNames(node);

  const crumbList = [...parentNames.reverse(), node.text];


  $('#table-breadcrumb').html(crumbList.map((text)=>
    text==node.text?`<div class="breadcrumb-item active" aria-current="page">${text}</div>`:`<div class="breadcrumb-item" ><a href="#">${text}</a></div>`,
  ).join(''));
}

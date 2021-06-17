
const store = new Store('../../../data/');
let table;
let updateRow;
$(function() {
  $('[data-toggle="tooltip"]').tooltip({delay: {'show': 1000, 'hide': 1000}});
});
store.getUsers()
    .then((data) => data.map((d) => ({
      'id': d._id.$oid,
      'email': d.email,
      'userType': d.userType,
      'userFilter': d.userFilter,
    })))
    .then((data) => {
      createDataTable(data);
    });


function createDataTable(data) {
  table = $('#table').DataTable({
    'data': data,
    'columns': [
      {data: 'id', title: 'Id'},
      {data: 'email', title: 'Email'},
      {data: 'userType', title: 'User Type'},
      {data: 'userFilter', title: 'User Filter'},
    ],
    'columnDefs': [{
      'targets': 4,
      'data': null,
      'defaultContent': `<button class="btn btn-sm btn-primary edit"><i class="fas fa-pen"></i></button>
      <button type="button" class="btn btn-sm btn-danger remove"><i class="fas fa-times"></i></button>`,
    }],
  });
  // edit
  $('#table tbody').on('click', 'button.edit', function() {
    updateRow = table.row( $(this).parents('tr') );
    var data = updateRow.data();
    openEditor(data);
  });
  // remove
  $('#table tbody').on('click', 'button.remove', function() {
    var row = table.row( $(this).parents('tr') );
    openDelConfirm(row);
  });
}


function openEditor(data) {
  clearEditor();
  setEditor(data);
  $('#edit-modal').modal('show');
}

function clearEditor() {
  $('#edit-modal').find('#col-id').val(null);
  $('#edit-modal').find('#col-email').val(null);
  $('#edit-modal').find('#col-user-type').val('Admin');
  $('#edit-modal').find('#col-user-filter').prop('checked', true);
}

function setEditor(data) {
  // set up collection basic info
  if (data) {
    const {id, email, userType, userFilter} = data;
    $('#edit-modal').find('#col-id').val(id);
    $('#edit-modal').find('#col-email').val(email);
    $('#edit-modal').find('#col-user-type').val(userType);
    $('#edit-modal').find('#col-user-filter').prop('checked', (userFilter.toString()).toLowerCase()=='public'?true:false);
  }
}

function saveUser() {
  if (!validateEditor()) return;
  const data = getDataFromEditor();
  if (data.id) {
    store
        .updateUser(data.id, data)
        .then((resp) => {
          if (resp.status == 200 && resp.ok) {
            showMessage('User Updated Successfully!', data.email, 'success');
            $('#edit-modal').modal('hide');
            table.row(updateRow).data(data);
            setTimeout(hideMessage, 3000);
          } else {
            showMessage('Collection Failed To Update!', data.email, 'danger');
          }
        });
  } else {
    delete data.id;
    store.addUser(data).then((resp)=>{
      if (resp.result && resp.result.ok) {
        const d = resp.ops[0];
        d.id =d._id;
        delete d._id;
        table.row.add(d).draw();
        showMessage('User Added Successfully!', data.email, 'success');
        $('#edit-modal').modal('hide');
        setTimeout(hideMessage, 3000);
      } else {
        showMessage('User Failed To Create!', data.email, 'danger');
      }
    });
  }
}
function openDelConfirm(row) {
  const {id, email, userType, userFilter} = row.data();
  $('#del-modal .modal-body span').text(email);
  $('#del-modal .modal-footer .btn.btn-sm.btn-danger').on('click', (elt) => {
    delUser(row);
    $('#del-modal .modal-footer .btn.btn-sm.btn-danger').off('click');
  });
  $('#del-modal').modal('show');
}

function delUser(row) {
  const {id, email, userType, userFilter} = row.data();
  // TODO remove from db
  store.deleteUser(id).then((resp) => {
    if (resp.result && resp.result.ok) {
      showMessage('User Removed Successfully!', email, 'success');
      setTimeout(hideMessage, 3000);
      $('#del-modal').modal('hide');
      row.remove().draw( false );
    } else {
      showMessage('Collection Failed To Delete!', email, 'danger');
    }
  });
}


function validateEditor() {
  var isValid = true;
  // email validate
  const email = $('#edit-modal').find('#col-email').val();
  if (email && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email))) {
    $('#edit-modal').find('#col-email').removeClass('is-invalid');
  } else {
    $('#edit-modal').find('#col-email').addClass('is-invalid');
    isValid = false;
  }
  return isValid;
}

function getDataFromEditor() {
  return {
    id: $('#edit-modal').find('#col-id').val(),
    email: $('#edit-modal').find('#col-email').val(),
    userType: $('#edit-modal').find('#col-user-type').val(),
    userFilter: $('#edit-modal').find('#col-user-filter').prop('checked')?['Public']:[],
  };
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

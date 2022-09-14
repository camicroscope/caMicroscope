// initalize store, dependency
const store = new Store('../../data/');

var $DTable;
const $D = {
  collectionData: null,
};
function createDataTable(data) {
  $DTable = $('#data-table-view').DataTable({
    'rowId': 'id',
    'order': [[1, 'desc']],
    'data': data,
    'columns': [
      {
        className: 'dt-control dt-center',
        orderable: false,
        data: null,
        defaultContent: '<i class="fas fa-minus-square text-danger" title="Expand"></i>',
      },
      {data: 'id', title: 'Collection Id'},
      {data: 'text', title: 'Collection Name'},
      {data: 'size', title: '# Of Slides'},
      {title: 'Status'},
      {orderable: false, title: 'Export'},
    ],
    'columnDefs': [{
      'className': 'dt-center',
      'targets': 4,
      'data': null,
      'render': (data, type, row, mate) => {
        return data.users&&data.users.every((u)=>u.task_status==true) ?`<span class="fas fa-check-circle text-primary"></span>`:`<span class="badge rounded-pill bg-danger">Pending</span>`;
      },
    }, {
      'className': 'dt-center',
      'targets': 5,
      'data': null,
      'render': (data, type, row, mate) => {
        // set the checked by data
        return `<input data-id="${row.id}" type="checkbox" ${data.users&&data.users.every((u)=>u.task_status==true)?'checked':'disabled'} >`;
      },
    }],
  });

  // Add event listener for opening and closing details
  $('#data-table-view tbody').on('click', 'td.dt-control', function() {
    var tr = $(this).closest('tr');
    var row = $DTable.row(tr);
    if (row.child.isShown()) {
      // This row is already open - close it
      row.child.hide();
      tr.removeClass('shown');
      tr.find('i.fas').removeClass('fa-plus-square');
      tr.find('i.fas').removeClass('text-primary');
      tr.find('i.fas').addClass('fa-minus-square');
      tr.find('i.fas').addClass('text-danger');
    } else {
      tr.addClass('shown');
      tr.find('i.fas').removeClass('fa-minus-square');
      tr.find('i.fas').removeClass('text-danger');
      tr.find('i.fas').addClass('fa-plus-square');
      tr.find('i.fas').addClass('text-primary');
      row.child(createUserList(row.data())).show();
    }
  });


  $('#data-table-view').append(
      $('<tfoot/>').append( $('#data-table-view thead tr').clone() ),
  );
}
function userChkChangeHandler(elt) {
  const {colId, key} = elt.dataset;
  // console.log(colId, key, elt.checked);
  const data = $D.collectionData.find((d)=>d.id==colId);
  const user = data.users.find((u)=>u.user==key);
  user.checked = elt.checked;
}
function createUserList(d) {
  // `d` is the original data object for the row
  return `<div style="max-height:150px;overflow:auto;"><table class="dataTable" style="width: 80%;" role="grid">
  <thead><tr role="row"><th>User</th><th>Status</th><th>Export</th></tr></thead>
  <tbody>${d.users.map((u)=>`<tr role="row">
    <td>${u.user}</td>
    <td>${u.task_status?`<span class="fas fa-check-circle text-primary"></span>`:`<span class="badge rounded-pill bg-danger">Pending</span>`}</td>
    <td><input data-col-id="${d.id}" data-key="${u.user}" onchange="userChkChangeHandler(this)" type="checkbox" ${u.task_status&&u.task_status==true?'checked':'disabled'} ></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function getParentNames(currentData, list) {
  if (currentData.pid&&list.some((n)=>n._id.$oid==currentData.pid)) {
    parentData = list.find((n)=>n._id.$oid==currentData.pid);
    return `${parentData.text}/<strong>${currentData.text}</strong>`;
  }
  return `${currentData.text}`;
}

window.addEventListener('load', async ()=> {
  try {
    const user = await store.getCurrentUser().then((resp)=>{
      if (resp.status!=200) {
        window.location.href = '../error/401.html';
      }
      return resp;
    }).then((resp)=> resp.json());
    if (Array.isArray(user)&&user.length==0) {
      window.location.href = '../error/401.html';
    }
    if (Array.isArray(user)&&user.length > 0) {
      $D.user = user[0];
      if (user[0].userType!=='Admin') {
        window.location.href = '../landing/landing.html';
      }
    }
    var data = await store.getAllCollection();
    if (data&&Array.isArray(data)&&data.length > 0) {
      $D.collectionData = data.filter((d)=>d.slides&&Array.isArray(d.slides)&&d.slides.length>0).map((d)=>{
        d.id = d._id.$oid;
        d.size = d.slides&&Array.isArray(d.slides)?d.slides.length:0;
        d.text = getParentNames(d, data);
        if (d.users&&Array.isArray(d.users)) {
          d.users.map((u)=>{
            u.checked = u.task_status;
            return u;
          });
        }
        return d;
      });
      createDataTable($D.collectionData);
    } else {

    }
  } catch (error) {
    //
  }
});


function dataExport() {
  const nodes = $DTable.rows({search: 'applied'}).nodes().to$();
  console.log(nodes);
  const cids = [...nodes].reduce((rs, node)=>{
    if (node.querySelector('input[type=checkbox]:checked')) {
      const data = $D.collectionData.find((c)=>c.id==node.id);
      const users = data.users.filter((u)=>u.checked==true);
      if (users.length > 0) rs.push({id: node.id, users});
    }
    return rs;
  }, []);
  if (cids&&Array.isArray(cids)&&cids.length>0) {
    var fileName = `${$D.user.key}_${Date.now()}.zip`;
    // export data and download
    store.collectionDataExports(cids).then((response) => {
      if (response.status == 200) {
        const headers = response.headers;
        const disposition = headers.get('Content-Disposition');

        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
        }
        return response.blob();
      } else {
        throw response;
      }
    }).then((blob)=>{
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove(); // afterwards we remove the element again
      window.URL.revokeObjectURL(blob);
    });
  } else {
    alert('No Colletion Selected');
  }
}


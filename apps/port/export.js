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
      {data: 'id', title: 'Collection Id'},
      {data: 'text', title: 'Collection Name'},
      {data: 'size', title: '# Of Slides'},
      {data: 'task_status', title: 'Status'},
      {

        orderable: false,
        title: 'Export',

      },
    ],
    'columnDefs': [{
      'className': 'dt-center',
      'targets': 3,
      'render': (data, type, row, mate)=>{
        return data=='true' ?`<span class="fas fa-check-circle text-primary"></span>`:`<span class="badge rounded-pill bg-danger">Pending</span>`;
      },
    }, {
      'className': 'dt-center',
      'targets': 4,
      'data': null,
      'render': (data, type, row, mate) => {
        // set the checked by data
        return `<input data-id="${row.id}" type="checkbox" ${data.task_status=='true'?'checked':'disabled'} >`;
      },
    }],
  });

  $('#data-table-view').append(
      $('<tfoot/>').append( $('#data-table-view thead tr').clone() ),
  );
}

window.addEventListener('load', async ()=> {
  console.log('START');

  try {
    var data = await store.getAllCollection();
    if (data&&Array.isArray(data)&&data.length > 0) {
      data = data.filter((d)=>d.slides&&Array.isArray(d.slides)&&d.slides.length>0).map((d)=>{
        d.id = d._id.$oid;
        delete d._id;
        d.size = d.slides&&Array.isArray(d.slides)?d.slides.length:0;
        d.task_status = d.task_status?d.task_status:'false';
        return d;
      });
      $D.collectionData = data;
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
    if (node.querySelector('input[type=checkbox]:checked')) rs.push(node.id);
    return rs;
  }, []);
  if (cids&&Array.isArray(cids)&&cids.length>0) {
    var fileName = `${getUserId()}_${Date.now()}.zip`;
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


/**
 * global variables
 */
isAllSeriesSynced = false;

const datatableConfig = {
  scrollX: true,
  lengthMenu: [
    [15, 25, 50, -1],
    [15, 25, 50, 'All'],
  ],
};

// DICOMweb sources are persisted as a Configuration document
// (config_name: 'dicomweb_sources', configuration: [{id, name, url}]),
// the same pattern used for e.g. channel-view presets. `pageStates.sourcesDoc`
// holds the loaded document (or null if none exists yet) so add/remove can
// tell whether to create or update it.
const pageStates = {
  sourcesDoc: null,
  sources: {
    data: [],
  },
  studies: {
    data: null,
  },
  series: {
    data: null,
  },
  instances: {
    data: null,
  },
  status: 'sources', // 'sources, studies, series, instsances'
};
var studies = [];
var store;

/**
 * loads the dicomweb_sources Configuration document into pageStates.
 * @return {promise} - resolves once pageStates.sourcesDoc/sources.data are populated
 */
function loadSources() {
  return store.getConfigByName('dicomweb_sources').then((list) => {
    const doc = (list && list.length) ? list[0] : null;
    // Configuration/find returns _id as extended-JSON ({$oid: ...}), but
    // Configuration/update expects a plain string; normalize it here.
    if (doc && doc._id && doc._id.$oid) doc._id = doc._id.$oid;
    pageStates.sourcesDoc = doc;
    pageStates.sources.data = doc ? doc.configuration : [];
  });
}

/**
 * adds a new source (read from the Add Source dialog inputs), persists it,
 * and refreshes the sources table.
 */
async function addSource() {
  const name = document.getElementById('sourceNameInput').value.trim();
  const url = document.getElementById('sourceUrlInput').value.trim();
  if (!name || !/^https?:\/\//i.test(url)) {
    alert('Please provide a name and a URL starting with http:// or https://');
    return;
  }
  const source = {id: randomId(), name: name, url: url};
  if (!pageStates.sourcesDoc) {
    const result = await store.post('Configuration', {
      config_name: 'dicomweb_sources',
      configuration: [source],
    });
    pageStates.sourcesDoc = {_id: result.insertedIds['0'], configuration: [source]};
  } else {
    pageStates.sourcesDoc.configuration.push(source);
    await store.updateDicomwebSources(
        pageStates.sourcesDoc._id, pageStates.sourcesDoc.configuration);
  }
  pageStates.sources.data = pageStates.sourcesDoc.configuration;
  document.getElementById('sourceNameInput').value = '';
  document.getElementById('sourceUrlInput').value = '';
  $('#add-source-dialog').modal('hide');
  datatable.clear().rows.add(pageStates.sources.data).draw();
}

/**
 * removes a source by id, persists the change, and refreshes the sources table.
 * @param {string} id - the source's id (not the Configuration doc's _id)
 */
async function removeSource(id) {
  pageStates.sourcesDoc.configuration = pageStates.sourcesDoc.configuration.filter((s) => s.id !== id);
  await store.updateDicomwebSources(
      pageStates.sourcesDoc._id, pageStates.sourcesDoc.configuration);
  pageStates.sources.data = pageStates.sourcesDoc.configuration;
  datatable.clear().rows.add(pageStates.sources.data).draw();
}


function getStudies(baseUrl) {
  const url = `${baseUrl}/studies`;
  return fetch(url).then((resp)=>resp.json());
}

function getSeries(baseUrl, studyId) {
  const url = `${baseUrl}/studies/${studyId}/series`;
  return fetch(url).then((resp)=>resp.json());
}

function getInstances(baseUrl, studyId, seriesId) {
  const url = `${baseUrl}/studies/${studyId}/series/${seriesId}/instances`;
  return fetch(url).then((resp)=>resp.json());
}

function previewSeries(baseUrl, study, series, modality) {
  if (modality=='SM') {
    baseUrlEncoded = encodeURIComponent(baseUrl);
    window.location = `../viewer/viewer.html?mode=dcmweb&study=${study}&series=${series}&slideId=preview&source=${baseUrlEncoded}`;
  } else {
    alert('Cannot preview annotations yet.');
  }
}


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


async function initialize() {
  const params = getUrlVars();
  console.log('params');
  console.log(params);
  // store
  store = new Store('../../data/');
  await loadSources();
  if (params.status=='studies'&&params.source) {
    pageStates.status = params.status;
  } else if (params.status=='series'&&params.source&&params.studyId) { // series table
    pageStates.status = params.status;
  } else if (params.status=='instances'&&params.source&&params.studyId&&params.seriesId) { // isntasnces table
    pageStates.status = params.status;
  }


  // <li class="breadcrumb-item"><a href="#">Studies</a></li>
  // <li class="breadcrumb-item"><a href="#">Series</a></li>
  // <li class="breadcrumb-item active" aria-current="page">Instances</li>
  switch (pageStates.status) {
    case 'sources':
      $('#addSourceBtn').show();
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><Strong>Sources</Strong></li>`);
      function generateLink(data, type, row) {
        return `<a href="../dicom-web/table.html?source=${encodeURIComponent(row.name)}&status=studies">${sanitize(row.name)}</a>`;
      }
      function generateRemove(data, type, row) {
        return `<button onClick="removeSource('${row.id}')" class="btn btn-sm btn-danger" title="Remove"><i class="fas fa-trash"></i></button>`;
      }
      datatable = $('#datatable').DataTable({
        ...datatableConfig,
        'data': pageStates[pageStates.status].data,
        'columns': [
          {data: 'name', title: 'Name', render: generateLink},
          {data: null, title: '', render: generateRemove},
        ],
      });

      break;
    case 'studies':

      // get source info
      var idx = pageStates.sources.data.findIndex((elt)=>elt.name==decodeURIComponent(params.source));
      var src = pageStates.sources.data[idx];

      // create breadcrumb for studies
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-web/table.html"><Strong>Sources</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><Strong>${src.name}</Strong></li>`);
      // get all studies

      getStudies(src.url).then(function(data) {
        // mapping and merge
        data.forEach((elt)=>elt.source=src.name);
        pageStates[pageStates.status].data = data;
        // ${baseUrl}/studies/${studyId}/series
        function generateLink(data, type, row) {
          const studyId = row['0020000D']['Value'][0];
          return `<a href="../dicom-web/table.html?status=series&source=${row.source}&studyId=${studyId}">${studyId}</a>`;
        }
        datatable = $('#datatable').DataTable({
          ...datatableConfig,
          data: pageStates[pageStates.status].data,
          columns: [
            {
              data: null,
              title: 'Study Id',
              render: function(data, type, row) {
                const value = row?.['0020000D']?.Value?.[0] ?? '';
                return generateLink(value, type, row);
              },
            },
            {
              data: null,
              title: 'Name',
              render: function(data, type, row) {
                return row?.['00100020']?.Value?.[0] ?? '';
              },
            },
            {
              data: 'source',
              title: 'Source',
            },
          ],
        });
      });

      break;
    case 'series':
      // get source info
      var idx = pageStates.sources.data.findIndex((elt)=>elt.name==decodeURIComponent(params.source));
      var src = pageStates.sources.data[idx];

      // create breadcrumb for series
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-web/table.html"><Strong>Sources</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-web/table.html?source=${src.name}&status=studies&studyId=${params.studyId}"><Strong>${src.name}</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><strong>${params.studyId}</strong></li>`);
      // get all series


      getSeries(src.url, params.studyId).then(function(data) {
        // add source and study id
        data.forEach((elt)=>{
          elt.source=src.name;
          elt.url=src.url;
          elt.studyId=params.studyId;
          elt.status='searching'; // 'searching', 'unsync', 'loading', 'done'
        });
        pageStates[pageStates.status].data = data;
        function generateLink(data, type, row) {
          const seriesId = row['0020000E']['Value'][0];
          const modality = row['00080060']['Value'][0];
          if (row.status !='done') return seriesId;
          const slideId = row.slideId;
          // if (modality=='SM')
          return `<a href="../viewer/viewer.html?slideId=${slideId}">${seriesId}</a>`;
        }
        function generateStatus(data, type, row) {
          const seriesId = row['0020000E']['Value'][0];
          const modality = row['00080060']['Value'][0];
          let previewBtn = `<button onClick="previewSeries('${row.url}', '${row.studyId}', '${seriesId}', '${modality}')" class="btn btn-sm btn-primary" title="Preview"><i class="fas fa-eye"></i></button>`;
          switch (row.status) {
            case 'searching':
              // return spin
              return '<span class="icon-center" title="Loading..."><i class="fas fa-spinner fa-spin"></i></span>';
            case 'unsync':
              // return btn
              let syncBtn = `<button onClick="syncSeries('${row.url}', '${row.studyId}', '${seriesId}', '${modality}')" class="btn btn-sm btn-primary" title="Sync Series"><i class="fas fa-cloud-download-alt"></i></button>`;
              if (modality=='SM') {
                return `<div class="icon-center">` + previewBtn + syncBtn + `</div>`;
              } else {
                return `<div class="icon-center">` + syncBtn + `</div>`;
              }

            case 'loading':
              // return downloading
              // return '<div class="icon-center"><i class="fas fa-pen"></i></div>';
              let progressIcon = `<div title="Syncing..." class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>`;
              if (modality=='SM') {
                return `<div class="icon-center">` + previewBtn + progressIcon + `</div>`;
              } else {
                return `<div class="icon-center">` + progressIcon + `</div>`;
              }

            case 'done':
              // return url

              return '<div class="icon-center text-success" title="View"><i class="fas fa-check"></i>' + previewBtn + `</div>`;

            default:

              return '<div class="icon-center text-danger" title="Error"><i class="fas fa-times"></i></div>';
          }
        }
        datatable = $('#datatable').DataTable({
          ...datatableConfig,
          'data': pageStates[pageStates.status].data,
          'columns': [
            {data: 'status', title: 'Status', render: generateStatus},
            {data: '0020000E.Value.0', title: 'Series Id', render: generateLink},
            {data: '00080060.Value.0', title: 'Modality'},
            {data: 'source', title: 'Source'},
            {data: 'studyId', title: 'study Id'},

          ],
        });

        async function checkInterval() {
          const query = {
            'dicom-source-url': src.url,
            'study': params.studyId,
          };

          const slides = await store.findSlide(null, null, params.studyId, null, query);
          console.log(slides);

          const data = datatable.data();

          for (let i = 0; i < data.length; i++) {
            const d = data[i];
            const modality = d['00080060']['Value'][0];
            const series = d['0020000E']['Value'][0];

            if (modality === 'SM') {
              const idx = slides.findIndex((slide) => series === slide.series);
              if (idx !== -1) {
                d.status = slides[idx].status;
                d.slideId = slides[idx]._id.$oid;
              } else {
                d.status = 'unsync';
              }
            }

            if (modality === 'ANN') {
              let annotationQuery = {
                'provenance.image.dicom-source-url': src.url,
                'provenance.image.dicom-study': params.studyId,
                'provenance.image.dicom-series': series,
              };

              let annotationCount = await store.countMarks(annotationQuery);
              console.info('Counted ' + annotationCount[0].count + ' mark objects for ' + series);

              if (annotationCount[0].count > 0) {
                d.status = 'done';
                d.slideId = slides[0]._id.$oid;
              } else {
                d.status = 'unsync';
              }
            }
          }

          datatable.rows().invalidate().draw();

          const series = pageStates[pageStates.status].data;

          if (series.every((s) => s.status !== 'unsync' && s.status !== 'syncing')) {
            console.log('clear');
            clearInterval(updateSeriesStatus);
          }

          console.log('running');
        }

        // initialize
        checkInterval();
        // update every 10 seconds
        var updateSeriesStatus = setInterval(checkInterval, 10000);
      });
      break;
    case 'instances':
      // get source info
      var idx = pageStates.sources.data.findIndex((elt)=>elt.name==decodeURIComponent(params.source));
      var src = pageStates.sources.data[idx];
      // create breadcrumb for instances
      const backSeriesUrl = `../dicom-web/table.html?source=${params.source}&status=series&studyId=${params.studyId}`;
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-web/table.html"><Strong>Sources</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-web/table.html?source=${src.name}&status=studies&studyId=${params.studyId}"><Strong>${src.name}</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item"><a href="${backSeriesUrl}"><strong>${params.studyId}</strong></a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><strong>${params.seriesId}</strong></li>`);


      getInstances(src.url, params.studyId, params.seriesId).then(function(data) {
        // add status
        data.forEach((elt)=>{
          elt.source=params.source;
          elt.studyId=params.studyId;
          elt.seriesId=params.seriesId;
        });
        pageStates[pageStates.status].data = data;
        function generateLink(data, type, row) {
          const {studyId, seriesId, status}= row;
          const instanceId = row['00080018']['Value'][0];
          if (status=='done') return instanceId;
          return `<a href="${src.url}/studies/${studyId}/series/${seriesId}/instances/${instanceId}/rendered?viewport=1024,1024&accept=image/png" target="_blank">${instanceId}</a>`;
        }

        datatable = $('#datatable').DataTable({
          ...datatableConfig,
          'data': pageStates[pageStates.status].data,
          'columns': [
            {data: '00080018.Value.0', title: 'Instance Id', render: generateLink},
            {data: 'source', title: 'Source'},
            {data: 'seriesId', title: 'Series Id'},
            {data: 'studyId', title: 'Study Id'},

          ],
        });
      });
      break;

    default:
      break;
  }
}


$(document).ready(function() {
  initialize();
});


async function syncSeries(sourceUrl, study, series, modality) {
  console.log(sourceUrl, study, series, modality);
  const result = await store.syncSeries('../../', {'source_url': sourceUrl, study, series, modality});
  console.log('syncSeries:');
  console.log(result);
}

function checkSeriesStatus() {
  const series = pageStates[pageStates.status].data;
  series.map();
}
// table.rows.add( dataset ).draw().


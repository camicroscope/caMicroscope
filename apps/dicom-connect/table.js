/**
 * static variables
 */

const sources = [{
  'name':'j4care',
  'url':'https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs'
  
},{
  'name': 'google',
  'url': 'https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb'
}]
// const j4careStudiesUrl = 'https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs'
// const dicomWebStudiesUrl = 'https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb'

/**
 * global variables
 */
isAllSeriesSynced = false;

const datatableConfig = {
  scrollX: true,
  lengthMenu: [
    [10, 25, 50, -1],
    [10, 25, 50, 'All']
  ]
}


const page_states = {
  sources: {
    data: [{
      'name':'j4care',
      'url':'https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs'
      
    },{
      'name': 'google',
      'url': 'https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb'
    }],
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
}
var studies = []



function getStudies(baseUrl) {
  const url = `${baseUrl}/studies`
  return fetch(url).then(resp=>resp.json());
}

function getSeries(baseUrl, studyId) {
  const url = `${baseUrl}/studies/${studyId}/series`
  return fetch(url).then(resp=>resp.json());
}

function getInstances(baseUrl, studyId, seriesId) {
  const url = `${baseUrl}/studies/${studyId}/series/${seriesId}/instances`
  return fetch(url).then(resp=>resp.json());
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


function initialize() {
  const params = getUrlVars();
  console.log('params')
  console.log(params)
  // store
  const store = new Store('../../data/');
  if(params.status=='studies'&&params.source){
    page_states.status = params.status;
  }else if(params.status=='series'&&params.source&&params.studyId) { // series table
    page_states.status = params.status;
  } else if(params.status=='instances'&&params.source&&params.studyId&&params.seriesId) { // isntasnces table
    page_states.status = params.status;
  }



  // <li class="breadcrumb-item"><a href="#">Studies</a></li>
  // <li class="breadcrumb-item"><a href="#">Series</a></li>
  // <li class="breadcrumb-item active" aria-current="page">Instances</li>
  switch (page_states.status) {
    case 'sources':
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><Strong>Sources</Strong></li>`);
      function generateLink (data, type, row) {
        return `<a href="../dicom-connect/table.html?source=${row.name}&status=studies">${row.name}</a>`;
      }
      datatable = $('#datatable').DataTable({
        ... datatableConfig,
        'data': page_states[page_states.status].data,
        'columns': [
          {data: 'name', title: 'Name', render:generateLink}
        ]
      });

      break;
    case 'studies':

      //get source info
      var idx = sources.findIndex(elt=>elt.name==params.source)
      var src = sources[idx]

      // create breadcrumb for studies
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-connect/table.html"><Strong>Sources</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><Strong>${src.name}</Strong></li>`);
      // get all studies
      
      getStudies(src.url).then(function(data) {
        // mapping and merge
        data.forEach(elt=>elt.source=src.name)
        page_states[page_states.status].data = data
        // ${baseUrl}/studies/${studyId}/series
        function generateLink (data, type, row) {
          const studyId = row['0020000D']['Value'][0]
          return `<a href="../dicom-connect/table.html?status=series&source=${row.source}&studyId=${studyId}">${studyId}</a>`;
        }
        datatable = $('#datatable').DataTable({
          ... datatableConfig,
          'data': page_states[page_states.status].data,
          'columns': [
            {data: '0020000D.Value.0', title: 'Study Id', render: generateLink},
            {data: '00100020.Value.0', title: 'Name'},
            {data: 'source', title: 'Source'}
          ]
        });
      })

      break;
    case 'series':
      //get source info
      var idx = sources.findIndex(elt=>elt.name==params.source)
      var src = sources[idx]

      // create breadcrumb for series
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-connect/table.html"><Strong>Sources</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-connect/table.html?source=${src.name}&status=studies&studyId=${params.studyId}"><Strong>${src.name}</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><strong>${params.studyId}</strong></li>`);
      // get all series


      getSeries(src.url, params.studyId).then(function(data) {
        // add source and study id
        data.forEach(elt=>{
          elt.source=src.name
          elt.url=src.url
          elt.studyId=params.studyId
          elt.status='searching' // 'searching', 'unsync', 'loading', 'done'
        })
        page_states[page_states.status].data = data
        function generateLink (data, type, row) {
          const seriesId = row['0020000E']['Value'][0]
          const modality = row['00080060']['Value'][0]
          if (row.status !='done') return seriesId;
          const slideId = row.slideId;
          //if (modality=='SM') 
          return `<a href="../viewer/viewer.html?slideId=${slideId}">${seriesId}</a>`


          // return `<a href="../dicom-connect/table.html?status=instances&source=${row.source}&studyId=${params.studyId}&seriesId=${seriesId}">${seriesId}</a>`;
        }
        function generateStatus (data, type, row) {
          switch (row.status) {
            case 'searching':
              // return spin
              return '<div class="icon-center" title="Loading..."><i class="fas fa-spinner fa-spin"></i></div>';   
            case 'unsync':
              // return btn
              const seriesId = row['0020000E']['Value'][0];
              const modality = row['00080060']['Value'][0];
              return `<div class="icon-center"><button onClick="syncSeries('${row.url}', '${row.studyId}', '${seriesId}', '${modality}')" class="btn btn-sm btn-primary" title="Sync Series"><i class="fas fa-cloud-download-alt"></i></button></div>`; //<i class="fas fa-cloud-download-alt"></i>
            case 'loading':
              // return downloading
              // return '<div class="icon-center"><i class="fas fa-pen"></i></div>';
                  return  `<div title="Syncing..." class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div>`
              case 'done':
              // return url

              return '<div class="icon-center text-success" title="View"><i class="fas fa-check"></i></div>';
                                    
            default:

              return '<div class="icon-center text-danger" title="Error"><i class="fas fa-times"></i></div>';
          }
        }  
        datatable = $('#datatable').DataTable({
          ... datatableConfig,
          'data': page_states[page_states.status].data,
          'columns': [
            {data: 'status', title: 'Status', render: generateStatus},
            {data: '0020000E.Value.0', title: 'Series Id',render:generateLink },
            {data: '00080060.Value.0', title: 'Modality'},
            {data: 'source', title: 'Source'},
            {data: 'studyId', title: 'study Id'}

          ]
        });

        async function checkInterval() {
          const query = {
              'dicom-source-url': src.url,
              'study': params.studyId,
          };
      
          const slides = await store.findSlide(null, null, params.studyId, null, query);
          console.log(slides)
      
          const data = datatable.data();
      
          for (let i = 0; i < data.length; i++) {
              const d = data[i];
              const modality = d['00080060']['Value'][0];
              const series = d['0020000E']['Value'][0];
      
              if (modality === 'SM') {
                  const idx = slides.findIndex(slide => series === slide.series);
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
                      'provenance.image.dicom-series': series
                  };
      
                  let annotationCount = await store.countMarks(annotationQuery);
                  console.info("Counted " + annotationCount[0].count + " mark objects for " + series);
      
                  if (annotationCount[0].count > 0) {
                      d.status = 'done';
                      d.slideId = slides[0]._id.$oid;
                  } else {
                      d.status = 'unsync';
                  }
              }
          }
      
          datatable.rows().invalidate().draw();
      
          const series = page_states[page_states.status].data;
      
          if (series.every(s => s.status !== 'unsync' && s.status !== 'syncing')) {
              console.log('clear');
              clearInterval(updateSeriesStatus);
          }
      
          console.log('running');
      }

        // initialize
        checkInterval()
        // update every 10 seconds
        var updateSeriesStatus = setInterval(checkInterval, 10000);
      })
      break;
    case 'instances':
      //get source info
      var idx = sources.findIndex(elt=>elt.name==params.source)
      var src = sources[idx]      
      // create breadcrumb for instances
      const backSeriesUrl = `../dicom-connect/table.html?source=${params.source}&status=series&studyId=${params.studyId}`
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-connect/table.html"><Strong>Sources</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item" aria-current="page"><a href="../dicom-connect/table.html?source=${src.name}&status=studies&studyId=${params.studyId}"><Strong>${src.name}</Strong><a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item"><a href="${backSeriesUrl}"><strong>${params.studyId}</strong></a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><strong>${params.seriesId}</strong></li>`);





      getInstances(src.url, params.studyId, params.seriesId).then(function(data) {
        // add status
        data.forEach(elt=>{
          elt.source=params.source
          elt.studyId=params.studyId
          elt.seriesId=params.seriesId
          
        })
        page_states[page_states.status].data = data
        function generateLink (data, type, row) {
          const {studyId, seriesId, status}= row
          const instanceId = row['00080018']['Value'][0]
          if (status=='done') return instanceId
          return `<a href="${src.url}/studies/${studyId}/series/${seriesId}/instances/${instanceId}/rendered?viewport=1024,1024&accept=image/png" target="_blank">${instanceId}</a>`;
        }

        datatable = $('#datatable').DataTable({
          ... datatableConfig,
          'data': page_states[page_states.status].data,
          'columns': [
            {data: '00080018.Value.0', title: 'Instance Id', render: generateLink},
            {data: 'source', title: 'Source'},
            {data: 'seriesId', title: 'Series Id'},
            {data: 'studyId', title: 'Study Id'},
            
          ]
        });
      })      
      break;
  
    default:
      break;
  }
}


$(document).ready(function() {
  initialize();
});


async function syncSeries(source_url, study, series, modality) {
  console.log(source_url, study, series, modality);
  const result = await store.syncSeries('../../', {source_url, study, series, modality})
  console.log('syncSeries:');
  console.log(result);
}

function checkSeriesStatus() {
  const series = page_states[page_states.status].data
  series.map()

}
// table.rows.add( dataset ).draw().


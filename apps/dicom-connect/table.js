/**
 * static variables
 */

const sources = {
  'j4care': 'https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs',
  'dicomweb': 'https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb'
}
// const j4careStudiesUrl = 'https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs'
// const dicomWebStudiesUrl = 'https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb'

/**
 * global variables
 */

const datatableConfig = {
  scrollX: true,
  lengthMenu: [
    [10, 25, 50, -1],
    [10, 25, 50, 'All']
  ]
}


const page_states = {
  studies: {
    data: null,
  },
  series: {
    data: null,
  },
  instances: {
    data: null,
  },
  status: 'studies', // 'studies, series, instsances'
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
  
  if(params.status=='series'&&params.studyId) { // series table
    page_states.status = params.status;


  } else if(params.status=='instances'&&params.studyId&&params.seriesId) { // isntasnces table
    page_states.status = params.status;
  }



  // <li class="breadcrumb-item"><a href="#">Studies</a></li>
  // <li class="breadcrumb-item"><a href="#">Series</a></li>
  // <li class="breadcrumb-item active" aria-current="page">Instances</li>
  switch (page_states.status) {
    case 'studies':
      // create breadcrumb for studies
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><Strong>Studies</Strong></li>`);
      // get all studies
      const Promises = [];
      Promises.push(getStudies(sources.j4care));
      Promises.push(getStudies(sources.dicomweb));
      Promise.all(Promises)
      .then(function(data) {
        // get studies from j4care and dicomweb
        const j4careStudies = data[0];
        const dicomWebStudies = data[1];
        
        // mapping and merge
        j4careStudies.forEach(elt=>elt.source='j4care')
        dicomWebStudies.forEach(elt=>elt.source='dicomweb')
        page_states[page_states.status].data = [...j4careStudies, ...dicomWebStudies]//studiesTransformer([...j4careStudies, ...dicomWebStudies]) 

        // ${baseUrl}/studies/${studyId}/series
        function generateLink (data, type, row) {
          const studyId = row['0020000D']['Value'][0]
          return `<a href="../dicom-connect/table.html?source=${row.source}&status=series&studyId=${studyId}">${studyId}</a>`;
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
      // create breadcrumb for series
      $('#breadcrumb').append(`<li class="breadcrumb-item"><a href="../dicom-connect/table.html"><strong>Studies</strong></a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><strong>${params.studyId}</strong></li>`);
      // get all series
      getSeries(sources[params.source], params.studyId).then(function(data) {
        // add source and study id
        data.forEach(elt=>{
          elt.source=params.source
          elt.studyId=params.studyId
          
        })
        
        
        page_states[page_states.status].data = data
        function generateLink (data, type, row) {
          const seriesId = row['0020000E']['Value'][0]
          return `<a href="../dicom-connect/table.html?source=${row.source}&status=instances&studyId=${params.studyId}&seriesId=${seriesId}">${seriesId}</a>`;
        }
        console.log(data)
        datatable = $('#datatable').DataTable({
          ... datatableConfig,
          'data': page_states[page_states.status].data,
          'columns': [
            {data: '0020000E.Value.0', title: 'Series Id', render: generateLink},
            {data: '00080060.Value.0', title: 'Modality'},
            {data: 'source', title: 'Source'},
            {data: 'studyId', title: 'study Id'}

          ]
        });        
      })
      break;
    case 'instances':
      // create breadcrumb for instances
      const backSeriesUrl = `../dicom-connect/table.html?source=${params.source}&status=series&studyId=${params.studyId}`
      $('#breadcrumb').append(`<li class="breadcrumb-item"><a href="../dicom-connect/table.html"><strong>Studies</strong></a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item"><a href="${backSeriesUrl}"><strong>${params.studyId}</strong></a></li>`);
      $('#breadcrumb').append(`<li class="breadcrumb-item active" aria-current="page"><strong>${params.seriesId}</strong></li>`);

      getInstances(sources[params.source], params.studyId, params.seriesId).then(function(data) {
        console.log(data)
        data.forEach(elt=>{
          elt.source=params.source
          elt.studyId=params.studyId
          elt.seriesId=params.seriesId
        })
        page_states[page_states.status].data = data
        function generateLink (data, type, row) {
          const {studyId, seriesId, source}= row
          const instanceId = row['00080018']['Value'][0]
          return `<a href="${sources[source]}/studies/${studyId}/series/${seriesId}/instances/${instanceId}/rendered?viewport=1024,1024&accept=image/png" target="_blank">${instanceId}</a>`;
        }
        datatable = $('#datatable').DataTable({
          ... datatableConfig,
          'data': page_states[page_states.status].data,
          'columns': [
            {data: '0020000D.Value.0', title: 'Instance Id', render: generateLink},
            {data: 'source', title: 'Source'},
            {data: 'seriesId', title: 'Series Id'},
            {data: 'studyId', title: 'study Id'}
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

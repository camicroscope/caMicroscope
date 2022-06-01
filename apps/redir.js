let params = getUrlVars();
let isPathdb = false;

if (params.hasOwnProperty('mode') && params.mode == 'pathdb') {
  PathDbMods();
  isPathdb = true;
}

const store = new Store('../data/');

if (params.hasOwnProperty('slide')) {
  store.findSlide(params.slide, params.specimen, params.study, 0, 0, params.collection).then((x)=>{
    console.info(x);
    if (x.length <=0) {
      throw new Error('No Matches found');
    }
    if (isPathdb) {
      // get the pathdb url
      window.location = './viewer/viewer.html?slideId=' + x[0]['_id']['$oid'] + '&mode=pathdb';
    } else {
      // get the normal url
      window.location = './viewer/viewer.html?slideId=' + x[0]['_id']['$oid'];
    }
  }).catch((e)=>{
    console.error(e);
    alert('ERROR!');
  });
} else {
  console.error('no slide passed?');
  alert('ERROR!');
}

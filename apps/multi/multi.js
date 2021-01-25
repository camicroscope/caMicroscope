// initalize dependencies and params
let store = new Store('../../data/');
const urlParams = new URLSearchParams(window.location.search);
const page = parseInt(urlParams.get('p'), 10) || 0;
const mode = urlParams.get('mode');
const MAX_TILES = parseInt(urlParams.get('mt'), 10) || 16;
const prefixUrl = 'https://cdn.jsdelivr.net/npm/openseadragon@2.3/build/openseadragon/images/';
let query = JSON.parse(urlParams.get('q') || '{}');
let list = JSON.parse(urlParams.get('l') || '[]');

let viewers = [];

// run the pathdb mods as needed
if (mode == 'pathdb') {
  PathDbMods();
}

const workspace = document.getElementById('workspace');

function addTile(url, i, name, dest) {
  let d = document.createElement('div');
  d.id = 'osd' + i;
  d.className = 'osd col';
  // tile size, and hidden to start
  d.style = 'min-width: 400px; width:22%; height:400px';
  // add link to slide
  let b = document.createElement('a');
  b.id = 'link' + i;
  b.innerText = name;
  b.href=dest;
  d.appendChild(b);
  d.appendChild(document.createElement('br'));
  workspace.appendChild(d);
  viewers[i] = OpenSeadragon({
    id: d.id,
    prefixUrl: prefixUrl,
    tileSources: url,
  });
}

function onInit() {
  let promises = [];
  if (list.length) {
    for (j of list) {
      promises.push(store.getSlide(j));
    }
  } else {
    if (mode == 'pathdb') {
      // use pathdb query instead
      // promises.push(store.findSlide(null, null, null, null, query));
    } else {
      promises.push(store.findSlide(null, null, null, null, query));
    }
  }
  Promise.all(promises).then((xx)=>{
    let x = xx.flat();
    // pagination
    // previous?
    if (page > 0) {
      let p = document.createElement('a');
      let prevParam = new URLSearchParams(window.location.search);
      p.id = 'prevPage';
      prevParam.set('p', page-1);
      p.innerText = 'Prev';
      p.href = './multi.html?' + prevParam.toString();
      document.getElementById('pages').append(p);
    }
    // next?
    if (page < Math.floor(x.length/MAX_TILES)-1) {
      let p = document.createElement('a');
      let nextParam = new URLSearchParams(window.location.search);
      p.id = 'nextPage';
      nextParam.set('p', page+1);
      p.innerText = 'Next';
      p.href = './multi.html?' + nextParam.toString();
      document.getElementById('pages').append(p);
    }
    // tiles
    let start = MAX_TILES * page;
    let stop = Math.min(x.length, start+MAX_TILES);
    for (let n = start; n < stop; n++) {
      let item = x[n];
      let loc = '../../img/IIP/raw/?DeepZoom=' + item.location + '.dzi';
      let dest = '../viewer/viewer.html?slideId=' + item._id['$oid'];
      if (mode == 'pathdb') {
        dest += '&mode=pathdb';
      }
      addTile(loc, n, item.name, dest);
    }
  });
}

// TODO pagination

window.onload = onInit;

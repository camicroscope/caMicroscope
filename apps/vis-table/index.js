

// var totalPages = Math.ceil(totalCount / size)
//   query.skip = size * (pageNo - 1) page # start from 1
//  query.limit = size

$D = {
  // for pagination
  recordCount: 0,
  recordPerPage: 10,
  totalPage: 0,
  currentPage: 1,
  // for collection
  collectionData: null,
  collectionTree: null,
  currentSlideData: null,

};
$UI = {
  // collection UI
  colMessage: $('#coll-message'),
  colTree: $('#main-tree-view'),
  // slide grid
  slideMessage: $('#main-view-message'),
  slideBreadcrumb: $('#main-view-breadcrumb'),
  selRecordPerPage: $('#selRecordPerPage'),
  slideSearch: $('#slideSearch'),
  //
  mainView: $('#main-view-panel'),
  recordMessage: $('#recordMessage'),
  gridView: $('.row.grid-view'),
  gridViewContainer: $('.inner-grid-view'),
  paginator: null,
  selectedNode: null,
};

const store = new Store('../../data/');

$UI.slideSearch.on('keyup', Debounce(()=>{
  const name = ($UI.slideSearch.val()).trim();
  if (!name) {
    console.log('normal');
    return;
  }
  console.log('search');

  const Promises = [];
  Promises.push(store.countSlide());
  Promises.push(store.findSlide());


  // Promise.all(Promises);


  // Promise.all(Promises)
  //     .then(function(resps) {
  //       console.log(resps);
  //     });
}, 500));
// const query={
//   collections: '60dc90103fc2ac00332541fb',
//   _search_: {'name': 'test'},
//   sort: {'name': 1},
//   limit: 10,
//   skip: 0,
// };

// store.findSlide(null, null, null, null, query).then((data)=>{
//   console.log('slides', data);
// });
// store.countSlide({collections: '60dc90103fc2ac00332541fb', _search_: {'name': 'test'}}).then((data)=>{
//   console.log('count', data);
// });


$UI.selRecordPerPage.on('change', async ()=>{
  const newPrePage = +$UI.selRecordPerPage.val();
  const newTotalPage = Math.ceil($D.recordCount/newPrePage);
  const newCurrentPage = Math.ceil(($D.recordPerPage * ($D.currentPage - 1) + 1) / newPrePage);

  $D.recordPerPage = newPrePage;
  $D.currentPage = Math.min(newCurrentPage, newTotalPage);
  $D.totalPage = newTotalPage;

  $UI.paginator = new Paginator({
    id: 'paginator',
    currentPage: $D.currentPage,
    totalPage: $D.totalPage,
    sizing: 'pagination-sm',
    justifyContent: 'justify-content-end',
    onChange: onPaginationChange,
  });
  $UI.recordMessage.text(`Showing ${$D.recordPerPage * ($D.currentPage-1) + 1} to ${Math.min($D.recordPerPage * $D.currentPage, $D.recordCount)} of ${$D.recordCount} entities`);

  // load slide data
  const query={
    collections: $D.selectedNode.id,
    sort: {'name': 1},
    limit: $D.recordPerPage,
    skip: $D.recordPerPage * ($D.currentPage - 1),
  };

  const slides = await store.findSlide(null, null, null, null, query);
  if (Array.isArray(slides)&& slides.length > 0) {
    $D.currentSlideData = slides;

    createGridCards();
  } else {
    $D.currentSlideData = null;
  }
  // $UI.paginator.setting.currentPage = $D.currentPage;
  // $UI.paginator.setting.totalPage = $D.totalPage;
  // $UI.paginator.draw();
  // // $D.recordPerPage = newPrePage;
  // console.log(currentPage, recordPerPage);
});
// loading the collections
// store.getAllCollection().then((data) => {
//   if (Array.isArray(data)) {
//     $collectionList = data.map((d)=>{
//       d.id = d._id.$oid;
//       delete d._id;
//       return d;
//     });
//     $collectionTree = listToTree(data);


//   } else {
//     // error message

//   }
// });

async function loadSlideInfo(node) {
  if (!node.original.slides || node.original.slides.length == 0) {
    $UI.slideMessage.html(`The Collection <label class='text-primary' style='font-weight:bold;'>${node.original.name}</label> Doesn't Have Slides.`);
    $UI.mainView.hide();
    $UI.slideMessage.show();
    return;
  }

  $UI.slideMessage.hide();
  $UI.mainView.show();
  resize();

  // create loading ...
  $UI.gridViewContainer.empty();
  const loader = document.createElement('div');
  loader.classList.add('loader');
  $UI.gridViewContainer.append(loader);

  // calculate and draw the pagination
  $D.recordCount = node.original.slides.length;
  $D.recordPerPage = +$UI.selRecordPerPage.val();
  $D.totalPage = Math.ceil($D.recordCount/$D.recordPerPage);
  $D.currentPage = 1;
  $UI.paginator = new Paginator({
    id: 'paginator',
    currentPage: $D.currentPage,
    totalPage: $D.totalPage,
    sizing: 'pagination-sm',
    justifyContent: 'justify-content-end',
    onChange: onPaginationChange,
  });
  $UI.recordMessage.text(`Showing ${$D.recordPerPage * ($D.currentPage-1) + 1} to ${Math.min($D.recordPerPage * $D.currentPage, $D.recordCount)} of ${$D.recordCount} entities`);

  // load slide data
  const query={
    collections: node.id,
    sort: {'name': 1},
    limit: $D.recordPerPage,
    skip: $D.recordPerPage * ($D.currentPage - 1),
  };

  const slides = await store.findSlide(null, null, null, null, query);
  if (Array.isArray(slides)&& slides.length > 0) {
    $D.currentSlideData = slides;

    createGridCards();
  } else {
    $D.currentSlideData = null;
  }
}


async function onPaginationChange({currentPage, totalPage}) {
  $D.currentPage = currentPage;
  // create loading ...
  $UI.gridViewContainer.empty();
  const loader = document.createElement('div');
  loader.classList.add('loader');
  $UI.gridViewContainer.append(loader);


  $D.currentPage = currentPage;
  const query={
    collections: $D.selectedNode.id,
    sort: {'name': 1},
    limit: $D.recordPerPage,
    skip: $D.recordPerPage * ($D.currentPage - 1),
  };
  $UI.recordMessage.text(`Showing ${$D.recordPerPage * ($D.currentPage-1) + 1} to ${Math.min($D.recordPerPage * $D.currentPage, $D.recordCount)} of ${$D.recordCount} entities`);

  const slides = await store.findSlide(null, null, null, null, query);

  if (Array.isArray(slides)&& slides.length > 0) {
    $D.currentSlideData = slides;

    createGridCards();
  } else {
    $D.currentSlideData = null;
  }
}
function createGridCards() {
  $UI.gridViewContainer.empty();
  $D.currentSlideData.forEach((slide) => {
    $UI.gridViewContainer.append(createGridCard(slide));
  });
}
function createGridCard(d) {
  const card = document.createElement('div');
  card.classList.add('grid-card');
  const title = document.createElement('div');

  const loader = document.createElement('div');
  loader.classList.add('loader');
  card.append(loader);
  // create Image
  const img = document.createElement('img');
  img.alt = `${d.name}`;
  // HEI
  // WID
  if (d.height > d.width) {
    img.src = `../../img/IIP/raw/?FIF=${d.location}&HEI=256&CVT=.jpg`;
  } else {
    img.src = `../../img/IIP/raw/?FIF=${d.location}&WID=256&CVT=.jpg`;
  }

  img.onload = ()=>{
    loader.remove();
    card.append(img);
  };
  // add title
  title.classList.add('grid-card-title');
  title.classList.add('bg-dark');
  title.title = `${d.name}`;
  title.textContent = `${d.name}`;
  card.appendChild(title);
  // add to the link
  const anchor = document.createElement('a');
  anchor.href = `../viewer/viewer.html?slideId=${d['_id']['$oid']}`;
  anchor.appendChild(card);

  return anchor;
}

function createCollectionTree() {
  $UI.colTree.jstree({
    'core': {
      'data': $D.collectionTree,
      'multiple': false,
      'check_callback': true,
    },
    'types': {
      '#': {'max_children': 1, 'max_depth': 4, 'valid_children': ['default']},
      'default': {'valid_children': ['default']},
    },
    'plugins': ['search', 'wholerow'],
  });


  $UI.colTree.on('loaded.jstree', () => {
    //
    if ($D.collectionData&&$D.collectionData.length) return;
    // show up message
    $UI.colMessage.show();
  });

  // bind select node event
  $UI.colTree.on('select_node.jstree', function(event, _data) {
    const node = _data.node;
    if (node) {
      $D.selectedNode = node;
      // UI control

      // create collection path
      createBreadcrumb(node);
      if (node.children.length > 0) {
        $UI.slideMessage.text('Please Select A Collection Without Subcollection ...');
        $UI.mainView.hide();
        $UI.slideMessage.show();
        return;
      }

      // the collection has slides
      if (node.original.slides&&node.original.slides.length>0) {

      } else {

      }
      // loading slide data
      // $D.s = await

      loadSlideInfo(node);

      // let slides checked if the slides in the collection
      // const collData = $D.collectionData.find((d)=>d.id==node.id);
      // deselected all slides

      // $DTable.clear();
      // $DTable.rows.add($slideData).search('').draw(true);
    }
  });
}

window.addEventListener('resize', resize);
// console.log(calculateSize(document.querySelector('.pagination-control')));
window.addEventListener('load', async ()=> {
  // get the collection data
  var data = await store.getAllCollection();
  if (Array.isArray(data)) {
    $D.collectionData = data.map((d)=>{
      d.id = d._id.$oid;
      d.name = d.text;
      delete d._id;
      return d;
    });
    $D.collectionTree = listToTree($D.collectionData);
    $D.collectionData.forEach((d)=>{
      if (d.children && d.children.length == 0) d.text = `${d.text} [${d.slides?d.slides.length:0}]`;
    });
    createCollectionTree();
  } else { // error message
    $UI.colTree.hide();
    // showup the error message
    $UI.colMessage.removeClass('alert-warning');
    $UI.colMessage.addClass('alert-danger');
    $UI.colMessage.text(`Can't Load the Collection Data!`);
    $UI.colMessage.show();
    return;
  }
});

function resize() {
  // don't calculate if the main view is hidden
  if ($UI.mainView.css('display') == 'none') return;

  const {innerWidth, innerHeight} = window;
  const gridView = document.querySelector('.grid-view');
  const pagCtrl = document.querySelector('.pagination-control');
  const footer = document.querySelector('footer');
  const breadcrumb = document.querySelector('#main-view-breadcrumb');
  if (innerWidth <= 768 ) {
    gridView.style.height = null;
    return;
  }


  const {x, y} = gridView.getBoundingClientRect();
  const pageCtrlRect = calculateSize(pagCtrl);
  const footerRect = calculateSize(footer);
  gridView.style.height = `${Math.ceil(innerHeight - y - pageCtrlRect.height - footerRect.height )}px`;
}

function calculateSize(elt) {
  const {marginLeft, marginRight, marginTop, marginBottom} = getComputedStyle(elt);


  const width = Math.ceil(elt.offsetWidth) + parseInt(marginLeft) + parseInt(marginRight);
  const height = Math.ceil(elt.offsetHeight) + parseInt(marginTop) + parseInt(marginBottom);
  // console.log(elt.offsetWidth, elt.offsetHeight);
  // console.log(width, height);
  return {width, height, offsetWidth: Math.ceil(elt.offsetWidth), offsetHeight: Math.ceil(elt.offsetHeight)};
}


function createBreadcrumb(node) {
  // clear the old crumb
  $UI.slideBreadcrumb.empty();
  if (!node) return;
  //
  const parentNames = getParentNames(node);

  const crumbList = [...parentNames.reverse(), node.original.name];

  $UI.slideBreadcrumb.html(crumbList.map((name)=>
    name==node.original.name?`<div class="breadcrumb-item active" aria-current="page">${name}</div>`:`<div class="breadcrumb-item" ><a href="#">${name}</a></div>`,
  ).join(''));
}

function getParentNames(node) {
  const rs = [];
  node.parents.forEach((id) => {
    if (id!=='#') {
      const cdata = $D.collectionData.find((d)=>d.id == id);
      rs.push(cdata.name);
    }
  });
  return rs;
}

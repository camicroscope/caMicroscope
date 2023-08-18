// $($UI.colTree).jstree(true).get_json('#', { flat: true });

// the close case button
const closeCaseBtn = document.getElementById('closeCase');
// var totalPages = Math.ceil(totalCount / size)
//   query.skip = size * (pageNo - 1) page # start from 1
//  query.limit = size
closeCaseBtn.addEventListener('click', async ()=>{
  // verify the most relative informative slides
  const informativeSlides = $D.currentSlideData.filter((slide)=>{
    return slide.evaluation&&slide.evaluation.evaluation&&slide.evaluation.evaluation.informativeness=='1';
  });
  if (informativeSlides.length == 1 && !$D.slidesRank.first) {
    alert('Please Select the 1st Most Informative Slide Before Closing the Case!');
    return;
  } else if (informativeSlides.length == 2 && (!$D.slidesRank.first || !$D.slidesRank.second)) {
    alert('Please Select the 1st & 2nd Most Informative Slide Before Closing the Case!');
    return;
  } else if (informativeSlides.length >= 3 && (!$D.slidesRank.first || !$D.slidesRank.second || !$D.slidesRank.third)) {
    alert('Please Select the 1st & 2nd & 3rd Most Informative Slide Before Closing the Case!');
    return;
  }
  try {
    const rs = await store.setCollectionTaskStatusByCollectionId($D.user.key, $D.selectedNode.id, true);
    if (rs&&rs.ok) {
      const user = $D.selectedNode.original.users.find((u)=>u.user == $D.user.key);
      if (user) user.task_status = true;
      // check is case close
      const colTree = $($UI.colTree).jstree();
      colTree.set_icon($D.selectedNode, './check-folder.png');
      const domNode = colTree.get_node($D.selectedNode, true);
      domNode.addClass('text-success');
      $UI.message.add(`The Collection <span class='text-blue'>${fullPathName($D.selectedNode)}</span> Case Closed!`);

      // disable level based on leve flag TODO
      toggleLevelFlag(false);
    } else {
      // db update error
      console.error(`setCollectionTaskStatusByCollectionId update failed`);
      $UI.message.addError(`Changing The Collection ${$D.selectedNode.original.name} Case Status Failed!`);
    }
  } catch (error) {
    // server error
    console.error(`setCollectionTaskStatusByCollectionId error`);
    $UI.message.addError(error);
  }
});

const rankLevel = [
  'Not Evaluated',
  '1st Most Informative',
  '2nd Most Informative',
  '3rd Most Informative',
  'Less Informative',
];
$D = {
  user: null,
  // for pagination
  recordCount: 0,
  recordPerPage: 25,
  totalPage: 0,
  currentPage: 1,
  // for collection
  collectionData: null,
  collectionTree: null,

  isRankEnable: false,
  slidesRank: null,
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
  // any hit message on the screen
  message: new MessageQueue({position: 'bottom-left'}),
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
}, 500));

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
  createGridCards();
});


async function loadSlideInfo(node) {
  closeCaseBtn.disabled = true;

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
    // limit: $D.recordPerPage,
    // skip: $D.recordPerPage * ($D.currentPage - 1),
  };
  const slides = await store.findSlide(null, null, null, null, query);
  const {evaluations, humanAnnotationCounts} = await store.getSlidesExtraInfoByCollectionId(node.id);

  if (Array.isArray(slides)&& slides.length > 0 && evaluations && humanAnnotationCounts) {
    // merge eval and human annotation count into slide data
    slides.forEach((slide)=>{
      const sid = slide._id.$oid;

      // search on evaluations
      slide.evaluation = evaluations.find((eval)=>eval.slide_id==sid);

      // slide sort
      slide.order = 2;
      // 1. draft is true
      if (slide.evaluation&&slide.evaluation.is_draft==true) {
        slide.order = 1;
      }
      // 2. no evauation
      // 3. draft is false informativeness == '1'
      if (slide.evaluation&&slide.evaluation.is_draft==false) {
        const eval = slide.evaluation;
        if (eval.evaluation.informativeness == '1') {
          slide.order = 3;
        } else {
          slide.order = 4;
        }
        if (eval.evaluation.slide_quality == '2') {
          slide.order = 5;
        }
      }

      // search on humanAnnotationCounts
      slide.annotationCount = humanAnnotationCounts.find((d)=>d._id==sid);
    });
    $D.currentSlideData = slides;

    // is show relaive informativeness rank
    $D.isRankEnable = getSlideRankStatus();

    // get the rank data
    if ($D.isRankEnable) {
      const slidesRank = await store.findSlidesInformativeness(node.id, $D.user.key);
      if (slidesRank&&Array.isArray(slidesRank)) {
        // check if all evaluations are not uninformativeness
        const test = $D.currentSlideData.filter((slide)=>{
          // if ALL not informative (e.g. not H&E, Cytology, No tumor present, or not informative) then allow us to skip ranking
          return slide.evaluation&&slide.evaluation.evaluation&&slide.evaluation.evaluation.informativeness !=='1'
        }).map((d)=>d._id.$oid);
        if (test.length == $D.currentSlideData.length) {
          closeCaseBtn.disabled = false;
        } else { 
          $D.slidesRank = slidesRank.length==0?null:slidesRank[0];
          if ($D.slidesRank) {
            isCaseClosed();
          }
        }
      } else { // error TODO
        console.error('error');
      }
    }

    createGridCards();
  } else {
    $D.currentSlideData = null;
  }
}

function isCaseClosed() {
  // the slide in selected collection
  const slidesA = $D.currentSlideData.filter((slide)=>{
    return slide.evaluation&&slide.evaluation.evaluation&&slide.evaluation.evaluation.informativeness=='1';
  }).map((d)=>d._id.$oid);

  if (slidesA.length == 1 && !$D.slidesRank.first) {
    return false;
  } else if (slidesA.length == 2 && (!$D.slidesRank.first || !$D.slidesRank.second)) {
    return false;
  } else if (slidesA.length >= 3 && (!$D.slidesRank.first || !$D.slidesRank.second || !$D.slidesRank.third)) {
    return false;
  }
  // the slide that has relative informativeness
  const slidesB = [...$D.slidesRank.less];
  if ($D.slidesRank.first) slidesB.push($D.slidesRank.first);
  if ($D.slidesRank.second) slidesB.push($D.slidesRank.second);
  if ($D.slidesRank.third) slidesB.push($D.slidesRank.third);
  if (arrayCompare(slidesA, slidesB)) {
    // enable Case Close btn
    closeCaseBtn.disabled = false;
    return true;
  } else {
    // disable Case Close btn
    closeCaseBtn.disabled = true;
    return false;
  }
}

function arrayCompare(arrayA, arrayB) {
  if (
    !Array.isArray(arrayA) ||
    !Array.isArray(arrayB) ||
    arrayA.length !== arrayB.length
  ) {
    return false;
  }

  // .concat() to not mutate arguments
  const a = arrayA.concat().sort();
  const b = arrayB.concat().sort();

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function getSlideRankStatus() {
  // const sids = $D.selectedNode.original&&
  // $D.selectedNode.original.slides&&
  // Array.isArray($D.selectedNode.original.slides)?
  // $D.selectedNode.original.slides:[];
  // if (sids.length == 0) return false;
  // var sinfo = await store.getSlidesHumanMarkNum(sids);
  // sinfo = sinfo.map((d)=>d._id);

  // for (let index = 0; index < sids.length; index++) {
  //   const sid = sids[index];
  //   // check evalutions
  //   const evalData = $D.SlidesEvaluations.find((e)=>e.sid==sid);
  //   if (evalData&&evalData.eval&&evalData.eval.some((e)=>e.creator == getUserId())&&sinfo.includes(sid)) {
  //   } else {
  //     return false;
  //   }
  //   // check anntations

  //   //
  //   //
  // }
  // return true;
  for (let index = 0; index < $D.currentSlideData.length; index++) {
    const slide = $D.currentSlideData[index];
    if (!slide.evaluation) return false;
    // const eval = slide.evaluation.evaluation;
    if (slide.evaluation&&
      slide.evaluation.evaluation&&
      slide.evaluation.evaluation.tumor_present == '1'&&
      !slide.annotationCount) return false;
  }
  return true;
}

async function onPaginationChange({currentPage, totalPage}) {
  $D.currentPage = currentPage;
  // create loading ...
  $UI.gridViewContainer.empty();
  const loader = document.createElement('div');
  loader.classList.add('loader');
  $UI.gridViewContainer.append(loader);


  $D.currentPage = currentPage;
  const query = {
    collections: $D.selectedNode.id,
    sort: {'name': 1},
    limit: $D.recordPerPage,
    skip: $D.recordPerPage * ($D.currentPage - 1),
  };
  $UI.recordMessage.text(`Showing ${$D.recordPerPage * ($D.currentPage-1) + 1} to ${Math.min($D.recordPerPage * $D.currentPage, $D.recordCount)} of ${$D.recordCount} entities`);

  // const slides = await store.findSlide(null, null, null, null, query);


  // if (Array.isArray(slides)&& slides.length > 0) {
  //   $D.currentSlideData = slides;

  createGridCards();
  // } else {
  //   $D.currentSlideData = null;
  // }
}
async function createGridCards() {
  $UI.gridViewContainer.empty();
  // limit: $D.recordPerPage,
  const start = $D.recordPerPage * ($D.currentPage - 1);
  let slides = $D.currentSlideData.slice(start, start + $D.recordPerPage);

  const parentNames = getParentNames($D.selectedNode);
  const crumbList = [...parentNames.reverse(), $D.selectedNode.original.name];
  slides.sort((a, b) => a.order - b.order).forEach((slide) => {
    $UI.gridViewContainer.append(createGridCard(slide, crumbList));
  });
  // level flage control
  if (closeCaseBtn.disabled) {
    toggleLevelFlag(true);
  } else {
    toggleLevelFlag(false);
  }
}

function createGridCard(d, crumbList) {
  const sid = d['_id']['$oid'];
  const card = document.createElement('div');
  card.id = sid;
  card.classList.add('grid-card');
  const cardContent = document.createElement('div');
  cardContent.id = sid;
  cardContent.classList.add('grid-card-content');
  // add to the link
  cardContent.addEventListener('click', ()=>{
    location.href=`../viewer/viewer.html?slideId=${sid}&crumb=${crumbList.join('/')}`;
  });
  card.appendChild(cardContent);

  const loader = document.createElement('div');
  loader.classList.add('loader');
  cardContent.append(loader);
  // create Image
  const img = document.createElement('img');
  img.alt = `${d.name}`;

  if (d.thumbnail) {
    // use a prebaked thumbnail if possible
    img.src = '../../' + d.thumbnail;
  } else if (d.height > d.width) {
    // HEI
    img.src = `../../img/IIP/raw/?FIF=${d.location}&HEI=256&CVT=.jpg`;
  } else {
    // WID
    img.src = `../../img/IIP/raw/?FIF=${d.location}&WID=256&CVT=.jpg`;
  }

  img.onload = ()=>{
    loader.remove();
    cardContent.append(img);
  };


  // add title
  const title = document.createElement('div');
  title.classList.add('grid-card-title');
  title.classList.add('bg-dark');
  title.title = `${d.name}`;
  title.textContent = `${d.name}`;

  // DOE customized

  // informativeness indicator
  const [indicator, score, levels] = getInformativenessInfos(d);
  card.appendChild(indicator);
  card.appendChild(levels);
  if (score) card.appendChild(score);

  if (d.evaluation&&
    d.evaluation.is_draft==false&&
    (d.evaluation.evaluation.slide_quality == 2 || d.evaluation.evaluation.slide_quality == 3)) {
    cardContent.classList.add('grayscale');
    const indicatorIcon = indicator.querySelector('i');
    indicatorIcon.className = '';
    indicatorIcon.classList.add('fas');
    if (d.evaluation.evaluation.slide_quality == 2) {
      indicatorIcon.title = d.evaluation.evaluation.slide_quality = 'Not H&E Stained Slide';
      indicatorIcon.classList.add('fa-trash');
      indicatorIcon.classList.add('text-black');
    } else {
      indicatorIcon.title = d.evaluation.evaluation.slide_quality = 'Cytology: Not cell block';
      indicatorIcon.classList.add('fa-eye-slash');
      indicatorIcon.classList.add('text-gray');
    }
  }
  cardContent.appendChild(title);

  const indicatorIcon = indicator.querySelector('i');
  if ($D.isRankEnable && indicatorIcon && indicatorIcon.classList.contains('fa-check') ) {
    const informativenessSlides = $D.currentSlideData.filter((slide)=>{
      return slide.evaluation&&slide.evaluation.evaluation&&slide.evaluation.evaluation.informativeness==1;
    });
    const rankDropDown = generateDropdownMenu(card, d, informativenessSlides);
    card.appendChild(rankDropDown);
  }
  // anchor


  // anchor.appendChild(card);

  return card;
}

function generateDropdownMenu(elt, data, informativenessSlides) {
  const div = document.createElement('div');
  div.classList.add('rank-dropdown');
  div.classList.add('dropdown');
  const level = getRankLevel(elt.id);
  const dropdown = `
  <button class="btn btn-sm ${level?'btn-primary':'btn-danger'} dropdown-toggle" type="button" id="dropdown_${elt.id}" data-bs-toggle="dropdown" aria-expanded="false">${rankLevel[level]}</button>
  <ul class="dropdown-menu" aria-labelledby="dropdown_${elt.id}">
    
    <li data-sid="${elt.id}" data-level="1"><a class="dropdown-item ${level==1?'active':''}" href="#">1st Most Informative</a></li>
    ${informativenessSlides.length > 1 ?
    `<li data-sid="${elt.id}" data-level="2"><a class="dropdown-item ${level==2?'active':''}" href="#">2nd Most Informative</a></li>`:
    ''}
    ${informativenessSlides.length > 2 ?
    `<li data-sid="${elt.id}" data-level="3"><a class="dropdown-item ${level==3?'active':''}" href="#">3rd Most Informative</a></li>`:
    ''}
    ${informativenessSlides.length > 3 ?
    `<li data-sid="${elt.id}" data-level="less"><a class="dropdown-item ${level==4?'active':''}" href="#">Less Informative</a></li>`:
    ''}
  </ul>`;
  div.innerHTML = dropdown;
  $(div).find('li').on('click', async function(e) {
    closeCaseBtn.disabled = true;
    const {sid, level} = this.dataset;
    // update DB
    const data = await store.rankSlidesInformativeness($D.selectedNode.id, $D.user.key, sid, level); // $D.selectedNode.id;
    if (data&&data.result&&data.result.ok&&data.result.n) { // correct
      // sync ui

      const slidesRank = await store.findSlidesInformativeness($D.selectedNode.id, $D.user.key);
      // no relative informativeness data
      if (slidesRank&&Array.isArray(slidesRank)) {
        $D.slidesRank = slidesRank.length==0?null:slidesRank[0];
        syncSlideRankDropdown();
        if ($D.slidesRank&&!isCaseClosed()) {
          try {
            const rs = await store.setCollectionTaskStatusByCollectionId($D.user.key, $D.selectedNode.id, false);
            if (rs&&rs.ok) {
              const user = $D.selectedNode.original.users.find((u)=>u.user == $D.user.key);
              if (user) user.task_status = false;
              // reopen if case closed
              const colTree = $($UI.colTree).jstree();
              colTree.set_icon($D.selectedNode, './folder.png');
              const domNode = colTree.get_node($D.selectedNode, true);
              domNode.removeClass('text-success');
              $UI.message.add(`The Collection <span class='text-blue'>${fullPathName($D.selectedNode)}</span> Case Reopened!`);

              // enable level flag based on level value TODO
              toggleLevelFlag(true);
            } else {
              // db update error
              console.error(`setCollectionTaskStatusByCollectionId update failed`);
              $UI.message.addError(`Changing The Collection ${$D.selectedNode.original.name} Case Status Failed!`);
            }
          } catch (error) {
            // server error
            console.error(`setCollectionTaskStatusByCollectionId error`);
            $UI.message.addError(error);
          }
        }
      }
    } else { // can't get relative informativeness data
      console.error(`rankSlidesInformativeness update failed`);
      $UI.message.addError(`Update The Relative Informativeness Rank Failed`);
    }
  });
  return div;
}

function syncSlideRankDropdown() {
  $('.grid-view .inner-grid-view .grid-card').each(function(i) {
    const level = getRankLevel(this.id);
    $(this).find('li > a').removeClass('active');
    $(this).find('.dropdown-toggle').text(rankLevel[level]);
    $(this).find('.dropdown-toggle').addClass('btn-primary');
    $(this).find('.dropdown-toggle').removeClass('btn-danger');
    switch (level) {
      case 1:
        $(this).find('li[data-level=1] > a').addClass('active');
        break;
      case 2:
        $(this).find('li[data-level=2] > a').addClass('active');
        break;
      case 3:
        $(this).find('li[data-level=3] > a').addClass('active');
        break;
      case 4:
        $(this).find('li[data-level=less] > a').addClass('active');
        break;
      default:
        $(this).find('.dropdown-toggle').removeClass('btn-primary');
        $(this).find('.dropdown-toggle').addClass('btn-danger');
    }
  });
}

function getRankLevel(sid) {
  if (!$D.slidesRank) return 0;
  if ($D.slidesRank.first==sid) return 1;
  if ($D.slidesRank.second==sid) return 2;
  if ($D.slidesRank.third==sid) return 3;
  if ($D.slidesRank.less.includes(sid)) return 4; // less
  return 0;
}
function getInformativenessInfos(slide) {
  var informativenessScore = null;
  const informativenessIndicator = document.createElement('div');
  informativenessIndicator.classList.add('indicator');
  const icon = document.createElement('i');
  icon.classList.add('fas');

  if (slide.evaluation&&slide.evaluation.is_draft==false) {
    const evalData = slide.evaluation.evaluation;
    if (evalData.informativeness == '1') {
      icon.classList.add('fa-check');
      icon.classList.add('text-success');
      icon.title = 'Informative';
      // create score div
      informativenessScore = document.createElement('div');
      informativenessScore.classList.add('score');// badge bg-success
      informativenessScore.classList.add('badge');
      informativenessScore.classList.add('rounded-pill');
      informativenessScore.classList.add('bg-success');
      informativenessScore.textContent = `SCORE: ${evalData.absolute_informativeness}`;
    } else {
      icon.classList.add('fa-times');
      icon.classList.add('text-danger');
      icon.title = 'Uninformative';
    }
  } else if (slide.evaluation&&slide.evaluation.is_draft==true) {
    icon.classList.add('fa-pen');
    icon.classList.add('text-primary');
    icon.title = 'Pending';
  } else {
    icon.classList.add('fa-question');
    icon.classList.add('text-muted');
    icon.title = 'Not Evaluated';
  }
  informativenessIndicator.appendChild(icon);

  // levels
  const levels = document.createElement('div');
  levels.classList.add('level');// badge bg-success
  levels.classList.add('badge');
  // levels.classList.add('rounded-pill');
  levels.classList.add('bg-primary');
  levels.title = 'Level';
  const levelsLabel = document.createElement('label');
  levelsLabel.textContent = 'L';
  // levels.appendChild(levelsLabel);
  const levelsChk = document.createElement('input');
  levelsChk.type = 'checkbox';
  if (slide.evaluation&&slide.evaluation.level==true) levelsChk.checked = true;

  levelsChk.addEventListener('change', async (e)=> {
    saveEvaluation(slide, e.target.checked);
  });
  levels.appendChild(levelsLabel);
  levels.appendChild(levelsChk);

  return [informativenessIndicator, informativenessScore, levels];
}

async function saveEvaluation(slide, level) {
  const evalData = {
    'slide_id': slide._id.$oid,
    'level': level,
    'creator': $D.user.key,
  };
  var rs;
  if (slide.evaluation) { // update evaluation
    evalData.update_date = new Date();
    rs = await store.updateEvaluation( {'slide_id': slide._id.$oid, 'creator': $D.user.key}, evalData);
  } else { // add evaluation
    evalData.create_date = new Date();
    rs = await store.addEvaluation(evalData);
  }
  const newEvaluation = await store.findEvaluation({'slide_id': slide._id.$oid, 'creator': $D.user.key});
  if (Array.isArray(newEvaluation)&&newEvaluation.length>0) {
    slide.evaluation = newEvaluation[0];
  }
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
    'plugins': ['search', 'wholerow', 'changed'],
  });


  $UI.colTree.on('loaded.jstree', async () => {
    //
    if ($D.collectionData&&$D.collectionData.length) {
      const node = $D.collectionData.find((node)=>node.state&&node.state.selected);
      if (node) {
        selectNode(null, {node: $($UI.colTree).jstree().get_node(node.id)});
      }
      return;
    };
    // show up message
    $UI.colMessage.show();
  });

  // bind select node event
  $UI.colTree.on('select_node.jstree', selectNode);
}
// bind open and close nodes and record status
$UI.colTree.on('open_node.jstree', (event, _data) => {
  recordNodeState();
});
$UI.colTree.on('close_node.jstree', (event, _data) => {
  recordNodeState();
});
async function selectNode(event, _data) {
  const node = _data.node;
  if (event) recordNodeState();
  if (node&&$D.selectedNode!==node) {
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

    try {
      loadSlideInfo(node);
    } catch (error) {
      console.error(error);
    } finally {
      const loader = $UI.gridViewContainer.find('div.loader');
      loader.remove();
      if ($UI.gridViewContainer.children().length < 1) {

      }
    }


    // let slides checked if the slides in the collection
    // const collData = $D.collectionData.find((d)=>d.id==node.id);
    // deselected all slides

    // $DTable.clear();
    // $DTable.rows.add($slideData).search('').draw(true);
  }
}
function recordNodeState() {
  var data = $($UI.colTree).jstree(true).get_json('#', {flat: true});
  data = data.map((d) =>{
    const {id, state: {opened, selected}}= d;
    return {id, state: {opened, selected}};
  });
  sessionStorage.setItem('treeStates', JSON.stringify(data));
}


window.addEventListener('resize', resize);

window.addEventListener('load', async ()=> {
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
    if (user[0].userType=='Admin') {
      $('#import-item').show();
      $('#export-item').show();
      $('#collection-item').show();
    }
  }
  // get the collection data
  var data = await store.getAllCollection();

  if (Array.isArray(data)) {
    $D.collectionData = [];
    const cases = data.filter((d) => d.users&&d.users.some((u)=>u.user==$D.user.key));
    $D.collectionData = [...cases];
    // $D.collectionData = $D.collectionData.map((d)=>{
    //   if (d.users&&Array.isArray(d.uesrs)&&d.users.some((u)=>u.user==$D.user.key)) {
    //     const currentUserStatus = d.users.find((u)=>u.user==$D.user);
    //     d.task_status = currentUserStatus.task_status;
    //   }
    //   return d;
    // });
    cases.forEach((c) => getAllParents(c, data));

    $D.collectionData.forEach((d)=>{
      //d.id = d._id.$oid;
      // show case closed if ANYONE closed the case
      if (d.users&&d.users.some((u)=>(u.task_status))) {
        d.icon = './check-folder.png';
        d.li_attr = {'class': 'text-success'};
      } else {
        d.icon = './folder.png';
      }
      d.name = d.text;
      d.id = d['_id']['$oid'];
      delete d._id;
      // set tree state if treeStates exist
      var treeStates = sessionStorage.getItem('treeStates');
      if (treeStates) {
        treeStates = JSON.parse(treeStates);
        const nodeState = treeStates.find((node)=>node.id == d.id);
        if (nodeState) d.state = {opened: nodeState.state.opened, selected: nodeState.state.selected};
      } else {
        d.state = {opened: false, selected: false};
      }
      // return d;
    });
    $D.collectionTree = listToTree($D.collectionData);

    $D.collectionData.forEach((d)=>{
      // remove unauthorized node
      if (d.children && d.children.length == 0) d.text = `${d.text} [${d.slides?d.slides.length:0}]`;
    });
    // $D.collectionData = $D.collectionData.filter((d) => {
    //   return !(d.children && d.children.length==0&&d.users&&d.users.some((u)=>u.user==$D.user.key));
    // });
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
function toggleLevelFlag(enable = true) {
  document.querySelectorAll('.level').forEach((level)=>{
    level.style.display='';
    const chkbox = level.querySelector('input[type=checkbox]');
    chkbox.style.display = '';
    if (!enable) {
      chkbox.style.display = 'none';
      if (!chkbox.checked) level.style.display = 'none';
    }
  });
}
// function disableLevelFlag(){
// }

function getAllParents(node, data) {
  if (node&&node.pid) {
    const parent = data.find((d)=>d._id.$oid==node.pid);
    if (parent&&!$D.collectionData.some((d)=> d._id.$oid==parent._id.$oid)) {
      $D.collectionData.push(parent);
    }
    getAllParents(parent, data);
  }
}

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
  // const footerRect = calculateSize(footer);
  gridView.style.height = `${Math.ceil(innerHeight - y - pageCtrlRect.height - 50 )}px`;
  // gridView.style.height = `${Math.ceil(innerHeight - y - pageCtrlRect.height - footerRect.height )}px`;
}

function calculateSize(elt) {
  const {marginLeft, marginRight, marginTop, marginBottom} = getComputedStyle(elt);
  const width = Math.ceil(elt.offsetWidth) + parseInt(marginLeft) + parseInt(marginRight);
  const height = Math.ceil(elt.offsetHeight) + parseInt(marginTop) + parseInt(marginBottom);
  return {width, height, offsetWidth: Math.ceil(elt.offsetWidth), offsetHeight: Math.ceil(elt.offsetHeight)};
}

function fullPathName(node) {
  const parentNames = getParentNames(node);
  const crumbList = [...parentNames.reverse(), node.original.name];
  return crumbList.join('/');
}
function createBreadcrumb(node) {
  // clear the old crumb
  $UI.slideBreadcrumb.empty();
  if (!node) return;

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

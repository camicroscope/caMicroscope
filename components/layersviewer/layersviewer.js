// proposal:
// test:
// constructor
// setData
// callback
// style:
// expand/collapse if click on a node
// search bar is workeds

/**
 * CaMicroscope Layers Viewer. A component that shows all layers by the different categories.
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a Layer Manager.
 * @param {String} options.id
 *        Id of the element to append the Layer Manager's container element to.
 * @param {Object[]} options.data
 *        the data set of the layers.
 * @param {String} options.data.id
 *        layer's id
 * @param {String} options.data.name
 *        layer's name
 * @param {String} options.data.typeId
 *        layer's type id
 * @param {String} options.data.typeName
 *        layer's type name
 *
 */
function LayersViewer(options) {
  this.className = 'LayersViewer';
  this.setting = {
    // id: doc element
    // data: layers dataset
    // categoricalData
    isSortableView: false,
  };
  this.defaultType = ['human', 'ruler', 'segmentation', 'heatmap'];

  /**
   * @property {Object} _v_model
   *        View Model for the layers manager
   * @property {Object} _v_model.types
   *        data set group by types
   * @property {String} _v_model.types.name
   *        type name
   * @property {Array} _v_model.types.data[]
   *        what layers in this type of layers
   */

  this.viewRadios; // name:
  this.searchBar; // input and btn

  this.categoricalView;
  // this.sortableView;
  // this.sortable;

  // setting dataset
  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.className}: No Main Elements...`);
    return;
  }
  this.elt.classList.add('layer_viewer');

  // sort data
  // this.setting.data.sort(LayersViewer.compare);
  // give index
  // convert og data to categorical data
  this.setting.categoricalData = {
    heatmap: {
      item: {id: 'heatmap', name: 'heatmap'},
      items: [],
    },
    segmentation: {
      item: {id: 'segmentation', name: 'segmentation'},
      items: [],
    },
    ruler: {
      item: {id: 'ruler', name: 'ruler'},
      items: [],
    },
    human: {
      item: {id: 'human', name: 'human'},
      items: [],
    },
  };
  // this.__covertData();
  this.__initUI();
}

LayersViewer.prototype.toggleAllItems = function(
    isShow = false,
    fresh = true,
) {
  this.setting.data.forEach((d) => (d.isShow = isShow));
  if (fresh) this.update();
};

LayersViewer.prototype.addHumanItem = function(
    item,
    type,
    parent,
    isShow = true,
) {
  if (!this.defaultType.includes(type)) {
    console.warn('Error Type !!!');
    return;
  }

  var cate = this.setting.categoricalData[type].items[parent];
  if (!cate) {
    // no parent node
    const newCate = {};
    if (item.label) {
      newCate[item.label.id] = {
        item: {
          id: item.label.id,
          name: item.label.name,
        },
        items: [],
      };
      this.setting.categoricalData[type].items[parent] = newCate;
      this.addHumanItems(newCate);
      cate = this.setting.categoricalData[type].items[parent];
    } else {
      console.error('Layersviewer.addHumanItem has error');
    }
  }

  const data = {item, isShow};
  // add Data
  cate.items.push(data);

  // add item on UI
  data.elt = document.createElement('li');
  data.elt.dataset.id = data.item.id;
  data.elt.dataset.title = data.item.label ?
    `${data.item.name}${data.item.id}` :
    `${data.item.name}`;
  data.elt.innerHTML = `<div class="material-icons md-24 location" title="Location" style="display:${
    isShow ? '' : 'none'
  };">room</div>
  <label for="cate.${data.item.id}">
    <div>${
      data.item.label ? `${data.item.name}${data.item.id}` : `${data.item.name}`
}</div>
  </label>
  <div class="material-icons md-24 remove" title="Remove">clear</div>
  <input type="checkbox" data-id="${
  data.item.id
}" data-root="human" data-parent="${cate.item.id}" id="cate.${
  data.item.id
}" data-type="leaf" ${isShow ? 'checked' : ''}>`;

  // event: show/hidden layers for each annotation
  const chk = data.elt.querySelector('input[type=checkbox][data-type=leaf]');
  chk.addEventListener('change', this.__change.bind(this));
  //
  const removeDiv = data.elt.querySelector('div.material-icons.remove');
  removeDiv.addEventListener('click', () => {
    this.setting.removeCallback.call(this, data, cate.item.id);
  });
  const locationDiv = data.elt.querySelector('div.material-icons.location');
  locationDiv.addEventListener('click', () => {
    this.setting.locationCallback.call(this, data);
  });

  cate.children.insertBefore(data.elt, cate.children.firstChild);
  // update num
  cate.num.textContent = cate.items.length;
  cate.elt.style.display = 'flex';

  // total human anotation nums
  var humanNum = 0;
  const obj = this.setting.categoricalData[type].items;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      humanNum += obj[key].items.length;
    }
  }
  this.setting.categoricalData[type].num.textContent = humanNum;
};

LayersViewer.prototype.addItem = function(
    item,
    type,
    isShow = true,
    fresh = true,
) {
  if (!this.defaultType.includes(type)) {
    console.warn('Error Type !!!');
    return;
  }
  const cate = this.setting.categoricalData[type];
  const items = cate.items;
  const data = {item, isShow};
  // add Data
  items.push(data);

  // add item on UI
  data.elt = LayersViewer.createCategoricalItem.call(this, data);
  const chk = data.elt.querySelector('input[type=checkbox]');
  // add show/hidden event on check box
  chk.addEventListener('change', this.__change.bind(this)),
  // cate.children.appendChild(data.elt)
  cate.children.insertBefore(data.elt, cate.children.firstChild);

  // update num
  cate.num.textContent = cate.items.length;
};

LayersViewer.prototype.removeItemById = function(
    id,
    type,
    parent,
    fresh = true,
) {
  if (!this.defaultType.includes(type)) {
    console.warn('Error Type !!!');
    return;
  }

  const cate =
    type == 'human' ?
      this.setting.categoricalData[type].items[parent] :
      this.setting.categoricalData[type];
  const items = cate.items;
  const index = items.findIndex((d) => d.item.id == id);
  if (index == -1) return;
  const li = items[index].elt;
  // ui remove
  li.parentNode.removeChild(li);
  // data remove
  items.splice(index, 1);
  // change num
  cate.num.textContent = items.length;
  if (type == 'human') {
    if (cate.items.length == 0) cate.elt.style.display = 'none';
    var humanNum = 0;
    const obj = this.setting.categoricalData[type].items;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        humanNum += obj[key].items.length;
      }
    }
    this.setting.categoricalData[type].num.textContent = humanNum;
  }
};

LayersViewer.prototype.getDataItemById = function(id, type, parent) {
  if (!this.defaultType.includes(type)) {
    console.warn('Error Type !!!');
    return;
  }

  const cate =
    type == 'human' ?
      this.setting.categoricalData[type].items[parent] :
      this.setting.categoricalData[type];
  const items = cate.items;
  return items.find((d) => d.item.id == id);
};

LayersViewer.prototype.onEnd = function(e) {
  if (e.newIndex === e.oldIndex) return;
  const data = this.setting.data;

  // move data from old index position to new index position
  LayersViewer.moveArray(data, e.oldIndex, e.newIndex);
  // refresh UI
  const sort = data.map((item) => item.id);
  this.sortable.sort(sort);
  // callback functions
  if (this.setting.sortChange) this.setting.sortChange.call(null, sort);
};
LayersViewer.prototype.moveLayer = function(id, direction = 'up') {
  const data = this.setting.data;
  // find layer index
  const oldIndex = data.findIndex((item) => item.id === id);

  const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;

  if (newIndex < 0 || newIndex >= data.length) {
    console.warn('move: Out Of Index');
    return;
  }
  // move data from old index position to new index position
  LayersViewer.moveArray(data, oldIndex, newIndex);

  // refresh UI
  const sort = data.map((item) => item.id);
  this.sortable.sort(sort);
  // callback function
  if (this.setting.sortChange) this.setting.sortChange.call(null, sort);
};

// move
LayersViewer.moveArray = function(array, oldIndex, newIndex) {
  if (newIndex >= array.length) {
    let dist = newIndex - array.length + 1;
    while (dist--) {
      array.push(undefined);
    }
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array; // for testing
};

// for sorting
LayersViewer.compare = function(a, b) {
  if (a.index && b.index) return a.index > b.index;
  if (a.index) return 1;
  if (b.index) return 1;
  return a.name > b.name;
};

/**
 * [__clearUI description]
 * @return {[type]} [description]
 */
LayersViewer.prototype.__clearUI = function() {
  empty(this.elt);
  this.searchBar = null;
  this.viewRadios = null;
  this.categoricalView = null;
  this.sortableView = null;
  this.sortable = null;
};
/*
    refresh UI
*/
LayersViewer.prototype.__initUI = function() {
  empty(this.elt); // clear all elements
  this.__clearUI();

  /* create search bar area START */
  const ctrlObj = LayersViewer.createControlBar();
  // this.viewRadios = ctrlObj.viewRadios;  // view switch
  this.searchBar = ctrlObj.searchBar; // searchbar
  this.elt.appendChild(ctrlObj.view);

  /* create search bar area END */
  const checkDiv = document.createElement('div');
  checkDiv.classList.add('checklist');
  checkDiv.style.display = 'none';
  checkDiv.innerHTML = `<label><input type='checkbox' value='Point' checked/>  Point</label>
  <label><input type='checkbox' value='LineString' checked/>  Brush</label>
  <label><input type='checkbox' value='Polygon' checked/>  Polygon</label>`;
  this.elt.appendChild(checkDiv);
  this.searchList = checkDiv;
  [...this.searchList.querySelectorAll('input[type=checkbox]')].forEach((chk) =>
    chk.addEventListener('change', (e) => {
      this.__search(this.searchBar.text.value);
    }),
  );
  /* categorical view START*/
  // create categorical view div
  const cateViewDiv = document.createElement('div');
  cateViewDiv.classList.add('layers_list');

  // create categorical view content
  const objCategories = LayersViewer.createCategoricalView.call(
      this,
      this.setting.categoricalData,
  );
  cateViewDiv.appendChild(objCategories.view);

  this.elt.appendChild(cateViewDiv);
  this.categoricalView = cateViewDiv;
  /* categorical view END*/

  /* sortable view START */
  // create sortable view div
  // let sort_view_div = document.createElement('div');
  // sort_view_div.classList.add('sort_list');
  // sort_view_div.style.display = 'none';

  // create sortable view content
  // const objSortable = LayersViewer.createSortableView(this.setting.data);
  // this.sortable = objSortable.sortable;
  // this.sortable.option('onEnd', this.onEnd.bind(this))

  // add the content into the div
  // sort_view_div.appendChild(objSortable.view);
  // this.elt.appendChild(sort_view_div);
  // this.sortableView = sort_view_div;
  /* sortable view END */

  // add search event
  this.searchBar.btn.addEventListener('click', this.__search.bind(this));
  //
  this.searchBar.text.addEventListener('change', this.__search.bind(this));
  this.searchBar.text.addEventListener('keyup', this.__search.bind(this));

  // add event for all checkbox
  const checkboxes = this.elt.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach((chk) =>
    chk.addEventListener('change', this.__change.bind(this)),
  );
  // expand and collapse control for categorical view
  const cateItems = this.setting.categoricalData;
  for (const key in cateItems) {
    if (cateItems.hasOwnProperty(key)) {
      cateItems[key].elt.firstChild.addEventListener(
          'click',
          this.__switch.bind(this),
      );
    }
  }

  // moveup
  // const ups = this.sortableView.querySelectorAll('.moveup');
  // ups.forEach( up => up.addEventListener('click',function(e){
  //    const _id = e.target.parentNode.dataset.id;
  //    this.moveLayer(_id,'up');
  // }.bind(this)));

  // movedown
  // const downs = this.sortableView.querySelectorAll('.movedown');
  // downs.forEach( downs => downs.addEventListener('click',function(e){
  //    const _id = e.target.parentNode.dataset.id;
  //    this.moveLayer(_id,'down');
  // }.bind(this)));

  // initialize checkbox
  // if(this.setting.isSortableView){
  //    this.viewModeSwitch('sort');
  // }else{
  //    this.viewModeSwitch('category');
  // }
};

// click on view radio btn which changes the view mode
LayersViewer.prototype.__radioClick = function() {
  const mode = this.elt.querySelector(
      `input[type=radio][name=${this.viewRadios.name}]:checked`,
  ).value;
  this.viewModeSwitch(mode);
  if (mode === 'sort') {
    this.setting.isSortableView = true;
  } else {
    this.setting.isSortableView = false;
  }
};

// switch layers view mode - sortable or categorical
LayersViewer.prototype.viewModeSwitch = function(
    mode = 'category', /* category/sort */
) {
  // display two views
  this.sortableView.style.display = 'none';
  this.categoricalView.style.display = 'none';

  switch (mode) {
    case 'category':
      // open category view and checked cate radio btn
      this.viewRadios.list[0].elt.checked = true;
      this.categoricalView.style.display = 'block';
      break;
    case 'sort':
      // open sortable view and checked sort radio btn
      this.viewRadios.list[1].elt.checked = true;
      this.sortableView.style.display = 'block';
      break;
    default:
      // statements_def
      break;
  }
};

/* For Categorical View functions START */
LayersViewer.createCategoricalView = function(data) {
  const ul = document.createElement('ul');
  for (const typeId in data) {
    if (data.hasOwnProperty(typeId)) {
      // create root li
      const typeData = data[typeId]; // typeData = {id:typeId,name:typeName,items:[{item:,isShow:}]}
      typeData.elt = LayersViewer.createCategoricalItem.call(
          this,
          typeData,
          'root',
      );
      typeData.num = typeData.elt.querySelector('div.num');
      ul.appendChild(typeData.elt); // create li root

      const children = document.createElement('ul');
      children.style.display = 'none';
      // add leaf
      // typeData.items.forEach(
      //     function(item) {
      //       item.elt = LayersViewer.createCategoricalItem.call(this, item);
      //       children.appendChild(item.elt); // create li leaf
      //     }.bind(this),
      // );
      //
      ul.appendChild(children);
      typeData.children = children;
    }
  }
  return {view: ul};
};

LayersViewer.prototype.addHumanItems = function(data) {
  const human = this.setting.categoricalData['human'];
  // human.items = data;

  const ul = document.createElement('ul');
  var num = 0;
  for (const [id, cate] of Object.entries(data)) {
    human.items[id] = cate;
    const name = cate.item.name;
    const li = document.createElement('li');
    li.dataset.id = id;
    li.style.display = cate.items.length ? null : 'none';
    num += cate.items.length;
    // create
    li.innerHTML = `<div class="material-icons">keyboard_arrow_right</div>
      <label for="cate.${id}" style="font-weight: bold;">
        <div>${titleCase(name)}</div>
        <div class="num">${cate.items.length}</div>
      </label>
      <input type="checkbox" data-id="${id}" data-name="${name}" data-root="human" data-type="root">`;

    const allChk = li.querySelector('input[type=checkbox][data-type=root]');
    allChk.addEventListener('change', this.__change.bind(this));
    const children = document.createElement('ul');
    children.style.display = 'none';

    cate.items.forEach((data) => {
      data.elt = document.createElement('li');
      data.elt.dataset.id = data.item.id;
      data.elt.dataset.title = data.item.label ?
        `${data.item.name}${data.item.id}` :
        `${data.item.name}`;
      data.elt.innerHTML = `<div class="material-icons md-24 location" title="Location" style="display: none;">room</div>
        <label for="cate.${data.item.id}">
          <div>${
            data.item.label ?
              `${data.item.name}${data.item.id}` :
              `${data.item.name}`
}</div>
        </label>
        <div class="material-icons md-24 remove" title="Remove">clear</div>
        <input type="checkbox" data-id="${
  data.item.id
}" data-root="human" data-parent="${cate.item.id}" id="cate.${
  data.item.id
}" data-type="leaf">`;
      children.appendChild(data.elt);

      // event: show/hidden layers for each annotation
      const chk = data.elt.querySelector(
          'input[type=checkbox][data-type=leaf]',
      );
      chk.addEventListener('change', this.__change.bind(this));
      //
      const removeDiv = data.elt.querySelector('div.material-icons.remove');
      removeDiv.addEventListener('click', () => {
        this.setting.removeCallback.call(this, data, cate.item.id);
      });
      const locationDiv = data.elt.querySelector('div.material-icons.location');
      locationDiv.addEventListener('click', () => {
        this.setting.locationCallback.call(this, data);
      });
    });

    cate.elt = li;
    cate.num = li.querySelector('div.num');
    cate.children = children;
    human.children.appendChild(li);
    human.children.appendChild(cate.children);

    // event for cate

    // add change on reaf checkbox
    // expand/collapse
    cate.elt.firstChild.addEventListener('click', this.__switch.bind(this));
    //
  }

  // show up arrow icon
  const arrowIcon = human.elt.querySelector('div.material-icons');
  arrowIcon.style.display = null;
  // remove loading icon
  const loadingIcon = human.elt.querySelector('div.loading-icon');
  // const chk = human.elt.querySelector("input[type=checkbox]");
  // chk.style.display = "";
  human.num.textContent = num;
  if (loadingIcon) loadingIcon.parentNode.removeChild(loadingIcon);
};

LayersViewer.prototype.addItems = function(data, type) {
  const typeData = this.setting.categoricalData[type];

  // show up arrow icon
  const arrowIcon = typeData.elt.querySelector('div.material-icons');
  arrowIcon.style.display = null;
  // remove loading icon
  const loadingIcon = typeData.elt.querySelector('div.loading-icon');
  if (loadingIcon) loadingIcon.parentNode.removeChild(loadingIcon);

  if (type == 'human' || type == 'ruler') {
    this.toggleSearchPanel();
    const chk = typeData.elt.querySelector('input[type=checkbox]');
    chk.style.display = '';
  }

  // create ui item
  data.forEach((item) => {
    item.elt = LayersViewer.createCategoricalItem.call(this, item);
    const chk = item.elt.querySelector('input[type=checkbox]');
    // add show/hidden event on check box
    chk.addEventListener('change', this.__change.bind(this)),
    typeData.children.appendChild(item.elt);
  });

  typeData.items = [...typeData.items, ...data];
  typeData.num.textContent = typeData.items.length;
};

LayersViewer.createCategoricalItem = function(data, type) {
  const item = data.item;
  const id = `cate.${item.id}`;
  // create li
  const li = document.createElement('li');
  li.dataset.id = item.id;
  // data?

  // label
  const label = document.createElement('label');
  label.htmlFor = id;

  // div
  const text = document.createElement('div');
  text.textContent = type == 'root' ? titleCase(item.name) : item.name;

  label.appendChild(text);

  // checkbox
  const chk = document.createElement('input');
  chk.type = 'checkbox';

  chk.dataset.id = item.id;

  if (type === 'root') {
    const ic = document.createElement('div');
    ic.classList.add('material-icons');
    ic.textContent = 'keyboard_arrow_right';
    ic.style.display = 'none';
    label.style.fontWeight = 'bold';
    chk.dataset.type = 'root';
    chk.style.display = 'none';
    li.appendChild(ic);
    const loadingIcon = document.createElement('div');
    loadingIcon.classList.add('loading-icon');
    label.prepend(loadingIcon);
    const num = document.createElement('div');
    num.classList.add('num');
    label.append(num);
  } else {
    chk.id = id;
    chk.dataset.cate = item.typeId;
    chk.dataset.type = 'leaf';
    chk.checked = data.isShow;
    li.title = item.name;
  }

  if (item.typeName && (item.typeName == 'human' || item.typeName == 'ruler')) {
    // remove and relocation
    const removeDiv = document.createElement('div');
    removeDiv.classList.add('material-icons');
    removeDiv.classList.add('md-24');
    removeDiv.textContent = 'clear';
    removeDiv.title = 'Remove';
    const locationDiv = document.createElement('div');
    locationDiv.style.display = data.isShow ? 'block' : 'none';
    // bind event location_searching
    locationDiv.classList.add('material-icons');
    locationDiv.classList.add('md-24');
    locationDiv.classList.add('location');
    locationDiv.textContent = 'room';
    locationDiv.title = 'Location';

    //
    removeDiv.addEventListener('click', () => {
      this.setting.removeCallback.call(this, data);
    });
    locationDiv.addEventListener('click', () => {
      this.setting.locationCallback.call(this, data);
    });

    //
    li.appendChild(locationDiv);
    li.appendChild(label);
    li.appendChild(removeDiv);
  } else {
    li.appendChild(label);
  }

  // chk.dataset.name = item.name;

  li.appendChild(chk);
  return li;
};
/* For Categorical View functions END */

/* For Sortable View functions START */
LayersViewer.createSortableView = function(list) {
  const sortableList = document.createElement('ul');
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const elt = LayersViewer.createSortableItem(item);
    item.sortItem = elt;
    sortableList.appendChild(elt);
  }

  // sortable options
  const options = {
    group: 'share',
    animation: 100,
    dataIdAttr: 'data-id',
  };

  //
  const sortable = Sortable.create(sortableList, options);
  return {sortable: sortable, view: sortableList};
};

// create sortable item for sortable view
LayersViewer.createSortableItem = function(item) {
  const id = `sort.${item.id}`;

  // create li
  const li = document.createElement('li');
  li.dataset.id = item.id;
  // data?

  // label
  const label = document.createElement('label');
  label.htmlFor = id;

  // div
  const text = document.createElement('div');
  text.textContent = item.name;
  label.appendChild(text);

  // div moveup
  const upIcon = document.createElement('div');
  upIcon.classList.add('material-icons');
  upIcon.classList.add('moveup');
  upIcon.textContent = 'arrow_drop_up';

  // div movedown
  const downIcon = document.createElement('div');
  downIcon.classList.add('material-icons');
  downIcon.classList.add('movedown');
  downIcon.textContent = 'arrow_drop_down';

  // checkbox
  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.id = id;
  chk.checked = item.isShow;
  chk.dataset.id = item.id;
  chk.dataset.type = 'leaf';
  li.appendChild(label);
  li.appendChild(upIcon);
  li.appendChild(downIcon);
  li.appendChild(chk);
  return li;
};
/* For Sortable View functions END */
LayersViewer.prototype.toggleSearchPanel = function(isShow = true) {
  if (isShow) {
    this.searchBar.elt.style.display = null;
    this.searchList.style.display = null;
  } else {
    this.searchBar.elt.style.display = 'none';
    this.searchList.style.display = 'none';
  }
};
/* For control area functions START */
LayersViewer.createControlBar = function() {
  const view = document.createElement('div');
  view.style.display = 'none';
  view.classList.add('searchbar');

  // create view radios name
  const _name = randomId();

  /* create cate btn START */
  const cateId = randomId();
  const cateBtn = document.createElement('div');
  cateBtn.style.display = 'none';
  // cate radio
  const cateRadio = document.createElement('input');
  cateRadio.id = cateId;
  cateRadio.type = 'radio';
  cateRadio.name = _name;
  cateRadio.value = 'category';

  // cate label
  const cateLabel = document.createElement('label');
  cateLabel.htmlFor = cateId;
  cateLabel.classList.add('material-icons');
  cateLabel.textContent = 'category';

  cateBtn.appendChild(cateRadio);
  cateBtn.appendChild(cateLabel);

  // add into view
  view.appendChild(cateBtn);
  /* create cate btn END */

  /* create cate btn START */
  const sortId = randomId();
  const sortBtn = document.createElement('div');
  sortBtn.style.display = 'none';
  const sortRadio = document.createElement('input');
  sortRadio.id = sortId;
  sortRadio.type = 'radio';
  sortRadio.name = _name;
  sortRadio.value = 'sort';

  const sortLabel = document.createElement('label');
  sortLabel.htmlFor = sortId;
  sortLabel.classList.add('material-icons');
  sortLabel.textContent = 'sort';

  sortBtn.appendChild(sortRadio);
  sortBtn.appendChild(sortLabel);

  // add into view
  view.appendChild(sortBtn);
  /* create sort btn END */

  /* create search bar START */
  // text input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search By Name/Creator';

  // search btn
  const searchBtn = document.createElement('div');
  searchBtn.classList.add('material-icons');
  searchBtn.textContent = 'find_in_page';

  // add input and btn into ciew
  view.appendChild(searchInput);
  view.appendChild(searchBtn);
  /* create search bar END */

  /* create check all START */
  const chkAll = document.createElement('input');
  chkAll.style.display = 'none';
  chkAll.type = 'checkbox';
  chkAll.id = 'all';
  chkAll.dataset.type = 'all';
  view.appendChild(chkAll);
  /* create check all END */

  // return obj for switch layer views
  const viewRadios = {};
  viewRadios.name = _name;
  viewRadios.list = [
    {
      id: cateId,
      elt: cateRadio, // categorical view radio btn
    },
    {
      id: sortId,
      elt: sortRadio, // sortable view radio btn
    },
  ];

  // return obj for search bar
  const searchBar = {};
  searchBar.elt = view;
  searchBar.text = searchInput;
  searchBar.btn = searchBtn;

  // return obj for check all

  return {
    view: view,
    viewRadios: viewRadios, // view switch
    searchBar: searchBar, // searchbar
    checkAll: chkAll, // check all
  };
};

/* For control area functions END */
/**
 * Set data model and automatically refresh UI.
 * @param {Object[]} data
 *        the data set of the layers.
 * @param {String} data.id
 *        layer's id
 * @param {String} data.name
 *        layer's name
 * @param {String} data.typeId
 *        layer's type id
 * @param {String} data.typeName
 *        layer's type name
 *
 */
LayersViewer.prototype.setData = function(data) {
  this.setting.data = data;
  this.update();
};
/**
 * @private
 * update the UI according to the data model
 */
LayersViewer.prototype.update = function() {
  // this.setting.data = data;
  // this.__covertData();
  this.__refreshUI();
};

/**
 * @private
 * search event
 * @param  {[type]} e [description]
 */
LayersViewer.prototype.__search = function(e) {
  // show all li with leaf class
  const human = [];
  for (const [key, data] of Object.entries(
      this.setting.categoricalData['human'].items,
  )) {
    human.push(...data.items);
  }

  const ruler = this.setting.categoricalData['ruler'].items;
  const heatmap = this.setting.categoricalData['heatmap'].items;
  const segmentation = this.setting.categoricalData['segmentation'].items;
  const list = [...human, ...ruler, ...heatmap, ...segmentation];

  list.forEach((data) => {
    data.elt.style.display = 'flex';
  });

  const pattern = this.searchBar.text.value;

  const regex = new RegExp(pattern, 'gi');
  const checkedType = [
    ...this.searchList.querySelectorAll('input:checked'),
  ].map((elt) => elt.value);
  list
      .filter((d) => d.item.typeName == 'human' || d.item.typeName == 'ruler')
      .forEach((data) => {
        if (
          !data.item.name.match(regex) &&
        !(data.item.creator && data.item.creator.match(regex))
        ) {
          data.elt.style.display = 'none';
        }
        if (
          data.item.typeName == 'human' &&
        !checkedType.includes(data.item.shape)
        ) {
          data.elt.style.display = 'none';
        }
      });
};

/*
    convert og/raw data to categorical model/data
*/
// LayersViewer.prototype.__covertData = function() {
//   if (!this.setting.data) {
//     console.warn(`${this.className}: No Raw Data`);
//     // return;
//   }
//   this.setting.categoricalData = this.setting.data.reduce(function(model, d) {
//     const item = d.item;
//     if (!model[item.typeId]) {
//       model[item.typeId] = {
//         item: {id: item.typeId, name: item.typeName},
//         items: [],
//       };
//     }
//     model[item.typeId].items.push(d);
//     return model;
//   }, {});
// };

// expand or collapse layer list
LayersViewer.prototype.__switch = function(e) {
  const nextElt = e.target.parentNode.nextElementSibling;
  if (nextElt.style.display == 'none') {
    nextElt.style.display = null;
    e.target.innerHTML = 'keyboard_arrow_down';
  } else {
    nextElt.style.display = 'none';
    e.target.innerHTML = 'keyboard_arrow_right';
  }
};

//
LayersViewer.prototype.__change = function(e) {
  // confirm TODO
  const dataset = e.target.dataset;
  const id = dataset.id;
  const type = dataset.type;
  const name = dataset.name;
  const checked = e.target.checked;

  switch (type) {
    case 'root':
      var items;
      var root;
      if (dataset.root == 'human') {
        root = dataset.root;
        items = this.setting.categoricalData['human'].items[dataset.id].items;
      } else {
        root = id;
        items = this.setting.categoricalData[id].items;
      }

      items.forEach((d) => {
        if (d.elt.style.display == 'none') return;
        d.isShow = checked;
        d.elt.lastChild.checked = checked;
        if (checked) {
          d.elt.firstChild.style.display = '';
        } else {
          d.elt.firstChild.style.display = 'none';
        }
      });
      this.setting.rootCallback.call(null, {
        root,
        parent: id,
        parentName: name,
        items,
      });
      break;
    case 'leaf':
      var data;
      if (dataset.parent && dataset.root == 'human') {
        // human annotation
        data = this.setting.categoricalData['human'].items[
            dataset.parent
        ].items.find((d) => d.item.id == id);
      } else {
        const cate = dataset.cate;
        data = this.setting.categoricalData[cate].items.find(
            (d) => d.item.id == id,
        );
      }
      if (!data) return;
      data.isShow = checked;
      data.elt.lastChild.checked = checked;

      const location = e.target.parentElement.querySelector('div.location');
      if (location && checked) {
        location.style.display = 'block';
      } else if (location && !checked) {
        location.style.display = 'none';
      }

      this.setting.callback.call(null, [data]);
      break;
    default:
  }
};

// TODO
LayersViewer.prototype.add = function() {};
// TODO
LayersViewer.prototype.remove = function() {};

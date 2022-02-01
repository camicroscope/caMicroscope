// labelannotationspanel.js
function LabelAnnotationsPanel(options) {
  this.name = 'LabelAnnotationsPanel';


  this.setting = {
    data: null, // array
    onDBClick: null,
    onDelete: null,
  };

  extend(this.setting, options);

  // attach container element
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt && this.setting.element) {
    this.elt = this.setting.element;
  }

  if (!this.elt) {
    // create main
    this.elt = document.createElement('div');
  }

  // create UI
  this.__refresh();
}
/**
 * @private
 * __refresh refresh UI part accoding to this.setting
 */
LabelAnnotationsPanel.prototype.__refresh = function() {
  empty(this.elt);
  this.elt.classList.add('lal-container');
  const reducer = (acc, item) => {
    const type = item.properties.type;
    // const color = item.geometries.features[0].properties.style.color;
    // const id = item._id;
    if (!acc[type])acc[type] = [];
    acc[type].push(item);
    return acc;
  };
  this.__list = this.setting.data.reduce(reducer, {});
  Object.keys(this.__list).forEach((type) => {
    const title = createTypeTitle(type);
    this.elt.appendChild(title);
    // add toggle event
    title.querySelector('.icon').addEventListener('click', function(e) {
      const list = title.nextElementSibling;
      if (title.querySelector('.icon').textContent=='keyboard_arrow_up') {
        title.querySelector('.icon').textContent = 'keyboard_arrow_down';
        list.style.display = 'none';
      } else {
        title.querySelector('.icon').textContent = 'keyboard_arrow_up';
        list.style.display = '';
      }
    });

    //
    const listDiv = document.createElement('div');
    listDiv.classList.add('list');
    this.elt.appendChild(listDiv);
    this.__list[type].forEach((item, idx) => {
      const id = item._id;
      const color = item.geometries.features[0].properties.style.color;
      const itemDiv = createItem(id, idx, color);
      listDiv.appendChild(itemDiv);

      itemDiv.addEventListener('dblclick', function(e) {
        if (isFunction(this.setting.onDBClick)) {
          this.setting.onDBClick.call(itemDiv, {
            id: id,
            index: idx,
            item: item,
          });
        }
      }.bind(this));

      itemDiv.querySelector('.icon').addEventListener('click', function(e) {
        if (isFunction(this.setting.onDelete)) {
          this.setting.onDelete.call(itemDiv, {
            id: id,
            index: idx,
            item: item,
          });
        }
      }.bind(this));
    });
  });
};

function createTypeTitle(type) {
  const div = document.createElement('div');
  div.classList.add('title');
  const typeTitleTemplate = `<div class='material-icons md-18 icon'>keyboard_arrow_up</div><label><div>${type}</div></label>`;
  div.innerHTML = typeTitleTemplate;
  return div;
}

function createItem(id, idx, color) {
  const div = document.createElement('div');
  div.innerHTML = `<div class='color-block' style='background:${color}' data-id='${id}'></div><label><div>${idx}</div></label><div class='material-icons md-18 icon margin-left-1'>clear</div>`;
  return div;
}
LabelAnnotationsPanel.prototype.__dbclick = function() {

};

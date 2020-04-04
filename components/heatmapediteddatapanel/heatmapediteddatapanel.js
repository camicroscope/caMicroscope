// heatmapediteddatapanel.js
function HeatmapEditedDataPanel(options) {
  this.name = 'HeatmapEditedDataPanel';
  /*
        list:[
            {
                id: ,
                title: ,
                icon: ,
                content:string
                isExpand:,

            }
        ]
    */
  this.setting = {
    data: null,
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
 * __refresh refresh UI part according to this.setting
 */
HeatmapEditedDataPanel.prototype.__refresh = function() {
  empty(this.elt);
  this.elt.classList.add('hmed-container');
  this._clusters = [];
  this.setting.data.clusters.forEach((cluster) => {
    const name = cluster.name;
    const index = cluster.index;
    const value = +cluster.value;
    const color = cluster.color;
    const cateValue = value?'Positive':'Negative';
    const title = createEditedDataTitle(name, cateValue);
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


    const listDiv = document.createElement('div');
    listDiv.classList.add('list');
    this.elt.appendChild(listDiv);
    cluster.editDataArray.forEach((line, idx) => {
      const lineDiv = createEditedDataItem(idx, color);
      listDiv.appendChild(lineDiv);

      lineDiv.addEventListener('dblclick', function(e) {
        if (isFunction(this.setting.onDBClick)) {
          this.setting.onDBClick.call(lineDiv, {
            cluster: cluster,
            index: idx,
          });
        }
      }.bind(this));

      lineDiv.querySelector('.icon').addEventListener('click', function(e) {
        if (isFunction(this.setting.onDelete)) {
          this.setting.onDelete.call(lineDiv, {
            cluster: cluster,
            index: idx,
          });
        }
      }.bind(this));
    });
  });
};
function createEditedDataTitle(name, cate) {
  const div = document.createElement('div');
  div.classList.add('title');
  const clusterTemplate = `<div class='material-icons md-18 icon'>keyboard_arrow_up</div><label><div>${name} - ${cate}</div></label>`;
  div.innerHTML = clusterTemplate;
  return div;
}
function createEditedDataItem(idx, color) {
  const div = document.createElement('div');
  div.innerHTML = `<div class='color-block' style='background:${color}'></div><label><div>${idx}</div></label><div class='material-icons md-18 icon margin-left-1'>clear</div>`;
  return div;
}


HeatmapEditedDataPanel.prototype.__dbclick = function() {

};

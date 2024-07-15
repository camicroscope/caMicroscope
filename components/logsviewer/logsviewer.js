/**
 * CaMicroscope Logs Viewer. A component that shows logs of annotation by timeline.
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
function LogsViewer(options) {
  this.className = 'LogsViewer';
  this.setting = {
    // id: doc element
    // data: layers dataset
    // categoricalData
    isSortableView: false,
  };
  this.defaultType = ['human'];
  // this.defaultType = ['human', 'ruler', 'segmentation', 'heatmap'];
  // setting dataset
  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.className}: No Main Elements...`);
    return;
  }
  this.elt.classList.add('logs_viewer');

  this.setting.categoricalData = {
    // heatmap: {
    //   item: {id: 'heatmap', name: 'heatmap'},
    //   items: [],
    // },
    // segmentation: {
    //   item: {id: 'segmentation', name: 'segmentation'},
    //   items: [],
    // },
    // ruler: {
    //   item: {id: 'ruler', name: 'ruler'},
    //   items: [],
    // },
    human: {
      item: {id: 'human', name: 'human'},
      items: [],
    },
  };

  empty(this.elt);
  const usuDiv = document.createElement('div');
  usuDiv.classList.add('usulist');
  usuDiv.style.display = 'block';
  usuDiv.innerHTML = `<canvas height="300px" id="myChart"></canvas>`;
  this.elt.appendChild(usuDiv);
}

LogsViewer.prototype.addHumanItem = function(
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

LogsViewer.prototype.addHumanItems = function(data) {
  console.log(data);
};

LogsViewer.prototype.visualization = function(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  // データの定義
  var data = {
    datasets: [{
      label: 'Human:Draw Annotation ',
      data: aa.map((item) => ({x: item[0], y: item[1]})),
      backgroundColor: 'rgba(75, 192, 192, 1)',
      pointRadius: 5,
    }],
  };

  // データセットの最大値を取得し、最大値に1を加算する
  var maxYValue = Math.max(...data.datasets[0].data.map((d)=> d.y)) + 1;

  // オプションの設定
  var options = {
    plugins: {
      title: {
        display: true,
        text: 'Draw Annotation Count vs zooming', // 図のタイトル
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            var xValue = context.raw.x;
            var yValue = context.raw.y;
            return '(count, zooming) = (' + yValue + ', ' + xValue + ')';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Zooming',
        },
      },
      y: {
        beginAtZero: true, // 縦軸が0から始まるように設定
        title: {
          display: true,
          text: 'Draw Annotation Count',
        },
        ticks: {
          stepSize: 1, // 縦軸に表示するステップサイズを1に設定
          callback: function(value) {
            if (value % 1 === 0) {
              return value; // 整数値のみを表示
            }
          },
        },
        max: maxYValue, // 縦軸の最大値を設定
      },
    },
  };

  // 散布図の作成
  new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options,
  });
};


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
function VisualizationViewer(options) {
  this.className = 'VisualizationViewer';
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
  const chartDiv = document.createElement('div');
  chartDiv.classList.add('chartlist');
  chartDiv.style.display = 'block';
  chartDiv.innerHTML = `<canvas height="300px" id="myChart"></canvas>`;
  this.elt.appendChild(chartDiv);
}


VisualizationViewer.prototype.visualization = function(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  // define data
  var data = {
    datasets: [{
      label: 'Human:Draw Annotation ',
      data: aa.map((item) => ({x: item[0], y: item[1]})),
      backgroundColor: 'rgba(75, 192, 192, 1)',
      pointRadius: 5,
    }],
  };

  // Get the maximum value of the data set and add 1 to the maximum value
  var maxYValue = Math.max(...data.datasets[0].data.map((d)=> d.y)) + 1;

  // setting option
  var options = {
    plugins: {
      title: {
        display: true,
        text: 'Draw Annotation Count vs zooming',
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
        beginAtZero: true, //  Set vertical axis to start from 0
        title: {
          display: true,
          text: 'Draw Annotation Count',
        },
        ticks: {
          stepSize: 1, // Set the step size displayed on the vertical axis to 1
          callback: function(value) {
            if (value % 1 === 0) {
              return value;
            }
          },
        },
        max: maxYValue,
      },
    },
  };

  // Create
  new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options,
  });
};


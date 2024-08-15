function renderChart(chartId, data) {
  const ctx = document.getElementById(chartId).getContext('2d');
  new Chart(ctx, {
    type: 'bar', // グラフの種類を指定 (例: bar, line, etc.)
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], // 横軸のラベル
      datasets: [{
        label: 'Sample Data',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month', // 横軸のタイトル
          },
        },
        y: {
          title: {
            display: true,
            text: 'Value', // 縦軸のタイトル
          },
          beginAtZero: true, // Y軸の最小値を0に設定
        },
      },
    },
  });
}

function VisualizationViewer(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  console.log('id, result', id, result)
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
        display: false,
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

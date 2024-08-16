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

// Graph
function createAnnotationZoomChart(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  // console.log('id, result', id, result);
  // define data
  var data = {
    datasets: [{
      label: 'Human:Draw Annotation ',
      data: aa.map((item) => ({x: item[0], y: item[1]})),
      backgroundColor: 'rgba(23, 162, 184, 1)',
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

function createPresetLabelsChart(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  // console.log('id, result', id, result);
  // データ定義
  var data = {
    labels: aa.map((item) => item[0]),
    datasets: [{
      label: 'Preset Labels Counts',
      data: aa.map((item) => item[1]),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // データセットの最大値に1を加えたものを取得
  var maxYValue = Math.max(...data.datasets[0].data) + 1;

  // オプション設定
  var options = {
    plugins: {
      title: {
        display: false,
        text: 'Preset Labels vs Preset Labels count',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            var label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: 'Preset labels',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Preset labels count',
        },
        ticks: {
          stepSize: 1,
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

  // グラフの作成
  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options,
  });
}

// Preset Labels annotations
function prepareUsersOfAnnotationsData(getVisualizationData) {
  // console.log('creator', getVisualizationData.annotations[1].creator);
  let initialData = [];
  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('getVisualizationData.annotations', d.properties.annotations.notes);
    if (d.creator.length !== 0) {
      initialData.push(d.creator);
      // console.log('name', d.creator);
    };
  });
  // console.log('initialData ', initialData );
  let result = countOccurrencesFromString(initialData);
  // console.log('result ', result);
  return result;
}

function usersOfAnnotationsChart(id, data) {
  // 円グラフを描画するキャンバスを取得
  const ctx = document.getElementById(id);

  // データのラベルと値を分ける
  const labels = data.map((item) => item[0]);
  const values = data.map((item) => item[1]);

  // 円グラフの色を定義
  const backgroundColors = [
    'rgba(23, 162, 184, 0.95)',
    'rgba(23, 142, 184, 0.95)',
    'rgba(23, 123, 184, 0.95)',
    'rgba(23, 104, 184, 0.95)',
    'rgba(23, 181, 184, 0.95)',
    'rgba(23, 184, 167, 0.95)',
    'rgba(23, 184, 148, 0.95)',
  ];
  const borderColors = [
    'rgba(23, 162, 184, 1)', // rgba(23, 162, 184)
    'rgba(23, 142, 184, 1)', // rgba(23, 142, 184)
    'rgba(23, 123, 184, 1)', // rgba(23, 123, 184)
    'rgba(23, 104, 184, 1)', // rgba(23, 104, 184)
    'rgba(23, 181, 184, 1)', // rgba(23, 181, 184)
    'rgba(23, 184, 167, 1)', // rgba(23, 184, 167)
    'rgba(23, 184, 148, 1)', // rgba(23, 184, 148)
  ];

  // 円グラフのデータセット
  const chartData = {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: backgroundColors.slice(0, values.length),
      borderColor: borderColors.slice(0, values.length),
      borderWidth: 1,
    }],
  };

  // 円グラフのオプション
  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.chart._metasets[context.datasetIndex].total;
            const percentage = ((value / total) * 100).toFixed(2) + '%';
            return 'user:' + label + ': ' + value + '(' + percentage + ')';
          },
        },
      },
    },
  };

  // 円グラフを描画
  new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: options,
  });
}

// cardContainer.js
(function() {
  const cardContainer = `
      <div class="card-container">
          <div class="card" id="card-original">
              <h3>Synopsis</h3>
              <div id="synopsis"></div>
          </div>
          <div class="card" id="card1">
              <button class="expand-btn" onclick="openModal('card1', [12, 19, 3, 5, 2])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Draw Annotation Count</h3>
              <canvas id="chart1"></canvas>
          </div>
          <div class="card" id="card2">
              <button class="expand-btn" onclick="openModal('card2', [5, 10, 15, 20, 25])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Preset Labels vs Preset Labels count</h3>
              <canvas id="chart2"></canvas>
          </div>
          <div class="card" id="card3">
              <button class="expand-btn" onclick="openModal('card3', [3, 7, 11, 15, 19])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Users of Annotations</h3>
              <canvas id="chart3"></canvas>
          </div>
      </div>
  `;
  document.body.insertAdjacentHTML('beforeend', cardContainer);

  // Synopsis
  var json = {
    id: getVisualizationData.id,
    name: getVisualizationData.name,
    annotations: getVisualizationData.annotations.length,
    heatmaps: getVisualizationData.heatmap.length,
  };
  // console.log('getVisualizationData2', json);

  const synopsisDiv = document.getElementById('synopsis');
  // <p>追加された段落${getVisualizationData.name}</p>`
  synopsisDiv.innerHTML += `
  <table>
  <tbody>
    <tr>
      <th scope="row">Slide ID</th>
      <td>${json.id}</td>
    </tr>
    <tr>
      <th scope="row">Slide Name</th>
      <td>${json.name}</td>
    </tr>
    <tr>
      <th scope="row">Number of Annotations</th>
      <td>${json.annotations} annotations</td>
    </tr>
    <tr>
      <th scope="row">Number of Heatmaps</th>
      <td>${json.heatmaps} heatmaps</td>
    </tr>
  </tbody>
</table>
`;
  //  Create initiate graph
  let initialZoomingData = visualizationLayerItems(getVisualizationData);
  let presetLabelData = presetLabelsData(getVisualizationData);
  let creatorsData = creatorData(getVisualizationData);
  // Create Graph
  VisualizationViewer('chart1', initialZoomingData);
  PresetLabelsGraph('chart2', presetLabelData );
  drawPieChart('chart3', creatorsData);
})();

// Graph
function VisualizationViewer(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  // console.log('id, result', id, result);
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

// Define function
function visualizationLayerItems(getVisualizationData) {
  let initialZoomingData = [];
  // console.log('visualizationLayerItems--getVisualizationData', getVisualizationData);

  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('visualizationLayerItems--getVisualizationData--getVisualizationData.annotations', d);
    d.geometries.features.map((detailData)=>{
      // console.log('visualizationLayerItems--getVisualizationData--getVisualizationData.annotations-geometry', detailData);
      if (detailData.viewerStates) {
        // eslint-disable-next-line max-len
        // console.log('visualizationLayerItems--getVisualizationData--getVisualizationData.annotations-geometry--viewerStates', detailData.viewerStates);
        initialZoomingData.push(roundToSecondDecimalPlace(detailData.viewerStates.z));
      }
    });
  });
  // console.log('initialZoomingData', initialZoomingData);
  let result = countOccurrences(initialZoomingData);

  return result;
}
// Function to round to decimal places
function roundToSecondDecimalPlace(num) {
  return Math.round(num * 100) / 100;
}

function countOccurrences(arr) {
  // Create objects for counting
  let countMap = {};

  // Count each element in the array
  arr.forEach(function(value) {
    if (countMap[value] === undefined) {
      countMap[value] = 1;
    } else {
      countMap[value]++;
    }
  });

  // Convert the result to a 2-dimensional array
  let result = [];
  for (let key in countMap) {
    if (countMap.hasOwnProperty(key)) {
      result.push([parseFloat(key), countMap[key]]);
    }
  };

  return result;
}

// Preset Labels annotations
function presetLabelsData(getVisualizationData) {
  // console.log('presetLabelsData', getVisualizationData.annotations[1].properties.annotations.name);
  let initialData = [];
  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('getVisualizationData.annotations', d.properties.annotations.notes);
    if (d.properties.annotations.name == d.properties.annotations.notes) {
      initialData.push(d.properties.annotations.name);
    };
  });
  let result = countOccurrencesFromString(initialData);
  return result;
}

function countOccurrencesFromString(arr) {
  // console.log('arr', arr);
  // 文字列用のカウントマップを作成
  let countMap = {};

  // 配列の各要素をカウント
  arr.forEach(function(value) {
    // 文字列以外の場合は処理をスキップ
    if (typeof value !== 'string') {
      return;
    }

    // カウントマップに追加またはインクリメント
    if (countMap[value] === undefined) {
      countMap[value] = 1;
    } else {
      countMap[value]++;
    }
  });
  // console.log(countMap);
  // カウントマップを2次元配列に変換
  let countArray = Object.entries(countMap).map(([key, value]) => [key, value]);

  // console.log(countArray);
  return countArray;
}


function PresetLabelsGraph(id, result) {
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
function creatorData(getVisualizationData) {
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

function drawPieChart(id, data) {
  // 円グラフを描画するキャンバスを取得
  const ctx = document.getElementById(id);

  // データのラベルと値を分ける
  const labels = data.map((item) => item[0]);
  const values = data.map((item) => item[1]);

  // 円グラフの色を定義
  const backgroundColors = [
    'rgba(255, 99, 132, 0.2)', // 赤
    'rgba(54, 162, 235, 0.2)', // 青
    'rgba(255, 206, 86, 0.2)', // 黄
    'rgba(75, 192, 192, 0.2)', // 緑
    'rgba(153, 102, 255, 0.2)', // 紫
    'rgba(255, 159, 64, 0.2)', // オレンジ
  ];
  const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
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
            return label + ': ' + value + ' Annotations (' + percentage + ')';
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

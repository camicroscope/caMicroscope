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

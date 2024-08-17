function createUsersOfAnnotationsChart(id, data) {
  // Get the canvas to draw the pie chart
  const ctx = document.getElementById(id);

  // Separate the labels and values from the data
  const labels = data.map((item) => item[0]);
  const values = data.map((item) => item[1]);

  // Define the colors for the pie chart
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

  // Data set for the pie chart
  const chartData = {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: backgroundColors.slice(0, values.length),
      borderColor: borderColors.slice(0, values.length),
      borderWidth: 1,
    }],
  };

  // Options for the pie chart
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

  // Draw the pie chart
  new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: options,
  });
}

// Graph
function createAnnotationZoomingChart(id, result) {
  const ctx = document.getElementById(id);
  const aa = result;
  // console.log('id, result', id, result);
  // Define data
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

  // Setting options
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
        beginAtZero: true, // Set vertical axis to start from 0
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

  // Create the graph
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
  // Define data
  var data = {
    labels: aa.map((item) => item[0]),
    datasets: [{
      label: 'Preset Labels Counts',
      data: aa.map((item) => item[1]),
      backgroundColor: [
        'rgba(23, 162, 184, 0.95)',
        'rgba(23, 142, 184, 0.95)',
        'rgba(23, 123, 184, 0.95)',
        'rgba(23, 104, 184, 0.95)',
        'rgba(23, 181, 184, 0.95)',
        'rgba(23, 184, 167, 0.95)',
        'rgba(23, 184, 148, 0.95)',
      ],
      borderColor: [
        'rgba(23, 162, 184, 1)', // rgba(23, 162, 184)
        'rgba(23, 142, 184, 1)', // rgba(23, 142, 184)
        'rgba(23, 123, 184, 1)', // rgba(23, 123, 184)
        'rgba(23, 104, 184, 1)', // rgba(23, 104, 184)
        'rgba(23, 181, 184, 1)', // rgba(23, 181, 184)
        'rgba(23, 184, 167, 1)', // rgba(23, 184, 167)
        'rgba(23, 184, 148, 1)', // rgba(23, 184, 148)
      ],
      borderWidth: 1,
    }],
  };

  // Get the maximum value of the dataset and add 1 to it
  var maxYValue = Math.max(...data.datasets[0].data) + 1;

  // Set options
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

  // Create the chart
  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options,
  });
}

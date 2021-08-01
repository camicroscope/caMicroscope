var tour = new Tour({
  name: 'Tour',
  steps: [
    {
      element: 'label[title=\'Layers\']',
      title: 'Layer Manager',
      content: 'Opens the Layers Manager panel,'+
            ' where you can select which layers to view.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'i[title=\'Viewer\']',
      title: 'Viewer',
      content: 'Return to the slide viewer',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'label[title=\'Draw\']',
      title: 'Draw',
      content: 'Draw thin lines, thick lines, or polygons on the image.'+
            ' To maintain the integrity of measurements, avoid drawing shapes that overlap or intersect one another.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'label[title=\'Preset Labels\']',
      title: 'Preset Labels',
      content: 'Use a preset annotation type immediately to quickly annotate a silde consistently.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'label[title=\'Magnifier\']',
      title: 'Magnifier',
      content: 'The Magnifier works like a magnifying glass and allows'+
            ' you to see the slide at normal magnification (1.0), low magnification (0.5),'+
            ' or high magnification (2.0). Click a magnification level and place the'+
            ' bounding box on the area of the slide you want to magnify.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'label[title=\'Measurement\']',
      title: 'Measurement',
      content: 'Drag this tool on the slide to learn the measurement in micrometers.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'i[title=\'Slide Capture\']',
      title: 'Slide Capture',
      content: 'Take Screenshot of the slide.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
    {
      element: 'i[title=\'Tutorial\']',
      title: 'Tutorial',
      content: 'Click here to start viewer Tour.',
      placement: 'auto bottom',
      smartPlacement: true,
    },
  ],
  template: '<div class=\'popover tour\'><div class=\'arrow\' style=\'border-bottom-color:rgb(54, 95, 156);\'>'+
    '</div><h3 class=\'popover-title\' '+
    'style=\'color:white;background:rgb(54, 95, 156);font-family: sans-serif;text-align: center;\'>'+
    '</h3><div class=\'popover-content\' style=\'color: black;font-family: sans-serif;text-align: justify;\'>'+
    '</div><div class=\'popover-navigation\' style=\'display:flex\'>'+
    '<div style=\'margin:auto;\'><button class=\'btn btn-default\' data-role=\'prev\'>'+
    '« Prev</button><span data-role=\'separator\'>|</span>'+
    '<button class=\'btn btn-default\' data-role=\'next\'>Next »</button></div>'+
    '</div><div style=\'width:100%;display: flex;margin-bottom: 5px;\'>'+
    '<button class=\'btn btn-default\' data-role=\'end\' style=\'margin:auto;\'>End tour</button></div></div>',
  backdrop: true,
  // resets tour always to resume always from the beginning
  onEnd: function reset() {
    window.localStorage.setItem('Tour_current_step', 0);
  },
});
tour.init();

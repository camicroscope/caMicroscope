var tour = new Tour({
  name: 'Tour',
  steps: [{
    element: 'label[title=\'Applications\']',
    title: 'Annotations',
    content: 'Opens the Annotation panel,'+
    ' where you can select which annotation set to view,'+
    ' name that annotation set, add optional notes about'+
    ' the annotation set, save the annotation set, and reset the panel to its original state.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'label[title=\'Layers\']',
    title: 'Layer Manager',
    content: 'Opens the Layers Manager panel,'+
    ' where you can select which layers to view.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'i[title=\'Home\']',
    title: 'Home',
    content: 'Return to the data table so that'+
    ' you can open another slide.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'label[title=\'Draw\']',
    title: 'Draw',
    content: 'Draw thin lines, thick lines, or polygons on the image.'+
    ' Annotations can also be computer aided using the Smart-pen tool. Draw them, stretch them, remove them.'+
    ' To maintain the integrity of measurements, avoid drawing shapes that overlap or intersect one another.',
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
    element: 'i[title=\'Share View\']',
    title: 'Share View',
    content: 'Opens a window with a URL to the current presentation state of the'+
    ' slide including the magnification level, layers that are currently open, and your position on the image.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'label[title=\'Side By Side Viewer\']',
    title: 'Side By Side Viewer',
    content: 'Shows the Layer Manager panel, the left and right'+
    ' layers, and inset window. For the right and left layer, select which layer you want to view.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'i[title=\'Heat Map\']',
    title: 'Heat Map',
    content: 'For a slide with heatmap data, opens the choices of heatmaps available,'+
    ' as well as ways of displaying the heatmaps.'+
    ' The gradient shows all of the values on the selected spectrum for the field you selected.'+
    ' Contains a heatmap edit pen function.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'i[title=\'Labeling\']',
    title: 'Labeling',
    content: 'Use this tool to draw a circle or rectangle around a tumor region,'+
    ' measure an area on the slide, and download labels.'+
    ' The Labeling tool has its own toolbar with tools in the following order from left to right:'+
    ' return to the previous slide, place a square on the slide, place a circle on the slide,'+
    ' measure an area, and download labels.'+
    ' Click the left arrow at the far right of the toolbar to hide it,'+
    ' then click the right arrow to show it.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'i[title=\'Segment\']',
    title: 'Segment',
    content: 'This tool allows you to display, count, and export nuclear segmentations on the image.'+
    ' Clicking this tool opens the following custom toolbar.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'i[title=\'Predict\']',
    title: 'Model',
    content: 'Show results from a pre-trained tensorflow compatible model on a ROI of the slide.',
    placement: 'auto bottom',
    smartPlacement: true,
  },
  {
    element: 'i[title=\'Download Slide\']',
    title: 'Download Slide',
    content:
        'Download the slide image to your system',
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
  }],
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

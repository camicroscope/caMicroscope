// segmentpanel.js
//

function SegmentPanel(viewer) {
  const temp = `
        <div id='close' class='material-icons settings' title='Close Panel'>close</div>
        <div id='save' class='material-icons settings' title='Save ROI Image'>save</div>
        <div id='savecsv' class='material-icons settings' title='Save ROI CSV File'>list</div>
        <div id='thresh' class='material-icons settings' title='Open Segmentation Settings'>all_out</div>
        <div id='mask_vis' class='material-icons settings' title='Toggle Mask'>visibility</div>

    <div id='owrap' class='segment-setting settings' style="display: none;">
      <label for="opacity">Opacity</label><input type='range' id='opacity' min='0' max='1' step='0.01' value='0.6'><label id='olabel'>0.6</label>
    </div>
    
    <div id='twrap' class='segment-setting settings' style="display: none;">
      <label for="threshold">Threshold</label><input type='range' id='threshold' min='0' max='1' step='0.01' value='0.15'><label id='tlabel'>0.15</label>
    </div> 

    <div id='minwrap' class='segment-setting settings' style="display: none;">
      <label for="minarea">Min Area</label><input id='minarea' type='range' min='0' max='5000' step='1' value='50'><label id='minlabel'>50</label>
    </div>

    <div id='maxwrap' class='segment-setting settings' style="display: none;">
      <label for="maxarea">Max Area</label><input id='maxarea' type='range' min='0' max='5000' step='1' value='4500'><label id='maxlabel'>4500</label>
    </div>

        
        <div class='segment-count'><label>Object Count: </label><label id='segcount'></label></div>
        <div id='processing' class='segment-processing'><span class='blink_me'><em>Processing</em></span></div>
        
        <canvas class='out'></canvas>
        <canvas id='mask' style='display: none;'></canvas>

        <div class="annotation">
          <label>Name:&nbsp&nbsp<textarea id='_name'></textarea></label>
          <label>Notes:&nbsp&nbsp<textarea id='_notes'></textarea></label>
          <button id='_save'>Save</button>
        </div>

        <canvas id='dummy' style='display: none;'></canvas>
        <canvas class='src'></canvas>
        <canvas id='hemo' class='hiddenCanvas'></canvas>
        <canvas id ='fullsrc' class='hiddenCanvas'></canvas>
        <canvas id='c2s' class='hiddenCanvas'></canvas>
        <canvas id='fullSegImg' class='hiddenCanvas'></canvas>
        <img id='imageEle' class='hiddenCanvas'></img>
        <a id='csvDLB'></a>
        <input id='inProgress' type='hidden' />
    `;

  this.viewer = viewer;

  this.elt = document.createElement('div');
  this.elt.classList.add('segment-panel');
  this.elt.innerHTML = temp;
  this.__contours = null;
  this.__top_left = null;
  this.__x = null;
  this.__y = null;
  this.__width = null;
  this.__height = null;
  this.__spImgX = null;
  this.__spImgY = null;
  this.__spImgWidth = null;
  this.__spImgHeight = null;

  this.__out = this.elt.querySelector('.out');
  this.__src = this.elt.querySelector('.src');
  this.__fullsrc = this.elt.querySelector('#fullsrc');
  this.__hemo = this.elt.querySelector('#hemo');
  this.__mask = this.elt.querySelector('#mask');
  this.__img = this.elt.querySelector('#imageEle');
  this.__c2s = this.elt.querySelector('#c2s');
  this.__btn_save = this.elt.querySelector('#save');
  this.__btn_savecsv = this.elt.querySelector('#savecsv');
  this.__btn_csvDL = this.elt.querySelector('#csvDLB');
  this.__indicator = this.elt.querySelector('#processing');
  this.__count = this.elt.querySelector('.segment-count');

  this.__toggle = this.elt.querySelector('#mask_vis');
  // threshold
  this.__threshold = this.elt.querySelector('.segment-setting input[type=range]#threshold');
  this.__tlabel = this.elt.querySelector('.segment-setting label#tlabel');
  this.__twrap = this.elt.querySelector('#twrap');

  // min
  this.__minarea = this.elt.querySelector('.segment-setting input[type=range]#minarea');
  this.__minlabel = this.elt.querySelector('.segment-setting label#minlabel');
  this.__minwrap = this.elt.querySelector('#minwrap');

  // max
  this.__maxarea = this.elt.querySelector('.segment-setting input[type=range]#maxarea');
  this.__maxlabel = this.elt.querySelector('.segment-setting label#maxlabel');
  this.__maxwrap = this.elt.querySelector('#maxwrap');

  // opacity
  this.__opacity = this.elt.querySelector('.segment-setting input[type=range]#opacity');
  this.__oplabel = this.elt.querySelector('.segment-setting label#olabel');
  this.__opwrap = this.elt.querySelector('#owrap');

  // annotation
  this.__name = this.elt.querySelector('#_name');
  this.__notes = this.elt.querySelector('#_notes');
  this.__annotation = this.elt.querySelector('#_save');

  this.viewer.addOverlay({
    element: this.elt,
    location: new OpenSeadragon.Rect(0, 0, 0, 0),
    checkResize: false,
  });
  this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
  this.elt.querySelector('#close').addEventListener('click', function(e) {
    this.close();
  }.bind(this));
  // this.elt.querySelector('#save').addEventListener('click',function(e){
  //    this.save();
  // }.bind(this));
  this.elt.querySelector('#thresh').addEventListener('click', function(e) {
    this.showThreshBar();
  }.bind(this));

  this.elt.querySelector('#mask_vis').addEventListener('click', function(e) {
    this.toggleMask();
  }.bind(this));
  // this.elt.querySelector('#amin').addEventListener('click',function(e){
  //    this.showMinBar();
  // }.bind(this));
  // this.elt.querySelector('#amax').addEventListener('click',function(e){
  //    this.showMaxBar();
  // }.bind(this));

  this.close();
}

SegmentPanel.prototype.open = function(args) {
  if (!args || args.status == 'watershed') {
    this.elt.style.display = '';

    this.__threshold.disabled = false;
    this.__threshold.style.cursor = 'pointer';
    this.__minarea.disabled = false;
    this.__minarea.style.cursor ='pointer';
    this.__maxarea.disabled = false;
    this.__maxarea.style.cursor = 'pointer';

    this.__count.style.display = '';
    this.__indicator.style.left = '232px';
  } else {
    this.elt.style.display = '';

    this.__threshold.disabled = true;
    this.__threshold.style.cursor = 'not-allowed';
    this.__minarea.disabled = true;
    this.__minarea.style.cursor ='not-allowed';
    this.__maxarea.disabled = true;
    this.__maxarea.style.cursor = 'not-allowed';

    this.__count.style.display = 'none';
    this.__indicator.style.left = '101px';
  }
};

SegmentPanel.prototype.close = function() {
  this.elt.style.display = 'none';
  const context = this.__out.getContext('2d');
  context.clearRect(0, 0, this.__out.width, this.__out.height);
  this.__mask.getContext('2d').clearRect(0, 0, this.__mask.width, this.__mask.height);
};

SegmentPanel.prototype.save = function() {
  alert('Saving Image And Mask!');
};

SegmentPanel.prototype.showThreshBar = function() {
  if (this.__twrap.style.display === 'none') {
    this.__twrap.style.display = '';
    this.__minwrap.style.display = '';
    this.__maxwrap.style.display = '';
    this.__opwrap.style.display = '';
  } else {
    this.__twrap.style.display = 'none';
    this.__minwrap.style.display = 'none';
    this.__maxwrap.style.display = 'none';
    this.__opwrap.style.display = 'none';
  }

  // alert('Showing Bar');
};

SegmentPanel.prototype.showProgress = function() {
  // console.log('In Progress');
  this.__indicator.style.display = 'flex';
};

SegmentPanel.prototype.hideProgress = function() {
  // console.log('Progress Finished');
  this.__indicator.style.display = 'none';
};

SegmentPanel.prototype.toggleMask = function(e=0) {
  console.log('toggleMask');

  if (this.__mask.style.display == 'none' && e!=2 || e==1) {
    this.__mask.style.display = '';
    this.__out.style.display = 'none';
  } else {
    this.__mask.style.display = 'none';
    this.__out.style.display = '';
  }
};
// SegmentPanel.prototype.showMinBar = function(){

//  if(this.__minwrap.style.display === 'none') {
//      this.__minwrap.style.display = 'flex';
//      this.__twrap.style.display = 'none';
//      this.__maxwrap.style.display = 'none';
//  }

// };

// SegmentPanel.prototype.showMaxBar = function(){

//  if(this.__maxwrap.style.display === 'none') {
//      this.__maxwrap.style.display = 'flex';
//      this.__minwrap.style.display = 'none';
//      this.__twrap.style.display = 'none';
//  }

// };


SegmentPanel.prototype.setPosition = function(x, y, w, h) {
  this.overlay.location.x = x;
  this.overlay.location.y = y;
  this.overlay.width = w;
  this.overlay.height = h;
  this.overlay.drawHTML(this.viewer.overlaysContainer, this.viewer.viewport);
};

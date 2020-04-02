function ModelPanel(viewer) {
  const temp = `
        <div id='close' class='material-icons settings'>close</div>
        <div id='save' class='material-icons settings' title='Save ROI Image'>save</div>
        <div id='savecsv' class='material-icons settings' title='Save class probabilities - CSV File'>list</div>
        <div id='result' class='settings' title='Select the model'>--Result--</div>
        
        <div id='processing' class='segment-processing'></div>
        
        <canvas class='out'></canvas>
        <canvas class='src'></canvas>
        <canvas id ='fullsrc' class='hiddenCanvas'></canvas>
        <canvas id ='dummy' class='hiddenCanvas'></canvas>
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

  // canvases
  this.__fullsrc = this.elt.querySelector('#fullsrc');
  this.__img = this.elt.querySelector('#imageEle');
  this.__c2s = this.elt.querySelector('#c2s');

  // clear
  this.__btn_save = this.elt.querySelector('#save');
  this.__btn_savecsv = this.elt.querySelector('#savecsv');
  this.__btn_csvDL = this.elt.querySelector('#csvDLB');
  this.__indicator = this.elt.querySelector('#processing');
  this.__result = this.elt.querySelector('#result');

  // threshold
  this.__modelselector = this.elt.querySelector('#modelselect');

  this.viewer.addOverlay({
    element: this.elt,
    location: new OpenSeadragon.Rect(0, 0, 0, 0),
    checkResize: false,
  });
  this.overlay = this.viewer.currentOverlays[this.viewer.currentOverlays.length-1];
  this.elt.querySelector('#close').addEventListener('click', function(e) {
    console.log('close');
    this.close();
  }.bind(this));

  this.close();
}

ModelPanel.prototype.open = async function() {
  // models has keys of object, i.e the url
  const modsel = this.__modelselector;
  // empty(modsel);
  // // let models =
  // let opt = document.createElement('option');
  // opt.disabled = true;
  // opt.value = "";
  // opt.index = 0;
  // opt.innerHTML = "-- select a model --";
  // modsel.appendChild(opt);
  // Object.keys(await tf.io.listModels()).forEach(function (element) {
  //    let opt = document.createElement('option');
  //    let key = element.split("/").pop();
  //    console.log(key.slice(0, 4));
  //    if (key.slice(0, 4) == "pred") {
  //        opt.value = element.split("/").pop();
  //        opt.innerHTML = element.split("/").pop().slice(5, -3);
  //        modsel.appendChild(opt);
  //    }
  // });
  // modsel.selectedIndex = 0;
  // this.__result.innerHTML = '-- result --';
  this.elt.style.display = '';
};

ModelPanel.prototype.close = function() {
  this.elt.style.display = 'none';
};

ModelPanel.prototype.save = function() {
  alert('Saving Image and Mask!');
};

// ModelPanel.prototype.populate = function(models){

//  // models has keys of object, i.e the url
//  // var modsel = this.__modelselector;
//  var opt = document.createElement('option');
//  models.forEach(function (element) {
//      opt.value = element;
//      opt.innerHTML = 'pred_' + element.split("/").pop();
//      modsel.appendChild(opt);
//  });
// }

ModelPanel.prototype.showProgress = function(text) {
  this.__indicator.style.display = 'flex';
  if (text) this.__indicator.innerHTML = '<em class="blink_me">' + text + '</em>';
};

ModelPanel.prototype.hideProgress = function() {
  this.__indicator.style.display = 'none';
};

ModelPanel.prototype.showResults = function(text) {
  this.__result.innerHTML = text;
};

ModelPanel.prototype.setPosition = function(x, y, w, h) {
  this.overlay.location.x = x;
  this.overlay.location.y = y;
  this.overlay.width = w;
  this.overlay.height = h;
  this.overlay.drawHTML(this.viewer.overlaysContainer, this.viewer.viewport);
};

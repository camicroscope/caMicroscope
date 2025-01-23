function Assistant(options) {
  this.className = 'Assistant';
  this.setting = {
    // id: doc element
    // data: labels dataset
  };
  this.view;
  this.addBtn;
  this.enableBtn;
  this.modelSelectionBtn;
  this.infoBtn;

  this.annotateModeZone;
  this.settingZone;

  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.className}: No Main Elements...`);
    return;
  }

  this.elt.classList.add('ml-assistant-container');

  this.__refreshUI();
}
Assistant.prototype.__clearUI = function() {
  empty(this.elt);

  this.view = null;
  this.addBtn = null;
  this.enableBtn = null;
  this.modelSelectionBtn = null;
  this.infoBtn = null;
  this.modelList = null;
  this.pixelScaleList = null;

  this.annotateModeZone = null;
  this.settingZone = null;
  this.processedImgContainer = null;
  this.modelPredictImgContainer = null;
};

Assistant.prototype.__refreshUI = async function() {
  this.__clearUI();
  //
  this._viewer = this.setting.viewer;
  this.view = document.createElement('div');
  this.view.classList.add('ml-assistant');
  const modelEnableId = randomId();
  const modelSelectionId = randomId();
  const pixelScalingId = randomId();
  const modelInfoId = randomId();
  const undoInfoId = randomId();

  // Pixel Scaling ID
  const noScaleId = randomId();
  const normId = randomId();
  const centerId = randomId();
  const stdId = randomId();

  const viewHtml = `
    <button class='btn btn-info add-model'>Add Segmentation Model</button>
    <ul class="model-tools">
        <li>
            <input type="checkbox" id="${modelEnableId}">
            <label class="material-icons md-20" for="${modelEnableId}" title="Model Enable">timeline</label>
        </li>
        <li>
            <input type="checkbox" id="${modelSelectionId}">
            <label class="material-icons md-20" for="${modelSelectionId}" title="Model Selection">keyboard_arrow_down</label>
            <ul class="model-list ml_drop_down">
            </ul>
        </li>
        <li>
            <input type="checkbox" id="${pixelScalingId}">
            <label class="material-icons md-20" for="${pixelScalingId}" title="Pixel Scaling">photo_filter</label>
            <ul class="pixel-scale-list ml_drop_down">
                <li>
                    <input type="radio" value="no_scale" id="${noScaleId}" checked>
                    <label class="material-icons md-20" for="${noScaleId}" title="No Scaling">filter_1</label>
                </li>
                <li>
                    <input type="radio" value="norm" id="${normId}">
                    <label class="material-icons md-20" for="${normId}" title="Normalization">filter_2</label>
                </li>
                <li>
                    <input type="radio" value="center" id="${centerId}">
                    <label class="material-icons md-20" for="${centerId}" title="Centerization">filter_3</label>
                </li>
                <li>
                    <input type="radio" value="std" id="${stdId}">
                    <label class="material-icons md-20" for="${stdId}" title="Standardization">filter_4</label>
                </li>
            </ul>
        </li>
        <li>
            <i class="material-icons md-20" id="${modelInfoId}" title="Model Information">info</i>
        </li>
        <li>
            <i class="material-icons md-20" id="${undoInfoId}" title="Undo">undo</i>
        </li>
    </ul>
    <div class='annotate-checklist'>
        <label><input type='checkbox' value='annotateOneByDraw' checked/> Annotate One</label>
        <label><input type='checkbox' value='annotateManyByDraw'/> Annotate Many</label>
    </div>
    <div class='annotate-setting'>
        <div class='radius-setting'>
            <pre>Radius</pre>
            <input type="range" id="model-radius" max="100" min="10" value="30">
            <span id="model-r">30</span>
        </div>
        <div class='threshold-setting'>
            <pre>Threshold</pre>
            <input type="range" id="model-threshold" max="255" min="10" value="70">
            <span id="model-t">70</span>
        </div>
        <div class='min-overlap-setting'>
            <pre>Min Overlap</pre>
            <input type="range" id="model-overlap" max="70" min="1" value="10">
            <span id="model-o">10</span>
        </div>
    </div>
    <div class="model-predict-image">
        <label class="img-label">Model Predicted Image</label>
        <div class="model-predict-image-container"></div>
    </div>
    `;

  this.view.innerHTML = viewHtml;
  this.elt.append(this.view);

  this.addBtn = this.view.querySelector('.add-model');
  this.enableBtn = this.view.querySelector(`#${modelEnableId}`);
  this.modelSelectionBtn = this.view.querySelector(`#${modelSelectionId}`);
  this.infoBtn = this.view.querySelector(`#${modelInfoId}`);
  this.undoBtn = this.view.querySelector(`#${undoInfoId}`);
  this.modelList = this.view.querySelector('.model-list');
  this.pixelScaleList = this.view.querySelector('.pixel-scale-list');

  this.annotateModeZone = this.view.querySelector('.annotate-checklist');
  this.settingZone = {
    radius: this.view.querySelector('.radius-setting'),
    threshold: this.view.querySelector('.threshold-setting'),
    overlap: this.view.querySelector('.min-overlap-setting'),
  };

  const radiusLabel = this.settingZone.radius.querySelector('pre');
  tippy(radiusLabel, {
    content: 'Enhance the coordinate percentage relative to the polygon drawn by the user. ' +
             'These expanded image will be used as input for image processing.',
    placement: 'left',
    delay: 300,
    theme: 'translucent',
    interactive: true,
    trigger: 'mouseenter focus',
    aria: {
      content: 'describedby',
    },
  });

  const thresholdLabel = this.settingZone.threshold.querySelector('pre');
  tippy(thresholdLabel, {
    content: 'The separation threshold value represents the distinction between the object (foreground) ' +
             'and the surrounding area (background).',
    placement: 'left',
    delay: 300,
    theme: 'translucent',
    interactive: true,
    trigger: 'mouseenter focus',
    aria: {
      content: 'describedby',
    },
  });

  const overlapLabel = this.settingZone.overlap.querySelector('pre');
  tippy(overlapLabel, {
    content: 'The minimum overlap refers to the required intersection between ' +
             'the user-selected polygon and the predicted polygons.',
    placement: 'left',
    delay: 300,
    theme: 'translucent',
    interactive: true,
    trigger: 'mouseenter focus',
    aria: {
      content: 'describedby',
    },
  });
  this.modelPredictImgContainer = this.view.querySelector('.model-predict-image-container'),

  await this.__createModelList();

  this.__assignEventListener();
};

Assistant.prototype.disableUndo = function() {
  this.undoBtn.style.backgroundColor = '#9c9c9cb0';
  this.undoBtn.style.color = '#0088ff';
};

Assistant.prototype.enableUndo = function() {
  this.undoBtn.style.backgroundColor = '#ffffff';
  this.undoBtn.style.color = '#365f9c';
};

Assistant.prototype.__assignEventListener = function() {
  // Open add model modal event
  this.addBtn.addEventListener('click', (event) => {
    // event.preventDefault();
    this.__openAddModel();
  });

  // Enable Annotation Event
  // TODO

  // Switch Current Model Event
  this.modelList.querySelectorAll('label').forEach((elt) => {
    elt.addEventListener('click', (event) => {
      this.modelList.querySelectorAll('input').forEach((iElt) => {
        iElt.checked = false;
      });
      event.target.checked = true;
      const modelKey = this.modelList.querySelector(`#${elt.getAttribute('for')}`).value;
      this.__selectModel(modelKey);
    });
  });

  // Switch Pixel Scaling Event
  this.pixelScaleList.querySelectorAll('label').forEach((elt) => {
    elt.addEventListener('click', (event) => {
      this.pixelScaleList.querySelectorAll('input').forEach((iElt) => {
        iElt.checked = false;
      });
      event.target.checked = true;
    });
  });


  // Open Model Info Event
  this.infoBtn.addEventListener('click', (event) => {
    // event.preventDefault();
    this.__openModelInfo();
  });

  // Switch Model Mode Event
  this.annotateModeZone.querySelectorAll('input').forEach((elt) => {
    elt.addEventListener('click', (event) => {
      this.annotateModeZone.querySelectorAll('input').forEach((iElt) => {
        iElt.checked = false;
        iElt.removeAttribute('checked');
      });
      event.target.checked = true;
      event.target.setAttribute('checked', 'true');
    });
  });

  // Change radius event
  this.settingZone.radius.querySelector('input').addEventListener('change', (event) => {
    this.settingZone.radius.querySelector('span').textContent = event.target.value;
    if (this.__isEnableAssistant()) {
      this._viewer.raiseEvent('ml-draw-setting-change', {});
    }
  });

  // Change threshold event
  this.settingZone.threshold.querySelector('input').addEventListener('change', (event) => {
    this.settingZone.threshold.querySelector('span').textContent = event.target.value;
    if (this.__isEnableAssistant()) {
      this._viewer.raiseEvent('ml-draw-setting-change', {});
    }
  });

  // Change overlap event
  this.settingZone.overlap.querySelector('input').addEventListener('change', (event) => {
    this.settingZone.overlap.querySelector('span').textContent = event.target.value;
    if (this.__isEnableAssistant()) {
      this._viewer.raiseEvent('ml-draw-setting-change', {});
    }
  });
};

// Add model list
Assistant.prototype.__createModelList = async function() {
  const dropDownList = [
    {
      icon: 'timeline',
      title: 'Default',
      value: 'default',
      checked: true,
    }];

  // modelName = [];
  Object.keys(await tf.io.listModels()).forEach(function(element) {
    const dict = {};
    const value = element.split('/').pop();
    if (value.slice(0, 3) == 'seg') {
      const title = element.split('/').pop().split('_')[1].slice(0, -3);
      dict.icon = 'flip_to_back';
      dict.title = title;
      dict.value = value;
      dict.checked = false;
      dropDownList.push(dict);
    }
  });

  dropDownList.map((modelData) => {
    this.__createModelLabel(modelData);
  });
};

// Create model label
Assistant.prototype.__createModelLabel = function(modelData) {
  const modelId = randomId();
  const value = modelData.value;
  const title = modelData.title;
  const checked = modelData.checked;
  const icon = modelData.icon;
  const modelCardHtml = `
        <input id="${modelId}" type="radio" value="${value}">
        <label class="material-icons md-20" for="${modelId}" title="${title}">${icon}</label>
    `;
  const modelCard = document.createElement('li');
  modelCard.innerHTML = modelCardHtml;
  if (checked) {
    modelCard.querySelector('input').checked = true;
  }
  this.modelList.appendChild(modelCard);
};

// Handle open model info modal
Assistant.prototype.__openAddModel = function() {
  // Raise open add model modal into view
  this._viewer.raiseEvent('open-add-model', {});
};

// Add model
Assistant.prototype.__updateModelList= function() {
  empty(this.modelList);
  this.__createModelList();
};

Assistant.prototype.__isEnableAssistant = function() {
  return this.enableBtn.checked;
};

// Handle model selection
Assistant.prototype.__selectModel = function(modelValue) {
  mltools.loadModel(modelValue);
};

// Handle open model info modal
Assistant.prototype.__openModelInfo = function() {
  this._viewer.raiseEvent('open-model-info', {});
};

// TODO
// Handle model delete
Assistant.prototype.__deleteModel = function(modelValue) {
  // Remove UI
  this.__updateModelList();
};

// Get mode
Assistant.prototype.__getAssistantMode = function() {
  return this.annotateModeZone.querySelector('input[checked]').value;
};

// Get setting mode value
Assistant.prototype.__getSettingModes = function() {
  const settingMode = {
    radius: parseFloat(this.settingZone.radius.querySelector('input').value),
    threshold: parseFloat(this.settingZone.threshold.querySelector('input').value),
    overlap: parseFloat(this.settingZone.overlap.querySelector('input').value),
  };
  return settingMode;
};

Assistant.prototype.__getScaleMethod = function() {
  return this.pixelScaleList.querySelector('input[checked]').value;
};

Assistant.prototype.__createElementFromHTML= function(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

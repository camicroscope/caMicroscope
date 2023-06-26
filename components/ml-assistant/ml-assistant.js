// Proposal: Control panel for machine learning assistant
// Include:
// + Add model -> Open add model modal
// + Model enable
// + Model selection (Options: watershed, smartpen, ...)
// + Pixel scaling selection (4 options: No Scaling, Normalization, Centerization, Standardization)
// + Model info -> Open model info modal

// + Annotate Mode zone (checkbox)
// - Draw
// - Click
// - ROI

// + Setting Zone (input range)
// - Radius
// - Threshold
// - Roughness


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

    // Pixel Scaling ID
    const noScaleId = randomId();
    const normId = randomId();
    const centerId = randomId();
    const stdId = randomId();

    const viewHtml = `
    <button class='btn btn-info add-model'>Add Model</button>
    <ul class="model-tools">
        <li>
            <input type="checkbox" id="${modelEnableId}" value="rect">
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
    </ul>
    <div class='annotate-checklist'>
        <label><input type='checkbox' value='AnnotateByDraw' checked/>  Draw</label>
        <label><input type='checkbox' value='annotateByClick' />  Click</label>
        <label><input type='checkbox' value='annotateByROI' />  ROI</label>
    </div>
    <div class='annotate-setting'>
        <div class='radius-setting'>
            <pre>Radius</pre>
            <input type="range" id="model-radius" max="70" min="7" value="30">
            <span id="model-r">30</span>
        </div>
        <div class='threshold-setting'>
            <pre>Threshold</pre>
            <input type="range" id="model-threshold" max="300" min="20" value="90">
            <span id="model-t">90</span>
        </div>
        <div class='roughness-setting'>
            <pre>Roughness</pre>
            <input type="range" id="model-smooth" max="10" min="1" value="4">
            <span id="model-s">4</span>
        </div>
    </div>
    `;

    this.view.innerHTML = viewHtml;
    this.elt.append(this.view);

    this.addBtn = this.view.querySelector('.add-model');
    this.enableBtn = this.view.querySelector(`#${modelEnableId}`);
    this.modelSelectionBtn = this.view.querySelector(`#${modelSelectionId}`);
    this.infoBtn = this.view.querySelector(`#${modelInfoId}`);
    this.modelList = this.view.querySelector('.model-list');
    this.pixelScaleList = this.view.querySelector('.pixel-scale-list')

    this.annotateModeZone = this.view.querySelector('.annotate-checklist');
    this.settingZone = {
        radius: this.view.querySelector('.radius-setting'),
        threshold: this.view.querySelector('.threshold-setting'),
        roughness: this.view.querySelector('.roughness-setting'),
    }

    await this.__createModelList();

    this.__assignEventListener();
}

Assistant.prototype.__assignEventListener = function() {
    // Open add model modal event
    this.addBtn.addEventListener('click', (event) => {
        // event.preventDefault();
        this.__openAddModel();
    })

    // Enable Annotation Event
    // TODO

    // Switch Current Model Event
    this.modelList.querySelectorAll('label').forEach((elt) => {
        elt.addEventListener('click', (event) => {
            this.modelList.querySelectorAll('input').forEach((iElt) => {
                iElt.checked = false;
            });
            event.target.checked = true;
        })
    })

    // Switch Pixel Scaling Event
    this.pixelScaleList.querySelectorAll('label').forEach((elt) => {
        elt.addEventListener('click', (event) => {
            this.pixelScaleList.querySelectorAll('input').forEach((iElt) => {
                iElt.checked = false;
            });
            event.target.checked = true;
        })
    })


    // Open Model Info Event
    this.infoBtn.addEventListener('click', (event) => {
        // event.preventDefault();
        this.__openModelInfo();
    })

    // Switch Model Mode Event
    this.annotateModeZone.querySelectorAll('input').forEach((elt) => {
        elt.addEventListener('click', (event) => {
            this.annotateModeZone.querySelectorAll('input').forEach((iElt) => {
                iElt.checked = false;
            })
            event.target.checked = true;
        })
    })

    // Change radius event
    this.settingZone.radius.querySelector('input').addEventListener('change', (event) => {
        this.settingZone.radius.querySelector('span').textContent = event.target.value;
        // TODO process ROI processing
    })

    // Change threshold event
    this.settingZone.threshold.querySelector('input').addEventListener('change', (event) => {
        this.settingZone.threshold.querySelector('span').textContent = event.target.value;
        // TODO process ROI processing
    })

    // Change roughness event
    this.settingZone.roughness.querySelector('input').addEventListener('change', (event) => {
        this.settingZone.roughness.querySelector('span').textContent = event.target.value;
        // TODO process ROI processing
    })
}

// Add model list
Assistant.prototype.__createModelList = async function() {
    const dropDownList = [
        {
        icon: 'timeline',
        title: 'Watershed',
        value: 'watershed',
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
            // Saving to previously defined model names
            // modelName.push(dict['title']);
            dropDownList.push(dict);
        }
    });

    dropDownList.map((modelData) => {
        this.__createModelLabel(modelData);
    })
}

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
    `
    const modelCard = document.createElement('li');
    modelCard.innerHTML = modelCardHtml;
    if (checked) {
        modelCard.querySelector('input').checked = true;
    }
    this.modelList.appendChild(modelCard);
}

// Handle open model info modal
Assistant.prototype.__openAddModel = function() {
    //Raise open add model modal into view
    this._viewer.raiseEvent('open-add-model', {});
}

// Add model
Assistant.prototype.__updateModelList= function() {
    empty(this.modelList);
    this.__createModelList();
}

// Handle enable machine learning assistant
Assistant.prototype.__enableAssistant = function() {
    // Change UI
    this._viewer.raiseEvent('enable-assistant', {});
}

// Handle model selection
Assistant.prototype.__selectModel = function(modelValue) {
    // Change UI
    this._viewer.raiseEvent('select-model', {model: modelValue});
}

// Handle open model info modal
Assistant.prototype.__openModelInfo = function() {
    this._viewer.raiseEvent('open-model-info', {});
}

// Handle model delete
Assistant.prototype.__deleteModel = function(modelValue) {
    // Delete model from resource

    // Remove UI
    this.__updateModelList();
}

// Handle select mode
Assistant.prototype.__selectMode = function(mode) {
    // Change UI
}

// Get mode
Assistant.prototype.__getAssistantMode = function() {
    const mode = {};
    return mode;
}

// Handle setting mode change
Assistant.prototype.__settingModeChangeHandler = function() {
    // Change UI
}

// Get setting mode value
Assistant.prototype.__getSettingModes = function() {
    const settingMode = {
        radius: this.settingZone.radius.value,
        threshold: this.settingZone.threshold.value,
        roughness: this.settingZone.threshold.value,
    }
    return settingMode;
}

Assistant.prototype.__createElementFromHTML= function(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
};

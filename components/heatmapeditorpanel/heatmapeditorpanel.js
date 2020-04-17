// heatmapeditorpanel.js

function HeatmapEditorPanel(options) {
  this.name = 'HeatmapEditorPanel';

  this.setting = {
    data: null,
    fields: null, // required
    editedDate: null, // required
    onFieldChange: null,
    onClick: null,
    onRemove: null,
    onReset: null,
    onSave: null,
  };

  extend(this.setting, options);

  // attach container element
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt && this.setting.element) {
    this.elt = this.setting.element;
  }

  if (!this.elt) {
    // create main
    this.elt = document.createElement('div');
  }

  // create UI
  this.__refresh();
}

const fieldsColors = ['#576971', '#0A1316', '#DFB9C1', '#2F1218', '#C0A7A3', '#271A18', '#D07DBE', '#2F0526'];
function createRadios(fields, name) {
  let radiosTemplate ='';
  fields.forEach((field, idx)=>{
    radiosTemplate+= `&nbsp;&nbsp;<label style='display:inline-flex;'>
        <input type="radio" name="${name}" value="${idx}|${field.name}|1|${fieldsColors[idx*2]}">
        <div class='color-square' style='background:${fieldsColors[idx*2]}'></div>
        ${field.name} - positive
        </label><br>`;
    radiosTemplate+= `&nbsp;&nbsp;<label style='display:inline-flex;'>
        <input type="radio" name="${name}" value="${idx}|${field.name}|0|${fieldsColors[idx*2+1]}">
        <div class='color-square' style='background:${fieldsColors[idx*2+1]}'></div>
        ${field.name} - negative
        </label><br>`;
  });
  return radiosTemplate;
}
HeatmapEditorPanel.prototype.getAllOperations = function() {
  const radios = this.elt.querySelectorAll('.fields-panel input[type=radio]');
  const rs = [];
  radios.forEach((r)=>{
    // const [index,name,value,color] = r.value.split('|')
    rs.push(r.value.split('|'));
  });
  return rs;
};

HeatmapEditorPanel.prototype.getCurrentOperation = function() {
  const radio = this.elt.querySelector('.fields-panel input[type=radio]:checked');
  return radio?radio.value.split('|'):null;
};
/**
 * @private
 * __refresh refresh UI part according to this.setting
 */
HeatmapEditorPanel.prototype.__refresh = function() {
  empty(this.elt);
  this.elt.classList.add('hmep-container');
  // create radio options
  const name = randomId();
  const radiosTempalte = createRadios(this.setting.fields, name);


  const template = `
    <div class ='fields-panel'>
        <label>Operation:</label><br>
        ${radiosTempalte}
    </div>
    <div class='btn-panel'>
        <button class='reset' style='float:left;'>Clear</button>
        <button class='action' style='float:right;'>Save</button>
    </div>
    <div class='edited-data-panel'>

    </div>
    `;
  this.elt.innerHTML = template;

  // set change event
  const radios = this.elt.querySelectorAll(`.fields-panel input[type=radio][name=${name}]`);
  radios[0].checked = true;
  radios.forEach((radio) =>{
    radio.addEventListener('change', function(e) {
      const target = e.srcElement || e.target;
      if (isFunction(this.setting.onFieldChange)) {
        this.setting.onFieldChange.call(null, target.value.split('|'));
      }
    }.bind(this));
  });

  // set save event
  this.__save_btns = this.elt.querySelectorAll(`.btn-panel button`);
  this.__save_btns[0].addEventListener('click', function(e) {
    if (isFunction(this.setting.onReset)) this.setting.onReset.call(this);
  }.bind(this));
  this.__save_btns[1].addEventListener('click', function(e) {
    if (isFunction(this.setting.onSave)) this.setting.onSave.call(this);
  }.bind(this));
};

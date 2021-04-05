const defaultColorList = {
  3: ['#2b83ba', '#ffffbf', '#d7191c'],
  4: ['#2b83ba', '#abdda4', '#fdae61', '#d7191c'],
  5: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'],
  6: ['#3288bd', '#99d594', '#e6f598', '#fee08b', '#fc8d59', '#d53e4f'],
  7: ['#3288bd', '#99d594', '#e6f598', '#ffffbf', '#fee08b', '#fc8d59', '#d53e4f'],
  8: ['#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#fee08b', '#fdae61', '#f46d43', '#d53e4f'],
  9: ['#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d53e4f'],
  10: ['#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142'],
  11: ['#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#ffffbf',
    '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142'],
};
// Default Color List for gradient view
// const defaultColorList = ["#d7191c",
// "#fdae61",
// "#ffffbf",
// "#abdda4",
// "#2b83ba"];
// Regular Expression for testing valid color values
const cssHexRegExp = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');
function HeatmapControl(options) {
  this.name = 'HeatmapControl';
  /*
        list:[
            {
                id: ,
                title: ,
                icon: ,
                content:string
                isExpand:,

            }
        ]
    */
  this.setting = {
    fields: null,
    mode: null,
    currentField: null,
    onChange: null,
    onOpacityChange: null,
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
/**
 * @private
 * __refresh refresh UI part according to this.setting
 */
HeatmapControl.prototype.__refresh = function() {
  empty(this.elt);
  this.elt.classList.add('hmc-container');
  this.rangeSliders = {};
  const template = `
    <div class='mode-panel'>

        <label> Gradient <input type='checkbox' value='gradient' ${
          this.setting.mode == 'gradient' ? 'checked' : ''
} /></label>
    </div>
    <div class='sel-field-panel'>
        <select></select>
    </div>
        <label>Properties:</label>
    <div class='fields-panel'>

    </div>
    <div style='display:none;'>
        <label>Opacity:</label>
        <div class='opacity-panel'>
        </div>
    </div>
    <div class='color-panel'>
        <label> Color <input id='heatMapColor' type='color' value= ${
          this.setting.mode === 'gradient' ?
            '#1034A6' :
            $CAMIC.viewer.heatmap._color
} /></label>
    </div>
    <div class='colors-legend-panel'>
        <label># of Intervals <input id='legendIntervals' type='number' class='range-enforced' value=${
          this.setting.mode === 'gradient' ? $CAMIC.viewer.heatmap._colors.length : 5
} min='2' max='10'/></label> <div class="warning" style="display: none;"></div>
        <div class='legends'>
        </div>
    </div>
    `;
  this.elt.innerHTML = template;
  const checkbox = this.elt.querySelector('.mode-panel input[type=checkbox]');
  checkbox.addEventListener('change', this._modeChanged.bind(this));

  const color = this.elt.querySelector('.color-panel input[type=color]');
  color.addEventListener('input', this._colorChanged.bind(this));

  this.rangeSliders = {};
  createSelect(this.elt.querySelector('.sel-field-panel select'), this.setting.fields, this.setting.currentField);
  this.elt.querySelector('.sel-field-panel select').addEventListener('change', this._selChanged.bind(this));
  if (this.setting.mode=='binal') this.elt.querySelector('.sel-field-panel').style.display='none';

  const fieldsPanel = this.elt.querySelector('.fields-panel');
  this.setting.fields.forEach((f)=>{
    this.rangeSliders[f.name] = createField(fieldsPanel, f, this.__change.bind(this));
  }, this);
  this.opacitySliders = {};
  const opacitiesPanel = this.elt.querySelector('.opacity-panel');
  this.setting.opacities.forEach((f)=>{
    this.opacitySliders[f.name] = createOpacities(opacitiesPanel, f, this.__opacityChange.bind(this));
  }, this);

  const colorsLegendPanel = this.elt.querySelector('.colors-legend-panel');
  // min max logic for valid number of intervals
  $(colorsLegendPanel).find('#legendIntervals').on('change', function(e) {
    const min=parseFloat($(this).attr('min'));
    const max=parseFloat($(this).attr('max'));
    const curr=parseFloat($(this).val());
    if (curr > max) {
      $(this).val(max); var changed=true;
    }
    if (curr < min) {
      $(this).val(min); var changed=true;
    }
    if (changed) {
      $warning = $(colorsLegendPanel).find('.warning');
      $warning.text('Only values in ' + min + ' through ' + max + ' allowed.');
      $warning.show();
      $warning.fadeOut(4500);
    }
  });

  const legendIntervalsInput = colorsLegendPanel.querySelector('#legendIntervals');
  // Setting default value of intervals
  legendIntervalsInput.value =
    this.setting.mode === 'gradient' ? $CAMIC.viewer.heatmap._colors.length : 5;
  const noOfIntervals = legendIntervalsInput.value;

  const legendsContainer = colorsLegendPanel.querySelector('.legends');
  createIntervalInputs(legendsContainer, noOfIntervals, this._legendColorsChanged.bind(this) );
  legendIntervalsInput.addEventListener('change', ()=>{
    createIntervalInputs(legendsContainer, legendIntervalsInput.value, this._legendColorsChanged.bind(this));
    this._legendColorsChanged();
  });

  this._modeChanged(false);
};

// called when model panel checkbox value changes
HeatmapControl.prototype._modeChanged = function(flag = true) {
  const mode = this.elt.querySelector(`.mode-panel input[type=checkbox]`).checked;

  if (!mode) {// binal
    this.elt.querySelector('.color-panel').style.display='';
    this.elt.querySelector('.colors-legend-panel').style.display='none';
    this.elt.querySelector('.sel-field-panel').style.display='none';
    this.setting.fields.forEach( (f)=> {
      // statements
      this.rangeSliders[f.name].slider.parentNode.style.display='';
      this.rangeSliders[f.name].disabled(false);
    }, this);
  } else { // gradient
    this.elt.querySelector('.color-panel').style.display='none';
    this.elt.querySelector('.colors-legend-panel').style.display='';
    this.elt.querySelector('.sel-field-panel').style.display='';
    const selectedField = this.elt.querySelector('.sel-field-panel select').value;
    this.rangeSliders[selectedField].slider.parentNode.style.display='';
    this.rangeSliders[selectedField].disabled(false);
    this.setting.fields.forEach( (f)=> {
      // statements
      if (f.name !== selectedField) {
        this.rangeSliders[f.name].slider.parentNode.style.display='none';
        this.rangeSliders[f.name].disabled(true);
      }
    }, this);
  }
  if (flag) this.__change.call(this);
};
// To validate and update heatmap color in binal mode
HeatmapControl.prototype._colorChanged = function() {
  const color = this.elt.querySelector('#heatMapColor').value;
  if (cssHexRegExp.test(color)) {
    this.__change.call(this);
  }
};
// To validate and update heatmap colors in gradient mode
HeatmapControl.prototype._legendColorsChanged = function() {
  let valid = true;
  const colorLegendPanel = this.elt.querySelector('.colors-legend-panel');
  $(colorLegendPanel.querySelector('.legends'))
      .children()
      .each(function(index, colorDiv) {
        if (cssHexRegExp.test(colorDiv.querySelector('input').value)===false) {
          valid = false;
          return;
        }
      });
  if (valid) this.__change.call(this);
};

// called when selected value changed
HeatmapControl.prototype._selChanged = function(e) {
  const selectedField = this.elt.querySelector('.sel-field-panel select').value;
  this.rangeSliders[selectedField].slider.parentNode.style.display = '';
  this.rangeSliders[selectedField].disabled(false);
  this.setting.fields.forEach( (f)=> {
    // statements
    if (f.name !== selectedField) {
      this.rangeSliders[f.name].slider.parentNode.style.display = 'none';
      this.rangeSliders[f.name].disabled(true);
    }
  }, this);
  this.resize.call(this);
  this.__change.call(this);
};

// call function on resizing slider
HeatmapControl.prototype.resize = function() {
  this.setting.fields.forEach( (f) => {
    // statements
    this.rangeSliders[f.name].onResize();
  }, this);

  this.setting.opacities.forEach( (f) => {
    // statements
    this.opacitySliders[f.name].onResize();
  }, this);
};

// called when any element changes
HeatmapControl.prototype.__change = function() {
  if (this.setting.onChange && typeof this.setting.onChange === 'function') {
    const mode = this.elt.querySelector(`.mode-panel input[type=checkbox]`).checked;
    const color = this.elt.querySelector('#heatMapColor').value;
    const colorLegendPanel = this.elt.querySelector('.colors-legend-panel');
    const colors = getColors(colorLegendPanel.querySelector('.legends'));
    const fields = [];
    const field = {};
    const data = {
      mode: mode?'gradient':'binal',
      color: color,
      colors: colors,
    };

    if (!mode) {
      this.setting.fields.forEach( (f)=> {
        fields.push({name: f.name, range: this.rangeSliders[f.name].getValue()});
      });
      data.fields = fields;
    } else {
      const selectedField = this.elt.querySelector('.sel-field-panel select').value;
      field.name = selectedField;
      field.range = this.rangeSliders[selectedField].getValue();
      data.field = field;
    }
    this.setting.onChange(data);
    this.resize.call(this);
  }
};

// should get all elements that have classname "fields-panel"
// check if it works as return is missing
HeatmapControl.prototype.getThreshold = function() {
  elt.querySelectorAll('.fields-panel > div').filter((elt)=>{});
};

// update changed value of opacity to setting
HeatmapControl.prototype.__opacityChange = function() {
  if (this.setting.onChange && typeof this.setting.onChange === 'function') {
    const data = {};
    this.setting.opacities.forEach( (f) => {
      data[f.name] = this.opacitySliders[f.name].getValue()/100;
    });
    this.setting.onOpacityChange(data);
  }
};

// createSelect         - creates options for each field
function createSelect(sel, fields, currentField = null) {
  fields.forEach((field) => {
    const option = document.createElement('option');

    option.text = field.name;
    option.value = field.name;

    sel.add(option);
    if (currentField) sel.value = currentField;
  });
}
// createField          - creates fields and their sliders
function createField(container, field, changeFunc) {
  const div = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = field.name;
  const slider = document.createElement('input');
  slider.type = 'text';
  slider.name = field.name;
  // rangeSlider.
  div.appendChild(label);
  div.appendChild(slider);
  // field value catch
  field.value = field.value || field.range || [0.05, 0, 1];
  const rs = new rangeSlider({
    target: slider,
    values: {min: field.range[0]*100 >> 0, max: field.range[1]*100 >> 0},
    step: 1,
    range: true,
    tooltip: false,
    scale: false,
    labels: false,
    set: [field.value[0]*100 >> 0, field.value[1]*100 >> 0],
    onChange: changeFunc,
  });
  container.appendChild(div);
  return rs;
}
// createOpacities      - creates opacity field and it's slider
function createOpacities(container, field, changeFunc) {
  const div = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = field.name;
  const slider = document.createElement('input');
  slider.type = 'text';
  slider.name = field.name;
  // rangeSlider.
  div.appendChild(label);
  div.appendChild(slider);
  const rs = new rangeSlider({
    target: slider,
    values: {min: 0, max: 100},
    step: 1,
    range: false,
    tooltip: false,
    scale: false,
    labels: false,
    set: [field.value*100],
    onChange: changeFunc,
  });
  container.appendChild(div);
  return rs;
}
// createIntervalInputs - creates HTML Color inputs for given noOfIntervals
function createIntervalInputs(container, noOfIntervals, changeFunc) {
  // Empty the container
  let colors=[];
  while ( container.firstChild ) container.removeChild( container.firstChild );
  for (let i = 1; i <= noOfIntervals; i++) {
    const div = document.createElement('div');
    div.className = 'color-input-container';
    const label = document.createElement('label');
    label.textContent = `Interval ${i} `;
    label.className = 'color-input';
    const color = document.createElement('input');
    color.type = 'color';
    if (i <= $CAMIC.viewer.heatmap._colors.length) {
      color.value = $CAMIC.viewer.heatmap._colors[i - 1];
    } else {
      color.value = defaultColorList[i];
    }
    color.oninput = changeFunc;
    // Input for color legends.
    div.appendChild(label);
    div.appendChild(color);
    colors.push(color.value);
    container.appendChild(div);
  }
  $CAMIC.viewer.heatmap.setColors(colors);
}
// returns selected colors for intervals
function getColors(container) {
  const rs = [];
  $(container).children().each(function(index, colorDiv) {
    rs.push(colorDiv.querySelector('input').value);
  });
  return rs;
}
// returns index of color in defaultColorList for given position and no of intervals
function getGradientColorIndex(position, noOfIntervals) {
  return parseInt((position * (10 / noOfIntervals)) - 1);
}

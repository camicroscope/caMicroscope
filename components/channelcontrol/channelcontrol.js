// Per-channel color/contrast/enable + solo + saved-preset controls for
// multi-channel (fluorescence) slides. Built the same way as
// components/heatmapcontrol/heatmapcontrol.js: a plain function-constructor,
// DOM via template strings + querySelector, mount via `.elt`. The component
// only calls injected callbacks -- it never touches $CAMIC directly; the
// actual viewer mutation (CaMic.setChannelStyle, Store calls, etc.) happens
// in the app's uicallbacks.js, exactly like heatmapcontrol.js/layersviewer.js.
//
// Deliberately no opacity/weight slider: mctile's style.bands[] schema
// (camicroscope-mctile/app/sources/style.py) has no such field, so a control
// for it would silently do nothing server-side.
function ChannelControl(options) {
  this.name = 'ChannelControl';
  this.setting = {
    channels: [], // ChannelDescriptor.to_dict()[] from mctile's /meta
    style: null, // {bands:[{band,palette,min,max,enabled}], composite}
    presets: [], // [{id, name, style}]
    scopeAnnotations: false,
    onChange: null, // (style) => void
    onScopeToggle: null, // (enabled) => void
    onSavePreset: null, // (name, style) => void
    onLoadPreset: null, // (presetId) => void
    onDeletePreset: null, // (presetId) => void
  };

  extend(this.setting, options);

  this.elt = document.getElementById(this.setting.id);
  if (!this.elt && this.setting.element) {
    this.elt = this.setting.element;
  }
  if (!this.elt) {
    this.elt = document.createElement('div');
  }

  this._rows = {}; // channel.index -> {enableEl, swatchEl, rangeSlider}
  this._soloedIndex = null;
  this._preSoloEnabled = null; // cache of {index: enabled} before solo engaged

  this.__refresh();
}

/**
 * @private
 * find (or synthesize) the style band matching a given channel
 */
ChannelControl.prototype.__bandFor = function(channel) {
  const style = this.setting.style || {bands: []};
  const found = (style.bands || []).find((b) => b.band === channel.index);
  if (found) return found;
  return {
    band: channel.index,
    palette: channel.color || '#ffffff',
    min: channel.min != null ? channel.min : 0,
    max: channel.max != null ? channel.max : 65535,
    enabled: true,
  };
};

/**
 * @private
 * __refresh rebuilds the UI from this.setting
 */
ChannelControl.prototype.__refresh = function() {
  empty(this.elt);
  this.elt.classList.add('channelcontrol-container');

  const template = `
    <div class='channels-panel'></div>
    <div class='presets-panel'>
      <label>Channel Presets</label>
      <select class='presets-select'></select>
      <div class='presets-actions'>
        <input type='text' class='preset-name-input' placeholder='Preset name' />
        <button type='button' class='preset-save-btn'>Save</button>
        <button type='button' class='preset-load-btn'>Load</button>
        <button type='button' class='preset-delete-btn'>Delete</button>
      </div>
    </div>
    <div class='scope-panel'>
      <label><input type='checkbox' class='scope-toggle' ${this.setting.scopeAnnotations ? 'checked' : ''}/>
        Scope new annotations to enabled channels</label>
    </div>
  `;
  this.elt.innerHTML = template;

  this._rows = {};
  const channelsPanel = this.elt.querySelector('.channels-panel');
  this.setting.channels.forEach((channel) => {
    const band = this.__bandFor(channel);
    this._rows[channel.index] = createChannelRow(channelsPanel, channel, band, {
      onRowChange: this.__change.bind(this),
      onSolo: this.__soloChannel.bind(this),
    });
  }, this);

  createPresetSelect(this.elt.querySelector('.presets-select'), this.setting.presets);

  this.elt.querySelector('.preset-save-btn').addEventListener('click', () => {
    const nameInput = this.elt.querySelector('.preset-name-input');
    const name = nameInput.value.trim();
    if (!name) return;
    if (this.setting.onSavePreset) this.setting.onSavePreset(name, this.getStyle());
    nameInput.value = '';
  });
  this.elt.querySelector('.preset-load-btn').addEventListener('click', () => {
    const id = this.elt.querySelector('.presets-select').value;
    if (id && this.setting.onLoadPreset) this.setting.onLoadPreset(id);
  });
  this.elt.querySelector('.preset-delete-btn').addEventListener('click', () => {
    const id = this.elt.querySelector('.presets-select').value;
    if (!id) return;
    if (!confirm('Delete this channel preset?')) return;
    if (this.setting.onDeletePreset) this.setting.onDeletePreset(id);
  });

  this.elt.querySelector('.scope-toggle').addEventListener('change', (e) => {
    this.setting.scopeAnnotations = e.target.checked;
    if (this.setting.onScopeToggle) this.setting.onScopeToggle(e.target.checked);
  });
};

/**
 * reads the current row states into a style object. rangeSlider's
 * getValue() always returns a [0,1] fraction (see createChannelRow's
 * comment for why) -- map that fraction back to the channel's real
 * intensity range here.
 * @return {object} {bands:[{band,palette,min,max,enabled}], composite:'additive'}
 */
ChannelControl.prototype.getStyle = function() {
  const bands = this.setting.channels.map((channel) => {
    const row = this._rows[channel.index];
    const frac = row.rangeSlider.getValue(); // [0..1, 0..1]
    const span = row.rangeMax - row.rangeMin;
    return {
      band: channel.index,
      palette: row.swatchEl.value,
      min: row.rangeMin + frac[0] * span,
      max: row.rangeMin + frac[1] * span,
      enabled: row.enableEl.checked,
    };
  });
  return {bands, composite: 'additive'};
};

/**
 * @return {Array<number>} indices of currently-enabled channels
 */
ChannelControl.prototype.getEnabledChannelIndices = function() {
  return this.getStyle().bands.filter((b) => b.enabled).map((b) => b.band);
};

/**
 * Recomputes each row's rangeSlider geometry (sliderLeft/sliderWidth/
 * pointerWidth, and the derived drag `step`). Mirrors
 * HeatmapControl.prototype.resize. Required because ChannelControl is
 * constructed while its containing SideMenu is still closed -- SideMenu
 * hides content via `width:0`, not `display:none` (components/sidemenu/
 * sidemenu.js), so rangeSlider's own geometry read at construction time
 * (getBoundingClientRect()/clientWidth) sees a zero-width container,
 * producing `step=0` and every subsequent drag computing `index =
 * Math.round(x/0)` = Infinity, clamped to the array's max index -- i.e.
 * sliders permanently reporting the max value regardless of where they're
 * dragged. Call this once the panel is actually visible with real width
 * (see toggleChannelControl in apps/viewer/uicallbacks.js).
 */
ChannelControl.prototype.resize = function() {
  Object.keys(this._rows).forEach((k) => {
    this._rows[k].rangeSlider.onResize();
  });
};

/** called whenever any row control changes */
ChannelControl.prototype.__change = function() {
  const style = this.getStyle();
  this.setting.style = style;
  if (this.setting.onChange) this.setting.onChange(style);
};

/**
 * @private
 * toggles solo mode for a channel: isolates it (all others disabled),
 * reversibly -- clicking the same channel's solo button again (or soloing a
 * different channel then this one) restores the pre-solo enabled state.
 */
ChannelControl.prototype.__soloChannel = function(index) {
  if (this._soloedIndex === index) {
    // un-solo: restore prior state
    Object.keys(this._rows).forEach((k) => {
      this._rows[k].enableEl.checked = !!this._preSoloEnabled[k];
    });
    this._soloedIndex = null;
    this._preSoloEnabled = null;
  } else {
    if (this._preSoloEnabled === null) {
      // first solo action: cache current state
      this._preSoloEnabled = {};
      Object.keys(this._rows).forEach((k) => {
        this._preSoloEnabled[k] = this._rows[k].enableEl.checked;
      });
    }
    Object.keys(this._rows).forEach((k) => {
      this._rows[k].enableEl.checked = (Number(k) === index);
    });
    this._soloedIndex = index;
  }
  this.__change();
};

// createPresetSelect - populates the preset dropdown (named distinctly from
// heatmapcontrol.js's own global createSelect(), since both are plain
// non-module scripts sharing window scope)
function createPresetSelect(sel, presets) {
  empty(sel);
  const placeholder = document.createElement('option');
  placeholder.text = presets.length ? 'Select a preset...' : 'No saved presets';
  placeholder.value = '';
  sel.add(placeholder);
  presets.forEach((preset) => {
    const option = document.createElement('option');
    option.text = preset.name;
    option.value = preset.id;
    sel.add(option);
  });
}

// createChannelRow - builds one channel's row: enable/color/solo header + a
// min/max contrast rangeSlider (reusing common/rangeslider/rangeslider.js,
// same widget heatmapcontrol.js's createField uses). The widget always
// divides onChange/getValue by 100 internally (see rangeslider.js:295,314),
// so both `values`/`set` (in) and the read-back via getValue() (out) are
// scaled by *100 -- exactly the same convention heatmapcontrol.js already
// relies on for its own [0,1]-fraction sliders, generalized here to raw
// per-channel intensity ranges instead of [0,1] fractions.
function createChannelRow(container, channel, band, callbacks) {
  const row = document.createElement('div');
  row.className = 'channel-row';
  row.dataset.band = channel.index;

  const header = document.createElement('div');
  header.className = 'channel-row-header';

  const enable = document.createElement('input');
  enable.type = 'checkbox';
  enable.checked = band.enabled !== false;
  enable.addEventListener('change', callbacks.onRowChange);

  const swatch = document.createElement('input');
  swatch.type = 'color';
  swatch.value = band.palette || channel.color || '#ffffff';
  swatch.addEventListener('input', callbacks.onRowChange);

  const label = document.createElement('label');
  label.className = 'channel-row-label';
  label.textContent = channel.name || `Channel ${channel.index}`;
  label.title = channel.fluorophore ? `${channel.name} (${channel.fluorophore})` : channel.name;

  const solo = document.createElement('i');
  solo.className = 'material-icons channel-solo-btn';
  solo.textContent = 'filter_center_focus';
  solo.title = 'Solo this channel';
  solo.addEventListener('click', () => callbacks.onSolo(channel.index));

  header.appendChild(enable);
  header.appendChild(swatch);
  header.appendChild(label);
  header.appendChild(solo);

  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'channel-range-slider';
  const sliderInput = document.createElement('input');
  sliderInput.type = 'text';
  sliderWrap.appendChild(sliderInput);

  const maxVal = channel.max != null ? channel.max :
    (channel.bit_depth ? (2 ** channel.bit_depth) - 1 : 65535);
  const minVal = channel.min != null ? channel.min : 0;
  const setLow = band.min != null ? band.min : minVal;
  const setHigh = band.max != null ? band.max : maxVal;
  const span = maxVal - minVal || 1;

  // rangeSlider's getValue()/onChange() always divide the underlying array
  // *index* by 100 (see common/rangeslider/rangeslider.js:295,313-314) --
  // that only recovers a correct value when the array has exactly one entry
  // per integer index, i.e. step===1. So this widget can only ever be driven
  // as a fixed 0-100 percentage (matching heatmapcontrol.js's own only usage
  // pattern) -- never with real-world units directly, and never with a
  // coarser step (a real per-channel step, e.g. step=100 for "1 intensity
  // unit per step" over a 0-65535 range, would both return values 100x too
  // small AND force rangeSlider to build a multi-million-entry array via
  // prepareArrayValues(), which is a real performance problem at this scale).
  // getStyle() maps the returned [0,1] fraction back to [minVal,maxVal].
  const rs = new rangeSlider({
    target: sliderInput,
    values: {min: 0, max: 100},
    step: 1,
    range: true,
    tooltip: false,
    scale: false,
    labels: false,
    set: [
      Math.round((setLow - minVal) / span * 100),
      Math.round((setHigh - minVal) / span * 100),
    ],
    onChange: callbacks.onRowChange,
  });

  row.appendChild(header);
  row.appendChild(sliderWrap);
  container.appendChild(row);

  return {enableEl: enable, swatchEl: swatch, rangeSlider: rs, rangeMin: minVal, rangeMax: maxVal};
}

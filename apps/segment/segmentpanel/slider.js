// Initializing class definition
class Slider {

  constructor(divOptions, sliderOptions) {
    this._divId = divOptions.id;
    this._divClass = divOptions.class;
    this._divStyle = divOptions.style;

    this._sliderId = sliderOptions.id;
    this._sliderLabel = sliderOptions.labelFor;
    this._sliderMin = sliderOptions.min;
    this._sliderMax = sliderOptions.max;
    this._sliderStep = sliderOptions.step;
    this._sliderValue = sliderOptions.value;
    this._sliderLabelInputId = sliderOptions.labelInputId;
    this._sliderDefaultValue = sliderOptions.defaultValue;
    this._divOptions = divOptions;
    this._sliderOptions = sliderOptions;


  }

  // Return html string
  getHtml() {
    let style;
    if (this._divStyle)
    {
      style = `style="${this._divStyle}"`;
    }

    let html = `<div id="${this._divId}" class="${this._divClass}" ${style}>
      <label for="${this._sliderLabel}">${Slider.capitalizeFirstLetter(this._sliderLabel)}</label><input type="range" id="${this._sliderId}" min="${this._sliderMin}" max="${this._sliderMax}" step="${this._sliderStep}" value="${this._sliderValue}"><label id="${this._sliderLabelInputId}">${this._sliderDefaultValue}</label>
    </div>`;

    return html;

  }

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Getters and Setters
  get divOptions() {
    return this._divOptions;
  }

  set divOptions(value) {
    this._divOptions = value;
  }

  get sliderOptions() {
    return this._sliderOptions;
  }

  set sliderOptions(value) {
    this._sliderOptions = value;
  }

  get divId() {
    return this._divId;
  }

  set divId(value) {
    this._divId = value;
  }

  get divClass() {
    return this._divClass;
  }

  set divClass(value) {
    this._divClass = value;
  }

  get divStyle() {
    return this._divStyle;
  }

  set divStyle(value) {
    this._divStyle = value;
  }

  get sliderId() {
    return this._sliderId;
  }

  set sliderId(value) {
    this._sliderId = value;
  }

  get sliderLabel() {
    return this._sliderLabel;
  }

  set sliderLabel(value) {
    this._sliderLabel = value;
  }

  get sliderMin() {
    return this._sliderMin;
  }

  set sliderMin(value) {
    this._sliderMin = value;
  }

  get sliderMax() {
    return this._sliderMax;
  }

  set sliderMax(value) {
    this._sliderMax = value;
  }

  get sliderStep() {
    return this._sliderStep;
  }

  set sliderStep(value) {
    this._sliderStep = value;
  }

  get sliderValue() {
    return this._sliderValue;
  }

  set sliderValue(value) {
    this._sliderValue = value;
  }

  get sliderLabelInputId() {
    return this._sliderLabelInputId;
  }

  set sliderLabelInputId(value) {
    this._sliderLabelInputId = value;
  }

  get sliderDefaultValue() {
    return this._sliderDefaultValue;
  }

  set sliderDefaultValue(value) {
    this._sliderDefaultValue = value;
  }

}

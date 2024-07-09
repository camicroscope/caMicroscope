/**
 * CaMicroscope Logs Viewer. A component that shows logs of annotation by timeline.
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a Layer Manager.
 * @param {String} options.id
 *        Id of the element to append the Layer Manager's container element to.
 * @param {Object[]} options.data
 *        the data set of the layers.
 * @param {String} options.data.id
 *        layer's id
 * @param {String} options.data.name
 *        layer's name
 * @param {String} options.data.typeId
 *        layer's type id
 * @param {String} options.data.typeName
 *        layer's type name
 *
 */
function LogsViewer(options) {
  this.className = 'LogsViewer';
  this.setting = {
    // id: doc element
    // data: layers dataset
    // categoricalData
    isSortableView: false,
  };
  // setting dataset
  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.className}: No Main Elements...`);
    return;
  }
  this.elt.classList.add('logs_viewer');
  empty(this.elt);
  const usuDiv = document.createElement('div');
  usuDiv.classList.add('usulist');
  usuDiv.style.display = 'block';
  usuDiv.innerHTML = `<div>Hello World!</div>`;
  this.elt.appendChild(usuDiv);
}

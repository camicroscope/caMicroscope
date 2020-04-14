(function($) {
  if (!$.version || $.version.major < 2) {
    throw new Error('This version of OpenSeadragonScalebar requires ' +
                'OpenSeadragon version 2.0.0+');
  }
  $.Viewer.prototype.rotationBar = function(options) {
    options = options || {};
    options.viewer = this;
    this.rotateBar = new $.RotationBar(options);
  };
  $.RotationBar = function(options) {
    options = options || {};
    if (!options.viewer) {
      throw new Error('A viewer must be specified.');
    }
    this.viewer = options.viewer;
    this.divElt = document.createElement('div');
    console.log(this.viewer.navigator.element.parentElement);
    this.viewer.navigator.element.parentElement.appendChild(this.divElt);
    this.divElt.className = 'Rotation';
    this.roticon = document.createElement('div');
    this.roticon.classList.add('material-icons');
    this.roticon.classList.add('md-24');
    this.roticon.classList.add('loop');
    this.roticon.textContent = 'loop';
    this.roticon.style.marginLeft = '2px';
    this.roticon.style.fontSize = '2rem';
    this.roticon.style.marginBottom = 'auto';
    this.roticon.style.marginTop = 'auto';
    this.roticon.style.padding = '2px';
    this.range = $.makeNeutralElement( 'input' );
    this.range.type = 'range';
    this.range.min = '-180';
    this.range.max = '180';
    this.range.value = '0';
    this.range.style.width = '78%';
    this.range.style.height = '2.4rem';
    this.range.style.marginLeft = '4px';
    this.idxR = document.createElement( 'div' );
    this.idxR.classList.add('idxR');
    this.txtR = document.createElement('div');
    this.txtR.classList.add('txtR');
    this.txtR.innerHTML = '0';
    this.degree = document.createElement('sup');
    this.degree.innerHTML = 'o';
    this.degree.style.marginLeft = '2px';
    this.txtR.appendChild(this.degree);
    this.idxR.appendChild(this.txtR);
    this.divElt.appendChild(this.roticon);
    this.divElt.appendChild(this.range);
    this.divElt.appendChild(this.idxR);
    const idk=this.txtR;
    const sup = this.degree;
    const view = this.viewer;
    this.range.oninput = function() {
      idk.innerHTML = this.value;
      idk.appendChild(sup);
      var intValue = parseInt(this.value);
      view.viewport.setRotation(intValue);
    };
  };
}(OpenSeadragon));

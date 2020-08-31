// <div id="myModal" class="modal">

//   <!-- Modal content -->
//   <div class="modal-content">
//     <div class="modal-header">
//       <span class="close">&times;</span>
//       <h2>Modal Header</h2>
//     </div>
//     <div class="modal-body">
//       <p>Some text in the Modal Body</p>
//       <p>Some other text...</p>
//     </div>
//     <div class="modal-footer">
//       <h3>Modal Footer</h3>
//     </div>
//   </div>

// </div>
function ModalBox(options) {
  this.name = 'ModalBox';
  // DOM elts
  /**
     * @property {Element} elt The element to append the toolbar's container element to.
     */
  this.elt;

  //
  this.setting = {
    hasHeader: true,
    hasFooder: true,

  };
  extend(this.setting, options);

  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.name}:No Main Container...`);
    return;
  }

  this.__create();
  this.__close.addEventListener('click', this.close.bind(this));
  window.onclick = function(event) {
    if (event.target == this.elt) this.close();
  }.bind(this);
}
ModalBox.prototype.__create = function() {
  function createHeater(text) {
    const header = document.createElement('div');
    header.classList.add('modalbox-header');
    const title = document.createElement('div');
    title.textContent = text;
    const close = document.createElement('span');
    close.textContent = 'x';
    close.classList.add('close');
    header.appendChild(close);
    header.appendChild(title);

    return header;
  }
  function createFooter(text) {
    const footer = document.createElement('div');
    footer.classList.add('modalbox-footer');
    const title = document.createElement('h4');
    title.textContent = text;
    footer.appendChild(title);
    return footer;
  }
  empty(this.elt);
  this.elt.classList.add('modalbox');
  const content = document.createElement('div');
  content.classList.add('modalbox-content');
  if (this.setting.hasHeader) content.appendChild(createHeater(this.setting.headerText));
  this.body = document.createElement('div');
  this.body.classList.add('modalbox-body');
  if (this.setting.provideContent) {
    this.body.innerHTML = this.setting.content;
  }
  content.appendChild(this.body);
  if (this.setting.hasFooter) content.appendChild(createFooter(this.setting.footerText));

  this.elt.appendChild(content);
  this.__close = this.elt.querySelector('.modalbox-header .close');
};
ModalBox.prototype.open = function() {
  this.elt.style.display = 'block';
};
ModalBox.prototype.close = function() {
  this.elt.style.display = 'none';
};
ModalBox.prototype.setBody=function() {

};
ModalBox.prototype.appendBody=function() {

};
ModalBox.prototype.setHeaderText = function(text) {
  this.elt.querySelector('.modalbox-header > div').textContent = text;
};
ModalBox.prototype.setFooterText = function(text) {

};

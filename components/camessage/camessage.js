// proposal:
//
// enhancement
// 1. add options to set the position such as top-right, top-left, bottom-right, bottom-left.
// 2. add functionality that message panel can show detail info.


/**
 * CaMicroscope CaMessage. A message component that show the message permanently or temporarily
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a CaMessage.
 * @param {String} options.id
 *        Id of the element to append the CaMessage's container element to.
 */
function CaMessage(options) {
  this.name = 'CaMessage';
  /**
     * @property {Element} elt The element to append the CaMessage's container element to.
     */
  this.elt;
  this.setting = {
    opened: false,
  };
  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.name}: No Main Element...`);
    return;
  }

  this.elt.classList.add('camessage');
  this.__createMessageElt();
}

/**
 *  reset the message's content to default
 */
CaMessage.prototype.__createMessageElt = function() {
  //
  const strHeader = `<div class='message-head' ${this.setting.metadata?'':'style="padding:.4rem 0;"'}>
  <div class='row'>
    <div>
      <span>${this.setting.content.key}</span>
      <strong>${this.setting.content.value}</strong></div>
    </div>
    ${this.setting.metadata?`<div class='material-icons'>${this.setting.opened?'keyboard_arrow_up':'keyboard_arrow_down'}</div>`:``}
  </div>`;

  const strContent = this.setting.metadata?`<div class='message-content' style='display:${this.setting.opened?null:'none'}'>${this.__createContent()}</div>`:'';

  this.elt.innerHTML =`${strHeader}${strContent}`;
  if (this.setting.metadata) {
    const icon = this.elt.querySelector('.material-icons');
    const content = this.elt.querySelector('.message-content');
    icon.addEventListener('click', (e)=>{
      if (icon.textContent == 'keyboard_arrow_down') {
        icon.textContent = 'keyboard_arrow_up';
        content.style.display = null;
      } else {
        icon.textContent = 'keyboard_arrow_down';
        content.style.display = 'none';
      }
    });
  }
};

CaMessage.prototype.__createContent = function() {
  const metadata = this.setting.metadata;
  const rows = [];
  for (const [key, value] of Object.entries(metadata)) {
    rows.push(`<div class='row'><div class='title'>${key}</div><div class='text'>${value}</div></div>`);
  }
  return `<div class='message-body'>${rows.join('')}</div>`;
};

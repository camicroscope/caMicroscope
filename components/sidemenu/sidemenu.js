// proposal:
// TODO list:
// customize position - top, bottom, right, left.
// customize width/height based on position.
// test:
// construtor:
// width, isOpen,
// 
// method:
// open()
// close()
// addContent(string/elt);
// 

/**
 * CaMicroscope Side Menu. description
 * @constructor
 * @param {Object} options 
 *        All required and optional settings for instantiating a new instance of a Side Menu.
 * @param {String} options.id
 *        Id of the element to append the Side Menu's container element to.
 * @param {String} [options.width=300]
 *        the width of the Side Menu's container.
 * @param {Boolean} [options.isOpen=false]
 *        initialized status for menu. is open or not.
 * @param {Function({opt.target,opt.isOpen})} [options.callback]
 *        toggle if the side menu is open or close. opt.target - current menu. opt.isOpen - true:open, false:close.
 * 
 */
function SideMenu(options){
	this.name ='SideMenu';
	
	/**
     * @property {Element} elt The element to append the side menu's container element to.
     */
	this.elt = null;
	
	/**
     * @property {Element} _close_handler The elements that reperesent the close handler.
     */
	this._close_handler = null; // click to close panel
	
	/**
     * @property {Element} _close_handler The elements that reperesent the content of the menu.
     */
	this._content = null;

	// default setting
	this.setting = {
		//id: container id
		// menu heigh defalut is flex
		// menu width
		width:300,
		// menu initial status
		isOpen:false
	}
	
	// user setting
	extend(this.setting, options);
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt){
		console.error(`${this.name}:No Main Container...`);
		return;
	}

	// create UI 
	this.__refresh();
	
	// add close event
	this._close_handler.addEventListener('click',this.close.bind(this));


	if(this.setting.isOpen) this.open();
	//initialInnerMenu
	//if(this.setting.id=='side_apps')this.initialInnerMenu();
}

/**
 * Render UI based on the options.
 * 
 */
SideMenu.prototype.__refresh = function(){
	// remove all children
	empty(this.elt);

	this.elt.style.width = 0;
	this.elt.style.left = `-10px`;
	this.elt.classList.add('side_menu');
	this.elt.classList.add('flex-container');

	// create 'close' hand
	this._close_handler = document.createElement('div');
	this._close_handler.classList.add('close');

	const icon1 = document.createElement('i');
	icon1.classList.add('material-icons');
	icon1.classList.add('md-24');
	icon1.textContent = 'chevron_left';
	
	const icon2 = icon1.cloneNode(true);
	icon2.classList.add('sec');

	this._close_handler.appendChild(icon1);
	this._close_handler.appendChild(icon2);
	this.elt.appendChild(this._close_handler);
	
	// create side panel content panel
	this._content = document.createElement('div');
	this._content.classList.add('side_content');
	this._content.classList.add('flex-container');
	this.elt.appendChild(this._content);

};

/**
 * open the side menu
 */
SideMenu.prototype.open = function() {
	this.elt.style.left = 0; 
	this.elt.style.width = this.setting.width+'px';

	if(this.setting.callback) this.setting.callback.call(this,{
		target:this.elt,
		isOpen:true
	});
};
/**
 * close the side menu
 */
SideMenu.prototype.close = function() {
	this.elt.style.left = `-10px`; 
	this.elt.style.width = 0;
	if(this.setting.callback) this.setting.callback.call(this,{
		target:this.elt,
		isOpen:false
	});
};
/**
 * add a content on the side menu.
 * @param {String|Element} element the element, text content, or HTML template that be added.
 */
SideMenu.prototype.addContent = function(elt){
	const content = this._content;
	if(elt instanceof Element)
		content.appendChild(elt); 
	// if(typeof element ==='string')
	// 	this._content.textcontent = element; 
	if(typeof elt === 'string') {
		const div = document.createElement('div');
		div.innerHTML = elt;
		const childern = [...div.children];
		childern.forEach(child =>{
			content.appendChild(child);	
		})
	};
};
/**
 * clear all content on the side menu.
 */
SideMenu.prototype.clearContent = function(){
	empty(this._content);
}

// addContent(DOM Element);
// TODO list:
// customize position - top, bottom, right, left.
// customize width/height based on position.
// set isAnimate

/**
 * CaMicroscope Side Menu. description
 * @constructor
 * @param {Object} options 
 *        All required and optional settings for instantiating a new instance of a Side Menu.
 * @param {String} options.id
 *        Id of the element to append the Side Menu's container element to.
 * @param {Boolean} [options.contentPadding] 
 *        set the padding for the content of the side menu.
 * @param {Function(elt:Element, isOpen:Boolean)} [options.callback]
 *        toggle if the side menu is open or close.
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
	if(this.setting.contentPadding)
		this._content.style.padding = this.setting.contentPadding+'px';
	this.elt.appendChild(this._content);

};

/**
 * open the side menu
 */
SideMenu.prototype.open = function() {
	this.elt.style.width =this.setting.width+'px';
	if(this.setting.callback) this.setting.callback.call(this,{
		target:this.elt,
		isOpen:true
	});
};
/**
 * close the side menu
 */
SideMenu.prototype.close = function() {
	this.elt.style.width ='0';
	if(this.setting.callback) this.setting.callback.call(this,{
		target:this.elt,
		isOpen:false
	});
};
/**
 * add a content on the side menu.
 * @param {String|Element} element the element, text content, or HTML template that be added.
 */
SideMenu.prototype.addContent = function(element){
	if(element instanceof Element)
		this._content.appendChild(element); 
	if(typeof element ==='string')
		this._content.textcontent = element; 

};
/**
 * clear all content on the side menu.
 */
SideMenu.prototype.clearContent = function(){
	empty(this._content);
}

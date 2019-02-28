// popuppanel.js
// porposal:
// test:
// constructor:
// open
// close
// set title
// set body - map
// set body - table
// action callback

/**
 * @constructor
 * A popup panel to help display the extra or detail information.
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a popup panel.
 * @param {Array} [options.footer]
 *        An array of footers. each footer should represent of a action btn
 * @param {String} [options.footer.title]
 *                 The text of hint on the action btn.   
 * @param {String} [options.footer.class]
 *                 The css class on teh action btn   
 * @param {String} [options.footer.text]
 *                 The text of action btn
 * @param {Function} [options.footer.callback]
 *                   The callback function of the action btn.
 * @param {String} options.title
 *                 the text of title.
 * @param {HTML element} options.body
 *                       the html element of body.
 * @param {String} options.bodyHTML
 *                       the stringified HTML elements.
 */
function PopupPanel(options){
	this.className = 'PopupPanel';
	
	
	/**
	 * @property {Element} elt The elements that reperesent the container of the compoment.
	 */
	this.elt = null;
	
	/**
	 * @property {Element} the element of the title. change the textContent will change the title of PopupPanel.
	 */
	this.title;
	
	/**
	 * @property {Element} the element of the body. The detail/extra info shows on popup panel.
	 */
	this.body;
	
	/**
	 * @property {Array} [footerBtns] the extend for popup if needs some actions. etc, delete/add/modify.
	 */
	this.footerBtns = [];

	/**
	 * @property {Object} setting
	 *           
	 */
	this.setting = {
		title:'',
		bodyHTML:'',
		zIndex:650,
		footer:[
		// {
		// 	type:'btn',
		// 	title:'Annotation',
		// 	class:'material-icons',
		// 	text:'description',
		// 	callback:saveAnnotation
		// },{

		// }
		],
	}
	extend(this.setting, options);

	this.elt = document.getElementById(this.setting.id);
	if(!this.elt && this.setting.element){
		this.elt = this.setting.element;
	}

	if(!this.elt){
		// create main
		this.elt = document.createElement('div');
		document.body.appendChild(this.elt);

	}
	//this.elt.style.width = `${this.setting.width}px`;
	this.elt.style.zIndex = this.setting.zIndex;
	this.elt.style.display = 'none';
	this.elt.classList.add('pop-panel');
	// create UI 
	this.__refresh();
}

/**
 * @private 
 * refresh compoment bases on the setting.
 */
PopupPanel.prototype.__refresh = function(){
	empty(this.elt);
	
	this.footerBtns = [];

	/* create header */
	const header = document.createElement('div');
	header.classList.add('pop-panel-header');

	// head title
	const headTitle = document.createElement('div');
	headTitle.classList.add('pop-panel-header-title');
	headTitle.textContent = this.setting.title;
	header.appendChild(headTitle);
	this.title = headTitle;
	// close btn
	const closeDiv = document.createElement('div');
	closeDiv.classList.add('material-icons');
	closeDiv.textContent = 'close';
	header.appendChild(closeDiv);
	// close event
	closeDiv.addEventListener('click', this.close.bind(this))

	this.elt.appendChild(header);


	/* create body */
	const body = document.createElement('div');
	this.data = null;
	body.classList.add('pop-panel-body');
	
	if(this.setting.body) {
		body.appendChild(PopupPanel.createBodyContent(this.setting.body))
	}else{
		body.innerHTML = this.setting.bodyHTML;
	}
	this.body = body;
	this.elt.appendChild(body);
	/* create footer */
	const footer = document.createElement('div');
	footer.classList.add('pop-panel-footer');

	// create all foot btns
	const btns = this.setting.footer;
	for (var i = 0; i < btns.length; i++) {
		this.footerBtns.push(PopupPanel.createBtn(footer,btns[i],this));
	}
	this.elt.appendChild(footer);

}

/**
 * open - popup the panel.
 * @param  {Object} point
 *         the point represents the position where the panel is
 */
PopupPanel.prototype.open = function(point){
	if(!point || !point.x || !point.y){
		console.error('invalid point');
		return;
	}
	this.elt.style.display = 'block';
	if( window.innerWidth > point.x + this.elt.offsetWidth){
		this.elt.style.left = point.x+'px';
	}else{
		this.elt.style.left = (point.x - this.elt.offsetWidth)+'px';
	}

	if(window.innerHeight > point.y + this.elt.offsetHeight){
		this.elt.style.top = point.y+'px';
	}else{
		this.elt.style.top = (point.y - this.elt.offsetHeight)+'px';
	}

}

/**
 * setTitle set the title of the panel
 * @param {String} text title's text
 */
PopupPanel.prototype.setTitle = function(text){
	// clear body
	empty(this.title);
	// create body
	this.title.textContent = text;
}
PopupPanel.prototype.hideFooter = function(){
	const footer = this.elt.querySelector('.pop-panel-footer');
	if(footer) footer.style.display = 'none';
	
}
PopupPanel.prototype.showFooter = function(){
	const footer = this.elt.querySelector('.pop-panel-footer');
	if(footer) footer.style.display = '';	
}
/**
 * setBody set the display body part.
 * @param {Object} body
 *        the object of body includes the type of body and the data of body.
 *        
 * @param {string} body.type
 *        'map' - key,value pair.
 *        'table' - multiple columns and rows.
 *        
 * @param {data} body.data
 *        there are two types of body. 
 *        'map' - key,value pair.
 *        	[{ 
 *        		key,
 *        		value,
 *        	},...]
 *        'table' - multiple columns and rows.
 *        [{ 
 *        		col1,
 *        		col2,
 *        		...
 *        	},...]    
 */
PopupPanel.prototype.setBody = function(body){
	// clear body
	empty(this.body);

	// create body
	this.body.appendChild(PopupPanel.createBodyContent(body));
}

/**
 * close close the panel.
 */
PopupPanel.prototype.close = function(){
	this.elt.style.display = 'none';
	this.elt.style.top = '-1000px';
	this.elt.style.left = '-1000px';
}

/**
 * @static
 * createTable - a static method to handle the data of the body
 * @param {string} body.type
 *        'map' - key,value pair.
 *        'table' - multiple columns and rows.
 *        
 * @param {data} body.data
 *        there are two types of body. 
 *        'map' - key,value pair.
 *        	[{ 
 *        		key,
 *        		value,
 *        	},...]
 *        'table' - multiple columns and rows.
 *        [{ 
 *        		col1,
 *        		col2,
 *        		...
 *        	},...]  
 * @return {HTML Element} A table style element
 */
PopupPanel.createBodyContent = function(opt){
	let content;

	switch (opt.type) {
		case 'table':
			// create table-like content
			content = PopupPanel.createTable(opt.data);
			break;
		case 'map':
			// create key-value content
			content = PopupPanel.createMap(opt.data);
			break;
		default:
			// statements_def
			break;
	}
	return content;
}

/**
 * @static
 * createTable - a static method to handle the table type of data and generate the format data for the body.
 * @param  {data} table data
 *        'table' - multiple columns and rows.
 *        [{ 
 *        		col1,
 *        		col2,
 *        		...
 *        	},...]                
 * @return {HTML Element} A table style element
 */
PopupPanel.createTable = function(data){
	const table = document.createElement('div');
	table.classList.add('table');
	for (var i = 0; i < data.length; i++) {
		const row = data[i];
		// create row div and add into table div
		const tr = document.createElement('div');
		tr.classList.add('row');
		table.appendChild(tr);
		for (var i = 0; i < row.length; i++) {
			const cell = row[i];
			// create cell div and add into row div
			const td = document.createElement('div');
			td.classList.add('value');
			td.textContent = cell;
			tr.appendChild(td);
		}
	}
	return table;
}

/**
 * @static
 * createMap - a static method to handle the map type of data and generate the format data for the body.
 * @param  {data} map data
 *        'map' - key,value pair.
 *        	[{ 
 *        		key,
 *        		value,
 *        	},...]               
 * @return {HTML Element} A map style element
 */
PopupPanel.createMap = function(data){
	const table = document.createElement('div');
	table.classList.add('table');
	for (var i = 0; i < data.length; i++) {
		const row = data[i];
		// create row div and add into table div
		const tr = document.createElement('div');
		tr.classList.add('row');
		table.appendChild(tr);

		// create key cell
		const key = document.createElement('div');
		key.classList.add('field');
		key.textContent = row.key || row.name;
		// create value cell
		const value = document.createElement('div');
		value.classList.add('value');
		value.textContent = row.value;
		
		tr.appendChild(key);
		tr.appendChild(value);
	}
	return table;
}
/**
 * @static
 * createBtn a factory method to create an action btn based on config operation
 * @param  {HTML Element} parent
 *                        The parent will be attached on
 * @param  {Object} opt
 *                  the options of the btn 
 * @param  {String} opt.title
 *                  the Title of the btn    
 * @param  {String} [opt.class]
 *                  the css class of the btn
 * @param  {String} opt.text
 *                  the display text of the btn
 * @param  {Function} opt.callback
 *                  the callback function of the btn              
 * @param  {} [thisArg=null]
 * @return {HTML Element} A btn element
 */
PopupPanel.createBtn = function(parent, opt, thisArg = null){
	const btn = document.createElement('button');
	btn.title = opt.title;
	btn.classList.add(opt.class);
	btn.textContent = opt.text;
	btn.addEventListener('click', function(e){
		opt.callback.call(null,thisArg.data);
	});
	parent.appendChild(btn);
	return btn;
}
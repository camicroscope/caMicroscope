// TODO list:
// setting id/element
// set icon size
// set tool bar position
// 
// proposal:
// test:
// constructor
// test different type of tools - btn, check, radio, dropdown
// changeMainToolStatus
// collapse/ expand sub tools


/**
 * CaMicroscope Tool Bar. Currently, it shows at the top-left corner of the screen. It consists of Main Tools and Sub Tools.
 * Main Tools is formed of Apps and Layers. There is a callback function that return the status of Main Tools. 
 * Sub Tools can be customized by using optionsions. 
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a CaToolbar.
 * 
 * @param {String} options.id
 *        Id of the element to append the toolbar's container element to.
 *        
 * @param {Function} [options.mainToolsCallback]
 *        Callback function that toggles if the main tools click.
 *
 * @param {Object[]} options.subTools
 * @param {String} options.subTools.icon
 *        the name of material-icons for the subtools' icon. 
 * @param {String} [options.subTools.title]
 *        The information is most often shown as a tooltip text when the mouse moves over the subTools.
 * @param {String} options.subTools.type 
 *        The behavior of tool looks like. Currently, Support 4 types of sub tools. 
 *        	'btn' - button  
 *        	'check' - check box 
 *        	'radio' - radio button 
 *        	'dropdown' - dropdown list
 * @param {String} options.subTools.value 
 *        Callback function will return this value if click on a sub tool.
 * @param {Object[]} [options.subTools.dropdownList]
 *        Only needed if subTools.type is 'dropdown'.
 *        Each downdown item is a checkbox, which can set 
 * @param {Object[]} options.subTools.dropdownList.icon
 *        the name of material-icons for the subtools' icon. 
 * @param {Object[]} [options.subTools.dropdownList.title]
 *        a tooltip text when the mouse moves over the item of the dropdown list.
 * @param {Object[]} options.subTools.dropdownList.value
 *        Callback function will return this value if the status of the dropdown list changed.
 * @param {Object[]} [options.subTools.dropdownList.checked = False]
 *        the item of the dropdown list is checked or not.
 * @param {Function} options.subTools.callback
 *        Callback Function that toggles if tool is active such as click(button), changing status(check/radio/dropdown), return a object which has value and status.
 * 
 */
function CaToolbar(options){
	this.name = 'CaToolbar';
	// DOM elts
	/**
     * @property {Element} elt The element to append the toolbar's container element to.
     */
	this.elt;
	/**
     * @property {Element[]} _main_tools The elements that reperesent each main tools.
     */
	this._main_tools = [];
	/**
     * @property {Element[]} _sub_tools The elements that reperesent each sub tools.
     */
	this._sub_tools = [];

	this.handler;
	// default setting
	this.setting = {
		zIndex:600,
		hasMainTools:true,
		// list pairs
		// btn -> event
		// may be it can be extension in future... 
		mainTools:[
			{
				icon:'apps',
				title:'Applications',
				type:'check',
				value:'apps'
			},
			{
				icon:'view_list',
				title:'Layers',
				type:'check',
				value:'layers'
			},
		]		
	}

	// setting options
	extend(this.setting, options);
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt){
		console.error(`${this.name}:No Main Container...`);
		return;
	}



	this.__refresh();
}
/*
 * @private
 * __create - create tool item and bind event based on options
 * @param  {Object} options - options that describes the type, style and behavior of the tool. 
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__create = function(options){

	switch (options.type) {
		case 'btn':
			// create button menu
			return this.__createBtn(options);
		case 'check':
			// create checkable menu
			return this.__createCheck(options);
		case 'radio':
			// create radio menu
			return this.__createRadio(options);
		case 'dropdown':
			// create dropdown menu
			return this.__createDropDown(options);
		case 'multistates':
			// create dropdown menu
			return this.__createMultiStateBtns(options);
		default:
			// return null if unvalid type
			return null;
	}
}

/*
 * @private
 * __createBtn - create tool as btn.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createBtn = function(options){
	if(!options) {
		console.warn(`${this.name}.__createBtn:No Option`);
		return;
	}
	// create UI
	const li = document.createElement('li');

	const btn = document.createElement('i');
	btn.classList.add('material-icons');
	btn.classList.add('md-24');
	btn.textContent = options.icon;
	if(options.title) btn.title = options.title;
	li.appendChild(btn);

	// binding event
	if(options.callback)li.addEventListener('click',function(e){
		// callback arguments
		const args = {};
		if(options.value) args.value = options.value;
		
		//
		options.callback.call(e, args);
	}.bind(this));
	
	return li;
}
/*
 * @private
 * __createCheck - create tool as checkbox.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createCheck = function(options){
	if(!options) {
		console.warn(`${this.name}.__createCheck:No Option`);
		return;
	}

	// create UI
	const li = document.createElement('li');

	// checkbox
	const id = randomId(); // create a timestamp id
	const chk = document.createElement('input'); 
	chk.id = id;
	chk.type = 'checkbox';
	if(options.name) chk.name = options.name;
	if(options.value) chk.value = options.value;
	if(options.checked) chk.checked = options.checked;
	li.appendChild(chk);

	// icon
	const icon = document.createElement('label');
	icon.classList.add('material-icons');
	icon.classList.add('md-24');
	icon.textContent = options.icon;
	icon.htmlFor = id;
	if(options.title) icon.title = options.title;
	li.appendChild(icon);

	// binding event
	if(options.callback)chk.addEventListener('click',function(e){
		// callback arguments
		const args = {};
		if(options.value) args.value = options.value;
		args.checked = chk.checked;
		//
		options.callback.call(e, args);
	}.bind(this));


	
	return li;
}

/*
 * @private
 * __createRadio - create tool as radio button.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createRadio = function(options){
	if(!options) {
		console.warn(`${this.name}.__createRadio:No Option`);
		return;
	}

	// create UI
	const li = document.createElement('li');

	// radio
	const id = randomId(); // create a timestamp id
	const radio = document.createElement('input'); 
	radio.id = id;
	radio.type = 'radio';
	radio.value = options.value;
	radio.checked = options.checked?true:false;
	if(options.id)radio.name = options.id; //

	li.appendChild(radio);

	// icon
	const icon = document.createElement('label');
	if(options.icon){
		icon.classList.add('material-icons');
		icon.classList.add('md-24');
		icon.textContent = options.icon;
	}else{
		const div = document.createElement('div');
		div.textContent = options.title;
		icon.appendChild(div);
	}

	icon.htmlFor = id;
	if(options.title) icon.title = options.title;
	
	li.appendChild(icon);
	
	// binding event
	if(options.callback)radio.addEventListener('click',function(e){
		// callback arguments
		const args = {};
		if(options.value) args.value = options.value;
		args.checked = radio.checked;
		//
		options.callback.call(e, args);
	}.bind(this));
	
	return li;
}


CaToolbar.prototype.__createMultiStateBtns = function(options){
	if(!options) {
		console.warn(`${this.name}.__createMultiStateBtns:No Option`);
		return;
	}
	// create UI
	const li = document.createElement('li');
	// btn
	const icon = document.createElement('label');
	icon.id = randomId(); // create a timestamp id
	icon.classList.add('material-icons');
	icon.classList.add('md-24');
	icon.classList.add(0);
	icon.dataset.state = 0;
	icon.textContent = options.icon;
	if(options.title) icon.title = options.title;
	li.appendChild(icon);
	icon.addEventListener('click', function(e){
		icon.classList.remove(`s${icon.dataset.state}`);
		icon.dataset.state++;
		if(icon.dataset.state == 3) icon.dataset.state = 0;
		icon.classList.add(`s${icon.dataset.state}`);
		
		const args = {};
		args.state = icon.dataset.state;
		
		options.callback.call(e, args);
	});

	return li;
}
/*
 * @private 
 * __createDropDown - create tool as dropdwon menu.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createDropDown = function(options){
	if(!options) {
		console.warn(`${this.name}.__createDropDown:No Option`);
		return;
	}
	// create UI
	const li = document.createElement('li');
	// checkbox
	const id = randomId(); // create a timestamp id
	const chk = document.createElement('input'); 
	chk.id = id;
	chk.type = 'checkbox';
	chk.checked = options.checked?true:false;
	li.appendChild(chk);

	// icon
	const icon = document.createElement('label');
	icon.classList.add('material-icons');
	icon.classList.add('md-24');
	icon.textContent = options.icon;
	icon.htmlFor = id;
	if(options.title) icon.title = options.title;
	li.appendChild(icon);

	// create drop_down
	const _drop = document.createElement('ul');
	_drop.classList.add('drop_down');

	//
	const lists = []; 
	for (var i = 0; i < options.dropdownList.length; i++) {
		options.dropdownList[i].id = id;
		const radio = this.__createRadio(options.dropdownList[i]);
		lists.push(radio);
		_drop.appendChild(radio);
	}
	li.appendChild(_drop);


	function getStatus(e){
		const args = {};
		args.value = options.value;
		args.checked = chk.checked;
		args.status = li.querySelector(`input[name=${id}]:checked`).value;
		options.callback.call(e, args);
	}


	// binding event
	if(options.callback){
		chk.addEventListener('change', getStatus.bind(this));
		lists.forEach( radio => radio.addEventListener('change',e=>{
			chk.checked = true;
			getStatus.call(this,e); 
		}));
	}
	
	return li;
}

/**
 * Render UI based on the options.
 * 
 */
CaToolbar.prototype.__refresh = function(){
	// detach elements
	empty(this.elt);
	this.elt.classList.add('ca_tools');
	
		const main_bar = document.createElement('ul');
		main_bar.classList.add('tools');
		main_bar.style.zIndex = this.setting.zIndex;
	if(this.setting.hasMainTools){
		// main tools

		let main_tools = this.setting.mainTools;
		for (var i = 0; i < main_tools.length; i++) {
			const options = main_tools[i];
			options.name = '_main_tools';
			const tool = this.__create(options);
			this._main_tools.push(tool);
			main_bar.appendChild(tool);
			options.__item = tool;
		}
		
		// main tools events
		const main_chks = main_bar.querySelectorAll('input[name=_main_tools]');
		main_chks.forEach(chk => chk.addEventListener('change', function(e){
			const args = {};
			main_chks.forEach(aChk =>{
				if(e.target.checked && e.target!== aChk) aChk.checked = false;
				args[aChk.value] = aChk.checked;
			});
			

			this.setting.mainToolsCallback.call(this,args);
		}.bind(this)));

		// separator
		const separator = document.createElement('li');
		separator.classList.add('separator');
		main_bar.appendChild(separator);
	}

	// sub tools
	let sub_tools = this.setting.subTools;
	for (var i = 0; i < sub_tools.length; i++) {
		const options = sub_tools[i];
		const tool = this.__create(options);
		if(!tool) continue;
		this._sub_tools.push(tool);
		main_bar.appendChild(tool);
		options.__item = tool;
	}


	// handler 
	this.handler = document.createElement('li');
	this.handler.classList.add('handler');
	
	const id = randomId();
	const handler_flag = document.createElement('input');
	handler_flag.id = id;
	handler_flag.type= 'checkbox';
	this.handler.appendChild(handler_flag);


	const handler_icon = document.createElement('label');
	handler_icon.htmlFor = id;
	handler_icon.classList.add('material-icons');
	handler_icon.textContent = 'keyboard_arrow_left';
	this.handler.appendChild(handler_icon);
	// create main m
	main_bar.appendChild(this.handler);

	this.elt.appendChild(main_bar);

	// add handler event
	this.handler.addEventListener('change', this.switch.bind(this))


}

/**
 * Change Main Tool's status by using tools value.
 * @param  {string} tool_value
 *         the value of a main tool.
 * @param  {boolean} checked
 *         the status of tool is checked or not.
 */
CaToolbar.prototype.changeMainToolStatus = function(tool_value, checked){
	const tool = this.setting.mainTools.find(item => item.value == tool_value);
	if(tool && tool.__item)
		tool.__item.querySelector('input[type=checkbox]').checked = checked;
};

/*
 * @private 
 * __menusChange - what is going on when click on the one of the main menu. 
 * @param  {Event} e - event parameter.
 */
CaToolbar.prototype.__menusChange = function(e){
	// default the mian menu is exclusive - show only one tool  
	this.menus.forEach( menu => {
		const targetId = menu.dataset.target;
		if(menu!== e.target) {
			menu.checked = false;
		}
	} );

	if(this.setting.mainToolsCallback) {
		const args = {};
		this.setting.mainToolsCallback.call(this, args)
	}
}

/*
 * @private 
 * switch - according to the handle status to expand/collapse the sub tools 
 */
CaToolbar.prototype.switch = function(e){
	if(this.handler.querySelector('input').checked){
		this.collapse();
	}else{
		this.expand();
	}
}

/* 
 * collapse - collapse sub tools.
 */
CaToolbar.prototype.collapse = function(){
	this.handler.querySelector('label').textContent = 'keyboard_arrow_right';
	this._sub_tools.forEach(btn => btn.style.display = 'none');
}

/*
 * expand - expand sub tools.
 */
CaToolbar.prototype.expand = function(){
	this.handler.querySelector('label').textContent = 'keyboard_arrow_left';
	this._sub_tools.forEach(btn => btn.style.display = '');
}

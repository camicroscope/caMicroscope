// multselector.js event: 'remove-all', 'remove', 'select-all', 'select', 'cancel', 'action'
// test:
// constructor
// event
// setData
//


/**
 * A MultSelector that provide multple selected functionality.
 *
 * Events:
 * 'remove-all', 'remove', 'select-all', 'select', 'cancel', 'action'
 *
 * Example:
 * const mult-selector = MultSelector({id:'test'});
 * mult-selector.addHandler('remove',function(data){});
 * mult-selector.removeHandler('select-all',function(data){});
 *
 * @param {Object} options
 *        settings for instantiating a new instance of a mult-selector.
 * @param {String} [options.id]
 *        The container id for mult-selector. The mult-selector's instance will be stored into this.elt if the id empty.
 * @param {Element} [options.element]
 *        The container as a html element.
 * @param {Array} [options.data]
 *        The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option].
 * @param {String} [options.title]
 *        The title of mult-selector
 * @param {Boolean} [options.hasControl='true']
 *        there are control btns such as 'cancel' and 'action' btns if parameter is true, vice versa.
 * @param {String} [options.cancelText='Cancel']
 *        The text of cancel btns
 * @param {String} [options.actionText='Action']
 *        The text of action btns
 *
 */
function MultSelector(options){
	this.className = 'MultSelector';
	this.elt;
	this.selectors;
	this.btns;
	this.setting = {
		//title:'a head title',
		hasControl:true,
		cancelText:'Cancel',
		actionText:'Action'
	}

	extend(this.setting, options);

	this.elt = document.getElementById(this.setting.id);
	if(!this.elt && options.element){
		this.elt = options.element;
	}

	if(!this.elt){
		// create main
		this.elt = document.createElement('div');
	}

	// create ui element
	this.__create();
	// prepare data
	if(this.setting.data) this.setData(this.setting.data);

	// add Event
	this.btns[0].addEventListener('click',this.__selectAll.bind(this));
	this.btns[1].addEventListener('click',this.__select.bind(this));
	this.btns[2].addEventListener('click',this.__remove.bind(this));
	this.btns[3].addEventListener('click',this.__removeAll.bind(this));

	if(this.setting.hasControl && this.cancel && this.action) {
		this.cancel.addEventListener('click', this.__cancel.bind(this))
		this.action.addEventListener('click', this.__action.bind(this))
	}
}


/**
 * @private
 * __create all HTML Elements based on setting/options.
 */
MultSelector.prototype.__create = function(){
	const elt = this.elt;
	elt.classList.add('multi-select-wrapper');
	// create title

	if(this.setting.title){
		this.head = document.createElement('div');
		this.head.classList.add('header');
		this.head.textContent = this.setting.title;
		elt.appendChild(this.head);
	}

	// create container
	const container = document.createElement('div');
	container.classList.add('multi-select-container');
	elt.appendChild(container);

	// create main select area
	const main = document.createElement('div');
	main.classList.add('main');
	container.appendChild(main);

	// create main selector
	const selMain = document.createElement('select');
	selMain.multiple = true;
	main.appendChild(selMain);

	// create control
	const ctrl = document.createElement('div');
	ctrl.classList.add('ctrl');
	container.appendChild(ctrl);

	// create control btns
	const selectAll = document.createElement('button');
	selectAll.classList.add('material-icons');
	selectAll.textContent = 'last_page';
	ctrl.appendChild(selectAll);

	const select = document.createElement('button');
	select.classList.add('material-icons');
	select.textContent = 'chevron_right';
	ctrl.appendChild(select);

	const remove = document.createElement('button');
	remove.classList.add('material-icons');
	remove.textContent = 'chevron_left';
	ctrl.appendChild(remove);

	const removeAll = document.createElement('button');
	removeAll.classList.add('material-icons');
	removeAll.textContent = 'first_page';
	ctrl.appendChild(removeAll);

	// create selected area
	const selected = document.createElement('div');
	selected.classList.add('selected');
	container.appendChild(selected);

	// create selected selector
	const selSelected = document.createElement('select');
	selSelected.multiple = true;
	selected.appendChild(selSelected);

	this.selectors = [selMain,selSelected];
	this.btns = [selectAll,select,remove,removeAll];

	// create ctrl btns
	if(this.setting.hasControl){
		this.footer = document.createElement('div');
		this.footer.classList.add('footer');
		this.cancel = document.createElement('button');
		this.cancel.textContent = this.setting.cancelText;
		this.action = document.createElement('button');
		this.action.textContent = this.setting.actionText ;
		this.footer.appendChild(this.cancel);
		this.footer.appendChild(this.action);
		elt.appendChild(this.footer)
	}
	// there are two btns [cancel] and [save]

}



/**
 * setData
 * @param {Array} data
 *        The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option].
 */
MultSelector.prototype.setData = function(data){

	if(!Array.isArray(data)){
		console.error(`${this.className}:setData - data is not an array`);
		return;
	}
	data = data.map(item =>{
		if(Array.isArray(item)) return item;
		return [item,item];
	});
	this.setting.data = data;
	// clear all options
	this.selectors[0].innerHTML = '';
	this.selectors[1].innerHTML = '';
	//
	MultSelector.__addOptions(this.selectors[0],this.setting.data);
};
/**
 * __addOptions add options to target selector
 * @param  {Select} target
 *         a selector that is a html select elemenet
 * @param  {Array} data
 *         The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option].
 */
MultSelector.__addOptions = function(target, data){
	data.forEach(item => {
		var opt = document.createElement('option');
		opt.value = item[0];
		opt.textContent = item[1];
		target.appendChild(opt);
	});
}

/**
 * @private
 * __selectAll click on select all btn and fire the 'select-all' event
 * @param  {Event} e
 *         Event
 */
MultSelector.prototype.__selectAll = function(e){
	this.selectors[1].innerHTML = '';
	this.selectors[1].innerHTML = this.selectors[0].innerHTML;

	// event fired
	this.raiseEvent('select-all', {});
};
/**
 * @private
 * __cancel click on cancel btn and fire the 'cancel' event
 * @param  {Event} e
 *         Event
 */
MultSelector.prototype.__cancel = function(e){
	// event fired
	this.raiseEvent('cancel', {});
};
/**
 * @private
 * __action click on action btn and fire the 'action' event. There is all selected data in the parameters
 * @param  {Event} e
 *         Event
 */
MultSelector.prototype.__action = function(e){
	// event fired
	this.raiseEvent('action', {data:this.getSelected()});
};
/**
 * @private
 * __select click on select btn and fire the 'select' event. There is all selected data in the parameters
 * @param  {Event} e
 *         Event
 */
MultSelector.prototype.__select = function(e){
	const selected = this.selectors[0].querySelectorAll('option:checked');
	const data = [];
	[...selected].forEach( function(opt) {
		const num = this.selectors[1].querySelectorAll(`option[value='${opt.value}']`).length;
		if(num === 0) {
			const new_opt = opt.cloneNode(true);
			new_opt.textContent = opt.textContent;
			this.selectors[1].appendChild(new_opt);
			data.push([opt.value,opt.textContent]);
		}
	},this);

	// event fired
	this.raiseEvent('select', {data:data});
}

/**
 * @private
 * __removeAll click on removeAll btn and fire the 'remove-all' event.
 * @param  {Event} e
 *         Event
 */
MultSelector.prototype.__removeAll = function(e){
	this.selectors[1].innerHTML = '';

	// event fired
	this.raiseEvent('remove-all', {});
}

/**
 * @private
 * __remove click on remove btn and fire the 'remove' event. There is all removed data in the parameters
 * @param  {Event} e
 *         Event
 */
MultSelector.prototype.__remove = function(e){
	const selected = this.selectors[1].querySelectorAll('option:checked');
	const data = [];
	[...selected].forEach( function(opt) {
		opt.parentNode.removeChild(opt);
		data.push([opt.value,opt.textContent]);
	});

	// event fired
	this.raiseEvent('remove', {data:data});
}

/**
 * getSelected get all selected data
 * @return {Array} the data form same as [[key,value]...]
 */
MultSelector.prototype.getSelected = function(){
	const selected = this.selectors[1].querySelectorAll('option');
	return Array.from(selected).map(opt=>[opt.value,opt.textContent]);
}


// MultSelector inherit from EventHandle in which the MultSelector is able to add Events based on Behaviors.
// MultSelector Events - 'remove-all', 'remove', 'select-all', 'select', 'cancel', 'action'
extend(MultSelector.prototype, EventHandle.prototype);

// proposal:
// test:
// constructor:options:id,title,icon,isExpand,
// setList : refeash UI
// triggerContent(itemId, action = 'close')
// addContent(itemId, elt)
// clearContent(itemId)
// callback

/* attributes in options
	options{
		id - element id
		list:[
			{
				id:identity for one sepific item
				title: text display on head
				icon:google icon
				content: stting or DOM Element
				isExpand: 
			}
		]
	}
	// TODO a function	
*/


/**
 * 
 * CaMicroscope Collapsible List. the item in this list consists of the item's head and the item's body.
 * Click on the head, if item's body is collapsed then expand it, if not, then expand it. Only one of item can be expanded.
 * @constructor
 * @param {Object} options 
 *        All required and optional settings for instantiating a new instance of a Collapsible List.
 * @param {String} options.id
 *        Id of the element to append the Collapsible List's container element to.
 * @param {Object[]} list
 *        The list of items in Collapsible List 
 * @param {String} list.id
 *        Item id, which uses to query item
 * @param {String} list.title
 *        Item text title
 * @param {String} [list.icon]
 *        The name of material-icons for the item icon
 * @param {String|Element} list.content
 *        The content that the item body has.
 * @param {String} [list.isExpand = false]
 *        The content expand or not.
 * @param {Function} [changeCallBack]
 *        when the expanded item changes the event is fired. Return {id: item id,isExpand: the state of current item[expand or not]}       
 *        
 */
function CollapsibleList(options){
	this.name = 'CollapsibleList';
	/*
		[{
			id - 
			head -
			content -
		}...]
	*/

	/**
     * @property {Object[]} __v_models 
     *           The view model
     * @property {String} __v_models.id
     *           the id that identifies the item
     * @property {String} __v_models.title
     *           the title that shows in the head part 
     * @property {String} __v_models.icon
     *           The name of material-icons for the item icon
     * @property {String} __v_models.content
     *           The content that the item body has.
     * @property {String} [__v_models.isExpand = false]
     *           The item is expanded or not.             
     */
	this.__v_models = [];

	/*
		list:[
			{
				id: ,
				title: ,
				icon: ,
				content:string
				isExpand:,
				
			}
		]
	*/ 
	this.setting = {	
	}

	extend(this.setting, options);

	// attach container element
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt && !this.setting.viewer) {
		console.error(`${this.name}: No Viewer or DOM Element`);
		return;
	}

	//create UI
	this.__refresh();

}

/**
 * @private
 * create items (head, content) for collapsible list by using options
 * @param {Object[]} options
 *        The list of items in Collapsible List 
 * @param {String} options.id
 *        Item id, which uses to query item
 * @param {String} options.title
 *        Item text title
 * @param {String} [options.icon]
 *        The name of material-icons for the item icon
 * @param {String|Element} options.content
 *        The content that the item body has.
 * @param {String} [options.isExpand = false]
 *        The content expand or not.
 */
CollapsibleList.prototype.__createItem = function(options){
	
	/*
		create the item head
	*/
	// the head
	const head = document.createElement('div');
	head.classList.add('item_head');
	
	// the icon for expand/collapse
	const add_icon = document.createElement('i');
	add_icon.classList.add('material-icons');
	add_icon.classList.add('md-24');
	head.appendChild(add_icon);

	// the icon for customize
	let icon;
	if(options.icon){
		icon = document.createElement('i');
		icon.classList.add('material-icons');
		icon.classList.add('md-24');
		icon.textContent = options.icon;
		head.appendChild(icon);
	}

	// the title
	const title = document.createElement('span');
	title.textContent = options.title;
	head.appendChild(title);
	
	this.elt.appendChild(head);
	

	/*
		create the item content
	*/

	// create item body
	const body = document.createElement('div');
	body.classList.add('item_body');
	if(options.isExpand) {
		add_icon.textContent = 'remove';
		body.classList.add('expand');
	} else {
		add_icon.textContent = 'add';
		body.classList.add('collapse');
	}

	// ceate item content
	const content = document.createElement('div');
	content.classList.add('item_content');

	// add content
	if(typeof options.content === 'string'){ // string template
		content.innerHTML = options.content;
	} else if(options.content instanceof Element){
		content.appendChild(options.content); // DOM element
	}

	body.appendChild(content);
	this.elt.appendChild(body);


	// events
	head.addEventListener('click', this.__click_head.bind(this));

	return {head:head,body:body};

};


/**
 * @private
 * the event that will be triggled when click on the head of a item.
 * @param  {Event} e click event
 */
CollapsibleList.prototype.__click_head = function(e){
	const head = e.currentTarget;
	const body = head.nextElementSibling;
	for (var i = this.__v_models.length - 1; i >= 0; i--) {
		const item = this.__v_models[i];
		if(item.elt.head !== head) {
			item.elt.body.classList.remove('expand')
			item.elt.body.classList.add('collapse')
			item.elt.body.previousElementSibling.firstChild.innerHTML = 'add';
		}

	}
	if(body.classList.toggle('collapse')) head.querySelector('i').innerHTML = 'add';
	if(body.classList.toggle('expand')) head.querySelector('i').innerHTML = 'remove';

	if(this.setting.changeCallBack) {
		const data = this.__v_models.map( item =>  {
			return {
				id:item.id, 
				isExpand:item.elt.body.classList.contains('expand')?true:false
			}
		});

		this.setting.changeCallBack.call(this, data);
	}
};

/**
 * set the item list. UI refresh automatically.
 * @param {object[]} list
 *        The list of items in Collapsible List 
 * @param {String} list.id
 *        Item id, which uses to query item
 * @param {String} list.title
 *        Item text title
 * @param {String} [list.icon]
 *        The name of material-icons for the item icon
 * @param {String|Element} list.content
 *        The content that the item body has.
 * 
 */
CollapsibleList.prototype.setList = function(list){
	
	if(list)this.setting.list = list;
	this.__refresh(); 
};

/**
 * Render UI based on the options.
 * 
 */
CollapsibleList.prototype.__refresh = function(){
	// has item list
	if(!this.setting.list instanceof Array) {
		console.error(`${this.name}: No Data List`);
		return;
	}

	//
	empty(this.elt);
	this.elt.classList.add('clloapsible_container');
	// this.elt.style.flex = 1;

	this.__v_models = this.setting.list.slice();
	// create a list
	for (var i = 0; i < this.__v_models.length; i++) {
		const item_options = this.__v_models[i];
		item_options.elt = this.__createItem(item_options);
	}
};


CollapsibleList.prototype.collapse = function(){
	for (var i = this.__v_models.length - 1; i >= 0; i--) {
		const item = this.__v_models[i];
		item.elt.body.classList.remove('expand');
		item.elt.body.classList.add('collapse');

	}
}
/*
	id: item's id
	action - open/close
*/
/**
 * trigger item that expands or collapses item's body. 
 * @param  {String} itemId
 *         item id that identifies an item on the list 
 * @param  {String} [action='close'] 
 *         two option: 'open' or 'close'
 */
CollapsibleList.prototype.triggerContent = function(itemId, action = 'close'){
	if(action == 'open'){
		const item = this.__v_models.find(item => item.id===itemId);
		if(item) {
			this.collapse();
			item.elt.body.classList.remove('collapse');
			item.elt.body.classList.add('expand');
		}
	}else if(action == 'close'){
		const item = this.__v_models.find(item => item.id===itemId);
		if(item) {
			item.elt.body.classList.remove('expand');
			item.elt.body.classList.add('collapse');
		}
	}else{
		console.log(`${this.name}:No actions`);
		return;
	}
	if(this.setting.changeCallBack) {
		const data = this.__v_models.map( item =>  {
			return {
				id:item.id, 
				isExpand:item.elt.body.classList.contains('expand')?true:false
			}
		});

		this.setting.changeCallBack.call(this, data);
	}
};

/**
 * Add the content of a specific item body by using Id.
 * @param {String} itemId
 *        item id that identifies an item on the list
 * @param {String|ELement} elt
 *        The content that the item body has.
 */
CollapsibleList.prototype.addContent = function(itemId, elt){

	const item = this.__v_models.find(one => one.id === itemId);
	if(item && item.elt){
		const content = item.elt.body.querySelector('.item_content');
		if(elt instanceof Element) content.appendChild(elt);
		if(typeof elt === 'string') {
			const div = document.createElement('div');
			div.innerHTML = elt;
			const childern = [...div.children];

			childern.forEach(child =>{
				content.appendChild(child);	
			})
			
		};
		return true;
	}else{
		console.warn('id is unvalid...');
		return false;
	}
};

/**
 * Clear the all content of a specific item body by using Id.
 * @param {String} itemId
 *        item id that identifies an item on the list
 * 
 */
CollapsibleList.prototype.clearContent = function(itemId){

	const item = this.__v_models.find(one => one.id === itemId);
	if(item && item.elt){
		const content = item.elt.body.querySelector('.item_content');
		empty(content);
		return true;
	}else{
		console.warn('id is unvalid...');
		return false;
	}
};


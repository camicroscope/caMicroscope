// proposal:
// test:
// constructor
// setData
// callback
// style:
// expand/collapse if click on a node
// search bar is workeds

/**
 * CaMicroscope Layers Viewer. A componet that shows all layers by the different categories.
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
function LayersViewer(options){
	this.className = 'LayersViewer';
	this.setting = {
		// id: doc element
		// data: layers dataset
		// categoricalData  
		//
		//
		isSortableView:false,
	};

	/**
	 * @property {Object} _v_model
	 *        View Model for the layers mamager
	 * @property {Object} _v_model.types
	 *        data set group by types
	 * @property {String} _v_model.types.name
	 *        type name
	 * @property {Array} _v_model.types.data[]
	 *        what layers in this type of layers
	 */
	
	this.viewRadios; // name:
	this.searchBar;// input and btn

	this.categoricalView;
	this.sortableView;
	this.sortable;



	// setting dataset
	extend(this.setting, options);
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt) {
		console.error(`${this.className}: No Main Elements...`);
		return;	
	}
	this.elt.classList.add('layer_viewer');

	// sort data
	this.setting.data.sort(LayersViewer.compare);
	// give index
	// convert og data to categorical data
	this.__covertData();
	this.__refreshUI();

}

LayersViewer.prototype.onEnd = function(e){
	if(e.newIndex === e.oldIndex) return;
	const data = this.setting.data;
	
	// move data from old index position to new index position 
	LayersViewer.moveArray(data,e.oldIndex, e.newIndex);
	// refresh UI
	const sort = data.map(item=> item.id);
	this.sortable.sort(sort);
	// callback functions
	if(this.setting.sortChange) this.setting.sortChange.call(null,sort);
}
LayersViewer.prototype.moveLayer = function(id, direction = 'up'){
	const data = this.setting.data;
	// find layer index
	const oldIndex = data.findIndex(item => item.id === id);

	const newIndex = direction==='up'?oldIndex-1:oldIndex+1;
	
	if(newIndex < 0 || newIndex >= data.length){
		console.warn('move: Out Of Index');
		return;
	}
	// move data from old index position to new index position 
	LayersViewer.moveArray(data,oldIndex,newIndex);
	
	// refresh UI
	const sort = data.map(item=> item.id);
	this.sortable.sort(sort);
	// callback function
	if(this.setting.sortChange) this.setting.sortChange.call(null,sort);
}

// move 
LayersViewer.moveArray = function(array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
        var dist = newIndex - array.length + 1;
        while (dist--) {
            array.push(undefined);
        }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    return array; // for testing
};

// for sorting
LayersViewer.compare = function(a,b){
	if(a.index && b.index) return a.index > b.index;
	if(a.index) return 1;
	if(b.index) return 1;
	return a.name > b.name;
}

/**
 * [__clearUI description]
 * @return {[type]} [description]
 */
LayersViewer.prototype.__clearUI = function(){
	empty(this.elt);
	this.searchBar = null;
	this.viewRadios = null;	 
	this.categoricalView = null;
	this.sortableView = null;
	this.sortable = null;
};

/*
	refresh UI
*/
LayersViewer.prototype.__refreshUI = function(){
	empty(this.elt); // clear all elements
	this.__clearUI();

	/* create search bar area START */
	const ctrlObj = LayersViewer.createControlBar();
	this.viewRadios = ctrlObj.viewRadios;  // view switch
	this.searchBar	= ctrlObj.searchBar; // searchbar
	this.elt.appendChild(ctrlObj.view);

	// add switch view event
	this.viewRadios.list.forEach(
		radio => radio.elt.addEventListener('click',this.__radioClick.bind(this))
	);




	/* create search bar area END */



	/* categorical view START*/
	// create categorical view div
	let cate_view_div = document.createElement('div');
	cate_view_div.classList.add('layers_list');
	
	// create categorical view content
	const objCategories = LayersViewer.createCategoricalView(this.setting.categoricalData);
	cate_view_div.appendChild(objCategories.view);

	this.elt.appendChild(cate_view_div);
	this.categoricalView = cate_view_div;
	/* categorical view END*/
	


	/* sortable view START */
	// create sortable view div
	let sort_view_div = document.createElement('div');
	sort_view_div.classList.add('sort_list');
	sort_view_div.style.display = 'none';

	// create sortable view content
	const objSortable = LayersViewer.createSortableView(this.setting.data);
	this.sortable = objSortable.sortable;
	this.sortable.option('onEnd', this.onEnd.bind(this))

	// add the content into the div
	sort_view_div.appendChild(objSortable.view);
	this.elt.appendChild(sort_view_div);
	this.sortableView = sort_view_div;
	/*sortable view END */


	// add search event 
	this.searchBar.btn.addEventListener('click', this.__search.bind(this));
	//
	this.searchBar.text.addEventListener('change',this.__search.bind(this));
	this.searchBar.text.addEventListener('keyup',this.__search.bind(this));


	// add event for all checkbox
	const checkboxes = this.elt.querySelectorAll('input[type=checkbox]');
	checkboxes.forEach(
		chk => chk.addEventListener('change', this.__change.bind(this))
	);
	// expand and collapse control for categorical view
	const cateItems = this.setting.categoricalData;
	for(let key in cateItems){
		cateItems[key].cateItem.firstChild.addEventListener('click', this.__switch.bind(this));
	}

	// moveup 
	const ups = this.sortableView.querySelectorAll('.moveup');
	ups.forEach( up => up.addEventListener('click',function(e){
		const _id = e.target.parentNode.dataset.id;
		this.moveLayer(_id,'up');
	}.bind(this)));

	// movedown
	const downs = this.sortableView.querySelectorAll('.movedown');
	downs.forEach( downs => downs.addEventListener('click',function(e){
		const _id = e.target.parentNode.dataset.id;
		this.moveLayer(_id,'down');
	}.bind(this)));
	
	// initalize checkbox
	if(this.setting.isSortableView){
		this.viewModeSwitch('sort');
	}else{
		this.viewModeSwitch('category');
	}

}

//click on view radio btn which changes the view mode
LayersViewer.prototype.__radioClick = function(){
	const mode = this.elt.querySelector(`input[type=radio][name=${this.viewRadios.name}]:checked`).value;
	this.viewModeSwitch(mode);
	if(mode === 'sort'){
		this.setting.isSortableView = true;
	}else{
		this.setting.isSortableView = false;
	}
};

// switch layers view mode - sortable or categorical 
LayersViewer.prototype.viewModeSwitch = function(mode = 'category' /*category/sort */){
	
	// display two views
	this.sortableView.style.display = 'none';
	this.categoricalView.style.display = 'none';
	
	switch (mode) {
		case 'category':
			// open category view and checked cate radio btn
			this.viewRadios.list[0].elt.checked = true;
			this.categoricalView.style.display = 'block';
			break;
		case 'sort':
			// open sortable view and checked sort radio btn
			this.viewRadios.list[1].elt.checked = true;
			this.sortableView.style.display = 'block';
			break;
		default:
			// statements_def
			break;
	}
}

/* For Categorical View functions START */
LayersViewer.createCategoricalView = function(data){
	const ul = document.createElement('ul');
	for(let cate in data){
		// create root li
		const cate_data = data[cate];
		cate_data.cateItem = LayersViewer.createCategoricalItem(cate_data,'root');
		ul.appendChild(cate_data.cateItem); // create li root
		

		const children = document.createElement('ul');
		// add leaf
		cate_data.data.forEach(item => {
			item.cateItem = LayersViewer.createCategoricalItem(item);
			children.appendChild(item.cateItem); // create li leaf
		});
		//
		ul.appendChild(children);
	}
	return {view:ul};
}

LayersViewer.createCategoricalItem = function(item, type){
	const id = `cate.${item.id}`;
	// create li
	const li = document.createElement('li');
	li.dataset.id = item.id; 
	// data?
			
	// label
	const label = document.createElement('label');
	label.htmlFor = id;
	
	// div
	const text = document.createElement('div');
	text.textContent = item.name;
	label.appendChild(text);
	
	// checkbox
	let chk = document.createElement('input');
	chk.type='checkbox';
	chk.id = id;
	chk.dataset.id = item.id;

	if(type==='root'){
		let ic = document.createElement('div');
		ic.classList.add('material-icons');
		ic.textContent='keyboard_arrow_down';
		label.style.fontWeight = 'bold';
		chk.dataset.type = 'root';
		li.appendChild(ic);
	}else{
		chk.dataset.type = 'leaf';
		chk.checked = item.isShow;
		li.title = item.name;
	}

	//chk.dataset.name = item.name;
	li.appendChild(label);
	li.appendChild(chk);
	return li;
}
/* For Categorical View functions END */





/* For Sortable View functions START */
LayersViewer.createSortableView = function(list){
	const sortableList = document.createElement('ul');
	for (var i = 0; i < list.length; i++) {
		const item = list[i];
		const elt = LayersViewer.createSortableItem(item);
		item.sortItem = elt;
		sortableList.appendChild(elt);
	}

	// sortable options
	var options = {
		group: 'share',
		animation: 100,
		dataIdAttr:'data-id'
	};

	// 
	const sortable = Sortable.create(sortableList, options);
	return {sortable:sortable, view:sortableList};
}

// create sortable item for sortable view
LayersViewer.createSortableItem = function(item){
	const id = `sort.${item.id}`

	// create li
	const li = document.createElement('li');
	li.dataset.id = item.id; 
	// data?
			
	// label
	const label = document.createElement('label');
	label.htmlFor = id;
	
	// div
	const text = document.createElement('div');
	text.textContent = item.name;
	label.appendChild(text);

	// div moveup
	const up_icon = document.createElement('div');
	up_icon.classList.add('material-icons');
	up_icon.classList.add('moveup');
	up_icon.textContent = 'arrow_drop_up';

	// div movedown
	const down_icon = document.createElement('div');
	down_icon.classList.add('material-icons');
	down_icon.classList.add('movedown');
	down_icon.textContent = 'arrow_drop_down';
	
	// checkbox
	let chk = document.createElement('input');
	chk.type='checkbox';
	chk.id = id;
	chk.checked = item.isShow;
	chk.dataset.id = item.id;
	chk.dataset.type = 'leaf';
	li.appendChild(label);
	li.appendChild(up_icon);
	li.appendChild(down_icon);
	li.appendChild(chk);
	return li;
}
/* For Sortable View functions END */






/* For control area functions START */
LayersViewer.createControlBar = function(){
	const view = document.createElement('div');
	view.classList.add('searchbar');

	// create view radios name	
	const _name = randomId();


	/* create cate btn START */
	const cate_id = randomId();
	const cate_btn = document.createElement('div');
	cate_btn.style.display='none';
	// cate radio
	const cate_radio = document.createElement('input');
	cate_radio.id = cate_id;
	cate_radio.type = 'radio';
	cate_radio.name = _name;
	cate_radio.value = 'category';
	
	// cate label
	const cate_label = document.createElement('label');
	cate_label.htmlFor = cate_id;
	cate_label.classList.add('material-icons');
	cate_label.textContent = 'category';

	cate_btn.appendChild(cate_radio);
	cate_btn.appendChild(cate_label);

	//add into view
	view.appendChild(cate_btn);
	/* create cate btn END */



	/* create cate btn START */
	const sort_id = randomId();
	const sort_btn = document.createElement('div');
	sort_btn.style.display='none';
	const sort_radio = document.createElement('input');
	sort_radio.id = sort_id;
	sort_radio.type = 'radio';
	sort_radio.name = _name;
	sort_radio.value = 'sort';
	

	const sort_label = document.createElement('label');
	sort_label.htmlFor = sort_id;
	sort_label.classList.add('material-icons');
	sort_label.textContent = 'sort';

	sort_btn.appendChild(sort_radio);
	sort_btn.appendChild(sort_label);

	// add into view
	view.appendChild(sort_btn);
	/* create sort btn END */




	/* create search bar START */
	// text input
	const search_input = document.createElement('input');
	search_input.type='text';
	search_input.placeholder = 'Search By Name/ID';
	
	// search btn
	const search_btn = document.createElement('div');
	search_btn.classList.add('material-icons');
	search_btn.textContent = 'find_in_page';
	
	//add input and btn into ciew
	view.appendChild(search_input);
	view.appendChild(search_btn);
	/* create search bar END */




	/* create check all START */
	const chk_all = document.createElement('input');
	chk_all.type = 'checkbox';
	chk_all.id = 'all';
	chk_all.dataset.type = 'all';
	view.appendChild(chk_all);
	/* create check all END */


	// return obj for switch layer views
	const viewRadios = {};
	viewRadios.name = _name;
	viewRadios.list = [
		{
			id:cate_id,
			elt:cate_radio // categorical view radio btn
		},
		{
			id:sort_id,
			elt:sort_radio // sortable view radio btn
		}
	];

	// return obj for seach bar
	const searchBar = {};
	searchBar.text = search_input;
	searchBar.btn = search_btn;
	
	// return obj for check all
	
	return {
		view:view,
		viewRadios:viewRadios,  // view switch
		searchBar:searchBar,  // searchbar
		checkAll:chk_all   // check all
	};
}


/* For control area functions END */
/**
 * Set data model and automatically refresh UI.
 * @param {Object[]} data 
 *        the data set of the layers.
 * @param {String} data.id
 *        layer's id
 * @param {String} data.name
 *        layer's name
 * @param {String} data.typeId
 *        layer's type id
 * @param {String} data.typeName
 *        layer's type name
 * 
 */
LayersViewer.prototype.setData = function(data){
	this.setting.data = data;
	this.update();
}
/**
 * @private
 * update the UI according to the data model
 */
LayersViewer.prototype.update = function(){
	//this.setting.data = data;
	this.__covertData();
	this.__refreshUI();
}

/**
 * @private
 * search event
 * @param  {[type]} e [description]
 */
LayersViewer.prototype.__search = function(e){
	// show all li with leaf class
	let list = this.setting.data;
	list.forEach(item=> {
		item.cateItem.style.display='flex';
		item.sortItem.style.display='flex';
	});
	
	const pattern = e.target.value;
	const items = this.setting.data;
	const regex = new RegExp(pattern, 'gi');

	list.forEach(item=>{
		if(!item.name.match(regex)){
			item.cateItem.style.display = 'none';
			item.sortItem.style.display = 'none';
		}
	});
}

/*
	convert og/raw data to categorical model/data
*/
LayersViewer.prototype.__covertData = function(){
	if(!this.setting.data){
		console.warn(`${this.className}: No Raw Data`);
		//return; 
	}

	this.setting.categoricalData =  this.setting.data.reduce(function(model, item){
		if(!model[item.typeId]){
			model[item.typeId] = {id:item.typeId,name:item.typeName,data:[]};
		}
		model[item.typeId].data.push(item);
		if(!item.isShow)item.isShow = false;
		return model; 
	},{});
}

// expand or collapse layer list
LayersViewer.prototype.__switch = function(e){
	const nextElt = e.target.parentNode.nextElementSibling;
	if(nextElt.style.display=='none'){
		nextElt.style.display = null;
		e.target.innerHTML = 'keyboard_arrow_down';
	}else{
		nextElt.style.display = 'none';
		e.target.innerHTML = 'keyboard_arrow_right';
	}
};

//
LayersViewer.prototype.__change = function(e){
	// confirm TODO
	
	const id = e.target.dataset.id;
	const type = e.target.dataset.type;
	const checked = e.target.checked;
	const list = this.setting.data;
	switch (type) {
		case 'all':
			this.setting.data.forEach(item => {
				item.isShow = checked;
				item.cateItem.lastChild.checked = checked;
				item.sortItem.lastChild.checked = checked;
			});

			for(let key in this.setting.categoricalData){
				this.setting.categoricalData[key].cateItem.lastChild.checked = checked;
			}
			this.setting.callback.call(null,this.setting.data);
			break;
		case 'root':
			this.setting.categoricalData[id].data.forEach(item => {
				item.isShow = checked;
				item.cateItem.lastChild.checked = checked;
				item.sortItem.lastChild.checked = checked;
			});
			this.setting.callback.call(null,this.setting.categoricalData[id].data);
			break;
		case 'leaf':
			const item = this.setting.data.find(item => item.id == id);
			if(!item) return;
			item.isShow = checked;
			item.cateItem.lastChild.checked = checked;
			item.sortItem.lastChild.checked = checked;
			this.setting.callback.call(null,[item]);
			break;
		default:
		
	}

}

// TODO
LayersViewer.prototype.add = function(){}
// TODO
LayersViewer.prototype.remove = function(){}

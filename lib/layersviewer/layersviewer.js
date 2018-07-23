/*

*/

function LayersViewer(opt){
	const className = 'LayersViewer';
	this.setting = {
		// id: doc element
		// data: layers dataset
		// _v_model:  
		//
	};
	// setting dataset
	extend(this.setting, opt);
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt) {
		console.error(`${className}: No Main Elements...`);
		return;	
	}
	this.elt.classList.add('layer_viewer');
	// convert og_data to view model
	this.__covertMode();
	this.__refresh();
	//

}

/*
	refresh UI
*/
LayersViewer.prototype.__refresh = function(){
	empty(this.elt); // clear all elements

	// create search bar area
	let serach_bar = {};

	let div = document.createElement('div');
	div.classList.add('searchbar');

	// expand/collapse controller
	
	let ic_bar = document.createElement('i');
	ic_bar.classList.add('material-icons');
	ic_bar.classList.add('md-24');
	ic_bar.textContent = 'keyboard_arrow_down';

	// text input for seach bar 
	let txt_bar = document.createElement('input');
	txt_bar.type='input';
	txt_bar.placeholder = 'Search By Name/ID';
	
	// search btn
	let search_btn = document.createElement('button');
	search_btn.classList.add('material-icons');
	search_btn.classList.add('md-24');
	search_btn.textContent = 'find_in_page';
	
	// display controller
	let chk_all = document.createElement('input');
	chk_all.type = 'checkbox';
	chk_all.dataset.type = 'all';
	//chk_all.id = 'all';
	chk_all.classList.add('big');
	


	div.appendChild(ic_bar);
	div.appendChild(txt_bar);
	div.appendChild(search_btn);
	div.appendChild(chk_all);
	this.elt.appendChild(div); // add search bar

	// create viwe list
	let view_div = document.createElement('div');
	view_div.classList.add('layers_list');



	function createListItem(type, item){ // type: root/leaf, data: 
		let li = document.createElement('li');
			li.id = item.id;
			let _div = document.createElement('div');
			// label
			let label = document.createElement('label');
			label.htmlFor = item.id;
			label.textContent = item.name;
			_div.appendChild(label);
			// checkbox
			let chk = document.createElement('input');
			chk.type='checkbox';
			chk.id = item.id;
			chk.dataset.type = type;
			chk.dataset.name = item.name;
			//li.classList.add('root');
			if(type==='root'){
				li.classList.add('root');
				let ic = document.createElement('i');
				ic.classList.add('material-icons');
				ic.classList.add('md-24');
				ic.textContent='keyboard_arrow_down';
				li.appendChild(ic);
				chk.classList.add('big');
			}else{
				li.classList.add('leaf');
				li.title = item.name;
			}

			li.appendChild(_div);
			li.appendChild(chk);
			return li;
	}

	const _v_model = this.setting._v_model;
	const _root_ul = document.createElement('ul');
	for(let type in _v_model){
		// create root li
		let type_data = _v_model[type];
		_root_ul.appendChild(createListItem('root',type_data)); // create li root
		const _leaf_ul = document.createElement('ul');
		// add leaf
		type_data.data.forEach(item => {
			_leaf_ul.appendChild(createListItem('leaf',item)); // create li leaf
		});
		//
		_root_ul.appendChild(_leaf_ul);



	}
	view_div.appendChild(_root_ul);
	this.elt.appendChild(view_div);


	// add all events
	// for expand and collapse
	let clpBtns = this.elt.querySelectorAll('i.material-icons.md-24');
	clpBtns.forEach( btn => btn.addEventListener('click', this.__switch.bind(this)));

	// for check and uncheck
	let check = this.elt.querySelectorAll('input[type=checkbox]');
	check.forEach(check => check.addEventListener('change', this.__change.bind(this)));
	// for search btn 
	let btnSearch = this.elt.querySelector('div.searchbar button.material-icons.md-24');
	btnSearch.addEventListener('click', this.__search.bind(this));
	//
	let searchInput = this.elt.querySelector('div.searchbar input'); 
	searchInput.addEventListener('change',this.__search.bind(this));
	searchInput.addEventListener('keyup',this.__search.bind(this));
}


/*
	
*/
LayersViewer.prototype.__search = function(e){
	// show all li with leaf class
	let list = this.elt.querySelectorAll('li.leaf');
	list.forEach(li=> li.style.display='flex');
	
	const pattern = e.target.value;
	const items = this.setting.data;
	const regex = new RegExp(pattern, 'gi');
	items.forEach(item=>{
		if(!item.name.match(regex))
			this.elt.querySelector(`#${item.id}`).style.display = 'none';
	});
}
/*
	convert og/raw data to view model/data
*/
LayersViewer.prototype.__covertMode = function(){
	if(!this.setting.data){
		console.error(`${className}: No Raw Data`);
		return; 
	}
	/*
	_v_model:{
		typeId:{
			name - type name
			data:[] - items for each type
		}
	}
	*/
	this.setting._v_model =  layersData.reduce(function(model, item){
		if(!model[item.typeId]){
			model[item.typeId] = {id:item.typeId,name:item.typeName,data:[]};
		}
			model[item.typeId].data.push(item);
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
	const dataset = e.target.dataset;
	const chkVal = e.target.checked;
	const id = e.target.id;
	if(dataset.type !== 'leaf') {
		if(!window.confirm(`Do you really want to show ${dataset.name}'s layers?`)) return;
		//
		const nextElt = e.target.parentNode.nextElementSibling;
		checkList = nextElt.querySelectorAll('input[type=checkbox]');
		checkList.forEach(check => check.checked = chkVal);

		// call back function
		this.setting.callback.call(null,(id?this.setting._v_model[id].data:this.setting.data),chkVal);
		//console.log(chkVal);
	
	}else{
		// callback functions
		let data = this.setting.data.find(item => item.id==id);
		this.setting.callback.call(null,data,chkVal);
	}

}

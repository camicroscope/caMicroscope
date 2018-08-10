// popuppanel.js


function PopupPanel(options){
	this.className = 'PopupPanel';
	this.elt = null;
	this.title;
	this.body;
	this.footerBtns = [];

	this.setting = {
		title:'',
		bodyHTML:'',
		// body:{
		// 	type:'table', //'table', 'map'
		// 	data:[],
		// }
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
		this.footerBtns.push(PopupPanel.createBtn(footer,btns[i]));
	}
	this.elt.appendChild(footer);

}

PopupPanel.prototype.open = function(point){
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
PopupPanel.prototype.setTitle = function(text){
	// clear body
	empty(this.title);
	// create body
	this.title.textContent = text;
}
PopupPanel.prototype.setBody = function(body){
	// clear body
	empty(this.body);

	// create body
	this.body.appendChild(PopupPanel.createBodyContent(body));
}
PopupPanel.prototype.close = function(){
	this.elt.style.display = 'none';
	this.elt.style.top = '-1000px';
	this.elt.style.left = '-1000px';
}
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
		key.textContent = row.key;
		// create value cell
		const value = document.createElement('div');
		value.classList.add('value');
		value.textContent = row.value;
		
		tr.appendChild(key);
		tr.appendChild(value);
	}
	return table;
}

PopupPanel.createBtn = function(parent,opt){
	const btn = document.createElement('button');
	btn.title = opt.title;
	btn.classList.add(opt.class);
	btn.textContent = opt.text;
	btn.addEventListener('click', opt.callback);
	parent.appendChild(btn);
	return btn;
}
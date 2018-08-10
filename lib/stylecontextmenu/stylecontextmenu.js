// stylecontextmenu.js
// 
// 
function StyleContextMenu(draw,options){
//title
//class
//text
//type
//name
//callback
	this.modeName = randomId();
	this.__json = [
		[{
			title:'Draw',
			class:'material-icons',
			text:'create',
			type:'checkbox',
			callback:this.toggleDraw.bind(this)

		},{
			title:'Undo',
			class:'material-icons',
			text:'undo',
			type:'btn',
			callback:this.undo.bind(this)
		},{
			title:'Redo',
			class:'material-icons',
			text:'redo',
			type:'btn',
			callback:this.redo.bind(this)
		},{
			title:'Clear',
			class:'material-icons',
			text:'layers_clear',
			type:'btn',
			callback:this.clear.bind(this)
		}],
		[{
			title:'Free Draw',
			class:'material-icons',
			text:'gesture',
			type:'radio',
			value:'free',
			name:this.modeName,
			checked:true,
			callback:this.setDrawMode.bind(this)
		},{
			title:'Rectangle',
			class:'material-icons',
			text:'crop_portrait',
			type:'radio',
			value:'rect',
			name:this.modeName,
			callback:this.setDrawMode.bind(this)
		},{
			title:'Square',
			class:'material-icons',
			text:'crop_din',
			type:'radio',
			value:'square',
			name:this.modeName,
			callback:this.setDrawMode.bind(this)
		}]
	];

	this.className = 'StyleContextMenu';
	/**
     * @property {Element} elt The element to append the side menu's container element to.
     */
    this.isInitColor = false;
	this.elt = null;
	this.DRAW = draw;
	this.ctrl;
	this.lineWidth;
	this.color;
	this.btnGroup;


	// default setting
	this.setting = {
		//id: container id
		// line weight
		range:{
			min:1,
			max:25,
			value:3
		},
		// default line color
		color:'#7CFC00',
		width:150,
		zIndex:501
		// btns [{text,title,callback}]
	}
	
	// user setting
	extend(this.setting, options);
	if(!this.DRAW){
		console.error(`${this.className}:No DRAW to operation`);
		return;
	}

	this.elt = document.getElementById(this.setting.id);
	if(!this.elt && this.setting.element){
		this.elt = this.setting.element;
	}

	if(!this.elt){
		// create main
		this.elt = document.createElement('div');

	}
	this.elt.style.width = `${this.setting.width}px`;
	this.elt.style.zIndex = this.setting.zIndex;
	this.elt.classList.add('context-menu');
	// create UI 
	this.__refresh();
}

StyleContextMenu.prototype.__refresh = function(){
	empty(this.elt);
	
	/* control start */
	// create control
	const ctrlItem = document.createElement('div'); 
	ctrlItem.classList.add('context-item'); 
	this.ctrl = StyleContextMenu.createFromJson(ctrlItem,this.__json[0]);
	
	this.elt.appendChild(ctrlItem); 
	/* control end */

	/* line weight control start */
	// create line width
	const weightItem = document.createElement('div'); 
	weightItem.classList.add('context-item');	
	
	// label for line weight
	const titleDiv = document.createElement('div');
	titleDiv.classList.add('material-icons');
	titleDiv.classList.add('item-label');
	titleDiv.textContent = 'line_weight';
	weightItem.appendChild(titleDiv);

	// range for line weight
	const range = document.createElement('input');
	range.type = 'range';
	range.value = this.setting.range.value;
	range.max = this.setting.range.max;
	range.min = this.setting.range.min;
	weightItem.appendChild(range);
	this.lineWidth = range;
	// index for line weight
	const indexDiv = document.createElement('div');
	indexDiv.classList.add('item-label');
	indexDiv.textContent = this.setting.range.value;
	indexDiv.style.fontSize = '1.5rem';
	weightItem.appendChild(indexDiv);

	this.elt.appendChild(weightItem);

	// bind event
	
	range.addEventListener('change',(e)=>{
		indexDiv.textContent = range.value;
		this.DRAW.style.lineWidth = +range.value;
	});
	range.addEventListener('mousemove',(e)=>{
		indexDiv.textContent = range.value;
		this.DRAW.style.lineWidth = +range.value;
	});
	/* line weight control end */


	/* draw mode control start */
	// create draw mode
	const modeItem = document.createElement('div'); 
	modeItem.classList.add('context-item');	
	StyleContextMenu.createFromJson(modeItem,this.__json[1]);
	this.elt.appendChild(modeItem);
	/* draw mode control end */


	/* color control start */	
	// create color
	const colorItem = document.createElement('div'); 
	colorItem.classList.add('context-item');
	
	// color input
	const color = document.createElement('input');
	color.type= 'text';
	color.value = this.setting.color;
	color.style.display = 'none';
	colorItem.appendChild(color);
	this.color = color;
	// picker 
	this.picker = document.createElement('div');
	this.picker.classList.add('picker');
	colorItem.appendChild(this.picker);
	this.elt.appendChild(colorItem);
	/* color control end */

	/* extra btn group start */
	// create btn group (maybe)
	if(this.setting.btns){
		const btnsItem = document.createElement('div'); 
		btnsItem.classList.add('context-item');
		this.btnGroup = StyleContextMenu.createFromJson(btnsItem,this.setting.btns);
		this.elt.appendChild(btnsItem);
	}
	/* extra btn group end */

	


	document.body.appendChild(this.elt);

	/* event for open and close context menu */
	this.DRAW.viewer.container.addEventListener('contextmenu', e=>{
      this.open({x:e.clientX,y:e.clientY});
      e.preventDefault();
    });
    this.DRAW.viewer.container.addEventListener('click', e=>{
      this.close(e);
    });

};

StyleContextMenu.prototype.setDrawMode = function(){
	const mode = document.querySelector(`input[name=${this.modeName}]:checked`).value;
	this.DRAW.drawMode = mode;

}
StyleContextMenu.prototype.close = function(e){
	if(!e){
		this.elt.style.display = 'none';
		this.elt.style.top = '-1000px';
		this.elt.style.left = '-1000px';
		return;
	}

	const isClickOnMenu = clickInsideElement( e, 'context-menu' );
    if ( isClickOnMenu ) return;
	this.elt.style.display = 'none';
	this.elt.style.top = '-1000px';
	this.elt.style.left = '-1000px';
}


StyleContextMenu.prototype.open = function(point){
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
	if(!this.isInitColor){
		this.createColor(this.color,this.picker);
		this.isInitColor = true;
	}
}


StyleContextMenu.prototype.getStyle = function(){
	// return {
	// 	color: 'rgba(0,0,0,1)', // default black
 //      	lineWidth:3, // 
	// }
};

StyleContextMenu.prototype.toggleDraw = function(){
	console.log('toggleDraw');
	if(this.ctrl[0].checked){
		this.DRAW.drawOn();
	}else{
		this.DRAW.drawOff();
	}
}
StyleContextMenu.prototype.clear = function(){
	if(this.DRAW._draws_data_.length > 0 && confirm('Clear All?')){
		this.DRAW.clear();	
	}	
}

StyleContextMenu.prototype.redo = function(){
	console.log('redo');
	console.log(this);
	// TODO 
	//this.DRAW.redo();
}

StyleContextMenu.prototype.undo = function(){
	
	console.log('undo');
	console.log(this);
	// TODO 
	//this.DRAW.undo();
}


StyleContextMenu.prototype.createColor = function(color, p){
	const code = document.createElement('input');
    code.className = 'color-code';
    code.pattern = '^#[A-Fa-f0-9]{6}$';
    code.type = 'text';
    
    const draw = this.DRAW;
    let picker = new CP(color, false, p);
    picker.on("change", function(color) {
        this.target.value = '#' + color;
        code.value = '#' + color;
        draw.style.color = code.value;
    });
    picker.on("enter", function() {
        code.value = '#' + CP._HSV2HEX(this.get());
    });
	picker.picker.firstChild.appendChild(code);

    picker.fit = function() { // do nothing ...
    	this.picker.style.position = 'relative'
    	this.picker.style.left = this.picker.style.top = 0;
    };
    picker.picker.classList.add('static');
    picker.enter();

    function update() {
        if (this.value.length) {
            picker.set(this.value);
            picker.fire("change", [this.value.slice(1)]);
        }
    }

    code.oncut = update;
    code.onpaste = update;
    code.onkeyup = update;
    code.oninput = update;
}

StyleContextMenu.createFromJson = function(parent,item){
	const btns = [];
	for (var i = 0; i < item.length; i++) {
		const btn = 
			item[i].type=='btn'?
			StyleContextMenu.createBtn(parent,item[i]):
			StyleContextMenu.createInput(parent,item[i])
		btns.push(btn);
	}
	return btns;
}
StyleContextMenu.createInput = function(parent,opt){
	const id = randomId();
	const label = document.createElement('label');
	label.htmlFor = id;
	
	label.title = opt.title;
	label.classList.add(opt.class);
	label.textContent = opt.text;
	const btn = document.createElement('input');
	btn.id = id;
	btn.type = opt.type;
	if(opt.value) btn.value = opt.value;
	if(opt.checked) btn.checked = opt.checked;
	if(opt.name) btn.name = opt.name;
	if(opt.type == 'radio')btn.addEventListener('click', opt.callback);
	if(opt.type == 'checkbox')btn.addEventListener('change', opt.callback);
	parent.appendChild(btn);
	parent.appendChild(label);
	return btn;
}

StyleContextMenu.createBtn = function(parent,opt){
	const btn = document.createElement('button');
	btn.title = opt.title;
	btn.classList.add(opt.class);
	btn.textContent = opt.text;
	btn.addEventListener('click', opt.callback);
	parent.appendChild(btn);
	return btn;
}



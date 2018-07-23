




function CaToolbar(opt){
	// default setting
	this.setting = {
		// list pairs
		// btn -> event

	}
	extend(this.setting, opt);
	this.elt = document.getElementById(this.setting.id);

	this.handler = this.elt.querySelector('li.handler > input');
	this.btns = this.elt.querySelectorAll('input[name=tool_btn]');
	this.menus = this.elt.querySelectorAll('input[name=app_ctrls]');
	this.pen = this.elt.querySelector('#pen');

	// elastic bar control
	this.handler.addEventListener('change', this.switch.bind(this));

	// menu ctrl
	this.menus.forEach( menu => menu.addEventListener('change', this.menusChange.bind(this)));
	//
	for(let key in this.setting.menus){
		const menu = this.setting.menus[key];
		menu.elt.querySelector('div.close').addEventListener('click',function(e){
			const id = this.parentNode.id.split('_')[1];
			const check = document.getElementById(id);
			check.checked = false;
		});
	}
	// pen style control
	this.pen.addEventListener('change', this.getPenStatus.bind(this));
	const radios = this.elt.querySelectorAll('input[name=pen_style]');
	//this.elt.querySelector('div.close').addEventListener('click',this.close.bind(this));
	radios.forEach(radio=>radio.addEventListener('change',this.getPenStatus.bind(this)));

	// functionality btns
	for(var id in this.setting.btns){
		// function action(e){
		// 	this.setting.btns[id].call();console.log(id);
		// 	document.getElementById(id).checked = false;
		// }
		document.getElementById(id).addEventListener('click',this.btnActive.bind(this));
	}
}
CaToolbar.prototype.btnActive = function(e){
	//console.log();
	const id = e.target.id;
	this.setting.btns[id].call();
	document.getElementById(id).checked = false;
}

CaToolbar.prototype.menusChange = function(e){
	console.log(e.target.checked);
	if(!e.target.checked) {
		this.setting.menus[e.target.dataset.target].close();
		return;
	}
	this.menus.forEach( menu => {

		const targetId = menu.dataset.target;
		//console.log();
		if(menu!== e.target) {
			menu.checked = false;
			this.setting.menus[targetId].close();
		} else {
			this.setting.menus[targetId].open();
		}
	} );
}

CaToolbar.prototype.switch = function(e){
	if(this.handler.checked){
		this._collapse();
	}else{
		this._expand();
	}
}

CaToolbar.prototype._collapse = function(){
	this.handler.nextElementSibling.innerHTML = 'arrow_right';
	this.btns.forEach(btn => btn.parentElement.style.display = 'none');
}

CaToolbar.prototype._expand = function(){
	this.handler.nextElementSibling.innerHTML = 'arrow_left';
	this.btns.forEach(btn => btn.parentElement.style.display = '');
}
CaToolbar.prototype.getPenStatus = function(){

	const style = this.elt.querySelector('input[name=pen_style]:checked').value;
	const isOn = this.pen.checked? 'On':'Off';
	//console.log(isOn+'|'+style);
	camessage.sendMessage(`Pen : ${isOn} | Style : ${style}`, {size:'20px',color:'white', bg_color:'blue'}, 1.5);
}
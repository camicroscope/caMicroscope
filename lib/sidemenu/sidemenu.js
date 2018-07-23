function SideMenu(opt){
	this.setting = {
		'width':250
	}
		extend(this.setting, opt);
	this.elt = document.getElementById(this.setting.id);
	console.log(this.elt);
	
	// add close event
	this.elt.querySelector('div.close').addEventListener('click',this.close.bind(this));

	//initialInnerMenu
	if(this.setting.id=='side_apps')this.initialInnerMenu();
}

SideMenu.prototype.open = function() {
	this.elt.style.width =this.setting.width+'px';
};

SideMenu.prototype.close = function() {
	this.elt.style.width ='0';
};

/***/
SideMenu.prototype.initialInnerMenu = function(){
	const heads = Array.from(document.querySelectorAll('.flex-container > .item_head'));
	heads.forEach(head=>head.addEventListener('click',function(e){
		const curBody = this.nextElementSibling;
  		const bodys= document.querySelectorAll('.flex-container > .item_body');
  		bodys.forEach(body =>{
  			if(body!==curBody){
  				body.classList.remove('expand')
  				body.classList.add('collapse')
  				body.previousElementSibling.firstChild.innerHTML = 'add';
  			}
  		});
  		if(curBody.classList.toggle('collapse')) this.querySelector('i').innerHTML = 'add';//add;
  		if(curBody.classList.toggle('expand')) this.querySelector('i').innerHTML = 'remove';//;
  		
	}));
}
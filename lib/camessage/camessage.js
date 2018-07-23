



function CaMessage(opt){
	// --
	this.setting = {
		'default_txt': 'No Content'
		// color - font color
		// bg_color - background color	
	}
	extend(this.setting, opt);
	this.elt = document.getElementById(this.setting.id);
	this.reset();
}
CaMessage.prototype.reset = function(txt){
	//if(!txt) return; //
	if(this.setting.default_txt) this.elt.innerText = this.setting.default_txt;
	this.elt.style.fontSize= this.setting.size||'1rem';
	this.elt.style.color= this.setting.color||'';
	this.elt.style.backgroundColor= this.setting.bg_color ||'';
}

CaMessage.prototype.changeTxt = function(txt){
	this.elt.innerText = txt;
}

CaMessage.prototype.changeStyle = function(style){
	if(!style) return;
	if(style.size) this.elt.style.fontSize = style.size;
	if(style.color) this.elt.style.color = style.color;
	if(style.bg_color) this.elt.style.backgroundColor = style.bg_color;
}

CaMessage.prototype.sendMessage = function(txt , style, time){
	this.changeTxt(txt);
	if(style) this.changeStyle(style);
	if(time) setTimeout(this.reset.bind(this) ,time*1000);

}
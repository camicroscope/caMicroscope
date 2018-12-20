// proposal:
// 
// enhancement
// 1. add options to set the position such as top-right, top-left, bottom-right, bottom-left.
// 2. add functionality that message panel can show detail info.


/**
 * CaMicroscope CaMessage. A message component that show the message permanently or temporarily
 * @constructor
 * @param {Object} options 
 *        All required and optional settings for instantiating a new instance of a CaMessage.
 * @param {String} options.id
 *        Id of the element to append the CaMessage's container element to.
 */
function CaMessage(options){
	this.name = 'CaMessage';
	/**
     * @property {Element} elt The element to append the CaMessage's container element to.
     */
	this.elt;
	this.setting = {
		// id
		defaultText: 'No Content',
		// size .font-size
		size:'1.3rem',
		// color - font color
		color:'#f6f6f6',
		// bgColor - background color
		bgColor:'#365f9c'	
	}
	extend(this.setting, options);
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt) {
		console.error(`${this.name}: No Main Element...`);
		return;
	}

	this.elt.classList.add('camessage');

	this.reset();
}

/**
 *	reset the message's content to default
 */
CaMessage.prototype.reset = function(){

	if(this.setting.defaultText) this.elt.textContent = this.setting.defaultText;
	this.elt.style.fontSize= this.setting.size;
	this.elt.style.color= this.setting.color;
	this.elt.style.backgroundColor= this.setting.bgColor;
}


/**
 *	set the message's text
 *	@param {String} txt 
 *	       text that show on CaMessage
 */
CaMessage.prototype.changeTxt = function(txt){
	this.elt.textContent = txt;
}


/*
 *	change message's style
 *	@param {Object} style
 *	       the style that applies on CaMessage
 *	@param {String} [style.size] font size.
 *	@param {String} [style.color] font color.
 *	@param {String} [style.bgColor] backgroud color.
 *	       
 */
CaMessage.prototype.changeStyle = function(style){
	if(!style) return;
	if(style.size) this.elt.style.fontSize = style.size;
	if(style.color) this.elt.style.color = style.color;
	if(style.bgColor) this.elt.style.backgroundColor = style.bgColor;
}

/*
 *	temporarily change the text and the style of CaMessage by giving time[sec]  
 *	@param {String} txt 
 *	       text content
 *	@param {Object} style 
 *	       the message style
 *	@param {String} [style.size] font size.
 *	@param {String} [style.color] font color.
 *	@param {String} [style.bgColor] backgroud color. 
 *	@param {number} time 
 *	       The number of seconds to show the message.
 */
CaMessage.prototype.sendMessage = function(txt,style,time){
	this.changeTxt(txt);
	if(style) this.changeStyle(style);
	if(time) setTimeout(this.reset.bind(this) ,time*1000);

}
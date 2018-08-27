//message queue.js
//
class MessageQueue{
	constructor(options){
		this.className = 'MessageQueue';

		this.setting = {
			position:'top-left' // top-left top-right bottom-left bottom-right
		}
		// user setting
		extend(this.setting, options);

		this.elt = document.getElementById(this.setting.id);
		if(!this.elt && this.setting.element){
			this.elt = this.setting.element;
		}

		// 
		if(!this.elt){
			// create main
			this.elt = document.createElement('div');
			document.body.appendChild(this.elt);
		}
		this.elt.classList.add('bullet-container');
		switch (this.setting.position) {
			case 'top-left':
				// top-left
				this.elt.style.top = 0;
				this.elt.style.left = 0;

				break;
			case 'top-right':
				// top-right
				
				this.elt.style.top = 0;
				this.elt.style.right = 0;
				break;
			case 'bottom-left':
				// bottom-left
				
				this.elt.style.bottom = 0;
				this.elt.style.left = 0;
				break;
			case 'bottom-right':
				// bottom-right
				
				this.elt.style.bottom = 0;
				this.elt.style.right = 0;
				break;
			default:
				// statements_def
				break;
		}

	}
	addError(text){
		this.add(text,'error',5000);
	}

	addWarning(text){
		this.add(text,'warning',3000);
	}

	add(text, type='info', time = 1000){
		const div = MessageQueue.createBullet(text, type);
		this.setting.position.includes('bottom')?this.elt.appendChild(div):this.elt.insertBefore(div, this.elt.firstChild);
		if(this.setting.position.includes('right')) div.classList.add('right');
		
		div.addEventListener('webkitTransitionEnd', this.__destroy.bind(div));
		div.addEventListener('transitionend', this.__destroy.bind(div));

		setTimeout(function(){
			div.classList.add('hide');
		},time);
	}
	__destroy(e){
		if (e.propertyName == 'opacity') {
			this.parentNode.removeChild(this);
		}
	}


	static createBullet(text, type){
		const div = document.createElement('div');
		div.classList.add('bullet');
		div.classList.add(type);
		div.textContent = text;
		return div;
	}

}
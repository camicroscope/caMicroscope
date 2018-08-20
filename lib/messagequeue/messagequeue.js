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

	add(text, time = 1000){
		const div = document.createElement('div');
		this.setting.position.includes('bottom')?this.elt.appendChild(div):this.elt.insertBefore(div, this.elt.firstChild);
		div.classList.add('bullet');
		if(this.setting.position.includes('right')) div.classList.add('right');
		div.textContent = text;
		div.addEventListener('webkitTransitionEnd', this.__destroy.bind(div));
		div.addEventListener('transitionend', this.__destroy.bind(div));

		setTimeout(function(){
			div.classList.add('hide');
		},time);
	}
	__destroy(e){
		console.log('__destroy');
		console.log(e.propertyName);
		if (e.propertyName == 'opacity') {
			this.parentNode.removeChild(this);
		}
	}


	static createBullet(text){
		const div = document.createElement('div');
		div.classList.add('bullet');
		div.textContent = text;
		return div;
	}

}
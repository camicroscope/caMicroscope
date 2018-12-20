// proposal:
// test case:
// 1. constructor - postions
// 2. add - check style, check text
// 3. addError
// 4. addWarning
// 5. multiple messages.

/**
 * MessageQueue. A queue of hint messages that show the message permanently and sequently
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a MessageQueue.
 *        
 * @param {String} [options.position=top-left]
 *        The position of MessageQueue instance shows up. 'top-left', 'top-right', 'bottom-left', 'bottom-right'.
 */
class MessageQueue{
	constructor(options){
		this.className = 'MessageQueue';

		this.setting = {
			position:'top-left' // top-left top-right bottom-left bottom-right
		}
		// user setting
		if(options&&options.position) this.setting.position = options.position;

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

	/**
	 * add a error message into the queue.
	 * @param {String} text 
	 *        the content of the message
	 * @param {Number} [time=5000]
	 *        the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.
	 */
	addError(text, time = 3000){
		this.__add(text,'error',time);
	}
	/**
	 * add a warning message into the queue.
	 * @param {String} text 
	 *        the content of the message
	 * @param {Number} [time=3000]
	 *        the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.
	 */
	addWarning(text, time = 1000){
		this.__add(text,'warning',time);
	}

	/**
	 * add a plain message into the queue.
	 * @param {String} text 
	 *        the content of the message
	 * @param {Number} [time=1000]
	 *        the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.
	 */
	add(text, time = 200){
		this.__add(text,'info',time);
	}
	/**
	 * @private
	 * add the different type of message to the message queue.
	 * @param  {String} text
	 *         the content of the message
	 * @param  {String} [type=info] 
	 *         the type of the message. 'info' - information, 'warning' - warning message, 'error' - error message.
	 * @param  {Number} [time=1000]
	 *         the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.
	 */
	__add(text, type='info', time = 1000){
		const div = MessageQueue.createBullet(text, type);
		this.setting.position.includes('bottom')?this.elt.appendChild(div):this.elt.insertBefore(div, this.elt.firstChild);
		if(this.setting.position.includes('right')) div.classList.add('right');
		
		div.addEventListener('webkitTransitionEnd', this.__destroy.bind(div));
		div.addEventListener('transitionend', this.__destroy.bind(div));

		setTimeout(function(){
			div.classList.add('hide');
		},time);
	}
	/**
	 * @private
	 * remove the message from the queue
	 * @param  {Event} e
	 *         Event
	 */
	__destroy(e){
		if (e.propertyName == 'opacity') {
			this.parentNode.removeChild(this);
		}
	}

	/**
	 * a static helper that create the message bullet 
	 * @param  {String} text 
	 *         the content of the message
	 * @param  {Strinf} type 
	 *         the type of the message. 'info' - information, 'warning' - warning message, 'error' - error message.
	 * @return {HTMLElement} the div element that represents a message
	 */
	static createBullet(text, type){
		const div = document.createElement('div');
		div.classList.add('bullet');
		div.classList.add(type);
		div.textContent = text;
		return div;
	}

}
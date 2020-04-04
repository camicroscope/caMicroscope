(function () {
	'use strict';

	var RS = function (conf) {
		this.input 			= null;
		this.inputDisplay 	= null;
		this.slider 		= null;
		this.sliderWidth	= 0;
		this.sliderLeft		= 0;
		this.pointerWidth	= 0;
		this.pointerR		= null;
		this.pointerL		= null;
		this.activePointer	= null;
		this.selected 		= null;
		this.scale 			= null;
		this.step 			= 0;
		this.tipL			= null;
		this.tipR			= null;
		this.timeout		= null;
		this.valRange		= false;

		this.values = {
			start:	null,
			end:	null
		};
		this.conf = {
			target: 	null,
			values: 	null,
			set: 		null,
			range: 		false,
			width: 		null,
			scale:		true,
			labels:		true,
			tooltip:	true,
			step: 		null,
			disabled:	false,
			onChange:	null
		};

		this.cls = {
			container:	'rs-container',
			background: 'rs-bg',
			selected: 	'rs-selected',
			pointer: 	'rs-pointer',
			scale: 		'rs-scale',
			noscale:	'rs-noscale',
			tip: 		'rs-tooltip'
		};

		for (var i in this.conf) { if (conf.hasOwnProperty(i)) this.conf[i] = conf[i]; }

		this.init();
	};
	RS.prototype.display = function(isDisplay){
		this.slider.style.display = isDisplay?'':'none';
	}
	RS.prototype.init = function () {
		if (typeof this.conf.target === 'object') this.input = this.conf.target;
		else this.input = document.getElementById(this.conf.target.replace('#', ''));

		if (!this.input) return console.log('Cannot find target element...');

		this.inputDisplay = getComputedStyle(this.input, null).display;
		this.input.style.display = 'none';
		this.valRange = !(this.conf.values instanceof Array);

		if (this.valRange) {
			if (!this.conf.values.hasOwnProperty('min') || !this.conf.values.hasOwnProperty('max'))
				return console.log('Missing min or max value...');
		}
		return this.createSlider();
	};

	RS.prototype.createSlider = function () {
		this.slider = createElement('div', this.cls.container);
		this.slider.innerHTML = '<div class="rs-bg"></div>';
		this.selected = createElement('div', this.cls.selected);
		this.pointerL = createElement('div', this.cls.pointer, ['dir', 'left']);
		//this.scale = createElement('div', this.cls.scale);

		if (this.conf.tooltip) {
			this.tipL = createElement('div', this.cls.tip);
			this.tipR = createElement('div', this.cls.tip);
			this.pointerL.appendChild(this.tipL);
		}
		this.slider.appendChild(this.selected);
		//this.slider.appendChild(this.scale);
		this.slider.appendChild(this.pointerL);

		if (this.conf.range) {
			this.pointerR = createElement('div', this.cls.pointer, ['dir', 'right']);
			if (this.conf.tooltip) this.pointerR.appendChild(this.tipR);
			this.slider.appendChild(this.pointerR);
		}

		this.input.parentNode.insertBefore(this.slider, this.input.nextSibling);

        if (this.conf.width) this.slider.style.width = parseInt(this.conf.width) + 'px';
		this.sliderLeft = this.slider.getBoundingClientRect().left;
		this.sliderWidth = this.slider.clientWidth;
		this.pointerWidth = this.pointerL.clientWidth;

		if (!this.conf.scale) this.slider.classList.add(this.cls.noscale);

		return this.setInitialValues();	
	};

	RS.prototype.setInitialValues = function () {
		this.disabled(this.conf.disabled);

		if (this.valRange) this.conf.values = prepareArrayValues(this.conf);

		this.values.start = 0;
		this.values.end = this.conf.range ? this.conf.values.length - 1 : 0;


		if (this.conf.set && this.conf.set.length && checkInitial(this.conf)) {
			var vals = this.conf.set;

			if (this.conf.range) {
				this.values.start = this.conf.values.indexOf(vals[0]);
				this.values.end = this.conf.set[1] ? this.conf.values.indexOf(vals[1]) : null;
			}
			else this.values.end = this.conf.values.indexOf(vals[0]);
		}
		return this.createScale();
	};

	RS.prototype.createScale = function (resize) {
		this.step = this.sliderWidth / (this.conf.values.length - 1);

		//for (var i = 0, iLen = this.conf.values.length; i < iLen; i++) {
			//var span = createElement('span')
				//ins = createElement('ins');

			//span.appendChild(ins);
			//this.scale.appendChild(span);

			//span.style.width = i === iLen - 1 ? 0 : this.step + 'px';

			// if (!this.conf.labels) {
			// 	if (i === 0 || i === iLen - 1) ins.innerHTML = this.conf.values[i]
			// }
			//else ins.innerHTML = this.conf.values[i];

			//ins.style.marginLeft = (ins.clientWidth / 2) * - 1 + 'px';
		//}
		return this.addEvents();
	};

	RS.prototype.updateScale = function () {
		this.step = this.sliderWidth / (this.conf.values.length - 1);

		var pieces = this.slider.querySelectorAll('span');

		for (var i = 0, iLen = pieces.length; i < iLen; i++)
			pieces[i].style.width = this.step + 'px';

		return this.setValues();
	};

	RS.prototype.addEvents = function () {
		var pointers = this.slider.querySelectorAll('.' + this.cls.pointer),
			pieces = this.slider.querySelectorAll('span');

		createEvents(document, 'mousemove touchmove', this.move.bind(this));
		createEvents(document, 'mouseup touchend touchcancel', this.drop.bind(this));

		for (var i = 0, iLen = pointers.length; i < iLen; i++)
			createEvents(pointers[i], 'mousedown touchstart', this.drag.bind(this));

		for (var i = 0, iLen = pieces.length; i < iLen; i++)
			createEvents(pieces[i], 'click', this.onClickPiece.bind(this));

		window.addEventListener('resize', this.onResize.bind(this));

		return this.setValues();
	};

	RS.prototype.drag = function (e) {
		e.preventDefault();

		if (this.conf.disabled) return;

		var dir = e.target.getAttribute('data-dir');
		if (dir === 'left') this.activePointer = this.pointerL;
		if (dir === 'right') this.activePointer = this.pointerR;

		return this.slider.classList.add('sliding');
	};

	RS.prototype.move = function (e) {
		if (this.activePointer && !this.conf.disabled) {
			var coordX = e.type === 'touchmove' ? e.touches[0].clientX : e.pageX,
				index = coordX - this.sliderLeft - (this.pointerWidth / 2);

			index = Math.round(index / this.step);

			if (index <= 0) index = 0;
			if (index > this.conf.values.length - 1) index = this.conf.values.length - 1;

			if (this.conf.range) {
				if (this.activePointer === this.pointerL) this.values.start = index;
				if (this.activePointer === this.pointerR) this.values.end = index;
			}
			else this.values.end = index;

			return this.setValues();
		}
	};

	RS.prototype.drop = function () {
		this.activePointer = null;
	};

	RS.prototype.setValues = function (start, end) {
		var activePointer = this.conf.range ? 'start' : 'end';

		if (start && this.conf.values.indexOf(start) > -1)
			this.values[activePointer] = this.conf.values.indexOf(start);

		if (end && this.conf.values.indexOf(end) > -1)
			this.values.end = this.conf.values.indexOf(end);

		if (this.conf.range && this.values.start > this.values.end)
			this.values.start = this.values.end;

		this.pointerL.style.left = (this.values[activePointer] * this.step - (this.pointerWidth / 2)) + 'px';

		if (this.conf.range) {
			if (this.conf.tooltip) {
				this.tipL.innerHTML = this.conf.values[this.values.start];
				this.tipR.innerHTML = this.conf.values[this.values.end];
			}
			this.input.value = this.conf.values[this.values.start] + ',' + this.conf.values[this.values.end];
			this.pointerR.style.left = (this.values.end * this.step - (this.pointerWidth / 2)) + 'px';
			this.pointerL.textContent = this.values.start/100;
			this.pointerR.textContent = this.values.end/100;		
		}
		else {
			if (this.conf.tooltip)
				this.tipL.innerHTML = this.conf.values[this.values.end];
			this.input.value = this.conf.values[this.values.end];
			this.pointerL.textContent = this.values.end/100;

		}

		if (this.values.end > this.conf.values.length - 1) this.values.end = this.conf.values.length - 1;
		if (this.values.start < 0) this.values.start = 0;

		this.selected.style.width = (this.values.end - this.values.start) * this.step + 'px';
		this.selected.style.left = this.values.start * this.step + 'px';		

		if(this.isResize==undefined || this.isResize) {
			this.isResize = false;
			return;
		};
		this.isResize = false;
		return this.onChange();
	};

	RS.prototype.onClickPiece = function (e) {

		if (this.conf.disabled) return;

		var idx = Math.round((e.clientX - this.sliderLeft) / this.step);

		if (idx > this.conf.values.length - 1) idx = this.conf.values.length - 1;
		if (idx < 0) idx = 0;

		if (this.conf.range) {
			if (idx - this.values.start <= this.values.end - idx) {
				this.values.start = idx;
			}
			else this.values.end = idx;
		}
		else this.values.end = idx;

		this.slider.classList.remove('sliding');

		return this.setValues();
	};

	RS.prototype.isDisabled = function(){
		return this.slider.classList.contains('disabled');	
	}
	
	RS.prototype.onChange = function () {
		var _this = this;

		if (this.timeout) clearTimeout(this.timeout);

		this.timeout = setTimeout(function () {
			if (_this.conf.onChange && typeof _this.conf.onChange === 'function') {			
				return _this.conf.range?_this.conf.onChange(_this.values.start/100,_this.values.end/100):_this.conf.onChange(_this.input.value);
			}
		}, 500);
	};

	RS.prototype.onResize = function () {
		this.isResize = true;
		this.sliderLeft = this.slider.getBoundingClientRect().left;
		this.sliderWidth = this.slider.clientWidth;
		this.pointerWidth = this.pointerL.clientWidth;
		return this.updateScale();
	};

	RS.prototype.disabled = function (disabled) {
		this.conf.disabled = disabled;
		this.slider.classList[disabled ? 'add' : 'remove']('disabled');
	};

	RS.prototype.getValue = function () {
		return this.conf.range?[this.values.start/100,this.values.end/100]:this.input.value;
	};

	RS.prototype.destroy = function () {
		this.input.style.display = this.inputDisplay;
		this.slider.remove();
	};

	var createElement = function (el, cls, dataAttr) {
		var element = document.createElement(el);
		if (cls) element.className = cls;
		if (dataAttr && dataAttr.length === 2)
			element.setAttribute('data-' + dataAttr[0], dataAttr[1]);

		return element;
	},

	createEvents = function (el, ev, callback) {
		var events = ev.split(' ');

		for (var i = 0, iLen = events.length; i < iLen; i++)
			el.addEventListener(events[i], callback);
	},

	prepareArrayValues = function (conf) {
		var values = [],
			range = conf.values.max - conf.values.min;

		if (!conf.step) {
			console.log('No step defined...');
			return [conf.values.min, conf.values.max];
		}

		for (var i = 0, iLen = (range / conf.step); i < iLen; i++)
			values.push(conf.values.min + i * conf.step);

		if (values.indexOf(conf.values.max) < 0) values.push(conf.values.max);

		return values;
	},

	checkInitial = function (conf) {
		if (!conf.set || conf.set.length < 1) return null;
		if (conf.values.indexOf(conf.set[0]) < 0) return null;

		if (conf.range) {
			if (conf.set.length < 2 || conf.values.indexOf(conf.set[1]) < 0) return null;
		}
		return true;
	};

	window.rangeSlider = RS;

})();
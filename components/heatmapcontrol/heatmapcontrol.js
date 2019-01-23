// heatmapcontrol.js
// 
function HeatmapControl(options){
	this.name = 'HeatmapControl';
	/*
		list:[
			{
				id: ,
				title: ,
				icon: ,
				content:string
				isExpand:,
				
			}
		]
	*/ 
	this.setting = {
		fields:null,
		mode:null,
		currentField:null,
		onChange:null,
		onOpacityChange:null
	}

	extend(this.setting, options);

	// attach container element
	this.elt = document.getElementById(this.setting.id);
	if(!this.elt && this.setting.element){
		this.elt = this.setting.element;
	}

	if(!this.elt){
		// create main
		this.elt = document.createElement('div');
	}

	//create UI
	this.__refresh();

}
/**
 * @private
 * __refresh refresh UI part accoding to this.setting
 */
HeatmapControl.prototype.__refresh = function(){
	empty(this.elt);
	this.elt.classList.add('hmc-container');
	this.radiosName = randomId();
	this.rangeSliders = {};
	const template = `
	<div class='mode-panel'>
	<label> Binal <input name='${this.radiosName}' type='radio' value='binal' ${this.setting.mode == 'binal'? 'checked':''} /></label>
	<label> Gradient <input name='${this.radiosName}' type='radio' value='gradient' ${this.setting.mode == 'gradient'? 'checked':''} /></label>
	</div>
	<div class='sel-field-panel'>
	<select></select>
	</div>
	<label>Properties:</label>
	<div class='fields-panel'>

	</div>
	<label>Opacity:</label>
	<div class='opacity-panel'>
	</div>
	`;
	this.elt.innerHTML = template;
	const radios = this.elt.querySelectorAll('.mode-panel input');
	radios.forEach( radio=> {
		radio.addEventListener('change', this._modeChanged.bind(this));
	});
	//
	this.rangeSliders = {};
	createSelect(this.elt.querySelector('.sel-field-panel select') ,this.setting.fields);
	this.elt.querySelector('.sel-field-panel select').addEventListener('change', this._selChanged.bind(this));
	if(this.setting.mode=='binal') this.elt.querySelector('.sel-field-panel').style.display='none';
	


	const fieldsPanel = this.elt.querySelector('.fields-panel');
	this.setting.fields.forEach(f=>{
		 this.rangeSliders[f.name] = createField(fieldsPanel,f,this.__change.bind(this));
	},this);
	this.opacitySliders = {};
	const opacitiesPanel = this.elt.querySelector('.opacity-panel');
	this.setting.opacities.forEach(f=>{
		 this.opacitySliders[f.name] = createOpacities(opacitiesPanel,f,this.__opacityChange.bind(this));
	},this);	

}

HeatmapControl.prototype._modeChanged = function(){
	const mode = document.querySelector(`.mode-panel input[name=${this.radiosName}]:checked`)
	if(mode.value=='binal'){
		this.elt.querySelector('.sel-field-panel').style.display='none';
		this.setting.fields.forEach( f=> {
			// statements
			this.rangeSliders[f.name].slider.parentNode.style.display='';
			this.rangeSliders[f.name].disabled(false);
		},this);
	}else if(mode.value=='gradient'){

		this.elt.querySelector('.sel-field-panel').style.display='';
		const selectedField = this.elt.querySelector('.sel-field-panel select').value;
		this.rangeSliders[selectedField].slider.parentNode.style.display='';
		this.rangeSliders[selectedField].disabled(false);
		this.setting.fields.forEach( f=> {
			// statements
			if(f.name !== selectedField) {
				this.rangeSliders[f.name].slider.parentNode.style.display='none';
				this.rangeSliders[f.name].disabled(true);
			}

		},this);
	}
	this.__change.call(this);
}

HeatmapControl.prototype._selChanged = function(e){
		const selectedField = this.elt.querySelector('.sel-field-panel select').value;
		this.rangeSliders[selectedField].slider.parentNode.style.display = '';
		this.rangeSliders[selectedField].disabled(false);
		this.setting.fields.forEach( f=> {
			// statements
			if(f.name !== selectedField) {
				this.rangeSliders[f.name].slider.parentNode.style.display = 'none';
				this.rangeSliders[f.name].disabled(true);
			}
		},this);
		this.__change.call(this);
}
HeatmapControl.prototype.resize = function(){
	this.setting.fields.forEach( f => {
		// statements
		this.rangeSliders[f.name].onResize();
	},this);

	this.setting.opacities.forEach( f => {
		// statements
		this.opacitySliders[f.name].onResize();
	},this);
}
HeatmapControl.prototype.__change = function(){
	if(this.setting.onChange && typeof this.setting.onChange === 'function'){
		const mode = document.querySelector(`.mode-panel input[name=${this.radiosName}]:checked`).value;
		const fields = [];
		const field = {};
		const data = {
			mode:mode
		}
		if(mode=='binal'){
			this.setting.fields.forEach( f=> {
				fields.push({name:f.name,range:this.rangeSliders[f.name].getValue()});
			});
			data.fields = fields;
		}else if(mode=='gradient'){
			const selectedField = this.elt.querySelector('.sel-field-panel select').value;
			field.name = selectedField;
			field.range = this.rangeSliders[selectedField].getValue();
			data.field = field;
		}
		this.setting.onChange(data);
	}
}
HeatmapControl.prototype.__opacityChange = function(){
	if(this.setting.onChange && typeof this.setting.onChange === 'function'){
		const data = {};
		this.setting.opacities.forEach( f => {
			data[f.name] = this.opacitySliders[f.name].getValue()/100;
		});
		this.setting.onOpacityChange(data);
	}
}

function createSelect(sel, fields){
	fields.forEach(field => {
		var option = document.createElement('option');
		option.text = field.name;
		option.value = field.name;
		sel.add(option);
	});
}
function createField(container, field, changeFunc){
	const div = document.createElement('div');
	const label = document.createElement('label');
	label.textContent = field.name;
	const slider = document.createElement('input');
	slider.type = 'text';
	slider.name = field.name;
	//rangeSlider.
	div.appendChild(label);
	div.appendChild(slider);
	const rs = new rangeSlider({
        target: slider,
        values: {min:field.range[0]*100,max:field.range[1]*100},
        step:1,
        range: true,
        tooltip: false,
        scale: false,
        labels: false,
        set: [field.thresholds[0]*100, field.thresholds[1]*100],
        onChange:changeFunc
	});
	container.appendChild(div);
	return rs;
}
function createOpacities(container, field, changeFunc){
	const div = document.createElement('div');
	const label = document.createElement('label');
	label.textContent = field.name;
	const slider = document.createElement('input');
	slider.type = 'text';
	slider.name = field.name;
	//rangeSlider.
	div.appendChild(label);
	div.appendChild(slider);
	const rs = new rangeSlider({
        target: slider,
        values: {min:0,max:100},
        step:1,
        range: false,
        tooltip: false,
        scale: false,
        labels: false,
        set: [field.value*100],
        onChange:changeFunc
	});
	container.appendChild(div);
	return rs;
}
// function createRadios(mode){
// 	const radios = {
// 		binal:document.createElement('input'),
// 		gradient:document.createElement('input')
// 	};
// 	 = randomId();
// 	radios['binal'].value = 'binal';
// 	radios['binal'].name = 'binal';

// }
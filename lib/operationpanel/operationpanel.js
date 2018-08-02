

function OperationPanel(options){
	this.name = 'OperationPanel';
	// DOM elts
	/**
     * @property {Element} elt The element to append the toolbar's container element to.
     */
	this.elt;
	// default setting
	this.setting = {
		zIndex:600,
		title:'',
		// list pairs
		// btn -> event
		// may be it can be extension in future... 
		action:{
			text:'Submit',
			title:'submit form',

		}		
	}

	this._form_;
	
	this._head_;
	this._select_;

	this._ctrl_;
	this._reset_;
	this._action_;


	// setting options
	extend(this.setting, options);

	// check form schema
	if(!this.setting.formSchemas || this.setting.formSchemas.length == 0){
		error(`${this.name}:No Form Schema ...`);
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
	this.elt.style.zIndex = this.setting.zIndex;


	this.__refresh();
}


OperationPanel.prototype.__refresh = function(){
	empty(this.elt);
	this.elt.classList.add('operations');

	const schemas = this.setting.formSchemas;


	//
	this._head_ = document.createElement('div');
	this._head_.classList.add('head');
	let lab = document.createElement('label');
	lab.textContent = this.setting.title;
	this._head_.appendChild(lab);



	// create select if multiple schema
	this._select_ = document.createElement('select');
	this._select_.classList.add('pure-form-item');
	schemas.forEach((schema, idx) => {
		const opt = document.createElement('option');
		opt.text = schema.id;
		opt.value = idx;
		this._select_.add(opt);
	});

	if(schemas.length < 2) this._select_.style.display = 'none';
	
	this._head_.appendChild(this._select_);
	this.elt.appendChild(this._head_);
	// add event
	this._select_.addEventListener('change', this.__formChange.bind(this));

	// create form area
	this._form_ = document.createElement('pure-form');
	this._form_.schema = this.setting.formSchemas[0];
	this.elt.appendChild(this._form_);


	// create control
	this._ctrl_ = document.createElement('div');
	this._ctrl_.classList.add('foot');
	this._reset_ = document.createElement('button');
	this._reset_.classList.add('reset');
	this._reset_.textContent = 'Reset';
	this._reset_.style.float = 'left';
	this._ctrl_.appendChild(this._reset_);

	this._action_ = document.createElement('button');
	this._action_.classList.add('action');
	this._action_.textContent = this.setting.action.title;
	this._action_.style.float = 'right';
	this._ctrl_.appendChild(this._action_);

	this.elt.appendChild(this._ctrl_);

	this._reset_.addEventListener('click', ()=>{
		this.clear();
	});
	// event action
	this._action_.addEventListener('click', function(){
		this.setting.action.callback.call(null, {
			id:this._select_.value,
			data:this._form_.value
		});
	}.bind(this));
	this.setting.action.callback;

	
}

OperationPanel.prototype.__formChange = function(){
	// body... 
	//
	console.log(this._select_.value);
	this._form_.schema = this.setting.formSchemas[this._select_.value];
}

OperationPanel.prototype.clear = function(){
	this._form_.reset();
}





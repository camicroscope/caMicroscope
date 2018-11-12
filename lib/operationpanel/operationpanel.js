// proposal
// test:
// constructor single form
// constructor multiple forms
// form switch control
// clear
// callback
// check/validate the data

/**
 * A operation panel that reads the single or multiple JSON schema and generates the data form and form control.
 * 
 * Dependency:
 * 	lib/pureform/pure-form.js
 * 	lib/pureform/pure-form.css
 * 	
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a operation panel.
 * @param {JSON Schemas} options.formSchemas
 *                       The list of JSON Schemas are used to create the data form.
 * @param {String} [options.id]
 *        The container id for operation panel. The all panel'instance will be stored into this.elt if the id empty.
 * @param {String} [options.zIndex=600]
 *        The z index of Intance on webpage.
 * @param {String} [options.title='']
 *        The title of the select control for changing the data form.
 * @param {Object} [options.action]
 *        The action options to configurate the text, title and action of callback on the action btn
 * @param {String} [options.action.text='Submit']
 *        The text of action btn
 * @param {String} [options.action.title='submit form']
 *        The text of hint on the action btn.                                       
 * @param {Function} [options.action.callback]
 *        The callback function of the action btn.
 */
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
		//formSchemas
		// list pairs
		// btn -> event
		// may be it can be extension in future...
		// formSchemas 
		action:{
			text:'Submit',
			title:'submit form'

		}		
	}
	
	/**
	 * @property {Element} _form_ The instance of pure-form, the core of Operation Panel, generates the data form on UI
	 */
	this._form_;
	
	/**
	 * @property {Element} _head_ The Head part of UI, includes head title and options for multiple data form.
	 */
	this._head_;
	
	/**
	 * @property {Element} _select_ The select controls to switch the multiple data form.
	 */
	this._select_;
	
	/**
	 * @property {Element} _ctrl_ the UI part that controls the form actions - reset/clean data form or submit data form.
	 */
	this._ctrl_;
	
	/**
	 * @property {Element} _reset_ The reset btn for data form.
	 */
	this._reset_;
	/**
	 * @property {Element} _action_ The action btn for data form.
	 */
	this._action_;


	// setting options
	extend(this.setting, options);

	


	this.elt = document.getElementById(this.setting.id);
	if(!this.elt && this.setting.element){
		this.elt = this.setting.element;
	}

	if(!this.elt){
		// create main
		this.elt = document.createElement('div');

	}

	// check form schema
	if(!this.setting.formSchemas || this.setting.formSchemas.length == 0){
		//console.error(`${this.name}:No Form Schema ...`);
		this.elt.textContent = `${this.name}:No Form Schema ...`;
		return;
	}
	if(!this.setting.action || !this.setting.action.callback){
		//console.error(`${this.name}:No Action ...`);
		this.elt.textContent = `${this.name}:No Action ...`;
		return;
	}
	this.elt.style.zIndex = this.setting.zIndex;


	this.__refresh();
}

/**
 * @private
 * __refresh refresh UI part accoding to this.setting
 */
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
	this._form_.validateOnBlur = true;
	this._form_.schema = this.setting.formSchemas[0];

	if(this._form_.schema.autofocusError)
		this._form_.autofocusError = this._form_.schema.autofocusError;
	if(this._form_.schema.autofocusId)
		this._form_.autofocusId = this._form_.schema.autofocusId;

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
	this._action_.textContent = this.setting.action.title||'Submit';
	this._action_.style.float = 'right';
	//this._action_.disabled = true;
	this._ctrl_.appendChild(this._action_);
	this.elt.appendChild(this._ctrl_);

	this._reset_.addEventListener('click', ()=>{
		this.clear();
	});
	// event action
	this._action_.addEventListener('click', function(){
		if(!this._form_.isValid()){
			console.log('error');
			return;
		}

		this.setting.action.callback.call(null, {
			id:this.setting.formSchemas[this._select_.value].id,
			data:this._form_.value
		});
	}.bind(this));

	// this._form_.addEventListener('pure-form-validation-failed', function(e) {
 //    	console.log('failded') // form value
 //    	console.log(e);
 //    	//this._action_.disabled = true;
	// }.bind(this));	
	
	// this._form_.addEventListener('pure-form-validation-passed', function(e) {
 //    	console.log('passed');      // pure form element
 //    	console.log(e);
 //    	//this._action_.disabled = false;
	// }.bind(this));
	
}

/**
 * @private
 * __formChange the action that will change the data form if there are multiple froms.
 */
OperationPanel.prototype.__formChange = function(e){
	this._form_.schema = this.setting.formSchemas[this._select_.value];
	if(this._form_.schema.autofocusError)
		this._form_.autofocusError = this._form_.schema.autofocusError;
	if(this._form_.schema.autofocusId)
		this._form_.autofocusId = this._form_.schema.autofocusId;
	
	//this._action_.disabled = true;
}

/**
 * clear and reset current data form
 */
OperationPanel.prototype.clear = function(){
	this._form_.clearErrors();
	this._form_.reset();
	//this._action_.disabled = true;
}





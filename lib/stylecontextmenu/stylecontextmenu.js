// stylecontextmenu.js
// proposal:
// test:
// constructor
// open
// close
// events
// extended btns
// get style
// 

/**
 * @constructor
 * The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.
 * 
 * The event that Style Context Menu support
 * style-changed: Raised when any controls that is relative with the style.
 * draw-mode-changed: Raised when draw mode changed
 * draw: Raised when draw btn is clicked
 * clear: Raised when clear btn is clicked
 * undo: Raised when undo btn is clicked
 * redo: Raised when redo btn is clicked
 * @param {Element} target
 *        the THML element will popup the context menu
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a style context menu.
 * @param {Array} [options.btns]
 *        extend btns
 * @param {String} options.btns.title
 *        The text of hint on the btn
 * @param {String} options.btns.class
 *        The css class on teh action btn
 * @param {String} options.btns.text
 *        The text of action btn
 * @param {String} options.btns.type
 *        The type of btns
 * @param {Function} options.btns.callback
 *        The callback function of the action btn
 * 
 */
function StyleContextMenu(target,options){
    // events
    this.events = {};
    // modeName for getting the draw mode
    this.modeName = randomId();

    // pre config the btns of control - draw, undo, redo, clear
    this.__json = [
        [{
            title:'Draw',
            class:'material-icons',
            text:'create',
            type:'checkbox',
            callback:this.toggleDraw.bind(this)

        },{
            title:'Undo',
            class:'material-icons',
            text:'undo',
            type:'btn',
            callback:this.undo.bind(this)
        },{
            title:'Redo',
            class:'material-icons',
            text:'redo',
            type:'btn',
            callback:this.redo.bind(this)
        },{
            title:'Clear',
            class:'material-icons',
            text:'layers_clear',
            type:'btn',
            callback:this.clear.bind(this)
        }],
        [{
            title:'Free Draw',
            class:'material-icons',
            text:'gesture',
            type:'radio',
            value:'free',
            name:this.modeName,
            checked:true,
            callback:this.setDrawMode.bind(this)
        },{
            title:'Rectangle',
            class:'material-icons',
            text:'crop_portrait',
            type:'radio',
            value:'rect',
            name:this.modeName,
            callback:this.setDrawMode.bind(this)
        },{
            title:'Square',
            class:'material-icons',
            text:'crop_din',
            type:'radio',
            value:'square',
            name:this.modeName,
            callback:this.setDrawMode.bind(this)
        }]
    ];

    this.className = 'StyleContextMenu';

    this.isInitColor = false;
    
    /**
     * @property {Element} elt the instance of style context menu in HTML Element.
     */
    this.elt = null;
    
    /**
     * @property {Element} target the element will triggle the context menu
     */
    this.target = target;
    
    /**
     * @property {Element} the div of the control includes all control's btns. 'draw', 'undo', 'redo', 'clear'.
     */
    this.ctrl;
    
    /**
     * @property {Element} a input element with type='range' to control the width of drawing line.
     */
    this.lineWidth;
    
    /**
     * @property {Element} a color picker component controls the color of the style.
     */
    this.color;
    
    /**
     * @property {Array} the list of extended btns for context menu.
     */
    this.btnGroup;


    // default setting
    this.setting = {
        //id: container id
        // line weight
        range:{
            min:1,
            max:25,
            value:3
        },
        // default line color
        color:'#7CFC00',
        width:150,
        zIndex:650
        // btns [{text,title,callback}]
    }
    
    // user setting
    extend(this.setting, options);
    if(!this.target){
        console.error(`${this.className}:No TARGET to operation`);
        return;
    }

    this.elt = document.getElementById(this.setting.id);
    if(!this.elt && this.setting.element){
        this.elt = this.setting.element;
    }

    if(!this.elt){
        // create main
        this.elt = document.createElement('div');
        document.body.appendChild(this.elt);

    }
    this.elt.style.width = `${this.setting.width}px`;
    this.elt.style.zIndex = this.setting.zIndex;
    this.elt.classList.add('context-menu');
    // create UI 
    this.__refresh();
}

/**
 * @private 
 * refresh compoment bases on the setting.
 */
StyleContextMenu.prototype.__refresh = function(){
    empty(this.elt);
    
    /* control start */
    // create control
    const ctrlItem = document.createElement('div'); 
    ctrlItem.classList.add('context-item'); 
    this.ctrl = StyleContextMenu.createFromJson(ctrlItem,this.__json[0]);
    
    this.elt.appendChild(ctrlItem); 
    /* control end */

    /* line weight control start */
    // create line width
    const weightItem = document.createElement('div'); 
    weightItem.classList.add('context-item');    
    
    // label for line weight
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('material-icons');
    titleDiv.classList.add('item-label');
    titleDiv.textContent = 'line_weight';
    weightItem.appendChild(titleDiv);

    // range for line weight
    const range = document.createElement('input');
    range.type = 'range';
    range.value = this.setting.range.value;
    range.max = this.setting.range.max;
    range.min = this.setting.range.min;
    weightItem.appendChild(range);
    this.lineWidth = range;
    // index for line weight
    const indexDiv = document.createElement('div');
    indexDiv.classList.add('item-label');
    indexDiv.textContent = this.setting.range.value;
    indexDiv.style.fontSize = '1.5rem';
    weightItem.appendChild(indexDiv);

    this.elt.appendChild(weightItem);

    // bind event
    
    range.addEventListener('change',(e)=>{
        indexDiv.textContent = range.value;

        // style change TODO
        this.raiseEvent('style-changed',{style:this.getStyle()});
        // this.DRAW.style.lineWidth = +range.value;
    });
    range.addEventListener('mousemove',(e)=>{
        indexDiv.textContent = range.value;
        // style change TODO
        this.raiseEvent('style-changed',{style:this.getStyle()});
        // this.DRAW.style.lineWidth = +range.value;
    });
    /* line weight control end */


    /* draw mode control start */
    // create draw mode
    const modeItem = document.createElement('div'); 
    modeItem.classList.add('context-item');    
    StyleContextMenu.createFromJson(modeItem,this.__json[1]);
    this.elt.appendChild(modeItem);
    /* draw mode control end */


    /* color control start */    
    // create color
    const colorItem = document.createElement('div'); 
    colorItem.classList.add('context-item');
    
    // color input
    const color = document.createElement('input');
    color.type= 'text';
    color.value = this.setting.color;
    color.style.display = 'none';
    colorItem.appendChild(color);
    this.color = color;
    // picker 
    this.picker = document.createElement('div');
    this.picker.classList.add('picker');
    colorItem.appendChild(this.picker);
    this.elt.appendChild(colorItem);
    /* color control end */

    /* extra btn group start */
    // create btn group (maybe)
    if(this.setting.btns){
        const btnsItem = document.createElement('div'); 
        btnsItem.classList.add('context-item');
        this.btnGroup = StyleContextMenu.createFromJson(btnsItem,this.setting.btns);
        this.elt.appendChild(btnsItem);
    }
    /* extra btn group end */

    


    

    /* event for open and close context menu */
    this.target.addEventListener('contextmenu', e=>{
      // open context menu
      this.open({x:e.clientX,y:e.clientY});
      e.preventDefault();
    });
    this.target.addEventListener('click', e=>{
        // close context menu
        this.close(e);
    });

};

/**
 * @private
 * setDrawMode and call draw-mode-changed event
 */
StyleContextMenu.prototype.setDrawMode = function(){
    const mode = document.querySelector(`input[name=${this.modeName}]:checked`).value;
    //this.DRAW.drawMode = mode;
    this.raiseEvent('draw-mode-changed',{mode:mode});
}

/**
 * close the context menu
 * @param  {Event} [e] the event of the HTML element
 */
StyleContextMenu.prototype.close = function(e){
    if(!e){
        this.elt.style.display = 'none';
        this.elt.style.top = '-1000px';
        this.elt.style.left = '-1000px';
        return;
    }

    const isClickOnMenu = clickInsideElement( e, 'context-menu' );
    if ( isClickOnMenu ) return;
    this.elt.style.display = 'none';
    this.elt.style.top = '-1000px';
    this.elt.style.left = '-1000px';
}

/**
 * open the context menu by using the position on the screen
 * @param  {Point} point
 *         the coordinates of the screen. point has to have x and y.
 */
StyleContextMenu.prototype.open = function(point){
    this.elt.style.display = 'block';
    
    if( window.innerWidth > point.x + this.elt.offsetWidth){
        this.elt.style.left = point.x+'px';
    }else{
        this.elt.style.left = (point.x - this.elt.offsetWidth)+'px';
    }

    if(window.innerHeight > point.y + this.elt.offsetHeight){
        this.elt.style.top = point.y+'px';
    }else{
        this.elt.style.top = (point.y - this.elt.offsetHeight)+'px';
    }
    if(!this.isInitColor){
        this.createColor(this.color,this.picker);
        this.isInitColor = true;
    }
    // TODO open event
}

/**
 * get the current style states on the context menu 
 * @return {Object} the data of the style
 *                      {color, lineWidth, lineJoin, lineCap}
 */
StyleContextMenu.prototype.getStyle = function(){
    return {
        color:this.color.value,
        lineWidth:this.lineWidth.value,
        lineJoin:'round', // "bevel" || "round" || "miter"
        lineCap:'round' // "butt" || "round" || "square"
    }
};

/**
 * @private
 * toggleDraw callback function when the draw mode changed.
 */
StyleContextMenu.prototype.toggleDraw = function(){
    this.raiseEvent('draw',{draw:this.ctrl[0].checked});
}

/**
 * @private
 * clear callback function when the clear btn was clicked.
 */
StyleContextMenu.prototype.clear = function(){
    this.raiseEvent('clear',{});
}

/**
 * @private
 * redo callback function when the redo btn was clicked.
 */
StyleContextMenu.prototype.redo = function(){
    this.raiseEvent('redo',{});
}

/**
 * @private
 * undo callback function when the undo btn was clicked.
 */
StyleContextMenu.prototype.undo = function(){
    this.raiseEvent('undo',{});
}


/**
 * @private
 * the method to create the color picker and attach the event on the color picker
 * @param  {Element} color
 *         the input that is used to record the color value 
 * @param  {Element} p
 *         the entire color picker 
 */
StyleContextMenu.prototype.createColor = function(color, p){
    const code = document.createElement('input');
    code.className = 'color-code';
    code.pattern = '^#[A-Fa-f0-9]{6}$';
    code.type = 'text';
    
    const self = this;
    let picker = new CP(color, false, p);
    picker.on("change", function(color) {
        this.target.value = '#' + color;
        code.value = '#' + color;
        self.raiseEvent('style-changed',{style:self.getStyle()});
    });
    picker.on("enter", function() {
        code.value = '#' + CP._HSV2HEX(this.get());
        self.raiseEvent('style-changed',{style:self.getStyle()});
    });
    picker.picker.firstChild.appendChild(code);

    picker.fit = function() { // do nothing ...
        this.picker.style.position = 'relative'
        this.picker.style.left = this.picker.style.top = 0;
    };
    picker.picker.classList.add('static');
    picker.enter();

    function update() {
        if (this.value.length) {
            picker.set(this.value);
            picker.fire("change", [this.value.slice(1)]);
        }
    }

    code.oncut = update;
    code.onpaste = update;
    code.onkeyup = update;
    code.oninput = update;
}

/**
 * @static
 * create the btns form json config and append the btns to parent element
 * @param  {Element} parent
 *         the element that the btns will append to.
 * @param  {Object} item
 *         the config of the btns
 */
StyleContextMenu.createFromJson = function(parent,item){
    const btns = [];
    for (var i = 0; i < item.length; i++) {
        const btn = 
            item[i].type=='btn'?
            StyleContextMenu.createBtn(parent,item[i]):
            StyleContextMenu.createInput(parent,item[i])
        btns.push(btn);
    }
    return btns;
}

/**
 * @static
 * create the input according to the config
 * @param  {Element} parent
 *         a HTML Element that the btns will append to it
 * @param  {Object} opt
 *         the config of the btn  
 */
StyleContextMenu.createInput = function(parent,opt){
    const id = randomId();
    const label = document.createElement('label');
    label.htmlFor = id;
    
    label.title = opt.title;
    label.classList.add(opt.class);
    label.textContent = opt.text;
    const btn = document.createElement('input');
    btn.id = id;
    btn.type = opt.type;
    if(opt.value) btn.value = opt.value;
    if(opt.checked) btn.checked = opt.checked;
    if(opt.name) btn.name = opt.name;
    if(opt.type == 'radio')btn.addEventListener('click', opt.callback);
    if(opt.type == 'checkbox')btn.addEventListener('change', opt.callback);
    parent.appendChild(btn);
    parent.appendChild(label);
    return btn;
}

/**
 * @static
 * createBtn a factory method to create btn bases on options and attach them to parent elmenet
 * @param  {Element} parent
 *         a HTML Element that the btns will append to it
 * @param  {Object} opt
 *         the config of the btn
 */
StyleContextMenu.createBtn = function(parent,opt){
    const btn = document.createElement('button');
    btn.title = opt.title;
    btn.classList.add(opt.class);
    btn.textContent = opt.text;
    btn.addEventListener('click', opt.callback);
    parent.appendChild(btn);
    return btn;
}

/**
 * Add an event handler for a given event.
 * @function
 * @param {String} eventName - Name of event to register.
 * @param {OpenSeadragon.EventHandler} handler - Function to call when event is triggered.
 * @param {Object} [userData=null] - Arbitrary object to be passed unchanged to the handler.
 */
StyleContextMenu.prototype.addHandler = function ( eventName, handler, userData ) {
    var events = this.events[ eventName ];
    if ( !events ) {
        this.events[ eventName ] = events = [];
    }
    if ( handler && typeof handler === 'function' ) {
        events[ events.length ] = { handler: handler, userData: userData || null };
    }
}

/**
 * Remove a specific event handler for a given event.
 * @function
 * @param {String} eventName - Name of event for which the handler is to be removed.
 * @param {OpenSeadragon.EventHandler} handler - Function to be removed.
 */
StyleContextMenu.prototype.removeHandler = function ( eventName, handler ) {
    var events = this.events[ eventName ],
        handlers = [],
        i;
    if ( !events ) {
        return;
    }
    if ( $.isArray( events ) ) {
        for ( i = 0; i < events.length; i++ ) {
            if ( events[i].handler !== handler ) {
                handlers.push( events[ i ] );
            }
        }
        this.events[ eventName ] = handlers;
    }
}


/**
 * Remove all event handlers for a given event type. If no type is given all
 * event handlers for every event type are removed.
 * @function
 * @param {String} eventName - Name of event for which all handlers are to be removed.
 */
StyleContextMenu.prototype.removeAllHandlers = function( eventName ) {
    if ( eventName ){
        this.events[ eventName ] = [];
    } else{
        for ( var eventType in this.events ) {
            this.events[ eventType ] = [];
        }
    }
},

/**
 * Get a function which iterates the list of all handlers registered for a given event, calling the handler for each.
 * @function
 * @param {String} eventName - Name of event to get handlers for.
 */
StyleContextMenu.prototype.getHandler = function ( eventName ) {
    var events = this.events[ eventName ];
    if ( !events || !events.length ) {
        return null;
    }
    events = events.length === 1 ?
        [ events[ 0 ] ] :
        Array.apply( null, events );
    return function ( source, args ) {
        var i,
            length = events.length;
        for ( i = 0; i < length; i++ ) {
            if ( events[ i ] ) {
                args.eventSource = source;
                args.userData = events[ i ].userData;
                events[ i ].handler( args );
            }
        }
    };
},

/**
 * Trigger an event, optionally passing additional information.
 * @function
 * @param {String} eventName - Name of event to register.
 * @param {Object} eventArgs - Event-specific data.
 */
 StyleContextMenu.prototype.raiseEvent = function( eventName, eventArgs ) {
    //uncomment if you want to get a log of all events
    //$.console.log( eventName );
    var handler = this.getHandler( eventName );

    if ( handler ) {
        if ( !eventArgs ) {
            eventArgs = {};
        }

        handler( this, eventArgs );
    }
}



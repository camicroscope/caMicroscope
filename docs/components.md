<a name="CaMessage"></a>

## CaMessage
**Kind**: global class  

* [CaMessage](#CaMessage)
    * [new CaMessage(options)](#new_CaMessage_new)
    * [.elt](#CaMessage+elt)
    * [.reset()](#CaMessage+reset)
    * [.changeTxt(txt)](#CaMessage+changeTxt)

<a name="new_CaMessage_new"></a>

### new CaMessage(options)
CaMicroscope CaMessage. A message component that show the message permanently or temporarily


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | All required and optional settings for instantiating a new instance of a CaMessage. |
| options.id | <code>String</code> | Id of the element to append the CaMessage's container element to. |

<a name="CaMessage+elt"></a>

### caMessage.elt
**Kind**: instance property of [<code>CaMessage</code>](#CaMessage)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elt | <code>Element</code> | The element to append the CaMessage's container element to. |

<a name="CaMessage+reset"></a>

### caMessage.reset()
reset the message's content to default

**Kind**: instance method of [<code>CaMessage</code>](#CaMessage)  
<a name="CaMessage+changeTxt"></a>

### caMessage.changeTxt(txt)
set the message's text

**Kind**: instance method of [<code>CaMessage</code>](#CaMessage)  

| Param | Type | Description |
| --- | --- | --- |
| txt | <code>String</code> | text that show on CaMessage |

<a name="CollapsibleList"></a>

## CollapsibleList
**Kind**: global class  

* [CollapsibleList](#CollapsibleList)
    * [new CollapsibleList(options, list, [changeCallBack])](#new_CollapsibleList_new)
    * [.__v_models](#CollapsibleList+__v_models)
    * [.setList(list)](#CollapsibleList+setList)
    * [.__refresh()](#CollapsibleList+__refresh)
    * [.triggerContent(itemId, [action])](#CollapsibleList+triggerContent)
    * [.addContent(itemId, elt)](#CollapsibleList+addContent)
    * [.clearContent(itemId)](#CollapsibleList+clearContent)

<a name="new_CollapsibleList_new"></a>

### new CollapsibleList(options, list, [changeCallBack])
CaMicroscope Collapsible List. the item in this list consists of the item's head and the item's body.
Click on the head, if item's body is collapsed then expand it, if not, then expand it. Only one of item can be expanded.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | All required and optional settings for instantiating a new instance of a Collapsible List. |
| options.id | <code>String</code> |  | Id of the element to append the Collapsible List's container element to. |
| list | <code>Array.&lt;Object&gt;</code> |  | The list of items in Collapsible List |
| list.id | <code>String</code> |  | Item id, which uses to query item |
| list.title | <code>String</code> |  | Item text title |
| [list.icon] | <code>String</code> |  | The name of material-icons for the item icon |
| list.content | <code>String</code> \| <code>Element</code> |  | The content that the item body has. |
| [list.isExpand] | <code>String</code> | <code>false</code> | The content expand or not. |
| [changeCallBack] | <code>function</code> |  | when the expanded item changes the event is fired. Return {id: item id,isExpand: the state of current item[expand or not]} |

<a name="CollapsibleList+__v_models"></a>

### collapsibleList.__v_models
**Kind**: instance property of [<code>CollapsibleList</code>](#CollapsibleList)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| __v_models | <code>Array.&lt;Object&gt;</code> |  | The view model |
| __v_models.id | <code>String</code> |  | the id that identifies the item |
| __v_models.title | <code>String</code> |  | the title that shows in the head part |
| __v_models.icon | <code>String</code> |  | The name of material-icons for the item icon |
| __v_models.content | <code>String</code> |  | The content that the item body has. |
| [__v_models.isExpand] | <code>String</code> | <code>false</code> | The item is expanded or not. |

<a name="CollapsibleList+setList"></a>

### collapsibleList.setList(list)
set the item list. UI refresh automatically.

**Kind**: instance method of [<code>CollapsibleList</code>](#CollapsibleList)  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>Array.&lt;object&gt;</code> | The list of items in Collapsible List |
| list.id | <code>String</code> | Item id, which uses to query item |
| list.title | <code>String</code> | Item text title |
| [list.icon] | <code>String</code> | The name of material-icons for the item icon |
| list.content | <code>String</code> \| <code>Element</code> | The content that the item body has. |

<a name="CollapsibleList+__refresh"></a>

### collapsibleList.__refresh()
Render UI based on the options.

**Kind**: instance method of [<code>CollapsibleList</code>](#CollapsibleList)  
<a name="CollapsibleList+triggerContent"></a>

### collapsibleList.triggerContent(itemId, [action])
trigger item that expands or collapses item's body.

**Kind**: instance method of [<code>CollapsibleList</code>](#CollapsibleList)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| itemId | <code>String</code> |  | item id that identifies an item on the list |
| [action] | <code>String</code> | <code>&#x27;close&#x27;</code> | two option: 'open' or 'close' |

<a name="CollapsibleList+addContent"></a>

### collapsibleList.addContent(itemId, elt)
Add the content of a specific item body by using Id.

**Kind**: instance method of [<code>CollapsibleList</code>](#CollapsibleList)  

| Param | Type | Description |
| --- | --- | --- |
| itemId | <code>String</code> | item id that identifies an item on the list |
| elt | <code>String</code> \| <code>ELement</code> | The content that the item body has. |

<a name="CollapsibleList+clearContent"></a>

### collapsibleList.clearContent(itemId)
Clear the all content of a specific item body by using Id.

**Kind**: instance method of [<code>CollapsibleList</code>](#CollapsibleList)  

| Param | Type | Description |
| --- | --- | --- |
| itemId | <code>String</code> | item id that identifies an item on the list |

<a name="Loading"></a>

## Loading
**Kind**: global class  

* [Loading](#Loading)
    * [new Loading()](#new_Loading_new)
    * [.instance](#Loading.instance)
    * [.text](#Loading.text)
    * [.createInstance()](#Loading.createInstance) ⇒ <code>Element</code>
    * [.close()](#Loading.close)

<a name="new_Loading_new"></a>

### new Loading()
[Loading description]

<a name="Loading.instance"></a>

### Loading.instance
**Kind**: static property of [<code>Loading</code>](#Loading)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| the | <code>Element</code> | only instance of the loading page |

<a name="Loading.text"></a>

### Loading.text
**Kind**: static property of [<code>Loading</code>](#Loading)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| the | <code>Element</code> | text element of Loading page. |

<a name="Loading.createInstance"></a>

### Loading.createInstance() ⇒ <code>Element</code>
factory mothed to create a instance of Loading class/page

**Kind**: static method of [<code>Loading</code>](#Loading)  
**Returns**: <code>Element</code> - the container of Loading page/element  
<a name="Loading.close"></a>

### Loading.close()
Close the loading hint page

**Kind**: static method of [<code>Loading</code>](#Loading)  
<a name="MessageQueue"></a>

## MessageQueue
MessageQueue. A queue of hint messages that show the message permanently and sequently

**Kind**: global class  

* [MessageQueue](#MessageQueue)
    * [new MessageQueue(options)](#new_MessageQueue_new)
    * _instance_
        * [.addError(text, [time])](#MessageQueue+addError)
        * [.addWarning(text, [time])](#MessageQueue+addWarning)
        * [.add(text, [time])](#MessageQueue+add)
    * _static_
        * [.createBullet(text, type)](#MessageQueue.createBullet) ⇒ <code>HTMLElement</code>

<a name="new_MessageQueue_new"></a>

### new MessageQueue(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | All required and optional settings for instantiating a new instance of a MessageQueue. |
| [options.position] | <code>String</code> | <code>top-left</code> | The position of MessageQueue instance shows up. 'top-left', 'top-right', 'bottom-left', 'bottom-right'. |

<a name="MessageQueue+addError"></a>

### messageQueue.addError(text, [time])
add a error message into the queue.

**Kind**: instance method of [<code>MessageQueue</code>](#MessageQueue)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>String</code> |  | the content of the message |
| [time] | <code>Number</code> | <code>5000</code> | the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge. |

<a name="MessageQueue+addWarning"></a>

### messageQueue.addWarning(text, [time])
add a warning message into the queue.

**Kind**: instance method of [<code>MessageQueue</code>](#MessageQueue)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>String</code> |  | the content of the message |
| [time] | <code>Number</code> | <code>3000</code> | the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge. |

<a name="MessageQueue+add"></a>

### messageQueue.add(text, [time])
add a plain message into the queue.

**Kind**: instance method of [<code>MessageQueue</code>](#MessageQueue)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>String</code> |  | the content of the message |
| [time] | <code>Number</code> | <code>1000</code> | the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge. |

<a name="MessageQueue.createBullet"></a>

### MessageQueue.createBullet(text, type) ⇒ <code>HTMLElement</code>
a static helper that create the message bullet

**Kind**: static method of [<code>MessageQueue</code>](#MessageQueue)  
**Returns**: <code>HTMLElement</code> - the div element that represents a message  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> | the content of the message |
| type | <code>Strinf</code> | the type of the message. 'info' - information, 'warning' - warning message, 'error' - error message. |

<a name="elt"></a>

## elt
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elt | <code>Element</code> | The element to append the toolbar's container element to. |

<a name="MultSelector"></a>

## MultSelector(options)
A MultSelector that provide multple selected functionality.

Events:
'remove-all', 'remove', 'select-all', 'select', 'cancel', 'action'

Example:
const mult-selector = MultSelector({id:'test'});
mult-selector.addHandler('remove',function(data){});
mult-selector.removeHandler('select-all',function(data){});

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | settings for instantiating a new instance of a mult-selector. |
| [options.id] | <code>String</code> |  | The container id for mult-selector. The mult-selector's instance will be stored into this.elt if the id empty. |
| [options.element] | <code>Element</code> |  | The container as a html element. |
| [options.data] | <code>Array</code> |  | The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option]. |
| [options.title] | <code>String</code> |  | The title of mult-selector |
| [options.hasControl] | <code>Boolean</code> | <code>&#x27;true&#x27;</code> | there are control btns such as 'cancel' and 'action' btns if parameter is true, vice versa. |
| [options.cancelText] | <code>String</code> | <code>&#x27;Cancel&#x27;</code> | The text of cancel btns |
| [options.actionText] | <code>String</code> | <code>&#x27;Action&#x27;</code> | The text of action btns |


* [MultSelector(options)](#MultSelector)
    * _instance_
        * [.setData(data)](#MultSelector+setData)
        * [.getSelected()](#MultSelector+getSelected) ⇒ <code>Array</code>
    * _static_
        * [.__addOptions(target, data)](#MultSelector.__addOptions)

<a name="MultSelector+setData"></a>

### multSelector.setData(data)
setData

**Kind**: instance method of [<code>MultSelector</code>](#MultSelector)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option]. |

<a name="MultSelector+getSelected"></a>

### multSelector.getSelected() ⇒ <code>Array</code>
getSelected get all selected data

**Kind**: instance method of [<code>MultSelector</code>](#MultSelector)  
**Returns**: <code>Array</code> - the data form same as [[key,value]...]  
<a name="MultSelector.__addOptions"></a>

### MultSelector.__addOptions(target, data)
__addOptions add options to target selector

**Kind**: static method of [<code>MultSelector</code>](#MultSelector)  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Select</code> | a selector that is a html select elemenet |
| data | <code>Array</code> | The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option]. |

<a name="SideMenu"></a>

## SideMenu
**Kind**: global class  

* [SideMenu](#SideMenu)
    * [new SideMenu(options)](#new_SideMenu_new)
    * [.elt](#SideMenu+elt)
    * [._close_handler](#SideMenu+_close_handler)
    * [._content](#SideMenu+_content)
    * [.__refresh()](#SideMenu+__refresh)
    * [.open()](#SideMenu+open)
    * [.close()](#SideMenu+close)
    * [.addContent(element)](#SideMenu+addContent)
    * [.clearContent()](#SideMenu+clearContent)

<a name="new_SideMenu_new"></a>

### new SideMenu(options)
CaMicroscope Side Menu. description


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | All required and optional settings for instantiating a new instance of a Side Menu. |
| options.id | <code>String</code> |  | Id of the element to append the Side Menu's container element to. |
| [options.width] | <code>String</code> | <code>300</code> | the width of the Side Menu's container. |
| [options.isOpen] | <code>Boolean</code> | <code>false</code> | initialized status for menu. is open or not. |
| [options.callback] | <code>function</code> |  | toggle if the side menu is open or close. opt.target - current menu. opt.isOpen - true:open, false:close. |

<a name="SideMenu+elt"></a>

### sideMenu.elt
**Kind**: instance property of [<code>SideMenu</code>](#SideMenu)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elt | <code>Element</code> | The element to append the side menu's container element to. |

<a name="SideMenu+_close_handler"></a>

### sideMenu._close_handler
**Kind**: instance property of [<code>SideMenu</code>](#SideMenu)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _close_handler | <code>Element</code> | The elements that reperesent the close handler. |

<a name="SideMenu+_content"></a>

### sideMenu._content
**Kind**: instance property of [<code>SideMenu</code>](#SideMenu)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _close_handler | <code>Element</code> | The elements that reperesent the content of the menu. |

<a name="SideMenu+__refresh"></a>

### sideMenu.__refresh()
Render UI based on the options.

**Kind**: instance method of [<code>SideMenu</code>](#SideMenu)  
<a name="SideMenu+open"></a>

### sideMenu.open()
open the side menu

**Kind**: instance method of [<code>SideMenu</code>](#SideMenu)  
<a name="SideMenu+close"></a>

### sideMenu.close()
close the side menu

**Kind**: instance method of [<code>SideMenu</code>](#SideMenu)  
<a name="SideMenu+addContent"></a>

### sideMenu.addContent(element)
add a content on the side menu.

**Kind**: instance method of [<code>SideMenu</code>](#SideMenu)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>String</code> \| <code>Element</code> | the element, text content, or HTML template that be added. |

<a name="SideMenu+clearContent"></a>

### sideMenu.clearContent()
clear all content on the side menu.

**Kind**: instance method of [<code>SideMenu</code>](#SideMenu)  
<a name="Spyglass has the ability to magnify the current osds viewer.

Dependency_
OpenSeadragon, OpenSeadragon.MouseTracker, OpenSeadragon.Viewer"></a>

## Spyglass has the ability to magnify the current osds viewer.

Dependency:
OpenSeadragon, OpenSeadragon.MouseTracker, OpenSeadragon.Viewer
**Kind**: global class  
<a name="new_Spyglass has the ability to magnify the current osds viewer.

Dependency_
OpenSeadragon, OpenSeadragon.MouseTracker, OpenSeadragon.Viewer_new"></a>

### new Spyglass has the ability to magnify the current osds viewer.

Dependency:
OpenSeadragon, OpenSeadragon.MouseTracker, OpenSeadragon.Viewer(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | allows configurable properties to be entirely specified by passing an options object to the constructor. |
| options.targetViewer | <code>Viewer</code> | the target viewer that will open the spyglass |
| options.imgsrc | <code>String</code> | the source/url of the image |
| options.width | <code>Number</code> | the width of spyglass on screen |
| options.height | <code>Number</code> | the height of spyglass on screen |
| options.zIndex | <code>Number</code> | z-index of spyglass |

## Classes

<dl>
<dt><a href="#The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.

The event that Style Context Menu support
style-changed_ Raised when any controls that is relative with the style.
draw-mode-changed_ Raised when draw mode changed
draw_ Raised when draw btn is clicked
clear_ Raised when clear btn is clicked
undo_ Raised when undo btn is clicked
redo_ Raised when redo btn is clicked">The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.

The event that Style Context Menu support
style-changed: Raised when any controls that is relative with the style.
draw-mode-changed: Raised when draw mode changed
draw: Raised when draw btn is clicked
clear: Raised when clear btn is clicked
undo: Raised when undo btn is clicked
redo: Raised when redo btn is clicked</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#elt">elt</a></dt>
<dd></dd>
<dt><a href="#target">target</a></dt>
<dd></dd>
<dt><a href="#ctrl">ctrl</a></dt>
<dd></dd>
<dt><a href="#lineWidth">lineWidth</a></dt>
<dd></dd>
<dt><a href="#color">color</a></dt>
<dd></dd>
<dt><a href="#btnGroup">btnGroup</a></dt>
<dd></dd>
</dl>

<a name="The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.

The event that Style Context Menu support
style-changed_ Raised when any controls that is relative with the style.
draw-mode-changed_ Raised when draw mode changed
draw_ Raised when draw btn is clicked
clear_ Raised when clear btn is clicked
undo_ Raised when undo btn is clicked
redo_ Raised when redo btn is clicked"></a>

## The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.

The event that Style Context Menu support
style-changed: Raised when any controls that is relative with the style.
draw-mode-changed: Raised when draw mode changed
draw: Raised when draw btn is clicked
clear: Raised when clear btn is clicked
undo: Raised when undo btn is clicked
redo: Raised when redo btn is clicked
**Kind**: global class  
<a name="new_The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.

The event that Style Context Menu support
style-changed_ Raised when any controls that is relative with the style.
draw-mode-changed_ Raised when draw mode changed
draw_ Raised when draw btn is clicked
clear_ Raised when clear btn is clicked
undo_ Raised when undo btn is clicked
redo_ Raised when redo btn is clicked_new"></a>

### new The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.

The event that Style Context Menu support
style-changed: Raised when any controls that is relative with the style.
draw-mode-changed: Raised when draw mode changed
draw: Raised when draw btn is clicked
clear: Raised when clear btn is clicked
undo: Raised when undo btn is clicked
redo: Raised when redo btn is clicked(target, options)

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Element</code> | the THML element will popup the context menu |
| options | <code>Object</code> | All required and optional settings for instantiating a new instance of a style context menu. |
| [options.btns] | <code>Array</code> | extend btns |
| options.btns.title | <code>String</code> | The text of hint on the btn |
| options.btns.class | <code>String</code> | The css class on teh action btn |
| options.btns.text | <code>String</code> | The text of action btn |
| options.btns.type | <code>String</code> | The type of btns |
| options.btns.callback | <code>function</code> | The callback function of the action btn |

<a name="elt"></a>

## elt
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elt | <code>Element</code> | the instance of style context menu in HTML Element. |

<a name="target"></a>

## target
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| target | <code>Element</code> | the element will triggle the context menu |

<a name="ctrl"></a>

## ctrl
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| the | <code>Element</code> | div of the control includes all control's btns. 'draw', 'undo', 'redo', 'clear'. |

<a name="lineWidth"></a>

## lineWidth
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| a | <code>Element</code> | input element with type='range' to control the width of drawing line. |

<a name="color"></a>

## color
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| a | <code>Element</code> | color picker component controls the color of the style. |

<a name="btnGroup"></a>

## btnGroup
**Kind**: global variable  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| the | <code>Array</code> | list of extended btns for context menu. |

<a name="CaToolbar"></a>

## CaToolbar
**Kind**: global class  

* [CaToolbar](#CaToolbar)
    * [new CaToolbar(options)](#new_CaToolbar_new)
    * [.elt](#CaToolbar+elt)
    * [._main_tools](#CaToolbar+_main_tools)
    * [._sub_tools](#CaToolbar+_sub_tools)
    * [.__refresh()](#CaToolbar+__refresh)
    * [.changeMainToolStatus(tool_value, checked)](#CaToolbar+changeMainToolStatus)

<a name="new_CaToolbar_new"></a>

### new CaToolbar(options)
CaMicroscope Tool Bar. Currently, it shows at the top-left corner of the screen. It consists of Main Tools and Sub Tools.
Main Tools is formed of Apps and Layers. There is a callback function that return the status of Main Tools. 
Sub Tools can be customized by using optionsions.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | All required and optional settings for instantiating a new instance of a CaToolbar. |
| options.id | <code>String</code> |  | Id of the element to append the toolbar's container element to. |
| [options.mainToolsCallback] | <code>function</code> |  | Callback function that toggles if the main tools click. |
| options.subTools | <code>Array.&lt;Object&gt;</code> |  |  |
| options.subTools.icon | <code>String</code> |  | the name of material-icons for the subtools' icon. |
| [options.subTools.title] | <code>String</code> |  | The information is most often shown as a tooltip text when the mouse moves over the subTools. |
| options.subTools.type | <code>String</code> |  | The behavior of tool looks like. Currently, Support 4 types of sub tools.         	'btn' - button          	'check' - check box         	'radio' - radio button         	'dropdown' - dropdown list |
| options.subTools.value | <code>String</code> |  | Callback function will return this value if click on a sub tool. |
| [options.subTools.dropdownList] | <code>Array.&lt;Object&gt;</code> |  | Only needed if subTools.type is 'dropdown'.        Each downdown item is a checkbox, which can set |
| options.subTools.dropdownList.icon | <code>Array.&lt;Object&gt;</code> |  | the name of material-icons for the subtools' icon. |
| [options.subTools.dropdownList.title] | <code>Array.&lt;Object&gt;</code> |  | a tooltip text when the mouse moves over the item of the dropdown list. |
| options.subTools.dropdownList.value | <code>Array.&lt;Object&gt;</code> |  | Callback function will return this value if the status of the dropdown list changed. |
| [options.subTools.dropdownList.checked] | <code>Array.&lt;Object&gt;</code> | <code>False</code> | the item of the dropdown list is checked or not. |
| options.subTools.callback | <code>function</code> |  | Callback Function that toggles if tool is active such as click(button), changing status(check/radio/dropdown), return a object which has value and status. |

<a name="CaToolbar+elt"></a>

### caToolbar.elt
**Kind**: instance property of [<code>CaToolbar</code>](#CaToolbar)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| elt | <code>Element</code> | The element to append the toolbar's container element to. |

<a name="CaToolbar+_main_tools"></a>

### caToolbar._main_tools
**Kind**: instance property of [<code>CaToolbar</code>](#CaToolbar)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _main_tools | <code>Array.&lt;Element&gt;</code> | The elements that reperesent each main tools. |

<a name="CaToolbar+_sub_tools"></a>

### caToolbar._sub_tools
**Kind**: instance property of [<code>CaToolbar</code>](#CaToolbar)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _sub_tools | <code>Array.&lt;Element&gt;</code> | The elements that reperesent each sub tools. |

<a name="CaToolbar+__refresh"></a>

### caToolbar.__refresh()
Render UI based on the options.

**Kind**: instance method of [<code>CaToolbar</code>](#CaToolbar)  
<a name="CaToolbar+changeMainToolStatus"></a>

### caToolbar.changeMainToolStatus(tool_value, checked)
Change Main Tool's status by using tools value.

**Kind**: instance method of [<code>CaToolbar</code>](#CaToolbar)  

| Param | Type | Description |
| --- | --- | --- |
| tool_value | <code>string</code> | the value of a main tool. |
| checked | <code>boolean</code> | the status of tool is checked or not. |


CaMessage
---------

**Kind**: global class

-  `CaMessage <#CaMessage>`__

   -  `new CaMessage(options) <#new_CaMessage_new>`__
   -  `.elt <#CaMessage+elt>`__
   -  `.reset() <#CaMessage+reset>`__
   -  `.changeTxt(txt) <#CaMessage+changeTxt>`__

new CaMessage(options)
~~~~~~~~~~~~~~~~~~~~~~

CaMicroscope CaMessage. A message component that show the message
permanently or temporarily

+--------------+----------+---------------------------------------------------------------------------------------+
| Param        | Type     | Description                                                                           |
+==============+==========+=======================================================================================+
| options      | Object   | All required and optional settings for instantiating a new instance of a CaMessage.   |
+--------------+----------+---------------------------------------------------------------------------------------+
| options.id   | String   | Id of the element to append the CaMessage's container element to.                     |
+--------------+----------+---------------------------------------------------------------------------------------+

caMessage.elt
~~~~~~~~~~~~~

| **Kind**: instance property of `CaMessage <#CaMessage>`__
| **Properties**

+--------+-----------+---------------------------------------------------------------+
| Name   | Type      | Description                                                   |
+========+===========+===============================================================+
| elt    | Element   | The element to append the CaMessage's container element to.   |
+--------+-----------+---------------------------------------------------------------+

caMessage.reset()
~~~~~~~~~~~~~~~~~

reset the message's content to default

| **Kind**: instance method of `CaMessage <#CaMessage>`__
| 

caMessage.changeTxt(txt)
~~~~~~~~~~~~~~~~~~~~~~~~

set the message's text

**Kind**: instance method of `CaMessage <#CaMessage>`__

+---------+----------+-------------------------------+
| Param   | Type     | Description                   |
+=========+==========+===============================+
| txt     | String   | text that show on CaMessage   |
+---------+----------+-------------------------------+

CollapsibleList
---------------

**Kind**: global class

-  `CollapsibleList <#CollapsibleList>`__

   -  `new CollapsibleList(options, list,
      [changeCallBack]) <#new_CollapsibleList_new>`__
   -  `.\_\_v\_models <#CollapsibleList+__v_models>`__
   -  `.setList(list) <#CollapsibleList+setList>`__
   -  `.\_\_refresh() <#CollapsibleList+__refresh>`__
   -  `.triggerContent(itemId,
      [action]) <#CollapsibleList+triggerContent>`__
   -  `.addContent(itemId, elt) <#CollapsibleList+addContent>`__
   -  `.clearContent(itemId) <#CollapsibleList+clearContent>`__

new CollapsibleList(options, list, [changeCallBack])
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

CaMicroscope Collapsible List. the item in this list consists of the
item's head and the item's body. Click on the head, if item's body is
collapsed then expand it, if not, then expand it. Only one of item can
be expanded.

+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| Param              | Type                | Default   | Description                                                                                                                  |
+====================+=====================+===========+==============================================================================================================================+
| options            | Object              |           | All required and optional settings for instantiating a new instance of a Collapsible List.                                   |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| options.id         | String              |           | Id of the element to append the Collapsible List's container element to.                                                     |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| list               | Array.<Object>      |           | The list of items in Collapsible List                                                                                        |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| list.id            | String              |           | Item id, which uses to query item                                                                                            |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| list.title         | String              |           | Item text title                                                                                                              |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| [list.icon]        | String              |           | The name of material-icons for the item icon                                                                                 |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| list.content       | String \| Element   |           | The content that the item body has.                                                                                          |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| [list.isExpand]    | String              | false     | The content expand or not.                                                                                                   |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+
| [changeCallBack]   | function            |           | when the expanded item changes the event is fired. Return {id: item id,isExpand: the state of current item[expand or not]}   |
+--------------------+---------------------+-----------+------------------------------------------------------------------------------------------------------------------------------+

collapsibleList.\_\_v\_models **Kind**: instance property of `CollapsibleList <#CollapsibleList>`__
**Properties**
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| Name \| Type \| Default \| Description \|
| --- \| --- \| --- \| --- \|
| \_\_v\_models \| Array.<Object> \| \| The view model \|
| \_\_v\_models.id \| String \| \| the id that identifies the item \|
| \_\_v\_models.title \| String \| \| the title that shows in the head
part \|
| \_\_v\_models.icon \| String \| \| The name of material-icons for the
item icon \|
| \_\_v\_models.content \| String \| \| The content that the item body
has. \|
| [\_\_v\_models.isExpand] \| String \| false \| The item is expanded or
not. \|

collapsibleList.setList(list)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

set the item list. UI refresh automatically.

**Kind**: instance method of `CollapsibleList <#CollapsibleList>`__

+----------------+---------------------+------------------------------------------------+
| Param          | Type                | Description                                    |
+================+=====================+================================================+
| list           | Array.<object>      | The list of items in Collapsible List          |
+----------------+---------------------+------------------------------------------------+
| list.id        | String              | Item id, which uses to query item              |
+----------------+---------------------+------------------------------------------------+
| list.title     | String              | Item text title                                |
+----------------+---------------------+------------------------------------------------+
| [list.icon]    | String              | The name of material-icons for the item icon   |
+----------------+---------------------+------------------------------------------------+
| list.content   | String \| Element   | The content that the item body has.            |
+----------------+---------------------+------------------------------------------------+

collapsibleList.\_\_refresh() Render UI based on the options.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| **Kind**: instance method of `CollapsibleList <#CollapsibleList>`__
| 

collapsibleList.triggerContent(itemId, [action])
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

trigger item that expands or collapses item's body.

**Kind**: instance method of `CollapsibleList <#CollapsibleList>`__

+------------+----------+-----------+-----------------------------------------------+
| Param      | Type     | Default   | Description                                   |
+============+==========+===========+===============================================+
| itemId     | String   |           | item id that identifies an item on the list   |
+------------+----------+-----------+-----------------------------------------------+
| [action]   | String   | 'close'   | two option: 'open' or 'close'                 |
+------------+----------+-----------+-----------------------------------------------+

collapsibleList.addContent(itemId, elt)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add the content of a specific item body by using Id.

**Kind**: instance method of `CollapsibleList <#CollapsibleList>`__

+----------+---------------------+-----------------------------------------------+
| Param    | Type                | Description                                   |
+==========+=====================+===============================================+
| itemId   | String              | item id that identifies an item on the list   |
+----------+---------------------+-----------------------------------------------+
| elt      | String \| ELement   | The content that the item body has.           |
+----------+---------------------+-----------------------------------------------+

collapsibleList.clearContent(itemId)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Clear the all content of a specific item body by using Id.

**Kind**: instance method of `CollapsibleList <#CollapsibleList>`__

+----------+----------+-----------------------------------------------+
| Param    | Type     | Description                                   |
+==========+==========+===============================================+
| itemId   | String   | item id that identifies an item on the list   |
+----------+----------+-----------------------------------------------+

Loading
-------

**Kind**: global class

-  `Loading <#Loading>`__

   -  `new Loading() <#new_Loading_new>`__
   -  `.instance <#Loading.instance>`__
   -  `.text <#Loading.text>`__
   -  `.createInstance() <#Loading.createInstance>`__ ⇒ Element
   -  `.close() <#Loading.close>`__

new Loading()
~~~~~~~~~~~~~

[Loading description]

Loading.instance
~~~~~~~~~~~~~~~~

| **Kind**: static property of `Loading <#Loading>`__
| **Properties**

+--------+-----------+-------------------------------------+
| Name   | Type      | Description                         |
+========+===========+=====================================+
| the    | Element   | only instance of the loading page   |
+--------+-----------+-------------------------------------+

Loading.text
~~~~~~~~~~~~

| **Kind**: static property of `Loading <#Loading>`__
| **Properties**

+--------+-----------+---------------------------------+
| Name   | Type      | Description                     |
+========+===========+=================================+
| the    | Element   | text element of Loading page.   |
+--------+-----------+---------------------------------+

Loading.createInstance() ⇒ Element
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

factory mothed to create a instance of Loading class/page

| **Kind**: static method of `Loading <#Loading>`__
| **Returns**: Element - the container of Loading page/element
| 

Loading.close()
~~~~~~~~~~~~~~~

Close the loading hint page

| **Kind**: static method of `Loading <#Loading>`__
| 

MessageQueue
------------

MessageQueue. A queue of hint messages that show the message permanently
and sequently

**Kind**: global class

-  `MessageQueue <#MessageQueue>`__

   -  `new MessageQueue(options) <#new_MessageQueue_new>`__
   -  *instance*

      -  `.addError(text, [time]) <#MessageQueue+addError>`__
      -  `.addWarning(text, [time]) <#MessageQueue+addWarning>`__
      -  `.add(text, [time]) <#MessageQueue+add>`__

   -  *static*

      -  `.createBullet(text, type) <#MessageQueue.createBullet>`__ ⇒
         HTMLElement

new MessageQueue(options)
~~~~~~~~~~~~~~~~~~~~~~~~~

+----------------------+----------+------------+-----------------------------------------------------------------------------------------------------------+
| Param                | Type     | Default    | Description                                                                                               |
+======================+==========+============+===========================================================================================================+
| options              | Object   |            | All required and optional settings for instantiating a new instance of a MessageQueue.                    |
+----------------------+----------+------------+-----------------------------------------------------------------------------------------------------------+
| [options.position]   | String   | top-left   | The position of MessageQueue instance shows up. 'top-left', 'top-right', 'bottom-left', 'bottom-right'.   |
+----------------------+----------+------------+-----------------------------------------------------------------------------------------------------------+

messageQueue.addError(text, [time])
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

add a error message into the queue.

**Kind**: instance method of `MessageQueue <#MessageQueue>`__

+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+
| Param    | Type     | Default   | Description                                                                                           |
+==========+==========+===========+=======================================================================================================+
| text     | String   |           | the content of the message                                                                            |
+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+
| [time]   | Number   | 5000      | the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.   |
+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+

messageQueue.addWarning(text, [time])
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

add a warning message into the queue.

**Kind**: instance method of `MessageQueue <#MessageQueue>`__

+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+
| Param    | Type     | Default   | Description                                                                                           |
+==========+==========+===========+=======================================================================================================+
| text     | String   |           | the content of the message                                                                            |
+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+
| [time]   | Number   | 3000      | the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.   |
+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+

messageQueue.add(text, [time])
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

add a plain message into the queue.

**Kind**: instance method of `MessageQueue <#MessageQueue>`__

+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+
| Param    | Type     | Default   | Description                                                                                           |
+==========+==========+===========+=======================================================================================================+
| text     | String   |           | the content of the message                                                                            |
+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+
| [time]   | Number   | 1000      | the time, in milliseconds (thousandths of a second), the timer should delay to destory this messge.   |
+----------+----------+-----------+-------------------------------------------------------------------------------------------------------+

MessageQueue.createBullet(text, type) ⇒ HTMLElement
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

a static helper that create the message bullet

| **Kind**: static method of `MessageQueue <#MessageQueue>`__
| **Returns**: HTMLElement - the div element that represents a message

+---------+----------+--------------------------------------------------------------------------------------------------------+
| Param   | Type     | Description                                                                                            |
+=========+==========+========================================================================================================+
| text    | String   | the content of the message                                                                             |
+---------+----------+--------------------------------------------------------------------------------------------------------+
| type    | Strinf   | the type of the message. 'info' - information, 'warning' - warning message, 'error' - error message.   |
+---------+----------+--------------------------------------------------------------------------------------------------------+

elt
---

| **Kind**: global variable
| **Properties**

+--------+-----------+-------------------------------------------------------------+
| Name   | Type      | Description                                                 |
+========+===========+=============================================================+
| elt    | Element   | The element to append the toolbar's container element to.   |
+--------+-----------+-------------------------------------------------------------+

MultSelector(options)
---------------------

A MultSelector that provide multple selected functionality.

Events: 'remove-all', 'remove', 'select-all', 'select', 'cancel',
'action'

Example: const mult-selector = MultSelector({id:'test'});
mult-selector.addHandler('remove',function(data){});
mult-selector.removeHandler('select-all',function(data){});

**Kind**: global function

+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| Param                  | Type      | Default    | Description                                                                                                              |
+========================+===========+============+==========================================================================================================================+
| options                | Object    |            | settings for instantiating a new instance of a mult-selector.                                                            |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.id]           | String    |            | The container id for mult-selector. The mult-selector's instance will be stored into this.elt if the id empty.           |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.element]      | Element   |            | The container as a html element.                                                                                         |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.data]         | Array     |            | The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option].   |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.title]        | String    |            | The title of mult-selector                                                                                               |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.hasControl]   | Boolean   | 'true'     | there are control btns such as 'cancel' and 'action' btns if parameter is true, vice versa.                              |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.cancelText]   | String    | 'Cancel'   | The text of cancel btns                                                                                                  |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+
| [options.actionText]   | String    | 'Action'   | The text of action btns                                                                                                  |
+------------------------+-----------+------------+--------------------------------------------------------------------------------------------------------------------------+

-  `MultSelector(options) <#MultSelector>`__

   -  *instance*

      -  `.setData(data) <#MultSelector+setData>`__
      -  `.getSelected() <#MultSelector+getSelected>`__ ⇒ Array

   -  *static*

      -  `.\_\_addOptions(target, data) <#MultSelector.__addOptions>`__

multSelector.setData(data)
~~~~~~~~~~~~~~~~~~~~~~~~~~

setData

**Kind**: instance method of `MultSelector <#MultSelector>`__

+---------+---------+--------------------------------------------------------------------------------------------------------------------------+
| Param   | Type    | Description                                                                                                              |
+=========+=========+==========================================================================================================================+
| data    | Array   | The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option].   |
+---------+---------+--------------------------------------------------------------------------------------------------------------------------+

multSelector.getSelected() ⇒ Array
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

getSelected get all selected data

| **Kind**: instance method of `MultSelector <#MultSelector>`__
| **Returns**: Array - the data form same as [[key,value]...]
| 

MultSelector.\ **addOptions(target, data) **\ addOptions add options to target selector
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Kind**: static method of `MultSelector <#MultSelector>`__

+----------+----------+--------------------------------------------------------------------------------------------------------------------------+
| Param    | Type     | Description                                                                                                              |
+==========+==========+==========================================================================================================================+
| target   | Select   | a selector that is a html select elemenet                                                                                |
+----------+----------+--------------------------------------------------------------------------------------------------------------------------+
| data     | Array    | The data of selector's options. The form of each option should be an array -> [key - identity,value - text on option].   |
+----------+----------+--------------------------------------------------------------------------------------------------------------------------+

SideMenu
--------

**Kind**: global class

-  `SideMenu <#SideMenu>`__

   -  `new SideMenu(options) <#new_SideMenu_new>`__
   -  `.elt <#SideMenu+elt>`__
   -  `.\ *close*\ handler <#SideMenu+_close_handler>`__
   -  `.\_content <#SideMenu+_content>`__
   -  `.\_\_refresh() <#SideMenu+__refresh>`__
   -  `.open() <#SideMenu+open>`__
   -  `.close() <#SideMenu+close>`__
   -  `.addContent(element) <#SideMenu+addContent>`__
   -  `.clearContent() <#SideMenu+clearContent>`__

new SideMenu(options)
~~~~~~~~~~~~~~~~~~~~~

CaMicroscope Side Menu. description

+----------------------+------------+-----------+-------------------------------------------------------------------------------------------------------------+
| Param                | Type       | Default   | Description                                                                                                 |
+======================+============+===========+=============================================================================================================+
| options              | Object     |           | All required and optional settings for instantiating a new instance of a Side Menu.                         |
+----------------------+------------+-----------+-------------------------------------------------------------------------------------------------------------+
| options.id           | String     |           | Id of the element to append the Side Menu's container element to.                                           |
+----------------------+------------+-----------+-------------------------------------------------------------------------------------------------------------+
| [options.width]      | String     | 300       | the width of the Side Menu's container.                                                                     |
+----------------------+------------+-----------+-------------------------------------------------------------------------------------------------------------+
| [options.isOpen]     | Boolean    | false     | initialized status for menu. is open or not.                                                                |
+----------------------+------------+-----------+-------------------------------------------------------------------------------------------------------------+
| [options.callback]   | function   |           | toggle if the side menu is open or close. opt.target - current menu. opt.isOpen - true:open, false:close.   |
+----------------------+------------+-----------+-------------------------------------------------------------------------------------------------------------+

sideMenu.elt
~~~~~~~~~~~~

| **Kind**: instance property of `SideMenu <#SideMenu>`__
| **Properties**

+--------+-----------+---------------------------------------------------------------+
| Name   | Type      | Description                                                   |
+========+===========+===============================================================+
| elt    | Element   | The element to append the side menu's container element to.   |
+--------+-----------+---------------------------------------------------------------+

sideMenu.\ *close*\ handler
~~~~~~~~~~~~~~~~~~~~~~~~~~~

| **Kind**: instance property of `SideMenu <#SideMenu>`__
| **Properties**

+--------------------+-----------+---------------------------------------------------+
| Name               | Type      | Description                                       |
+====================+===========+===================================================+
| *close*\ handler   | Element   | The elements that reperesent the close handler.   |
+--------------------+-----------+---------------------------------------------------+

sideMenu.\_content **Kind**: instance property of `SideMenu <#SideMenu>`__
**Properties**
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

+--------------------+-----------+---------------------------------------------------------+
| Name               | Type      | Description                                             |
+====================+===========+=========================================================+
| *close*\ handler   | Element   | The elements that reperesent the content of the menu.   |
+--------------------+-----------+---------------------------------------------------------+

sideMenu.\_\_refresh() Render UI based on the options.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| **Kind**: instance method of `SideMenu <#SideMenu>`__
| 

sideMenu.open()
~~~~~~~~~~~~~~~

open the side menu

| **Kind**: instance method of `SideMenu <#SideMenu>`__
| 

sideMenu.close()
~~~~~~~~~~~~~~~~

close the side menu

| **Kind**: instance method of `SideMenu <#SideMenu>`__
| 

sideMenu.addContent(element)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

add a content on the side menu.

**Kind**: instance method of `SideMenu <#SideMenu>`__

+-----------+---------------------+--------------------------------------------------------------+
| Param     | Type                | Description                                                  |
+===========+=====================+==============================================================+
| element   | String \| Element   | the element, text content, or HTML template that be added.   |
+-----------+---------------------+--------------------------------------------------------------+

sideMenu.clearContent()
~~~~~~~~~~~~~~~~~~~~~~~

clear all content on the side menu.

| **Kind**: instance method of `SideMenu <#SideMenu>`__
| 

Spyglass has the ability to magnify the current osds viewer.
------------------------------------------------------------

| Dependency: OpenSeadragon, OpenSeadragon.MouseTracker,
OpenSeadragon.Viewer **Kind**: global class
| 

new Spyglass has the ability to magnify the current osds viewer.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Dependency: OpenSeadragon, OpenSeadragon.MouseTracker,
OpenSeadragon.Viewer(options)

+------------------------+----------+------------------------------------------------------------------------------------------------------------+
| Param                  | Type     | Description                                                                                                |
+========================+==========+============================================================================================================+
| options                | Object   | allows configurable properties to be entirely specified by passing an options object to the constructor.   |
+------------------------+----------+------------------------------------------------------------------------------------------------------------+
| options.targetViewer   | Viewer   | the target viewer that will open the spyglass                                                              |
+------------------------+----------+------------------------------------------------------------------------------------------------------------+
| options.imgsrc         | String   | the source/url of the image                                                                                |
+------------------------+----------+------------------------------------------------------------------------------------------------------------+
| options.width          | Number   | the width of spyglass on screen                                                                            |
+------------------------+----------+------------------------------------------------------------------------------------------------------------+
| options.height         | Number   | the height of spyglass on screen                                                                           |
+------------------------+----------+------------------------------------------------------------------------------------------------------------+
| options.zIndex         | Number   | z-index of spyglass                                                                                        |
+------------------------+----------+------------------------------------------------------------------------------------------------------------+

Classes
-------

.. raw:: html

   <dl>
   <dt>

The Draw Style Context Menu is used to control the style of the
open-seadragon canvas draw plugin.

The event that Style Context Menu support style-changed: Raised when any
controls that is relative with the style. draw-mode-changed: Raised when
draw mode changed draw: Raised when draw btn is clicked clear: Raised
when clear btn is clicked undo: Raised when undo btn is clicked redo:
Raised when redo btn is clicked

.. raw:: html

   </dt>
   <dd></dd>
   </dl>

Members
-------

.. raw:: html

   <dl>
   <dt>

elt

.. raw:: html

   </dt>
   <dd></dd>
   <dt>

target

.. raw:: html

   </dt>
   <dd></dd>
   <dt>

ctrl

.. raw:: html

   </dt>
   <dd></dd>
   <dt>

lineWidth

.. raw:: html

   </dt>
   <dd></dd>
   <dt>

color

.. raw:: html

   </dt>
   <dd></dd>
   <dt>

btnGroup

.. raw:: html

   </dt>
   <dd></dd>
   </dl>

The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.
--------------------------------------------------------------------------------------------------

| The event that Style Context Menu support style-changed: Raised when
any controls that is relative with the style. draw-mode-changed: Raised
when draw mode changed draw: Raised when draw btn is clicked clear:
Raised when clear btn is clicked undo: Raised when undo btn is clicked
redo: Raised when redo btn is clicked **Kind**: global class
| 

new The Draw Style Context Menu is used to control the style of the open-seadragon canvas draw plugin.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The event that Style Context Menu support style-changed: Raised when any
controls that is relative with the style. draw-mode-changed: Raised when
draw mode changed draw: Raised when draw btn is clicked clear: Raised
when clear btn is clicked undo: Raised when undo btn is clicked redo:
Raised when redo btn is clicked(target, options)

+-------------------------+------------+------------------------------------------------------------------------------------------------+
| Param                   | Type       | Description                                                                                    |
+=========================+============+================================================================================================+
| target                  | Element    | the THML element will popup the context menu                                                   |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| options                 | Object     | All required and optional settings for instantiating a new instance of a style context menu.   |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| [options.btns]          | Array      | extend btns                                                                                    |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| options.btns.title      | String     | The text of hint on the btn                                                                    |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| options.btns.class      | String     | The css class on teh action btn                                                                |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| options.btns.text       | String     | The text of action btn                                                                         |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| options.btns.type       | String     | The type of btns                                                                               |
+-------------------------+------------+------------------------------------------------------------------------------------------------+
| options.btns.callback   | function   | The callback function of the action btn                                                        |
+-------------------------+------------+------------------------------------------------------------------------------------------------+

elt
---

| **Kind**: global variable
| **Properties**

+--------+-----------+-------------------------------------------------------+
| Name   | Type      | Description                                           |
+========+===========+=======================================================+
| elt    | Element   | the instance of style context menu in HTML Element.   |
+--------+-----------+-------------------------------------------------------+

target
------

| **Kind**: global variable
| **Properties**

+----------+-----------+---------------------------------------------+
| Name     | Type      | Description                                 |
+==========+===========+=============================================+
| target   | Element   | the element will triggle the context menu   |
+----------+-----------+---------------------------------------------+

ctrl
----

| **Kind**: global variable
| **Properties**

+--------+-----------+------------------------------------------------------------------------------------+
| Name   | Type      | Description                                                                        |
+========+===========+====================================================================================+
| the    | Element   | div of the control includes all control's btns. 'draw', 'undo', 'redo', 'clear'.   |
+--------+-----------+------------------------------------------------------------------------------------+

lineWidth
---------

| **Kind**: global variable
| **Properties**

+--------+-----------+-------------------------------------------------------------------------+
| Name   | Type      | Description                                                             |
+========+===========+=========================================================================+
| a      | Element   | input element with type='range' to control the width of drawing line.   |
+--------+-----------+-------------------------------------------------------------------------+

color
-----

| **Kind**: global variable
| **Properties**

+--------+-----------+-----------------------------------------------------------+
| Name   | Type      | Description                                               |
+========+===========+===========================================================+
| a      | Element   | color picker component controls the color of the style.   |
+--------+-----------+-----------------------------------------------------------+

btnGroup
--------

| **Kind**: global variable
| **Properties**

+--------+---------+-------------------------------------------+
| Name   | Type    | Description                               |
+========+=========+===========================================+
| the    | Array   | list of extended btns for context menu.   |
+--------+---------+-------------------------------------------+

CaToolbar
---------

**Kind**: global class

-  `CaToolbar <#CaToolbar>`__

   -  `new CaToolbar(options) <#new_CaToolbar_new>`__
   -  `.elt <#CaToolbar+elt>`__
   -  `.\ *main*\ tools <#CaToolbar+_main_tools>`__
   -  `.\ *sub*\ tools <#CaToolbar+_sub_tools>`__
   -  `.\_\_refresh() <#CaToolbar+__refresh>`__
   -  `.changeMainToolStatus(tool\_value,
      checked) <#CaToolbar+changeMainToolStatus>`__

new CaToolbar(options)
~~~~~~~~~~~~~~~~~~~~~~

CaMicroscope Tool Bar. Currently, it shows at the top-left corner of the
screen. It consists of Main Tools and Sub Tools. Main Tools is formed of
Apps and Layers. There is a callback function that return the status of
Main Tools. Sub Tools can be customized by using optionsions.

+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Param                                     | Type             | Default   | Description                                                                                                                                                      |
+===========================================+==================+===========+==================================================================================================================================================================+
| options                                   | Object           |           | All required and optional settings for instantiating a new instance of a CaToolbar.                                                                              |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.id                                | String           |           | Id of the element to append the toolbar's container element to.                                                                                                  |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [options.mainToolsCallback]               | function         |           | Callback function that toggles if the main tools click.                                                                                                          |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools                          | Array.<Object>   |           |                                                                                                                                                                  |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools.icon                     | String           |           | the name of material-icons for the subtools' icon.                                                                                                               |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [options.subTools.title]                  | String           |           | The information is most often shown as a tooltip text when the mouse moves over the subTools.                                                                    |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools.type                     | String           |           | The behavior of tool looks like. Currently, Support 4 types of sub tools. 'btn' - button 'check' - check box 'radio' - radio button 'dropdown' - dropdown list   |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools.value                    | String           |           | Callback function will return this value if click on a sub tool.                                                                                                 |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [options.subTools.dropdownList]           | Array.<Object>   |           | Only needed if subTools.type is 'dropdown'. Each downdown item is a checkbox, which can set                                                                      |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools.dropdownList.icon        | Array.<Object>   |           | the name of material-icons for the subtools' icon.                                                                                                               |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [options.subTools.dropdownList.title]     | Array.<Object>   |           | a tooltip text when the mouse moves over the item of the dropdown list.                                                                                          |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools.dropdownList.value       | Array.<Object>   |           | Callback function will return this value if the status of the dropdown list changed.                                                                             |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| [options.subTools.dropdownList.checked]   | Array.<Object>   | False     | the item of the dropdown list is checked or not.                                                                                                                 |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| options.subTools.callback                 | function         |           | Callback Function that toggles if tool is active such as click(button), changing status(check/radio/dropdown), return a object which has value and status.       |
+-------------------------------------------+------------------+-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+

caToolbar.elt
~~~~~~~~~~~~~

| **Kind**: instance property of `CaToolbar <#CaToolbar>`__
| **Properties**

+--------+-----------+-------------------------------------------------------------+
| Name   | Type      | Description                                                 |
+========+===========+=============================================================+
| elt    | Element   | The element to append the toolbar's container element to.   |
+--------+-----------+-------------------------------------------------------------+

caToolbar.\ *main*\ tools
~~~~~~~~~~~~~~~~~~~~~~~~~

| **Kind**: instance property of `CaToolbar <#CaToolbar>`__
| **Properties**

+-----------------+-------------------+-------------------------------------------------+
| Name            | Type              | Description                                     |
+=================+===================+=================================================+
| *main*\ tools   | Array.<Element>   | The elements that reperesent each main tools.   |
+-----------------+-------------------+-------------------------------------------------+

caToolbar.\ *sub*\ tools
~~~~~~~~~~~~~~~~~~~~~~~~

| **Kind**: instance property of `CaToolbar <#CaToolbar>`__
| **Properties**

+----------------+-------------------+------------------------------------------------+
| Name           | Type              | Description                                    |
+================+===================+================================================+
| *sub*\ tools   | Array.<Element>   | The elements that reperesent each sub tools.   |
+----------------+-------------------+------------------------------------------------+

caToolbar.\_\_refresh() Render UI based on the options.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| **Kind**: instance method of `CaToolbar <#CaToolbar>`__
| 

caToolbar.changeMainToolStatus(tool\_value, checked)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Change Main Tool's status by using tools value.

**Kind**: instance method of `CaToolbar <#CaToolbar>`__

+---------------+-----------+-----------------------------------------+
| Param         | Type      | Description                             |
+===============+===========+=========================================+
| tool\_value   | string    | the value of a main tool.               |
+---------------+-----------+-----------------------------------------+
| checked       | boolean   | the status of tool is checked or not.   |
+---------------+-----------+-----------------------------------------+


## Classes

<dl>
<dt><a href="#AnnotationCanvasOverlayer">AnnotationCanvasOverlayer</a></dt>
<dd><p>Class representing osd overlayer instance</p>
</dd>
<dt><a href="#CaMic">CaMic</a></dt>
<dd><p>Class representing camicroscope core instance</p>
</dd>
<dt><a href="#Heatmap">Heatmap</a></dt>
<dd><p>Heatmap manager for camicroscope, based on simplheat</p>
</dd>
<dt><a href="#OverlayersManager">OverlayersManager</a></dt>
<dd><p>Layer manager for camicroscope</p>
</dd>
<dt><a href="#Store">Store</a></dt>
<dd><p>Storage interpreter for camicroscope, uses same auth as origin</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#stringToColor">stringToColor(str)</a> ⇒</dt>
<dd><p>deterministically converts a string to a color via hash</p>
</dd>
<dt><a href="#renderPoly">renderPoly(context, points)</a></dt>
<dd><p>renders a polygon onto a layer or canvas</p>
</dd>
<dt><a href="#renderFeatureCollection">renderFeatureCollection(data, context)</a></dt>
<dd><p>renders a geojson featurecollection</p>
</dd>
<dt><a href="#renderFeature">renderFeature(feature, context)</a></dt>
<dd><p>renders a geojson featurecollection</p>
</dd>
<dt><a href="#objToParamStr">objToParamStr(obj)</a> ⇒</dt>
<dd><p>converts an object into a string of url components</p>
</dd>
</dl>

<a name="AnnotationCanvasOverlayer"></a>

## AnnotationCanvasOverlayer
Class representing osd overlayer instance

**Kind**: global class  
<a name="new_AnnotationCanvasOverlayer_new"></a>

### new AnnotationCanvasOverlayer()
create a camic overlayer instance

<a name="CaMic"></a>

## CaMic
Class representing camicroscope core instance

**Kind**: global class  

* [CaMic](#CaMic)
    * [new CaMic(divId, slideId)](#new_CaMic_new)
    * [.setImg()](#CaMic+setImg)
    * [.loadImg()](#CaMic+loadImg)
    * [.scalebar(mpp)](#CaMic+scalebar)

<a name="new_CaMic_new"></a>

### new CaMic(divId, slideId)
create a camic core instance


| Param | Description |
| --- | --- |
| divId | the div id to inject openseadragon into |
| slideId | the id of the slide to load |

<a name="CaMic+setImg"></a>

### caMic.setImg()
Change which image is staged, used loadImg to load it.

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+loadImg"></a>

### caMic.loadImg()
Loads the staged image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+scalebar"></a>

### caMic.scalebar(mpp)
Set up a scalebar on the image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  

| Param | Type | Description |
| --- | --- | --- |
| mpp | <code>number</code> | microns per pixel of image |

<a name="Heatmap"></a>

## Heatmap
Heatmap manager for camicroscope, based on simplheat

**Kind**: global class  
**Properties**

| Name | Description |
| --- | --- |
| options.point_radius | simpleheat point radius of rendererig |
| options.blur_radius | simpleheat blur radius of rendererig |
| options.scale_y | number to multiply y by, default 1 |
| options.scale_x | number to multiply x by, default 1 |
| options.scale_data | number to multiply all data by, default 1 |

<a name="OverlayersManager"></a>

## OverlayersManager
Layer manager for camicroscope

**Kind**: global class  
**Properties**

| Name | Description |
| --- | --- |
| layers | the ViewportCalibratedCanvas layer objects |
| delayers | the ProxyTool delayers which hold image coordinates |
| visibleLayers | the names of visible layers |


* [OverlayersManager](#OverlayersManager)
    * [new OverlayersManager(viewer)](#new_OverlayersManager_new)
    * [.hideOverlayer(name)](#OverlayersManager+hideOverlayer)
    * [.showOverlayer()](#OverlayersManager+showOverlayer)
    * [.resetAll()](#OverlayersManager+resetAll)
    * [.drawVisible(onto)](#OverlayersManager+drawVisible)

<a name="new_OverlayersManager_new"></a>

### new OverlayersManager(viewer)

| Param | Description |
| --- | --- |
| viewer | the viewer to associate with |

<a name="OverlayersManager+hideOverlayer"></a>

### overlayersManager.hideOverlayer(name)
hides a layer, but does not delete the associated data - can be seemlessly reactivated

**Kind**: instance method of [<code>OverlayersManager</code>](#OverlayersManager)  

| Param | Description |
| --- | --- |
| name | the layer to hide |

<a name="OverlayersManager+showOverlayer"></a>

### overlayersManager.showOverlayer()
clears all layer and delayer data, associated with changing image

**Kind**: instance method of [<code>OverlayersManager</code>](#OverlayersManager)  
<a name="OverlayersManager+resetAll"></a>

### overlayersManager.resetAll()
clears all layer and delayer data, associated with changing image

**Kind**: instance method of [<code>OverlayersManager</code>](#OverlayersManager)  
<a name="OverlayersManager+drawVisible"></a>

### overlayersManager.drawVisible(onto)
draws all visible layers

**Kind**: instance method of [<code>OverlayersManager</code>](#OverlayersManager)  

| Param | Description |
| --- | --- |
| onto | the canvas object to draw layers onto |

<a name="Store"></a>

## Store
Storage interpreter for camicroscope, uses same auth as origin

**Kind**: global class  

* [Store](#Store)
    * [new Store(config)](#new_Store_new)
    * [.get(type, query)](#Store+get) ⇒ <code>promise</code>
    * [.post(type, query, data)](#Store+post) ⇒ <code>promise</code>
    * [.update(type, query, data)](#Store+update) ⇒ <code>promise</code>
    * [.delete(type, query)](#Store+delete) ⇒ <code>promise</code>

<a name="new_Store_new"></a>

### new Store(config)

| Param | Description |
| --- | --- |
| config | configuration options |
| config.getUrls | collectop/type as key, url for get as value |
| config.updateUrls- | collectop/type as key, url for update as value |
| config.postUrls- | collectop/type as key, url for post as value |
| config.deleteUrls- | collectop/type as key, url for delete as value |

<a name="Store+get"></a>

### store.get(type, query) ⇒ <code>promise</code>
get data

**Kind**: instance method of [<code>Store</code>](#Store)  
**Returns**: <code>promise</code> - - promise which resolves with data  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | the datatype to get |
| query | <code>object</code> | the query of url parameters |

<a name="Store+post"></a>

### store.post(type, query, data) ⇒ <code>promise</code>
post data

**Kind**: instance method of [<code>Store</code>](#Store)  
**Returns**: <code>promise</code> - - promise which resolves with data  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | the datatype to get |
| query | <code>object</code> | the query of url parameters |
| data | <code>object</code> | the data to post |

<a name="Store+update"></a>

### store.update(type, query, data) ⇒ <code>promise</code>
update data

**Kind**: instance method of [<code>Store</code>](#Store)  
**Returns**: <code>promise</code> - - promise which resolves with data  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | the datatype to get |
| query | <code>object</code> | the query of url parameters |
| data | <code>object</code> | the data to update |

<a name="Store+delete"></a>

### store.delete(type, query) ⇒ <code>promise</code>
delete data

**Kind**: instance method of [<code>Store</code>](#Store)  
**Returns**: <code>promise</code> - - promise which resolves with data  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | the datatype to get |
| query | <code>object</code> | the query of url parameters |

<a name="stringToColor"></a>

## stringToColor(str) ⇒
deterministically converts a string to a color via hash

**Kind**: global function  
**Returns**: color - the color associated with it  

| Param | Description |
| --- | --- |
| str | the string to convert |

<a name="renderPoly"></a>

## renderPoly(context, points)
renders a polygon onto a layer or canvas

**Kind**: global function  

| Param | Description |
| --- | --- |
| context | the canvas context or layer |
| points | a list of coordinates, each in form [x,y] |

<a name="renderFeatureCollection"></a>

## renderFeatureCollection(data, context)
renders a geojson featurecollection

**Kind**: global function  
**Pram**: id - the id of the item to render  

| Param | Description |
| --- | --- |
| data | geojson featurecollection |
| context | the canvas context or layer |

<a name="renderFeature"></a>

## renderFeature(feature, context)
renders a geojson featurecollection

**Kind**: global function  
**Pram**: id - the id of the item to render  

| Param | Description |
| --- | --- |
| feature | geojson feature |
| context | the canvas context or layer |

<a name="objToParamStr"></a>

## objToParamStr(obj) ⇒
converts an object into a string of url components

**Kind**: global function  
**Returns**: the url encoded string  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | keys and values |


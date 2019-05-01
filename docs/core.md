## Classes

<dl>
<dt><a href="#CaMic">CaMic</a></dt>
<dd></dd>
<dt><a href="#Storage interpreter for camicroscope, uses same auth as origin"> uses same auth as origin</a></dt>
<dd></dd>
<dt><a href="#Scalebar">Scalebar</a></dt>
<dd></dd>
<dt><a href="#Scalebar">Scalebar</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#objToParamStr">objToParamStr(obj)</a> ⇒</dt>
<dd><p>converts an object into a string of url components</p>
</dd>
</dl>

<a name="CaMic"></a>

## CaMic
**Kind**: global class  
**Properties**

| Name | Description |
| --- | --- |
| slideQuery | the slide id |
| options | the options extend from OpenSeadragon |


* [CaMic](#CaMic)
    * [new CaMic(divId, slideQuery)](#new_CaMic_new)
    * [.init()](#CaMic+init)
    * [.loadImg()](#CaMic+loadImg)
    * [.createZoomControl()](#CaMic+createZoomControl)
    * [.createCanvasDraw()](#CaMic+createCanvasDraw)
    * [.createOverlayers()](#CaMic+createOverlayers)
    * [.createScalebar(mpp)](#CaMic+createScalebar)
    * [.destroy()](#CaMic+destroy)

<a name="new_CaMic_new"></a>

### new CaMic(divId, slideQuery)
create a camic core instance


| Param | Description |
| --- | --- |
| divId | the div id to inject openseadragon into |
| slideQuery | query parameters for the slide to load; first result taken |
| [slideQuery.id] | the object id for the slide; takes precedence |
| [slideQuery.slide] | the given name for the slide, regex supported |
| [slideQuery.location] | the slide source location/filename |

<a name="CaMic+init"></a>

### caMic.init()
initialize the CAMIC and the dependenced components

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+loadImg"></a>

### caMic.loadImg()
Loads the staged image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+createZoomControl"></a>

### caMic.createZoomControl()
set up a zoom control functionality on the image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+createCanvasDraw"></a>

### caMic.createCanvasDraw()
set up a canvas Draw functionality on the image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+createOverlayers"></a>

### caMic.createOverlayers()
set up a overlay manage on the image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="CaMic+createScalebar"></a>

### caMic.createScalebar(mpp)
Set up a scalebar on the image

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  

| Param | Type | Description |
| --- | --- | --- |
| mpp | <code>number</code> | microns per pixel of image |

<a name="CaMic+destroy"></a>

### caMic.destroy()
Function to destroy the instance of CaMic and clean up everything created by CaMic.

Example:
var camic = CaMic({
  [...]
});

//when you are done with the camic:
camic.destroy();
camic = null; //important

**Kind**: instance method of [<code>CaMic</code>](#CaMic)  
<a name="Scalebar"></a>

## Scalebar
**Kind**: global class  

* [Scalebar](#Scalebar)
    * [new Scalebar(options, (String})](#new_Scalebar_new)
    * [new Scalebar(options, (String})](#new_Scalebar_new)

<a name="new_Scalebar_new"></a>

### new Scalebar(options, (String})

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.viewer | <code>OpenSeadragon.Viewer</code> | The viewer to attach this Scalebar to. |
| options.type | <code>OpenSeadragon.ScalebarType</code> | The scale bar type. Default: microscopy |
| options.pixelsPerMeter | <code>Integer</code> | The pixels per meter of the zoomable image at the original image size. If null, the scale bar is not displayed. default: null |
| (String} |  | options.minWidth The minimal width of the scale bar as a CSS string (ex: 100px, 1em, 1% etc...) default: 150px |
| options.location | <code>OpenSeadragon.ScalebarLocation</code> | The location of the scale bar inside the viewer. default: bottom left |
| options.xOffset | <code>Integer</code> | Offset location of the scale bar along x. default: 5 |
| options.yOffset | <code>Integer</code> | Offset location of the scale bar along y. default: 5 |
| options.stayInsideImage | <code>Boolean</code> | When set to true, keep the  scale bar inside the image when zooming out. default: true |
| options.color | <code>String</code> | The color of the scale bar using a color name or the hexadecimal format (ex: black or #000000) default: black |
| options.fontColor | <code>String</code> | The font color. default: black |
| options.backgroundColor | <code>String</code> | The background color. default: none |
| options.fontSize | <code>String</code> | The font size. default: not set |
| options.barThickness | <code>String</code> | The thickness of the scale bar in px. default: 2 |
| options.sizeAndTextRenderer | <code>function</code> | A function which will be called to determine the size of the scale bar and it's text content. The function must have 2 parameters: the PPM at the current zoom level and the minimum size of the scale bar. It must return an object containing 2 attributes: size and text containing the size of the scale bar and the text. default: $.ScalebarSizeAndTextRenderer.METRIC_LENGTH |

<a name="new_Scalebar_new"></a>

### new Scalebar(options, (String})

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.viewer | <code>OpenSeadragon.Viewer</code> | The viewer to attach this Scalebar to. |
| options.type | <code>OpenSeadragon.ScalebarType</code> | The scale bar type. Default: microscopy |
| options.pixelsPerMeter | <code>Integer</code> | The pixels per meter of the zoomable image at the original image size. If null, the scale bar is not displayed. default: null |
| options.referenceItemIdx | <code>Integer</code> | Specify the item from viewer.world to which options.pixelsPerMeter is refering. default: 0 |
| (String} |  | options.minWidth The minimal width of the scale bar as a CSS string (ex: 100px, 1em, 1% etc...) default: 150px |
| options.location | <code>OpenSeadragon.ScalebarLocation</code> | The location of the scale bar inside the viewer. default: bottom left |
| options.xOffset | <code>Integer</code> | Offset location of the scale bar along x. default: 5 |
| options.yOffset | <code>Integer</code> | Offset location of the scale bar along y. default: 5 |
| options.stayInsideImage | <code>Boolean</code> | When set to true, keep the  scale bar inside the image when zooming out. default: true |
| options.color | <code>String</code> | The color of the scale bar using a color name or the hexadecimal format (ex: black or #000000) default: black |
| options.fontColor | <code>String</code> | The font color. default: black |
| options.backgroundColor | <code>String</code> | The background color. default: none |
| options.fontSize | <code>String</code> | The font size. default: not set |
| options.fontFamily | <code>String</code> | The font-family. default: not set |
| options.barThickness | <code>String</code> | The thickness of the scale bar in px. default: 2 |
| options.sizeAndTextRenderer | <code>function</code> | A function which will be called to determine the size of the scale bar and it's text content. The function must have 2 parameters: the PPM at the current zoom level and the minimum size of the scale bar. It must return an object containing 2 attributes: size and text containing the size of the scale bar and the text. default: $.ScalebarSizeAndTextRenderer.METRIC_LENGTH |

<a name="Scalebar"></a>

## Scalebar
**Kind**: global class  

* [Scalebar](#Scalebar)
    * [new Scalebar(options, (String})](#new_Scalebar_new)
    * [new Scalebar(options, (String})](#new_Scalebar_new)

<a name="new_Scalebar_new"></a>

### new Scalebar(options, (String})

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.viewer | <code>OpenSeadragon.Viewer</code> | The viewer to attach this Scalebar to. |
| options.type | <code>OpenSeadragon.ScalebarType</code> | The scale bar type. Default: microscopy |
| options.pixelsPerMeter | <code>Integer</code> | The pixels per meter of the zoomable image at the original image size. If null, the scale bar is not displayed. default: null |
| (String} |  | options.minWidth The minimal width of the scale bar as a CSS string (ex: 100px, 1em, 1% etc...) default: 150px |
| options.location | <code>OpenSeadragon.ScalebarLocation</code> | The location of the scale bar inside the viewer. default: bottom left |
| options.xOffset | <code>Integer</code> | Offset location of the scale bar along x. default: 5 |
| options.yOffset | <code>Integer</code> | Offset location of the scale bar along y. default: 5 |
| options.stayInsideImage | <code>Boolean</code> | When set to true, keep the  scale bar inside the image when zooming out. default: true |
| options.color | <code>String</code> | The color of the scale bar using a color name or the hexadecimal format (ex: black or #000000) default: black |
| options.fontColor | <code>String</code> | The font color. default: black |
| options.backgroundColor | <code>String</code> | The background color. default: none |
| options.fontSize | <code>String</code> | The font size. default: not set |
| options.barThickness | <code>String</code> | The thickness of the scale bar in px. default: 2 |
| options.sizeAndTextRenderer | <code>function</code> | A function which will be called to determine the size of the scale bar and it's text content. The function must have 2 parameters: the PPM at the current zoom level and the minimum size of the scale bar. It must return an object containing 2 attributes: size and text containing the size of the scale bar and the text. default: $.ScalebarSizeAndTextRenderer.METRIC_LENGTH |

<a name="new_Scalebar_new"></a>

### new Scalebar(options, (String})

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.viewer | <code>OpenSeadragon.Viewer</code> | The viewer to attach this Scalebar to. |
| options.type | <code>OpenSeadragon.ScalebarType</code> | The scale bar type. Default: microscopy |
| options.pixelsPerMeter | <code>Integer</code> | The pixels per meter of the zoomable image at the original image size. If null, the scale bar is not displayed. default: null |
| options.referenceItemIdx | <code>Integer</code> | Specify the item from viewer.world to which options.pixelsPerMeter is refering. default: 0 |
| (String} |  | options.minWidth The minimal width of the scale bar as a CSS string (ex: 100px, 1em, 1% etc...) default: 150px |
| options.location | <code>OpenSeadragon.ScalebarLocation</code> | The location of the scale bar inside the viewer. default: bottom left |
| options.xOffset | <code>Integer</code> | Offset location of the scale bar along x. default: 5 |
| options.yOffset | <code>Integer</code> | Offset location of the scale bar along y. default: 5 |
| options.stayInsideImage | <code>Boolean</code> | When set to true, keep the  scale bar inside the image when zooming out. default: true |
| options.color | <code>String</code> | The color of the scale bar using a color name or the hexadecimal format (ex: black or #000000) default: black |
| options.fontColor | <code>String</code> | The font color. default: black |
| options.backgroundColor | <code>String</code> | The background color. default: none |
| options.fontSize | <code>String</code> | The font size. default: not set |
| options.fontFamily | <code>String</code> | The font-family. default: not set |
| options.barThickness | <code>String</code> | The thickness of the scale bar in px. default: 2 |
| options.sizeAndTextRenderer | <code>function</code> | A function which will be called to determine the size of the scale bar and it's text content. The function must have 2 parameters: the PPM at the current zoom level and the minimum size of the scale bar. It must return an object containing 2 attributes: size and text containing the size of the scale bar and the text. default: $.ScalebarSizeAndTextRenderer.METRIC_LENGTH |

<a name="objToParamStr"></a>

## objToParamStr(obj) ⇒
converts an object into a string of url components

**Kind**: global function  
**Returns**: the url encoded string  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | keys and values |


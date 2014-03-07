
var OSDImageMetaData = new Class({
	initialize: function(options) {
		this.imageId = options.imageId;
		this.metaData = null;
		this.retrieveImageSize()
		this.temp = 2;
	},
	retrieveImageSize:function()
    	{
       		var jsonRequest = new Request.JSON({url: "api/Data/osdMetadataRetriever.php",async:false, onSuccess: function(e){
		this.metaData=e;
        	}.bind(this),onFailure:function(e){alert("Failed to get dimension");}.bind(this)}).get({'imageId':this.imageId});
    	}
});

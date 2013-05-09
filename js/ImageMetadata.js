
var ImageMetadata = new Class({
	initialize: function(options) {
		this.imageId = options.imageId;
		this.MaxDimensions = null;
		this.retrieveImageSize()
		this.temp = 2;
	},
	retrieveImageSize:function()
    	{
       		var jsonRequest = new Request.JSON({url:Dir + "/api/getDimensions.php",async:false, onSuccess: function(e){
		this.MaxDimensions=e;
        	}.bind(this),onFailure:function(e){alert("Failed to get dimension");}.bind(this)}).get({'imageId':this.imageId});
    	}
});

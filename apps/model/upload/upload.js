// upload.js
//

function UploadPanel(viewer){

	const temp = `
	  <form>
	    <input name="filesupload" id="filesupload" type="file" multiple="" />
	    <div id="listfiles"></div>
	    <button type="submit">Upload</button>
	    <button id="close">Close</button>
	  </form>  
	`;
	
	this.viewer = viewer;

	this.elt = document.createElement('div');
	this.elt.classList.add('upload-panel');
	this.elt.innerHTML = temp;
	// this.__contours = null;
	// this.__top_left = null;
	// this.__x = null;
	// this.__y = null;
	this.__width = null;
	this.__height = null;
	// this.__spImgX = null;
	// this.__spImgY = null;
	// this.__spImgWidth = null;
	// this.__spImgHeight = null;

	this.__list = this.elt.querySelector('#listfiles');	
	this.__files = this.elt.querySelector('#filesupload');	
    this.elt.querySelector('#close').addEventListener('click',function(e){
    	this.close();
		}.bind(this));

    this.viewer.addOverlay({
      element: this.elt,
      location: new OpenSeadragon.Rect(0,0,0.5,0.5),
      checkResize: false
    });

    this.close()
}

UploadPanel.prototype.open = function(){
	this.elt.style.display = '';
};

UploadPanel.prototype.close = function(){
	this.elt.style.display = 'none';
};

// UploadPanel.prototype.showProgress = function(text){
// 	// console.log('In Progress');
// 	this.__indicator.style.display = 'flex';
// 	if (text) this.__indicator.innerHTML = text;
// }
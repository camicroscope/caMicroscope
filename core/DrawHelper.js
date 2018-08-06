function caDrawHelper(){
	this.version = 0.5;
}

caDrawHelper.prototype.getRect = function(start,end){
	if(start < end){
		return [start, end-start]
	}else{
		return [end, start-end]
	}
}

caDrawHelper.prototype.forRect = function(start,end){
	let [x,width] = this.getRect(start.x,end.x);
	let [y,height] = this.getRect(start.y,end.y);
	return [x,y,width,height];
}

caDrawHelper.prototype.forSquare = function(start,end){
	let dx = Math.abs(start.x - end.x);
	let dy = Math.abs(start.y - end.y);
	let length = Math.max(dx,dy); // Math.max(dx,dy);
	let x = start.x < end.x ? start.x:start.x - length;
	let y = start.y < end.y ? start.y:start.y - length;
	return [x,y,length,length];
}

caDrawHelper.prototype.drawRectangle = function(ctx, start, end, isSquare = false){
	// draw rect
	ctx.beginPath();
	let [x, y, width, height] = isSquare?this.forSquare(start,end):this.forRect(start,end);
	ctx.rect(x, y, width, height);
	ctx.stroke();
	return [{x:x,y:y},{x:x+width,y:y+height}];
}

caDrawHelper.prototype.drawLine = function(ctx, start, end){
	// draw line
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x,end.y);
	ctx.stroke();
}

caDrawHelper.prototype.draw = function(ctx, image_data){
	for (let i = 0; i < image_data.length; i++) {
		const polygon = image_data[i];
		this.setStyle(ctx, polygon.style);
		//this.__setStyle(ctx,polygon.style);
		switch (polygon.drawMode) {
			case 'free':
			// free
			const paths = polygon.path;
			for (let i = 0; i < paths.length-1; i++) {
				this.drawLine(ctx, paths[i],paths[i+1]);
			}
			break;
			
			case 'square':
			// square
			this.drawRectangle(ctx, polygon.path[0],polygon.path[1],true);
			break;
			
			case 'rect':
			// rect
			this.drawRectangle(ctx, polygon.path[0],polygon.path[1]);
			break;
			
			default:
			// statements_def
			break;
		}

	}

}
caDrawHelper.prototype.setStyle = function(ctx,style){
	ctx.strokeStyle = style.color;
	ctx.lineJoin = style.lineJoin;
	ctx.lineCap = style.lineCap;
	ctx.lineWidth = style.lineWidth;
}
caDrawHelper.prototype.clearCanvas = function(canvas){
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var DrawHelper = new caDrawHelper();
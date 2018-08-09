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
	
	// create a new path
	const path = new Path();

	// starting draw rectangle
	let [x, y, width, height] = isSquare?this.forSquare(start,end):this.forRect(start,end);
	path.rect(x, y, width, height);
	
	// close path and set style
	path.closePath()
	path.stroke(ctx);
	path.fill(ctx);
	
	// return points and path 
	return {
		points:[{x:x,y:y},{x:x+width,y:y+height}],
		path:path
	};
}

caDrawHelper.prototype.drawLine = function(ctx, start, end){
	// draw line
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x,end.y);
	ctx.closePath()
	ctx.stroke();
}

caDrawHelper.prototype.drawPolygon = function(ctx, paths){
	// draw drawPolygon
	// create a new path
	const path = new Path();

	// starting draw drawPolygon
	path.moveTo(paths[0].x, paths[0].y);
	for (var i = 1; i < paths.length-1; i++) {
		path.lineTo(paths[i].x,paths[i].y);
	}

	// close path and set style
	path.closePath()
	path.stroke(ctx);
	path.fill(ctx);
	// return points and path
	return {
		points:paths,
		path:path
	};
}
caDrawHelper.prototype.draw = function(ctx, image_data){
	for (let i = 0; i < image_data.length; i++) {
		const polygon = image_data[i];

		// other styles
		this.setStyle(ctx, polygon.style);
		// fill color
		ctx.fillStyle = hexToRgbA(polygon.style.color,0.1);
		// if there is path using path to draw
		if(polygon.data.path){
			polygon.data.path.strokeAndFill(ctx);
			continue;
		}

		// if no data 
		const points = polygon.data.points;
		switch (polygon.drawMode) {
			case 'free':
				// free
				polygon.data = this.drawPolygon(ctx, points);
				break;

			case 'square':
				// square
				polygon.data = this.drawRectangle(ctx, points[0],points[1],true);
				break;
			
			case 'rect':
				// rect
				polygon.data = this.drawRectangle(ctx, points[0],points[1]);
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
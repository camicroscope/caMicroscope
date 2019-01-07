
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
    let [x,width] = this.getRect(start[0],end[0]);
    let [y,height] = this.getRect(start[1],end[1]);
    return [x,y,width,height];
}

caDrawHelper.prototype.forSquare = function(start,end){
    let dx = Math.abs(start[0] - end[0]);
    let dy = Math.abs(start[1] - end[1]);
    let length = Math.max(dx,dy); // Math.max(dx,dy);
    let x = start[0] < end[0] ? start[0]:start[0] - length;
    let y = start[1] < end[1] ? start[1]:start[1] - length;
    return [x,y,length,length];
}

/**
 * draw a rectangle or square on a canvas 
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param  {Point}  start
 *         the start point of the diagonal. point as [x,y].
 * @param  {Point}  end
 *         the end point of the diagonal. point as [x,y].
 * @param  {Boolean} [isSquare=false]
 *         draw as a square
 * @return {Object}  the data that has all points and Path2D that are used to describe the rectangle and the Path
 */
caDrawHelper.prototype.drawRectangle = function(ctx, start, end, isSquare = false){
    // draw rect
    
    // create a new path
    const path = new Path();

    // starting draw rectangle
    let [x, y, width, height] = isSquare?this.forSquare(start,end):this.forRect(start,end);
    path.rect(x, y, width, height);
    
    // close path and set style
    path.closePath()
    if(ctx.isFill ==undefined || ctx.isFill){
        path.fill(ctx);
    }else{
        path.stroke(ctx);
    }

    // return points and path 
    return {
        points:[
            [x,y],
            [x+width,y],
            [x+width,y+height],
            [x,y+height]
        ],
        path:path
    };
}

/**
 * draw multilines
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param  {Array} array
 *         an array of points
 */
caDrawHelper.prototype.drawMultiline = function(ctx,array){
    for (var i = 1; i < array.length; i++) {
        this.drawLine(ctx,array[i-1],array[i]);
    }
}

/**
 * draw a line
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param  {Point}  start
 *         the start point of the line. point as [x,y].
 * @param  {Point}  end
 *         the end point of the line. point as [x,y].
 */
caDrawHelper.prototype.drawLine = function(ctx, start, end){
    // draw line
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0],end[1]);
    ctx.closePath()
    ctx.stroke();
}

/**
 * draw a polygon on a canvas 
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param  {Array}  paths
 *         an collection of points that is used to draw polygon
 */
caDrawHelper.prototype.drawPolygon = function(ctx, paths){
    // draw drawPolygon
    // create a new path
    const path = new Path();

    // starting draw drawPolygon
    path.moveTo(paths[0][0], paths[0][1]);
    for (var i = 1; i < paths.length-1; i++) {
        path.lineTo(paths[i][0],paths[i][1]);
    }

    // close path and set style
    path.closePath()
    if(ctx.isFill ==undefined || ctx.isFill){
        path.fill(ctx);
    }else{
        path.stroke(ctx);
    }
    // return points and path
    return path
}

/**
 * draw a collection of polygon
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param  {Array} image_data
 *         The collection of data that is used to describe polygon
 */
caDrawHelper.prototype.draw = function(ctx, image_data){
    for (let i = 0; i < image_data.length; i++) {
        const polygon = image_data[i];
        const style = polygon.properties.style;

        // if there is path using path to draw
        // if(polygon.geometry.path){
        //     ctx.fillStyle = hexToRgbA(style.color,0.5);
        //     polygon.geometry.path.fill(ctx);
        //     continue;
        // }
        // other styles
        this.setStyle(ctx, style);
        // fill color
        
        // if no data 
        const points = polygon.geometry.coordinates[0];
        if(polygon.geometry.type=='LineString'){
            ctx.fillStyle = style.color;
            polygon.geometry.path = this.drawMultiline(ctx, points);
        }else{
           
            ctx.fillStyle = (ctx.isFill ==undefined || ctx.isFill)?hexToRgbA(style.color,0.5):style.color;
            polygon.geometry.path = this.drawPolygon(ctx, points);
        }
        
    }

}

/**
 * set the style to a specific context2D
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param {Object} [style]
 *        The style of the draw on a image
 * @param {String} [style.color]
 *        The color of lines
 * @param {Number} [style.lineWidth]
 *        sets the thickness of lines in space units.
 * @param {Object} [style.lineJoin]
 *        how two connecting segments in a shape are joined together. There are 3 possible values: 'bevel', 'round', 'miter'
 * @param {Object} [style.lineCap]
 *        how the end points of every line are drawn. There are three possible values: 'butt', 'round' and 'square'
 */
caDrawHelper.prototype.setStyle = function(ctx,style){
    ctx.strokeStyle = style.color;
    ctx.lineJoin = style.lineJoin;
    ctx.lineCap = style.lineCap;
    ctx.lineWidth = style.lineWidth;
    ctx.isFill = style.isFill;
}

/**
 * clear a canvas
 * @param  {Canvas} canvas
 *         a intance of canvas
 */
caDrawHelper.prototype.clearCanvas = function(canvas){
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var DrawHelper = new caDrawHelper();
//OpenSeadragon.DrawHelper = DrawHelper;
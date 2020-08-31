
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

caDrawHelper.prototype.forSquare = function(start,end,size=null){
    
    let dx = Math.abs(start[0] - end[0]);
    let dy = Math.abs(start[1] - end[1]);
    let length = Math.max(dx,dy);
    if (size) length -= (length % size);
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
caDrawHelper.prototype.drawRectangle = function(ctx, start, end, isSquare = false, size = null){
    // draw rect
    
    // create a new path
    const path = new Path();

    // starting draw rectangle
    let [x, y, width, height] = isSquare?this.forSquare(start,end,size):this.forRect(start,end);
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
caDrawHelper.prototype.circle = function(ctx, point, radius){
    const path = new Path();
    path.arc(
        point[0],
        point[1], 
        radius, 0, 2 * Math.PI
    );
    path.closePath();
    path.strokeAndFill(ctx);
    //path.stroke(ctx);
    // return points and path
    return path;
}
caDrawHelper.prototype.drawMultiGrid = function(ctx, points, size){
    const path = new Path();
    points.forEach(p=>{
        path.rect(p[0],p[1],size[0],size[1]);
    });
    path.closePath()
    //path.fill(ctx);
    path.stroke(ctx);
    // return points and path
    return path;
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
 * draw a circle
 * @param  {CanvasRenderingContext2D}  ctx
 *         is used for drawing rectangles, text, images and other objects onto the canvas element
 * @param  {Number}  cx
 *         The x-coordinate of the center of the circle
 * @param  {Number}  xy
 *         The x-coordinate of the center of the circle
 * @param  {Number}  r
 *         The radius of the circle   
 */
caDrawHelper.prototype.drawCircle = function(ctx, cx, cy, r){
    // draw line
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath()
    
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
        // path.fill(ctx);
        path.stroke(ctx);
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
            // determine drawing or not
            if(ctx.viewBoundBoxInData 
                && polygon.bound
                && polygon.bound.coordinates
                && polygon.bound.coordinates[0]
                && (!polygon.properties.size)
                && (!this.doesDraw(polygon.bound.coordinates[0], ctx)
                || !this.isIntersectBBox(ctx.viewBoundBoxInData, polygon.bound.coordinates[0]))) continue;
            ctx.fillStyle = style.color;
            if(polygon.properties.size){
                polygon.geometry.path = this.drawGrid(ctx, polygon);
            }else{
                polygon.geometry.path = this.drawMultiline(ctx, points);
            }
            
        }else if(polygon.geometry.type=='Point'){
            const point = polygon.geometry.coordinates
            if(ctx.viewBoundBoxInData
                && !this.isPointInBBox(ctx.viewBoundBoxInData, {x:point[0],y:point[1]})) continue;
            
            ctx.fillStyle = (ctx.isFill ==undefined || ctx.isFill)?hexToRgbA(style.color,1):style.color;
            polygon.geometry.path = this.circle(ctx, polygon.geometry.coordinates, ctx.radius);
        }else if(false){

        }else{
            // determine drawing or not
            if(ctx.viewBoundBoxInData 
                && polygon.bound
                && polygon.bound.coordinates
                && polygon.bound.coordinates[0]
                && (!this.doesDraw(polygon.bound.coordinates[0], ctx)
                || !this.isIntersectBBox(ctx.viewBoundBoxInData, polygon.bound.coordinates[0]))) continue;
                
            ctx.fillStyle = (ctx.isFill ==undefined || ctx.isFill)?hexToRgbA(style.color,0.5):style.color;
            polygon.geometry.path = this.drawPolygon(ctx, points);
        }
        
    }

}
caDrawHelper.prototype.isPointInBBox = function(bbox, point){
    if( bbox.min.x <= point.x && point.x <= bbox.max.x && bbox.min.y <= point.y && point.y <= bbox.max.y ) {
        return true;
    }
    return false;
}

caDrawHelper.prototype.isIntersectBBox = function(bbox1, bbox2){
    return (
      bbox2[2][0] >= bbox1.min.x &&
      bbox2[0][0] <= bbox1.max.x &&
      bbox2[2][1] >= bbox1.min.y &&
      bbox2[0][1] <= bbox1.max.y
    );
}

caDrawHelper.prototype.doesDraw = function(bbox, ctx){
    const area = (bbox[2][0]-bbox[0][0]) * (bbox[2][1]-bbox[0][1])
    const minArea = getMinFootprint(ctx.imagingHelper, 6);
    return minArea <= area ?true: false;
}

caDrawHelper.prototype.drawGrids = function(ctx, image_data){
    image_data.forEach(polygon =>{
        const style = polygon.properties.style;
        const size = polygon.properties.size;
        //this.setStyle(ctx, style);
        ctx.fillStyle = hexToRgbA(polygon.properties.style.color,0.1);
        const points = polygon.geometry.coordinates[0];
        const grids = getGrids(points, size);
        this.drawMultiGrid(ctx, grids, size);
    })
}
caDrawHelper.prototype.drawGrid = function(ctx, polygon){
        const style = polygon.properties.style;
        const size = polygon.properties.size;
        //this.setStyle(ctx, style);
        ctx.fillStyle = hexToRgbA(polygon.properties.style.color,0.1);
        const points = polygon.geometry.coordinates[0];
        const grids = getGrids(points, size);
        return this.drawMultiGrid(ctx, grids, size);
}

// caDrawHelper.prototype.drawBrushGrids = function(ctx, polygon){
//     const style = polygon.properties.style;
//     const grids = polygon.geometry.coordinates[0];
//     const size = polygon.properties.size;
//     ctx.fillStyle = hexToRgbA(polygon.properties.style.color,0.5);
//     polygon.geometry.path = this.drawMultiGrid(ctx, grids, size);
// }

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
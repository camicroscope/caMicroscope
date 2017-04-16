annotools.prototype.drawMarking = function (ctx) {
  this.removeMouseEvents();
  var started = false;
  var pencil = [];
  var newpoly = [];
  this.newpoly_arr = [];
  this.color_arr = [];
  this.anno_arr = [];
  this.marktype_arr = [];
  this.markwidth_arr = [];
  this.current_canvasContext = ctx;
  this.mark_type = 'LymPos';

  // Variables for broken markups
  this.rawAnnotArray = [];

  /*Change button and cursor*/
  jQuery("canvas").css("cursor", "crosshair");
  //jQuery("#drawFreelineButton").css("opacity", 1);
  /**/


  this.drawCanvas.addEvent('mousedown', function (e) {
    started = true
    pencil = [];
    newpoly = [];
    var startPoint = OpenSeadragon.getMousePosition(e.event);
    var relativeStartPoint = startPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
    newpoly.push({
      'x': relativeStartPoint.x,
      'y': relativeStartPoint.y
    })
    ctx.beginPath();
    ctx.moveTo(relativeStartPoint.x, relativeStartPoint.y);

    var drawn_linewidth = 3;
    // Check what radio box is checked
    if (jQuery("#LymPosBig").is(':checked'))
    {
        ctx.strokeStyle = 'red';
        this.mark_type = 'LymPos';
        this.markupline_width = 2;
        drawn_linewidth = 6;
    }

    if (jQuery("#LymNegBig").is(':checked'))
    {
        ctx.strokeStyle = 'blue';
        this.mark_type = 'LymNeg';
        this.markupline_width = 2;
        drawn_linewidth = 6;
    }

    if (jQuery("#LymPos").is(':checked'))
    {
        ctx.strokeStyle = 'red';
        this.mark_type = 'LymPos';
        this.markupline_width = 1;
    }

    if (jQuery("#LymNeg").is(':checked'))
    {
        ctx.strokeStyle = 'blue';
        this.mark_type = 'LymNeg';
        this.markupline_width = 1;
    }

    if (jQuery("#TumorPos").is(':checked'))
    {
        ctx.strokeStyle = 'orange';
        this.mark_type = 'TumorPos';
    }

    if (jQuery("#TumorNeg").is(':checked'))
    {
        ctx.strokeStyle = 'lime';
        this.mark_type = 'TumorNeg';
    }
    console.log(this.mark_type);

    this.color_arr.push(ctx.strokeStyle);
    console.log(this.color);
    ctx.lineWidth = drawn_linewidth;
    ctx.stroke();
  }.bind(this))

  this.drawCanvas.addEvent('mousemove', function (e) {
    var newPoint = OpenSeadragon.getMousePosition(e.event);
    var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
    if (started) {
      newpoly.push({
        'x': newRelativePoint.x,
        'y': newRelativePoint.y
      })

      ctx.lineTo(newRelativePoint.x, newRelativePoint.y);
      ctx.stroke();
    }
  })

  this.drawCanvas.addEvent('mouseup', function (e) {
    started = false
    pencil = [];		// Added to process one poly at a time
    pencil.push(newpoly)
    this.newpoly_arr.push(newpoly);
    newpoly = []
    numpoint = 0
    var x,y,w,h
    x = pencil[0][0].x
    y = pencil[0][0].y

    var maxdistance = 0
    var points = ''
    var endRelativeMousePosition
    for (var i = 0; i < pencil.length; i++) {
      newpoly = pencil[i]
      for (j = 0; j < newpoly.length - 1; j++) {
        points += newpoly[j].x + ',' + newpoly[j].y + ' '
        if (((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y)) > maxdistance) {
          maxdistance = ((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y))
          var endMousePosition = new OpenSeadragon.Point(newpoly[j].x, newpoly[j].y)
          endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas))
        }
      }

      console.log(points);
      console.log(endMousePosition);
      points = points.slice(0, -1)
      //console.log(points);
      points += ';'
    }
    points = points.slice(0, -1)
    //console.log(points);

    var newAnnot = {
      x: x,
      y: y,
      w: w,
      h: h,
      type: 'pencil_mark',
      points: points,
      color: this.color,
      loc: []
    }

    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition))
    newAnnot.x = globalNumbers.nativeX
    newAnnot.y = globalNumbers.nativeY
    newAnnot.w = globalNumbers.nativeW
    newAnnot.h = globalNumbers.nativeH
    newAnnot.points = globalNumbers.points
    var loc = []
    loc[0] = parseFloat(newAnnot.x)
    loc[1] = parseFloat(newAnnot.y)
    newAnnot.loc = loc
    //console.log(newAnnot)
    this.rawAnnotArray.push(newAnnot);
    var geojsonAnnot = this.convertPencilToGeo(newAnnot)
    geojsonAnnot.object_type = 'marking';
    //console.log(geojsonAnnot);
    //this.promptForAnnotation(geojsonAnnot, 'new', this, ctx)
    this.anno_arr.push(geojsonAnnot);
    this.marktype_arr.push(this.mark_type);
    this.markwidth_arr.push(this.markupline_width);
    //this.saveMarking(geojsonAnnot, this.mark_type);

    /* Change button back to inactive*/
    jQuery("canvas").css("cursor", "default");
    jQuery("#drawFreelineButton").removeClass("active");
    //console.log(this.mark_type);

  }.bind(this))
}

annotools.prototype.breakAndConvertToGeo = function ()
{
    // Refresh this.anno_arr
    this.anno_arr = [];
    this.marktype_broken_arr = [];
    this.markwidth_broken_arr = [];
    for (i = 0; i< this.rawAnnotArray.length; i++)
    {
        rawAnnot = this.rawAnnotArray[i];

        // Convert rawAnnot
        var floatPoints = [];
        var point_str_set = rawAnnot.points.split(' ');
        for (iPoint = 0; iPoint < point_str_set.length; iPoint++)
        {
            point_str = point_str_set[iPoint].split(',');
            floatPoints.push([parseFloat(point_str[0]), parseFloat(point_str[1])]);
        }

        brokenAnnot = JSON.parse(this.break_drawings(floatPoints));
        coor_set = brokenAnnot.coordinate_set;
        for (j = 0; j < coor_set.length; j++)
        {
            var newAnnot = {
                x: brokenAnnot.nativeX_set[j],
                y: brokenAnnot.nativeY_set[j],
                w: brokenAnnot.nativeW_set[j],
                h: brokenAnnot.nativeH_set[j],
                type: 'pencil_mark',
                points: coor_set[j],
                color: this.color_arr[i],
                loc: [parseFloat(brokenAnnot.nativeX_set[j]), parseFloat(brokenAnnot.nativeY_set[j])]
            };
            var geojsonAnnot = this.convertPencilToGeo(newAnnot);
            geojsonAnnot.object_type = 'marking';
            this.anno_arr.push(geojsonAnnot);
            this.marktype_broken_arr.push(this.marktype_arr[i]);
            this.markwidth_broken_arr.push(this.markwidth_arr[i]);
        }
    }
}

annotools.prototype.saveMarking = function (newAnnot, mark_type) {
    var val = {
        'secret': 'mark1',
        'mark_type': mark_type,
        'username': this.username
    }
    //console.log(newAnnot);
    newAnnot.properties.annotations = val;
    //console.log(newAnnot.properties.annotations.secret);
    this.addnewAnnot(newAnnot);
}

annotools.prototype.saveMarking_arr = function (newAnnot_arr, mark_type_arr, mark_width_arr) {
    for (iAnn = 0; iAnn < newAnnot_arr.length; iAnn++) {
        var val = {
            'secret': 'mark1',
            'mark_type': mark_type_arr[iAnn],
            'mark_width': mark_width_arr[iAnn],
            'username': this.username
        }
        newAnnot_arr[iAnn].properties.annotations = val;
    }
    this.addnewAnnot_Array(newAnnot_arr);
}

annotools.prototype.markSave = function (notification, isSetNormalMode) {
    console.log(this.rawAnnotArray.length);
    if (this.rawAnnotArray.length == 0)
        return;

    this.breakAndConvertToGeo();
    this.saveMarking_arr(this.anno_arr, this.marktype_broken_arr, this.markwidth_broken_arr);
    if (notification == true) {
        alert("Saved markup");
    }
    console.log(this.marktype_arr);

    if (isSetNormalMode == true)
    {
        jQuery('#markuppanel').hide('slide');
        this.drawLayer.hide();
        this.addMouseEvents();
        this.toolBar.setNormalMode();
    }
    else
    {
        this.drawLayer.hide();
        this.drawMarkups();
        //this.toolBar.setNormalMode();
    }
}

annotools.prototype.markSaveClick = function (event) {
    this.markSave(false, false);
}

annotools.prototype.undoStroke = function () {
    console.log('undo stroke');
    console.log(this.newpoly_arr.length);
    this.newpoly_arr.pop();
    this.color_arr.pop();
    this.anno_arr.pop();
    this.rawAnnotArray.pop();
    this.marktype_arr.pop();
    this.markwidth_arr.pop();
    console.log(this.color_arr);
    this.reDrawCanvas();
}

annotools.prototype.reDrawCanvas = function () {
    ctx = this.current_canvasContext;
    ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    for (i = 0; i< this.newpoly_arr.length; i++)
    {
        path = this.newpoly_arr[i];
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        ctx.strokeStyle = this.color_arr[i];
        ctx.lineWidth = 3.0;
        ctx.stroke();
        for (iptx = 1; iptx < path.length; iptx++)
        {
            ctx.lineTo(path[iptx].x, path[iptx].y);
            ctx.stroke();
        }
    }
}

annotools.prototype.switchUserRadiobuttonChange = function(event) {
    this.username = event.target.value;
    this.loadHeatmapWeight();
    this.loadedWeight = true;
    this.getMultiAnnot();
}

annotools.prototype.radiobuttonChange = function(event) {
    console.log('rb changed');
    console.log(this.marking_choice);
    var self = this;
    if (event.target.id == 'rb_Moving')
    {
        console.log('rb_Moving mode');

        // Save current
        this.markSave(false, false);

        // Switch to normal mode
        jQuery("canvas").css("cursor", "default");
        jQuery("#drawRectangleButton").removeClass('active');
        jQuery("#drawFreelineButton").removeClass('active');
        jQuery("#drawDotButton").removeClass("active");   // Dot Tool
        jQuery("#freeLineMarkupButton").removeClass("active");
        //jQuery("#markuppanel").hide('slide');
        this.drawLayer.hide();
        this.addMouseEvents();
    }
    else
    {
        if (this.marking_choice == 'rb_Moving')
        {
            console.log('change to drawing mode');
            this.drawMarkups();
            jQuery("canvas").css("cursor", "crosshair");
            jQuery("#drawRectangleButton").removeClass("active");
            jQuery("#drawDotButton").removeClass("active");     // Dot Tool
            jQuery("#drawFreelineButton").removeClass("active");
        }
    }
    this.marking_choice = event.target.id;
}


annotools.prototype.break_drawings = function(nativepoints) {
    patch_size = 0.0004;
    max_n_point = 6;
    coordinate_set = [];
    nativeX_set = [];
    nativeY_set = [];
    nativeW_set = [];
    nativeH_set = [];

    var canvas_offset_raw = OpenSeadragon.getElementOffset(viewer.canvas);
    var canvas_offset_x = this.imagingHelper.physicalToLogicalX(canvas_offset_raw.x);		// Added by Vu
    var canvas_offset_y = this.imagingHelper.physicalToLogicalY(canvas_offset_raw.y);

    if (nativepoints.length == 0)
        return [coordinate_set, nativeX_set, nativeY_set, nativeW_set, nativeH_set];

    //console.log('original native points');
    //console.log(nativepoints);


    x_old = nativepoints[0][0];
    y_old = nativepoints[0][1];
    x_start = x_old;
    y_start = y_old;
    coor_str = x_start + ',' + y_start;
    n_point = 0;
    for (k = 0; k < nativepoints.length; k++) {
        x = nativepoints[k][0];
        y = nativepoints[k][1];

        len = Math.sqrt((x-x_old)*(x-x_old) + (y-y_old)*(y-y_old));
        divn = Math.floor(len / patch_size);
        if ((divn < 1) && (k != nativepoints.length - 1)) {
            continue;
        }
        no_seg = Math.ceil(len / patch_size);
	dir_x = (x-x_old) / no_seg;
	dir_y = (y-y_old) / no_seg;

	for (ps = 0; ps < no_seg; ps++) {
		added_X = x_old + dir_x * ps;
		added_Y = y_old + dir_y * ps;
		coor_str += ' ' + added_X.toFixed(6) + ',' + added_Y.toFixed(6);
		n_point ++;
	}
	
	coor_str += ' ' + x.toFixed(6) + ',' + y.toFixed(6);
	n_point ++;

        if (n_point >= max_n_point || k == nativepoints.length - 1) {
        	coordinate_set.push(coor_str);
	        nativeX_set.push((x_start+x)/2);
	        nativeY_set.push((y_start+y)/2);
		nativeW_set.push(0.2);
		nativeH_set.push(0.2);
		x_start = x;
		y_start = y;
    		coor_str = x_start + ',' + y_start;
		n_point = 0;
	}

        x_old = x;
        y_old = y;
    }

    //console.log(coordinate_set);
    return result = JSON.encode({coordinate_set:coordinate_set, nativeX_set:nativeX_set, nativeY_set:nativeY_set, nativeW_set:nativeW_set, nativeH_set:nativeH_set});
}

annotools.prototype.separate_line = function(coor_list) {
    max_point = 300;
    coor_list_arr = [];
    curr_seg = 0;
    for (ps = 0; ps < coor_list.length; ps += max_point, curr_seg++) {
	for (subps = ps; subps< Math.min(coor_list.length, ps + max_point); subps++)
	{
		console.log('abc');
	}
    }
}

// smooth the high resolution heatmap
// smooth_width: integer. the side-length of the smoothing window is 2*smooth_width+1
// smooth_factor: float. higher smooth_factor --> more smoothness
annotools.prototype.heatmap_smoothing = function(smooth_width, smooth_factor) {
    var annotations = this.annotations;
    var smoothed_anno = [];

    // get heatmap patch size
    px = 1.0;
    py = 1.0;
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation.object_type == 'heatmap_multiple') {
            var nativepoints = annotation.geometry.coordinates[0];
            this_px = Math.abs(nativepoints[0][0] - nativepoints[2][0]);
            this_py = Math.abs(nativepoints[0][1] - nativepoints[2][1]);
            if (this_px < px)
                px = this_px;
            if (this_py < py)
                py = this_py;
        }
    }

    // put heatmap to a dictionary
    var dict = {};
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation.object_type == 'heatmap_multiple') {
            var nativepoints = annotation.geometry.coordinates[0];
            this_px = Math.abs(nativepoints[0][0] - nativepoints[2][0]);
            if (Math.abs(this_px-px) < 0.0000001) {
                x = Math.round(nativepoints[0][0] / px);
                y = Math.round(nativepoints[0][1] / py);
                dict[x.toString()+'-'+y.toString()] = annotation.properties.multiheat_param.metric_array[0];
            }
        }
    }

    // heatmap smoothing
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        smoothed = 0;
        if (annotation.object_type == 'heatmap_multiple') {
            var nativepoints = annotation.geometry.coordinates[0];
            this_px = Math.abs(nativepoints[0][0] - nativepoints[2][0]);
            if (Math.abs(this_px-px) < 0.0000001) {
                // make sure it's high-res heatmap
                x = Math.round(nativepoints[0][0] / px);
                y = Math.round(nativepoints[0][1] / py);
                score_sum = 0;
                weight_sum = 0;
                for (xi = x-smooth_width; xi <= x+smooth_width; xi++) {
                    for (yi = y-smooth_width; yi <= y+smooth_width; yi++) {
                        key = xi.toString()+'-'+yi.toString();
                        if (key in dict) {
                            weight = 1.0 / (Math.abs(xi-x) + Math.abs(yi-y) + smooth_factor);
                            score_sum += dict[key] * weight;
                            weight_sum += weight;
                        }
                    }
                }
                smoothed = score_sum / weight_sum;
            }
        }
        smoothed_anno.push(smoothed);
    }

    return smoothed_anno;
}

annotools.prototype.calculateIntersect = function(high_res) {
    var marking_sample_rate = 1;
    var center_dis = 1.0;
    var annotations = this.annotations;

    var labels = [];
    var label_dates = [];
    var id = [];
    var cx = [];
    var cy = [];

    if (annotations == null) {
        return labels;
    }

    // get heatmap patch centers
    hpx_small = 1.0;
    hpy_small = 1.0;
    hpx_big = 0.0;
    hpy_big = 0.0;
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        labels.push(0);
        label_dates.push(0);
        if (annotation.object_type == 'heatmap_multiple') {
            var nativepoints = annotation.geometry.coordinates[0];
            id.push(i);
            cx.push((nativepoints[0][0] + nativepoints[2][0])/2.0);
            cy.push((nativepoints[0][1] + nativepoints[2][1])/2.0);
            hpx = Math.abs(nativepoints[0][0] - nativepoints[2][0]) / 2.0;
            hpy = Math.abs(nativepoints[0][1] - nativepoints[2][1]) / 2.0;
            if (hpx < hpx_small)
                hpx_small = hpx;
            if (hpx > hpx_big)
                hpx_big = hpx;
            if (hpy < hpy_small)
                hpy_small = hpy;
            if (hpy > hpy_big)
                hpy_big = hpy;
        }
    }

    disx = 0;
    disy = 0;
    if (high_res) {
        var disx = center_dis * hpx_small;
        var disy = center_dis * hpy_small;
    } else {
        var disx = center_dis * hpx_big;
        var disy = center_dis * hpy_big;
    }

    if (disx == 0 || disy == 0) {
        return;
    }

    // traverse markings
    for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        //var date = Date.parse(annotation.date.$date);
        //var date = this.getDate(annotation);

        if (annotation.object_type != 'marking') {
            continue;
        }
        if (!annotation.properties.annotations.hasOwnProperty('username')) {
            continue;
        }
        if (annotation.properties.annotations.username != this.username) {
            continue;
        }

        if (annotation.properties.annotations.mark_type == 'LymPos') {
            label = 1;
        } else if (annotation.properties.annotations.mark_type == 'LymNeg') {
            label = -1;
        } else {
            continue;
        }

	var date = this.getDate(annotation);
	
    	if (high_res) {
		var mark_width = Math.pow(annotation.properties.annotations.mark_width, 2);
	} else {
		var mark_width = 1.0;
	}
        var nativepoints = annotation.geometry.coordinates[0];
        for (var k = 0; k < nativepoints.length; k+=marking_sample_rate) {
            x = nativepoints[k][0];
            y = nativepoints[k][1];
            for (var xy_i = 0; xy_i < cx.length; xy_i++) {
                if ((Math.abs(cx[xy_i] - x) <= disx*mark_width) && (Math.abs(cy[xy_i] - y) <= disy*mark_width)) {
                    if (date > label_dates[id[xy_i]]) {
                        label_dates[id[xy_i]] = date;
                        labels[id[xy_i]] = label;
                    }
                }
            }
        }
    }

    return labels;
}

annotools.prototype.getDate = function(annotation)
{
	if (typeof annotation.date != "undefined")
	{
		return annotation.date;
	}
	else
	{
		console.log(typeof annotation.date.$date);
		if (typeof annotation.date.$date != "undefined")
		{
			return Date.parse(annotation.date.$date);
		}
	}
	return null;
}

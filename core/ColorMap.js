/**
* Heatmap manager for camicroscope, based on simplheat
* @property options.point_radius - simpleheat point radius of rendererig
* @property options.blur_radius - simpleheat blur radius of rendererig
* @property options.scale_y - number to multiply y by, default 1
* @property options.scale_x - number to multiply x by, default 1
* @property options.scale_data - number to multiply all data by, default 1
**/
class Heatmap {
    constructor(options) {
        options = options || {}
        this.point_radius = options.point_radius || options.radius || 10
        this.blur_radius = options.blur_radius || options.radius || 20
        this.scale_x = options.scale_x || options.scale || 1
        this.scale_y = options.scale_y || options.scale || 1
        this.scale_data = options.scale_data || 1
        // make the canvas
        this._canvas = document.createElement('canvas')
        this._context = this._canvas.getContext('2d')
        this._heat = simpleheat(this._context)
    }
    /*
    * loads and scales but does not render the heatmap data
    * @property data -hheatmap data, in format [[x,y,value...]]
    */
    load(data) {
        var w, h, m
        w = h = m = 0;
        for (i in data) {
            data[i][0] *= this.scale_x;
            data[i][1] *= this.scale_y;
            data[i][2] *= this.scale_data;
            if (w < data[i][0]) {
                w = data[i][0]
            }
            if (h < data[i][1]) {
                h = data[i][1]
            }
            if (m < data[i][2]) {
                m = data[i][2]
            }
        }
        // internal canvas should have same resolution as data
        this._canvas.height = h;
        this._canvas.width = w;
        heat.resize()
        this._heat.max(m)
        this._heat.data(data)
        this._heat.radius(this.point_radius, this.blur_radius)
    }
    // threhsold operation

    /*
    * Renders loaded data to a fiven layer
    * @property layer - canvas context to render onto
    * @property width - width of final heatmap
    * @property height - height of final heatmap
    */
    renderTo(layer, width, height) {
        layer.drawImage(this._context, 0, 0, width, height)
    }
}

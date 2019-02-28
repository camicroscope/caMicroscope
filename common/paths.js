/**
 * Hit detection for Path objects
 * -- basically native in modern browsers supporting Path2D
 * -- legacy support for older browsers
 * 
 */

// 'function' in modern browsers, 'object' in safari < 10
if (typeof Path2D == 'function' || typeof Path2D == 'object') {
    var Path = Path2D
    Path.prototype.contains = function(x, y, fillRule='nonzero') {
        return this.__ghostContext.isPointInPath(this, x, y, fillRule)
    }
    Path.prototype.stroke = function(context) {
        context.stroke(this)
    }
    Path.prototype.fill = function(context, fillRule = 'nonzero') {
        context.fill(this, fillRule)
    }
    Path.prototype.strokeAndFill = function(context, fillRule = 'nonzero') {
        context.stroke(this)
        context.fill(this, fillRule)
    }
    Path.prototype.__ghostContext = document.createElement('canvas').getContext('2d')
} else {
    var Path = function() {
        this.components = [{
            fn: 'beginPath'
        }]
    }
    Path.prototype =    {
        //addPath: function() {},
        closePath: function() {
            this.components.push({
                fn: 'closePath',
                args: arguments
            })
        },
        moveTo: function(
            ) {
            this.components.push({
                fn: 'moveTo',
                args: arguments
            })
        },
        lineTo: function() {
            this.components.push({
                fn: 'lineTo',
                args: arguments
            })
        },
        bezierCurveTo: function() {
            this.components.push({
                fn: 'bezierCurveTo',
                args: arguments
            })
        },
        quadraticCurveTo: function() {
            this.components.push({
                fn: 'quadraticCurveTo',
                args: arguments
            })
        },
        arc: function() {
          this.components.push({
                fn: 'arc',
                args: arguments
            })
        },
        arcTo: function() {
            this.components.push({
                fn: 'arcTo',
                args: arguments
            })
        },
        ellipse: function() {
            this.components.push({
                fn: 'ellipse',
                args: arguments
            })
        },
        rect: function() {
          this.components.push({
                fn: 'rect',
                args: arguments
            })
        },
        contains: function(x, y, fillRule) {
            this.__assemble()
            return this.__ghostContext.isPointInPath(x, y, fillRule)
        },
        stroke: function(context) {
            this.__assemble(context)
            context.stroke()
        },
        fill: function(context, fillRule) {
            this.__assemble(context)
            context.fill(fillRule)
        },
        strokeAndFill: function(context, fillRule) {
            this.__assemble(context)
            context.stroke()
            context.fill(fillRule)
        },
        __assemble: function(context) {
            var ctx = context || this.__ghostContext
            this.components.forEach(function(c) {
                ctx[c.fn].apply(ctx, c.args)
            })
        },
        __ghostContext: document.createElement('canvas').getContext('2d')
    }
}
//OpenSeadragon.Path = Path;
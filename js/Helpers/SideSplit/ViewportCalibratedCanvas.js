function ViewportCalibratedCanvas(base, viewer) {
    // translation methods
    function convertPoint(x, y) {
        var pt = new OpenSeadragon.Point(x, y);
        return viewer.viewport.viewportToImageCoordinates(pt);
    }
    function convertLen(x, y) {
      var pt = new OpenSeadragon.Point(x, y);
      var pt_ref = new OpenSeadragon.Point(0, 0);
      var im_pt = viewer.viewport.viewportToImageCoordinates(pt);
      var im_pt_ref = viewer.viewport.viewportToImageCoordinates(pt_ref);
      return im_pt.minus(im_pt_ref);
    }

    var handler = {
        get(obj, prop, val) {
            // which points need to be converted for which method
            // 1 and 2 are points, 3 and 4 are len (or not present)
            var _pt2_len2 = ["clearRect", "fillRect", "strokeRect", "moveTo", "lineTo", "rect", "translate", "ellipse"];
            // all args are sets of points
            var _allpoints = ["createLinearGradient", "createRadialGradient", "bezierCurveTo", "quadraticCurveTo", "drawImage", "getImageData"]
            // transformation matrix
            var _tramat = ["transform", "setTransform"]
            // text x y
            var _txt = ["fillText", "strokeText"]
            if (_pt2_len2.indexOf(prop) >= 0) {
                return function(...args) {
                    if (args.length >= 2) {
                        var pt = convertPoint(args[0], args[1])
                        args[0] = pt.x;
                        args[1] = pt.y;
                    }
                    if (args.length >= 4) {
                        var pt = convertLen(args[2], args[3])
                        args[2] = pt.x;
                        args[3] = pt.y;
                    }
                    obj[prop](...args);
                }
            } else if (_allpoints.indexOf(prop) >= 0) {
                return function(...args) {
                    // for each set of two, convert
                    for (var i = 0; i < Math.floor(args.length / 2); i++) {
                        var pt = convertPoint(args[2 * i], args[2 * i + 1])
                        args[2 * i] = pt.x;
                        args[2 * i + 1] = pt.y;
                    }
                    obj[prop](...args);
                }
            } else if (_tramat.indexOf(prop) >= 0) {
                return function(...args) {
                    if (args.length >= 6) {
                        var pt = convertPoint(args[4], args[5])
                        args[4] = pt.x;
                        args[5] = pt.y;
                    }
                    obj[prop](...args);
                }
            } else if (_txt.indexOf(prop) >= 0) {
                return function(...args) {
                    if (args.length >= 3) {
                        var pt = convertPoint(args[1], args[2])
                        args[1] = pt.x;
                        args[2] = pt.y;
                    }
                    if (args.length >= 4) {
                        args[3] = convertLen(args[3],0).x;
                    }
                    obj[prop](...args);
                }
            } else if (prop == "arc") {
                return function(...args) {
                    //x, y, radius
                    if (args.length >= 2) {
                        var pt = convertPoint(args[0], args[1])
                        args[0] = pt.x;
                        args[1] = pt.y;
                    }
                    if (args.length >= 3) {
                        args[2] = convertLen(args[2],0).x;
                    }
                    obj[prop](...args);
                }
            } else if (prop == "arcTo") {
                return function(...args) {
                    //x1, y1, x2, y2, radius
                    if (args.length >= 2) {
                        var pt = convertPoint(args[0], args[1])
                        args[0] = pt.x;
                        args[1] = pt.y;
                    }
                    if (args.length >= 4) {
                        var pt = convertPoint(args[2], args[3])
                        args[2] = pt.x;
                        args[3] = pt.y;
                    }
                    if (args.length >= 5) {
                        args[4] = convertLen(args[4],0).x;
                    }
                    obj[prop](...args);
                }
            } else if (prop == "putImageData") {
                //imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight
                return function(...args) {
                    if (args.length >= 3) {
                        var pt = convertPoint(args[1], args[2])
                        args[1] = pt.x;
                        args[2] = pt.y;
                    }
                    if (args.length >= 5) {
                        var pt = convertPoint(args[3], args[4])
                        args[3] = pt.x;
                        args[4] = pt.y;
                    }
                    if (args.length >= 7) {
                        var pt = convertPoint(args[5], args[6])
                        args[5] = pt.x;
                        args[6] = pt.y;
                    }
                    obj[prop](...args);
                }
            } else {
                return function(...args) {
                    obj[prop](...args);
                }
            }
        },
        set(obj, prop, val) {
            var _lengthy = ["lineWidth"];
            if (_lengthy.indexOf(prop) >= 0) {
                val = convertLen(val,0).x;
            }
            obj[prop] = val;
        }
    }
    return new Proxy(base, handler);
}

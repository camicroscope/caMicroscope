var IIPMooViewer = new Class({
    Extends: Events,
    version: "2.0",
    initialize: function (a, b) {
        this.source = a || alert("No element ID given to IIPMooViewer constructor");
        this.server = b.server || "/fcgi-bin/iipsrv.fcgi";
        this.render = b.render || "spiral";
        this.viewport = null;
        b.viewport && (this.viewport = {
            resolution: "undefined" == typeof b.viewport.resolution ? null : parseInt(b.viewport.resolution),
            rotation: "undefined" == typeof b.viewport.rotation ? null : parseInt(b.viewport.rotation),
            contrast: "undefined" == typeof b.viewport.contrast ? null : parseFloat(b.viewport.contrast),
            x: "undefined" == typeof b.viewport.x ? null : parseFloat(b.viewport.x),
            y: "undefined" == typeof b.viewport.y ? null : parseFloat(b.viewport.y)
        });
        this.images = Array(b.image.length);
        b.image || alert("Image location not set in class constructor options");
        if ("array" == typeOf(b.image)) for (i = 0; i < b.image.length; i++) this.images[i] = {
            src: b.image[i],
            sds: "0,90",
            cnt: this.viewport && null != this.viewport.contrast ? this.viewport.contrast : 1
        };
        else this.images = [{
            src: b.image,
            sds: "0,90",
            cnt: this.viewport && null != this.viewport.contrast ? this.viewport.contrast : 1
        }];
        this.loadoptions = b.load || null;
        this.credit = b.credit || null;
        this.scale = b.scale || null;
        this.enableFullscreen = "page";
        !1 == b.enableFullscreen && (this.enableFullscreen = !1);
        "page" == b.enableFullscreen && (this.enableFullscreen = "page");
        this.fullscreen = null;
        !1 != this.enableFullscreen && (this.fullscreen = {
            isFullscreen: !1,
            targetsize: {},
            eventChangeName: null,
            enter: null,
            exit: null
        });
        this.disableContextMenu = !0;
        this.showNavWindow = !1 == b.showNavWindow ? !1 : !0;
        this.showNavButtons = !1 == b.showNavButtons ? !1 : !0;
        this.navWinSize = b.navWinSize || 0.2;
        this.winResize = !1 == b.winResize ? !1 : !0;
        this.prefix = b.prefix || "images/";
        switch (b.protocol) {
        case "zoomify":
            this.protocol = new Protocols.Zoomify;
            break;
        case "deepzoom":
            this.protocol = new Protocols.DeepZoom;
            break;
        case "djatoka":
            this.protocol = new Protocols.Djatoka;
            break;
        default:
            this.protocol = new Protocols.IIP
        }
        this.preload = !0 == b.preload ? !0 : !1;
        this.effects = !1;
        this.annotations = "function" == typeof this.initAnnotationTips && b.annotations ? b.annotations : null;
        this.click = b.click || null;
        this.max_size = {};
        this.navWin = {
            w: 0,
            h: 0
        };
        this.hei = this.wid = this.opacity = 0;
        this.resolutions;
        this.num_resolutions = 0;
        this.view = {
            x: 0,
            y: 0,
            w: this.wid,
            h: this.hei,
            res: 0,
            rotation: 0
        };
        this.navpos = {};
        this.tileSize = {};
        this.tiles = [];
        this.nTilesToLoad = this.nTilesLoaded = 0;
        this.CSSprefix = "";
        Browser.firefox ? this.CSSprefix = "-moz-" : Browser.chrome || Browser.safari || Browser.Platform.ios ? this.CSSprefix = "-webkit-" : Browser.opera ? this.CSSprefix = "-o-" : Browser.ie && (this.CSSprefix = "ms-");
        window.addEvent("domready",
        this.load.bind(this))
    },
    requestImages: function () {
        this.canvas.setStyle("cursor", "wait");
        this.annotations && this.destroyAnnotations();
        if (!Browser.buggy) {
            var a = (this.wid > this.view.w ? Math.round(this.view.x + this.view.w / 2) : Math.round(this.wid / 2)) + "px",
                b = (this.hei > this.view.h ? Math.round(this.view.y + this.view.h / 2) : Math.round(this.hei / 2)) + "px";
            this.canvas.setStyle(this.CSSprefix + "transform-origin", a + " " + b)
        }
        this.loadGrid();
        if(annotool.annotations){console.log("displaying Annotations");annotool.displayAnnot();}
        this.annotations && (this.createAnnotations(), this.annotationTip && this.annotationTip.attach(this.canvas.getChildren("div.annotation")))
    },
    loadGrid: function () {
        var a = this.preload ? 1 : 0,
            b = Math.floor(this.view.x / this.tileSize.w) - a,
            c = Math.floor(this.view.y / this.tileSize.h) - a;
        0 > b && (b = 0);
        0 > c && (c = 0);
        var d = this.view.w;
        this.wid < this.view.w && (d = this.wid);
        var e = Math.ceil((d + this.view.x) / this.tileSize.w - 1) + a,
            d = this.view.h;
        this.hei < this.view.h && (d = this.hei);
        var f = Math.ceil((d + this.view.y) / this.tileSize.h - 1) + a,
            a = Math.ceil(this.wid / this.tileSize.h),
            d = Math.ceil(this.hei / this.tileSize.h);
        e >= a && (e = a - 1);
        f >= d && (f = d - 1);
        var g, h;
        h = d = 0;
        var m = b + Math.round((e - b) / 2),
            n = c + Math.round((f - c) / 2),
            j = Array((e - b) * (e - b)),
            l = Array((e - b) * (e - b));
        l.empty();
        var k = 0;
        for (g = c; g <= f; g++) for (c = b; c <= e; c++) j[k] = {}, j[k].n = "spiral" == this.render ? Math.abs(n - g) * Math.abs(n - g) + Math.abs(m - c) * Math.abs(m - c) : Math.random(), j[k].x = c, j[k].y = g, k++, d = c + g * a, l.push(d);
        this.nTilesLoaded = 0;
        this.nTilesToLoad = k * this.images.length;
        this.canvas.get("morph").cancel();
        var o = this;
        this.canvas.getChildren("img").each(function (a) {
            var b = parseInt(a.retrieve("tile"));
            if (!l.contains(b)) {
                a.destroy();
                o.tiles.erase(b)
            }
        });
        j.sort(function (a, b) {
            return a.n - b.n
        });
        for (e = 0; e < k; e++) if (c = j[e].x, g = j[e].y, d = c + g * a, this.tiles.contains(d)) this.nTilesLoaded += this.images.length, this.showNavWindow && this.refreshLoadBar(), this.nTilesLoaded >= this.nTilesToLoad && this.canvas.setStyle("cursor", "move");
        else for (h = 0; h < this.images.length; h++) b = new Element("img", {
            "class": "layer" + h,
            styles: {
                left: c * this.tileSize.w,
                top: g * this.tileSize.h
            }
        }), this.effects && b.setStyle("opacity", 0.1), b.inject(this.canvas), f = this.protocol.getTileURL(this.server, this.images[h].src,
        this.view.res, this.images[h].sds, this.images[h].cnt, d, c, g), b.addEvents({
            load: function (a, b) {
                this.effects && a.setStyle("opacity", 1);
                if (!a.width || !a.height) a.fireEvent("error");
                else {
                    this.nTilesLoaded++;
                    this.showNavWindow && this.refreshLoadBar();
                    this.nTilesLoaded >= this.nTilesToLoad && this.canvas.setStyle("cursor", "move");
                    this.tiles.push(b)
                }
            }.bind(this, b, d),
            error: function () {
                this.removeEvents("error");
                this.set("src", this.src + "?" + Date.now())
            }
        }), b.set("src", f), b.store("tile", d);
        1 < this.images.length && this.canvas.getChildren("img.layer" + (h - 1)).setStyle("opacity", this.opacity)
    },
    getRegionURL: function () {
        var a = this.resolutions[this.view.res].w,
            b = this.resolutions[this.view.res].h;
        return this.protocol.getRegionURL(this.server, this.images[0].src, {
            x: this.view.x / a,
            y: this.view.y / b,
            w: this.view.w / a,
            h: this.view.h / b
        }, a)
    },
    key: function (a) {
        var b = new DOMEvent(a),
            c = Math.round(this.view.w / 4);
        switch (a.code) {
        case 37:
            this.nudge(-c, 0);
            IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                a.nudge(-c, 0)
            });
            b.preventDefault();
            break;
        case 38:
            this.nudge(0, - c);
            IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                a.nudge(0, - c)
            });
            b.preventDefault();
            break;
        case 39:
            this.nudge(c, 0);
            IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                a.nudge(c, 0)
            });
            b.preventDefault();
            break;
        case 40:
            this.nudge(0, c);
            IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                a.nudge(0, c)
            });
            b.preventDefault();
            break;
        case 107:
            a.control || (this.zoomIn(), IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                a.zoomIn()
            }), b.preventDefault());
            break;
        case 109:
            a.control || (this.zoomOut(), IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                a.zoomOut()
            }));
            break;
        case 189:
            a.control || this.zoomOut();
            break;
        case 72:
            this.toggleNavigationWindow();
            break;
        case 82:
            if (!a.control) {
                var d = this.view.rotation,
                    d = a.shift ? d - 45 : d + 45;
                this.rotate(d);
                IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                    a.rotate(d)
                })
            }
            break;
        case 65:
            this.annotations && this.toggleAnnotations();
            break;
        case 27:
            this.fullscreen && this.fullscreen.isFullscreen && (IIPMooViewer.sync || this.toggleFullScreen());
            this.container.getElement("div.info").fade("out");
            break;
        case 70:
            IIPMooViewer.sync || this.toggleFullScreen()
        }
    },
    rotate: function (a) {
        Browser.buggy || (this.view.rotation = a, this.canvas.setStyle(this.CSSprefix + "transform", "rotate(" + a + "deg)"))
    },
    toggleFullScreen: function () {
        var a, b, c, d;
        if (!1 != this.enableFullscreen && (this.fullscreen.isFullscreen ? (a = this.fullscreen.targetsize.pos.x, b = this.fullscreen.targetsize.pos.y, c = this.fullscreen.targetsize.size.x, d = this.fullscreen.targetsize.size.y, p = this.fullscreen.targetsize.position,
        this.fullscreen.exit && this.fullscreen.isFullscreen && this.fullscreen.exit.call(document)) : (this.fullscreen.targetsize = {
            pos: {
                x: this.container.style.left,
                y: this.container.style.top
            },
            size: {
                x: this.container.style.width,
                y: this.container.style.height
            },
            position: this.container.style.position
        }, b = a = 0, d = c = "100%", p = "absolute", this.fullscreen.enter && !this.fullscreen.isFullscreen && this.fullscreen.enter.call(this.container)), !this.fullscreen.enter)) this.container.setStyles({
            left: a,
            top: b,
            width: c,
            height: d,
            position: p
        }),
        this.fullscreen.isFullscreen = !this.fullscreen.isFullscreen, this.fullscreen.isFullscreen ? this.showPopUp(IIPMooViewer.lang.exitFullscreen) : this.container.getElements("div.message").destroy(), this.reload()
    },
    toggleNavigationWindow: function () {
        this.container.getElement("div.navcontainer") && this.container.getElement("div.navcontainer").get("reveal").toggle()
    },
    showPopUp: function (a) {
        var b = (new Element("div", {
            "class": "message",
            html: a
        })).inject(this.container);
        (Browser.buggy ? function () {
            b.destroy()
        } : function () {
            b.fade("out").get("tween").chain(function () {
                b.destroy()
            })
        }).delay(3E3)
    },
    scrollNavigation: function (a) {
        this.zone.get("morph").cancel();
        this.canvas.get("morph").cancel();
        var b = 0,
            c = 0,
            d = this.zone.getSize(),
            e = d.x,
            d = d.y;
        if (a.event) {
            a.stop();
            var f = this.zone.getParent().getPosition(),
                b = a.page.x - f.x - Math.floor(e / 2),
                c = a.page.y - f.y - Math.floor(d / 2)
        } else if (b = a.offsetLeft, c = a.offsetTop - 10, 3 > Math.abs(b - this.navpos.x) && 3 > Math.abs(c - this.navpos.y)) return;
        b > this.navWin.w - e && (b = this.navWin.w - e);
        c > this.navWin.h - d && (c = this.navWin.h - d);
        0 > b && (b = 0);
        0 > c && (c = 0);
        b = Math.round(b * this.wid / this.navWin.w);
        c = Math.round(c * this.hei / this.navWin.h);
        (e = Math.abs(b - this.view.x) < this.view.w / 2 && Math.abs(c - this.view.y) < this.view.h / 2 && 0 == this.view.rotation) ? this.canvas.morph({
            left: this.wid > this.view.w ? -b : Math.round((this.view.w - this.wid) / 2),
            top: this.hei > this.view.h ? -c : Math.round((this.view.h - this.hei) / 2)
        }) : this.canvas.setStyles({
            left: this.wid > this.view.w ? -b : Math.round((this.view.w - this.wid) / 2),
            top: this.hei > this.view.h ? -c : Math.round((this.view.h - this.hei) / 2)
        });
        this.view.x = b;
        this.view.y = c;
        e || this.requestImages();
        a.event && this.positionZone();
        IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
            a.moveTo(b, c)
        })
    },
    scroll: function () {
        var a, b;
        a = this.canvas.getStyle("left").toInt();
        b = this.canvas.getStyle("top").toInt();
        var c = -a,
            d = -b;
        this.moveTo(c, d);
        IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
            a.moveTo(c, d)
        })
    },
    checkBounds: function (a, b) {
        a > this.wid - this.view.w && (a = this.wid - this.view.w);
        b > this.hei - this.view.h && (b = this.hei - this.view.h);
        if (0 > a || this.wid < this.view.w) a = 0;
        if (0 > b || this.hei < this.view.h) b = 0;
        this.view.x = a;
        this.view.y = b
    },
    moveTo: function (a, b) {
        a == this.view.x && b == this.view.y || (this.checkBounds(a, b), this.canvas.setStyles({
            left: this.wid > this.view.w ? -this.view.x : Math.round((this.view.w - this.wid) / 2),
            top: this.hei > this.view.h ? -this.view.y : Math.round((this.view.h - this.hei) / 2)
        }), this.requestImages(), this.positionZone())
    },
    nudge: function (a, b) {
        this.checkBounds(this.view.x + a, this.view.y + b);
        this.canvas.morph({
            left: this.wid > this.view.w ? -this.view.x : Math.round((this.view.w - this.wid) / 2),
            top: this.hei > this.view.h ? -this.view.y : Math.round((this.view.h - this.hei) / 2)
        });
        this.positionZone()
    },
    zoom: function (a) {
        a = new DOMEvent(a);
        a.stop();
        var b = 1,
            b = a.wheel && 0 > a.wheel ? -1 : a.shift ? -1 : 1;
        if (!(1 == b && this.view.res >= this.num_resolutions - 1 || -1 == b && 0 >= this.view.res)) {
            if (a.target) {
                var c;
                c = a.target.get("class");
                if ("zone" != c & "navimage" != c) c = this.canvas.getPosition(), this.view.x = a.page.x - c.x - Math.floor(this.view.w / 2), this.view.y = a.page.y - c.y - Math.floor(this.view.h / 2);
                else {
                    c = this.zone.getParent().getPosition();
                    var d = this.zone.getParent().getSize(),
                        e = this.zone.getSize();
                    this.view.x = Math.round((a.page.x - c.x - e.x / 2) * this.wid / d.x);
                    this.view.y = Math.round((a.page.y - c.y - e.y / 2) * this.hei / d.y)
                }
                if (IIPMooViewer.sync) {
                    var f = this.view.x,
                        g = this.view.y;
                    IIPMooViewer.windows(this).each(function (a) {
                        a.view.x = f;
                        a.view.y = g
                    })
                }
            } - 1 == b ? this.zoomOut() : this.zoomIn();
            IIPMooViewer.sync && IIPMooViewer.windows(this).each(function (a) {
                -1 == b ? a.zoomOut() : a.zoomIn()
            })
        }
    },
    zoomIn: function () {
        this.view.res < this.num_resolutions - 1 && this.zoomTo(this.view.res + 1)
    },
    zoomOut: function () {
        0 < this.view.res && this.zoomTo(this.view.res - 1)
    },
    zoomTo: function (a) {
        if (a != this.view.res && a <= this.num_resolutions - 1 && 0 <= a) {
            var b = Math.pow(2, a - this.view.res),
                c, d;
            a > this.view.res ? (c = this.resolutions[this.view.res].w > this.view.w ? this.view.w * (b - 1) / 2 : this.resolutions[a].w / 2 - this.view.w / 2, d = this.resolutions[this.view.res].h > this.view.h ? this.view.h * (b - 1) / 2 : this.resolutions[a].h / 2 - this.view.h / 2) : (c = -this.view.w * (1 - b) / 2, d = -this.view.h * (1 - b) / 2);
            this.view.x = Math.round(b * this.view.x + c);
            this.view.y = Math.round(b * this.view.y + d);
            this.view.res = a;
            this._zoom()
        }
    },
    _zoom: function () {
        this.wid = this.resolutions[this.view.res].w;
        this.hei = this.resolutions[this.view.res].h;
        this.view.x + this.view.w > this.wid && (this.view.x = this.wid - this.view.w);
        0 > this.view.x && (this.view.x = 0);
        this.view.y + this.view.h > this.hei && (this.view.y = this.hei - this.view.h);
        0 > this.view.y && (this.view.y = 0);
        this.canvas.setStyles({
            left: this.wid > this.view.w ? -this.view.x : Math.round((this.view.w - this.wid) / 2),
            top: this.hei > this.view.h ? -this.view.y : Math.round((this.view.h - this.hei) / 2),
            width: this.wid,
            height: this.hei
        });
        this.constrain();
        this.canvas.getChildren("img").destroy();
        this.tiles.empty();
        this.requestImages();
        this.positionZone();
        this.scale && this.updateScale()
    },
    calculateNavSize: function () {
        var a = this.view.w * this.navWinSize;
        this.max_size.w > 2 * this.max_size.h && (a = this.view.w / 4);
        this.max_size.h / this.max_size.w * a > 0.5 * this.view.h && (a = Math.round(0.5 * this.view.h * this.max_size.w / this.max_size.h));
        this.navWin.w = a;
        this.navWin.h = Math.round(this.max_size.h / this.max_size.w * a)
    },
    calculateSizes: function () {
        var a = this.container.getSize();
        this.view.x = -1;
        this.view.y = -1;
        this.view.w = a.x;
        this.view.h = a.y;
        this.calculateNavSize();
        this.view.res = this.num_resolutions;
        var a = this.max_size.w,
            b = this.max_size.h;
        this.resolutions = Array(this.num_resolutions);
        this.resolutions.push({
            w: a,
            h: b
        });
        this.view.res = 0;
        for (var c = 1; c < this.num_resolutions; c++) a = Math.floor(a / 2), b = Math.floor(b / 2), this.resolutions.push({
            w: a,
            h: b
        }), a < this.view.w && b < this.view.h && this.view.res++;
        this.view.res -= 1;
        0 > this.view.res && (this.view.res = 0);
        this.view.res >= this.num_resolutions && (this.view.res = this.num_resolutions - 1);
        this.resolutions.reverse();
        this.wid = this.resolutions[this.view.res].w;
        this.hei = this.resolutions[this.view.res].h
    },
    setCredit: function (a) {
        this.container.getElement("div.credit").set("html", a)
    },
    createWindows: function () {
        this.container = document.id(this.source);
        this.container.addClass("iipmooviewer");
        var a = this;
        "native" == this.enableFullscreen && ((document.documentElement.requestFullscreen ? (this.fullscreen.eventChangeName = "fullscreenchange", this.enter = this.container.requestFullscreen, this.exit = document.documentElement.cancelFullScreen) : document.mozCancelFullScreen ? (this.fullscreen.eventChangeName = "mozfullscreenchange", this.fullscreen.enter = this.container.mozRequestFullScreen, this.fullscreen.exit = document.documentElement.mozCancelFullScreen) : document.webkitCancelFullScreen && (this.fullscreen.eventChangeName = "webkitfullscreenchange", this.fullscreen.enter = this.container.webkitRequestFullScreen, this.fullscreen.exit = document.documentElement.webkitCancelFullScreen),
        this.fullscreen.enter) ? document.addEvent(this.fullscreen.eventChangeName, function () {
            a.fullscreen.isFullscreen = !a.fullscreen.isFullscreen;
            a.reload()
        }) : "100%" == this.container.getStyle("width") && "100%" == this.container.getStyle("height") && (this.enableFullscreen = !1));
        (new Element("div", {
            "class": "info",
            styles: {
                opacity: 0
            },
            events: {
                click: function () {
                    this.fade("out")
                }
            },
            html: '<div><div><h2><a href="http://iipimage.sourceforge.net"><img src="' + this.prefix + 'iip.32x32.png"/></a>IIPMooViewer</h2>IIPImage HTML5 Ajax High Resolution Image Viewer - Version ' + this.version + "<br/><ul><li>" + IIPMooViewer.lang.navigate + "</li><li>" + IIPMooViewer.lang.zoomIn + "</li><li>" + IIPMooViewer.lang.zoomOut + "</li><li>" + IIPMooViewer.lang.rotate + "</li><li>" + IIPMooViewer.lang.fullscreen + "<li>" + IIPMooViewer.lang.annotations + "</li><li>" + IIPMooViewer.lang.navigation + "</li></ul><br/>" + IIPMooViewer.lang.more + ' <a href="http://iipimage.sourceforge.net">http://iipimage.sourceforge.net</a></div></div>'
        })).inject(this.container);
        this.canvas = new Element("div", {
            "id":"canvas",
            "class": "canvas",
            morph: {
                transition: Fx.Transitions.Quad.easeInOut,
                onComplete: function () {
                    a.requestImages()
                }
            }
        });
        this.touch = new Drag(this.canvas, {
            onComplete: this.scroll.bind(this)
        });
        this.canvas.inject(this.container);
        this.canvas.addEvents({
            "mousewheel:throttle(75)": this.zoom.bind(this),
            dblclick: this.zoom.bind(this),
            mousedown: function (a) {
                (new DOMEvent(a)).stop()
            }
        });
        this.annotations && this.initAnnotationTips();
        this.disableContextMenu && this.container.addEvent("contextmenu", function (b) {
            (new DOMEvent(b)).stop();
            a.container.getElement("div.info").fade(0.95);
            return !1
        });
        if (this.click) {
            var b = this.click.bind(this);
            this.canvas.addEvent("mouseup", b);
            this.touch.addEvents({
                start: function () {
                    a.canvas.removeEvents("mouseup")
                },
                complete: function () {
                    a.canvas.addEvent("mouseup", b)
                }
            })
        }
        this.container.set("tabindex", 0);
        //this.container.focus();
        this.container.addEvents({
            keydown: this.key.bind(this),
            //mouseenter: function () {
            //    a.container.focus()
            //:},
            mouseout: function () {
                a.container.blur()
            },
            mousewheel: function (a) {
                a.preventDefault()
            }
        });
        if (Browser.Platform.ios || Browser.Platform.android) this.container.addEvent("touchmove",

        function (a) {
            a.preventDefault()
        }), document.body.addEvents({
            touchmove: function (a) {
                a.preventDefault()
            },
            orientationchange: function () {
                a.container.setStyles({
                    width: "100%",
                    height: "100%"
                });
                this.reflow.delay(500, this)
            }.bind(this)
        }), this.canvas.addEvents({
            touchstart: function (b) {
                b.preventDefault();
                if (1 == b.touches.length) {
                    var c = a.canvas.retrieve("taptime") || 0,
                        f = Date.now();
                    a.canvas.store("taptime", f);
                    a.canvas.store("tapstart", 1);
                    500 > f - c ? (a.canvas.eliminate("taptime"), a.zoomIn()) : (c = a.canvas.getPosition(a.container),
                    a.touchstart = {
                        x: b.touches[0].pageX - c.x,
                        y: b.touches[0].pageY - c.y
                    })
                }
            },
            touchmove: function (b) {
                1 == b.touches.length && (a.view.x = a.touchstart.x - b.touches[0].pageX, a.view.y = a.touchstart.y - b.touches[0].pageY, a.view.x > a.wid - a.view.w && (a.view.x = a.wid - a.view.w), a.view.y > a.hei - a.view.h && (a.view.y = a.hei - a.view.h), 0 > a.view.x && (a.view.x = 0), 0 > a.view.y && (a.view.y = 0), a.canvas.setStyles({
                    left: a.wid > a.view.w ? -a.view.x : Math.round((a.view.w - a.wid) / 2),
                    top: a.hei > a.view.h ? -a.view.y : Math.round((a.view.h - a.hei) / 2)
                }));
                if (2 == b.touches.length) {
                    var c = Math.round((b.touches[0].pageX + b.touches[1].pageX) / 2) + a.view.x,
                        b = Math.round((b.touches[0].pageY + b.touches[1].pageY) / 2) + a.view.y;
                    this.canvas.setStyle(this.CSSprefix + "transform-origin", c + "px," + b + "px")
                }
            },
            touchend: function () {
                1 == a.canvas.retrieve("tapstart") && (a.canvas.eliminate("tapstart"), a.requestImages(), a.positionZone())
            },
            gesturestart: function (b) {
                b.preventDefault();
                a.canvas.store("tapstart", 1)
            },
            gesturechange: function (a) {
                a.preventDefault()
            },
            gestureend: function (b) {
                if (1 == a.canvas.retrieve("tapstart")) if (a.canvas.eliminate("tapstart"),
                0.1 < Math.abs(1 - b.scale)) 1 < b.scale ? a.zoomIn() : a.zoomOut();
                else if (10 < Math.abs(b.rotation)) {
                    var c = a.view.rotation,
                        c = 0 < b.rotation ? c + 45 : c - 45;
                    a.rotate(c)
                }
            }
        });
        var c = (new Element("img", {
            src: this.prefix + "iip.32x32.png",
            "class": "logo",
            title: IIPMooViewer.lang.help,
            events: {
                click: function () {
                    a.container.getElement("div.info").fade(0.95)
                },
                mousedown: function (a) {
                    (new DOMEvent(a)).stop()
                }
            }
        })).inject(this.container);
        Browser.Platform.ios && window.navigator.standalone && c.setStyle("top", 15);
        this.credit && (new Element("div", {
            "class": "credit",
            html: this.credit,
            events: {
                mouseover: function () {
                    this.fade([0.6, 0.9])
                },
                mouseout: function () {
                    this.fade(0.6)
                }
            }
        })).inject(this.container);
        this.scale && (c = (new Element("div", {
            "class": "scale",
            title: IIPMooViewer.lang.scale,
            html: '<div class="ruler"></div><div class="label"></div>'
        })).inject(this.container), c.makeDraggable({
            container: this.container
        }), c.getElement("div.ruler").set("tween", {
            transition: Fx.Transitions.Quad.easeInOut
        }));
        this.calculateSizes();
        this.createNavigationWindow();
        this.annotations && this.createAnnotations();
        if (!Browser.Platform.ios && !Browser.Platform.android) {
            c = "img.logo, div.toolbar, div.scale";
            if (Browser.ie8 || Browser.ie7) c = "img.logo, div.toolbar";
            new Tips(c, {
                className: "tip",
                onShow: function (a) {
                    a.setStyles({
                        opacity: 0,
                        display: "block"
                    }).fade(0.9)
                },
                onHide: function (a) {
                    a.fade("out").get("tween").chain(function () {
                        a.setStyle("display", "none")
                    })
                }
            })
        }
        this.viewport && typeof ("undefined" != this.viewport.resolution) && "undefined" == typeof this.resolutions[this.viewport.resolution] && (this.viewport.resolution = null);
        this.viewport && null != this.viewport.resolution && (this.view.res = this.viewport.resolution, this.wid = this.resolutions[this.view.res].w, this.hei = this.resolutions[this.view.res].h, this.touch.options.limit = {
            x: [this.view.w - this.wid, 0],
            y: [this.view.h - this.hei, 0]
        });
        this.viewport && null != this.viewport.x && null != this.viewport.y ? this.moveTo(this.viewport.x * this.wid, this.viewport.y * this.hei) : this.recenter();
        this.canvas.setStyles({
            width: this.wid,
            height: this.hei
        });
        this.requestImages();
        this.positionZone();
        this.scale && this.updateScale();
        this.viewport && null != this.viewport.rotation && this.rotate(this.viewport.rotation);
        this.winResize && window.addEvent("resize", this.reflow.bind(this));
        this.fireEvent("load")
    },
    createNavigationWindow: function () {
        if (this.showNavWindow || this.showNavButtons) {
            var a = new Element("div", {
                "class": "navcontainer",
                styles: {
                    position: "absolute",
		    //left: 890,
                    width: this.navWin.w,
		    //top:50,
                }
            });
            Browser.Platform.ios && window.navigator.standalone && a.setStyle("top", 20);
            var b = new Element("div", {
                "class": "toolbar",
                events: {
                    dblclick: function (a) {
                        a.getElement("div.navbuttons").get("slide").toggle()
                    }.pass(this.container)
                }
            });
            b.store("tip:text", IIPMooViewer.lang.drag);
            b.inject(a);
            if (this.showNavWindow) {
                var c = new Element("div", {
                    "class": "navwin",
                    styles: {
			postion: "absolute",
                        height: this.navWin.h
                    }
                });
                c.inject(a);
                (new Element("img", {
                    "class": "navimage",
                    src: this.protocol.getThumbnailURL(this.server, this.images[0].src, this.navWin.w),
                    events: {
                        click: this.scrollNavigation.bind(this),
                        "mousewheel:throttle(75)": this.zoom.bind(this),
                        mousedown: function (a) {
                            (new DOMEvent(a)).stop()
                        }
                    }
                })).inject(c);
                this.zone = new Element("div", {
                    "class": "zone",
                    morph: {
                        duration: 500,
                        transition: Fx.Transitions.Quad.easeInOut
                    },
                    events: {
                        "mousewheel:throttle(75)": this.zoom.bind(this),
                        dblclick: this.zoom.bind(this)
                    }
                });
                this.zone.inject(c)
            }
            if (this.showNavButtons) {
                var d = new Element("div", {
                    "class": "navbuttons"
                }),
                    e = this.prefix;
                ["reset", "zoomIn", "zoomOut"].each(function (a) {
                    (new Element("img", {
                        src: e + a + (Browser.buggy ? ".png" : ".svg"),
                        "class": a,
                        events: {
                            error: function () {
                                this.removeEvents("error");
                                this.src = this.src.replace(".svg", ".png")
                            }
                        }
                    })).inject(d)
                });
                d.inject(a);
                d.set("slide", {
                    duration: 300,
                    transition: Fx.Transitions.Quad.easeInOut,
                    mode: "vertical"
                });
                d.getElement("img.zoomIn").addEvent("click", function () {
                    IIPMooViewer.windows(this).each(function (a) {
                        a.zoomIn()
                    });
                    this.zoomIn()
                }.bind(this));
                d.getElement("img.zoomOut").addEvent("click", function () {
                    IIPMooViewer.windows(this).each(function (a) {
                        a.zoomOut()
                    });
                    this.zoomOut()
                }.bind(this));
                d.getElement("img.reset").addEvent("click", function () {
                    IIPMooViewer.windows(this).each(function (a) {
                        a.reload()
                    });
                    this.reload()
                }.bind(this))
            }
            this.showNavWindow && (new Element("div", {
                "class": "loadBarContainer",
                html: '<div class="loadBar"></div>',
                styles: {
		    postion: "absolute",
		    //top:50,
		    //left:890,
                    width: this.navWin.w - 2
                },
                tween: {
                    duration: 1E3,
                    transition: Fx.Transitions.Sine.easeOut,
                    link: "cancel"
                }
            })).inject(a);
            a.inject(this.container);
            this.showNavWindow && this.zone.makeDraggable({
                container: this.container.getElement("div.navcontainer div.navwin"),
                onStart: function () {
                    var a = this.zone.getPosition();
                    this.navpos = {
                        x: a.x,
                        y: a.y - 10
                    };
                    this.zone.get("morph").cancel()
                }.bind(this),
                onComplete: this.scrollNavigation.bind(this)
            });
            a.makeDraggable({
                container: this.container,
                handle: b
            })
        }
    },
    refreshLoadBar: function () {
        var a = this.nTilesLoaded / this.nTilesToLoad * this.navWin.w,
            b = this.container.getElement("div.navcontainer div.loadBarContainer"),
            c = b.getElement("div.loadBar");
        c.setStyle("width", a);
        c.set("html", IIPMooViewer.lang.loading + "&nbsp;:&nbsp;" + Math.round(100 * (this.nTilesLoaded / this.nTilesToLoad)) + "%");
        "0.85" != b.style.opacity && b.setStyles({
	    visibility: "visible",
            opacity: 0.85
        });
        this.nTilesLoaded >= this.nTilesToLoad && b.fade("out")
    },
    updateScale: function () {
        var a = [1.0E-12, 1.0E-9, 1.0E-6, 0.0010,
        0.01, 1, 1E3],
            b = [1, 2, 5, 10, 50],
            c = 1E3 * this.scale * this.wid / this.max_size.w,
            d, e;
        d = 0;
        a: for (; d < a.length; d++) for (e = 0; e < b.length; e++) if (a[d] * b[e] * c > this.view.w / 20) break a;
        d >= a.length && (d = a.length - 1);
        e >= b.length && (e = b.length - 1);
        var f = b[e] + "p,n,&#181;,m,c,,k".split(",")[d] + "m",
            c = c * a[d] * b[e];
        this.container.getElement("div.scale div.ruler").tween("width", c);
        this.container.getElement("div.scale div.label").set("html", f)
    },
    changeImage: function (a) {
        this.images = [{
            src: a,
            sds: "0,90",
            cnt: this.viewport && null != this.viewport.contrast ? this.viewport.contrast : 1
        }];
        (new Request({
            method: "get",
            url: this.protocol.getMetaDataURL(this.server, this.images[0].src),
            onComplete: function (b) {
                b = this.protocol.parseMetaData(b || alert("Error: No response from server " + this.server));
                this.max_size = b.max_size;
                this.tileSize = b.tileSize;
                this.num_resolutions = b.num_resolutions;
                this.reload();
                this.container.getElement("div.navcontainer img.navimage").src = this.protocol.getThumbnailURL(this.server, a, this.navWin.w)
            }.bind(this),
            onFailure: function () {
                alert("Error: Unable to get image metadata from server!")
            }
        })).send()
    },
    load: function () {
        this.loadoptions ? (this.max_size = this.loadoptions.size, this.tileSize = this.loadoptions.tiles, this.num_resolutions = this.loadoptions.resolutions, this.createWindows()) : (new Request({
            method: "get",
            url: this.protocol.getMetaDataURL(this.server, this.images[0].src),
            onComplete: function (a) {
                a = this.protocol.parseMetaData(a || alert("Error: No response from server " + this.server));
                this.max_size = a.max_size;
                this.tileSize = a.tileSize;
                this.num_resolutions = a.num_resolutions;
                this.createWindows();
            }.bind(this),
            onFailure: function () {
                alert("Error: Unable to get image metadata from server!")
            }
        })).send()
    },
    reflow: function () {
        var a = this.container.getSize();
        this.view.w = a.x;
        this.view.h = a.y;
        this.canvas.setStyles({
            left: this.wid > this.view.w ? -this.view.x : Math.round((this.view.w - this.wid) / 2),
            top: this.hei > this.view.h ? -this.view.y : Math.round((this.view.h - this.hei) / 2)
        });
        this.calculateNavSize();
        this.container.getElements("div.navcontainer, div.navcontainer div.loadBarContainer").setStyle("width", this.navWin.w);
        this.container.getElements("div.navcontainer, div.navcontainer div.loadBarContainer").setStyle("position", "relative");
        this.container.getElements("div.navcontainer, div.navcontainer div.loadBarContainer").setStyle("top", 50);
        this.container.getElements("div.navcontainer, div.navcontainer div.loadBarContainer").setStyle("left", 890);
        this.showNavWindow && ((a = this.container.getElement("div.navcontainer")) && a.setStyles({
            top: Browser.Platform.ios && window.navigator.standalone ? 20 : 10,
            left: this.container.getPosition(this.container).x + this.container.getSize().x - this.navWin.w - 10
        }), this.zone && this.zone.getParent().setStyle("height", this.navWin.h));
        this.scale && (this.updateScale(), pos = this.container.getSize().y - this.container.getElement("div.scale").getSize().y - 10, this.container.getElement("div.scale").setStyles({
            left: 10,
            top: pos
        }));
        this.requestImages();
        this.positionZone();
        this.constrain()
    },
    reload: function () {
        this.canvas.get("morph").cancel();
        this.canvas.getChildren("img").destroy();
        this.tiles.empty();
        this.calculateSizes();
        this.viewport && null != this.viewport.resolution && (this.view.res = this.viewport.resolution, this.wid = this.resolutions[this.view.res].w, this.hei = this.resolutions[this.view.res].h, this.touch.options.limit = {
            x: [this.view.w - this.wid, 0],
            y: [this.view.h - this.hei, 0]
        });
        this.viewport && null != this.viewport.x && null != this.viewport.y ? this.moveTo(this.viewport.x * this.wid,
        this.viewport.y * this.hei) : this.recenter();
        this.canvas.setStyles({
            width: this.wid,
            height: this.hei
        });
        this.reflow();
        this.viewport && null != this.viewport.rotation ? this.rotate(this.viewport.rotation) : this.rotate(0)
    },
    recenter: function () {
        var a = Math.round((this.wid - this.view.w) / 2);
        this.view.x = 0 > a ? 0 : a;
        a = Math.round((this.hei - this.view.h) / 2);
        this.view.y = 0 > a ? 0 : a;
        this.canvas.setStyles({
            left: this.wid > this.view.w ? -this.view.x : Math.round((this.view.w - this.wid) / 2),
	top: this.hei > this.view.h ? -this.view.y : Math.round((this.view.h - this.hei) / 2)
        });
        this.constrain()
    },
    constrain: function () {
        var a = this.wid < this.view.w ? [Math.round((this.view.w - this.wid) / 2), Math.round((this.view.w - this.wid) / 2)] : [this.view.w - this.wid, 0],
            b = this.hei < this.view.h ? [Math.round((this.view.h - this.hei) / 2), Math.round((this.view.h - this.hei) / 2)] : [this.view.h - this.hei, 0];
        this.touch.options.limit = {
            x: a,
            y: b
        }
    },
    positionZone: function () {
        if (this.showNavWindow) {
            var a = this.view.x / this.wid * this.navWin.w;
            a > this.navWin.w && (a = this.navWin.w);
            0 > a && (a = 0);
            var b = this.view.y / this.hei * this.navWin.h;
            b > this.navWin.h && (b = this.navWin.h);
            0 > b && (b = 0);
            var c = this.view.w / this.wid * this.navWin.w;
            a + c > this.navWin.w && (c = this.navWin.w - a);
            var d = this.view.h / this.hei * this.navWin.h;
            d + b > this.navWin.h && (d = this.navWin.h - b);
            var e = this.zone.offsetHeight - this.zone.clientHeight;
            this.zone.morph({
                left: a,
                top: b + 8,
                width: 0 < c - e ? c - e : 1,
                height: 0 < d - e ? d - e : 1
            })
        }
    }
});
IIPMooViewer.synchronize = function (a) {
    this.sync = a
};
IIPMooViewer.windows = function (a) {
    return !this.sync ? [] : this.sync.filter(function (b) {
        return b != a
    })
};
Browser.buggy = Browser.ie && 9 > Browser.version ? !0 : !1;
var Protocols = {};
Protocols.IIP = new Class({
    getMetaDataURL: function (a, b) {
        return a + "?FIF=" + b + "&obj=IIP,1.0&obj=Max-size&obj=Tile-size&obj=Resolution-number"
    },
    getTileURL: function (a, b, c, d, e, f) {
        return a + "?FIF=" + b + "&CNT=" + e + "&SDS=" + d + "&JTL=" + c + "," + f
    },
    parseMetaData: function (a) {
        var b = a.split("Max-size");
        b[1] || alert("Error: Unexpected response from server " + this.server);
        var c = b[1].split(" "),
            d = {
                w: parseInt(c[0].substring(1, c[0].length)),
                h: parseInt(c[1])
            }, b = a.split("Tile-size"),
            c = b[1].split(" "),
            c = {
                w: parseInt(c[0].substring(1,
                c[0].length)),
                h: parseInt(c[1])
            }, b = a.split("Resolution-number"),
            a = parseInt(b[1].substring(1, b[1].length));
        return {
            max_size: d,
            tileSize: c,
            num_resolutions: a
        }
    },
    getRegionURL: function (a, b, c, d) {
        return a + "?FIF=" + b + "&WID=" + d + "&RGN=" + (c.x + "," + c.y + "," + c.w + "," + c.h) + "&CVT=jpeg"
    },
    getThumbnailURL: function (a, b, c) {
        return a + "?FIF=" + b + "&WID=" + c + "&QLT=98&CVT=jpeg"
    }
});
IIPMooViewer.lang = {
    help: "click for help",
    scale: "draggable scale",
    navigate: "To navigate within image: drag image within main window or drag zone within the navigation window or click an are a within navigation window",
    zoomIn: 'To zoom in: double click or use the mouse scroll wheel or simply press the "+" key',
    zoomOut: 'To zoom out: shift double click or use the mouse wheel or press the "-" key',
    rotate: 'To rotate image clockwise: press the "r" key, anti-clockwise: press shift and "r"',
    fullscreen: 'For fullscreen: press the "f" key',
    annotations: 'To toggle any annotations: press the "a" key',
    pencil: 'To toggle the pencil tool: press the "p" key',
    poly: 'To toggle the polygon tool: press the "p" key',
    edit:'To toggle Editing:press "e" key',
    magnify:'To toggle Magnify glass:press "m" key',
    
    navigation: 'To show/hide navigation window: press "h" key',
    more: "For more information visit",
    exitFullscreen: 'Press "Esc" to exit fullscreen mode',
    loading: "loading",
    drag: "* Drag to move<br/>* Double Click to show/hide buttons<br/>* Press h to hide",
    annotationsDisabled: 'Annotations disabled<br/>Press "a" to re-enable'
};

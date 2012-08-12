IIPMooViewer.implement({
    initAnnotationTips: function () {
        this.annotationTip = null;
        this.annotationsVisible = !0;
        var a = this;
        this.annotations && (this.canvas.addEvent("mouseenter", function () {
            a.annotationsVisible && a.canvas.getElements("div.annotation").removeClass("hidden");
        }), this.canvas.addEvent("mouseleave", function () {
            a.annotationsVisible && a.canvas.getElements("div.annotation").addClass("hidden")
        }))
    },
    createAnnotations: function () {
        if (this.annotations) {
            var a = [], b;
            for (b in this.annotations) this.annotations[b].id = b, a.push(this.annotations[b]);
            if (0 != a.length) {
                a.sort(function (a, b) {
                    return b.w * b.h - a.w * a.h
                });
               //This part is for displaying SVG annotations
                if(this.annotationsVisible)
               {
		var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
                for (b = 0; b < a.length; b++) if (this.wid * (parseFloat(a[b].x) + parseFloat(a[b].w)) > this.view.x && this.wid * parseFloat(a[b].x) < this.view.x + this.view.w && this.hei * (parseFloat(a[b].y) + parseFloat(a[b].h)) > this.view.y && this.hei * parseFloat(a[b].y) < this.view.y + this.view.h) {
                    var c = this, d = "annotation";
                    a[b].category && (d += " " + a[b].category);
		    switch (a[b].type)
		    {
			  case "rect":
			  svgHtml+='<rect x="'+this.wid*a[b].x+'" y="'+this.hei*a[b].y+'" width="'+this.wid*a[b].w+'" height="'+this.hei*a[b].h+'" stroke="black" stroke-width="2" fill="none"/>';
			  break;
			  case "ellipse":
		          var cx=parseFloat(a[b].x)+parseFloat(a[b].w)/2;
			  var cy=parseFloat(a[b].y)+parseFloat(a[b].h)/2;
			  var rx=parseFloat(a[b].w)/2;
			  var ry=parseFloat(a[b].h)/2;
			  svgHtml+='<ellipse cx="'+this.wid*cx+'" cy="'+this.hei*cy+'" rx="'+this.wid*rx+'" ry="'+this.hei*ry+'" style="fill:none;stroke:purple;stroke-width:1"/>';
                          break;
			  case "pencil":
	 		  var points=a[b].points;
			  var poly=String.split(points,';');
			  for (var k=0;k<poly.length;k++)
			  {
			     var p=String.split(poly[k],' ');
			     svgHtml+='<polyline points="';         
		             for (var j=0;j<p.length;j++)
		             {
				  point=String.split(p[j],',');
				  px=point[0]*this.wid;
				  py=point[1]*this.hei;
				  svgHtml+=px+','+py+' ';
		             }
			     svgHtml+='" style="fill:none;stroke:red;stroke-width:1"/>';
			  }
			  break;
			  case "polyline":
 			  var points=a[b].points;
			  var poly=String.split(points,';');
			  for (var k=0;k<poly.length;k++)
			  {
			     var p=String.split(poly[k],' ');
			     svgHtml+='<polygon points="';         
		             for (var j=0;j<p.length;j++)
		             {
				  point=String.split(p[j],',');
				  px=point[0]*this.wid;
				  py=point[1]*this.hei;
				  svgHtml+=px+','+py+' ';
		             }
			     svgHtml+='" style="fill:none;stroke:red;stroke-width:1"/>';
			  }
			  break;
                          case "line":
                          var points=String.split(a[b].points,',');
                          svgHtml+='<line x1="'+a[b].x*this.wid+'" y1="'+a[b].y*this.hei+'" x2="'+parseFloat(points[0])*this.wid+'" y2="'+parseFloat(points[1])*this.hei+'" style="stroke:rgb(255,0,0);stroke-width:1"/>';
			  break;
		    }
                    d = (new Element("div", {
                        id: a[b].id,
                        "class": d,
                        styles: {
                            left: Math.round(this.wid * a[b].x),
                            top: Math.round(this.hei * a[b].y),
                            width: Math.round(this.wid * a[b].w),
                            height: Math.round(this.hei * a[b].h)
                        }
		    })).inject(this.canvas);
                    !1 == this.annotationsVisible && d.addClass("hidden");
                    "function" == typeof this.editAnnotation && (!0 == a[b].edit ? this.editAnnotation(d) : (c = this, d.addEvent("dblclick", function (a) {
                        (new DOMEvent(a)).stop();
                        c.editAnnotation(this)
                    })));
                    var e = a[b].text;
                    a[b].title && (e = "<h1>" + a[b].title + "</h1>" + e);
                    d.store("tip:text", e)
                }
		 svgHtml+='</svg>';
                 if(this.svg) this.svg.destroy();
                 //inject the SVG Annotations to this.Canvas
           	 this.svg = (new Element("div", {
                 styles: {
                     position:"absolute",
                     left: 0,
                     top: 0,
                     width: '100%',
                     height: '100%'
                   },
	     	   html:svgHtml
	        })).inject(this.canvas);

               }
                this.annotationTip || (c = this, this.annotationTip = new Tips("div.annotation", {
                    className: "tip",
                    fixed: !0,
                    offset: {
                        x: 30,
                        y: 30
                    },
                    hideDelay: 300,
                    link: "chain",
                    onShow: function (a) {
                        a.setStyles({
                            opacity: a.getStyle("opacity"),
                            display: "block"
                        }).fade(0.9);
                        a.addEvents({
                            mouseleave: function () {
                                this.active = !1;
                                this.fade("out").get("tween").chain(function () {
                                    this.element.setStyle("display", "none")
                                })
                            },
                            mouseenter: function () {
                                this.active = !0
                            }
                        })
                    },
                    onHide: function (a) {
                        a.active || (a.fade("out").get("tween").chain(function () {
                            this.element.setStyle("display", "none")
                        }), a.removeEvents(["mouseenter", "mouseleave"]))
                    }
                }))
            }
        }
    },
    toggleAnnotations: function () {
        var a;
        if (a = this.canvas.getElements("div.annotation")) this.annotationsVisible ? (a.addClass("hidden"),
        this.annotationsVisible = !1, this.showPopUp(IIPMooViewer.lang.annotationsDisabled)) : (a.removeClass("hidden"), this.annotationsVisible = !0);
        //toggle the SVG as well, however this.svg.toggle();doesn't work:(
        if(this.svg.style.visibility!='hidden') this.svg.set({styles:{visibility:'hidden'}});
        else this.svg.set({styles:{visibility:'visible'}});
    },
    destroyAnnotations: function () {
        this.annotationTip && this.annotationTip.detach(this.canvas.getChildren("div.annotation"));
        this.canvas.getChildren("div.annotation").each(function (a) {
            a.eliminate("tip:text");
            a.destroy()
        })
    }
});

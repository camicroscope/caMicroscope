var AnnotationStore = function() {
    console.log("annotation store!");
    this.annotations = [];

    this.cacheBounds = {
        x1: 100,
        y1: -1,
        x2: 1,
        y2: 2
    }
}

AnnotationStore.prototype.getAnnotations = function(x1, y1, x2, y2, footprint, callback){
    var self = this;

//    var annotations = this.fetchAnnotations(x1, y1, x2, y2, footprint, callback);
        if(Math.round(footprint) != 16){
            self.setCacheBounds(100, -1, 1, 2);

            var annotations = this.fetchAnnotations(x1, y1, x2, y2, footprint, callback);
        } else {

            if(this.cacheBounds.x1 > x1 || this.cacheBounds.y1 > y1 || this.cacheBounds.x2 < x2 || this.cacheBounds.y2 < y2){

                if(this.cacheBounds.x1 > x1){
                    console.log("x lower bound");
                }
                if(this.cacheBounds.y1 > y1){
                    console.log("y lower bound");
                }
                if(this.cacheBounds.x2 < x2){
                    console.log("x upper bound");
                }
                if(this.cacheBounds.y2 < y2){
                    console.log("y upper bound");
                }

                //var x1+=

                //console.log(this.cacheBounds)
                //console.log(x1, y1, x2, y2);
                var x_1 = x1-0.05;
                var y_1= y1 -0.005;
                var x_2= x2+ 0.05;
                var y_2= y2+ 0.005;
                if(x_1 < 0)
                    x_1 = 0;
                if(y_1 < 0)
                    y_1 = 0;
//                console.log(x1, x2, y1, y2);

                self.setCacheBounds(x_1,y_1,x_2,y_2);
                //console.log("fetching.........");
                console.log("Clearing and fetching cache");
                var annotations = this.fetchAnnotations(x_1,y_1,x_2,y_2,footprint, callback);
            } else {
                console.log("from cache");
                callback(self.annotations);
            }
    }

    //var annotations = this.fetchAnnotations(x1,y1,x2,y2,footprint, callback);

//    return this.annotations;

    
};

AnnotationStore.prototype.setCacheBounds = function(x1, y1, x2, y2){
    this.cacheBounds.x1 = x1;
    this.cacheBounds.x2 = x2;
    this.cacheBounds.y1 = y1;
    this.cacheBounds.y2 = y2;
}


AnnotationStore.prototype.getCacheBounds = function(){
    return this.cacheBounds;
}

AnnotationStore.prototype.fetchAnnotations = function(x1,y1,x2,y2, footprint, callback){
    //console.log("fetching from api");
    var self = this;
    if(footprint == 16)
        console.log(footprint);
    var url = "api/Data/getAnnotSpatial.php?iid=Test&x=" + x1+ "&y=" + y1 + "&x1=" + x2 + "&y1=" + y2 + "&footprint="+ footprint;
    console.log(url);
    //console.log("hellooooo");
    jQuery.get(url, function(data){
        //console.log(self.getCacheBounds());
        //console.log(url);
        //console.log("ajax request done");
        //console.log(data);
        //var d = data;
        var d = JSON.parse(data);
        self.annotations = d;
        //console.log("----------");
        //console.log("Number of annoations rendered: "+ d.length);
        //var renderStartTime = performance.now();
        console.log("fetched data");
        console.log(d.length);
        callback(d);
        //return d;
        //var renderEndTime = performance.now();
        //console.log(d);
        //this.handleGeoJSON();
    }); 

    
}

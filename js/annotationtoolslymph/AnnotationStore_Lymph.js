var AnnotationStore = function(iid) {
    //console.log("annotation store!");
    this.annotations = [];
    this.iid = iid;
    this.cacheBounds = {
        x1: 100,
        y1: -1,
        x2: 1,
        y2: 2
    }
}

AnnotationStore.prototype.getAnnotations = function(x1, y1, x2, y2, footprint,algorithms, boundX1, boundY1, boundX2, boundY2, callback){
    var self = this;


        if(Math.round(footprint) != 16){
            self.setCacheBounds(100, -1, 1, 2);

            var annotations = this.fetchAnnotations(x1, y1, x2, y2, footprint, algorithms, callback);
        } else {

            if(this.cacheBounds.x1 > x1 || this.cacheBounds.y1 > y1 || this.cacheBounds.x2 < x2 || this.cacheBounds.y2 < y2){
		/*
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
		*/

                var x_1 = x1-boundX1;
                var y_1= y1 - boundY1;
                var x_2= x2+ boundX2;
                var y_2= y2+ boundY2;
                if(x_1 < 0)
                    x_1 = 0;
                if(y_1 < 0)
                    y_1 = 0;

               // console.log(x1, x2, y1, y2);
               // console.log(x_1, x_2, y_1, y_2);
               self.setCacheBounds(x_1,y_1,x_2,y_2);
                //console.log("fetching.........");
                //console.log("Clearing and fetching cache");
                var annotations = this.fetchAnnotations(x_1,y_1,x_2,y_2,footprint,algorithms, callback);
            } else {
                //console.log("from cache");
                callback(self.annotations);
            }
    }

    
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

AnnotationStore.prototype.fetchAnnotations = function(x1,y1,x2,y2, footprint, algorithms, callback){

    var self = this;

    var midX = x2;
    var midY = y2;
    var algorithms_urlparam = JSON.stringify(algorithms);
    algorithms_urlparam = algorithms_urlparam.replace("[", "%5B");
    algorithms_urlparam = algorithms_urlparam.replace("]", "%5D");
    algorithms_urlparam = algorithms_urlparam.replace(/"/g, "%22");
    //console.log(algorithms_urlparam);
    var url1 = "api/Data/getMultipleAnnots.php?iid="+  self.iid +"&x=" + x1+ "&y=" + y1 + "&x1=" + midX + "&y1=" + midY + "&footprint="+ footprint + "&algorithms=" + algorithms_urlparam;
	  //nnnconsole.log(url1);
    //var url1 = "http://dragon.cci.emory.edu:9099/services/TCGA/GeoJSONImageMetaData/query/getMultipleMarkups?api_key=4fbb38a3-1821-436c-a44d-8d3bc5efd33e&CaseId=" + self.iid +"&x1=" + x1+ "&y1=" + y1 + "&x2=" + midX + "&y2=" + midY + "&footprint="+ footprint + "&algorithms=" + algorithms_urlparam + "&";
   // console.log(url1);
   

    // Debug
    console.log(x1 + ', ' + y1 + ', ' + x2 + ', ' + y2);
    console.log(url1);


    jQuery.get(url1, function(data){

	try{
        var d = JSON.parse(data);
        //console.log('retrived annots: ' + JSON.stringify(d[0]));
	} catch (e){
		callback({"error": "Error"});
	}
        self.annotations = d;

        //console.log("fetched data");
        //console.log(d.length);
        if(callback)
            callback(d);

    });

}

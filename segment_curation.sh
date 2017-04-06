// [feiqiao@tahsin191 ~]$ mongo < ~/script/segment_curation.sh

print("-- Run script to generate composite markup dataset -- \n");

//MongoDB database variables
//var host="129.49.255.19";
//var port="27017";
//var dbname="u24_luad";

var host="http://quip-data:9099"
var port="27017";
var dbname="quip";

//image variables
var case_id="TCGA-55-7994-01Z-00-DX1";
// user
var user="tigerfan7495";

var annotation_execution_id=user+"_composite_input";
var polygon_execution_id   =user+"_composite_dataset";

var subject_id = "";
var tmp = case_id.substring(0,4);
if (tmp == 'TCGA'){
   subject_id =case_id.substring(0,12)
}

db = connect(host+":"+ port+"/"+ dbname);

//use test;
//db.runCommand( { listCollections: 1 } );

db.createCollection("newcollection");
 //empty the newcollection
db.newcollection.remove({});

print("-- get segmentations within annotation ... \n");
//get segmentations within annotation 
db.objects.find({"provenance.image.case_id":case_id,
                 "provenance.image.subject_id":subject_id,
                 "provenance.analysis.execution_id":annotation_execution_id
                  }).forEach( function(annotation)
                   {db.objects.aggregate([ { $match: {"provenance.image.case_id":case_id,
                                                      "provenance.image.subject_id":subject_id,
                                                      "provenance.analysis.execution_id":annotation.algorithm,                                                      
                                                       x : { '$gte':annotation.geometry.coordinates[0][0][0], '$lte':annotation.geometry.coordinates[0][2][0]},
                                                       y : { '$gte':annotation.geometry.coordinates[0][0][1], '$lte':annotation.geometry.coordinates[0][2][1]}                                                    
                                                      } }, { $out: "tmpCollection" } ]);  
                    db.tmpCollection.copyTo("newcollection");                                                       
                   } ); 				   
 
//db.newcollection.find().count();
 
  
print("-- update execution_id for this new collection:");   
// update execution_id for this new collection
db.newcollection.update({},
                        {$set : {"provenance.analysis.execution_id":polygon_execution_id}},
                        {upsert:false, multi:true});
                        
 
print("-- delete all old composite dataset of segmentations:");  
// delete all merged segmentations
 db.objects.deleteMany({"provenance.image.case_id":case_id,
                         "provenance.image.subject_id":subject_id,
                         "provenance.analysis.execution_id":polygon_execution_id 			                                                    
                       } );

print("-- insert new dataset from newcollection as array:");  
 //insert from newcollection as array
 db.objects.insert( db.newcollection.find({ },{"_id":0}).toArray() ); 


//insert new metadate document of merging dataset to the metadata collection 
var merge_execution_id_records= db.metadata.find({"image.case_id":case_id,"image.subject_id":subject_id,"provenance.analysis_execution_id":polygon_execution_id}).count();
		
if(merge_execution_id_records == 0){
 print("-- insert new metadate document of merging dataset to the metadata collection:");  
   db.metadata.insertOne(
   { 
    "title" : polygon_execution_id, 
    "user":user,
    "provenance" : {
        "analysis_execution_id" : polygon_execution_id, 
        "type" : "human"}, 
    "image" : {
        "case_id" : case_id, 
        "subject_id" : subject_id
       }
  });
}	

print("-- End of Script -- \n");

exit;
	



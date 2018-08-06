// const layersData = [
// 	{id:'type_1_1',name:'Person_1', typeId:'1',typeName:'Human Annotations' },
// 	{id:'type_2_1',name:'Algo-x1-y1-a1', typeId:'2',typeName:'Pathomic Features' },
// 	{id:'type_1_2',name:'Person_2', typeId:'1',typeName:'Human Annotations' },
// 	{id:'type_2_2',name:'Algo-x1-y1-b2', typeId:'2',typeName:'Pathomic Features' },
// 	{id:'type_1_3',name:'Person_3', typeId:'1',typeName:'Human Annotations' },
// 	{id:'type_2_3',name:'Algo-x1-y1-c3', typeId:'2',typeName:'Pathomic Features' },
// 	{id:'type_1_4',name:'Person_4', typeId:'1',typeName:'Human Annotations' },
// ];
// const layersData = [
// 	{id:"cmuHeat",name:"cmuHeat",typeId:'2',typeName:"Heatmap"},
// 	{id:"cmuMark",name:"cmuMark",typeId:'1',typeName:"Human Annotation"}

// 	];

// default sort by name... do we need to resort layer?

const AnnotationsPanelContent = //'test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>'
"<div class='annotation'>"
+	"Annotation<br> "
+	"Operation<br> "
+	"Area"
+	"<br><br><br><br><br><br>"
+	"<br><br><br><br><br><br>"
+ "</div>"
+"<div><button id='ann_save' style='float:left;'>Save</button><button style='float:right;'>Clear</button></div>";

const AnalyticsPanelContent = //'test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>'
// 					"<div style='display:inline-block;'><label for='algoName'>Algorthms</label></div>"
// +					"<select id='algoName'>"
// +						"<option>Algo-x1-x1-y1</option>"
// +						"<option>Algo-x1-x2-y1</option>"
// +						"<option>Algo-x2-x1-y1</option>"
// +						"<option>Algo-x2-x3-y1</option>"
// +						"<option>Algo-x5-x3-y1</option>"
// +						"<option>Algo-x6-x2-y1</option>"
// +					"</select>"
// +					"<div class='annotation'>"
// +					"	Analytics<br> "
// +					"	Operation<br> "
// +					"	Algo-x1-x1-y1"
// +					"	<br><br><br><br><br>"
// +					"</div>"	
// +          "<div><button id='alg_run' style='float:left;'>Run</button><button style='float:right;'>Reset</button></div>"
         "<div class='separator'></div>"		
+          "<div ><input class='search' type='search'/><button class='search'><i class='material-icons md-24'>find_in_page</i></button></div>"			
+         "<div class='table_wrap'>"
+					"<table class='data_table'>"
+						"<tr><th>Job ID</th><th>Type</th><th>Status</th></tr>"
+						"<tr><td>11-08-00001</td><td>Algo-x1-x2-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00002</td><td>Algo-x5-x3-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00003</td><td>Algo-x2-x1-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00004</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00005</td><td>Algo-x6-x2-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00006</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00007</td><td>Algo-61-x2-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00001</td><td>Algo-x1-x2-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00002</td><td>Algo-x5-x3-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00003</td><td>Algo-x2-x1-y1</td><td>Done</td></tr>"
+						"<tr><td>11-08-00004</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>"
+					"</table>"
+					"</div>";



const annotation_schema = {
  //"type": "object",
  "id": "annotation-form",
  "properties": {
  	"name":
	  	{
	  		"id":"a0",
	  		"title": "Identity Name",
	  		"type" : "string",
	  		"required": true,
      		"description": "note name"
	  	},
	"digital_slide_quality": 
		{
			"id":"a1",
			"title" : "Check if histology is able to be evaluated" , 
			"type" : "boolean"
		} ,
		"histology" : 
		{
			"id":"a2",
			"title" : "Histology: (For BL1 and BL2 only)" , 
			"type" : "string" ,
			"enum" : [ "-" , "PDAC" , "PNET" , "other"],
			"default" : "-"
		} , 
		"hist_other_type" : 
		{ 
			"id":"a3",
			"title" : "Other Histology: (For BL1 and BL2 only)" , 
			"type" : "string" , 
			"enum" : ["-" , "N/A" , "Colloid carcinoma (mucinous noncystic carcinoma)" , "Signet-ring cell carcinoma" , "Adenosquamous carcinoma" , "Intraductal papillary-mucinous neoplasm with an associated invasive carcinoma" , "Intraductal tubulopapillary neoplasm with an associated invasive carcinoma" , "Mucinous cystic neoplasm with an associated invasive carcinoma" , "Large cell neuroendocrine carcinoma" , "Small cell neuroendocrine carcinoma" , "Neuroendocrine carcinoma (poorly differentiated)" , "Undifferentiated (anaplastic) carcinoma" , "Undifferentiated carcinoma with osteoclast-like giant cells" , "Acinar cell carcinoma" , "Acinar cell cystadenocarcinoma" , "Serous cystadenocarcinoma" , "Mixed acinar-ductal carcinoma" , "Mixed ductal-neuroendocrine carcinoma" , "Mixed acinar-neuroendocrine carcinoma" , "Mixed acinar-neuroendocrine-ductal carcinoma" , "Solid-pseudopapillary neoplasm" , "Hepatoid carcinoma" , "Medullary carcinoma"],
			"default" : "-"
		} , 
		"cellularity_10" : 
		{ 
			"id":"a4",
			"title" : "Cellularity percentage" , 
			"type" : "string" , 
			"enum" : ["-" , "0-10%" , "11-20%" , "21-30%" , "31-40%" , "41-50%" , "51-60%" , "61-70%" , "71-80%" , "81-90%" , "91-100%"],
			"default" : "-"
		} , 
		"tumor_cellularity" : 
		{ 
			"id":"a5",
			"title" : "Tumor Cellularity: (For BL1 and BL2 only)" , 
			"type" : "string" , 
		"enum" : [ "-" , "<20% " , ">=20%"],
		"default" : "-"
		} , 
		"tumor_necrosis" : 
		{ 
			"id":"a6",
			"title" : "Tumor Necrosis: (For BL1 and BL2 only)" , "type" : "string" ,
			"enum" : [ "-" , "<20% " , ">=20%"],
			"default" : "-"
		} , 
		"adequacy" : 
		{ 
			"id":"a7",
			"title" : "Adequacy: (For BL1 and BL2 only)" , 
			"type" : "string" , 
			"enum" : [ "-" , "Adequate" , "Inadequate"],
			"default" : "-"
		} , 
		"normal_tissue_type" : 
		{ 
			"id":"a8",
			"title" : "Normal Tissue Type: (For BL3 only)" , 
			"type" : "string" , 
			"enum" : [ "-" , "Duodenum" , "Lymph Node" , "Spleen" , "Other"],
			"default" : "-"
		} , 
		"tumor_present" : 
		{ 
			"id":"a9",
			"title" : "Check if tumor present (For BL3 only)" , 
			"type" : "boolean"
		} , 
		"additional_notes" : {
			"id":"a10",
			"title" : "Additional notes: " , "type" : "textarea"
		}
  }
};

const algorithm_1_schema = {
  "type": "object",
  "id": "algorithm01",
  "$schema": "http://json-schema.org/draft-03/schema#",
  "title": "",
  "description": "",
  "links": [],
  "additionalProperties": false,
  "properties": {
	"arg1": 
		{
			"title" : "Argument 01" , 
			"type" : "boolean"
		} ,
		"arg2" : 
		{
			"title" : "Argument 02" , 
			"type" : "string" ,
			"enum" : [ "arg_01" , "arg_02" , "arg_03" , "arg_04"],
			"default" : "-"
		} ,
		"arg3" : { 
			"title" : "Argument 03" , "type" : "textarea"
		}
  }
};
const algorithm_2_schema = {
  "type": "object",
  "id": "algorithm02",
  "properties": {
	"arg1": 
		{
			"title" : "Argument 01" , 
			"type" : "boolean"
		} ,
		"arg2" : 
		{
			"title" : "Argument 02" , 
			"type" : "string" ,
			"enum" : [ "arg_01" , "arg_02" , "arg_03" , "arg_04"],
			"default" : "-"
		} ,
		"arg3": 
		{
			"title" : "Argument 03" , 
			"type" : "boolean"
		} ,
		"arg4": 
		{
			"title" : "Argument 04" , 
			"type" : "range"
		} ,
  }
};



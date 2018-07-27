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
					"<div style='display:inline-block;'><label for='algoName'>Algorthms</label></div>"
+					"<select id='algoName'>"
+						"<option>Algo-x1-x1-y1</option>"
+						"<option>Algo-x1-x2-y1</option>"
+						"<option>Algo-x2-x1-y1</option>"
+						"<option>Algo-x2-x3-y1</option>"
+						"<option>Algo-x5-x3-y1</option>"
+						"<option>Algo-x6-x2-y1</option>"
+					"</select>"
+					"<div class='annotation'>"
+					"	Analytics<br> "
+					"	Operation<br> "
+					"	Algo-x1-x1-y1"
+					"	<br><br><br><br><br>"
+					"</div>"	
+          "<div><button id='alg_run' style='float:left;'>Run</button><button style='float:right;'>Reset</button></div>"
+         "<div class='separator'></div>"		
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
+					"</div>"
;
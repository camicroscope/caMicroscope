<?php
include_once("connection.php"); 

switch ($_SERVER['REQUEST_METHOD']) 
{
    case 'GET':
	    if(isset($_GET["iid"]))
            {
		    $iid=$_GET["iid"];
		    $query = sprintf("SELECT * FROM `annotation` WHERE iid='%s'", mysql_real_escape_string($iid));
		    $res= mysql_query($query);
            }
            else $res = mysql_query("SELECT * FROM `annotation`");
	    if (mysql_num_rows($res)<=0)
	    echo json_encode('NoAnnotations');
	    else
	    {
	        while($row=mysql_fetch_array($res))
                {
		        $annotation=array('aid'=>$row['aid'],'x'=>$row['x'],'y'=>$row['y'],'w'=>$row['w'],'h'=>$row['h'],'text'=>$row['text'],'type'=>$row['type'],'color'=>$row['color'],'points'=>$row['points']);
		        $annotationList[]=$annotation;
		}
		echo json_encode($annotationList);
	    }
	    break;
    case 'POST':
	    $iid= $_POST["iid"];
            $annotationList=$_POST["annot"];
            $deletequery=sprintf("DELETE FROM `annotation` WHERE iid='%s'",mysql_real_escape_string($iid));
            for($i=0;$i<count($annotationList);$i++)
            {
                 $annotation=$annotationList[$i];
                 if(isset($annotation["aid"]))
		 {	// Formulate Query
			// This is the best way to perform an SQL query
			// For more examples, see mysql_real_escape_string()
			$query = sprintf("UPDATE `annotation` SET iid='%s',x='%s',y='%s',w='%s',h='%s',text='%s',type='%s',points='%s',color='%s' WHERE aid='%s'",
			        mysql_real_escape_string($iid),
				mysql_real_escape_string($annotation["x"]),
				mysql_real_escape_string($annotation["y"]),
				mysql_real_escape_string($annotation["w"]),
				mysql_real_escape_string($annotation["h"]),
				mysql_real_escape_string($annotation["text"]),
				mysql_real_escape_string($annotation["type"]),
				mysql_real_escape_string($annotation["points"]),
				mysql_real_escape_string($annotation["color"]),
				mysql_real_escape_string($annotation["aid"]));
			// Perform Query
			$result = mysql_query($query);
			// Check result
			// This shows the actual query sent to MySQL, and the error. Useful for debugging.
			if (!$result) {
			    $message  = 'Invalid query: ' . mysql_error() . "\n";
			    $message .= 'Whole query: ' . $query;
			    die($message);
			}
 			$deletequery.=sprintf(" AND aid !='%s'",mysql_real_escape_string($annotation["aid"]));
		 }
                 else
		 {
			// Formulate Query
			// This is the best way to perform an SQL query
			// For more examples, see mysql_real_escape_string()
			$query = sprintf("INSERT INTO `annotation`(iid,x,y,w,h,text,type,points,color) VALUES('%s','%s','%s','%s','%s','%s','%s','%s','%s')",
			        mysql_real_escape_string($iid),
				mysql_real_escape_string($annotation["x"]),
				mysql_real_escape_string($annotation["y"]),
				mysql_real_escape_string($annotation["w"]),
				mysql_real_escape_string($annotation["h"]),
				mysql_real_escape_string($annotation["text"]),
				mysql_real_escape_string($annotation["type"]),
				mysql_real_escape_string($annotation["points"]),
				mysql_real_escape_string($annotation["color"]));
			// Perform Query
			$result = mysql_query($query);
			// Check result
			// This shows the actual query sent to MySQL, and the error. Useful for debugging.
			if (!$result) {
			    $message  = 'Invalid query: ' . mysql_error() . "\n";
			    $message .= 'Whole query: ' . $query;
			    die($message);
			}
                        $lastid= mysql_insert_id();
 			$deletequery.=sprintf(" AND aid !='%s'",mysql_real_escape_string($lastid));
                 }
            }
		// Perform Query
		$result = mysql_query($deletequery);
		// Check result
		// This shows the actual query sent to MySQL, and the error. Useful for debugging.
		if (!$result) {
		    $message  = 'Invalid query: ' . mysql_error() . "\n";
		    $message .= 'Whole query: ' . $query;
		    die($message);
		}
                else echo json_encode("success");
            break;
}
?>

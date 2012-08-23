<?php
include_once("connection.php"); 

switch ($_SERVER['REQUEST_METHOD']) 
{
    case 'GET':
	    if(isset($_GET["iid"]))
            {
		    $iid=$_GET["iid"];
		    $res = mysql_query("SELECT * FROM `image` WHERE iid='$iid'");	
            }
            else $res = mysql_query("SELECT * FROM `image`");
	    if (mysql_num_rows($res)<=0)
	    echo "No IMAGE IN DB";
	    else
	    {
	        while($row=mysql_fetch_array($res))
                {
		        $image=array('PatientName'=>$row['pName'],'PatientAge'=>$row['pAge'],'ImageModality'=>$row['modality'],'ImageLocation'=>$row['location'],'iid'=>$row['iid'],'maxWid'=>$row['maxWid'],'maxHei'=>$row['maxHei'],'ratio'=>$row['ratio']);
		        $imageList[]=$image;
                }
		echo json_encode($imageList);
	    }
	    break;
    case 'POST':
	    echo "Haha";
            break;
}
?>

<?php
/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
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

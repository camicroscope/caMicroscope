<?php
/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
include_once("connection.php"); 
$pName=$_POST["pName"];
$pAge=$_POST["pAge"];
$modality=$_POST["modality"];
$maxWid=$_POST["maxWid"];
$maxHei=$_POST["maxHei"];
$ratio=$_POST["ratio"];
$allowedExts = array("tif","jp2");
$extension = end(explode(".", $_FILES["file"]["name"]));
if (in_array($extension, $allowedExts))
  {
  if ($_FILES["file"]["error"] > 0)
    {
    echo "Error: " . $_FILES["file"]["error"] . "<br />";
    }
  else
    {
	    if (file_exists("/usr/share/iip/" . $_FILES["file"]["name"]))
	    {
	      echo $_FILES["file"]["name"] . " already exists. ";
	    }
	    else
	    {
               echo "Upload: " . $_FILES["file"]["name"] . "<br />";
               echo "Type: " . $_FILES["file"]["type"] . "<br />";
	       echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
	       echo "Stored in: /usr/share/iip/" . $_FILES["file"]["name"];
	       move_uploaded_file($_FILES["file"]["tmp_name"],
	      "/usr/share/iip/" . $_FILES["file"]["name"]);
              $location="/usr/share/iip/" . $_FILES["file"]["name"];
	        // Formulate Query
		// This is the best way to perform an SQL query
		// For more examples, see mysql_real_escape_string()
		$query = sprintf("INSERT INTO `image`(pName,pAge,modality,maxWid,maxHei,location) VALUES('%s','%s','%s','%s','%s','%s')",
			mysql_real_escape_string($pName),
			mysql_real_escape_string($pAge),
			mysql_real_escape_string($modality),
			mysql_real_escape_string($maxWid),
			mysql_real_escape_string($maxHei),
			mysql_real_escape_string($location));
		// Perform Query
		$result = mysql_query($query);
		// Check result
		// This shows the actual query sent to MySQL, and the error. Useful for debugging.
		if (!$result) {
		    $message  = 'Invalid query: ' . mysql_error() . "\n";
		    $message .= 'Whole query: ' . $query;
		    die($message);
		}else echo json_encode("success");
	    }
    }
  }
else
  {
  echo "Invalid file,only tiff or jp2 image files are supported. ";
  }
?>

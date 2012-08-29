<?php
/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
 $file='annot.txt';//Please Make Sure this File is Readable and Writable
 switch ($_SERVER['REQUEST_METHOD'])
 {
    case 'GET':
    $annot=file_get_contents($file);
    echo (json_encode($annot));
    break;
    case 'POST':
    $annot=$_REQUEST["annot"];
    echo (file_put_contents($file,json_encode($annot)));
    break;
 }
?>

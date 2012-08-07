<?php
 $file='annot2.txt';
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

<?php
    
 error_reporting(-1);
 ini_set('display_errors', true);
 $file='annot.txt';
 switch ($_SERVER['REQUEST_METHOD'])
 {
    case 'GET':
        $annot=file_get_contents($file);
        echo json_encode($annot);
        break;
    case 'POST':
        $annot=$_POST['annot'];
        file_put_contents($file,json_encode($annot));
        //echo (file_put_contents($file,json_encode($annot)));
        echo "success";
        break;
 }
?>

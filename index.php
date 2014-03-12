<?php 
require '../authenticate.php'; 
$viewer = $_GET["viewer"];
header("Location: queryBrowser.html?viewer=".$viewer);
die(); 
?>




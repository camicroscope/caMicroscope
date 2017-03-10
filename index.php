<?php 
require '../authenticate.php'; 
$viewer = $_GET["viewer"];
header("Location: csv2Json.html?tableView=TCGABreast&viewer=".$viewer);
die(); 
?>




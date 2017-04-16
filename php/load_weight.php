<?php

$iid = $_POST["iid"];
$user = $_POST["user"];

//$fname = "../data/" . $iid . ".txt";
$fname = "../data/" . $iid . "_" . $user . ".txt";
$content = "NaN";
if (file_exists($fname))
{
	$file = fopen($fname, 'r') or die(print_r(error_get_last(),true));
	$content = fgets($file) . fgets($file) . fgets($file);
	fclose($file);
}
echo $content;
?> 

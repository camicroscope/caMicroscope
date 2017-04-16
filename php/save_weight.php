<?php

$iid = $_POST["iid"];
$lym_weight = $_POST["lymweight"];
$nec_weight = $_POST["necweight"];
$smh_weight = $_POST["smoothness"];
$user = $_POST["user"];

$fname = "../data/" . $iid . "_" . $user . ".txt";

// Check existence first
if (file_exists($fname))
{
	echo "Locked";
}
else
{
	$file = fopen($fname, 'w') or die(print_r(error_get_last(),true));
	$content = $lym_weight . "\n" . $nec_weight . "\n" . $smh_weight;
	fwrite($file, $content);
	fclose($file);
	echo "Saved weight successful";
}
?> 

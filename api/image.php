<?php
$image=array("PatientName"=>"lily","PatientAge"=>9,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/1.tif");
$imageList[]=$image;
$image=array("PatientName"=>"lucy","PatientAge"=>8,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/2.tif");
$imageList[]=$image;
$image=array("PatientName"=>"Emily","PatientAge"=>10,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/3.tif");
$imageList[]=$image;
$image=array("PatientName"=>"Ben","PatientAge"=>12,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/4.tif");
$imageList[]=$image;
$image=array("PatientName"=>"Alice","PatientAge"=>13,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/5.tif");
$imageList[]=$image;
$image=array("PatientName"=>"David","PatientAge"=>80,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/6.tif");
$imageList[]=$image;
$image=array("PatientName"=>"Shawn","PatientAge"=>70,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/7.tif");
$imageList[]=$image;
$image=array("PatientName"=>"John","PatientAge"=>76,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/8.tif");
$imageList[]=$image;
$image=array("PatientName"=>"Rose","PatientAge"=>66,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/9.tif");
$imageList[]=$image;
$image=array("PatientName"=>"Jack","PatientAge"=>58,"ImageModality"=>"Whole Slide","ImageLocation"=>"/image/10.tif");
$imageList[]=$image;
echo json_encode($imageList);
?>
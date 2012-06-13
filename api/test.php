<?php
$image=array("PatientName"=>"lily","PatientAge"=>9,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/1.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"lucy","PatientAge"=>8,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/2.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"Emily","PatientAge"=>10,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/3.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"Ben","PatientAge"=>12,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/4.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"Alice","PatientAge"=>13,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/5.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"David","PatientAge"=>80,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/6.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"Shawn","PatientAge"=>70,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/7.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"John","PatientAge"=>76,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/8.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"Rose","PatientAge"=>66,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/9.jp2");
$imageList[]=$image;
$image=array("PatientName"=>"Jack","PatientAge"=>58,"ImageModality"=>"Whole Slide","ImageLocation"=>"/usr/share/iip/10.jp2");
$imageList[]=$image;
echo json_encode($imageList);
?>
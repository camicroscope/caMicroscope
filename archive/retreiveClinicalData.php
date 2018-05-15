<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
$configJson = file_get_contents("../Configuration/ConfigPath.txt");
$configJson = json_decode($configJson);
$api_key = $_SESSION['api_key'];
foreach($configJson as $key=>$result) {
		$path1 = $result;
		break;
	}

$tableView = $_GET['tableView'];
$dataurl = $path1->$tableView->dataUrl . "api_key=" . $api_key;
$metadataurl = $path1->$tableView->metadataUrl . "api_key=" . $api_key;

$count = 0;
foreach($_GET as $key => $value)
{
	if($count >= 1)
	{
		$dataurl = $dataurl . "&" . $key . "=" . $value;
	}
	$count = $count + 1;
}

$dataurl = str_replace(" ","%20",$dataurl);
$metadataurl = str_replace(" ", "%20", $metadataurl);
$getDataRequest = new RestRequest($dataurl, 'GET');
$getDataRequest->execute();
$nextLink = "";
$getMetaDataRequest = new RestRequest($metadataurl, 'GET');
$getMetaDataRequest->execute();
$expectedPropertiesIndices = array();
$expectedPropertiesArray = array();
$metadata = json_decode($getMetaDataRequest->responseBody);
$data = json_decode($getDataRequest->responseBody);
	if($path1->$tableView->hasLink != "false")
	{
		$nextLink = $path1->$tableView->nextLink;
		$expectedPropertiesArray = $path1->$tableView->expectedProperties;
		foreach($expectedPropertiesArray as $key=>$value)
		{
			$i = 0;
			foreach($metadata as $k => $v)
			{
				foreach($v as $subk => $subv)
				{
					if($subk == $value)
					{
						$expectedPropertiesIndices[] = $i;
					}
		
					$i++;
				}
			}
		}
	}

foreach($data as $key => $value)
{
	$subData = array();
	foreach($value as $subk => $subval)
	{
		array_push($subData,$subval);
	}
	
	$aaData[] = $subData;
}

foreach($metadata as $k => $v)
{
	foreach($v as $subk => $subv)
	{
		$i = 0;	
		$sub = array("sTitle" => $subk);
		foreach($subv as $kk => $vv)
		{
				if($kk == "url")
				{
					if($vv == "true")
					{
						$urlColumnIndex = $i;
					}
					else
						$urlColumnIndex = -1;
				}
			$test = $kk . ": " . $vv;
			$sub[$kk] = $vv;
			$i++;
		}
		$aoColumns[] = $sub;
	}

}	

$dataTableData = array();

array_push($dataTableData, $aaData, $nextLink,$aoColumns, $urlColumnIndex, $expectedPropertiesIndices, $tableView);
echo(json_encode($dataTableData));
?>

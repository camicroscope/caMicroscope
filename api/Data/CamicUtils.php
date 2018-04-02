<?php

class CamicUtils
{
    public $CONFIG;
    public $api_key;

    function __construct($Session)
    {
        include_once("RestRequest.php");
        $this->CONFIG = require '../Configuration/config.php';
        $this->api_key = $Session['api_key'];
    }

    function getImageDimensions($tissueId)
    {
        $dimensionsUrl = $this->CONFIG['getDimensions'] . $this->api_key . "&TCGAId=" . $tissueId;
        $getDimensionRequest = new RestRequest($dimensionsUrl, 'GET');
        $getDimensionRequest->execute();
        $dimensionList = json_decode($getDimensionRequest->responseBody);
        $finalDimensions;

        foreach ($dimensionList as $singleDimension) {
            $finalDimensions = $singleDimension;
            break;
        }
        return $finalDimensions;
    }

    function retrieveImageLocation($tissueId)
    {
        $fileUrl = $this->CONFIG['getFileLocation'] . $this->api_key . "&TCGAId=" . $tissueId;
        $fileUrl = str_replace(" ", "%20", $fileUrl);
        $getFileLocationRequest = new RestRequest($fileUrl, 'GET');
        $getFileLocationRequest->execute();
        $location = json_decode($getFileLocationRequest->responseBody);
        return $location;
    }

        function retrieveImageStatus($tissueId)
	{
		$statusUrl = $this->CONFIG['getImageStatus'] . $this->api_key . "&TCGAId=" . $tissueId;
		$statusUrl = str_replace(" ","%20",$statusUrl);
		$getImageStatusRequest = new RestRequest($statusUrl,'GET');
		$getImageStatusRequest->execute();
		$status = json_decode($getImageStatusRequest->responseBody);
		return $status;
	}
        
        function retrieveImageAssignTo($tissueId)
	{
		$statusUrl = $this->CONFIG['getImageAssignTo'] . $this->api_key . "&TCGAId=" . $tissueId;
		//print_r($statusUrl);
                $statusUrl = str_replace(" ","%20",$statusUrl);
		$getImageAssignToRequest = new RestRequest($statusUrl,'GET');
		$getImageAssignToRequest->execute();
		$AssignTo = json_decode($getImageAssignToRequest->responseBody);
		//print_r($AssignTo);
                return $AssignTo;
	}
	
	function retrieveMpp($tissueId)
	{
	    $mppUrl = $this->CONFIG['getMPP'] . $this->api_key . "&TCGAId=" . $tissueId;

	    $getMPPRequest = new RestRequest($mppUrl, 'GET');
	    $getMPPRequest -> execute();
	    $mpplist = json_decode($getMPPRequest->responseBody);
	    $finalMPP;
	    foreach($mpplist as $singleMPP)
	    {
		$finalMPP = $singleMPP;
		break;
	    }

        return $finalMPP;
    }

    function setUpSymLinks($fileLocation)
    {
        foreach ($fileLocation[0] as $key => $value) {
            $path = "/tmp/symlinks/" . session_id();
            if (!is_dir($path)) {
                mkdir($path);
            }

            $file = strrchr($value, '/');
            $fileNameWithoutExtension = substr($file, 0, -5);

            if (is_dir($path . $fileNameWithoutExtension)) {
                $link = $path . $fileNameWithoutExtension . $file . ".dzi";
            } else {
                mkdir($path . $fileNameWithoutExtension);
                $file = $path . $fileNameWithoutExtension . $file;
                symlink($value, $file);
                symlink($file, $file . ".dzi");
                $link = $file . ".dzi";
            }
        }

        return $link;
    }

    function setUpSVSImage($fileLocation)
    {
        foreach ($fileLocation[0] as $key => $value) {
            $link = str_replace("tiff", "svs", $value);
            $link = $link . ".dzi";
        }

        return $link;
    }
}

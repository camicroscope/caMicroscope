<?php
	class TrustedApplicationClient
	{
		private  $applicationID = '';
		private  $applicationSecret = '';
		private  $url = '';
		const ROUND_OFF_FACTOR = 100 ;
		const KEY_LIFETIME = 3600 ;
		
		public function initialize($applicationID,$applicationSecret,$url)
		{
			$this->applicationID = $applicationID;
			$this->applicationSecret = $applicationSecret;
			$this->url = $url ;
		}

		public function requestShortLivedKey($username)
		{
				$salt = uniqid();
				$digest = self::calculateDigestValue($this->applicationID,$this->applicationSecret,$salt , $username);
				
				$curlHandle = curl_init($this->url);
				$headers = array(
				"_username: " . $username,
				"_salt: " . $salt ,
				"_digest: " . $digest ,
				"_applicationID: " . $this->applicationID 
				);
				
				curl_setopt($curlHandle, CURLOPT_HTTPHEADER, $headers);
				curl_setopt($curlHandle, CURLOPT_HTTPGET, 1);
				curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, TRUE);
				curl_setopt($curlHandle, CURLOPT_FAILONERROR, TRUE);
				$execResult = curl_exec($curlHandle);
				
				if(curl_errno($curlHandle))
				{
						    throw new Exception( curl_error($curlHandle) );
				}
				
				return $execResult;
		}
		
		function calculateDigestValue($applicationID,
			$applicationKey, $salt, $username)
		{
		 $roundoff = (int) (microtime(true)  / self::ROUND_OFF_FACTOR) ;
		 $prenonce = $roundoff . "|" . $applicationKey;
		 $nonce = base64_encode(sha1($prenonce , true));

		 $predigest = $username . "|" .  $nonce . "|" .
				$applicationID. "|" . $salt ;
		 $digest = base64_encode(sha1($predigest , true));
		return $digest;
		}
	}	
?>

	<?php
		$client = new TrustedApplicationClient();
		$client->initialize("demo-id","demo-secret-key" , "http://localhost:9099/trustedApplication/issueShortLivedApiKey");
		try {
					$serverResponse =  $client->requestShortLivedKey("admin");
					$serverResponse = json_decode($serverResponse , true);
					$apiKey = $serverResponse["api_key"];
					echo $apiKey;
		}
		catch(Exception $e)
		{
			echo "Your request could not be completed. Please contact your system administrator" ;
			echo $e->getMessage();
		}
		

	?>

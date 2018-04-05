<?php

require_once('param_get.php');

try{
  $config_file = parse_ini_file('config.ini');
}
catch(Exception $e){
}

// TODO fail if any of following missing from file
$api_key;

//for others, null coalesce to defaults
//TODO add a header to warn if security Disabled

$cnf=[
  'config' => [
    'api_key' => $config_file['api_key'],
    'trusted_secret' => param_get($config_file['trusted_secret'],"9002eaf56-90a5-4257-8665-6341a5f77107"),
    'disable_security' => param_get($config_file['disable_security'],False),
    'mongo_client_url' => param_get($config_file['mongo_client_url'],"mongodb://quip-data"),
    'trusted_id' => param_get($config_file['trusted_id'] ,"camicSignup"),
    'trusted_url' => param_get($config_file['trusted_url'] ,"http://quip-data:9099/trustedApplication"),
    'client_id' => param_get($config_file['client_id'] ,"xxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"),
    'client_secret' => param_get($config_file['client_secret'],"xxxxxxxxxxxxxxx"),
    'redirect_uri' => param_get($config_file['redirect_uri'],"postmessage"),
    'title' => param_get($config_file['title'],"caMicroscope"),
    'suffix' => param_get($config_file['suffix'],"<div></div>"),
    'description' => param_get($config_file['description'],"Look at slides."),
    'footer' => param_get($config_file['footer'],"caMicroscope – A Digital Pathology Integrative Query System; Ashish Sharma PI Emory"),
    'download_link' => param_get($config_file['download_link'],"https://github.com/camicroscope"),
    'folder_path' => param_get($config_file['folder_path'],"/"),
    'dataHost'=> param_get($config_file['dataHost'],"quip-data:9099"),
    'kueHost'=> param_get($config_file['kueHost'],"quip-jobs:3000")
  ],
];

// get with require()
return $cnf['config'];

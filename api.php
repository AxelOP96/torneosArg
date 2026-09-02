<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$apiKey = "";
$url ="";
$options = [
    'http' => [
        'method' => 'GET',
        'header' => "X-Auth-Token: " . $apiKey . "\r\n" .
                    "User-Agent: LiveScotesApp/1.0\r\n" 
    ]
];

$context = stream_context_create($options);
try{
    $response = @file_get_contents($url, false, $context);
    if($response === false){
        throw new Exception("No se pudo conectar a la información...");
    }

} catch( Exception){
    
}
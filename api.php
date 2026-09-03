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
    $data = json_encode($response, true);
    if(isset($data['message'])){
        throw new Exception($data['message']);
    }
    $formattedMatches = [];
    $rawMatches = $data['matches'] ?? [];

    foreach($rawMatches as $match){
        $status = $match['status'] ?? 'SCHEDULED';
        $category = 'upcoming';
        if(in_array($status, ['IN_PLAY', 'PAUSED', 'HALFTIME', 'LIVE'])){
            $category = 'live';
        }elseif(in_array($status, ['FINISHED', 'AWARDED', ])){
            $category = 'finished';
        }
    }

} catch( Exception){

}
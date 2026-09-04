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
        }elseif(in_array($status, ['FINISHED', 'AWARDED' ])){
            $category = 'finished';
        }
        $goals= [];
        if(!empty($match['goals'])){
            foreach($match['goals'] as $goal){
                $goals[] = [
                            'minite' => $goal['minite'] ?? '',
                            'scorer' => $goal['scorer']['name'] ?? 'Goal',
                            'team' => ($goal['team']['id'] === $match['homeTeam']['id']) ? 'home' : 'away'
                            ];
            }
        }

        $formattedMatches[] = [
            'id' => $match['id'] ?? null,
            'competition' => $match['competition']['name'] ?? 'other',
            'competitionCode' => $match['competition']['code'] ?? 'OTHER',
            'category' => $category,
            'status' => $status,
            'utcDate' => $match['utcDate'] ?? null,
            'minite' => $match['minite'] ?? null,
            'time' => isset($match['utcDate']) ? date('H:i', strtotime($match['utcDate'])) : 'TBD',

        ];
    }

} catch( Exception){

}
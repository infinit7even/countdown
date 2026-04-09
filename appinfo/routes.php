<?php
return [
    'routes' => [
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
        ['name' => 'api#getCountdowns', 'url' => '/api/countdowns', 'verb' => 'GET'],
        ['name' => 'api#saveCountdowns', 'url' => '/api/countdowns', 'verb' => 'POST'],
        ['name' => 'api#notify', 'url' => '/api/notify', 'verb' => 'POST'],
    ]
];

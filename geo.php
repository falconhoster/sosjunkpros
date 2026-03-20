<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

function respond(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function getVisitorIp(): string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_TRUE_CLIENT_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        $_SERVER['HTTP_CLIENT_IP'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];

    foreach ($candidates as $candidate) {
        foreach (explode(',', $candidate) as $value) {
            $ip = trim($value);
            if ($ip === '') {
                continue;
            }

            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }

    foreach ($candidates as $candidate) {
        foreach (explode(',', $candidate) as $value) {
            $ip = trim($value);
            if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }

    return '';
}

function decodeJsonResponse(string $body): array
{
    $data = json_decode($body, true);
    return is_array($data) ? $data : [];
}

function fetchJson(string $url): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_TIMEOUT => 4,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_USERAGENT => 'SOSJunkProsGeo/1.0',
        ]);

        $body = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_errno($ch);
        curl_close($ch);

        if (is_string($body) && $curlError === 0 && $httpCode >= 200 && $httpCode < 300) {
            $data = decodeJsonResponse($body);
            if ($data !== []) {
                return $data;
            }
        }
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 4,
            'ignore_errors' => true,
            'header' => "Accept: application/json\r\nUser-Agent: SOSJunkProsGeo/1.0\r\n",
        ],
    ]);

    $body = @file_get_contents($url, false, $context);
    if (!is_string($body) || $body === '') {
        return [];
    }

    return decodeJsonResponse($body);
}

function extractCity(array $data): string
{
    $fields = ['city', 'cityName'];

    foreach ($fields as $field) {
        if (!isset($data[$field]) || !is_string($data[$field])) {
            continue;
        }

        $city = trim($data[$field]);
        if ($city !== '') {
            return $city;
        }
    }

    return '';
}

$visitorIp = getVisitorIp();
if ($visitorIp === '') {
    respond(['city' => '']);
}

$encodedIp = rawurlencode($visitorIp);
$providers = [
    "https://freegeoip.app/json/{$encodedIp}",
    "https://freeipapi.com/api/json/{$encodedIp}",
    "https://ipapi.com/ip_api.php?ip={$encodedIp}",
    "http://ip-api.com/json/{$encodedIp}",
];

foreach ($providers as $providerUrl) {
    $data = fetchJson($providerUrl);
    $city = extractCity($data);

    if ($city !== '') {
        respond(['city' => $city]);
    }
}

respond(['city' => '']);

<?php

declare(strict_types=1);

header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

function oauth_config(): array
{
    $file = dirname(__DIR__, 2) . '/mk-config.php';
    $config = is_file($file) ? (array) ((require $file)['github'] ?? []) : [];

    if (empty($config['client_id']) || empty($config['client_secret'])) {
        http_response_code(500);
        exit('CMS login is not configured: add GitHub OAuth credentials to mk-config.php.');
    }
    $config['allowed_origins'] = (array) ($config['allowed_origins'] ?? []);
    return $config;
}

function callback_url(): string
{
    return 'https://' . $_SERVER['HTTP_HOST'] . '/oauth/callback.php';
}

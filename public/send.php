<?php
/**
 * Quote / contact form handler for Namecheap shared hosting.
 *
 * Settings are read from mk-config.php placed ONE LEVEL ABOVE public_html
 * (so it is never web-accessible and never overwritten by deploys).
 * See deploy/mk-config.example.php.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$config = [
    'mail_to'   => 'info@mkaluplast.com',
    'mail_from' => 'noreply@mkaluplast.com',
    'subject'   => 'New quote request — mkaluplast.com',
];
$configFile = dirname(__DIR__) . '/mk-config.php';
if (is_file($configFile)) {
    $loaded = require $configFile;
    $config = array_merge($config, (array) ($loaded['form'] ?? []));
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method']);
}

// Spam checks: honeypot filled, or submitted faster than a human could type.
$ts = (int) ($_POST['ts'] ?? 0);
if (!empty($_POST['website']) || ($ts > 0 && (microtime(true) * 1000 - $ts) < 2500)) {
    respond(200, ['ok' => true]); // pretend success, silently drop
}

$clean = static fn(string $key, int $max): string =>
    trim(mb_substr(str_replace(["\r", "\0"], '', (string) ($_POST[$key] ?? '')), 0, $max));

$name    = $clean('name', 120);
$email   = $clean('email', 160);
$phone   = $clean('phone', 40);
$product = $clean('product', 80);
$message = $clean('message', 4000);
$lang    = in_array($clean('lang', 5), ['it', 'sq'], true) ? $clean('lang', 5) : 'en';
$location = $clean('location', 120);
$variant  = $clean('variant', 80);
$projectType = in_array($_POST['projectType'] ?? '', ['new', 'renovation', 'commercial'], true) ? $_POST['projectType'] : '';
$contactMethod = in_array($_POST['contactMethod'] ?? '', ['phone', 'email'], true) ? $_POST['contactMethod'] : '';
$interests = array_values(array_filter(
    array_map(static fn($v) => preg_replace('/[^a-z-]/', '', (string) $v), (array) ($_POST['interests'] ?? [])),
    static fn($v) => $v !== ''
));
$interests = array_slice(array_unique($interests), 0, 12);
$consent = !empty($_POST['consent']);

if ($name === '' || $message === '' || !$consent || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'validation']);
}

// Strip newlines from anything that ends up in a header.
$headerSafe = static fn(string $v): string => preg_replace('/[\r\n]+/', ' ', $v);

$body = implode("\n", [
    "Name:     {$name}",
    "Email:    {$email}",
    "Phone:    " . ($phone ?: '—'),
    "Location: " . ($location ?: '—'),
    "Interests: " . ($interests ? implode(', ', $interests) : '—'),
    "Product page: " . ($product ?: '—'),
    "System:   " . ($variant ?: '—'),
    "Project:  " . ($projectType ?: '—'),
    "Contact via: " . ($contactMethod ?: '—'),
    "Language: {$lang}",
    '',
    'Message:',
    $message,
    '',
    '—',
    'Sent from ' . ($_SERVER['HTTP_REFERER'] ?? 'mkaluplast.com'),
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? ''),
]);

$headers = [
    'From: MK AluPlast Website <' . $headerSafe($config['mail_from']) . '>',
    'Reply-To: ' . $headerSafe($name) . ' <' . $headerSafe($email) . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$topic = $variant ?: ($interests ? implode(', ', $interests) : $product);
$subject = '=?UTF-8?B?' . base64_encode($config['subject'] . ($topic ? " ({$topic})" : '')) . '?=';

$sent = mail(
    $config['mail_to'],
    $subject,
    $body,
    implode("\r\n", $headers),
    '-f' . $config['mail_from']
);

respond($sent ? 200 : 500, ['ok' => $sent]);

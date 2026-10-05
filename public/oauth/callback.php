<?php
/**
 * Step 2 of GitHub OAuth for the CMS: exchange the code for a token and hand it
 * back to the CMS window using the Decap/Sveltia postMessage handshake.
 */

declare(strict_types=1);

require __DIR__ . '/_common.php';

$config = oauth_config();

$status = 'error';
$payload = ['provider' => 'github', 'error' => 'Login failed'];

$state = $_GET['state'] ?? '';
$expected = $_COOKIE['mk_oauth_state'] ?? '';
setcookie('mk_oauth_state', '', ['expires' => 1, 'path' => '/oauth/']);

if ($state === '' || !hash_equals($expected, $state)) {
    $payload['error'] = 'Invalid state — please try logging in again.';
} elseif (!empty($_GET['code'])) {
    $ch = curl_init('https://github.com/login/oauth/access_token');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
        CURLOPT_POSTFIELDS     => http_build_query([
            'client_id'     => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'code'          => $_GET['code'],
            'redirect_uri'  => callback_url(),
        ]),
    ]);
    $response = json_decode((string) curl_exec($ch), true) ?: [];
    curl_close($ch);

    if (!empty($response['access_token'])) {
        $status = 'success';
        $payload = ['provider' => 'github', 'token' => $response['access_token']];
    } else {
        $payload['error'] = $response['error_description'] ?? 'Could not obtain an access token.';
    }
}

$message = 'authorization:github:' . $status . ':' . json_encode($payload);
$origins = $config['allowed_origins'] ?: ['https://' . $_SERVER['HTTP_HOST']];
?>
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing in…</title></head>
<body>
<p>Completing sign-in… you can close this window if it stays open.</p>
<script>
  (function () {
    var message = <?= json_encode($message) ?>;
    var allowed = <?= json_encode(array_values($origins)) ?>;
    function receive(e) {
      if (allowed.indexOf(e.origin) === -1) return;
      window.opener.postMessage(message, e.origin);
      window.removeEventListener('message', receive, false);
      setTimeout(function () { window.close(); }, 500);
    }
    window.addEventListener('message', receive, false);
    if (window.opener) window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body>
</html>

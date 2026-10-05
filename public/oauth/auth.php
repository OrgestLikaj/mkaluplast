<?php
/**
 * Step 1 of GitHub OAuth for the CMS (/admin): redirect to GitHub's consent screen.
 * Credentials live in mk-config.php one level above public_html.
 */

declare(strict_types=1);

require __DIR__ . '/_common.php';

$config = oauth_config();

$state = bin2hex(random_bytes(16));
setcookie('mk_oauth_state', $state, [
    'expires'  => time() + 600,
    'path'     => '/oauth/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

$scope = ($_GET['scope'] ?? '') === 'public_repo' ? 'public_repo' : 'repo,user';

$query = http_build_query([
    'client_id'    => $config['client_id'],
    'redirect_uri' => callback_url(),
    'scope'        => $scope,
    'state'        => $state,
]);

header('Location: https://github.com/login/oauth/authorize?' . $query, true, 302);

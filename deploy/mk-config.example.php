<?php
/**
 * Copy to the Namecheap home directory ONE LEVEL ABOVE public_html, named mk-config.php:
 *   /home/<cpanel-user>/mk-config.php
 * It is never web-accessible and deploys never overwrite it.
 */

return [
    // Quote form (public/send.php)
    'form' => [
        'mail_to'   => 'info@mkaluplast.com',     // where enquiries are delivered
        'mail_from' => 'noreply@mkaluplast.com',  // must be a mailbox/domain on this hosting account
        'subject'   => 'New quote request — mkaluplast.com',
    ],

    // CMS login (public/oauth/*). Create at GitHub → Settings → Developer settings → OAuth Apps:
    //   Homepage URL:               https://mkaluplast.com
    //   Authorization callback URL: https://mkaluplast.com/oauth/callback.php
    'github' => [
        'client_id'       => '',
        'client_secret'   => '',
        'allowed_origins' => ['https://mkaluplast.com'],
    ],
];

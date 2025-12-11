<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | N8N Workflow Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for N8N workflow integration, specifically for the
    | Nutri-Assist feature that uses AI-powered recommendations via Google Gemini.
    |
    */

    'n8n' => [
        'webhook_url' => env('N8N_WEBHOOK_URL'),
        'broadcast_webhook_url' => env('N8N_BROADCAST_WEBHOOK_URL'),
        'api_key' => env('N8N_API_KEY'),
        'timeout' => env('N8N_TIMEOUT', 60),
        'enabled' => env('N8N_ENABLED', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Gemini API
    |--------------------------------------------------------------------------
    |
    | API key for Google Gemini (used in N8N workflow)
    |
    */

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
    ],

];

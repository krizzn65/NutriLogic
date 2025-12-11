<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="#3b82f6">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="NutriLogic">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="application-name" content="NutriLogic">
        <meta name="msapplication-TileColor" content="#3b82f6">
        <meta name="msapplication-tap-highlight" content="no">
        <meta name="description" content="Aplikasi monitoring gizi dan kesehatan anak posyandu">
        
        <title>NutriLogic - Sistem Informasi Posyandu</title>
        
        <!-- Favicon & Icons -->
        <link rel="icon" type="image/svg+xml" href="{{ asset('logo_das.svg') }}">
        <link rel="apple-touch-icon" href="{{ asset('icons/icon-192x192.png') }}">
        
        <!-- PWA Manifest -->
        <link rel="manifest" href="{{ asset('build/manifest.webmanifest') }}">
        
        {{-- Inject React Fast Refresh preamble (needed for @vitejs/plugin-react) --}}
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>

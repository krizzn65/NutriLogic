<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NutriLogic</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('logo_das.svg') }}">
    {{-- Inject React Fast Refresh preamble (needed for @vitejs/plugin-react) --}}
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>

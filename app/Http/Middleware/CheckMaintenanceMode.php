<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if maintenance mode is enabled
        $maintenanceMode = Setting::get('maintenance_mode', false);

        if ($maintenanceMode) {
            $user = $request->user();

            // Allow admin to access during maintenance
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'message' => 'Sistem sedang dalam mode maintenance. Silakan coba lagi nanti.',
                    'maintenance_mode' => true,
                ], 503);
            }
        }

        return $next($request);
    }
}


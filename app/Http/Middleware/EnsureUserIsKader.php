<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsKader
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated (should be handled by auth:sanctum middleware)
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if user has kader or admin role
        if (!$user->isKader() && !$user->isAdmin()) {
            return response()->json([
                'message' => 'Forbidden. Only kader or admin can access this resource.',
            ], 403);
        }

        return $next($request);
    }
}

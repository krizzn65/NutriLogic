<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * Get all system settings
     */
    public function index(): JsonResponse
    {
        $settings = Setting::getAll();

        return response()->json([
            'data' => $settings,
        ], 200);
    }

    /**
     * Update system settings
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'app_name' => ['nullable', 'string', 'max:255'],
            'maintenance_mode' => ['nullable', 'boolean'],
            'allow_registration' => ['nullable', 'boolean'],
            'session_timeout' => ['nullable', 'integer', 'min:5', 'max:1440'],
            'max_file_size' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        foreach ($validated as $key => $value) {
            $type = match (true) {
                is_bool($value) => 'boolean',
                is_int($value) => 'integer',
                default => 'string',
            };

            Setting::set($key, $value, $type);
        }

        // Clear cache
        Setting::clearCache();

        // Get old settings for audit trail
        $oldSettings = Setting::getAll();

        // Log activity with before/after snapshot
        AdminActivityLogController::log(
            'update',
            'Admin memperbarui pengaturan sistem',
            'Setting',
            null,
            [
                'before' => $oldSettings,
                'after' => $validated,
                'changed_keys' => array_keys($validated),
            ]
        );

        return response()->json([
            'message' => 'Pengaturan berhasil diperbarui.',
            'data' => Setting::getAll(),
        ], 200);
    }

    /**
     * Get specific setting by key
     */
    public function show(string $key): JsonResponse
    {
        $value = Setting::get($key);

        if ($value === null) {
            return response()->json([
                'message' => 'Setting tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'key' => $key,
            'value' => $value,
        ], 200);
    }
}

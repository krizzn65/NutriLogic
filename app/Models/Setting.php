<?php

namespace App\Models;

use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get setting value by key with type casting
     */
    public static function get(string $key, $default = null)
    {
        if (!self::settingsTableExists()) {
            return $default;
        }

        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            try {
                $setting = self::where('key', $key)->first();
            } catch (QueryException) {
                return $default;
            }

            if (!$setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set setting value
     */
    public static function set(string $key, $value, string $type = 'string'): void
    {
        $stringValue = is_bool($value) ? ($value ? 'true' : 'false') : (string) $value;

        self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $stringValue,
                'type' => $type,
            ]
        );

        Cache::forget("setting_{$key}");
    }

    /**
     * Cast value based on type
     */
    protected static function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => $value === 'true' || $value === '1' || $value === 1,
            'integer' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Get all settings as key-value array
     */
    public static function getAll(): array
    {
        if (!self::settingsTableExists()) {
            return [];
        }

        return Cache::remember('all_settings', 3600, function () {
            try {
                $settings = self::all();
            } catch (QueryException) {
                return [];
            }

            $result = [];

            foreach ($settings as $setting) {
                $result[$setting->key] = self::castValue($setting->value, $setting->type);
            }

            return $result;
        });
    }

    /**
     * Clear settings cache
     */
    public static function clearCache(): void
    {
        Cache::forget('all_settings');
        $keys = ['app_name', 'maintenance_mode', 'allow_registration', 'session_timeout', 'max_file_size'];
        foreach ($keys as $key) {
            Cache::forget("setting_{$key}");
        }
    }

    protected static function settingsTableExists(): bool
    {
        static $exists = null;

        if ($exists !== null) {
            return $exists;
        }

        try {
            $exists = Schema::hasTable((new self())->getTable());
        } catch (\Throwable) {
            $exists = false;
        }

        return $exists;
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

abstract class Controller
{
    protected function rejectDuplicateSubmission(Request $request, string $scope, int $ttlSeconds = 5): ?JsonResponse
    {
        $userId = $request->user()?->id ?? 'guest';
        $idempotencyKey = $request->header('X-Idempotency-Key');

        if ($idempotencyKey) {
            $cacheKey = "idempotency:{$scope}:{$userId}:" . sha1($idempotencyKey);
        } else {
            $payload = $request->except(['attachment']);
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                if ($file instanceof UploadedFile) {
                    $payload['attachment_fingerprint'] = sha1(
                        implode('|', [
                            $file->getClientOriginalName(),
                            (string) $file->getSize(),
                            (string) $file->getMimeType(),
                        ])
                    );
                }
            }

            $cacheKey = "idempotency:{$scope}:{$userId}:" . sha1(json_encode($payload));
        }

        $created = Cache::add($cacheKey, true, now()->addSeconds($ttlSeconds));
        if (!$created) {
            return response()->json([
                'message' => 'Permintaan duplikat terdeteksi. Tunggu sebentar lalu coba lagi.',
            ], 429);
        }

        return null;
    }
}

# Arsitektur & Teknologi

## 1. Stack Utama

1. Backend: Laravel (`framework ^12`, PHP `^8.2`).
2. API Auth: Laravel Sanctum.
3. Frontend: React + React Router + Vite.
4. Styling: Tailwind CSS.
5. Visualisasi: Recharts.
6. Animasi: Framer Motion.
7. PWA: `vite-plugin-pwa`.
8. DB: SQLite (default local) atau MySQL (deploy).

## 2. Arsitektur Aplikasi

1. `routes/web.php`: semua path web diarahkan ke `resources/views/app.blade.php`.
2. React SPA bootstrap dari `resources/js/app.jsx`.
3. `routes/api.php`: seluruh endpoint bisnis.
4. Layer backend:
   Controller -> Model/Service -> DB.
5. Layer frontend:
   Components (per role) -> `lib/api.js` axios -> `/api/*`.

## 3. Middleware & Akses

Alias middleware di `bootstrap/app.php`:

1. `kader` -> `EnsureUserIsKader`.
2. `admin` -> `EnsureUserIsAdmin`.
3. `maintenance` -> `CheckMaintenanceMode`.

Middleware global yang di-append:

1. `UpdateUserActivity` (update `last_seen_at`).
2. `CheckMaintenanceMode` (blokir non-admin saat maintenance).

## 4. Model Per Role

1. `admin`:
   akses penuh admin routes.
2. `kader`:
   akses endpoint kader + sebagian endpoint umum terproteksi by ownership/posyandu.
3. `ibu`:
   akses endpoint parent + endpoint umum by ownership anak.

## 5. Service Layer Kustom

1. `ZScoreService`:
   kalkulasi WFA/HFA/WFH + klasifikasi status gizi.
2. `NutritionService`:
   fallback rekomendasi menu berdasarkan ingredients + usia.
3. `PriorityChildService`:
   hitung prioritas antrean berdasarkan kepatuhan PMT bulan sebelumnya.
4. `PointsService`:
   manajemen poin, badge milestones, streak login.
5. `LoginAttemptService`:
   anti brute-force (lock identifier/IP).
6. `N8nBroadcastService`:
   trigger webhook n8n untuk broadcast WhatsApp.

## 6. Integrasi Eksternal

Konfigurasi di `config/services.php`:

1. `n8n.webhook_url`: NutriAssist AI.
2. `n8n.broadcast_webhook_url`: broadcast WA.
3. `n8n.api_key`, `n8n.timeout`, `n8n.enabled`.
4. `gemini.api_key` (dipakai lewat workflow n8n).

## 7. Keamanan & Session

1. Login:
   validasi identifier + password.
2. Lockout:
   max attempt gagal + lock 15 menit (identifier/IP).
3. Token policy:
   single-session enforcement (login baru menghapus token lama).
4. Logout:
   revoke current token.
5. Sanctum token expiration:
   `120` menit (lihat `config/sanctum.php`).

## 8. Frontend App Structure

1. Root router: `App.jsx`.
2. Dashboard shell role-based: `PageUtama.jsx`.
3. Role container:
   `OrangTua.jsx`, `Kader.jsx`, `Admin.jsx`.
4. API client:
   `resources/js/lib/api.js` (interceptor auth header + auto logout 401).

## 9. Caching yang Dipakai

1. Settings cache (`setting_*`, `all_settings`) di `Setting` model.
2. NutriAssist recommendation cache (`24 jam`).
3. Login streak cache di `PointsService`.

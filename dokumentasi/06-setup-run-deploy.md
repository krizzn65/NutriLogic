# Setup, Run, dan Deploy

## 1. Prasyarat

1. PHP `>= 8.2`.
2. Composer.
3. Node.js `>= 18`.
4. DB lokal: SQLite atau MySQL.

## 2. Setup Lokal Cepat

1. Install dependency backend:
   `composer install`
2. Install dependency frontend:
   `npm install`
3. Siapkan env:
   `copy .env.example .env` (Windows) atau `cp`.
4. Generate key:
   `php artisan key:generate`
5. Migrasi + seed:
   `php artisan migrate --seed`

## 3. Menjalankan Aplikasi

1. Cara standar terpisah:
   - `php artisan serve`
   - `npm run dev`
2. Cara cepat gabungan (script composer `dev`):
   - `composer run dev`

Script ini menjalankan server, queue worker, log viewer, dan vite bersamaan.

## 4. Build Produksi

1. Build frontend:
   `npm run build`
2. Jalankan Laravel dengan web server production.

## 5. Konfigurasi Env Penting

1. Database (`DB_*`).
2. Session (`SESSION_*`), queue (`QUEUE_CONNECTION`), cache (`CACHE_STORE`).
3. N8N:
   - `N8N_WEBHOOK_URL`,
   - `N8N_BROADCAST_WEBHOOK_URL`,
   - `N8N_API_KEY`,
   - `N8N_TIMEOUT`,
   - `N8N_ENABLED`.
4. Mail (`MAIL_*`) untuk forgot password.
5. `GEMINI_API_KEY` (dipakai via n8n workflow).

## 6. Scheduler & Queue

1. Ada task terjadwal:
   cleanup login attempts lama (`routes/console.php`).
2. Queue dipakai untuk background jobs (siapkan worker saat production).

## 7. Deploy Docker Ringan

File: `docker-compose.light.yml`  
Service:

1. `nginx`.
2. `app` (php-fpm).
3. `mysql`.
4. `queue`.
5. `n8n`.

Catatan:

1. Compose ini disiapkan untuk server ringan (~1GB) dengan memory limit per service.
2. Sesuaikan `.env` terutama DB password dan n8n basic auth.

## 8. Seed Data & Akun Uji

`DatabaseSeeder` membuat data demo lengkap + menampilkan credential sample di output artisan.

## 9. Perintah Test

1. Backend:
   `composer test` atau `php artisan test`.
2. Frontend:
   `npm run test` atau `npm run test:run`.

<!-- 2f3a03cd-f590-4993-81c0-41d0c7469523 3c0fd5ba-4c8d-42d1-aedf-04698f4820c0 -->
# Implementasi Fitur Poin & Badge (Gamifikasi)

## Tujuan

Membuat sistem gamifikasi sederhana yang memberikan poin dan badge kepada orang tua untuk aktivitas positif seperti login harian, mengisi log makanan, dan aktivitas lainnya.

## Backend Implementation

### 1. Migration: Tambah Kolom Points di Users

**File baru**: `database/migrations/YYYY_MM_DD_HHMMSS_add_points_to_users_table.php`

- Tambah kolom `points` (integer, default 0) ke tabel `users`
- Tidak nullable, default 0

### 2. Migration: Buat Tabel User Badges

**File baru**: `database/migrations/YYYY_MM_DD_HHMMSS_create_user_badges_table.php`

- Tabel `user_badges`:
  - `id`: bigInteger, primary key
  - `user_id`: foreign key ke `users.id`
  - `badge_code`: string, 50 (kode badge, contoh: 'first_login', 'meal_logger', dll)
  - `earned_at`: timestamp (kapan badge didapat)
  - `timestamps`: created_at, updated_at
- Foreign key user_id dengan onDelete cascade
- Unique constraint: user_id + badge_code (satu user tidak bisa dapat badge yang sama dua kali)
- Index pada user_id untuk performa query

### 3. Buat Model UserBadge

**File baru**: `app/Models/UserBadge.php`

- Relationships:
  - `user()`: BelongsTo User
- Fillable: user_id, badge_code, earned_at
- Casts: earned_at ke datetime

### 4. Update Model User

**File**: `app/Models/User.php`

- Tambah `points` ke fillable
- Tambah casts: `points` ke integer
- Tambah relationship: `badges()`: HasMany UserBadge
- Helper method: `hasBadge(string $badgeCode)`: check apakah user sudah punya badge

### 5. Buat PointsService

**File baru**: `app/Services/PointsService.php`

- Method `addPoints(User $user, int $points, string $activity)`: tambah poin ke user
  - Update user->points
  - (Optional) log activity untuk history
  - Check dan berikan badge jika mencapai threshold tertentu
- Method `checkAndAwardBadge(User $user, string $badgeCode, string $badgeName, string $badgeDescription)`: berikan badge jika belum punya
  - Check apakah user sudah punya badge
  - Jika belum, create UserBadge
  - Return true jika badge baru diberikan
- Method `getBadgeDefinitions()`: return array definisi badge
  - Badge codes: 'first_login', 'meal_logger_10', 'meal_logger_50', 'daily_login_7', 'daily_login_30', dll
  - Setiap badge punya: code, name, description, icon (optional)
- Method `checkBadgesAfterActivity(User $user, string $activity)`: check dan award badge setelah aktivitas
  - Contoh: setelah meal log, check apakah sudah 10/50/100 meal logs
  - Contoh: setelah login, check apakah sudah login 7/30 hari berturut-turut

### 6. Integrate PointsService ke Controllers

**File**: `app/Http/Controllers/MealLogController.php`

- Di method `store()`: setelah create meal log, panggil PointsService untuk:
  - Tambah poin (misal: +5 poin untuk setiap meal log)
  - Check badge (misal: badge setelah 10, 50, 100 meal logs)

**File**: `app/Http/Controllers/AuthController.php`

- Di method `login()`: setelah login berhasil, panggil PointsService untuk:
  - Check daily login (misal: +2 poin untuk login harian, badge setelah 7/30 hari berturut-turut)
  - Check first login badge

### 7. Buat ParentPointsController

**File baru**: `app/Http/Controllers/ParentPointsController.php`

- Method `index(Request $request)`: GET `/api/parent/points`
  - Authorization: hanya untuk role 'ibu'
  - Query: ambil user dengan badges
  - Response JSON:
    ```json
    {
      "data": {
        "total_points": int,
        "badges": [
          {
            "id": int,
            "badge_code": string,
            "badge_name": string,
            "badge_description": string,
            "earned_at": date
          }
        ],
        "badge_definitions": [
          {
            "code": string,
            "name": string,
            "description": string,
            "is_earned": boolean
          }
        ]
      }
    }
    ```


### 8. Tambah Route di api.php

**File**: `routes/api.php`

- Tambah route di dalam `Route::prefix('parent')`:
  - `Route::get('/points', [ParentPointsController::class, 'index']);`

## Frontend Implementation

### 9. Buat Component PointsAndBadgesPage

**File baru**: `resources/js/components/konten/PointsAndBadgesPage.jsx`

- State management: `loading`, `error`, `pointsData`
- useEffect: fetch data dari `/api/parent/points` saat mount
- Function `fetchPoints()`: GET data dengan error handling
- UI Components:
  - **Header**: "Poin & Badge" dengan deskripsi
  - **Points Display**: card besar menampilkan total poin dengan icon/visual menarik
  - **Badges Section**:
    - Grid/list badge yang sudah didapat
    - Tampilkan: icon/visual badge, nama badge, deskripsi, tanggal earned
    - Badge yang belum didapat: tampilkan dengan opacity rendah atau locked state
  - **Badge Definitions Section** (optional):
    - List semua badge yang tersedia dengan status earned/not earned
  - **Loading & Error States**

### 10. Update Routing di OrangTua.jsx

**File**: `resources/js/components/OrangTua.jsx`

- Import: `PointsAndBadgesPage` dari `./konten/PointsAndBadgesPage`
- Update route: `Route path="gamification" element={<PointsAndBadgesPage />} />`
- Hapus placeholder `GamificationPage`

## Catatan Implementasi

- Poin rules (contoh):
  - Login harian: +2 poin (hanya sekali per hari)
  - Meal log: +5 poin per log
  - Update data berat/tinggi: +10 poin
  - Konsultasi: +3 poin per pesan
- Badge rules (contoh):
  - First Login: badge pertama kali login
  - Meal Logger 10: setelah 10 meal logs
  - Meal Logger 50: setelah 50 meal logs
  - Daily Login 7: login 7 hari berturut-turut
  - Daily Login 30: login 30 hari berturut-turut
- Daily login tracking: bisa simpan di session/cache atau tabel terpisah (untuk versi sederhana, bisa check last login date)
- Handle edge cases: user sudah punya badge, duplicate points, dll
- Badge visual: untuk versi awal, bisa pakai emoji atau icon sederhana

### To-dos

- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
- [ ] Buat API Client Utility (resources/js/lib/api.js) dengan axios instance dan interceptors
- [ ] Buat Auth Helper Functions (resources/js/lib/auth.js) dengan login, logout, getToken, getUser, dll
- [ ] Update Form Login di AuthSwitch.jsx - ubah phone ke email, tambah state, handle submission
- [ ] Update PageUtama.jsx untuk dynamic role dari localStorage
- [ ] Update SidebarOrangTua.jsx untuk logout functionality
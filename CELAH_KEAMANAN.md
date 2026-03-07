# Daftar Celah Fitur dan Keamanan NutriLogic

> Dokumentasi ini berisi daftar celah keamanan dan fitur yang ditemukan pada project NutriLogic.
> Tanggal analisis: 2026-03-01

---

## LEGEND

- [ ] = Belum diperbaiki
- [x] = Sudah diperbaiki

---

## 🔴 CRITICAL (Prioritas Tinggi)

### 1. [x] Debug Mode Aktif di Production
- **Lokasi**: `.env` line 4
- **Deskripsi**: `APP_DEBUG=true` masih aktif. Ini akan menampilkan stack trace dan informasi sensitif saat terjadi error.
- **Dampak**: Mengekspos struktur direktori, environment variables, dan kode internal ke pengguna.
- **Solusi**: Set `APP_DEBUG=false` di production.

### 2. [x] Kredensial Default Hardcoded di Dokumentasi
- **Lokasi**: `README.md` lines 266-280
- **Deskripsi**: Password default tercantum di dokumentasi:
  - `admin@admin.com / password`
  - `kader@kader.com / password`
  - `ibu@ibu.com / password`
- **Dampak**: Jika password tidak diubah, attacker bisa login langsung.
- **Solusi**:
  - Hapus kredensial dari dokumentasi
  - Implementasi forced password change pada first login
  - Gunakan password random yang kuat untuk akun default

### 3. [x] Debug Endpoint Terbuka
- **Lokasi**: `routes/api.php` lines 21-28
- **Deskripsi**: Endpoint `/debug-user` menampilkan password hash user.
- **Dampak**: Bisa digunakan untuk mendapatkan informasi password hash.
- **Solusi**: Hapus endpoint ini sebelum production.

### 4. [x] Password Dikirim dalam Response API
- **Lokasi**:
  - `app/Http/Controllers/AdminUserController.php` lines 94-97, 259-261
  - `app/Http/Controllers/KaderChildController.php` lines 209-215
- **Deskripsi**: Password generated dikembalikan dalam response API.
- **Dampak**: Password bisa terekspos di logs, browser history, atau network monitoring.
- **Solusi**:
  - Kirim password melalui email/SMS terpisah
  - Atau gunakan mechanism one-time token untuk set password

---

## 🟠 HIGH (Prioritas Tinggi)

### 5. [x] Database Password Kosong
- **Lokasi**: `.env`
- **Deskripsi**: `DB_PASSWORD=` kosong.
- **Dampak**: Database tidak terproteksi dengan password.
- **Solusi**: Set password database yang kuat di production.

### 6. [x] API Key dalam Request Body
- **Lokasi**: `app/Http/Controllers/NutriAssistController.php` line 105
- **Deskripsi**: API key untuk n8n dikirim di request body, bukan header.
- **Dampak**: API key bisa terekspos di logs.
- **Solusi**: Pindahkan API key ke header request.

### 7. [x] Tidak Ada Rate Limiting pada Endpoint Sensitif
- **Lokasi**: `routes/api.php`
- **Deskripsi**: Sebagian besar endpoint tidak memiliki rate limiting, hanya login dan forgot-password yang dibatasi.
- **Endpoint tanpa rate limiting**:
  - `/nutri-assist/recommend` - bisa di-spam untuk menghabiskan quota AI
  - `/meal-logs` - bisa di-spam untuk farming points
  - `/weighing-logs` - bisa di-spam untuk farming points
  - `/parent/consultations/*/messages` - bisa di-spam untuk farming points
- **Dampak**:
  - Resource exhaustion
  - Points manipulation melalui spam aktivitas
  - Abuse AI recommendation feature
- **Solusi**: Tambahkan rate limiting pada semua endpoint yang mengubah data.

### 8. [x] Cache::flush() Menghapus Semua Cache
- **Lokasi**: `app/Http/Controllers/NutriAssistController.php` line 179
- **Deskripsi**: `Cache::flush()` menghapus SEMUA cache aplikasi, bukan hanya cache NutriAssist.
- **Dampak**: Bisa menghapus cache penting lainnya seperti login streak, dll.
- **Solusi**: Gunakan cache tags atau prefix untuk menghapus cache spesifik.

---

## 🟡 MEDIUM (Prioritas Menengah)

### 9. [x] Duplicate Database Update
- **Lokasi**: `app/Http/Controllers/ChildController.php` lines 164-166
- **Deskripsi**: `$child->update($validated)` dipanggil dua kali.
- **Dampak**: Unnecessary database operation, potential race condition.
- **Solusi**: Hapus duplikasi kode.

### 10. [x] Tidak Ada Proteksi Double-Click pada Submit
- **Lokasi**: Frontend components (berbagai form)
- **Deskripsi**: Meskipun ada `disabled={loading}`, state React tidak langsung ter-update sebelum request pertama dikirim.
- **Dampak**: Double-click cepat bisa mengirim request duplikat.
- **Solusi**:
  - Gunakan `useRef` untuk tracking submission state yang lebih immediate
  - Atau tambahkan unique request ID di backend untuk deduplikasi

### 11. [x] Points Farming Melalui Spam Aktivitas
- **Lokasi**:
  - `app/Http/Controllers/MealLogController.php` line 112 - 5 points per meal log
  - `app/Http/Controllers/WeighingLogController.php` line 170 - 10 points per weighing log
  - `app/Http/Controllers/ParentConsultationController.php` line 375 - 3 points per message
- **Deskripsi**: Tidak ada batasan berapa kali user bisa mendapat points dari aktivitas yang sama.
- **Dampak**: User bisa farming points dengan:
  - Membuat meal log banyak sekaligus
  - Mengirim banyak pesan konsultasi
  - Membuat weighing log berulang
- **Solusi**:
  - Batasi points per aktivitas per hari (misal max 3 meal logs per hari)
  - Atau implementasi cooldown antara aktivitas

### 12. [x] NutriAssist Tidak Ada Limit Harian
- **Lokasi**: `app/Http/Controllers/NutriAssistController.php`
- **Deskripsi**: User bisa request rekomendasi makanan tanpa batas.
- **Dampak**:
  - Menghabiskan quota AI API (Gemini/n8n)
  - Spam requests
- **Solusi**: Implementasi daily limit per user (misal 5 requests/hari).

### 13. [x] Tidak Ada Validasi File Upload yang Ketat
- **Lokasi**: `app/Http/Controllers/ParentConsultationController.php` line 328
- **Deskripsi**: Validasi file hanya `'image', 'max:5120'` tanpa MIME type whitelist.
- **Dampak**: Potensi upload file berbahaya dengan ekstensi gambar.
- **Solusi**:
  - Tambahkan MIME type whitelist: `'mimes:jpeg,jpg,png,gif,webp'`
  - Validasi konten file dengan `getimagesize()`
  - Simpan file di storage yang tidak executable

### 14. [x] Email/Phone Enumeration pada Registrasi
- **Lokasi**: `app/Http/Controllers/AuthController.php` lines 74-86
- **Deskripsi**: Pesan error spesifik memberitahu apakah email atau phone sudah terdaftar.
- **Dampak**: Attacker bisa mengetahui email/phone yang terdaftar di sistem.
- **Solusi**: Gunakan pesan error generik atau kirim email notifikasi saja.

---

## 🟢 LOW (Prioritas Rendah)

### 15. [x] Tidak Ada Validasi NIK yang Proper
- **Lokasi**: `app/Http/Controllers/KaderChildController.php` line 147
- **Deskripsi**: NIK divalidasi hanya format 16 digit angka, tanpa validasi algoritma NIK Indonesia.
- **Dampak**: NIK bisa diisi dengan angka random yang tidak valid.
- **Solusi**: Implementasi validasi NIK sesuai standar Indonesia (kode provinsi, kabupaten, kecamatan, tanggal lahir, dll).

### 16. [x] Tidak Ada Soft Delete pada Data Penting
- **Lokasi**: Berbagai controller
- **Deskripsi**: Data seperti consultation, meal logs, weighing logs dihapus permanen.
- **Dampak**: Data tidak bisa dipulihkan jika terjadi penghapusan yang tidak disengaja.
- **Solusi**: Implementasi soft deletes untuk data penting.

### 17. [x] Login Streak Disimpan di Cache
- **Lokasi**: `app/Services/PointsService.php` lines 219-230, 253-274
- **Deskripsi**: Login streak disimpan di cache dengan TTL 40 hari.
- **Dampak**: Jika cache di-clear, user kehilangan streak mereka.
- **Solusi**: Simpan streak di database untuk persistensi.

### 18. [x] Tidak Ada Session Timeout Configuration
- **Lokasi**: Konfigurasi Laravel Sanctum
- **Deskripsi**: Token expiration 120 menit, tapi tidak ada idle timeout.
- **Dampak**: User tetap login meskipun tidak aktif selama 120 menit.
- **Solusi**: Implementasi idle timeout (misal 30 menit tidak aktif = logout).

### 19. [x] Tidak Ada Audit Log untuk Aksi Sensitif User
- **Lokasi**: Berbagai controller
- **Deskripsi**: `AdminActivityLogController::log()` dipanggil, tapi tidak semua aksi user dicatat.
- **Dampak**: Sulit melacak aktivitas mencurigakan user.
- **Solusi**: Tambahkan audit log untuk:
  - Perubahan password
  - Perubahan data sensitif anak
  - Export data

### 20. [x] Kader Bisa Melihat Semua Kader
- **Lokasi**: `app/Http/Controllers/ParentConsultationController.php` lines 25-44
- **Deskripsi**: Endpoint `/parent/kaders` menampilkan semua kader tanpa filter.
- **Dampak**: User bisa melihat semua kader di sistem.
- **Solusi**: Filter kader berdasarkan posyandu user.

---

## 📝 BEST PRACTICE RECOMMENDATIONS

### Security Headers
- [ ] Tambahkan security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] Implementasi HTTPS redirect
- [ ] Tambahkan rate limiting di reverse proxy level

### Input Validation
- [ ] Tambahkan sanitasi input untuk mencegah XSS
- [ ] Validasi ukuran file upload di server side
- [ ] Implementasi request validation yang lebih ketat

### Authentication
- [ ] Implementasi 2FA untuk admin
- [ ] Implementasi password rotation policy
- [ ] Tambahkan device management

### Data Protection
- [ ] Enkripsi data sensitif di database (NIK, alamat)
- [ ] Implementasi data masking untuk logs
- [ ] Tambahkan backup encryption

### Monitoring
- [ ] Setup alerting untuk failed login attempts
- [ ] Monitor API usage anomalies
- [ ] Log retention policy

---

## 🔧 QUICK FIX SCRIPT

```bash
# 1. Set debug to false in production
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env

# 2. Remove debug route
# Hapus secara manual dari routes/api.php

# 3. Generate application key jika belum
php artisan key:generate

# 4. Clear cache
php artisan cache:clear
php artisan config:clear
```

---

## 📊 SUMMARY

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 4 | [x] 4/4 Selesai |
| High | 4 | [x] 4/4 Selesai |
| Medium | 6 | [x] 6/6 Selesai |
| Low | 6 | [x] 6/6 Selesai |
| **Total** | **20** | **100% Complete (20/20)** |

---

## 🔗 RELATED FILES

- `.env` - Konfigurasi environment
- `routes/api.php` - Route definitions
- `app/Http/Controllers/*.php` - Business logic
- `app/Services/PointsService.php` - Points system
- `README.md` - Dokumentasi (hapus kredensial!)

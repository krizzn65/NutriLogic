# Skema Database

Dokumen ini merangkum tabel dari migration aktif.

## 1. Tabel Master

1. `posyandus`
   - info posyandu: `name`, `village`, `address`, `rt_rw`, `city`, `latitude`, `longitude`, `is_active`.

2. `users`
   - user multi-role: `admin`, `kader`, `ibu`.
   - field utama: `name`, `email`, `phone`, `password`, `role`, `posyandu_id`, `points`, preferensi notifikasi, `last_seen_at`.

3. `children`
   - relasi: `parent_id -> users`, `posyandu_id -> posyandus`.
   - field utama: identitas anak, `birth_date`, `gender`, data lahir, `is_active`.

## 2. Tabel Kesehatan Anak

1. `weighing_logs`
   - pengukuran: `weight_kg`, `height_cm`, `muac_cm`, `head_circumference_cm`.
   - hasil hitung: `zscore_wfa`, `zscore_hfa`, `zscore_wfh`, `nutritional_status`.

2. `meal_logs`
   - jurnal makan: `eaten_at`, `time_of_day`, `description`, `ingredients`, `portion`, `source`.

3. `pmt_logs`
   - PMT harian: `date`, `status(consumed|partial|refused)`.
   - unique key: `child_id + date`.

4. `immunization_schedules`
   - jadwal event kesehatan.
   - bisa child-specific (`child_id`) atau general posyandu (`child_id null`, `posyandu_id` terisi).
   - enum type: `imunisasi|vitamin|posyandu`.

5. `vitamin_distributions`
   - distribusi vitamin per anak dan tanggal.
   - enum `vitamin_type`: `vitamin_a_blue|vitamin_a_red|other`.

6. `immunization_records`
   - catatan imunisasi aktual yang sudah diberikan.
   - enum `vaccine_type` sesuai daftar vaksin dasar di migration.

## 3. Tabel Konsultasi

1. `consultations`
   - relasi parent-kader-anak.
   - `status`: `open|closed`.

2. `consultation_messages`
   - pesan chat, bisa ada attachment (`attachment_path`, `attachment_type`).

## 4. Tabel Sistem & Operasional

1. `activity_logs`
   - audit trail aksi user.
2. `notifications`
   - notifikasi in-app per user.
3. `broadcast_logs`
   - histori broadcast kader.
4. `settings`
   - key-value setting global app.
5. `user_badges`
   - badge gamification user.
6. `personal_access_tokens`
   - Sanctum token table.
7. `login_attempts`
   - tracking login failed/success + lockout.
8. `password_reset_tokens`
   - token reset password.
9. `sessions`, `cache`, `jobs`, `failed_jobs`, `job_batches`, `cache_locks`.

## 5. Relasi Inti (Ringkas)

1. `users (ibu)` 1..n `children`.
2. `posyandus` 1..n `users` dan 1..n `children`.
3. `children` 1..n:
   `weighing_logs`, `meal_logs`, `pmt_logs`, `immunization_schedules`, `vitamin_distributions`, `immunization_records`.
4. `consultations`:
   belongs to `parent(user)`, optional `kader(user)`, optional `child`.
5. `consultations` 1..n `consultation_messages`.

## 6. Enum Penting

1. `users.role`: `admin|kader|ibu`.
2. `immunization_schedules.type`: `imunisasi|vitamin|posyandu`.
3. `pmt_logs.status`: `consumed|partial|refused`.
4. `meal_logs.time_of_day`: `pagi|siang|malam|snack`.
5. `meal_logs.portion`: `habis|setengah|sedikit|tidak_mau`.
6. `meal_logs.source`: `ortu|kader|system`.
7. `vitamin_distributions.vitamin_type`: `vitamin_a_blue|vitamin_a_red|other`.
8. `consultations.status`: `open|closed`.

## 7. Data Seed

`DatabaseSeeder` mengisi data contoh lengkap:

1. posyandu.
2. admin, kader, orang tua.
3. anak, data kesehatan, PMT, jadwal.
4. konsultasi, gamification, dan data sistem.

Seeder juga menampilkan kredensial contoh di output artisan.

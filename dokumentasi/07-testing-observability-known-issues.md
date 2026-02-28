# Testing, Observability, dan Known Issues

## 1. Status Testing Saat Ini

File test yang tersedia:

1. PHPUnit basic examples (`tests/Feature/ExampleTest.php`, `tests/Unit/ExampleTest.php`).
2. Vitest + Testing Library fokus pada modul jurnal makan/PMT:
   - property-based tests,
   - loading/empty state,
   - accessibility dan responsive behavior.

Kesimpulan:

1. Coverage automated test lebih kuat di frontend modul jurnal.
2. Coverage backend business endpoints masih belum merata (perlu ditambah).

## 2. Logging & Audit

1. Audit aktivitas disimpan di `activity_logs` melalui helper `AdminActivityLogController::log`.
2. Banyak aksi penting sudah dicatat:
   login/logout, CRUD data inti, reset password, export report.
3. Login attempt tracking disimpan di `login_attempts`.

## 3. Notifikasi

1. Notifikasi in-app disimpan di `notifications`.
2. Endpoint tersedia untuk list, unread, read one/all, delete one/all read.
3. Event penghasil notifikasi:
   broadcast, pesan konsultasi, reset password, dll.

## 4. Known Issues Teknis (Perlu Diperhatikan)

1. `password_reset_tokens` mismatch skema:
   migration membuat kolom primary `phone`, sementara controller forgot/reset memakai kolom `email`.

2. `ParentConsultationController` salah properti child:
   ada penggunaan `child->name` di metadata/notifikasi, sementara model child memakai `full_name`.

3. `KaderConsultationController@storeMessage`:
   variabel attachment diproses, tapi saat create message tidak memasukkan `attachment_path` dan `attachment_type`.

4. `AdminSettingsController@update`:
   variabel `oldSettings` diambil setelah update, sehingga snapshot before/after tidak akurat.

5. `AdminWeighingController` mengembalikan field yang tidak ada di schema migration aktif:
   `bb_u_status`, `tb_u_status`, `bb_tb_status`, `imt_u_status`, `muac_status`.

6. `ChildController@update` memanggil `$child->update($validated)` dua kali (duplikasi).

7. `.gitignore` mengabaikan folder `docs`:
   dokumentasi sebaiknya disimpan di `dokumentasi/` atau update rule ignore.

8. `bootstrap/app.php` meng-append `CheckMaintenanceMode` global dan juga menyediakan alias middleware.
   Tidak salah fatal, tapi eksekusi global bisa membuat behavior maintenance selalu aktif untuk semua route API/web non-admin.

## 5. Risiko Operasional

1. Integrasi n8n jika down:
   fitur NutriAssist fallback tersedia, tapi broadcast WA bisa gagal.
2. Mailer jika belum dikonfigurasi:
   forgot password tidak benar-benar terkirim walau response tetap sukses generik.
3. Token expiration Sanctum 120 menit:
   user bisa sering re-login jika frontend tidak menangani refresh flow.

## 6. Rekomendasi Prioritas Perbaikan

1. Perbaiki mismatch `password_reset_tokens` (email vs phone).
2. Perbaiki bug attachment konsultasi kader.
3. Rapikan field response `AdminWeighingController` sesuai schema.
4. Tambah test backend untuk endpoint kritis:
   auth, weighing/z-score, konsultasi, settings.
5. Tambah health checks integrasi n8n dan mail transport.

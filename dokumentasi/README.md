# Dokumentasi Lengkap NutriLogic

Dokumentasi ini disusun untuk membantu onboarding ulang project NutriLogic secara menyeluruh.

## Daftar Dokumen

1. `00-ringkasan-proyek.md`  
   Ringkasan cepat: domain, peran user, fitur inti, alur bisnis utama.

2. `01-arsitektur-teknologi.md`  
   Arsitektur sistem, stack, middleware, service layer, keamanan auth.

3. `02-skema-database.md`  
   Struktur tabel, relasi, enum penting, dan catatan data model.

4. `03-api-reference.md`  
   Peta endpoint API lengkap per grup (`public`, `parent`, `kader`, `admin`) beserta parameter inti.

5. `04-aturan-bisnis.md`  
   Business rules inti: status gizi, early warning, PMT priority, poin & badge, konsultasi, maintenance mode.

6. `05-frontend-routing.md`  
   Pemetaan route frontend React, pembagian halaman per role, dan integrasi API client.

7. `06-setup-run-deploy.md`  
   Panduan setup lokal, build, test, dan opsi deployment Docker ringan.

8. `07-testing-observability-known-issues.md`  
   Status testing, logging/monitoring, serta daftar issue teknis yang perlu diperhatikan.

9. `parameter-kekurangan-gizi.md`  
   Dokumen detail parameter antropometri, z-score, klasifikasi status, risk flags.

10. `parameter-modul-kesehatan.md`  
    Dokumen detail field validasi modul data anak, jurnal makan, PMT, vitamin, imunisasi, NutriAssist.

## Tujuan

Dengan paket dokumen ini, kamu bisa:

- cepat ingat ulang arsitektur dan flow project,
- tahu endpoint mana untuk tiap modul,
- tahu field apa saja yang dipakai sistem,
- tahu bagian mana yang masih perlu perbaikan teknis.

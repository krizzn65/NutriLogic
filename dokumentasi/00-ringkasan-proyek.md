# Ringkasan Proyek NutriLogic

## 1. Apa itu NutriLogic

NutriLogic adalah platform monitoring kesehatan dan gizi balita berbasis web (SPA) untuk ekosistem Posyandu.  
Fokus utama:

1. Pencatatan data anak dan pengukuran berkala.
2. Perhitungan status gizi otomatis (Z-score).
3. Early warning anak berisiko.
4. Kolaborasi orang tua-kader-admin.

## 2. Role Pengguna

1. `ibu` (orang tua):
   Pantau data anak, jurnal makan, PMT, konsultasi, NutriAssist, gamification.
2. `kader`:
   Input data lapangan (penimbangan massal, vitamin, imunisasi, jadwal), broadcast, laporan.
3. `admin`:
   Manajemen posyandu, user, monitoring sistem, audit log, reporting global.

## 3. Modul Utama

1. `Auth & Session`:
   Registrasi, login, logout, forgot/reset password, single-session token.
2. `Master Data`:
   Posyandu, user, data anak.
3. `Kesehatan Anak`:
   Weighing logs, meal logs, PMT logs, imunisasi, vitamin, jadwal.
4. `Konsultasi`:
   Chat orang tua dan kader dengan attachment gambar.
5. `NutriAssist`:
   Rekomendasi menu dari bahan makanan (AI via n8n, fallback lokal).
6. `Gamification`:
   Poin aktivitas dan badge otomatis.
7. `Broadcast & Notifikasi`:
   Pengumuman kader ke orang tua, notifikasi in-app.
8. `Reporting`:
   Laporan kader (summary/history/export) dan laporan admin lintas posyandu.

## 4. Alur Bisnis Inti (High-Level)

1. Anak terdaftar ke parent + posyandu.
2. Kader/ibu input penimbangan.
3. Sistem hitung `zscore_wfa`, `zscore_hfa`, `zscore_wfh` dan `nutritional_status`.
4. Sistem tandai anak berisiko (status buruk, tren turun, no update).
5. Orang tua tindak lanjut melalui jurnal makan, PMT, dan konsultasi.
6. Kader memantau prioritas intervensi dan menyebarkan info/broadcast.
7. Admin melihat tren lintas posyandu dan aktivitas sistem.

## 5. Batas Domain Data

Domain saat ini mencakup:

1. Balita usia 0-60 bulan (validasi banyak endpoint diarahkan ke rentang ini).
2. Pengukuran antropometri dasar (BB/TB/LILA/Lingkar Kepala).
3. Imunisasi dan vitamin berbasis event posyandu.
4. PMT harian berbasis status konsumsi.

## 6. Catatan Penting Saat Re-Onboarding

1. Ini aplikasi SPA React di atas Laravel API.
2. Auth API menggunakan Sanctum token bearer.
3. Ada integrasi eksternal n8n untuk NutriAssist dan broadcast WhatsApp.
4. Maintenance mode bisa menutup akses non-admin secara global.

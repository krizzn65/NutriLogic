# NutriLogic - Dokumentasi Proyek

## 📋 Daftar Isi
1. [Posisi NutriLogic](#posisi-nutrilogic)
2. [Fitur Utama untuk Orang Tua](#fitur-utama-untuk-orang-tua)
3. [Fitur Utama untuk Kader/Admin Posyandu](#fitur-utama-untuk-kaderadmin-posyandu)
4. [Struktur Landing Page](#struktur-landing-page)

---

## 🎯 Posisi NutriLogic

### Perbandingan dengan MoriSmart Lama

**MoriSmart Lama:**
- Hanya pencatat berat/tinggi (CRUD sederhana)

**NutriLogic:**
- **Asisten gizi digital** yang lebih komprehensif
- Fokus pada dua hal utama:

#### 1. Smart Monitoring Tumbuh Kembang
- Otomatis hitung status gizi
- Perhitungan Z-score WHO secara otomatis
- Update real-time setiap ada data baru

#### 2. Digital Nutrition / Nutri-Assist
- Bantu orang tua ambil keputusan soal makanan
- Bukan cuma input data, tapi memberikan rekomendasi gizi
- Sistem rekomendasi menu/MPASI yang sesuai kebutuhan gizi anak

---

## 👨‍👩‍👧 Fitur Utama untuk Orang Tua (User Publik)

**Fokus:** Monitoring + Edukasi + Dorong Perilaku Baik

### 1. Dashboard Pertumbuhan Anak

- **Grafik KMS Digital**
  - Update otomatis setiap ada data baru
  - Visualisasi pertumbuhan yang mudah dipahami
  
- **Status Gizi Otomatis**
  - Dihitung otomatis (bukan diketik manual)
  - Klasifikasi: pendek/sangat pendek/normal
  - Berdasarkan standar WHO

### 2. Nutri-Scanner / Nutri-Assist (Inovasi Kunci)

- **Input Bahan Makanan**
  - Orang tua input bahan makanan yang ada di rumah
  
- **Rekomendasi Menu/MPASI**
  - Sistem kasih rekomendasi menu yang sesuai gizi anak
  - Menguatkan aspek "Digital Nutrition"
  - Personalisasi berdasarkan kebutuhan anak

### 3. Gamifikasi "Stunting Fighter"

**Sistem Poin & Badge untuk:**
- ✅ Rutin update data
- ✅ Baca artikel edukasi
- ✅ Patuh jadwal posyandu

**Tujuan:** Bikin orang tua betah & engaged dengan platform

### 4. Konsultasi / Chat dengan Kader

- Tanya jawab singkat seputar:
  - Gizi anak
  - Jadwal posyandu
  - Keluhan anak
- Komunikasi langsung dengan kader terpercaya

### 5. Reminder Kesehatan

- **Notifikasi untuk:**
  - Imunisasi
  - Vitamin
  - Jadwal posyandu
  
- **Channel Notifikasi:**
  - WhatsApp
  - In-app notification
  - (Minimal konsep/simulasi dulu)

---

## 👩‍⚕️ Fitur Utama untuk Kader / Admin Posyandu

**Fokus:** Efisiensi Kerja + Analitik + Deteksi Dini

### 1. Manajemen Data Posyandu

- **CRUD Lengkap:**
  - Data anak
  - Data orang tua
  - Data posyandu
  - Jadwal kegiatan
  
- **Satu Panel untuk Kelola Semua**
  - Dashboard terpusat
  - Manajemen data yang efisien

### 2. Input Massal (Bulk Input) Hari H Posyandu

- Form atau tampilan khusus untuk input banyak anak sekaligus
- Hemat waktu di lapangan
- Optimasi workflow saat posyandu berlangsung

### 3. Early Warning System

**Sistem Auto-Flag Anak Berisiko:**

- ⚠️ Grafik turun
- ⚠️ Status gizi memburuk
- ⚠️ Jarang datang posyandu / jarang update

**Fitur:**
- Muncul di dashboard prioritas
- Untuk intervensi cepat
- Deteksi dini masalah gizi

### 4. Reporting & Export

- **Laporan:**
  - Bulanan/periodik
  - Export ke PDF/Excel
  - Bisa disetor ke puskesmas/desa
  
- **Analitik:**
  - Statistik posyandu
  - Trend pertumbuhan anak
  - Data untuk evaluasi program

### 5. Broadcast Informasi

- Kirim info jadwal posyandu
- Pengumuman penting
- Ke semua orang tua terdaftar
- Komunikasi massal yang efisien

---

## 🏠 Struktur Landing Page

Biar juri langsung "ngeh" value NutriLogic:

### 1. Hero Section

- **Headline:** 
  - Cegah stunting + generasi emas
  
- **Subheadline:**
  - Solusi cerdas monitoring + rekomendasi gizi
  
- **CTA (Call to Action):**
  - "Cek status gizi"
  - "Gabung Posyandu Digital"

### 2. Problem & Solution

- **Stat Singkat Stunting Indonesia**
  - Data prevalensi stunting
  - Dampak terhadap generasi
  
- **NutriLogic sebagai Jawaban**
  - Monitoring otomatis
  - AI nutrition assistance
  - Solusi komprehensif

### 3. Fitur Unggulan (Card)

Tampilkan dalam bentuk card yang menarik:

- 📊 **Smart Monitoring**
- 🍎 **Nutri-Assist**
- ⚠️ **Early Detection**
- 📚 **Edukasi Terintegrasi**

### 4. How It Works

**Step-by-step proses:**

1. **Step 1:** Daftar
2. **Step 2:** Input data
3. **Step 3:** Dapatkan analisis & rekomendasi

### 5. Trust Section

- **Counter:**
  - Jumlah anak terdaftar
  - Jumlah kader aktif
  - (Dummy data untuk MVP)
  
- **Testimoni:**
  - Testimoni ibu
  - Testimoni kader
  - Social proof

### 6. CTA Akhir + Footer

- **Ajakan Daftar:**
  - CTA yang jelas dan menarik
  
- **Footer:**
  - Link cepat
  - Kontak
  - Sosial media
  - GitHub repository

---

## 🚀 Teknologi & Implementasi

### Backend
- Laravel Framework
- Database migrations untuk struktur data
- API endpoints untuk komunikasi frontend-backend

### Frontend
- React/Vue.js (berdasarkan struktur project)
- Tailwind CSS untuk styling
- Vite untuk build tool

### Fitur Teknis
- Authentication & Authorization (Sanctum)
- CORS configuration
- RESTful API

---

## 📝 Catatan Pengembangan

- Fokus pada user experience untuk orang tua
- Optimasi workflow untuk kader posyandu
- Integrasi dengan sistem kesehatan yang ada
- Skalabilitas untuk banyak posyandu

---

**Dokumen ini akan terus diupdate seiring perkembangan proyek NutriLogic.**

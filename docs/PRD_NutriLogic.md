# Product Requirements Document (PRD)
# NutriLogic - Sistem Monitoring Kesehatan & Gizi Balita Terpadu

---

 ## 📋 Informasi Dokumen

| Informasi | Detail |
|-----------|--------|
| **Nama Produk** | NutriLogic |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 9 Desember 2024 |
| **Status** | Active Development |
| **Tim Pengembang** | Krisna Panca Dewa, Devantara Adani Nazal, Azrieal Akbar Zackiansyah |

---

## 1. Ringkasan Eksekutif

### 1.1 Tujuan Produk
**NutriLogic** adalah platform digital inovatif yang dirancang untuk membantu **Posyandu**, **Kader Kesehatan**, dan **Orang Tua** dalam memantau tumbuh kembang dan status gizi balita secara real-time. Platform ini mempermudah pendataan, analisis, dan pengambilan keputusan untuk mencegah stunting dan masalah gizi lainnya.

### 1.2 Masalah yang Diselesaikan
- **Pencatatan Manual Tidak Efisien**: Posyandu masih menggunakan sistem pencatatan manual yang rentan kesalahan dan sulit diakses
- **Kurangnya Deteksi Dini**: Tidak ada sistem peringatan otomatis untuk anak yang berisiko stunting
- **Minim Edukasi Gizi**: Orang tua kesulitan mendapat informasi dan rekomendasi gizi yang tepat untuk anak
- **Data Tidak Terpusat**: Data kesehatan anak tersebar dan sulit dianalisis

### 1.3 Solusi
NutriLogic menyediakan:
1. **Smart Monitoring Tumbuh Kembang** - Otomatis hitung status gizi dengan Z-score WHO
2. **Digital Nutrition (Nutri-Assist)** - Rekomendasi menu/MPASI sesuai kebutuhan gizi anak
3. **Early Warning System** - Deteksi dini dan auto-flag anak berisiko
4. **Digitalisasi Posyandu** - Transformasi pencatatan manual ke sistem digital

---

## 2. Target Pengguna

### 2.1 User Personas

#### 👨‍👩‍👧 Orang Tua Balita
| Atribut | Detail |
|---------|--------|
| **Demografi** | Orang tua dengan anak balita (0-5 tahun) |
| **Kebutuhan** | Memantau pertumbuhan anak, mendapat rekomendasi gizi yang tepat |
| **Pain Points** | Sulit memahami status gizi anak, bingung menu yang tepat |
| **Goals** | Anak tumbuh sehat, terhindar dari stunting |

#### 👩‍⚕️ Kader Posyandu
| Atribut | Detail |
|---------|--------|
| **Demografi** | Relawan kesehatan di posyandu |
| **Kebutuhan** | Efisiensi pencatatan data, deteksi anak berisiko |
| **Pain Points** | Input data manual memakan waktu, sulit tracking anak bermasalah |
| **Goals** | Posyandu terkelola dengan baik, intervensi cepat pada anak berisiko |

#### 🏥 Super Admin
| Atribut | Detail |
|---------|--------|
| **Demografi** | Administrator sistem/Dinas Kesehatan |
| **Kebutuhan** | Monitoring keseluruhan posyandu, laporan agregat |
| **Pain Points** | Data tersebar, sulit membuat laporan komprehensif |
| **Goals** | Overview sistematis kesehatan balita di wilayahnya |

---

## 3. Fitur Produk

### 3.1 Fitur untuk Orang Tua

#### 📱 Dashboard Pertumbuhan Anak
- Grafik KMS Digital dengan update otomatis
- Visualisasi pertumbuhan yang mudah dipahami
- Status gizi otomatis (dihitung berdasarkan standar WHO)
- Klasifikasi: Normal, Pendek, Sangat Pendek, Kurus, Gemuk, dll.

#### 🍎 Nutri-Assist (AI Nutrition)
- Input bahan makanan yang tersedia di rumah
- Rekomendasi menu/MPASI yang sesuai kebutuhan gizi anak
- Personalisasi berdasarkan usia dan status gizi anak
- Tips kesehatan dari ahli

#### 📓 Jurnal Makan Digital
- Catat asupan makanan harian anak
- Analisis nutrisi otomatis
- Reminder waktu makan

#### 🏆 Gamifikasi "Stunting Fighter"
- Sistem poin & badge untuk:
  - Rutin update data
  - Membaca artikel edukasi
  - Patuh jadwal posyandu
- Leaderboard komunitas
- Motivasi pencapaian target

#### 💬 Konsultasi dengan Kader
- Tanya jawab seputar gizi anak
- Informasi jadwal posyandu
- Diskusi keluhan anak

#### 🔔 Reminder Kesehatan
- Notifikasi imunisasi
- Reminder vitamin
- Pengingat jadwal posyandu

---

### 3.2 Fitur untuk Kader Posyandu

#### 📋 Manajemen Data Terpadu
- CRUD data anak, orang tua, dan posyandu
- Dashboard statistik real-time
- Satu panel untuk kelola semua data

#### 📝 Input Massal (Bulk Input)
- Form khusus untuk input banyak anak sekaligus
- Optimasi workflow saat hari H posyandu
- Hemat waktu di lapangan

#### ⚠️ Early Warning System
- Auto-flag anak berisiko:
  - Grafik pertumbuhan turun
  - Status gizi memburuk
  - Jarang datang posyandu
- Dashboard prioritas untuk intervensi cepat
- Notifikasi real-time

#### 📊 Reporting & Analytics
- Laporan bulanan/periodik
- Export ke PDF/Excel
- Visualisasi data interaktif
- Statistik per posyandu

#### 📢 Broadcast & Konsultasi
- Kirim pengumuman ke orang tua
- Konsultasi virtual dengan orang tua
- Reminder jadwal posyandu otomatis

---

### 3.3 Fitur untuk Super Admin

#### 🏢 Manajemen Posyandu
- Kelola data posyandu seluruh wilayah
- Manajemen kader dan pengguna
- Kontrol akses dan aktivitas

#### 📈 System Reports
- Laporan sistem dengan filter per posyandu
- Filter rentang waktu fleksibel
- Trend pertumbuhan agregat

#### 👥 User Management
- Role-Based Access Control
- Audit trail aktivitas pengguna
- Management approval untuk registrasi

#### ⚙️ System Settings
- Konfigurasi maintenance mode
- Pengaturan global aplikasi
- Monitoring online status real-time

---

## 4. Spesifikasi Teknis

### 4.1 Technology Stack

#### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Laravel | 11.x | PHP Framework untuk REST API |
| MySQL | 8.0 | Relational Database |
| Sanctum | - | API Authentication |
| Queue Jobs | - | Background Processing |

#### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.x | Modern UI Library |
| React Router | - | Navigation |
| Tailwind CSS | 3.x | Utility-First Styling |
| Recharts | - | Data Visualization |
| Framer Motion | - | Smooth Animations |
| Lucide Icons | - | Icon Library |

### 4.2 System Requirements
- PHP >= 8.2
- Node.js >= 18.x
- MySQL >= 8.0
- Composer
- Git

### 4.3 Key Features
- Real-time Caching untuk instant page transitions
- Responsive Design (Mobile-first approach)
- PWA Ready (Progressive Web App capabilities)
- Role-Based Access Control (Multi-user system)

---

## 5. Visualisasi Data

### 5.1 Dashboard Interaktif

#### 🎨 Distribusi Status Gizi
Pie chart dengan color coding:
- 🟢 **Hijau** - Normal
- 🟡 **Kuning** - Kurang, Pendek, Kurus, Lebih
- 🔴 **Merah** - Sangat Kurang, Sangat Pendek, Sangat Kurus, Gemuk

#### 📈 Tren Penimbangan Bulanan
- Area chart dengan smooth gradient
- Interactive tooltip
- Auto-refresh monthly data
- Tampilan 12 bulan terakhir

#### 📅 Statistik Bulanan
Bar chart menunjukkan:
- Anak Ditimbang (Unique children per bulan)
- Total Penimbangan (Total weighing sessions)
- Filter per Posyandu

#### 🏥 Top Risk Posyandu
- Identifikasi posyandu dengan anak berisiko tertinggi
- Prioritas intervensi

### 5.2 Color Palette Status Gizi

| Status | Warna | Hex Code |
|--------|-------|----------|
| Normal | Hijau | `#10B981` |
| Kurang | Kuning Gelap | `#FDC700` |
| Pendek | Kuning Cerah | `#FFE06D` |
| Kurus | Khaki | `#D9C990` |
| Lebih | Krem | `#FFF8D2` |
| Sangat Kurang | Merah Gelap | `#F43F5E` |
| Sangat Pendek | Merah Sedang | `#FE7189` |
| Sangat Kurus | Pink | `#FB9FAF` |
| Gemuk | Pink Terang | `#FFCCD5` |

---

## 6. Struktur Aplikasi

### 6.1 Arsitektur

```
NutriLogic/
├── app/
│   ├── Http/Controllers/     # API Controllers
│   ├── Models/                # Eloquent Models
│   └── Services/              # Business Logic Services
├── database/
│   ├── migrations/            # Database Migrations
│   └── seeders/               # Data Seeders
├── resources/
│   ├── js/
│   │   ├── components/        # React Components
│   │   ├── contexts/          # React Contexts
│   │   └── lib/               # Utilities & API Client
│   └── views/                 # Blade Templates
├── routes/
│   ├── api.php                # API Routes
│   └── web.php                # Web Routes
└── public/                    # Public Assets
```

### 6.2 User Roles & Access

| Role | Akses |
|------|-------|
| Super Admin | Full access, manajemen sistem |
| Kader | Data posyandu sendiri, manajemen anak & orang tua |
| Orang Tua | Data anak sendiri, jurnal, konsultasi |

---

## 7. Roadmap & Prioritas

### Phase 1: MVP (Current)
- ✅ Authentication & Authorization
- ✅ CRUD data anak, orang tua, posyandu
- ✅ Dashboard kader dengan statistik
- ✅ Dashboard orang tua dengan grafik pertumbuhan
- ✅ Perhitungan status gizi otomatis (Z-score WHO)
- ✅ Early Warning System
- ✅ Jurnal Makan Digital
- ✅ PMT Tracker

### Phase 2: Enhancement
- 🔄 Nutri-Assist AI (Rekomendasi menu)
- 🔄 Gamifikasi lengkap
- 🔄 Push notification
- 🔄 Export laporan PDF/Excel

### Phase 3: Scale
- 📋 Multi-wilayah support
- 📋 Integrasi WhatsApp notification
- 📋 Mobile app (React Native)
- 📋 Integrasi dengan sistem puskesmas

---

## 8. Success Metrics

### 8.1 Key Performance Indicators (KPIs)

| Metric | Target | Deskripsi |
|--------|--------|-----------|
| User Adoption | >80% | Persentase orang tua aktif di posyandu yang menggunakan app |
| Data Entry Time | -50% | Pengurangan waktu input data oleh kader |
| Early Detection | >90% | Akurasi deteksi anak berisiko |
| User Engagement | >70% | Persentase user yang login minimal 1x/minggu |
| Data Accuracy | >95% | Akurasi perhitungan status gizi |

### 8.2 Adoption Goals
- 1000+ anak terdaftar dalam 6 bulan
- 50+ posyandu aktif
- 100+ kader menggunakan sistem

---

## 9. Lampiran

### 9.1 Default Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@admin.com | password |
| Kader | kader@kader.com | password |
| Orang Tua | ibu@ibu.com | password |

### 9.2 Repository
- **GitHub**: https://github.com/krizzn65/NutriLogic

### 9.3 Related Documents
- DOCKER.md - Panduan deployment dengan Docker
- NOTIFICATION_SYSTEM_KADER.md - Dokumentasi sistem notifikasi
- REALTIME_ONLINE_STATUS.md - Dokumentasi status online real-time

---

## 10. Changelog

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 9 Des 2024 | Initial PRD release |

---

> **NutriLogic** - *Solusi Digital untuk Meningkatkan Kualitas Kesehatan Balita Indonesia* 🍼✨

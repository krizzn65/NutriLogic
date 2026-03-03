<div align="center">
  
  <img src="./resources/js/assets/logo_scroll.svg" alt="NutriLogic Logo" width="400"/>
  
  <h1>🍼 NutriLogic</h1>
  <p><strong>Sistem Monitoring Kesehatan & Gizi Balita Terpadu</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel"/>
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
    <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  </p>

  <p>
    <em>Solusi Digital untuk Meningkatkan Kualitas Kesehatan Balita Indonesia</em>
  </p>

</div>

---

## 📖 Tentang NutriLogic

**NutriLogic** adalah platform digital inovatif yang dirancang untuk membantu **Posyandu**, **Kader Kesehatan**, dan **Orang Tua** dalam memantau tumbuh kembang dan status gizi balita secara real-time. Dengan teknologi modern dan antarmuka yang intuitif, NutriLogic mempermudah pendataan, analisis, dan pengambilan keputusan untuk mencegah stunting dan masalah gizi lainnya.

### 🎯 Misi Kami

-   🏥 **Digitalisasi Posyandu** - Transformasi dari pencatatan manual ke sistem digital yang efisien
-   📊 **Early Detection** - Deteksi dini masalah gizi melalui sistem peringatan otomatis
-   👨‍👩‍👧‍👦 **Pemberdayaan Orang Tua** - Memberikan akses informasi dan edukasi gizi yang mudah dipahami
-   📈 **Data-Driven Decisions** - Laporan dan visualisasi data untuk evaluasi program kesehatan

---

## ✨ Fitur Utama

### 👩‍⚕️ **Untuk Kader Posyandu**

<table>
  <tr>
    <td width="50%">
      <h4>📋 Manajemen Data Terpadu</h4>
      <ul>
        <li>CRUD data anak, orang tua, dan posyandu</li>
        <li>Input massal untuk efisiensi hari H posyandu</li>
        <li>Dashboard statistik real-time</li>
      </ul>
    </td>
    <td width="50%">
      <h4>⚠️ Early Warning System</h4>
      <ul>
        <li>Auto-flag anak berisiko stunting</li>
        <li>Deteksi penurunan grafik pertumbuhan</li>
        <li>Notifikasi anak yang jarang datang</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h4>📊 Reporting & Analytics</h4>
      <ul>
        <li>Laporan bulanan/periodik</li>
        <li>Export ke PDF/Excel</li>
        <li>Visualisasi data interaktif</li>
      </ul>
    </td>
    <td>
      <h4>📢 Broadcast & Konsultasi</h4>
      <ul>
        <li>Kirim pengumuman ke orang tua</li>
        <li>Konsultasi virtual dengan orang tua</li>
        <li>Reminder jadwal posyandu otomatis</li>
      </ul>
    </td>
  </tr>
</table>

### 👨‍👩‍👧 **Untuk Orang Tua**

<table>
  <tr>
    <td width="50%">
      <h4>📱 Dashboard Personal</h4>
      <ul>
        <li>Riwayat tumbuh kembang anak</li>
        <li>Grafik pertumbuhan interaktif</li>
        <li>Status gizi real-time</li>
      </ul>
    </td>
    <td width="50%">
      <h4>🍎 NutriAssist AI</h4>
      <ul>
        <li>Rekomendasi menu gizi personal</li>
        <li>Saran pola makan sesuai usia</li>
        <li>Tips kesehatan dari ahli</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h4>📓 Jurnal Makan Digital</h4>
      <ul>
        <li>Catat asupan harian anak</li>
        <li>Analisis nutrisi otomatis</li>
        <li>Reminder waktu makan</li>
      </ul>
    </td>
    <td>
      <h4>🎮 Gamification</h4>
      <ul>
        <li>Sistem poin & badge</li>
        <li>Motivasi pencapaian target</li>
        <li>Leaderboard komunitas</li>
      </ul>
    </td>
  </tr>
</table>

### 🔐 **Untuk Super Admin**

-   🏢 **Manajemen Posyandu** - Kelola data posyandu, kader, dan pengguna
-   📊 **System Reports** - Laporan sistem dengan filter per posyandu & rentang waktu
-   👥 **User Management** - Kontrol akses dan aktivitas pengguna
-   🔍 **Activity Logs** - Audit trail untuk keamanan sistem
-   ⚙️ **System Settings** - Konfigurasi maintenance mode dan pengaturan global

---

## 📊 Visualisasi Data

NutriLogic dilengkapi dengan **dashboard interaktif** dan **visualisasi data** yang memudahkan analisis:

### 🎨 **Distribusi Status Gizi**

Pie chart dan grid dengan gradasi warna kustom untuk membedakan status gizi:

-   **Hijau** 🟢 Normal
-   **Kuning** 🟡 Kurang, Pendek, Kurus, Lebih (gradasi dari gelap ke terang)
-   **Merah** 🔴 Sangat Kurang, Sangat Pendek, Sangat Kurus, Gemuk (gradasi dari gelap ke terang)

### 📈 **Tren Penimbangan Bulanan**

Area chart menampilkan tren penimbangan dalam 12 bulan terakhir dengan:

-   Smooth gradient visualization
-   Interactive tooltip
-   Auto-refresh monthly data

### 📅 **Statistik Bulanan**

Bar chart yang menunjukkan:

-   **Anak Ditimbang** (Unique children per bulan)
-   **Total Penimbangan** (Total weighing sessions)
-   Filter per Posyandu atau view semua data

### 🏥 **Top Risk Posyandu**

Identifikasi posyandu dengan anak berisiko tertinggi untuk prioritas intervensi.

---

## 🛠️ Teknologi

### Backend

-   **Laravel 11.x** - PHP Framework untuk REST API
-   **MySQL 8.0** - Relational Database
-   **Sanctum** - API Authentication
-   **Queue Jobs** - Background Processing

### Frontend

-   **React 18.x** - Modern UI Library
-   **React Router** - Navigation
-   **Tailwind CSS** - Utility-First Styling
-   **Recharts** - Data Visualization
-   **Framer Motion** - Smooth Animations
-   **Lucide Icons** - Beautiful Icons

### Features

-   **Real-time Caching** - Instant page transitions
-   **Responsive Design** - Mobile-first approach
-   **PWA Ready** - Progressive Web App capabilities
-   **Role-Based Access Control** - Secure multi-user system

---

## 🚀 Instalasi

### Prerequisites

```bash
- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL >= 8.0
- Git
```

### Quick Start

1. **Clone Repository**

```bash
git clone https://github.com/krizzn65/NutriLogic.git
cd NutriLogic
```

2. **Install Dependencies**

```bash
# Backend
composer install

# Frontend
npm install
```

3. **Environment Setup**

```bash
cp .env.example .env
php artisan key:generate
```

4. **Database Configuration**

Edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutrilogic
DB_USERNAME=root
DB_PASSWORD=
```

5. **Migrate & Seed**

```bash
php artisan migrate --seed
```

6. **Build Assets**

```bash
npm run build
# atau untuk development
npm run dev
```

7. **Run Server**

```bash
php artisan serve
```

Akses aplikasi di `http://localhost:8000`

### **Akun Seed (Security Note)**

-   Seeder membuat akun contoh untuk pengujian lokal.
-   Password default tidak ditampilkan di dokumentasi.
-   Setelah seed, lakukan reset password melalui panel admin atau flow forgot password sebelum digunakan.

---

## 📁 Struktur Proyek

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

---

## 🎨 Design System

### Color Palette

**Status Gizi:**

-   `#10B981` - Normal (Hijau)
-   `#FDC700` - Kurang (Kuning Gelap)
-   `#FFE06D` - Pendek (Kuning Cerah)
-   `#D9C990` - Kurus (Khaki)
-   `#FFF8D2` - Lebih (Krem)
-   `#F43F5E` - Sangat Kurang (Merah Gelap)
-   `#FE7189` - Sangat Pendek (Merah Sedang)
-   `#FB9FAF` - Sangat Kurus (Pink)
-   `#FFCCD5` - Gemuk (Pink Terang)

---

## 📱 Screenshots

_(Tambahkan screenshots aplikasi Anda di sini)_

---

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 👥 Tim Pengembang

1. Krisna Panca Dewa
2. Devantara Adani Nazal
3. Azrieal Akbar Zackiansyah

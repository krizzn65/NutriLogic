# 🐳 Docker Setup Guide - NutriLogic

Panduan lengkap untuk menjalankan aplikasi NutriLogic menggunakan Docker.

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstal:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (untuk Windows/Mac)
- Docker Compose (biasanya sudah termasuk dalam Docker Desktop)

## 🚀 Langkah-langkah Setup

### 1. Clone atau Buka Project
```bash
cd D:\Aplikasi\NutriLogic
```

### 2. Siapkan Environment File
Salin file `.env.example` menjadi `.env` atau buat `.env` baru:
```bash
copy .env.example .env
```

Edit `.env` dan sesuaikan konfigurasi database:
```env
APP_NAME=NutriLogic
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=nutrilogic
DB_USERNAME=nutrilogic_user
DB_PASSWORD=nutrilogic_password
```

### 3. Build Docker Image
```bash
docker-compose build
```

Proses ini akan:
- ✅ Menginstall dependencies Node.js
- ✅ Build assets frontend (Vite)
- ✅ Menginstall dependencies PHP (Composer)
- ✅ Setup Nginx dan PHP-FPM

### 4. Jalankan Container
```bash
docker-compose up -d
```

Flag `-d` menjalankan container di background (detached mode).

### 5. Generate Application Key
```bash
docker-compose exec app php artisan key:generate
```

### 6. Jalankan Migration & Seeder
```bash
docker-compose exec app php artisan migrate --seed
```

### 7. Setup Storage Link
```bash
docker-compose exec app php artisan storage:link
```

### 8. Optimize Laravel
```bash
docker-compose exec app php artisan optimize
```

## 🌐 Akses Aplikasi

Setelah semua container berjalan, akses aplikasi di:

- **Aplikasi Utama**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080
  - Server: `db`
  - Username: `nutrilogic_user`
  - Password: `nutrilogic_password`

## 📝 Perintah-Perintah Penting

### Melihat Status Container
```bash
docker-compose ps
```

### Melihat Logs
```bash
# Semua logs
docker-compose logs -f

# Logs aplikasi saja
docker-compose logs -f app

# Logs database
docker-compose logs -f db
```

### Menghentikan Container
```bash
docker-compose down
```

### Menghentikan dan Menghapus Volume (Database)
```bash
docker-compose down -v
```

### Masuk ke Container
```bash
# Masuk ke container aplikasi
docker-compose exec app sh

# Masuk ke container database
docker-compose exec db sh
```

### Menjalankan Artisan Command
```bash
docker-compose exec app php artisan <command>

# Contoh:
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan cache:clear
```

### Rebuild Container
Jika ada perubahan di `Dockerfile` atau `docker-compose.yml`:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Troubleshooting

### Permission Issues (Linux/Mac)
```bash
docker-compose exec app chown -R www-data:www-data /var/www/html/storage
docker-compose exec app chmod -R 755 /var/www/html/storage
```

### Database Connection Error
Pastikan:
1. Container `db` sudah running: `docker-compose ps`
2. Konfigurasi `.env` menggunakan `DB_HOST=db`
3. Tunggu beberapa detik setelah container pertama kali jalan

### Port Already in Use
Jika port 8000 atau 8080 sudah digunakan, edit `docker-compose.yml`:
```yaml
ports:
  - "9000:80"  # Ubah 8000 menjadi port lain
```

## 📦 Struktur File Docker

```
NutriLogic/
├── docker/
│   ├── nginx.conf          # Konfigurasi Nginx
│   ├── default.conf        # Virtual host Laravel
│   ├── supervisord.conf    # Supervisor (PHP-FPM + Nginx)
│   └── php.ini            # Konfigurasi PHP
├── Dockerfile             # Image definition
├── docker-compose.yml     # Services orchestration
└── .dockerignore         # Files to exclude from image
```

## 🚢 Deploy to Production

### 1. Build Production Image
```bash
docker build -t nutrilogic:latest .
```

### 2. Push ke Docker Hub (Optional)
```bash
docker tag nutrilogic:latest yourusername/nutrilogic:latest
docker push yourusername/nutrilogic:latest
```

### 3. Deploy ke Server
Upload `docker-compose.yml` ke server, lalu:
```bash
docker-compose pull
docker-compose up -d
```

## ⚠️ Catatan Penting

1. **Jangan commit `.env`** ke Git
2. **Backup database** sebelum menjalankan `docker-compose down -v`
3. **Ubah password database** di production
4. **Disable phpMyAdmin** di production (hapus service dari docker-compose.yml)
5. **Set `APP_DEBUG=false`** di production

## 📚 Referensi

- [Docker Documentation](https://docs.docker.com/)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Docker Compose](https://docs.docker.com/compose/)

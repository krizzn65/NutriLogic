# Frontend Routing & Struktur UI

## 1. Entry Point

1. Blade host: `resources/views/app.blade.php`.
2. React mount: `resources/js/app.jsx`.
3. Router root: `resources/js/components/App.jsx`.

## 2. Route Top-Level

1. `/` -> Landing page.
2. `/auth` -> login/register switch.
3. `/forgot-password` -> reset password flow.
4. `/dashboard/*` -> shell role-based.
5. `/500` -> server error page.
6. `*` -> 404 page.

## 3. Shell Dashboard Role-Based

`PageUtama.jsx` memilih container berdasarkan `user.role`:

1. `admin` -> `Admin.jsx`.
2. `kader` -> `Kader.jsx`.
3. default (`ibu`) -> `OrangTua.jsx`.

Ada `SessionMonitor` wrapper dan cek maintenance untuk non-admin.

## 4. Route UI per Role

### 4.1 Orang Tua (`OrangTua.jsx`)

1. index -> dashboard orang tua.
2. `anak`, `anak/tambah`, `anak/edit/:id`, `anak/:id`.
3. `nutri-assist`.
4. `jurnal-makan`.
5. `konsultasi`, `konsultasi/create`, `konsultasi/:id`.
6. `gamification`.
7. `riwayat`.

### 4.2 Kader (`Kader.jsx`)

1. index -> dashboard kader.
2. `data-anak`, `data-anak/tambah`, `data-anak/edit/:id`, `data-anak/:id`.
3. `kegiatan` (penimbangan massal).
4. `anak-prioritas`, `antrian-prioritas`.
5. `jadwal`, `jadwal/tambah`.
6. `konsultasi`, `konsultasi/:id`.
7. `laporan`.
8. `broadcast`.
9. `profile`.

### 4.3 Admin (`Admin.jsx`)

1. index -> dashboard admin.
2. `posyandu`.
3. `kader`, `orang-tua`.
4. `anak`.
5. `laporan`.
6. `settings`.
7. `logs`.
8. `profile`.

## 5. API Client Frontend

File utama:

1. `resources/js/lib/api.js`:
   axios instance base `/api`.
2. request interceptor:
   inject bearer token dari localStorage.
3. response interceptor:
   auto clear token + redirect `/auth` saat `401`.
4. helper auth:
   `resources/js/lib/auth.js`.

## 6. UI Context dan State Pendukung

1. `DataCacheContext`: cache data dashboard/list.
2. `ProfileModalContext`: modal profile global.
3. `SettingsModalContext`: modal settings global.

## 7. PWA

Dari `vite.config.js`:

1. register type: `autoUpdate`.
2. manifest app name/short_name/theme.
3. runtime cache untuk asset gambar/font/avatar.

## 8. Testing UI

Fokus test saat ini banyak di modul jurnal makan & PMT:

1. property-based tests.
2. loading/empty state tests.
3. responsivitas + accessibility + style consistency checks.

# 📊 Export Data Anak ke Excel - Dokumentasi

## 🎯 Deskripsi

Fitur export data anak ke Excel memungkinkan admin untuk mengunduh data lengkap semua anak dalam format `.xlsx` dengan styling profesional dan analisis status gizi.

## ✨ Fitur Utama

### 1. **Multi-Sheet Structure**

-   **Sheet 1: Data Anak** - Data lengkap semua anak
-   **Sheet 2: Statistik Status Gizi** - Ringkasan distribusi status gizi

### 2. **Data Lengkap per Anak**

Setiap baris berisi:

-   Nomor urut
-   Data pribadi (Nama, NIK, Jenis Kelamin, Tanggal Lahir)
-   Usia dalam bulan
-   Data kelahiran (BB, TB)
-   Nama orang tua
-   Posyandu
-   Status gizi terakhir dengan **color coding**
-   Pengukuran terakhir (BB, TB, Tanggal)
-   Status aktif
-   Catatan

### 3. **Professional Styling**

-   ✅ Header berwarna biru (#1E40AF) dengan teks putih
-   ✅ Border tipis pada semua cell
-   ✅ Auto-width untuk setiap kolom
-   ✅ **Color coding** status gizi:
    -   🟢 **Hijau**: Normal/Baik
    -   🔴 **Merah**: Gizi Kurang/Kurus
    -   🟡 **Kuning**: Gizi Lebih/Gemuk
    -   🔵 **Biru**: Pendek/Sangat Pendek
-   ✅ Wrap text untuk kolom catatan
-   ✅ Alignment yang konsisten

### 4. **Metadata**

-   Judul laporan
-   Nama Posyandu (filter yang dipilih)
-   Tanggal & waktu export
-   Total jumlah anak

### 5. **Statistik Status Gizi**

Sheet kedua menampilkan:

-   Jumlah anak per status gizi
-   Persentase dari total anak
-   Visualisasi distribusi status

## 🚀 Cara Penggunaan

### Dari Halaman System Reports

1. Buka halaman **System Reports** (`/admin/reports`)
2. (Optional) Pilih filter Posyandu jika ingin data spesifik posyandu
3. Klik tombol **"Export Data Anak"** (tombol hijau kedua)
4. Tunggu loading indicator selesai
5. File Excel akan otomatis terdownload

### Format Nama File

```
Data_Anak_[Nama_Posyandu]_[YYYY-MM-DD].xlsx
```

Contoh:

-   `Data_Anak_Semua_Posyandu_2025-12-07.xlsx`
-   `Data_Anak_Posyandu_Melati_2025-12-07.xlsx`

## 📋 Struktur Data Excel

### Sheet 1: Data Anak

| No  | Nama Lengkap | NIK | Jenis Kelamin | Tanggal Lahir | Usia (bulan) | BB Lahir (kg) | TB Lahir (cm) | Nama Orang Tua | Posyandu | Status Gizi Terakhir | BB Terakhir (kg) | TB Terakhir (cm) | Tanggal Ukur Terakhir | Status Aktif | Catatan |
| --- | ------------ | --- | ------------- | ------------- | ------------ | ------------- | ------------- | -------------- | -------- | -------------------- | ---------------- | ---------------- | --------------------- | ------------ | ------- |
| 1   | Ahmad        | ... | Laki-laki     | 01/01/2023    | 24           | 3.2           | 48            | Siti           | Melati   | Normal               | 12.5             | 85               | 01/12/2025            | Aktif        | -       |

### Sheet 2: Statistik Status Gizi

| Status Gizi | Jumlah | Persentase |
| ----------- | ------ | ---------- |
| Normal      | 45     | 75.0%      |
| Gizi Kurang | 10     | 16.7%      |
| Pendek      | 5      | 8.3%       |

## 🎨 Color Coding Status Gizi

| Status                | Warna Latar    | Kode RGB | Keterangan                     |
| --------------------- | -------------- | -------- | ------------------------------ |
| **Normal/Baik**       | 🟢 Hijau Muda  | D1FAE5   | Anak dengan status gizi normal |
| **Gizi Kurang/Kurus** | 🔴 Merah Muda  | FEE2E2   | Memerlukan perhatian khusus    |
| **Gizi Lebih/Gemuk**  | 🟡 Kuning Muda | FEF3C7   | Perlu pengaturan pola makan    |
| **Pendek**            | 🔵 Biru Muda   | DBEAFE   | Indikasi stunting              |

## ⚙️ Technical Implementation

### File Lokasi

```
resources/js/utils/excelExportChildren.js
resources/js/components/konten/SystemReports.jsx
```

### Dependencies

-   `xlsx-js-style` - Library untuk Excel export dengan styling

### API Endpoint

```
GET /api/admin/children
```

**Query Parameters:**

-   `posyandu_id` (optional) - Filter berdasarkan posyandu

**Response Format:**

```json
{
    "data": [
        {
            "id": 1,
            "full_name": "Ahmad",
            "nik": "1234567890123456",
            "gender": "L",
            "birth_date": "2023-01-01",
            "age_in_months": 24,
            "birth_weight_kg": 3.2,
            "birth_height_cm": 48,
            "parent_name": "Siti",
            "posyandu_name": "Posyandu Melati",
            "latest_status": "normal",
            "latest_weight": 12.5,
            "latest_height": 85,
            "latest_measured_at": "2025-12-01",
            "is_active": true,
            "notes": null
        }
    ]
}
```

### Main Functions

#### `exportChildrenToExcel(childrenData, posyanduName)`

Export data anak ke Excel dengan 2 sheets.

**Parameters:**

-   `childrenData` (Array) - Data anak dari API
-   `posyanduName` (String) - Nama posyandu untuk metadata

**Returns:**

-   `{ success: true, filename: "..." }` jika berhasil
-   Throws error jika gagal

#### `formatNutritionalStatus(status)`

Format status gizi untuk display yang lebih user-friendly.

#### `calculateNutritionalStats(childrenData)`

Hitung statistik distribusi status gizi.

## 🔒 Error Handling

### Validasi Data

```javascript
if (!childrenData || childrenData.length === 0) {
    throw new Error("Tidak ada data anak untuk diexport");
}
```

### Error Messages

-   **"Tidak ada data anak yang tersedia untuk di-export"** - Saat data kosong
-   **"Gagal mengexport data anak: [error message]"** - Error umum saat export
-   Auto-hide error notification setelah 5 detik

### Loading States

-   `isExportingChildren` - Menampilkan loading indicator
-   Disable semua tombol export saat proses berlangsung
-   Spinner animasi dengan pesan "Sedang mengexport data anak..."

## 🎯 Use Cases

### 1. Export Semua Data Anak

```javascript
// User tidak memilih filter posyandu
selectedPosyandu = "all";
// Menghasilkan: Data_Anak_Semua_Posyandu_2025-12-07.xlsx
```

### 2. Export Data Anak per Posyandu

```javascript
// User memilih Posyandu Melati
selectedPosyandu = "5";
// Menghasilkan: Data_Anak_Posyandu_Melati_2025-12-07.xlsx
```

### 3. Analisis Status Gizi

-   Buka Sheet 2 untuk melihat distribusi status gizi
-   Gunakan persentase untuk identifikasi masalah
-   Color coding memudahkan visual scanning

## 📊 Contoh Output

### Metadata di Sheet 1

```
DATA ANAK - SISTEM MONITORING POSYANDU
Posyandu: Posyandu Melati
Tanggal Export: 07 Desember 2025, 14:30
Total Data: 60 anak
```

### Statistik di Sheet 2

```
STATISTIK STATUS GIZI ANAK
Posyandu: Posyandu Melati
Total Anak: 60

Status Gizi          | Jumlah | Persentase
---------------------|--------|------------
Normal               | 45     | 75.0%
Gizi Kurang          | 8      | 13.3%
Gizi Sangat Kurang   | 2      | 3.3%
Pendek               | 3      | 5.0%
Sangat Pendek        | 2      | 3.3%
```

## 🔧 Customization

### Menambah Kolom Baru

Edit array `headers` di `excelExportChildren.js`:

```javascript
const headers = [
    "No",
    "Nama Lengkap",
    // ... kolom existing
    "Kolom Baru Anda", // tambahkan di sini
];
```

### Mengubah Warna Status

Edit di fungsi styling:

```javascript
if (status.includes("normal")) {
    fillColor = "D1FAE5"; // Ubah kode warna di sini
}
```

### Menambah Status Gizi Baru

Edit `formatNutritionalStatus()` dan `calculateNutritionalStats()`:

```javascript
const statusMap = {
    normal: "Normal",
    status_baru: "Label Status Baru", // tambahkan mapping baru
};
```

## 📝 Best Practices

1. ✅ **Validasi data** sebelum export
2. ✅ **Handle empty state** dengan pesan yang jelas
3. ✅ **Loading indicator** untuk UX yang baik
4. ✅ **Error messages** yang informatif
5. ✅ **Auto-hide notifications** untuk clean UI
6. ✅ **Disable buttons** saat proses berjalan
7. ✅ **Consistent naming** untuk file output

## 🐛 Troubleshooting

### Problem: File tidak terdownload

**Solution:** Cek browser console untuk error. Pastikan library `xlsx-js-style` sudah terinstall.

### Problem: Data tidak sesuai

**Solution:** Cek response API di Network tab. Pastikan field names match dengan yang diakses di code.

### Problem: Styling tidak muncul

**Solution:** Pastikan menggunakan `xlsx-js-style` bukan `xlsx` biasa.

### Problem: Error "Tidak ada data anak"

**Solution:** Cek filter posyandu atau pastikan ada data anak di database.

## 🔄 Future Enhancements

-   [ ] Export dengan filter tanggal
-   [ ] Export dengan filter status gizi spesifik
-   [ ] Tambah grafik di Sheet 3
-   [ ] Export ke PDF
-   [ ] Scheduled export otomatis
-   [ ] Email export results

## 📚 Related Documentation

-   [EXCEL_EXPORT_FEATURE.md](./EXCEL_EXPORT_FEATURE.md) - Export ringkasan sistem
-   [EXPORT_EXCEL_QUICKSTART.md](./EXPORT_EXCEL_QUICKSTART.md) - Quick start guide
-   [ERROR_HANDLING_EXPORT.md](./ERROR_HANDLING_EXPORT.md) - Error handling details

---

**Created:** 7 Desember 2025  
**Last Updated:** 7 Desember 2025  
**Version:** 1.0.0

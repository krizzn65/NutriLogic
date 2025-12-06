# 🚀 Quick Start: Export to Excel

## Instalasi (Sudah Selesai ✅)

```bash
npm install xlsx xlsx-js-style
```

## Penggunaan

### 1. Buka Halaman Laporan Sistem

Navigasi ke: `/dashboard/laporan` (Super Admin)

### 2. Filter Data (Opsional)

-   Pilih Posyandu spesifik atau "Semua Posyandu"
-   Data akan di-filter sesuai pilihan

### 3. Klik Tombol "Export Ringkasan"

-   File `.xlsx` akan otomatis ter-download
-   Tidak perlu refresh halaman
-   File berisi 3 sheets: Ringkasan & Statistik, Analisa Gizi, Raw Data

## Struktur File yang Di-generate

```
Laporan_NutriLogic_Semua_Posyandu_2025-12-07.xlsx
│
├── 📄 Sheet 1: Ringkasan & Statistik
│   ├── Judul & Metadata (merged cells)
│   ├── RINGKASAN DATA
│   │   ├── Total Posyandu
│   │   ├── Total Kader
│   │   ├── Total Orang Tua
│   │   ├── Total Anak
│   │   └── Total Penimbangan
│   ├── STATISTIK BULANAN
│   │   └── [Bulan | Anak Ditimbang | Total Penimbangan]
│   └── TREN PENIMBANGAN
│       └── [Bulan | Jumlah Penimbangan]
│
├── 📄 Sheet 2: Analisa Gizi
│   ├── Judul & Metadata
│   └── Distribusi Status Gizi
│       ├── Normal
│       ├── Kurang
│       ├── Sangat Kurang
│       ├── Pendek
│       ├── Sangat Pendek
│       ├── Kurus
│       ├── Sangat Kurus
│       ├── Lebih
│       ├── Gemuk
│       └── TOTAL ANAK (bold row)
│
└── 📄 Sheet 3: Raw Data
    └── Template untuk data detail anak (untuk pengembangan masa depan)
```

## Fitur Styling ✨

### ✅ Headers

-   Background biru gelap (#1E40AF)
-   Font putih, bold
-   Border tipis

### ✅ Title

-   Background berbeda per sheet
-   Font putih, bold, size 16pt
-   Merged cells

### ✅ Data Cells

-   Border abu-abu tipis
-   Alignment otomatis (teks kiri, angka tengah)
-   Auto-width columns

### ✅ Total Row

-   Background kuning terang
-   Font bold
-   Border tebal

## Kode Implementasi

### File Locations

-   **Export Function**: `resources/js/utils/excelExport.js`
-   **Integration**: `resources/js/components/konten/SystemReports.jsx`
-   **Documentation**: `docs/EXCEL_EXPORT_FEATURE.md`

### Cara Kerja

```javascript
// 1. Import function
import { exportSystemReportsToExcel } from "../../utils/excelExport";

// 2. Call function dengan data
exportSystemReportsToExcel(reportData, posyanduName);

// 3. File langsung ter-download tanpa refresh!
```

## Testing

### Manual Test

1. Login sebagai Super Admin
2. Pergi ke Laporan Sistem
3. Pilih filter Posyandu (atau biarkan "Semua Posyandu")
4. Klik "Export Ringkasan"
5. Verify file ter-download
6. Buka file Excel
7. Check semua 3 sheets
8. Verify styling (headers biru, borders, dll)

### Expected Results

✅ File ter-download dengan nama format: `Laporan_NutriLogic_{Posyandu}_{Date}.xlsx`
✅ 3 sheets tersedia dan dapat di-navigate
✅ Styling muncul dengan benar (headers biru, borders, fonts)
✅ Data sesuai dengan yang ditampilkan di dashboard
✅ Metadata (judul, posyandu, tanggal) muncul di atas setiap sheet
✅ Columns memiliki lebar yang sesuai (tidak terpotong)

## Troubleshooting

| Issue                   | Solution                                             |
| ----------------------- | ---------------------------------------------------- |
| File tidak ter-download | Check browser popup blocker settings                 |
| Styling tidak muncul    | Verify `xlsx-js-style` installed, bukan `xlsx` biasa |
| Data kosong             | Verify API response & reportData structure           |
| Error di console        | Check import statement & function parameters         |

## Browser Support

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
⚠️ IE11 (Not supported - use modern browser)

## Next Steps

-   [ ] Populate Sheet 3 (Raw Data) dengan data real dari API
-   [ ] Tambahkan export untuk data anak detail
-   [ ] Implementasi export chart/grafik (optional)
-   [ ] Tambahkan loading indicator saat generating file

---

📚 **Full Documentation**: Lihat `docs/EXCEL_EXPORT_FEATURE.md`

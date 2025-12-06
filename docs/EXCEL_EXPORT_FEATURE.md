# 📊 Fitur Export to Excel - NutriLogic

## Overview

Fitur export to Excel memungkinkan export data laporan sistem menjadi file `.xlsx` dengan multi-sheet dan styling profesional tanpa refresh halaman.

## 🎯 Fitur Utama

### ✅ Multi-Sheet Structure

File Excel yang di-generate memiliki 3 sheet terpisah:

1. **Sheet 1: Ringkasan & Statistik**

    - Ringkasan Data (Total Posyandu, Kader, Orang Tua, Anak, Penimbangan)
    - Statistik Bulanan (Anak Ditimbang vs Total Penimbangan)
    - Tren Penimbangan (Bulan vs Jumlah)

2. **Sheet 2: Analisa Gizi**

    - Distribusi Status Gizi (Normal, Kurang, Stunting, dll)
    - Total keseluruhan anak

3. **Sheet 3: Raw Data**
    - Template untuk data detail anak (dapat dikembangkan lebih lanjut)

### ✅ Styling Profesional

#### Header Styling

-   Background: Biru tua (#1E40AF)
-   Font: Putih, Bold, Size 11pt
-   Alignment: Center
-   Border: Tipis di semua sisi

#### Title Styling

-   Background: Biru gelap (#1E3A8A) untuk Sheet 1
-   Background: Orange (#EA580C) untuk Sheet 2
-   Background: Hijau (#059669) untuk Sheet 3
-   Font: Putih, Bold, Size 16pt
-   Merged cells untuk lebar penuh

#### Data Cells

-   Border: Tipis abu-abu (#E5E7EB)
-   Alignment:
    -   Teks: Rata kiri
    -   Angka: Rata tengah
-   Auto-width columns (menyesuaikan konten)

#### Total Row

-   Background: Yellow light (#FEF3C7)
-   Font: Bold
-   Border: Medium di atas & bawah

### ✅ Metadata

Setiap sheet memiliki metadata di bagian atas:

-   Judul Laporan
-   Nama Posyandu (sesuai filter yang dipilih)
-   Tanggal Export (format Indonesia)

## 🛠️ Implementasi Teknis

### Dependencies

```json
{
    "xlsx": "^latest",
    "xlsx-js-style": "^latest"
}
```

### File Structure

```
resources/js/
├── utils/
│   └── excelExport.js          # Core export function
└── components/
    └── konten/
        └── SystemReports.jsx    # Integration point
```

### Cara Penggunaan

#### 1. Import Function

```javascript
import { exportSystemReportsToExcel } from "../../utils/excelExport";
```

#### 2. Call Function

```javascript
const handleExportToExcel = () => {
    if (!reportData) {
        alert("Tidak ada data yang tersedia untuk di-export");
        return;
    }

    const posyanduName =
        selectedPosyandu === "all"
            ? "Semua Posyandu"
            : posyandus.find((p) => p.id === parseInt(selectedPosyandu))
                  ?.name || "Semua Posyandu";

    exportSystemReportsToExcel(reportData, posyanduName);
};
```

#### 3. Button Integration

```jsx
<ExportButton
    onClick={handleExportToExcel}
    label="Export Ringkasan"
    color="blue"
    icon={FileText}
/>
```

## 📦 Data Format

### Input Data Structure

```javascript
{
    summary: {
        total_posyandu: number,
        total_kader: number,
        total_ibu: number,
        total_anak: number,
        total_weighings: number
    },
    growth_by_posyandu: [
        {
            month: string,
            children_count: number,
            weighings_count: number
        }
    ],
    monthly_trend: [
        {
            month: string,
            weighings_count: number
        }
    ],
    status_distribution: {
        normal: number,
        kurang: number,
        sangat_kurang: number,
        pendek: number,
        sangat_pendek: number,
        kurus: number,
        sangat_kurus: number,
        lebih: number,
        gemuk: number
    }
}
```

## 🎨 Kustomisasi

### Mengubah Warna Header

Edit di `excelExport.js`:

```javascript
const applyHeaderStyle = (cell) => ({
    fill: { fgColor: { rgb: "1E40AF" } }, // Ubah kode hex di sini
    // ...
});
```

### Menambah Sheet Baru

```javascript
// Di excelExport.js
const sheet4Data = [];
// ... populate data
const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
XLSX.utils.book_append_sheet(wb, ws4, "Nama Sheet Baru");
```

### Mengubah Lebar Kolom

```javascript
ws1["!cols"] = [
    { wch: 25 }, // Column A - 25 characters wide
    { wch: 20 }, // Column B - 20 characters wide
    // ...
];
```

## 🔧 Troubleshooting

### File Tidak Ter-download

-   Pastikan browser tidak memblokir download otomatis
-   Check console untuk error messages
-   Verify `reportData` tidak null/undefined

### Styling Tidak Muncul

-   Pastikan menggunakan `xlsx-js-style` bukan `xlsx` biasa
-   Import harus: `import * as XLSX from 'xlsx-js-style'`

### Data Tidak Lengkap

-   Verify struktur data dari API sesuai dengan yang diharapkan
-   Gunakan console.log untuk debug reportData

## 🚀 Pengembangan Lebih Lanjut

### Sheet Raw Data

Untuk mengisi Sheet 3 dengan data real:

1. Tambahkan endpoint API untuk mendapatkan detail anak
2. Map data ke dalam format array
3. Populate `sheet3Data` dengan data real

```javascript
// Contoh:
const childrenData = await api.get("/admin/children/export");
childrenData.forEach((child) => {
    sheet3Data.push([
        child.name,
        child.birth_date,
        child.gender,
        child.weight,
        child.height,
        child.nutrition_status,
    ]);
});
```

### Export Chart/Grafik

Untuk menambahkan chart ke Excel:

-   Install library tambahan seperti `exceljs`
-   Generate chart programmatically
-   Embed ke sheet yang diinginkan

## 📝 Notes

-   File naming: `Laporan_NutriLogic_{PosyanduName}_{Date}.xlsx`
-   Format tanggal: YYYY-MM-DD
-   Encoding: UTF-8 untuk support karakter Indonesia
-   Browser compatibility: Modern browsers (Chrome, Firefox, Edge, Safari)

## 👨‍💻 Author

Created by Senior Frontend Developer
Date: 2025-12-07

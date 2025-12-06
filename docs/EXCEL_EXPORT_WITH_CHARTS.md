# 📊 Excel Export dengan Visualisasi Data

## 🎯 Fitur Baru: Export dengan Grafik & Visualisasi

Sekarang ada **2 opsi export** di halaman Laporan Sistem:

### 1. **Export Ringkasan + Grafik** 🎨 (RECOMMENDED)

**File**: `excelExportWithCharts.js`  
**Library**: `exceljs`

Menghasilkan Excel dengan **visualisasi data otomatis** di setiap sheet:

#### ✨ Sheet 1: Ringkasan & Statistik

-   **Data**: Ringkasan total (Posyandu, Kader, Orang Tua, Anak, Penimbangan)
-   **Visualisasi**:
    -   ✅ Data Bars untuk Statistik Bulanan (biru & hijau)
    -   ✅ Auto-scaling berdasarkan nilai maksimum
    -   ✅ Gradient effect untuk visual yang lebih menarik

#### ✨ Sheet 2: Analisa Gizi

-   **Data**: Distribusi status gizi (Normal, Kurang, Stunting, dll)
-   **Visualisasi**:
    -   ✅ Color coding untuk setiap status gizi
    -   ✅ Kolom Persentase otomatis
    -   ✅ Data Bars dengan gradient untuk visual bar chart
    -   ✅ Total row dengan highlight kuning

#### ✨ Sheet 3: Tren Penimbangan

-   **Data**: Tren bulanan jumlah penimbangan
-   **Visualisasi**:
    -   ✅ Data Bars hijau dengan gradient
    -   ✅ Icon Set (arrows) untuk indikasi tren naik/turun
    -   ✅ Conditional formatting otomatis

### 2. **Export Ringkasan (Simple)** 📄

**File**: `excelExport.js`  
**Library**: `xlsx-js-style`

Export versi simple tanpa visualisasi, cocok untuk:

-   File size lebih kecil
-   Kompatibilitas maksimum
-   Editing manual lebih mudah

---

## 🎨 Visualisasi yang Ditambahkan

### Data Bars (Conditional Formatting)

```
Status Gizi          Jumlah    Visual
─────────────────────────────────────────
Normal               45        ████████████████████ (100%)
Kurang               8         ███ (17.8%)
Sangat Kurang        3         █ (6.7%)
```

### Icon Sets

```
Bulan          Jumlah    Tren
────────────────────────────────
Jan 2025       45        ↑ (naik)
Feb 2025       52        ↑ (naik)
Mar 2025       48        ↓ (turun)
```

### Color Coding

-   🟢 **Normal**: Hijau (#10B981)
-   🟡 **Kurang**: Kuning (#FDC700)
-   🔴 **Sangat Kurang**: Merah (#F43F5E)
-   🟠 **Pendek**: Orange terang (#FFE06D)
-   🔴 **Sangat Pendek**: Pink (#FE7189)
-   🟤 **Kurus**: Coklat muda (#D9C990)
-   🔴 **Sangat Kurus**: Pink terang (#FB9FAF)
-   🟡 **Lebih**: Kuning muda (#FFF8D2)
-   🔴 **Gemuk**: Pink pucat (#FFCCD5)

---

## 📊 Perbandingan Fitur

| Fitur                  | Export + Grafik           | Export Simple |
| ---------------------- | ------------------------- | ------------- |
| **Data Bars**          | ✅ Ya                     | ❌ Tidak      |
| **Icon Sets**          | ✅ Ya                     | ❌ Tidak      |
| **Color Coding**       | ✅ Ya                     | ✅ Ya         |
| **Persentase Auto**    | ✅ Ya                     | ❌ Tidak      |
| **Conditional Format** | ✅ Ya                     | ❌ Tidak      |
| **File Size**          | Lebih besar               | Lebih kecil   |
| **Kompatibilitas**     | Excel 2013+               | Excel 2007+   |
| **Tab Color**          | ✅ Ya (Biru/Orange/Hijau) | ❌ Tidak      |
| **Gradient Bars**      | ✅ Ya                     | ❌ Tidak      |

---

## 🚀 Cara Menggunakan

### Dari Dashboard

1. Login sebagai Super Admin
2. Menu **Laporan Sistem**
3. Pilih filter Posyandu (opsional)
4. Klik **"Export Ringkasan + Grafik"** untuk versi dengan visualisasi
5. Atau klik **"Export Ringkasan (Simple)"** untuk versi tanpa visualisasi

### Preview Hasil Export

#### Sheet 1: Ringkasan & Statistik

```
╔═══════════════════════════════════════════════════════════╗
║           LAPORAN SISTEM NUTRILOGIC                       ║
║           (Background: Biru Gelap)                        ║
╠═══════════════════════════════════════════════════════════╣
║ RINGKASAN DATA                                            ║
║ ┌─────────────────────┬──────────┐                        ║
║ │ Keterangan          │ Jumlah   │                        ║
║ ├─────────────────────┼──────────┤                        ║
║ │ Total Posyandu      │    5     │                        ║
║ │ Total Kader         │   12     │                        ║
║ │ Total Orang Tua     │   45     │                        ║
║ │ Total Anak          │   78     │                        ║
║ │ Total Penimbangan   │  234     │                        ║
║ └─────────────────────┴──────────┘                        ║
║                                                            ║
║ STATISTIK BULANAN                                          ║
║ ┌──────────┬───────────────┬──────────────┬──────────────┐ ║
║ │ Bulan    │ Anak Ditimbang│ Total        │ Visual Bars  │ ║
║ ├──────────┼───────────────┼──────────────┼──────────────┤ ║
║ │ Jan 2025 │ 15 ████████   │ 45 ████████  │              │ ║
║ │ Feb 2025 │ 18 ██████████ │ 52 ██████████│              │ ║
║ │ Mar 2025 │ 20 ███████████│ 58 ███████████              │ ║
║ └──────────┴───────────────┴──────────────┴──────────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

#### Sheet 2: Analisa Gizi

```
╔═══════════════════════════════════════════════════════════╗
║      ANALISA DISTRIBUSI STATUS GIZI                       ║
║      (Background: Orange)                                 ║
╠═══════════════════════════════════════════════════════════╣
║ ┌────────────────┬─────────┬────────────┬───────────────┐ ║
║ │ Status Gizi    │ Jumlah  │ Persentase │ Visual        │ ║
║ ├────────────────┼─────────┼────────────┼───────────────┤ ║
║ │ Normal (🟢)    │   45    │   57.7%    │ ████████████  │ ║
║ │ Kurang (🟡)    │    8    │   10.3%    │ ██            │ ║
║ │ Sangat Kurang  │    3    │    3.8%    │ █             │ ║
║ │ Pendek         │    6    │    7.7%    │ ██            │ ║
║ │ ...            │   ...   │   ...      │ ...           │ ║
║ ├────────────────┼─────────┼────────────┼───────────────┤ ║
║ │ TOTAL ANAK     │   78    │  100.0%    │               │ ║
║ │ (Highlight 🟡) │         │            │               │ ║
║ └────────────────┴─────────┴────────────┴───────────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

#### Sheet 3: Tren Penimbangan

```
╔═══════════════════════════════════════════════════════════╗
║        TREN PENIMBANGAN BULANAN                           ║
║        (Background: Hijau)                                ║
╠═══════════════════════════════════════════════════════════╣
║ ┌──────────┬────────────────────┬──────────────────────┐  ║
║ │ Bulan    │ Jumlah (+ Icon)    │ Tren Visual          │  ║
║ ├──────────┼────────────────────┼──────────────────────┤  ║
║ │ Jan 2025 │  45  ↑            │ ███████              │  ║
║ │ Feb 2025 │  52  ↑            │ ████████             │  ║
║ │ Mar 2025 │  58  ↑            │ █████████            │  ║
║ │ Apr 2025 │  64  ↑            │ ██████████           │  ║
║ │ Mei 2025 │  70  ↑            │ ███████████          │  ║
║ │ Jun 2025 │  67  ↓            │ ██████████           │  ║
║ └──────────┴────────────────────┴──────────────────────┘  ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🔧 Technical Details

### Libraries Used

```json
{
    "exceljs": "^4.x", // For charts & advanced features
    "xlsx-js-style": "^1.x" // For simple export with styling
}
```

### File Structure

```
resources/js/utils/
├── excelExport.js              // Simple export (legacy)
└── excelExportWithCharts.js    // NEW: Export with visualizations
```

### Conditional Formatting Rules

#### Data Bars

```javascript
sheet.addConditionalFormatting({
    ref: "E7:E18", // Range cells
    rules: [
        {
            type: "dataBar",
            priority: 1,
            minLength: 0,
            maxLength: 100,
            gradient: true, // Gradient effect
            color: "4472C4", // Blue color
        },
    ],
});
```

#### Icon Sets

```javascript
sheet.addConditionalFormatting({
    ref: "B7:B18",
    rules: [
        {
            type: "iconSet",
            priority: 2,
            iconSet: "3Arrows", // Up/Down/Flat arrows
        },
    ],
});
```

---

## 🎯 Benefits

### Untuk Admin

✅ **Lebih Informatif**: Visual langsung terlihat tanpa perlu buat chart manual  
✅ **Hemat Waktu**: Tidak perlu insert chart satu-satu  
✅ **Profesional**: Laporan siap presentasi  
✅ **Interactive**: Data bars dan icons update otomatis jika data berubah

### Untuk Stakeholder

✅ **Mudah Dipahami**: Visual bars lebih cepat dicerna daripada angka  
✅ **Tren Jelas**: Arrow icons langsung tunjukkan naik/turun  
✅ **Color Coding**: Status gizi langsung terlihat dari warna

---

## 📈 Future Enhancements

-   [ ] Native Excel Charts (Line, Bar, Pie) menggunakan ExcelJS chart API
-   [ ] Sparklines untuk micro-trends
-   [ ] Heat maps untuk distribusi geografis
-   [ ] Custom chart templates
-   [ ] Export ke PDF dengan charts

---

## 🐛 Troubleshooting

### Visual tidak muncul

-   Pastikan menggunakan Excel 2013 atau lebih baru
-   Check apakah conditional formatting enabled di Excel
-   Refresh file (close & reopen)

### Data bars tidak proporsional

-   Pastikan tidak ada nilai negatif
-   Check range yang di-apply conditional formatting
-   Verify min/max values

### Icon sets tidak sesuai

-   Icon sets butuh minimal 3 data points
-   Ensure data dalam format number, bukan text

---

## 📚 Documentation

-   **Quick Start**: `EXPORT_EXCEL_QUICKSTART.md`
-   **Full Feature**: `docs/EXCEL_EXPORT_FEATURE.md`
-   **This Doc**: `docs/EXCEL_EXPORT_WITH_CHARTS.md`

---

✨ **Happy Exporting with Beautiful Visualizations!** ✨

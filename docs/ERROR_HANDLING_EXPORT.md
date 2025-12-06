# 🔧 Error Handling & Troubleshooting - Excel Export

## ✅ Perbaikan yang Dilakukan

### 1. **Try-Catch Comprehensive** ✅

Semua fungsi export sekarang dibungkus dengan try-catch yang proper:

-   Catch di level function export
-   Catch di level component handler
-   Catch di level write buffer

### 2. **Error Messages yang Jelas** ✅

Pesan error sekarang lebih spesifik:

| Error Type      | Message                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| No data         | "Tidak ada data yang tersedia untuk di-export. Pastikan data sudah dimuat." |
| Missing summary | "Data ringkasan tidak lengkap. Silakan refresh halaman dan coba lagi."      |
| Write error     | "Gagal membuat file Excel: [detail error]"                                  |
| Library error   | "Library export tidak dimuat dengan benar. Silakan refresh halaman."        |
| Network error   | "Masalah koneksi. Pastikan Anda terhubung ke internet."                     |

### 3. **Loading State** ✅

-   Spinner saat sedang generate Excel
-   Tombol disabled saat export
-   Visual feedback yang jelas

### 4. **Auto-hide Error** ✅

-   Error message hilang otomatis setelah 7 detik
-   Bisa di-close manual dengan tombol X
-   Tidak mengganggu workflow user

---

## 🎨 UI Improvements

### Loading Indicator

```jsx
{
    isExporting && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="animate-spin h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Sedang membuat file Excel...</span>
        </div>
    );
}
```

### Error Display

```jsx
{
    exportError && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-4">
            <h4>Gagal Export Data</h4>
            <p>{exportError}</p>
            <p>Jika masalah berlanjut, refresh halaman atau hubungi admin.</p>
            <button onClick={() => setExportError(null)}>✕</button>
        </div>
    );
}
```

### Button States

```jsx
<ExportButton
    onClick={handleExport}
    label="Export Ringkasan + Grafik"
    disabled={isExporting} // ← Disabled saat export
    icon={BarChart3}
/>
```

---

## 🐛 Common Errors & Solutions

### 1. "Tidak ada data yang tersedia"

**Penyebab**: `reportData` is null/undefined  
**Solusi**:

-   Tunggu data selesai dimuat
-   Refresh halaman
-   Check API response di Network tab

### 2. "Data ringkasan tidak lengkap"

**Penyebab**: `reportData.summary` missing  
**Solusi**:

-   Verify API endpoint `/admin/reports`
-   Check backend response structure
-   Ensure data format matches expected structure

### 3. "Library export tidak dimuat"

**Penyebab**: ExcelJS not loaded properly  
**Solusi**:

```bash
# Re-install dependencies
npm install exceljs
npm run dev
```

### 4. "Gagal membuat file Excel"

**Penyebab**: Error during writeBuffer  
**Solusi**:

-   Check browser console for details
-   Verify data structure is valid
-   Try export simple version first
-   Clear browser cache

### 5. File tidak ter-download

**Penyebab**: Browser blocked download  
**Solusi**:

-   Allow popups/downloads di browser settings
-   Check browser download folder
-   Try different browser
-   Disable ad-blocker temporarily

---

## 🔍 Debug Checklist

Jika export gagal, check hal-hal berikut:

### Browser Console

```javascript
// 1. Check if reportData exists
console.log("reportData:", reportData);

// 2. Check structure
console.log("summary:", reportData?.summary);
console.log("status_distribution:", reportData?.status_distribution);

// 3. Check if ExcelJS loaded
console.log("ExcelJS:", typeof ExcelJS);
```

### Network Tab (DevTools)

-   ✅ API call `/admin/reports` status 200
-   ✅ Response contains `summary`, `status_distribution`, etc.
-   ✅ No CORS errors
-   ✅ No timeout errors

### Console Errors

Look for:

-   ❌ `ExcelJS is not defined`
-   ❌ `Cannot read property 'summary' of null`
-   ❌ `writeBuffer failed`
-   ❌ Module import errors

---

## 📝 Error Handling Flow

```
User clicks Export button
    ↓
Check if reportData exists
    ↓ NO → Show error: "Tidak ada data"
    ↓ YES
Check if reportData.summary exists
    ↓ NO → Show error: "Data tidak lengkap"
    ↓ YES
Set isExporting = true
Show loading spinner
    ↓
Try to generate Excel
    ↓ ERROR → Catch error
           → Parse error message
           → Show specific error
           → setIsExporting = false
    ↓ SUCCESS
Download file
setIsExporting = false
Auto-hide any errors
```

---

## 🛠️ Developer Notes

### State Management

```javascript
const [isExporting, setIsExporting] = useState(false);
const [exportError, setExportError] = useState(null);
```

### Error Handler Pattern

```javascript
try {
    setIsExporting(true);
    setExportError(null);

    // Validate data
    if (!reportData) throw new Error("No data");
    if (!reportData.summary) throw new Error("Incomplete data");

    // Export
    const result = await exportFunction(data);

    setIsExporting(false);
} catch (error) {
    console.error("Export error:", error);

    // Parse error
    let message = "Terjadi kesalahan";
    if (error.message) message = error.message;

    setExportError(message);
    setIsExporting(false);

    // Auto-hide after 7s
    setTimeout(() => setExportError(null), 7000);
}
```

---

## 📊 Testing Scenarios

### Test Case 1: Normal Export

-   ✅ Data loaded
-   ✅ Click export
-   ✅ Loading shows
-   ✅ File downloads
-   ✅ Success message (optional)

### Test Case 2: No Data

-   ❌ reportData is null
-   ✅ Error: "Tidak ada data yang tersedia"
-   ✅ Error auto-hides after 7s

### Test Case 3: Incomplete Data

-   ❌ reportData.summary is undefined
-   ✅ Error: "Data ringkasan tidak lengkap"
-   ✅ Suggest refresh

### Test Case 4: Library Error

-   ❌ ExcelJS not loaded
-   ✅ Error: "Library export tidak dimuat"
-   ✅ Suggest refresh

### Test Case 5: Network Error

-   ❌ API fails
-   ✅ Error shown at top (existing error handler)
-   ✅ "Coba Lagi" button works

---

## 🚀 Performance Considerations

### Large Data Sets

For reports with 1000+ records:

-   Export might take 5-10 seconds
-   Loading indicator crucial
-   Consider adding progress bar
-   Consider chunking data

### Memory Usage

-   ExcelJS uses memory for buffer
-   Large files (>10MB) might be slow
-   Browser might freeze briefly
-   Normal for complex exports

---

## 📚 Related Files

```
resources/js/
├── components/konten/
│   └── SystemReports.jsx          ← Error handling UI
└── utils/
    ├── excelExport.js             ← Simple export (legacy)
    └── excelExportWithCharts.js   ← Export with charts + error handling
```

---

## ✅ Validation Steps

Before releasing to production:

1. ✅ Test export with real data
2. ✅ Test export with empty data
3. ✅ Test export with partial data
4. ✅ Test in different browsers
5. ✅ Test with slow network
6. ✅ Test error messages display correctly
7. ✅ Test loading indicator shows/hides
8. ✅ Test auto-hide timer works
9. ✅ Test manual close button
10. ✅ Test disabled state prevents multiple clicks

---

## 🎯 Next Improvements

-   [ ] Success toast notification
-   [ ] Progress bar for large exports
-   [ ] Retry button on error
-   [ ] Export queue (for multiple exports)
-   [ ] Download history/log

---

**Error handling sekarang lebih robust dan user-friendly!** 🎉

# Dokumentasi Status Gizi Anak - NutriLogic

## Overview
Aplikasi NutriLogic menggunakan berbagai parameter status gizi untuk memantau pertumbuhan dan perkembangan anak. Status gizi ditentukan berdasarkan pengukuran antropometri (berat badan, tinggi badan, lingkar lengan atas) yang dibandingkan dengan standar WHO.

---

## Parameter Status Gizi

### 1. **Normal** 
- **Kode**: `normal`
- **Warna Badge**: 🟢 Hijau
- **Deskripsi**: Status gizi anak dalam kondisi baik dan sesuai dengan standar pertumbuhan
- **Indikator**: 
  - Berat badan sesuai tinggi badan (BB/TB)
  - Tinggi badan sesuai umur (TB/U)
  - Berat badan sesuai umur (BB/U)

---

### 2. **Pendek (Stunting)**
- **Kode**: `pendek`
- **Warna Badge**: 🟡 Kuning
- **Deskripsi**: Tinggi badan anak lebih rendah dari standar usianya (stunting ringan)
- **Indikator**: TB/U berada di bawah -2 SD hingga -3 SD
- **Dampak**: 
  - Gangguan pertumbuhan fisik
  - Potensi gangguan perkembangan kognitif
- **Tindakan**: Monitoring rutin, perbaikan asupan gizi

---

### 3. **Sangat Pendek (Severe Stunting)**
- **Kode**: `sangat_pendek`
- **Warna Badge**: 🔴 Merah
- **Deskripsi**: Tinggi badan anak jauh lebih rendah dari standar usianya (stunting berat)
- **Indikator**: TB/U berada di bawah -3 SD
- **Dampak**: 
  - Gangguan pertumbuhan fisik yang signifikan
  - Risiko tinggi gangguan perkembangan kognitif
  - Penurunan produktivitas di masa depan
- **Tindakan**: **PRIORITAS TINGGI** - Intervensi gizi intensif, rujukan ke fasilitas kesehatan

---

### 4. **Kurang (Underweight)**
- **Kode**: `kurang`
- **Warna Badge**: 🟡 Kuning
- **Deskripsi**: Berat badan anak lebih rendah dari standar usianya (gizi kurang)
- **Indikator**: BB/U berada di bawah -2 SD hingga -3 SD
- **Dampak**: 
  - Daya tahan tubuh menurun
  - Mudah sakit
  - Pertumbuhan terhambat
- **Tindakan**: Perbaikan pola makan, pemberian makanan tambahan (PMT)

---

### 5. **Sangat Kurang (Severe Underweight)**
- **Kode**: `sangat_kurang`
- **Warna Badge**: 🔴 Merah
- **Deskripsi**: Berat badan anak jauh lebih rendah dari standar usianya (gizi buruk)
- **Indikator**: BB/U berada di bawah -3 SD
- **Dampak**: 
  - Risiko tinggi kematian
  - Sistem imun sangat lemah
  - Gangguan fungsi organ
- **Tindakan**: **DARURAT** - Rujukan segera ke rumah sakit, terapi gizi intensif

---

### 6. **Kurus (Wasting)**
- **Kode**: `kurus`
- **Warna Badge**: 🟡 Kuning
- **Deskripsi**: Berat badan rendah dibandingkan tinggi badan (kurus ringan)
- **Indikator**: BB/TB berada di bawah -2 SD hingga -3 SD
- **Dampak**: 
  - Kekurangan energi dan protein
  - Mudah lelah
  - Daya tahan tubuh menurun
- **Tindakan**: Peningkatan asupan kalori dan protein, monitoring ketat

---

### 7. **Sangat Kurus (Severe Wasting)**
- **Kode**: `sangat_kurus`
- **Warna Badge**: 🔴 Merah
- **Deskripsi**: Berat badan sangat rendah dibandingkan tinggi badan (kurus berat/gizi buruk akut)
- **Indikator**: BB/TB berada di bawah -3 SD
- **Dampak**: 
  - Kondisi darurat gizi
  - Risiko kematian sangat tinggi
  - Kerusakan jaringan tubuh
- **Tindakan**: **DARURAT** - Rujukan segera, terapi gizi khusus, rawat inap

---

### 8. **Lebih (Overweight)**
- **Kode**: `lebih`
- **Warna Badge**: 🔵 Biru
- **Deskripsi**: Berat badan lebih tinggi dari standar (kelebihan berat badan ringan)
- **Indikator**: BB/TB berada di atas +2 SD hingga +3 SD
- **Dampak**: 
  - Risiko obesitas di masa depan
  - Potensi masalah kesehatan metabolik
  - Gangguan mobilitas
- **Tindakan**: Pengaturan pola makan, peningkatan aktivitas fisik, edukasi orang tua

---

### 9. **Gemuk (Obese)**
- **Kode**: `gemuk`
- **Warna Badge**: 🔵 Biru
- **Deskripsi**: Berat badan jauh lebih tinggi dari standar (obesitas)
- **Indikator**: BB/TB berada di atas +3 SD
- **Dampak**: 
  - Obesitas anak
  - Risiko diabetes tipe 2
  - Masalah kardiovaskular
  - Gangguan psikososial
  - Kesulitan bergerak
- **Tindakan**: **PRIORITAS** - Program diet sehat, aktivitas fisik teratur, konseling gizi, monitoring rutin

---

### 10. **Tidak Diketahui**
- **Kode**: `tidak_diketahui`
- **Warna Badge**: ⚪ Abu-abu
- **Deskripsi**: Status gizi belum dapat ditentukan (belum ada data pengukuran)
- **Tindakan**: Lakukan pengukuran antropometri segera

---

## Standar Pengukuran

### Indikator Antropometri:
1. **BB/U (Berat Badan menurut Umur)**
   - Mengukur status gizi secara umum
   - Sensitif terhadap perubahan jangka pendek

2. **TB/U (Tinggi Badan menurut Umur)**
   - Mengukur pertumbuhan linear
   - Indikator stunting (masalah gizi kronis)

3. **BB/TB (Berat Badan menurut Tinggi Badan)**
   - Mengukur proporsi berat terhadap tinggi
   - Indikator wasting (masalah gizi akut)

4. **LILA (Lingkar Lengan Atas)**
   - Indikator tambahan untuk anak usia 6-59 bulan
   - Screening cepat status gizi

### Standar Deviasi (SD):
- **Normal**: -2 SD hingga +2 SD
- **Ringan**: -2 SD hingga -3 SD (kurang) atau +2 SD hingga +3 SD (lebih)
- **Berat**: Di bawah -3 SD (sangat kurang) atau di atas +3 SD (gemuk)

---

## Sistem Warna dalam Aplikasi

| Status | Warna | Tingkat Prioritas | Tindakan |
|--------|-------|-------------------|----------|
| Normal | 🟢 Hijau | Rendah | Monitoring rutin |
| Pendek/Kurang/Kurus | 🟡 Kuning | Sedang | Intervensi gizi, monitoring ketat |
| Sangat Pendek/Kurang/Kurus | 🔴 Merah | **TINGGI** | Rujukan, terapi intensif |
| Lebih/Gemuk | 🔵 Biru | Sedang-Tinggi | Program diet, aktivitas fisik |
| Tidak Diketahui | ⚪ Abu-abu | - | Lakukan pengukuran |

---

## Catatan Penting untuk Kader

1. **Prioritas Penanganan**:
   - Status MERAH (sangat pendek/kurang/kurus) → Rujukan SEGERA
   - Status KUNING (pendek/kurang/kurus) → Monitoring ketat + PMT
   - Status BIRU (lebih/gemuk) → Edukasi pola makan sehat
   - Status HIJAU (normal) → Monitoring rutin

2. **Frekuensi Monitoring**:
   - Status merah: Setiap minggu
   - Status kuning: Setiap 2 minggu
   - Status biru: Setiap bulan
   - Status hijau: Setiap bulan (sesuai jadwal posyandu)

3. **Dokumentasi**:
   - Catat setiap pengukuran di sistem
   - Pantau tren pertumbuhan
   - Dokumentasikan intervensi yang diberikan

4. **Kolaborasi**:
   - Komunikasi dengan orang tua
   - Koordinasi dengan puskesmas untuk kasus berat
   - Rujuk ke ahli gizi jika diperlukan

---

## Referensi
- WHO Child Growth Standards (2006)
- Peraturan Menteri Kesehatan RI tentang Standar Antropometri Anak
- Pedoman Pelaksanaan Stimulasi, Deteksi dan Intervensi Dini Tumbuh Kembang Anak (Kemenkes RI)

---

**Terakhir diperbarui**: 5 Desember 2024  
**Versi**: 1.0

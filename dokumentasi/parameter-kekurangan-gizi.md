# Parameter Kekurangan Gizi (NutriLogic)

Dokumen ini fokus ke parameter yang menentukan status gizi dan risiko anak.

## 1. Parameter Antropometri Utama

Parameter per data penimbangan (`weighing_logs`):

- `child_id`: id anak.
- `measured_at`: tanggal ukur.
- `weight_kg`: berat badan (kg).
- `height_cm`: tinggi/panjang badan (cm), opsional.
- `muac_cm`: lingkar lengan atas (cm), opsional.
- `head_circumference_cm`: lingkar kepala (cm), opsional.

Parameter turunan otomatis:

- `zscore_wfa`: berat menurut umur (Weight-for-Age).
- `zscore_hfa`: tinggi menurut umur (Height-for-Age).
- `zscore_wfh`: berat menurut tinggi (Weight-for-Height).
- `nutritional_status`: status akhir gizi.

## 2. Rumus Z-Score

Implementasi saat ini memakai pendekatan:

`Z = (observed - median_referensi) / SD_referensi`

Referensi dipisah menurut:

- jenis kelamin (`L`/`P`),
- umur (bulan) untuk WFA dan HFA,
- tinggi badan (cm) untuk WFH.

## 3. Klasifikasi Status per Indikator

### 3.1 WFA (Berat menurut Umur)

- `z < -3` -> `sangat_kurang`
- `-3 <= z < -2` -> `kurang`
- `-2 <= z <= 2` -> `normal`
- `z > 2` -> `lebih`

### 3.2 HFA (Tinggi menurut Umur / Stunting)

- `z < -3` -> `sangat_pendek`
- `-3 <= z < -2` -> `pendek`
- `z >= -2` -> `normal`

### 3.3 WFH (Berat menurut Tinggi / Wasting)

- `z < -3` -> `sangat_kurus`
- `-3 <= z < -2` -> `kurus`
- `-2 <= z <= 2` -> `normal`
- `z > 2` -> `gemuk`

## 4. Prioritas Status Akhir (`nutritional_status`)

Penentuan status akhir mengikuti prioritas:

1. HFA (stunting): `sangat_pendek`/`pendek`
2. WFH (wasting): `sangat_kurus`/`kurus`
3. WFA (underweight): `sangat_kurang`/`kurang`
4. Jika tidak ada indikasi di atas -> `normal`

## 5. Rentang Validasi Input Penimbangan

Ada 2 alur utama:

### 5.1 Endpoint umum (`WeighingLogController`)

- `weight_kg`: `0.5 - 50`
- `height_cm`: `30 - 200` (nullable)
- `muac_cm`: `5 - 30` (nullable)
- `head_circumference_cm`: `25 - 60` (nullable)

### 5.2 Penimbangan massal kader (`KaderWeighingController`)

- `weight_kg`: `1 - 30`
- `height_cm`: `40 - 130`
- `muac_cm`: `8 - 25` (nullable)
- `head_circumference_cm`: `30 - 60` (nullable)
- `measured_at`: tidak boleh masa depan

Tambahan cek:

1. `measured_at` tidak boleh sebelum `birth_date`.
2. Duplikasi penimbangan tanggal yang sama per anak ditolak.
3. Jika usia `< 12 bulan`, `weight_kg > 15` ditolak.

## 6. Parameter Early Warning Anak Berisiko

Fitur `AtRiskController` menandai anak berisiko jika salah satu kondisi terpenuhi:

- `zscore_hfa` turun lebih dari `0.5` dibanding data sebelumnya.
- status gizi memburuk dibanding data sebelumnya.
- tidak ada update penimbangan lebih dari `90` hari.
- belum ada data penimbangan sama sekali dan usia anak sudah > `90` hari.
- status terkini termasuk kategori:
1. Kritis: `sangat_pendek`, `sangat_kurang`, `sangat_kurus`.
2. Risiko sedang: `pendek`, `kurang`, `kurus`.

## 7. Catatan Implementasi

- Z-score dan status gizi dihitung otomatis saat simpan data penimbangan (model event `WeighingLog::saving`).
- Ada perbedaan batas validasi antara endpoint umum dan endpoint massal kader.
- Tabel WFH di service diberi catatan "condensed/simplified", jadi jika butuh presisi klinis penuh, sebaiknya pakai tabel WHO lengkap per interval 0.5 cm.

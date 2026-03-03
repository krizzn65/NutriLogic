# Parameter Modul Kesehatan Lain

Dokumen ini merangkum parameter input penting di luar kalkulasi status gizi.

## 1. Data Anak

Sumber utama: `ChildController` dan `KaderChildController`.

Parameter umum:

- `parent_id` (required pada endpoint umum).
- `posyandu_id` (required pada endpoint umum).
- `full_name` (required, max 150).
- `nik` (nullable, unik; pada endpoint kader harus 16 digit angka).
- `birth_date` (required, date).
- `gender` (`L` atau `P`).
- `birth_weight_kg` (nullable).
- `birth_height_cm` (nullable).
- `notes` (nullable).
- `is_active` (boolean, saat update).

Batas versi kader (lebih ketat):

- `birth_date` <= hari ini.
- usia maks 5 tahun (`birth_date` > today-5years).
- `birth_weight_kg`: `0.5 - 6`.
- `birth_height_cm`: `30 - 60`.

Tambahan create via kader:

Jika `parent_id` tidak dikirim, bisa buat akun orang tua baru dengan:

1. `parent_name` (required_without parent_id).
2. `parent_email` (nullable, unik).
3. `parent_phone`, `parent_address`, `parent_rt`, `parent_rw` (nullable).

## 2. Jurnal Makan (`meal_logs`)

Sumber: `MealLogController`.

Field create:

- `child_id` (required).
- `eaten_at` (required, date).
- `time_of_day` (nullable): `pagi|siang|malam|snack`.
- `description` (required).
- `ingredients` (nullable, string).
- `portion` (nullable): `habis|setengah|sedikit|tidak_mau`.
- `notes` (nullable, max 500).
- `source` (optional): `ortu|kader|system`.

Catatan:

- jika `source` tidak dikirim, sistem isi otomatis sesuai role user (`ortu` atau `kader`).

## 3. PMT Harian (`pmt_logs`)

Sumber: `PmtLogController`.

Field simpan:

- `child_id` (required).
- `date` (required).
- `status` (required): `consumed|partial|refused`.
- `notes` (nullable, max 500).

Catatan:

- menggunakan `updateOrCreate` berdasarkan kombinasi (`child_id`, `date`), jadi 1 hari 1 record per anak.

## 4. Jadwal Imunisasi/Vitamin/Posyandu (`immunization_schedules`)

Sumber: `ImmunizationScheduleController`.

Field create:

- `child_id` (required).
- `title` (required, max 150).
- `type` (required): `imunisasi|vitamin|posyandu`.
- `scheduled_for` (required, date).
- `completed_at` (nullable, date).
- `notes` (nullable).

## 5. Distribusi Vitamin Kader (`vitamin_distributions`)

Sumber: `KaderVitaminController`.

Bulk input `distributions[]`:

- `child_id` (required).
- `vitamin_type` (required): `vitamin_a_blue|vitamin_a_red|other`.
- `distribution_date` (required, date).
- `dosage` (nullable, max 50).
- `notes` (nullable, max 500).

Catatan:

- sistem menolak duplikasi vitamin jenis yang sama pada anak dan tanggal yang sama.

## 6. Riwayat Imunisasi Kader (`immunization_records`)

Sumber: `KaderImmunizationController`.

Bulk input `records[]`:

- `child_id` (required).
- `vaccine_type` (required), salah satu:
1. `bcg`
2. `hepatitis_b_0`, `hepatitis_b_1`, `hepatitis_b_2`, `hepatitis_b_3`
3. `polio_0`, `polio_1`, `polio_2`, `polio_3`, `polio_4`
4. `dpt_hib_hep_b_1`, `dpt_hib_hep_b_2`, `dpt_hib_hep_b_3`
5. `ipv_1`, `ipv_2`
6. `campak_rubella_1`, `campak_rubella_2`
7. `other`
- `immunization_date` (required, date).
- `batch_number` (nullable, max 100).
- `notes` (nullable, max 500).

Catatan:

- sistem menolak duplikasi vaksin jenis sama pada anak dan tanggal yang sama.

## 7. NutriAssist (Rekomendasi Menu)

Sumber: `NutriAssistController` (+ dipakai juga di `ParentDashboardController`).

Field request:

- `child_id` (required pada endpoint umum NutriAssist).
- `ingredients` (required array, min 1, max 20).
- `ingredients.*` (string, max 100).
- `date` (nullable, date).
- `notes` (nullable, max 500).

Syarat bisnis:

- anak harus sudah punya minimal 1 data penimbangan.
- jika layanan AI n8n nonaktif/error, sistem fallback ke rekomendasi lokal `NutritionService`.

## 8. Filter Query yang Sering Dipakai

Beberapa endpoint riwayat pakai query parameter:

- PMT: `month`, `year`.
- Vitamin: `start_date`, `end_date`, `vitamin_type`.
- Imunisasi: `start_date`, `end_date`, `vaccine_type`.
- Kader children list: `search`, `is_active`, `status`, `per_page`.

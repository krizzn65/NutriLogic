# Aturan Bisnis Inti

## 1. Aturan Status Gizi

1. Z-score dihitung otomatis saat simpan/update penimbangan.
2. Indikator:
   - WFA (berat/umur),
   - HFA (tinggi/umur),
   - WFH (berat/tinggi).
3. Prioritas status akhir:
   `HFA` -> `WFH` -> `WFA` -> `normal`.
4. Detail ambang ada di `parameter-kekurangan-gizi.md`.

## 2. Aturan Early Warning Anak Berisiko

Anak ditandai berisiko bila:

1. `zscore_hfa` drop > 0.5.
2. Status gizi memburuk antar pengukuran.
3. Tidak ada update > 90 hari.
4. Tidak ada data sama sekali > 90 hari sejak lahir.
5. Status terkini termasuk kategori kurang/buruk.

Risk level:

1. `high` untuk status kritis dan tren berat.
2. `medium` untuk status at-risk atau no-update.
3. `low` default.

## 3. Aturan Otorisasi Data Anak

1. `ibu`: hanya anak dengan `parent_id = user.id`.
2. `kader/admin` berbasis posyandu:
   hanya anak dalam `posyandu_id` yang sama (jika user punya posyandu).
3. Endpoint parent/kader punya guard role tambahan.

## 4. Aturan Penimbangan

1. Endpoint umum menerima rentang lebih longgar.
2. Endpoint bulk kader lebih ketat:
   - tanggal tidak boleh masa depan,
   - tanggal tidak boleh sebelum lahir,
   - anti duplikasi per anak + tanggal,
   - validasi anomali berat berdasarkan usia.

## 5. Aturan PMT & Prioritas Anak

1. PMT dicatat harian (`consumed|partial|refused`).
2. Kepatuhan PMT dihitung dari bulan sebelumnya (complete month).
3. Anak eligible prioritas bila kepatuhan `>= 80%`.
4. Sorting antrean prioritas:
   status gizi lebih risk dulu, lalu kepatuhan PMT tinggi, lalu usia lebih muda.

## 6. Aturan Konsultasi

1. Konsultasi milik parent.
2. Bisa terkait child tertentu atau umum.
3. Kader dapat di-assign otomatis dari posyandu anak.
4. Status konsultasi: `open` atau `closed`.
5. Pesan boleh teks atau attachment gambar.
6. Sistem hitung unread berbasis pesan terakhir lawan bicara.

## 7. Aturan Poin & Badge

Aktivitas pemberi poin:

1. Login harian.
2. Input jurnal makan.
3. Input penimbangan.
4. Kirim pesan konsultasi.

Badge berdasarkan:

1. milestone poin,
2. jumlah aktivitas,
3. streak login,
4. waktu login tertentu (mis. early bird, weekend).

## 8. Aturan Broadcast & Notifikasi

1. Kader kirim broadcast ke parent satu posyandu.
2. Sistem buat notifikasi in-app untuk parent.
3. Jika n8n aktif, trigger broadcast WhatsApp.
4. Hanya recipient dengan nomor HP valid yang dikirim ke webhook WA.

## 9. Aturan Maintenance Mode

1. Nilai setting `maintenance_mode=true` memblokir akses user non-admin.
2. Admin tetap bisa akses untuk maintenance/debug.
3. Frontend non-admin juga punya halaman maintenance.

## 10. Aturan Keamanan Login

1. Lockout saat gagal login berulang.
2. Tracking lock by identifier + IP.
3. Login sukses membersihkan catatan gagal.
4. Login baru menghapus seluruh token lama user (single-session).

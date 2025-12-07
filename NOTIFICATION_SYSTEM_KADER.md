# Sistem Notifikasi AI untuk Role Kader

## Overview

Sistem notifikasi berbasis AI telah diimplementasikan untuk role **Kader** di aplikasi NutriLogic. Sistem ini memberikan notifikasi cerdas berdasarkan analisis data dashboard dan juga notifikasi dari backend untuk event-event penting seperti reset password.

## Fitur Utama

### 1. Notifikasi Berbasis AI (Smart Notifications)

Sistem menganalisis data dashboard secara otomatis dan menghasilkan notifikasi yang relevan:

#### Jenis Notifikasi AI:

-   **Anak Prioritas**: Notifikasi ketika ada anak yang membutuhkan perhatian khusus
-   **Gizi Buruk**: Alert untuk anak dengan status gizi sangat kurang
-   **Stunting**: Peringatan untuk kasus stunting yang terdeteksi
-   **Wasting**: Alert untuk gizi kurang akut
-   **Konsultasi Pending**: Reminder untuk konsultasi yang belum dibalas
-   **Jadwal Mendatang**: Notifikasi untuk jadwal posyandu 3 hari ke depan
-   **Insight Positif**: Feedback positif ketika performa baik

### 2. Notifikasi dari Database

Notifikasi yang disimpan di database untuk event-event penting:

#### Event yang Menghasilkan Notifikasi:

-   **Reset Password**: Kader menerima notifikasi ketika Admin mereset password mereka
-   Password baru ditampilkan langsung di notifikasi
-   Metadata mencakup informasi siapa yang mereset dan kapan

## Implementasi Teknis

### Backend Components

#### 1. Database Migration

```bash
php artisan migrate
```

Tabel `notifications`:

-   `id`: Primary key
-   `user_id`: Foreign key ke users
-   `type`: info/warning/danger/success
-   `title`: Judul notifikasi
-   `message`: Isi pesan
-   `link`: Link terkait (optional)
-   `is_read`: Status dibaca
-   `read_at`: Timestamp dibaca
-   `metadata`: Data tambahan (JSON)

#### 2. Model Notification

File: `app/Models/Notification.php`

Methods:

-   `markAsRead()`: Tandai notifikasi sudah dibaca
-   `scopeUnread()`: Query scope untuk notifikasi belum dibaca
-   `scopeForUser()`: Query scope untuk user tertentu

#### 3. Controller

File: `app/Http/Controllers/NotificationController.php`

Endpoints:

-   `GET /notifications`: Get semua notifikasi (max 50)
-   `GET /notifications/unread`: Get notifikasi belum dibaca
-   `POST /notifications/{id}/read`: Tandai satu notifikasi sudah dibaca
-   `POST /notifications/read-all`: Tandai semua sudah dibaca
-   `DELETE /notifications/{id}`: Hapus notifikasi
-   `DELETE /notifications/read/all`: Hapus semua yang sudah dibaca

#### 4. Integration di AdminUserController

File: `app/Http/Controllers/AdminUserController.php`

Ketika Admin reset password user (termasuk Kader):

```php
\App\Models\Notification::create([
    'user_id' => $user->id,
    'type' => 'warning',
    'title' => 'Password Anda Telah Direset',
    'message' => 'Password akun Anda telah direset...',
    'metadata' => [
        'reset_by' => auth()->id(),
        'reset_by_name' => auth()->user()->name,
        'reset_at' => now()->toDateTimeString(),
    ],
]);
```

### Frontend Components

#### 1. DashboardKader.jsx

File: `resources/js/components/konten/DashboardKader.jsx`

Fungsi `generateSmartNotifications`:

-   Menganalisis data dashboard
-   Menghasilkan notifikasi berdasarkan kondisi tertentu
-   Memoized dengan `useMemo` untuk performa optimal

Props yang dikirim ke PageHeader:

```jsx
<PageHeader
    dashboardData={dashboardData}
    generateNotifications={generateSmartNotifications}
/>
```

#### 2. PageHeader.jsx

File: `resources/js/components/ui/PageHeader.jsx`

Fitur baru:

-   Menerima props `dashboardData` dan `generateNotifications`
-   Fetch notifikasi dari database menggunakan API
-   Merge notifikasi AI dengan notifikasi database
-   Handle mark as read untuk notifikasi database
-   Handle dismiss untuk notifikasi AI (localStorage)

#### 3. API Integration

```javascript
// Fetch unread notifications
const response = await api.get("/notifications/unread");

// Mark as read
await api.post(`/notifications/${notificationId}/read`);
```

## Routes

### API Routes (api.php)

#### Kader Routes

```php
Route::prefix('kader')->middleware('kader')->group(function () {
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread', [NotificationController::class, 'unread']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::delete('/read/all', [NotificationController::class, 'deleteRead']);
    });
});
```

#### Admin Routes

```php
Route::prefix('admin')->middleware('admin')->group(function () {
    // ... sama seperti Kader
});
```

#### Parent Routes

```php
Route::prefix('parent')->middleware('parent')->group(function () {
    // ... sama seperti Kader
});
```

## Cara Penggunaan

### Untuk Kader

1. Login sebagai Kader
2. Buka Dashboard
3. Klik icon Bell (🔔) di header
4. Lihat notifikasi yang muncul:
    - Notifikasi AI (dari analisis data)
    - Notifikasi Database (dari event backend)
5. Klik notifikasi untuk:
    - Mark as read (jika dari database)
    - Navigate ke halaman terkait (jika ada link)
    - Dismiss notifikasi

### Untuk Admin (Reset Password)

1. Login sebagai Admin
2. Buka menu User Management > Kader
3. Pilih Kader yang ingin direset passwordnya
4. Klik tombol Reset Password
5. Kader akan menerima notifikasi dengan password baru

## Type System

### Notification Types

-   `info`: Informasi umum (biru)
-   `warning`: Peringatan (orange)
-   `danger`: Bahaya/Urgent (merah)
-   `success`: Sukses (hijau)

### Priority Levels (berdasarkan type)

1. **danger**: Prioritas tertinggi
2. **warning**: Prioritas sedang
3. **info**: Prioritas normal
4. **success**: Prioritas rendah

## Storage

### LocalStorage

Digunakan untuk menyimpan dismissed AI notifications:

```javascript
localStorage.setItem("dismissedNotifications", JSON.stringify(dismissedIds));
```

### Database

Semua notifikasi backend disimpan di tabel `notifications` untuk:

-   Persistensi
-   History
-   Audit trail

## Performance Optimization

### Frontend

-   **Memoization**: `useMemo` untuk `generateSmartNotifications`
-   **Debouncing**: Fetch notifikasi hanya saat needed
-   **Lazy Loading**: Notifikasi dimuat on-demand

### Backend

-   **Indexing**: Index pada `user_id` dan `is_read`
-   **Limit**: Maksimal 50 notifikasi per request
-   **Pagination**: Ready untuk implementasi pagination

## Future Enhancements

### Planned Features

1. **Real-time Notifications**: Menggunakan WebSocket/Pusher
2. **Email Notifications**: Kirim email untuk notifikasi penting
3. **SMS Notifications**: Integrasi dengan SMS gateway
4. **Notification Preferences**: User bisa set preferensi notifikasi
5. **Notification History**: Halaman dedicated untuk history lengkap
6. **Rich Notifications**: Dengan gambar, action buttons, dll

### Improvements

1. Pagination untuk notifikasi
2. Filter notifikasi berdasarkan type
3. Search dalam notifikasi
4. Export notification history
5. Notification templates yang customizable

## Troubleshooting

### Notifikasi tidak muncul

1. Check apakah migration sudah dijalankan
2. Verify API routes sudah registered
3. Check browser console untuk errors
4. Pastikan user sudah login

### Notifikasi AI tidak update

1. Check apakah `dashboardData` sudah dipass ke PageHeader
2. Verify `generateSmartNotifications` function
3. Check localStorage untuk dismissed notifications

### Database notifications tidak tersimpan

1. Check database connection
2. Verify Notification model dan migrations
3. Check API endpoint responses
4. Review error logs

## Testing

### Manual Testing Steps

1. **Test AI Notifications**:

    - Login sebagai Kader
    - Buat kondisi yang trigger notifikasi (anak prioritas, dll)
    - Verify notifikasi muncul di bell icon

2. **Test Password Reset Notification**:

    - Login sebagai Admin
    - Reset password Kader
    - Login sebagai Kader yang di-reset
    - Verify notifikasi password reset muncul

3. **Test Mark as Read**:

    - Klik notifikasi database
    - Verify notifikasi hilang dari list
    - Check database: `is_read` harus `true`

4. **Test Dismiss AI Notification**:
    - Klik notifikasi AI
    - Reload page
    - Verify notifikasi tidak muncul lagi

## Kesimpulan

Sistem notifikasi AI untuk Kader telah berhasil diimplementasikan dengan fitur:
✅ Analisis data otomatis menghasilkan notifikasi cerdas
✅ Notifikasi backend untuk event penting (reset password, dll)
✅ UI/UX yang user-friendly dengan bell icon
✅ Mark as read dan dismiss functionality
✅ Database persistence untuk audit trail
✅ Optimized performance dengan memoization

Role Kader sekarang memiliki sistem notifikasi yang sama canggihnya dengan role Admin, bahkan dengan tambahan notifikasi AI yang menganalisis data posyandu mereka secara real-time.

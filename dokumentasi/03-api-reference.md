# API Reference (Ringkasan Lengkap)

Base path: `/api`  
Auth: Bearer token Sanctum (kecuali endpoint public).

## 1. Public Endpoints

1. `GET /debug-user`  
   Debug hash user contoh (`kader@kader.com`).
2. `POST /register`  
   Registrasi user publik (role dipaksa `ibu`).
3. `POST /login`  
   Login via email/phone/name + password.
4. `POST /forgot-password`  
   Kirim token reset.
5. `POST /reset-password`  
   Reset password dengan token 6 digit.
6. `GET /posyandus`  
   Daftar posyandu aktif untuk registrasi.

## 2. Protected General (`auth:sanctum`)

1. `GET /me`
2. `POST /logout`

### 2.1 Children

1. `GET /children`
2. `POST /children`
3. `GET /children/{id}`
4. `PUT /children/{id}`
5. `DELETE /children/{id}`
6. `GET /children/{id}/growth-chart`
7. `GET /children/{id}/nutritional-status`
8. `GET /children/{id}/reminders`
9. `GET /children/at-risk`

### 2.2 Weighing Logs

1. `GET /weighing-logs`
2. `POST /weighing-logs`
3. `GET /weighing-logs/child/{childId}`
4. `GET /weighing-logs/{id}`
5. `PUT /weighing-logs/{id}`
6. `DELETE /weighing-logs/{id}`

### 2.3 Meal Logs

1. `GET /meal-logs`
2. `POST /meal-logs`
3. `GET /meal-logs/child/{childId}`
4. `GET /meal-logs/{id}`
5. `PUT /meal-logs/{id}`
6. `DELETE /meal-logs/{id}`

### 2.4 PMT Logs

1. `GET /pmt-logs/child/{childId}`
2. `POST /pmt-logs`
3. `GET /pmt-logs/child/{childId}/stats`

### 2.5 Immunization Schedules

1. `GET /immunization-schedules`
2. `POST /immunization-schedules`
3. `GET /immunization-schedules/child/{childId}`
4. `GET /immunization-schedules/{id}`
5. `PUT /immunization-schedules/{id}`
6. `DELETE /immunization-schedules/{id}`

### 2.6 Posyandu Management (auth, role enforced in controller)

1. `GET /posyandus/{id}`
2. `POST /posyandus`
3. `PUT /posyandus/{id}`
4. `DELETE /posyandus/{id}`

### 2.7 NutriAssist

1. `POST /nutri-assist/recommend`

## 3. Parent Endpoints (`/parent`)

1. Dashboard
   - `GET /parent/dashboard`
   - `GET /parent/children`
   - `GET /parent/children/{id}`
   - `POST /parent/children/{id}/nutri-assist`
   - `GET /parent/growth-chart`
   - `GET /parent/calendar/schedules`

2. Consultation
   - `GET /parent/kaders`
   - `GET /parent/consultations`
   - `POST /parent/consultations`
   - `GET /parent/consultations/{id}`
   - `POST /parent/consultations/{id}/messages`
   - `GET /parent/consultations/{id}/child-data`
   - `DELETE /parent/consultations/{id}`

3. Gamification & History
   - `GET /parent/points`
   - `GET /parent/history`

4. Settings & Profile
   - `GET /parent/settings`
   - `PUT /parent/settings`
   - `PUT /parent/profile`
   - `PUT /parent/profile/password`

5. Notifications
   - `GET /parent/notifications`
   - `GET /parent/notifications/unread`
   - `POST /parent/notifications/{id}/read`
   - `POST /parent/notifications/read-all`
   - `DELETE /parent/notifications/{id}`
   - `DELETE /parent/notifications/read/all`

## 4. Kader/Admin Endpoints (`/kader`, middleware `kader`)

1. Dashboard & helper
   - `GET /kader/test`
   - `GET /kader/dashboard`
   - `GET /kader/parents`

2. Children
   - `GET /kader/children`
   - `POST /kader/children`
   - `GET /kader/children/priorities`
   - `GET /kader/children/at-risk`
   - `GET /kader/children/{id}`
   - `PUT /kader/children/{id}`
   - `DELETE /kader/children/{id}`
   - `GET /kader/children/{id}/weighings`

3. Weighing
   - `GET /kader/weighings/today`
   - `POST /kader/weighings/bulk`
   - `PUT /kader/weighings/{id}`

4. Vitamin
   - `GET /kader/vitamins/children`
   - `POST /kader/vitamins/bulk`
   - `GET /kader/vitamins`
   - `PUT /kader/vitamins/{id}`
   - `DELETE /kader/vitamins/{id}`

5. Immunization
   - `GET /kader/immunizations/children`
   - `POST /kader/immunizations/bulk`
   - `GET /kader/immunizations`
   - `PUT /kader/immunizations/{id}`
   - `DELETE /kader/immunizations/{id}`

6. Schedule
   - `GET /kader/schedules`
   - `POST /kader/schedules`
   - `PUT /kader/schedules/{id}`
   - `DELETE /kader/schedules/{id}`

7. Consultation
   - `GET /kader/consultations`
   - `GET /kader/consultations/{id}`
   - `POST /kader/consultations/{id}/messages`
   - `PUT /kader/consultations/{id}/close`
   - `DELETE /kader/consultations/{id}`
   - `GET /kader/consultations/{id}/child-data`

8. Report/Export
   - `GET /kader/report/summary`
   - `GET /kader/report/history`
   - `GET /kader/report/export/children`
   - `GET /kader/report/export/weighings`

9. Broadcast
   - `POST /kader/broadcast`
   - `GET /kader/broadcast`
   - `DELETE /kader/broadcast/{id}`

10. Profile
    - `GET /kader/profile`
    - `PUT /kader/profile`
    - `PUT /kader/profile/password`

11. Notifications
    - `GET /kader/notifications`
    - `GET /kader/notifications/unread`
    - `POST /kader/notifications/{id}/read`
    - `POST /kader/notifications/read-all`
    - `DELETE /kader/notifications/{id}`
    - `DELETE /kader/notifications/read/all`

## 5. Admin Endpoints (`/admin`, middleware `admin`)

1. Dashboard
   - `GET /admin/dashboard`

2. Posyandu Management
   - `GET /admin/posyandus`
   - `POST /admin/posyandus`
   - `PUT /admin/posyandus/{id}`
   - `PATCH /admin/posyandus/{id}/toggle-active`

3. User Management
   - `GET /admin/users`
   - `POST /admin/users`
   - `PUT /admin/users/{id}`
   - `PATCH /admin/users/{id}/toggle-active`
   - `POST /admin/users/{id}/reset-password`

4. Children Monitoring
   - `GET /admin/children`
   - `GET /admin/children/{id}`

5. Weighing Monitoring
   - `GET /admin/weighings`
   - `GET /admin/weighings/{id}`

6. Reports
   - `GET /admin/reports`
   - `GET /admin/reports/export`

7. System Settings
   - `GET /admin/settings`
   - `PUT /admin/settings`
   - `GET /admin/settings/{key}`

8. Activity Logs
   - `GET /admin/activity-logs`

9. Notifications
   - `GET /admin/notifications`
   - `GET /admin/notifications/unread`
   - `POST /admin/notifications/{id}/read`
   - `POST /admin/notifications/read-all`
   - `DELETE /admin/notifications/{id}`
   - `DELETE /admin/notifications/read/all`

## 6. Parameter Validasi Paling Penting

1. Auth register password:
   min 8, wajib upper/lower/angka, confirmed.
2. Weighing:
   validasi numeric range ketat, auto hitung z-score.
3. Kader bulk weighing:
   anti duplikasi tanggal, anti future date, anti date sebelum lahir.
4. Consultation message:
   `message` max 2000, `attachment` image max 5MB.
5. Profile photo:
   image max 2MB.
6. NutriAssist:
   `ingredients` array 1-20 item.

## 7. Catatan Kontrak API

1. Banyak endpoint mengembalikan objek dalam key `data`.
2. Format error validasi standar Laravel (`422`) dengan detail field.
3. Authorization biasanya via role + ownership anak + kesesuaian posyandu.

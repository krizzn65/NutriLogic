# Daftar Masalah Desain UI/UX NutriLogic

> Dokumentasi ini berisi analisis desain UI/UX untuk ketiga role (Admin, Kader, Ibu/Orang Tua).
> Tanggal analisis: 2026-03-01

---

## LEGEND

- [ ] = Belum diperbaiki
- [x] = Sudah diperbaiki
- 🔴 = High Priority
- 🟠 = Medium Priority
- 🟡 = Low Priority

---

## 1. ADMIN ROLE

### Dashboard

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | File terlalu besar (63.7KB) - monolithic component | `DashboardAdmin.jsx` | Pecah menjadi komponen-komponen kecil |
| [x] | 🟠 | Color map defined inline berulang | `DashboardAdmin.jsx` | Ekstrak ke constants file |
| [x] | 🔴 | Tidak ada lazy loading untuk Admin routes | `App.jsx` | Implementasi lazy loading seperti OrangTua |

### Navigation

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Tidak ada link profil di sidebar | `SidebarSuperAdmin.jsx` | Dipertahankan di top bar (keputusan produk) |
| [x] | 🟠 | Logout hanya di PageHeader dropdown | `SidebarSuperAdmin.jsx` | Dipertahankan di top bar (keputusan produk) |
| [x] | 🟡 | Inkonsistensi mobile nav vs sidebar | `MobileBottomNavAdmin.jsx` | Samakan struktur navigasi |

### User Management

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | File terlalu besar (63.2KB) | `UserManagement.jsx` | Pecah menjadi komponen kecil |
| [x] | 🟠 | Form modal inline, tidak reusable | `UserManagement.jsx` | Ekstrak ke komponen terpisah |
| [x] | 🟡 | Tidak ada bulk operations | `UserManagement.jsx` | Tambahkan multi-select dan bulk actions |
| [x] | 🟡 | Tidak ada audit trail visualization | Dashboard | Tambahkan timeline aktivitas |

---

## 2. KADER ROLE

### Dashboard

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Duplikasi kode color map dengan Admin | `DashboardKader.jsx` | Buat shared constants |
| [x] | 🟡 | Calendar modal tidak responsive di small screen | `DashboardKader.jsx` | Perbaiki sizing modal |
| [x] | 🟠 | DashboardKaderContent tidak lazy-loaded | `DashboardKader.jsx` | Implementasi lazy loading |

### Navigation

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Label inkonsisten: "Chat" vs "Konsultasi" | `MobileBottomNavKader.jsx` vs `SidebarKader.jsx` | Samakan terminologi |
| [x] | 🟠 | Tidak ada link profil di sidebar | `SidebarKader.jsx` | Dipertahankan di top bar (keputusan produk) |
| [x] | 🟠 | Logout hanya di PageHeader | `SidebarKader.jsx` | Dipertahankan di top bar (keputusan produk) |

### Anak Prioritas

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Tidak ada sorting options | `AnakPrioritas.jsx` | Tambahkan sort by name/age/date |
| [x] | 🟠 | Tidak ada bulk actions | `AnakPrioritas.jsx` | Tambahkan multi-select untuk intervensi massal |
| [x] | 🟡 | Pagination terbatas | `AnakPrioritas.jsx` | Optimasi untuk list besar |

### Data Anak

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Dropdown fixed positioning bermasalah di mobile | `DataAnakKader.jsx` | Perbaiki positioning |
| [x] | 🟠 | Custom dropdown tanpa accessibility | `DataAnakKader.jsx` | Gunakan Radix UI atau similar |
| [x] | 🟡 | Tidak ada print functionality | `DataAnakKader.jsx` | Tambahkan export/print |

### Konsultasi

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Polling 30 detik kurang efisien | `KonsultasiKader.jsx` | Ganti dengan WebSocket |
| [x] | 🟡 | Placeholder image sama dengan OrangTua | `KonsultasiKader.jsx` | Buat placeholder berbeda |

### Fitur yang Hilang

| Status | Prioritas | Fitur | Deskripsi |
|--------|-----------|-------|-----------|
| [x] | 🟠 | Offline Mode | Untuk pendataan di lapangan tanpa internet |
| [x] | 🟠 | Print Report | Cetak laporan bulanan/tahunan |
| [x] | 🟡 | Scheduling Conflict Warning | Peringatan jadwal bentrok |
| [x] | 🟡 | Multi-child Weighing Session | Penimbangan banyak anak sekaligus |

---

## 3. IBU/ORANG TUA ROLE

### Dashboard

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Logic responsive terbalik (!isDesktop) | `DashboardOrangTua.jsx` | Perbaiki conditional rendering |
| [x] | 🟠 | Child card hanya tampil di mobile | `DashboardOrangTua.jsx` | Tampilkan juga di desktop |
| [x] | 🟡 | Layout right sidebar perlu verifikasi | `DashboardOrangTua.jsx` | Review layout handling |

### Navigation

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Label nav mobile terlalu pendek | `MobileBottomNav.jsx` | "Anak", "Jurnal", "Nutri", "Chat", "Poin" vs full label |
| [x] | 🟠 | Tidak ada link profil di sidebar | `SidebarOrangTua.jsx` | Dipertahankan di top bar (keputusan produk) |

### Tambah Anak Form

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟡 | Credit card preview mungkin membingungkan | `TambahAnakForm.jsx` | Pertimbangkan desain alternatif |
| [x] | 🟡 | Layout form bisa lebih terorganisir | `TambahAnakForm.jsx` | Multi-column layout di desktop |

### Jurnal Makan

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Delete confirmation pakai native confirm() | `JurnalMakanPage.jsx` line 91 | Ganti dengan modal konfirmasi styled |
| [x] | 🟠 | Tidak ada character counter untuk notes | `QuickAddForm.jsx` | Tambahkan counter |

### Konsultasi

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Tidak ada info spesialisasi kader | `CreateConsultation.jsx` | Tambahkan info response time/specialty |
| [x] | 🟠 | Tidak ada character counter untuk title | `CreateConsultation.jsx` | Tambahkan counter 255 chars |
| [x] | 🟡 | Tidak ada arsip konsultasi | `ConsultationList.jsx` | Tambahkan fitur archive |
| [x] | 🟡 | Tidak ada tags/kategori konsultasi | `ConsultationList.jsx` | Tambahkan kategorisasi |

### NutriAssist

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Tidak ada batas request harian | `NutriAssistPage.jsx` | Tambahkan counter & limit |
| [x] | 🟡 | Loading state inline fallback | `NutriAssistPage.jsx` | Gunakan skeleton component |

### Fitur yang Hilang

| Status | Prioritas | Fitur | Deskripsi |
|--------|-----------|-------|-----------|
| [x] | 🟠 | Appointment Booking | Jadwalkan konsultasi |
| [x] | 🟠 | Document Upload | Upload rekam medis/dokumen |
| [x] | 🟠 | Reminder Notifications | Pengingat jadwal penimbangan |
| [x] | 🟡 | Historical Data Visualization | Grafik perkembangan lebih detail |

---

## 4. MASALAH UMUM (CROSS-ROLE)

### Accessibility

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Missing ARIA labels | Semua komponen | Tambahkan aria-label di semua interactive elements |
| [x] | 🔴 | Color contrast tidak memenuhi WCAG | Berbagai komponen | Audit dan perbaiki contrast ratio |
| [x] | 🟠 | Focus indicators inkonsisten | Custom components | Samakan focus styles |
| [x] | 🟠 | Keyboard navigation terbatas | Custom dropdowns | Implementasi keyboard nav |
| [x] | ?? | Form labels tidak selalu terasosiasi | Form inputs | Pastikan htmlFor/id association |
| [x] | 🟡 | Limited screen reader support | Semua komponen | Tambahkan sr-only classes |

### Loading States

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Beberapa komponen pakai inline skeleton | Berbagai file | Gunakan dedicated skeleton components |
| [x] | 🟡 | Tidak ada skeleton untuk beberapa page | - | Buat skeleton untuk semua page |

### Error Handling

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Tidak ada global error boundary | App level | Implementasi ErrorBoundary wrapper |
| [x] | 🟠 | Inkonsistensi tampilan error | Berbagai komponen | Buat standardized error display |
| [x] | 🟡 | console.error digunakan | Berbagai file | Ganti dengan logging service |

### User Feedback

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Tidak ada global toast/notification system | App level | Implementasi toast system (react-toastify) |
| [x] | 🟠 | Posisi success message bervariasi | Berbagai komponen | Standarisasi posisi notification |
| [x] | 🟡 | Auto-dismiss time inkonsisten | Success messages | Samakan (misal 5 detik) |

### Mobile Responsiveness

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | Bottom nav padding terlalu besar (24px) | Mobile nav components | Kurangi padding |
| [x] | 🟠 | Beberapa modal overflow di small screen | Modal components | Tambahkan max-height & scroll |
| [x] | 🟠 | Calendar component kurang responsive | Date pickers | Perbaiki sizing di mobile |
| [x] | 🟡 | Tidak ada pull-to-refresh | List pages | Dibatalkan sesuai keputusan produk (UX scroll diprioritaskan) |

### Performance

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🔴 | Admin routes tidak lazy-loaded | `App.jsx` | Implementasi lazy loading |
| [x] | 🟠 | Tidak ada virtualization untuk long list | Data tables | Implementasi react-virtual |
| [x] | 🟠 | Bundle size belum dioptimasi | Build config | Code splitting & tree shaking |
| [x] | 🟡 | Polling 30 detik untuk real-time | Consultation | Ganti dengan WebSocket |

### Consistency

| Status | Prioritas | Masalah | Lokasi | Solusi |
|--------|-----------|---------|--------|--------|
| [x] | 🟠 | PageHeader usage bervariasi | Berbagai pages | Standarisasi penggunaan |
| [x] | 🟠 | Empty state designs bervariasi | Berbagai komponen | Buat shared EmptyState component |
| [x] | 🟠 | Button order (Cancel/Submit) bervariasi | Form modals | Samakan urutan button |
| [x] | 🟡 | Modal widths tidak standar | Berbagai modals | Gunakan standar width (sm/md/lg/xl) |

---

## 5. DESIGN SYSTEM RECOMMENDATIONS

### Wajib Dibuat

```
resources/js/components/ui/
├── Button.jsx          # Primary, Secondary, Danger, Ghost variants
├── Input.jsx           # Text, Number, Date, Select variants
├── Modal.jsx           # Standardized modal dengan sizes
├── Toast.jsx           # Toast notification system
├── EmptyState.jsx      # Empty state illustrations
├── Skeleton.jsx        # Loading skeleton variants
├── ErrorBoundary.jsx   # Global error handler
├── Dropdown.jsx        # Accessible dropdown component
└── Card.jsx            # Standardized card component
```

### Constants File

```javascript
// resources/js/constants/statusColors.js
export const NUTRITIONAL_STATUS = {
  NORMAL: { label: 'Normal', color: 'green', bgColor: 'bg-green-100' },
  RISIKO_LEBIH: { label: 'Risiko Lebih', color: 'yellow', bgColor: 'bg-yellow-100' },
  GIZI_KURANG: { label: 'Gizi Kurang', color: 'orange', bgColor: 'bg-orange-100' },
  GIZI_BURUK: { label: 'Gizi Buruk', color: 'red', bgColor: 'bg-red-100' },
};

export const RISK_LEVEL = {
  HIGH: { label: 'Risiko Tinggi', color: 'red' },
  MEDIUM: { label: 'Risiko Sedang', color: 'yellow' },
  LOW: { label: 'Risiko Rendah', color: 'green' },
};
```

---

## 6. SUMMARY

### Per Role Summary

| Role | Critical | High | Medium | Low | Total |
|------|----------|------|--------|-----|-------|
| Admin | 1 | 3 | 2 | 3 | 9 |
| Kader | 1 | 6 | 6 | 3 | 16 |
| Ibu/Orang Tua | 2 | 4 | 7 | 4 | 17 |
| **Cross-Role** | **5** | **8** | **14** | **6** | **33** |
| **TOTAL** | **9** | **21** | **29** | **16** | **75** |

### Prioritas Perbaikan

#### 🔴 Segera Diperbaiki (Critical)
1. File component terlalu besar (DashboardAdmin, UserManagement)
2. Admin routes tidak lazy-loaded
3. Logic responsive terbalik di DashboardOrangTua
4. Delete confirmation pakai native confirm()
5. Tidak ada global error boundary
6. Tidak ada global toast notification
7. Missing ARIA labels
8. Color contrast tidak memenuhi WCAG
9. Label navigasi inkonsisten (Chat vs Konsultasi)

#### 🟠 Perlu Diperbaiki (Medium)
1. Duplikasi kode color map
2. Tidak ada link profil di sidebar semua role
3. Custom dropdown tanpa accessibility
4. Polling kurang efisien (ganti WebSocket)
5. Tidak ada sorting/bulk actions
6. Inkonsistensi error display

#### 🟡 Bisa Ditunda (Low)
1. Credit card preview mungkin membingungkan
2. Placeholder image sama antara role
3. Tidak ada character counter
4. Micro-interactions
5. Dokumentasi komponen

---

## 7. FILE YANG PERLU DIREFACTOR

### Pecah Menjadi Komponen Kecil
- [x] `DashboardAdmin.jsx` (63.7KB)
- [x] `UserManagement.jsx` (63.2KB)
- [x] `DashboardKader.jsx`
- [x] `NutriAssistPage.jsx` (81.2KB)

### Ekstrak ke Constants
- [x] Status color maps
- [x] Status labels
- [x] Navigation configs

### Buat Shared Components
- [x] EmptyState component
- [x] Toast notification system
- [x] ConfirmDialog component
- [x] Loading skeleton wrapper
- [x] ErrorBoundary wrapper

---

## 8. CHECKLIST IMPLEMENTASI

### Phase 1: Foundation
- [x] Buat design system constants
- [x] Implementasi global Toast component
- [x] Implementasi global ErrorBoundary
- [x] Buat shared EmptyState component
- [x] Buat ConfirmDialog component

### Phase 2: Accessibility
- [x] Audit ARIA labels
- [x] Perbaiki color contrast
- [x] Implementasi keyboard navigation
- [x] Fix form label associations
- [x] Tambah screen reader support

### Phase 3: Performance
- [x] Lazy load Admin routes
- [x] Implementasi virtualization
- [x] Code splitting
- [x] Bundle optimization
- [x] WebSocket untuk real-time

### Phase 4: Refactoring
- [x] Pecah DashboardAdmin.jsx
- [x] Pecah UserManagement.jsx
- [x] Pecah NutriAssistPage.jsx
- [x] Ekstrak inline components
- [x] Standardize modal widths

### Phase 5: Missing Features
- [x] Kader: Offline mode
- [x] Kader: Print report
- [x] Ibu: Appointment booking
- [x] Ibu: Document upload
- [x] All: Profile navigation (dipusatkan di top bar)

---

**Total Issues: 75**
**Critical: 9 | High: 21 | Medium: 29 | Low: 16**

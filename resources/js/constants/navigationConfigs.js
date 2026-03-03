export const ADMIN_SIDEBAR_NAV = [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    {
        label: "Manajemen Posyandu",
        href: "/dashboard/posyandu",
        icon: "building-2",
    },
    { label: "Manajemen Kader", href: "/dashboard/kader", icon: "user-cog" },
    { label: "Data Anak", href: "/dashboard/anak", icon: "database" },
    { label: "Laporan Sistem", href: "/dashboard/laporan", icon: "bar-chart-3" },
    { label: "Log Aktivitas", href: "/dashboard/logs", icon: "activity" },
];

export const ADMIN_MOBILE_MAIN_NAV = [
    { icon: "lucide:home", label: "Dashboard", href: "/dashboard" },
    { icon: "lucide:building-2", label: "Posyandu", href: "/dashboard/posyandu" },
    { icon: "lucide:user-cog", label: "Kader", href: "/dashboard/kader" },
    { icon: "lucide:database", label: "Data Anak", href: "/dashboard/anak" },
    { icon: "lucide:more-horizontal", label: "Lainnya", isMore: true },
];

export const ADMIN_MOBILE_MORE_NAV = [
    {
        icon: "lucide:bar-chart-3",
        label: "Laporan Sistem",
        href: "/dashboard/laporan",
    },
    { icon: "lucide:activity", label: "Log Aktivitas", href: "/dashboard/logs" },
];

export const KADER_SIDEBAR_NAV = [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Data Anak", href: "/dashboard/data-anak", icon: "users" },
    { label: "Kegiatan", href: "/dashboard/kegiatan", icon: "scale" },
    {
        label: "Anak Prioritas",
        href: "/dashboard/anak-prioritas",
        icon: "alert-triangle",
    },
    {
        label: "Antrian Prioritas",
        href: "/dashboard/antrian-prioritas",
        icon: "clipboard-list",
    },
    { label: "Jadwal", href: "/dashboard/jadwal", icon: "calendar" },
    { label: "Konsultasi", href: "/dashboard/konsultasi", icon: "message-square" },
    { label: "Broadcast", href: "/dashboard/broadcast", icon: "megaphone" },
    { label: "Laporan", href: "/dashboard/laporan", icon: "file-text" },
];

export const KADER_MOBILE_MAIN_NAV = [
    { icon: "lucide:home", label: "Dashboard", href: "/dashboard" },
    { icon: "lucide:users", label: "Anak", href: "/dashboard/data-anak" },
    { icon: "lucide:scale", label: "Kegiatan", href: "/dashboard/kegiatan" },
    {
        icon: "lucide:alert-triangle",
        label: "Prioritas",
        href: "/dashboard/anak-prioritas",
    },
    { icon: "lucide:more-horizontal", label: "Lainnya", isMore: true },
];

export const KADER_MOBILE_MORE_NAV = [
    {
        icon: "lucide:clipboard-list",
        label: "Antrian",
        href: "/dashboard/antrian-prioritas",
    },
    { icon: "lucide:calendar", label: "Jadwal", href: "/dashboard/jadwal" },
    {
        icon: "lucide:message-square",
        label: "Konsultasi",
        href: "/dashboard/konsultasi",
    },
    { icon: "lucide:megaphone", label: "Broadcast", href: "/dashboard/broadcast" },
    { icon: "lucide:file-text", label: "Laporan", href: "/dashboard/laporan" },
];

export const ORANG_TUA_SIDEBAR_NAV = [
    { label: "Dashboard", href: "/dashboard", icon: "home" },
    { label: "Data Anak", href: "/dashboard/anak", icon: "baby" },
    {
        label: "Nutri-Assist",
        href: "/dashboard/nutri-assist",
        icon: "utensils-crossed",
    },
    { label: "Jurnal Makan", href: "/dashboard/jurnal-makan", icon: "utensils" },
    { label: "Konsultasi", href: "/dashboard/konsultasi", icon: "message-circle" },
    { label: "Poin & Badge", href: "/dashboard/gamification", icon: "award" },
    { label: "Riwayat", href: "/dashboard/riwayat", icon: "file-text" },
];

export const ORANG_TUA_MOBILE_MAIN_NAV = [
    { icon: "lucide:home", label: "Dashboard", href: "/dashboard" },
    { icon: "lucide:baby", label: "Data Anak", href: "/dashboard/anak" },
    { icon: "lucide:utensils", label: "Jurnal Makan", href: "/dashboard/jurnal-makan" },
    {
        icon: "lucide:utensils-crossed",
        label: "NutriAssist",
        href: "/dashboard/nutri-assist",
    },
    { icon: "lucide:more-horizontal", label: "Lainnya", isMore: true },
];

export const ORANG_TUA_MOBILE_MORE_NAV = [
    {
        icon: "lucide:message-circle",
        label: "Konsultasi",
        href: "/dashboard/konsultasi",
    },
    { icon: "lucide:award", label: "Poin & Badge", href: "/dashboard/gamification" },
];

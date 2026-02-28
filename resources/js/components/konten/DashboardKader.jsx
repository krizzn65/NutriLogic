import React, { useState, useEffect, useMemo } from "react";
import {
    MapPin,
    Calendar as CalendarIcon,
    X,
    Users,
    AlertTriangle,
    MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import DashboardKaderSkeleton from "../loading/DashboardKaderSkeleton";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Calendar } from "../ui/calendar";
import { motion, AnimatePresence } from "framer-motion";
import {
    STATUS_COLOR_MAP,
    STATUS_BG_COLOR_MAP,
    STATUS_LABELS,
} from "../../constants/statusColors";

export default function DashboardKaderContent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [allSchedules, setAllSchedules] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [showMobileCalendar, setShowMobileCalendar] = useState(false);

    // Interactive chart state (matching Admin)
    const [activeIndex, setActiveIndex] = useState(null);
    const [hoveredLegend, setHoveredLegend] = useState(null);
    const [isChartHovered, setIsChartHovered] = useState(false);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchDashboardData();
        fetchAllSchedules();
    }, []);

    // Generate smart notifications for Kader based on dashboard data
    const generateSmartNotifications = useMemo(
        () => (data) => {
            const notifs = [];
            let idCounter = 1;

            if (!data || !data.statistics) return notifs;

            const { statistics, highlights } = data;

            // Priority Children Alert
            if (statistics.priority_children > 0) {
                notifs.push({
                    id: `priority_children_${idCounter++}`,
                    title: "Perhatian: Anak Prioritas",
                    message: `Terdapat ${statistics.priority_children} anak yang membutuhkan perhatian khusus di posyandu Anda. Segera lakukan intervensi.`,
                    type: "danger",
                    link: "/dashboard/data-anak",
                    timestamp: "Baru saja",
                });
            }

            // Severe Malnutrition Alert
            const severeMalnutrition =
                statistics.nutritional_status?.sangat_kurang || 0;
            if (severeMalnutrition > 0) {
                notifs.push({
                    id: `gizi_buruk_${idCounter++}`,
                    title: "Peringatan Gizi Buruk",
                    message: `${severeMalnutrition} anak terdeteksi dengan gizi sangat kurang. Diperlukan tindakan segera dan koordinasi dengan tenaga kesehatan.`,
                    type: "danger",
                    link: "/dashboard/data-anak",
                    timestamp: "30 menit yang lalu",
                });
            }

            // Stunting Alert
            const stunting = statistics.nutritional_status?.sangat_pendek || 0;
            if (stunting > 0) {
                notifs.push({
                    id: `stunting_${idCounter++}`,
                    title: "Kasus Stunting Ditemukan",
                    message: `${stunting} anak terindikasi sangat pendek (stunting). Perlu pemantauan pertumbuhan berkelanjutan dan edukasi nutrisi kepada orang tua.`,
                    type: "warning",
                    link: "/dashboard/data-anak",
                    timestamp: "1 jam yang lalu",
                });
            }

            // Wasting Alert
            const wasting = statistics.nutritional_status?.sangat_kurus || 0;
            if (wasting > 0) {
                notifs.push({
                    id: `wasting_${idCounter++}`,
                    title: "Peringatan Gizi Akut",
                    message: `${wasting} anak mengalami gizi kurang akut (wasting). Evaluasi asupan makanan dan kondisi kesehatan anak segera.`,
                    type: "warning",
                    link: "/dashboard/data-anak",
                    timestamp: "1 jam yang lalu",
                });
            }

            // Unanswered Consultations
            if (highlights?.unread_consultations > 0) {
                notifs.push({
                    id: `consultations_${idCounter++}`,
                    title: "Konsultasi Menunggu Respon",
                    message: `Ada ${highlights.unread_consultations} pesan konsultasi dari orang tua yang belum Anda balas. Berikan bantuan kepada mereka.`,
                    type: "info",
                    link: "/dashboard/konsultasi",
                    timestamp: "2 jam yang lalu",
                });
            }

            // Upcoming Schedules (check for schedules in next 7 days for early warning)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Group schedules by urgency
            const criticalSchedules = [];
            const upcomingSchedules = [];
            const earlyWarningSchedules = [];

            allSchedules.forEach((schedule) => {
                const scheduleDate = new Date(schedule.scheduled_for);
                scheduleDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil(
                    (scheduleDate - today) / (1000 * 60 * 60 * 24),
                );

                if (diffDays >= 0 && diffDays <= 1) {
                    criticalSchedules.push({ ...schedule, diffDays });
                } else if (diffDays >= 2 && diffDays <= 3) {
                    upcomingSchedules.push({ ...schedule, diffDays });
                } else if (diffDays >= 4 && diffDays <= 7) {
                    earlyWarningSchedules.push({ ...schedule, diffDays });
                }
            });

            // Critical schedules (today or tomorrow) - HIGH PRIORITY
            criticalSchedules.forEach((schedule) => {
                const isImmunization =
                    schedule.type === "imunisasi" ||
                    schedule.title.toLowerCase().includes("imunisasi");
                const isPMT =
                    schedule.type === "pmt" ||
                    schedule.title.toLowerCase().includes("pmt");

                let title = "Jadwal Posyandu Mendesak";
                let icon = "Jadwal";

                if (isImmunization) {
                    title = "Imunisasi Mendesak";
                    icon = "Imunisasi";
                } else if (isPMT) {
                    title = "PMT (Pemberian Makanan Tambahan)";
                    icon = "PMT";
                }

                notifs.push({
                    id: `critical_schedule_${schedule.id}`,
                    title: `${icon} ${title}`,
                    message: `${schedule.title} dijadwalkan ${schedule.diffDays === 0 ? "HARI INI" : "BESOK"}! Pastikan semua persiapan sudah lengkap dan informasikan kepada orang tua.`,
                    type: "danger",
                    link: "/dashboard/jadwal",
                    timestamp: schedule.diffDays === 0 ? "Hari ini" : "Besok",
                });
            });

            // Early warning for immunization/PMT (H-7 to H-4)
            earlyWarningSchedules.forEach((schedule) => {
                const isImmunization =
                    schedule.type === "imunisasi" ||
                    schedule.title.toLowerCase().includes("imunisasi");
                const isPMT =
                    schedule.type === "pmt" ||
                    schedule.title.toLowerCase().includes("pmt");

                if (isImmunization || isPMT) {
                    notifs.push({
                        id: `early_warning_${schedule.id}`,
                        title: isImmunization
                            ? "Pengingat Imunisasi"
                            : "Pengingat PMT",
                        message: `${schedule.title} akan dilaksanakan ${schedule.diffDays} hari lagi. Mulai persiapkan bahan dan informasikan kepada orang tua agar anak hadir.`,
                        type: "info",
                        link: "/dashboard/jadwal",
                        timestamp: `${schedule.diffDays} hari lagi`,
                    });
                }
            });

            // Regular upcoming schedules (H-2 to H-3)
            if (upcomingSchedules.length > 0 && notifs.length < 5) {
                const nearestSchedule = upcomingSchedules[0];
                notifs.push({
                    id: `upcoming_schedule_${nearestSchedule.id}`,
                    title: "Jadwal Posyandu Akan Datang",
                    message: `${nearestSchedule.title} dijadwalkan ${nearestSchedule.diffDays} hari lagi. Pastikan persiapan sudah lengkap.`,
                    type: "info",
                    link: "/dashboard/jadwal",
                    timestamp: `${nearestSchedule.diffDays} hari lagi`,
                });
            }

            // Positive Insight
            const normalNutrition = statistics.nutritional_status?.normal || 0;
            const activeChildren = statistics.active_children || 0;
            if (activeChildren > 0 && normalNutrition > 0) {
                const normalPercentage = Math.round(
                    (normalNutrition / activeChildren) * 100,
                );
                if (normalPercentage >= 70) {
                    notifs.push({
                        id: "insight_positif",
                        title: "Insight Positif",
                        message: `Selamat! ${normalPercentage}% anak di posyandu Anda memiliki status gizi normal. Pertahankan kinerja baik ini!`,
                        type: "info",
                        link: "/dashboard",
                        timestamp: "Hari ini",
                    });
                }
            }

            return notifs;
        },
        [allSchedules],
    );

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/kader/dashboard");
            setDashboardData(response.data.data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat data dashboard. Silakan coba lagi.";
            setError(errorMessage);
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSchedules = async () => {
        try {
            const response = await api.get("/kader/schedules");
            const schedulesData = response.data.data || [];
            setAllSchedules(schedulesData);
        } catch (err) {
            console.error("Schedules fetch error:", err);
            setAllSchedules([]);
        }
    };

    // Loading state
    if (loading) {
        return <DashboardKaderSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-1 w-full min-h-full font-montserrat">
                <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex items-center justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-red-800 font-medium mb-4">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { posyandu, statistics, highlights } = dashboardData;

    // Prepare Pie Chart Data (matching Admin's donut chart approach)
    const pieChartData = statistics.nutritional_status
        ? Object.entries(statistics.nutritional_status)
              .filter(([_, value]) => value > 0)
              .map(([name, value]) => ({
                  name: STATUS_LABELS[name] || name,
                  value,
                  rawName: name,
              }))
        : [];

    const totalChildren = statistics.active_children || 0;

    // Stat cards config matching Admin style
    const statCards = [
        {
            title: "Total Anak Terdaftar",
            value: statistics.active_children,
            icon: Users,
            gradient: "from-blue-500 to-blue-600",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            badge: "Active",
            badgeColor: "text-green-600 bg-green-50",
        },
        {
            title: "Perlu Perhatian",
            value: statistics.priority_children,
            icon: AlertTriangle,
            gradient: "from-orange-500 to-orange-600",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600",
            badge: "! Penting",
            badgeColor: "text-orange-600 bg-orange-50",
            badgePulse: true,
            link: "/dashboard/anak-prioritas",
        },
        {
            title: "Pesan Belum Dibalas",
            value: highlights.unread_consultations || 0,
            icon: MessageSquare,
            gradient: "from-indigo-500 to-indigo-600",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            badge:
                highlights.unread_consultations > 0
                    ? `${highlights.unread_consultations} Baru`
                    : null,
            badgeColor: "text-white bg-indigo-500",
            link: "/dashboard/konsultasi",
        },
    ];

    return (
        <DashboardLayout
            header={
                <PageHeader
                    title="Dashboard Kader"
                    subtitle="Portal Kader"
                    showProfile={true}
                    dashboardData={dashboardData}
                    generateNotifications={generateSmartNotifications}
                />
            }
        >
            {/* Main Content */}
            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto mb-10">
                {/* 1. Hero Section (Full Width) — matching Admin gradient & styling */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
                    {/* Decorative elements matching Admin */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/15 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/30 tracking-wide uppercase">
                                    Selamat Datang
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                                Halo, Kader Posyandu! 👋
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed opacity-90 max-w-2xl">
                                Siap memantau tumbuh kembang anak hari ini? Cek
                                ringkasan di bawah untuk melihat area yang perlu
                                perhatian segera.
                            </p>
                        </div>
                        <div className="hidden md:block text-right opacity-80">
                            <p className="text-sm font-medium uppercase tracking-wider mb-1">
                                Hari ini
                            </p>
                            <p className="text-2xl font-bold">
                                {new Date().toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Key Metrics — Admin-style card design with motion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            whileHover={{ y: -4 }}
                            onClick={() => card.link && navigate(card.link)}
                            className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all group ${card.link ? "cursor-pointer" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className={`p-3 rounded-2xl ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <card.icon className="w-6 h-6" />
                                </div>
                                {card.badge && (
                                    <span
                                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${card.badgeColor} ${card.badgePulse ? "animate-pulse" : ""}`}
                                    >
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                                    {card.value}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    {card.title}
                                    {card.link && (
                                        <svg
                                            className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 3. Content Grid: 2/3 (Chart) + 1/3 (Agenda) — matching Admin layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* LEFT: Interactive Pie/Donut Chart — matching Admin's design */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Distribusi Status Gizi
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Gambaran status gizi anak-anak di posyandu
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-semibold text-gray-700">
                                    Total: {totalChildren}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-center gap-8 flex-1">
                            {/* Donut Chart */}
                            <div className="w-full lg:w-1/2 h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={3}
                                            dataKey="value"
                                            activeIndex={activeIndex}
                                            activeShape={{
                                                outerRadius: 118,
                                                strokeWidth: 4,
                                                stroke: "#fff",
                                            }}
                                            onMouseEnter={(_, index) => {
                                                setActiveIndex(index);
                                                setIsChartHovered(true);
                                            }}
                                            onMouseLeave={() => {
                                                setActiveIndex(null);
                                                setIsChartHovered(false);
                                            }}
                                            animationBegin={0}
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                        >
                                            {pieChartData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            STATUS_COLOR_MAP[
                                                                entry.rawName
                                                            ] || "#94a3b8"
                                                        }
                                                        strokeWidth={0}
                                                        opacity={
                                                            hoveredLegend ===
                                                                null ||
                                                            hoveredLegend ===
                                                                entry.rawName
                                                                ? 1
                                                                : 0.3
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                            transition:
                                                                "all 0.3s ease",
                                                        }}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow:
                                                    "0 8px 30px rgba(0,0,0,0.12)",
                                                padding: "12px 16px",
                                            }}
                                            itemStyle={{
                                                color: "#1e293b",
                                                fontWeight: "600",
                                                fontSize: "14px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Center Label — matching Admin */}
                                <AnimatePresence mode="wait">
                                    {!isChartHovered && (
                                        <motion.div
                                            key={hoveredLegend || "total"}
                                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <span className="text-4xl font-bold text-gray-800 tracking-tight">
                                                {hoveredLegend &&
                                                statistics.nutritional_status
                                                    ? statistics
                                                          .nutritional_status[
                                                          hoveredLegend
                                                      ]
                                                    : totalChildren}
                                            </span>
                                            <span className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wide">
                                                {hoveredLegend
                                                    ? STATUS_LABELS[
                                                          hoveredLegend
                                                      ]
                                                    : "Total Anak"}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Legend Grid — matching Admin */}
                            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                                {statistics.nutritional_status &&
                                    Object.entries(
                                        statistics.nutritional_status,
                                    ).map(([status, count], index) => (
                                        <motion.div
                                            key={status}
                                            whileHover={{ scale: 1.02 }}
                                            onMouseEnter={() => {
                                                setHoveredLegend(status);
                                                // Find index of this status in pieChartData
                                                const pieIndex =
                                                    pieChartData.findIndex(
                                                        (d) =>
                                                            d.rawName ===
                                                            status,
                                                    );
                                                setActiveIndex(
                                                    pieIndex >= 0
                                                        ? pieIndex
                                                        : null,
                                                );
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredLegend(null);
                                                setActiveIndex(null);
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer ${hoveredLegend === status ? "bg-gray-50 ring-1 ring-gray-100" : ""}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${STATUS_BG_COLOR_MAP[status] || "bg-gray-400"}`}
                                                />
                                                <span className="text-sm font-medium text-gray-600">
                                                    {STATUS_LABELS[status] ||
                                                        status}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {count}
                                            </span>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Agenda / Schedule — refined styling */}
                    <div className="col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">
                                    Agenda
                                </h3>
                                <p className="text-gray-500 mt-1 text-sm">
                                    Jadwal kegiatan terdekat
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/dashboard/jadwal")}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                            >
                                LIHAT SEMUA
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {allSchedules
                                .filter(
                                    (s) =>
                                        s.status !== "completed" &&
                                        new Date(s.scheduled_for) >=
                                            new Date(
                                                new Date().setHours(0, 0, 0, 0),
                                            ),
                                )
                                .sort(
                                    (a, b) =>
                                        new Date(a.scheduled_for) -
                                        new Date(b.scheduled_for),
                                )
                                .slice(0, 5)
                                .map((schedule, index) => {
                                    const isToday =
                                        new Date(
                                            schedule.scheduled_for,
                                        ).toDateString() ===
                                        new Date().toDateString();
                                    return (
                                        <motion.div
                                            key={schedule.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.2,
                                            }}
                                            className={`group p-4 rounded-2xl border transition-all duration-300 ${isToday ? "bg-blue-50/50 border-blue-100 hover:border-blue-200" : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-md"}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Date Box */}
                                                <div
                                                    className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border ${isToday ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-700 border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600"}`}
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">
                                                        {new Date(
                                                            schedule.scheduled_for,
                                                        ).toLocaleDateString(
                                                            "id-ID",
                                                            { month: "short" },
                                                        )}
                                                    </span>
                                                    <span className="text-2xl font-bold leading-none">
                                                        {new Date(
                                                            schedule.scheduled_for,
                                                        ).getDate()}
                                                    </span>
                                                </div>

                                                <div className="flex-1 min-w-0 py-0.5">
                                                    {isToday && (
                                                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold tracking-wide mb-1.5">
                                                            HARI INI
                                                        </span>
                                                    )}
                                                    <h4
                                                        className={`font-bold text-sm leading-tight mb-1 ${isToday ? "text-blue-900" : "text-gray-900"}`}
                                                    >
                                                        {schedule.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                            {new Date(
                                                                schedule.scheduled_for,
                                                            ).toLocaleTimeString(
                                                                "en-GB",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </span>
                                                        {schedule.location && (
                                                            <span className="truncate max-w-[120px] flex items-center gap-1 before:content-['-'] before:mx-1">
                                                                {
                                                                    schedule.location
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                            {allSchedules.filter(
                                (s) =>
                                    s.status !== "completed" &&
                                    new Date(s.scheduled_for) >=
                                        new Date(
                                            new Date().setHours(0, 0, 0, 0),
                                        ),
                            ).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                                    <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium">
                                        Tidak ada jadwal mendatang
                                    </p>
                                    <p className="text-sm mt-1">
                                        Istirahat sejenak!
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <button
                                onClick={() => setShowMobileCalendar(true)}
                                className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
                            >
                                <CalendarIcon className="w-4 h-4" />
                                Buka Kalender Lengkap
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Calendar Modal - Keep existing logic */}
            {showMobileCalendar && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto mt-6 sm:mt-0">
                        <button
                            onClick={() => setShowMobileCalendar(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-full mt-2">
                            <Calendar
                                mode="single"
                                selected={new Date()}
                                className="rounded-md border-0 w-full"
                                classNames={{
                                    month: "space-y-4 w-full",
                                    table: "w-full",
                                    head_row: "flex w-full justify-between",
                                    row: "flex w-full mt-2 justify-between",
                                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-11 w-11 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md flex items-center justify-center mx-auto text-base",
                                }}
                                schedules={allSchedules}
                                currentDate={calendarDate}
                                onMonthChange={setCalendarDate}
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
